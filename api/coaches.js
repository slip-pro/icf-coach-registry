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
 *
 * URL: GET /api/coaches
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

/**
 * Apps Script answers a POST with a redirect whose second hop sometimes
 * fails or lands back on the script as a GET ("Unknown action"). Nothing is
 * wrong with the request, so ask again.
 */
async function askAppsScript() {
  let lastError = 'no answer';
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((wait) => setTimeout(wait, 400 * attempt));
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'getCoaches' }),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) { lastError = `HTTP ${response.status}`; continue; }
      const data = JSON.parse(await response.text());
      if (data.success) return data;
      lastError = data.error || 'refused';
      if (!String(lastError).startsWith('Unknown action')) break;
    } catch (err) {
      lastError = err.message || String(err);
    }
  }
  throw new Error(lastError);
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
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ success: true, headers: data.headers, rows: data.rows });
  } catch (err) {
    console.error('[api/coaches]', err.message);
    return res.status(502).json({ success: false, error: 'Could not load coaches' });
  }
}
