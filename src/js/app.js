/**
 * ICF Registry — Main Application Entry Point
 *
 * Initializes the coach registry widget:
 * 1. Finds or creates container element
 * 2. Sets up language from localStorage / browser locale
 * 3. Renders page header with language switcher
 * 4. Fetches coach data (Google Sheets or mock)
 * 5. Renders filters and coach cards grid
 * 6. Wires up event listeners
 *
 * External usage:
 *   <div id="icf-coach-registry"></div>
 *   <script type="module">
 *     import { ICFRegistry } from './js/app.js';
 *     ICFRegistry.init();
 *   </script>
 */

import {
  initLanguage,
  setLanguage,
  getCurrentLanguage,
  t,
  SUPPORTED_LANGS,
} from './i18n.js';
import { fetchCoaches } from './sheets.js';
import { renderCards } from './cards.js';
import { renderFilters } from './filters.js';

/**
 * @typedef {Object} RegistryConfig
 * @property {string} [sheetId] — Google Sheet ID (omit for mock data)
 * @property {string} [containerId] — custom container ID
 */

/** @type {import('./sheets.js').Coach[]} */
let coaches = [];

/** @type {HTMLElement|null} */
let containerEl = null;

/**
 * Find the widget container element.
 * Priority: config.containerId > #icf-coach-registry > [data-icf-registry]
 * @param {string} [containerId]
 * @returns {HTMLElement|null}
 */
function findContainer(containerId) {
  if (containerId) {
    return document.getElementById(containerId);
  }
  return (
    document.getElementById('icf-coach-registry') ||
    document.querySelector('[data-icf-registry]')
  );
}

/**
 * Render the page header with title and language switcher.
 * @returns {string} HTML string
 */
function renderHeader() {
  const lang = getCurrentLanguage();
  const langButtons = SUPPORTED_LANGS
    .map((code) => {
      const active = code === lang ? ' icf-lang-switch__btn--active' : '';
      const label = code.toUpperCase();
      return `<button
        class="icf-lang-switch__btn${active}"
        data-lang="${code}"
        aria-label="Switch to ${label}"
        aria-pressed="${code === lang}"
      >${label}</button>`;
    })
    .join('');

  return `
    <header class="icf-page-header">
      <h1 class="icf-page-title" data-i18n="pageTitle">
        ${t('pageTitle')}
      </h1>
      <nav class="icf-lang-switch" role="group"
           aria-label="Language">
        ${langButtons}
      </nav>
    </header>
  `;
}

/**
 * Render the AI matching button (Phase 2 — visual placeholder).
 * @returns {string} HTML string
 */
function renderAIButton() {
  return `
    <button class="icf-ai-button" disabled
            aria-label="${t('aiButtonTitle')}">
      <span aria-hidden="true">&#10022;</span>
      <span data-i18n="aiButtonTitle">${t('aiButtonTitle')}</span>
      <span class="icf-ai-button__sub"
            data-i18n="aiButtonSubtitle">
        ${t('aiButtonSubtitle')}
      </span>
    </button>
  `;
}

/**
 * Render a loading state.
 * @returns {string} HTML string
 */
function renderLoading() {
  return `
    <div class="icf-loading" role="status" aria-live="polite">
      <p data-i18n="loading">${t('loading')}</p>
    </div>
  `;
}

/**
 * Render an error state.
 * @param {string} [message]
 * @returns {string} HTML string
 */
function renderError(message) {
  return `
    <div class="icf-error-state" role="alert">
      <p data-i18n="errorState">
        ${message || t('errorState')}
      </p>
    </div>
  `;
}

/**
 * Full render of the widget. Called on init and language change.
 * @param {'loading'|'ready'|'error'} state
 * @param {string} [errorMessage]
 */
function render(state, errorMessage) {
  if (!containerEl) return;

  let bodyHTML = '';

  if (state === 'loading') {
    bodyHTML = renderLoading();
  } else if (state === 'error') {
    bodyHTML = renderError(errorMessage);
  } else {
    // Filters container + Grid container
    bodyHTML = `
      <div id="icf-filters-container"></div>
      <div class="icf-grid" id="icf-grid-container"></div>
    `;
  }

  containerEl.innerHTML = `
    ${renderHeader()}
    ${renderAIButton()}
    ${bodyHTML}
  `;

  // Wire up language switch buttons
  bindLanguageSwitch();

  // If ready, render filters and cards into their containers
  if (state === 'ready') {
    const filtersContainer = containerEl.querySelector(
      '#icf-filters-container'
    );
    const gridContainer = containerEl.querySelector(
      '#icf-grid-container'
    );

    if (filtersContainer) {
      renderFilters(coaches, filtersContainer, handleFilterChange);
    }
    if (gridContainer) {
      renderCards(coaches, gridContainer);
    }
  }
}

/**
 * Handle filter change callback.
 * Will re-render cards with filtered subset.
 * @param {import('./sheets.js').Coach[]} filteredCoaches
 */
function handleFilterChange(filteredCoaches) {
  const gridContainer = containerEl?.querySelector(
    '#icf-grid-container'
  );
  if (gridContainer) {
    renderCards(filteredCoaches, gridContainer);
  }
}

/**
 * Bind click listeners to language switch buttons.
 */
function bindLanguageSwitch() {
  if (!containerEl) return;

  const buttons = containerEl.querySelectorAll(
    '.icf-lang-switch__btn'
  );

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang && lang !== getCurrentLanguage()) {
        setLanguage(lang);
        // Re-render entire widget with new language
        render('ready');
      }
    });
  });
}

/**
 * Initialize the ICF Coach Registry widget.
 * @param {RegistryConfig} [config]
 */
async function init(config = {}) {
  containerEl = findContainer(config.containerId);

  if (!containerEl) {
    const fallback = document.createElement('div');
    fallback.id = 'icf-coach-registry';
    document.body.appendChild(fallback);
    containerEl = fallback;
  }

  // Add the scoping class for CSS custom properties
  containerEl.classList.add('icf-registry');

  // Initialize language
  const lang = initLanguage();
  containerEl.setAttribute('lang', lang);

  // Show loading state
  render('loading');

  try {
    coaches = await fetchCoaches(config.sheetId);
    render('ready');
  } catch (err) {
    render('error', t('errorState'));
  }
}

/**
 * Public API — exposed as ICFRegistry global and as ES module export.
 */
export const ICFRegistry = { init };

// Also attach to window for non-module usage (WordPress embed)
if (typeof window !== 'undefined') {
  window.ICFRegistry = ICFRegistry;
}
