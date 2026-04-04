/**
 * ICF Registry -- Form Submission Module
 *
 * Submits registration form data to a Google Apps Script web app
 * via a hidden form + iframe. This approach guarantees the POST body
 * is delivered (unlike fetch with no-cors which can silently drop it).
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
 * Uses a hidden form targeting a hidden iframe to POST data to
 * Google Apps Script. The form sends a single hidden field "payload"
 * containing the JSON-stringified form data.
 *
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

  return new Promise((resolve, reject) => {
    const iframeName = 'icf-submit-frame-' + Date.now();

    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = scriptUrl;
    form.target = iframeName;
    form.style.display = 'none';

    // Single hidden field with JSON payload
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(formData);
    form.appendChild(input);

    document.body.appendChild(form);

    // Timeout — assume success after 5s (we can't read cross-origin iframe)
    const timeout = setTimeout(() => {
      cleanup();
      resolve({ success: true });
    }, 5000);

    // If iframe loads (success or error), resolve
    iframe.addEventListener('load', () => {
      clearTimeout(timeout);
      cleanup();
      resolve({ success: true });
    });

    iframe.addEventListener('error', () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Network error during submission'));
    });

    function cleanup() {
      if (form.parentNode) form.parentNode.removeChild(form);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }

    // Submit
    form.submit();
  });
}
