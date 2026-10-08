/**
 * Vercel Serverless Function -- a coaching project in the catalogue (site BACKLOG #57).
 *
 * GET  /api/project?slug=wit
 *   The project's name and status, and its accepted coaches with places left,
 *   read from the open catalogue file's "Project places" tab — kept by the
 *   Apps Script, so this does not wait on the script. Cached for 30 seconds:
 *   places run out, so they must not be stale for long.
 *
 * POST /api/project  { action: 'chooseCoach' | 'joinProject', ... }
 *   Passed on to the Apps Script, which checks the Fienta ticket and places.
 *   chooseCoach is safe to ask twice (the script answers a repeated ticket
 *   with the first match), so a hung first try gets a second one.
 */

import { parseCsv } from './coaches.js';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const CATALOGUE_SHEET_ID = process.env.CATALOGUE_SHEET_ID;

const ACTIONS = ['chooseCoach', 'joinProject'];
const READ_TIMEOUT_MS = 10000;
const WRITE_TIMEOUT_MS = 55000;
const RETRY_AFTER_MS = 20000;

/** The project as the page needs it, or null when it is not in the file. */
export function projectFromRows(rows, slug) {
  const [headers, ...data] = rows;
  if (!headers) return null;
  const at = (name) => headers.indexOf(name);
  const mine = data.filter((r) => (r[at('Project')] || '').toLowerCase() === slug);
  if (!mine.length) return null;
  return {
    slug,
    name: mine[0][at('Project name')] || '',
    status: mine[0][at('Project status')] || '',
    // A project with no accepted coaches yet has one row with no email.
    coaches: mine.filter((r) => r[at('Coach email')]).map((r) => ({
      email: (r[at('Coach email')] || '').toLowerCase(),
      placesLeft: Number(r[at('Places left')]) || 0,
    })),
  };
}

async function readProject(slug) {
  const url = `https://docs.google.com/spreadsheets/d/${CATALOGUE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`
    + encodeURIComponent('Project places');
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(READ_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`places: ${response.status}`);
  return projectFromRows(parseCsv(await response.text()), slug);
}

/** One request to the Apps Script; undefined when it did not answer in time. */
async function askScript(body, signal) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
    redirect: 'follow',
    signal,
  });
  if (!response.ok) return undefined;
  const data = JSON.parse(await response.text());
  // The redirect's second hop landing as a GET: ask again.
  if (!data.success && String(data.error || '').startsWith('Unknown action')) return undefined;
  return data;
}

/** chooseCoach gets a second try alongside a slow first one; joinProject only one. */
async function forward(body, { retryAfterMs = RETRY_AFTER_MS, timeoutMs = WRITE_TIMEOUT_MS } = {}) {
  const deadline = AbortSignal.timeout(timeoutMs);
  const first = askScript(body, deadline).catch(() => undefined);
  if (body.action !== 'chooseCoach') return first;
  let timer;
  const second = new Promise((resolve) => {
    timer = setTimeout(() => resolve(askScript(body, deadline).catch(() => undefined)), retryAfterMs);
  });
  const answers = [first, second];
  // The first real answer wins; undefined only when both gave none.
  const winner = await new Promise((resolve) => {
    let left = answers.length;
    answers.forEach((p) => p.then((data) => {
      if (data) resolve(data);
      else if (--left === 0) resolve(undefined);
    }));
  });
  clearTimeout(timer);
  return winner;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const slug = String(req.query?.slug || '').trim().toLowerCase();
    if (!/^[a-z0-9-]{1,40}$/.test(slug)) return res.status(400).json({ success: false, error: 'slug' });
    if (!CATALOGUE_SHEET_ID) return res.status(500).json({ success: false, error: 'CATALOGUE_SHEET_ID is not set' });
    try {
      const project = await readProject(slug);
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      if (!project) return res.status(404).json({ success: false, error: 'project_not_found' });
      return res.status(200).json({ success: true, project });
    } catch (err) {
      console.error('[api/project]', err.message);
      return res.status(502).json({ success: false, error: 'unavailable' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!APPS_SCRIPT_URL) return res.status(500).json({ success: false, error: 'APPS_SCRIPT_URL is not set' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (!ACTIONS.includes(body.action)) return res.status(400).json({ success: false, error: 'action' });

  const data = await forward(body);
  if (!data) return res.status(504).json({ success: false, error: 'timeout' });
  return res.status(200).json(data);
}

export { forward };
