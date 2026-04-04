/**
 * ICF Registry -- Form Submission Module
 *
 * Submits registration form data to a Google Apps Script web app.
 * The Apps Script receives the POST, writes to a "Submissions" tab,
 * and optionally sends an email notification to the admin.
 *
 * In development mode (no scriptUrl or devMode flag), simulates
 * a successful submission with a short delay.
 *
 * @module submit
 */

/**
 * @typedef {Object} SubmitConfig
 * @property {string} [scriptUrl] -- Google Apps Script web app URL
 * @property {boolean} [devMode] -- Force dev simulation even if URL present
 */

/**
 * @typedef {Object} SubmitResult
 * @property {boolean} success
 * @property {string} [message]
 */

/**
 * Submit registration form data.
 *
 * When scriptUrl is absent or devMode is true, the submission is
 * simulated locally with a 1.5 s delay. This allows development
 * and demos without a backend.
 *
 * Real submissions use `mode: 'no-cors'` because Google Apps Script
 * deployed web apps do not return CORS headers. As a consequence we
 * cannot read the response body -- a successful fetch (no network
 * error thrown) is treated as success.
 *
 * **Known limitation (no-cors):** The opaque response means we cannot
 * detect server-side errors (4xx/5xx). The UI shows a soft success
 * message asking the user to wait for an admin confirmation email,
 * rather than guaranteeing delivery. If the Apps Script endpoint is
 * migrated to support CORS in the future, switch to `mode: 'cors'`
 * and inspect `response.ok` for proper error handling.
 *
 * @param {Record<string, unknown>} formData -- collected form values
 * @param {SubmitConfig} [config]
 * @returns {Promise<SubmitResult>}
 */
export async function submitRegistration(formData, config = {}) {
  const { scriptUrl, devMode = false } = config;

  if (devMode || !scriptUrl) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: 'Submission simulated (dev mode)' };
  }

  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  // no-cors means we cannot read the response body.
  // If fetch did not throw, we assume success.
  return { success: true };
}
