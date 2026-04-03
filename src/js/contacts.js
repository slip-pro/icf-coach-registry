/**
 * ICF Registry — Contact Buttons Module
 *
 * Renders contact block for each coach card:
 * - WhatsApp button (opens wa.me link with pre-filled text)
 * - Telegram button (opens t.me link)
 * - Email button (opens mailto: link with subject + body)
 * - Social links row (Instagram, LinkedIn, Facebook icons)
 *
 * Each contact button includes an inline SVG icon + text label.
 * Brand colors applied per channel via CSS variants (see main.css).
 *
 * @module contacts
 */

import { t, getCurrentLanguage } from './i18n.js';

// ---------------------------------------------------------------------------
// SVG Icons (inline, minimal)
// ---------------------------------------------------------------------------

/** WhatsApp icon 15x15 */
const ICON_WHATSAPP = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

/** Telegram icon 15x15 */
const ICON_TELEGRAM = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

/** Email icon 15x15 */
const ICON_EMAIL = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>`;

/** Instagram icon 16x16 */
const ICON_INSTAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>`;

/** LinkedIn icon 16x16 */
const ICON_LINKEDIN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;

/** Facebook icon 16x16 */
const ICON_FACEBOOK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a WhatsApp number: strip non-digits, ensure country code.
 * If the number starts with 0, assume Cyprus (+357).
 * @param {string} raw
 * @returns {string} digits-only with country code
 */
function normalizeWhatsAppNumber(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '357' + digits.slice(1);
  }
  return digits;
}

/**
 * Normalize a Telegram username: strip leading @ and URL prefix.
 * @param {string} raw
 * @returns {string} clean username
 */
function normalizeTelegramUsername(raw) {
  let username = raw.trim();
  // Handle full URLs
  if (username.includes('t.me/')) {
    username = username.split('t.me/').pop() || '';
  }
  // Strip leading @
  if (username.startsWith('@')) {
    username = username.slice(1);
  }
  return username;
}

/**
 * Normalize an Instagram handle: strip @ and URL prefix.
 * @param {string} raw
 * @returns {string} clean handle
 */
function normalizeInstagramHandle(raw) {
  let handle = raw.trim();
  if (handle.includes('instagram.com/')) {
    handle = handle.split('instagram.com/').pop() || '';
    // Remove trailing slash or query params
    handle = handle.split(/[?/]/)[0];
  }
  if (handle.startsWith('@')) {
    handle = handle.slice(1);
  }
  return handle;
}

/**
 * Build the pre-filled contact message with coach name inserted.
 * @param {string} coachName
 * @returns {string}
 */
function buildContactMessage(coachName) {
  const template = t('contactMessage');
  return template.replace('{name}', coachName);
}

/**
 * Check if a URL is safe (http/https only).
 * Prevents javascript:, data:, and other dangerous URI schemes.
 * @param {string} url
 * @returns {boolean}
 */
function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

/**
 * Validate an email address with a basic pattern.
 * Prevents header injection via %0a and attribute breakout.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Contact buttons
// ---------------------------------------------------------------------------

/**
 * Build WhatsApp contact link HTML.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML string or empty
 */
function renderWhatsApp(coach) {
  if (!coach.whatsapp) return '';

  const number = normalizeWhatsAppNumber(coach.whatsapp);
  const message = encodeURIComponent(buildContactMessage(coach.name));
  const href = `https://wa.me/${number}?text=${message}`;

  return `<a class="icf-contact-link icf-contact-link--whatsapp"
    href="${href}" target="_blank" rel="noopener"
    aria-label="WhatsApp ${escapeHtml(coach.name)}">
    ${ICON_WHATSAPP} WhatsApp</a>`;
}

/**
 * Build Telegram contact link HTML.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML string or empty
 */
function renderTelegram(coach) {
  if (!coach.telegram) return '';

  const username = normalizeTelegramUsername(coach.telegram);
  const message = encodeURIComponent(buildContactMessage(coach.name));
  const href = `https://t.me/${username}?text=${message}`;

  return `<a class="icf-contact-link icf-contact-link--telegram"
    href="${href}" target="_blank" rel="noopener"
    aria-label="Telegram ${escapeHtml(coach.name)}">
    ${ICON_TELEGRAM} Telegram</a>`;
}

/**
 * Build Email contact link HTML.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML string or empty
 */
function renderEmail(coach) {
  if (!coach.email) return '';

  if (!isValidEmail(coach.email)) return '';

  const encodedEmail = encodeURIComponent(coach.email.trim());
  const subject = encodeURIComponent(t('contactSubject'));
  const body = encodeURIComponent(buildContactMessage(coach.name));
  const href =
    `mailto:${encodedEmail}?subject=${subject}&body=${body}`;

  return `<a class="icf-contact-link icf-contact-link--email"
    href="${href}"
    aria-label="Email ${escapeHtml(coach.name)}">
    ${ICON_EMAIL} Email</a>`;
}

// ---------------------------------------------------------------------------
// Social icons
// ---------------------------------------------------------------------------

/**
 * Build social media icons row HTML.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML string or empty
 */
function renderSocials(coach) {
  const icons = [];

  if (coach.instagram) {
    const handle = normalizeInstagramHandle(coach.instagram);
    icons.push(
      `<a class="icf-social-icon"
        href="https://instagram.com/${handle}"
        target="_blank" rel="noopener"
        title="Instagram"
        aria-label="Instagram ${escapeHtml(coach.name)}">
        ${ICON_INSTAGRAM}</a>`
    );
  }

  if (coach.linkedin) {
    // LinkedIn values may be full URLs or just profile slugs
    const href = coach.linkedin.startsWith('http')
      ? coach.linkedin
      : `https://linkedin.com/in/${coach.linkedin}`;
    if (isSafeUrl(href)) {
      icons.push(
        `<a class="icf-social-icon"
          href="${href}"
          target="_blank" rel="noopener"
          title="LinkedIn"
          aria-label="LinkedIn ${escapeHtml(coach.name)}">
          ${ICON_LINKEDIN}</a>`
      );
    }
  }

  if (coach.facebook) {
    const href = coach.facebook.startsWith('http')
      ? coach.facebook
      : `https://facebook.com/${coach.facebook}`;
    if (isSafeUrl(href)) {
      icons.push(
        `<a class="icf-social-icon"
          href="${href}"
          target="_blank" rel="noopener"
          title="Facebook"
          aria-label="Facebook ${escapeHtml(coach.name)}">
          ${ICON_FACEBOOK}</a>`
      );
    }
  }

  if (icons.length === 0) return '';

  return `
    <div class="icf-socials">
      <span class="icf-socials__label"
        data-i18n="socialsLabel">${t('socialsLabel')}</span>
      ${icons.join('\n      ')}
    </div>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export { isSafeUrl };

/**
 * Render the complete contact block HTML for a coach card.
 * Returns empty string if the coach has no contact channels.
 *
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML string for the contact section
 */
export function renderContactBlock(coach) {
  const contactLinks = [
    renderWhatsApp(coach),
    renderTelegram(coach),
    renderEmail(coach),
  ].filter(Boolean);

  const socialsHtml = renderSocials(coach);

  // Nothing to render if no contacts and no socials
  if (contactLinks.length === 0 && !socialsHtml) {
    return '';
  }

  const contactLinksHtml = contactLinks.length > 0
    ? `
    <div class="icf-contact-links">
      ${contactLinks.join('\n      ')}
    </div>`
    : '';

  return `
    <div class="icf-contact-block">
      <span data-i18n="contactLabel">${t('contactLabel')}</span>
      ${contactLinksHtml}
      ${socialsHtml}
    </div>`;
}
