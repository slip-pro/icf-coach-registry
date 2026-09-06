/**
 * ICF Registry -- Remote Configuration Loader
 *
 * Fetches frontend config from /api/config (which reads
 * from the Settings sheet in Google Sheets).
 *
 * Config includes: brand name, colors, location,
 * country code, sheet ID.
 *
 * Results are cached in memory for the page session
 * and in localStorage for 5 minutes.
 *
 * @module config
 */

const CACHE_KEY = 'icf_registry_config';
const CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {RemoteConfig|null} */
let cachedConfig = null;

/**
 * @typedef {Object} RemoteConfig
 * @property {string} brandName
 * @property {string} registryName
 * @property {string} siteUrl
 * @property {string} editPage
 * @property {string} sheetId
 * @property {string} location
 * @property {string} countryCode
 * @property {{ primary: string, secondary: string,
 *              accent: string, surface: string }} colors
 */

/**
 * Try to load config from localStorage cache.
 * @returns {RemoteConfig|null}
 */
function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.config;
  } catch (_err) {
    return null;
  }
}

/**
 * Save config to localStorage cache.
 * @param {RemoteConfig} config
 */
function saveToCache(config) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      config,
    }));
  } catch (_err) {
    // localStorage unavailable — ignore
  }
}

/**
 * Fetch remote config from /api/config.
 * Uses in-memory cache, then localStorage, then network.
 *
 * @param {string} [apiBase=''] - base URL for API calls
 * @returns {Promise<RemoteConfig|null>}
 */
export async function fetchConfig(apiBase = '') {
  // In-memory cache (instant)
  if (cachedConfig) return cachedConfig;

  // localStorage cache (no network)
  const fromCache = loadFromCache();
  if (fromCache) {
    cachedConfig = fromCache;
    return cachedConfig;
  }

  // Network fetch
  try {
    const url = apiBase
      ? `${apiBase.replace(/\/submit$/, '')}/config`
      : '/api/config';
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.config) {
      cachedConfig = data.config;
      saveToCache(cachedConfig);
      return cachedConfig;
    }
    return null;
  } catch (_err) {
    return null;
  }
}

/**
 * Apply remote config to the page: overrides the brand colour custom
 * properties. Typography and the logo are fixed in code — see below.
 *
 * @param {RemoteConfig} config
 * @param {HTMLElement} container
 */
export function applyConfig(config, container) {
  if (!config) return;

  // Apply colors as CSS custom properties
  if (config.colors) {
    const root = container;
    if (config.colors.primary) {
      root.style.setProperty(
        '--icf-text-primary', config.colors.primary
      );
      root.style.setProperty(
        '--icf-deep-blue', config.colors.primary
      );
    }
    if (config.colors.secondary) {
      root.style.setProperty(
        '--icf-text-secondary', config.colors.secondary
      );
      root.style.setProperty(
        '--icf-blue', config.colors.secondary
      );
    }
    if (config.colors.accent) {
      root.style.setProperty(
        '--icf-cta', config.colors.accent
      );
      root.style.setProperty(
        '--icf-yellow', config.colors.accent
      );
    }
    if (config.colors.surface) {
      root.style.setProperty(
        '--icf-email-hover-bg', config.colors.surface
      );
      root.style.setProperty(
        '--icf-bone', config.colors.surface
      );
    }
  }

  // Fonts and the logo are deliberately NOT configurable. The heading face is
  // Hoss Round, self-hosted in main.css and shared with the ICF Cyprus website;
  // a remote override would silently break that pairing.

}

/**
 * Clear the config cache (useful for testing).
 */
export function clearConfigCache() {
  cachedConfig = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (_err) {
    // ignore
  }
}
