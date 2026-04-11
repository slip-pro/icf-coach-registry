/**
 * ICF Registry -- Form Submission Module
 *
 * Submits registration data via Vercel serverless proxy (/api/submit).
 * The proxy forwards to Google Apps Script, avoiding ad-blocker issues
 * (request stays on same domain) and returning real success/error.
 *
 * Fallback: if no apiUrl configured, tries direct Google Apps Script
 * (may be blocked by ad-blockers).
 *
 * @module submit
 */

/**
 * @typedef {Object} SubmitConfig
 * @property {string} [scriptUrl] -- Google Apps Script URL (legacy/fallback)
 * @property {string} [apiUrl] -- Vercel serverless proxy URL (preferred)
 * @property {boolean} [devMode]
 */

/**
 * @typedef {Object} SubmitResult
 * @property {boolean} success
 * @property {string} [message]
 */

/**
 * @param {Record<string, unknown>} formData
 * @param {SubmitConfig} [config]
 * @returns {Promise<SubmitResult>}
 */
export async function submitRegistration(formData, config = {}) {
  const { apiUrl, scriptUrl, devMode = false } = config;

  if (devMode) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: 'Submission simulated (dev mode)' };
  }

  // Preferred: Vercel serverless proxy (same domain, no ad-blocker issues)
  if (apiUrl) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Submission failed');
    }

    return { success: true };
  }

  // Fallback: direct to Google Apps Script (may be blocked)
  if (scriptUrl) {
    const body = new URLSearchParams();
    body.append('payload', JSON.stringify(formData));

    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: body,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }

  throw new Error('No submission endpoint configured');
}
