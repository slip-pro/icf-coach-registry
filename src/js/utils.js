/**
 * ICF Registry -- Shared Utilities
 *
 * @module utils
 */

/**
 * HTML-escape a string for safe insertion into innerHTML.
 * Prevents XSS when translation strings or user data contain
 * characters that would be interpreted as HTML.
 *
 * @param {string} str
 * @returns {string}
 */
export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
