/**
 * Vercel Serverless Function -- the public coach catalogue.
 *
 * Asks the Apps Script for approved coaches (only the columns a card shows),
 * so the spreadsheet itself can stay private. Before this, the page read the
 * sheet straight from Google as CSV, which only works when the whole
 * spreadsheet — every tab — is shared with anyone who has the link.
 *
 * Cached at the edge for 5 minutes, like /api/config: a newly approved coach
 * appears within minutes, and the Apps Script is not asked on every visit.
 * Past those 5 minutes the edge keeps serving the old copy for a day while it
 * fetches a new one, so a slow Apps Script delays an update, not a visitor.
 *
 * URL: GET /api/coaches
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ success: false, error: 'APPS_SCRIPT_URL environment variable is not set' });
  }

  try {
    const data = await askAppsScript();
    lastGood = { headers: data.headers, rows: data.rows };
    await save(lastGood);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, ...lastGood });
  } catch (err) {
    console.error('[api/coaches]', err.message);
    if (!lastGood) {
      try {
        const saved = await savedCopy.read();
        if (saved) lastGood = { headers: saved.headers, rows: saved.rows };
      } catch (readErr) {
        console.error('[api/coaches] saved copy:', readErr.message);
      }
    }
    if (lastGood) {
      // Short cache, so the edge asks again soon instead of holding this for 5 minutes.
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=86400');
      return res.status(200).json({ success: true, ...lastGood });
    }
    return res.status(502).json({ success: false, error: 'Could not load coaches' });
  }
}

export { askAppsScript, savedCopy };
