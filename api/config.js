/**
 * Vercel Serverless Function -- get frontend config.
 *
 * Fetches public configuration from Google Apps Script
 * (which reads it from the Settings sheet).
 * Cached for 5 minutes to reduce Apps Script calls.
 *
 * URL: GET /api/config
 */

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzjRKXzmP1N66K9cSdMTzE90n_cx0IjZYNVGCmXfjnfCNTUnJEusnM74NghncSjXy2x/exec';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const response = await fetch(
      APPS_SCRIPT_URL + '?action=getConfig',
      { redirect: 'follow' }
    );
    const text = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (_parseErr) {
      return res.status(502).json({
        success: false,
        error: 'Invalid response from Apps Script',
        status: response.status,
        body: text.substring(0, 500),
      });
    }

    // Cache for 5 minutes
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=60'
    );

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch config',
    });
  }
}
