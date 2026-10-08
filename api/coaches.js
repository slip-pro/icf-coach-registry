/**
 * Vercel Serverless Function -- the public coach catalogue.
 *
 * Reads approved coaches (only the columns a card shows) from the open
 * catalogue file the Apps Script keeps, or asks the script itself when
 * CATALOGUE_SHEET_ID is not set. Either way the registry stays private:
 * until Sept 2026 the page read the registry itself as CSV, which meant
 * sharing every tab of it with anyone who had the link.
 *
 * Cached at the edge for 5 minutes, like /api/config: a newly approved coach
 * appears within minutes, and the Apps Script is not asked on every visit.
 * Past those 5 minutes the edge keeps serving the old copy for a day while it
 * fetches a new one, so a slow Apps Script delays an update, not a visitor.
 *
 * URL: GET /api/coaches
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

/**
 * The open copy of the catalogue that the Apps Script keeps (setupCatalogue,
 * 8 Oct 2026). Read straight from Google, it answers in under a second; the
 * script itself sometimes sat 30 s in Google's queue. Without it, the script.
 */
const CATALOGUE_SHEET_ID = process.env.CATALOGUE_SHEET_ID;

/** A normal run takes 2-4 s; past this, a hang is likelier than a slow run. */
const HEDGE_AFTER_MS = 6000;
const TRY_TIMEOUT_MS = 25000;
const TRIES = 3;

/** The last catalogue this instance got, for when the Apps Script does not answer. */
let lastGood = null;

/**
 * The same catalogue kept in Vercel Blob, outside this instance. A deploy wipes
 * the edge cache and starts fresh instances with no lastGood, so on 6 Oct 2026
 * a hung Apps Script right after a push left the page with nothing to show.
 * The saved copy survives deploys. With no Blob store connected to the
 * project both calls do nothing.
 */
const SAVED_PATH = 'catalogue/coaches.json';
const SAVED_TIMEOUT_MS = 5000;
let savedJson = null;

/** Connecting a store sets the token, or the store id on newer setups. */
const blobConnected = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const savedCopy = {
  // Private store: the rows carry coaches' emails, so no public URL for them.
  async read() {
    if (!blobConnected()) return null;
    const { get } = await import('@vercel/blob');
    const result = await get(SAVED_PATH, {
      access: 'private',
      useCache: false,
      abortSignal: AbortSignal.timeout(SAVED_TIMEOUT_MS),
    });
    if (!result || !result.stream) return null;
    const data = await new Response(result.stream).json();
    return Array.isArray(data.rows) ? data : null;
  },
  async write(json) {
    if (!blobConnected()) return;
    const { put } = await import('@vercel/blob');
    await put(SAVED_PATH, json, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      abortSignal: AbortSignal.timeout(SAVED_TIMEOUT_MS),
    });
  },
};

/** Saves the catalogue when it differs from what this instance saved last. */
async function save(catalogue) {
  const json = JSON.stringify(catalogue);
  if (json === savedJson) return;
  try {
    await savedCopy.write(json);
    savedJson = json;
  } catch (err) {
    console.error('[api/coaches] save:', err.message);
  }
}

/** One try. Resolves with the data, or undefined when worth asking again. */
async function askOnce(signal) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'getCoaches' }),
    redirect: 'follow',
    signal: AbortSignal.any([AbortSignal.timeout(TRY_TIMEOUT_MS), signal]),
  });
  if (!response.ok) return undefined;
  const data = JSON.parse(await response.text());
  if (data.success) return data;
  // "Unknown action" is the redirect's second hop landing back on the script
  // as a GET — nothing wrong with the request. Any other refusal is final.
  if (String(data.error || '').startsWith('Unknown action')) return undefined;
  throw Object.assign(new Error(data.error || 'refused'), { final: true });
}

/** RFC 4180: quoted cells may hold commas, line breaks (bios) and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** One try at the open file. Same contract as askOnce. */
async function askCatalogueFile(signal) {
  const url = `https://docs.google.com/spreadsheets/d/${CATALOGUE_SHEET_ID}/export?format=csv`;
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.any([AbortSignal.timeout(TRY_TIMEOUT_MS), signal]),
  });
  if (!response.ok) return undefined;
  // A file that is not shared answers with Google's sign-in page, not a CSV.
  if (!String(response.headers.get('content-type') || '').includes('text/csv')) {
    throw Object.assign(new Error('Catalogue file is not shared with anyone with the link'), { final: true });
  }
  const [headers, ...rows] = parseCsv(await response.text());
  if (!headers || headers[0] !== 'Name') return undefined;
  return { success: true, headers, rows: rows.filter((r) => r.some((v) => v !== '')) };
}

/**
 * Google sometimes holds a request 30-60 s around a 3-second run (the script's
 * Executions, 5 Oct 2026), and a second request sent meanwhile usually goes
 * straight through. So: if a try has not answered after HEDGE_AFTER_MS, start
 * another alongside it; the first answer wins and the others are aborted. A try
 * that fails fast starts the next one at once. (Same as the chapter site's
 * lib/hedge.ts.)
 */
function askAppsScript({ ask = askOnce, hedgeMs = HEDGE_AFTER_MS } = {}) {
  return new Promise((resolve, reject) => {
    const controllers = [];
    let started = 0, settled = 0, done = false, timer, lastError = 'no answer';
    const finish = (fn, value, winner) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      for (const c of controllers) if (c !== winner) c.abort();
      fn(value);
    };
    const missed = () => {
      settled++;
      if (done) return;
      if (started < TRIES) launch();
      else if (settled >= started) finish(reject, new Error(lastError));
    };
    const launch = () => {
      if (done || started >= TRIES) return;
      started++;
      clearTimeout(timer);
      if (started < TRIES) timer = setTimeout(launch, hedgeMs);
      const controller = new AbortController();
      controllers.push(controller);
      ask(controller.signal).then(
        (data) => (data ? finish(resolve, data, controller) : missed()),
        (err) => {
          lastError = err.message || String(err);
          return err.final ? finish(reject, err, controller) : missed();
        }
      );
    };
    launch();
  });
}

/**
 * How long a visitor waits for the Apps Script when a saved copy is at hand.
 * The edge cache does not always survive a quiet night: on 8 Oct 2026 the
 * first morning visit missed it, the Apps Script hung through all three tries
 * (37 s) and the page gave up at 15 s, so a refresh was needed. Past this,
 * the visitor gets the saved copy and the ask goes on in the background.
 */
const SERVE_SAVED_AFTER_MS = 8000;

/** This instance's last good catalogue, else the saved one; null when neither. */
async function lastGoodOrSaved() {
  if (lastGood) return lastGood;
  try {
    const saved = await savedCopy.read();
    if (saved && !lastGood) lastGood = { headers: saved.headers, rows: saved.rows };
  } catch (err) {
    console.error('[api/coaches] saved copy:', err.message);
  }
  return lastGood;
}

/** Keeps the function alive for `promise` after the answer is sent. Off Vercel, does nothing. */
async function inBackground(promise) {
  try {
    const { waitUntil } = await import('@vercel/functions');
    waitUntil(promise);
  } catch {
    // Not on Vercel (tests, local server): the promise just runs on.
  }
}

export default async function handler(req, res, { serveSavedAfterMs = SERVE_SAVED_AFTER_MS } = {}) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ success: false, error: 'APPS_SCRIPT_URL environment variable is not set' });
  }

  const live = askAppsScript({ ask: CATALOGUE_SHEET_ID ? askCatalogueFile : askOnce }).then(async (data) => {
    lastGood = { headers: data.headers, rows: data.rows };
    await save(lastGood);
    return lastGood;
  });
  const fallback = lastGoodOrSaved();

  let timer;
  const first = await Promise.race([
    live.then((catalogue) => ({ catalogue }), (err) => ({ err })),
    new Promise((resolve) => { timer = setTimeout(() => resolve({ late: true }), serveSavedAfterMs); }),
  ]);
  clearTimeout(timer);

  if (first.catalogue) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, ...first.catalogue });
  }
  if (first.err) console.error('[api/coaches]', first.err.message);

  const saved = await fallback;
  if (saved) {
    // The ask is still on: let it finish and save, so the next visit gets it.
    if (first.late) await inBackground(live.catch((err) => console.error('[api/coaches]', err.message)));
    // Short cache, so the edge asks again soon instead of holding this for 5 minutes.
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, ...saved });
  }

  // Nothing saved yet: all that is left is to wait for the Apps Script.
  if (first.late) {
    try {
      const catalogue = await live;
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      return res.status(200).json({ success: true, ...catalogue });
    } catch (err) {
      console.error('[api/coaches]', err.message);
    }
  }
  return res.status(502).json({ success: false, error: 'Could not load coaches' });
}

export { askAppsScript, savedCopy, parseCsv };
