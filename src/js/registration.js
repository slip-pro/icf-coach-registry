/**
 * ICF Registry -- Registration Form Module
 *
 * Renders a multi-section coach registration form with:
 * - Personal info, professional info, pricing, bio
 * - Contact details, social media, ICF verification
 * - Live card preview (debounced 500ms)
 * - Client-side validation with accessible error messages
 * - Submit with loading/success/error states
 *
 * All user-facing text uses i18n keys (EN/RU/EL).
 *
 * @module registration
 */

import { t } from './i18n.js';
import { esc } from './utils.js';

/* ---------------------------------------------------------------
   Constants
   --------------------------------------------------------------- */

const BIO_MAX_WORDS = 300;
const PREVIEW_DEBOUNCE_MS = 500;

/** Specialization values mapped to i18n keys */
const SPECIALIZATIONS = [
  { value: 'Career', i18nKey: 'regSpecCareer' },
  { value: 'Leadership', i18nKey: 'regSpecLeadership' },
  { value: 'Life Goals', i18nKey: 'regSpecLife' },
  { value: 'Business', i18nKey: 'regSpecBusiness' },
  { value: 'Relationships', i18nKey: 'regSpecRelationships' },
  { value: 'Health', i18nKey: 'regSpecHealth' },
  { value: 'Team', i18nKey: 'regSpecTeam' },
  { value: 'Executive', i18nKey: 'regSpecExecutive' },
];

/** Language values mapped to i18n keys */
const LANGUAGES = [
  { value: 'English', i18nKey: 'regLangEnglish' },
  { value: 'Russian', i18nKey: 'regLangRussian' },
  { value: 'Greek', i18nKey: 'regLangGreek' },
  { value: 'German', i18nKey: 'regLangGerman' },
  { value: 'French', i18nKey: 'regLangFrench' },
  { value: 'Arabic', i18nKey: 'regLangArabic' },
  { value: 'Hebrew', i18nKey: 'regLangHebrew' },
  { value: 'Ukrainian', i18nKey: 'regLangUkrainian' },
  { value: 'Other', i18nKey: 'regLangOther' },
];

/** Format options mapped to i18n keys */
const FORMATS = [
  { value: 'online', i18nKey: 'regFormatOnline' },
  { value: 'offline', i18nKey: 'regFormatOffline' },
  { value: 'both', i18nKey: 'regFormatBoth' },
];

/** ICF Level options mapped to i18n keys */
const ICF_LEVELS = [
  { value: 'ACC', i18nKey: 'regLevelACC' },
  { value: 'PCC', i18nKey: 'regLevelPCC' },
  { value: 'MCC', i18nKey: 'regLevelMCC' },
  { value: 'Member', i18nKey: 'regLevelMember' },
];


/* ---------------------------------------------------------------
   Utility helpers
   --------------------------------------------------------------- */

// HTML escaping provided by shared utils.js module

/**
 * Count words in a string.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Create a debounced version of a function.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Basic email validation.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Check if a URL is a valid https/http URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') ||
    trimmed.startsWith('http://');
}

/**
 * Generate a unique ID for form elements.
 * @param {string} base
 * @returns {string}
 */
function uid(base) {
  return `icf-reg-${base}`;
}


/* ---------------------------------------------------------------
   Badge config (duplicated from cards.js to avoid circular deps)
   --------------------------------------------------------------- */

const BADGE_CONFIG = {
  MCC: { icon: '\u2726', cssClass: 'icf-badge--mcc' },
  PCC: { icon: '\u25B2', cssClass: 'icf-badge--pcc' },
  ACC: { icon: '\u25CF', cssClass: 'icf-badge--acc' },
  Member: { icon: '', cssClass: 'icf-badge--member' },
};

/**
 * Deterministic color from name (same algorithm as cards.js).
 * @param {string} name
 * @returns {string}
 */
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 45 + (Math.abs(hash >> 8) % 20);
  const lightness = 35 + (Math.abs(hash >> 16) % 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Extract initials from name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}


/* ---------------------------------------------------------------
   Form HTML builders
   --------------------------------------------------------------- */

/**
 * Render a text/email/tel/number input field group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {string} opts.type
 * @param {boolean} [opts.required]
 * @param {string} [opts.placeholderKey]
 * @param {string} [opts.helpKey]
 * @returns {string}
 */
function renderInput(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const helpId = opts.helpKey ? `${opts.id}-help` : '';
  const describedBy = [
    opts.required ? errorId : '',
    helpId,
  ].filter(Boolean).join(' ');
  const ariaDesc = describedBy
    ? ` aria-describedby="${describedBy}"` : '';
  const reqAttr = opts.required ? ' required' : '';
  const placeholder = opts.placeholderKey
    ? ` placeholder="${esc(t(opts.placeholderKey))}"
        data-i18n-placeholder="${opts.placeholderKey}"` : '';
  const helpHtml = opts.helpKey
    ? `<span class="icf-form__help" id="${helpId}"
        data-i18n="${opts.helpKey}">${esc(t(opts.helpKey))}</span>`
    : '';

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${opts.id}">
        <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
      </label>
      <input
        class="icf-form__input"
        type="${opts.type}"
        id="${opts.id}"
        name="${opts.id}"${placeholder}${ariaDesc}${reqAttr}
      >
      ${helpHtml}
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

/**
 * Render a multi-select checkbox group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {Array<{value: string, i18nKey: string}>} opts.options
 * @param {boolean} [opts.required]
 * @returns {string}
 */
function renderCheckboxGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const checkboxes = opts.options.map((opt) => {
    const cbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    return `
      <label class="icf-form__checkbox-item">
        <input type="checkbox" name="${opts.id}"
          value="${esc(opt.value)}" id="${cbId}">
        <span class="icf-form__checkbox-mark"></span>
        <span data-i18n="${opt.i18nKey}">${esc(t(opt.i18nKey))}</span>
      </label>`;
  }).join('');

  return `
    <div class="icf-form__group">
      <fieldset class="icf-form__fieldset">
        <legend class="icf-form__label">
          <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
        </legend>
        <div class="icf-form__checkbox-group"
          role="group" aria-describedby="${errorId}">
          ${checkboxes}
        </div>
        <span class="icf-form__error" id="${errorId}"
          role="alert" aria-live="polite"></span>
      </fieldset>
    </div>`;
}

/**
 * Render a radio button group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {Array<{value: string, i18nKey: string}>} opts.options
 * @param {boolean} [opts.required]
 * @returns {string}
 */
function renderRadioGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const radios = opts.options.map((opt) => {
    const rbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    return `
      <label class="icf-form__radio-item">
        <input type="radio" name="${opts.id}"
          value="${esc(opt.value)}" id="${rbId}">
        <span class="icf-form__radio-mark"></span>
        <span data-i18n="${opt.i18nKey}">${esc(t(opt.i18nKey))}</span>
      </label>`;
  }).join('');

  return `
    <div class="icf-form__group">
      <fieldset class="icf-form__fieldset">
        <legend class="icf-form__label">
          <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
        </legend>
        <div class="icf-form__radio-group"
          role="radiogroup" aria-describedby="${errorId}">
          ${radios}
        </div>
        <span class="icf-form__error" id="${errorId}"
          role="alert" aria-live="polite"></span>
      </fieldset>
    </div>`;
}

/**
 * Render the textarea field for bio with word counter.
 * @returns {string}
 */
function renderBioField() {
  const id = uid('bio');
  const errorId = `${id}-error`;
  const countId = `${id}-count`;

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${id}">
        <span data-i18n="regLabelBio">${esc(t('regLabelBio'))}</span>
        <span class="icf-form__required" aria-hidden="true">*</span>
      </label>
      <textarea
        class="icf-form__textarea"
        id="${id}"
        name="${id}"
        rows="5"
        placeholder="${esc(t('regPlaceholderBio'))}"
        data-i18n-placeholder="regPlaceholderBio"
        aria-describedby="${countId} ${errorId}"
        required
      ></textarea>
      <span class="icf-form__word-count" id="${countId}">
        0 / ${BIO_MAX_WORDS}
      </span>
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

/**
 * Render the pricing section with min/max + "By request".
 * @returns {string}
 */
function renderPricingSection() {
  const minId = uid('price-min');
  const maxId = uid('price-max');
  const byReqId = uid('price-by-request');
  const minErrorId = `${minId}-error`;
  const maxErrorId = `${maxId}-error`;

  return `
    <div class="icf-form__section">
      <h3 class="icf-form__section-title"
        data-i18n="regSectionPricing">${esc(t('regSectionPricing'))}</h3>

      <div class="icf-form__price-row">
        <div class="icf-form__group icf-form__group--half">
          <label class="icf-form__label" for="${minId}">
            <span data-i18n="regLabelPriceMin">${esc(t('regLabelPriceMin'))}</span>
          </label>
          <input class="icf-form__input" type="number"
            id="${minId}" name="${minId}" min="0" step="1">
          <span class="icf-form__error" id="${minErrorId}"
            role="alert" aria-live="polite"></span>
        </div>
        <div class="icf-form__group icf-form__group--half">
          <label class="icf-form__label" for="${maxId}">
            <span data-i18n="regLabelPriceMax">${esc(t('regLabelPriceMax'))}</span>
          </label>
          <input class="icf-form__input" type="number"
            id="${maxId}" name="${maxId}" min="0" step="1">
          <span class="icf-form__error" id="${maxErrorId}"
            role="alert" aria-live="polite"></span>
        </div>
      </div>

      <label class="icf-form__checkbox-item icf-form__by-request">
        <input type="checkbox" id="${byReqId}" name="${byReqId}">
        <span class="icf-form__checkbox-mark"></span>
        <span data-i18n="regLabelPriceByRequest">${esc(t('regLabelPriceByRequest'))}</span>
      </label>
    </div>`;
}


/* ---------------------------------------------------------------
   Card Preview Builder
   --------------------------------------------------------------- */

/**
 * Build a mini card preview HTML from current form data.
 * @param {Object} data - Collected form data
 * @returns {string} HTML
 */
function buildPreviewCard(data) {
  // Avatar
  let avatar;
  if (data.photo && isValidUrl(data.photo)) {
    avatar = `<img class="icf-avatar" src="${esc(data.photo)}"
      alt="${esc(data.name || '')}" loading="lazy">`;
  } else {
    const name = data.name || '?';
    const initials = getInitials(name);
    const color = nameToColor(name);
    avatar = `<div class="icf-avatar-placeholder"
      style="background: ${color}" role="img"
      aria-label="${esc(name)}">${esc(initials)}</div>`;
  }

  // Badge
  const level = data.icfLevel || 'Member';
  const bc = BADGE_CONFIG[level] || BADGE_CONFIG.Member;
  const badgeIcon = bc.icon ? `${bc.icon} ` : '';
  const badgeLabel = level === 'Member'
    ? 'ICF' : `${level} ICF`;
  const badge = `<span class="icf-badge ${bc.cssClass}"
    >${badgeIcon}${esc(badgeLabel)}</span>`;

  // Bio
  const bio = data.bio
    ? `<p class="icf-card__bio">${esc(data.bio)}</p>` : '';

  // Tags
  const specs = data.specializations || [];
  const tags = specs.length > 0
    ? `<div class="icf-tags">${specs.map(
        (s) => `<span class="icf-tag">${esc(s)}</span>`
      ).join('')}</div>`
    : '';

  // Meta
  const langs = (data.languages || []).join(', ');
  const formatMap = {
    online: t('formatOnline'),
    offline: t('formatOffline'),
    both: t('formatBoth'),
  };
  const formatLabel = formatMap[data.format] || '';
  let priceText = t('metaPriceOnRequest');
  if (!data.byRequest) {
    const min = data.priceMin;
    const max = data.priceMax;
    if (min && max && min !== max) {
      priceText = `\u20AC${min}\u2013${max} ${t('metaPerSession')}`;
    } else if (min) {
      priceText = `\u20AC${min} ${t('metaPerSession')}`;
    }
  }

  return `
    <article class="icf-card" aria-label="${esc(data.name || '')}">
      <div class="icf-card__top">
        ${avatar}
        <div class="icf-card__name-block">
          <div class="icf-card__name">${esc(data.name || '')}</div>
          ${badge}
        </div>
      </div>
      ${bio}
      ${tags}
      <div class="icf-meta">
        ${langs ? `<span class="icf-meta__item">${esc(langs)}</span>` : ''}
        ${formatLabel ? `<span class="icf-meta__item">${esc(formatLabel)}</span>` : ''}
        <span class="icf-meta__item">${esc(priceText)}</span>
      </div>
    </article>`;
}


/* ---------------------------------------------------------------
   Main form renderer
   --------------------------------------------------------------- */

/**
 * Build the complete registration form HTML.
 * @returns {string}
 */
function buildFormHTML() {
  return `
    <form class="icf-form" novalidate>
      <!-- Section 1: Personal Info -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionPersonal">${esc(t('regSectionPersonal'))}</h3>

        ${renderInput({
          id: uid('name'),
          labelKey: 'regLabelName',
          type: 'text',
          required: true,
          placeholderKey: 'regPlaceholderName',
        })}

        ${renderInput({
          id: uid('photo'),
          labelKey: 'regLabelPhoto',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderPhoto',
          helpKey: 'regPhotoHelp',
        })}
      </div>

      <!-- Section 2: Professional Info -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionProfessional">${esc(t('regSectionProfessional'))}</h3>

        ${renderCheckboxGroup({
          id: uid('specializations'),
          labelKey: 'regLabelSpecializations',
          options: SPECIALIZATIONS,
          required: true,
        })}

        ${renderRadioGroup({
          id: uid('icf-level'),
          labelKey: 'regLabelIcfLevel',
          options: ICF_LEVELS,
          required: true,
        })}

        ${renderCheckboxGroup({
          id: uid('languages'),
          labelKey: 'regLabelLanguages',
          options: LANGUAGES,
          required: true,
        })}

        ${renderRadioGroup({
          id: uid('format'),
          labelKey: 'regLabelFormat',
          options: FORMATS,
          required: true,
        })}
      </div>

      <!-- Section 3: Pricing -->
      ${renderPricingSection()}

      <!-- Section 4: About You -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionAbout">${esc(t('regSectionAbout'))}</h3>
        ${renderBioField()}
      </div>

      <!-- Section 5: Contact Details -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionContact">${esc(t('regSectionContact'))}</h3>

        ${renderInput({
          id: uid('email'),
          labelKey: 'regLabelEmail',
          type: 'email',
          required: true,
          placeholderKey: 'regPlaceholderEmail',
        })}

        ${renderInput({
          id: uid('whatsapp'),
          labelKey: 'regLabelWhatsApp',
          type: 'tel',
          required: false,
          placeholderKey: 'regPlaceholderWhatsApp',
        })}

        ${renderInput({
          id: uid('telegram'),
          labelKey: 'regLabelTelegram',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderTelegram',
        })}
      </div>

      <!-- Section 6: Social Media -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionSocial">${esc(t('regSectionSocial'))}</h3>

        ${renderInput({
          id: uid('instagram'),
          labelKey: 'regLabelInstagram',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderInstagram',
        })}

        ${renderInput({
          id: uid('linkedin'),
          labelKey: 'regLabelLinkedIn',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderLinkedIn',
        })}

        ${renderInput({
          id: uid('facebook'),
          labelKey: 'regLabelFacebook',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderFacebook',
        })}
      </div>

      <!-- Section 7: ICF Verification -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionIcf">${esc(t('regSectionIcf'))}</h3>

        ${renderInput({
          id: uid('icf-membership'),
          labelKey: 'regLabelIcfMembership',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderIcfMembership',
        })}
      </div>

      <!-- Card Preview -->
      <div class="icf-form__preview">
        <h3 class="icf-form__section-title"
          data-i18n="regPreviewTitle">${esc(t('regPreviewTitle'))}</h3>
        <div class="icf-form__preview-card" aria-live="polite">
        </div>
      </div>

      <!-- Submit -->
      <div class="icf-form__actions">
        <button type="submit" class="icf-form__submit">
          <span data-i18n="regSubmit">${esc(t('regSubmit'))}</span>
        </button>
      </div>

      <!-- Result messages -->
      <div class="icf-form__result" aria-live="polite"></div>
    </form>`;
}


/* ---------------------------------------------------------------
   Form data collection
   --------------------------------------------------------------- */

/**
 * Collect all form values into a plain object.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function collectFormData(form) {
  const val = (id) => {
    const el = form.querySelector(`#${id}`);
    return el ? el.value.trim() : '';
  };

  const checked = (name) => {
    return Array.from(form.querySelectorAll(
      `input[name="${name}"]:checked`
    )).map((el) => el.value);
  };

  const radio = (name) => {
    const el = form.querySelector(
      `input[name="${name}"]:checked`
    );
    return el ? el.value : '';
  };

  const byRequestEl = form.querySelector(
    `#${uid('price-by-request')}`
  );
  const byRequest = byRequestEl ? byRequestEl.checked : false;

  return {
    name: val(uid('name')),
    photo: val(uid('photo')),
    specializations: checked(uid('specializations')),
    icfLevel: radio(uid('icf-level')),
    languages: checked(uid('languages')),
    format: radio(uid('format')),
    priceMin: parseInt(val(uid('price-min')), 10) || 0,
    priceMax: parseInt(val(uid('price-max')), 10) || 0,
    byRequest,
    bio: val(uid('bio')),
    email: val(uid('email')),
    whatsapp: val(uid('whatsapp')),
    telegram: val(uid('telegram')),
    instagram: val(uid('instagram')),
    linkedin: val(uid('linkedin')),
    facebook: val(uid('facebook')),
    icfMembership: val(uid('icf-membership')),
  };
}


/* ---------------------------------------------------------------
   Validation
   --------------------------------------------------------------- */

/**
 * Clear all error messages.
 * @param {HTMLFormElement} form
 */
function clearErrors(form) {
  form.querySelectorAll('.icf-form__error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.icf-form__input--error, ' +
    '.icf-form__textarea--error').forEach((el) => {
    el.classList.remove(
      'icf-form__input--error', 'icf-form__textarea--error'
    );
  });
}

/**
 * Show an error on a specific field.
 * @param {HTMLFormElement} form
 * @param {string} fieldId
 * @param {string} messageKey
 */
function showError(form, fieldId, messageKey) {
  const errorEl = form.querySelector(`#${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = t(messageKey);
  }
  const input = form.querySelector(`#${fieldId}`);
  if (input) {
    if (input.tagName === 'TEXTAREA') {
      input.classList.add('icf-form__textarea--error');
    } else {
      input.classList.add('icf-form__input--error');
    }
  }
}

/**
 * Show an error on a checkbox/radio group.
 * @param {HTMLFormElement} form
 * @param {string} groupName
 * @param {string} messageKey
 */
function showGroupError(form, groupName, messageKey) {
  const errorEl = form.querySelector(`#${groupName}-error`);
  if (errorEl) {
    errorEl.textContent = t(messageKey);
  }
}

/**
 * Validate form data. Returns true if valid.
 * @param {HTMLFormElement} form
 * @param {Object} data
 * @returns {boolean}
 */
function validateForm(form, data) {
  clearErrors(form);
  let valid = true;
  let firstError = null;

  // Name — required
  if (!data.name) {
    showError(form, uid('name'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('name');
  }

  // Photo URL — optional, but if provided must be valid
  if (data.photo && !isValidUrl(data.photo)) {
    showError(form, uid('photo'), 'regErrorUrl');
    valid = false;
    firstError = firstError || uid('photo');
  }

  // Specializations — at least one
  if (data.specializations.length === 0) {
    showGroupError(
      form, uid('specializations'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('specializations');
  }

  // ICF Level — required
  if (!data.icfLevel) {
    showGroupError(
      form, uid('icf-level'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('icf-level');
  }

  // Languages — at least one
  if (data.languages.length === 0) {
    showGroupError(
      form, uid('languages'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('languages');
  }

  // Format — required
  if (!data.format) {
    showGroupError(
      form, uid('format'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('format');
  }

  // Bio — required, max 300 words
  if (!data.bio) {
    showError(form, uid('bio'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('bio');
  } else if (countWords(data.bio) > BIO_MAX_WORDS) {
    showError(form, uid('bio'), 'regErrorBioTooLong');
    valid = false;
    firstError = firstError || uid('bio');
  }

  // Email — required, valid format
  if (!data.email) {
    showError(form, uid('email'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('email');
  } else if (!isValidEmail(data.email)) {
    showError(form, uid('email'), 'regErrorEmail');
    valid = false;
    firstError = firstError || uid('email');
  }

  // Scroll to first error
  if (firstError) {
    const el = form.querySelector(`#${firstError}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.focus) el.focus();
    }
  }

  return valid;
}


/* ---------------------------------------------------------------
   Public API
   --------------------------------------------------------------- */

/**
 * Render the registration form into a container and wire up
 * all interactions (preview, validation, submit).
 *
 * @param {HTMLElement} container
 * @param {(formData: Object) => Promise<void>} onSubmit
 */
export function renderRegistrationForm(container, onSubmit) {
  container.innerHTML = buildFormHTML();

  const form = container.querySelector('.icf-form');
  if (!form) return;

  const previewContainer = form.querySelector(
    '.icf-form__preview-card'
  );
  const resultContainer = form.querySelector(
    '.icf-form__result'
  );
  const submitBtn = form.querySelector('.icf-form__submit');

  // --- "By request" checkbox toggles price inputs ---
  const byReqCheckbox = form.querySelector(
    `#${uid('price-by-request')}`
  );
  const priceMinInput = form.querySelector(
    `#${uid('price-min')}`
  );
  const priceMaxInput = form.querySelector(
    `#${uid('price-max')}`
  );

  if (byReqCheckbox && priceMinInput && priceMaxInput) {
    byReqCheckbox.addEventListener('change', () => {
      const disabled = byReqCheckbox.checked;
      priceMinInput.disabled = disabled;
      priceMaxInput.disabled = disabled;
      if (disabled) {
        priceMinInput.value = '';
        priceMaxInput.value = '';
      }
      updatePreview();
    });
  }

  // --- Bio word counter ---
  const bioTextarea = form.querySelector(`#${uid('bio')}`);
  const wordCountEl = form.querySelector(
    `#${uid('bio')}-count`
  );

  function updateWordCount() {
    if (!bioTextarea || !wordCountEl) return;
    const count = countWords(bioTextarea.value);
    const text = t('regWordCount')
      .replace('{count}', String(count))
      .replace('{max}', String(BIO_MAX_WORDS));
    wordCountEl.textContent = text;
    const isOver = count > BIO_MAX_WORDS;
    wordCountEl.classList.toggle(
      'icf-form__word-count--over', isOver
    );
  }

  if (bioTextarea) {
    bioTextarea.addEventListener('input', () => {
      updateWordCount();
      debouncedPreview();
    });
    updateWordCount();
  }

  // --- Live card preview (debounced) ---
  function updatePreview() {
    if (!previewContainer) return;
    const data = collectFormData(form);
    previewContainer.innerHTML = buildPreviewCard(data);
  }

  const debouncedPreview = debounce(
    updatePreview, PREVIEW_DEBOUNCE_MS
  );

  // Listen to all input/change events for preview
  form.addEventListener('input', (e) => {
    if (e.target !== bioTextarea) {
      debouncedPreview();
    }
  });
  form.addEventListener('change', debouncedPreview);

  // Initial preview
  updatePreview();

  // --- Submit handler ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = collectFormData(form);

    if (!validateForm(form, data)) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent =
      t('regSubmitting');
    submitBtn.classList.add('icf-form__submit--loading');
    resultContainer.innerHTML = '';

    try {
      await onSubmit(data);

      // Success state — hide form and preview, show only the message
      form.style.display = 'none';
      const preview = container.querySelector('.icf-form__preview');
      if (preview) preview.style.display = 'none';
      resultContainer.innerHTML = `
        <div class="icf-form__success" role="status">
          <p data-i18n="regSuccess">${esc(t('regSuccess'))}</p>
        </div>`;
    } catch (err) {
      // Error state with retry
      resultContainer.innerHTML = `
        <div class="icf-form__error-message" role="alert">
          <p data-i18n="regErrorGeneral">
            ${esc(t('regErrorGeneral'))}
          </p>
          <button type="button"
            class="icf-form__retry"
            data-i18n="regRetry">${esc(t('regRetry'))}</button>
        </div>`;

      const retryBtn = resultContainer.querySelector(
        '.icf-form__retry'
      );
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          // Disable retry button to prevent double-submit race
          retryBtn.disabled = true;
          resultContainer.innerHTML = '';
          form.dispatchEvent(new Event('submit', {
            cancelable: true,
          }));
        });
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent =
        t('regSubmit');
      submitBtn.classList.remove('icf-form__submit--loading');
    }
  });
}
