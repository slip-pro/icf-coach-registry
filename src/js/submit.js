/**
 * ICF Registry -- Form Submission Module
 *
 * Submits registration data to Google Apps Script via fetch.
 * Uses application/x-www-form-urlencoded + no-cors mode,
 * which guarantees the body is sent (unlike JSON + no-cors).
 *
 * @module submit
 */

/**
 * @typedef {Object} SubmitConfig
 * @property {string} [scriptUrl]
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
  const { scriptUrl, devMode = false } = config;

  if (devMode || !scriptUrl) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: 'Submission simulated (dev mode)' };
  }

  const body = new URLSearchParams();
  body.append('payload', JSON.stringify(formData));

  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: body,
  });

  return { success: true };
}
