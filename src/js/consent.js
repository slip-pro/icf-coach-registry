/**
 * Coach Registry — the two permissions on the registration and edit forms (G-028).
 *
 * - Publish: required. Without it the coach cannot be listed, so the form says
 *   so instead of quietly hiding them.
 * - Social media: optional. The chapter's posts about a coach take the photo and
 *   description from this profile, so nobody is asked to send them separately.
 *
 * The Apps Script records the date each permission was given.
 */

import { t } from './i18n.js';
import { esc } from './utils.js';

function checkbox(id, labelKey, checked, required) {
  const req = required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  return `
    <label class="icf-form__checkbox-item icf-form__checkbox-item--consent" for="${id}">
      <input type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}
        aria-describedby="${id}-error">
      <span class="icf-form__checkbox-mark"></span>
      <span><span data-i18n="${labelKey}">${esc(t(labelKey))}</span>${req}</span>
    </label>`;
}

/**
 * @param {(base: string) => string} uid  the form's own id helper
 * @param {{publish?: boolean, social?: boolean}} [values]
 */
export function renderConsentSection(uid, values = {}) {
  const publishId = uid('consent-publish');
  const socialId = uid('consent-social');
  return `
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="consentSectionTitle">${esc(t('consentSectionTitle'))}</h3>
        <div class="icf-form__group">
          ${checkbox(publishId, 'consentPublish', values.publish, true)}
          <span class="icf-form__error" id="${publishId}-error"
            role="alert" aria-live="polite"></span>
        </div>
        <div class="icf-form__group">
          ${checkbox(socialId, 'consentSocial', values.social, false)}
          <p class="icf-form__help" data-i18n="consentSocialHint">${esc(t('consentSocialHint'))}</p>
        </div>
      </div>`;
}

/** The two answers, as the Apps Script expects them. */
export function readConsents(form, uid) {
  const on = (base) => {
    const el = form.querySelector(`#${uid(base)}`);
    return el ? el.checked : false;
  };
  return {
    publishConsent: on('consent-publish'),
    socialConsent: on('consent-social'),
  };
}

/**
 * Shows the error under the publish box when it is not ticked.
 * @returns {string|null} the id to scroll to, or null when fine
 */
export function checkConsents(form, uid, data) {
  if (data.publishConsent) return null;
  const id = uid('consent-publish');
  const errorEl = form.querySelector(`#${id}-error`);
  if (errorEl) errorEl.textContent = t('consentPublishError');
  return id;
}
