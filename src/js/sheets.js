/**
 * ICF Registry — Google Sheets Data Fetcher
 *
 * Fetches the approved coaches through the registry's API (/api/coaches),
 * which reads the spreadsheet on the server side. Mock data for development.
 *
 * Usage:
 *   import { fetchCoaches } from './sheets.js';
 *   const coaches = await fetchCoaches({ apiBase: '/api' });
 *   // or for dev: const coaches = await fetchCoaches({ mock: true });
 */

/**
 * @typedef {Object} Coach
 * @property {string} id
 * @property {string} name
 * @property {string} photo
 * @property {string[]} specializations
 * @property {string} icfLevel — 'ACC' | 'PCC' | 'MCC' | 'Member'
 * @property {string[]} languages
 * @property {string} format — 'online' | 'offline' | 'both'
 * @property {number} priceMin
 * @property {number} priceMax
 * @property {string} bio1
 * @property {string} bio1Lang — 'en', 'ru', 'el' or empty
 * @property {string} bio2
 * @property {string} bio2Lang — 'en', 'ru', 'el' or empty
 * @property {string} bio — alias for bio1 (backward compat)
 * @property {string} email
 * @property {string} whatsapp
 * @property {string} telegram
 * @property {string} instagram
 * @property {string} linkedin
 * @property {string} facebook
 * @property {string} status — 'approved' | 'pending' | 'rejected'
 */

/**
 * Split a delimited string (comma or semicolon separated)
 * into a trimmed array, filtering empty strings.
 * @param {string} value
 * @returns {string[]}
 */
function splitList(value) {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Normalize a format string to 'online' | 'offline' | 'both'.
 * @param {string} value
 * @returns {string}
 */
/**
 * Normalize language name to 2-letter code.
 * Accepts: 'Russian', 'ru', 'RU', 'english', 'EN', 'Greek', 'el', etc.
 * @param {string} value
 * @returns {string} 'en', 'ru', 'el', or ''
 */
function normalizeLangCode(value) {
  const lower = (value || '').toLowerCase().trim();
  if (lower === 'en' || lower === 'english') return 'en';
  if (lower === 'ru' || lower === 'russian') return 'ru';
  if (lower === 'el' || lower === 'greek' || lower === 'ελληνικά') return 'el';
  return lower;
}

function normalizeFormat(value) {
  const lower = (value || '').toLowerCase();
  if (lower.includes('both') || (lower.includes('online') && lower.includes('offline'))) {
    return 'both';
  }
  if (lower.includes('offline')) return 'offline';
  return 'online';
}

/**
 * Normalize ICF level string to standard values.
 * @param {string} value
 * @returns {string}
 */
function normalizeLevel(value) {
  const upper = (value || '').toUpperCase();
  if (upper.includes('MCC')) return 'MCC';
  if (upper.includes('PCC')) return 'PCC';
  if (upper.includes('ACC')) return 'ACC';
  return 'Member';
}

/**
 * Map CSV header names to normalized keys.
 * Supports both English column names and common variants.
 * @type {Record<string, string>}
 */
const HEADER_MAP = {
  // English
  'id': 'id',
  'name': 'name',
  'photo': 'photo',
  'specializations': 'specializations',
  'specialization': 'specializations',
  'icf level': 'icfLevel',
  'icflevel': 'icfLevel',
  'level': 'icfLevel',
  'credential': 'icfLevel',
  'languages': 'languages',
  'language': 'languages',
  'format': 'format',
  'price min': 'priceMin',
  'pricemin': 'priceMin',
  'price_min': 'priceMin',
  'price max': 'priceMax',
  'pricemax': 'priceMax',
  'price_max': 'priceMax',
  'price': 'priceMin',
  'bio': 'bio1',
  'bio 1': 'bio1',
  'bio1': 'bio1',
  'bio 1 language': 'bio1Lang',
  'bio1language': 'bio1Lang',
  'bio1lang': 'bio1Lang',
  'bio 2': 'bio2',
  'bio2': 'bio2',
  'bio 2 language': 'bio2Lang',
  'bio2language': 'bio2Lang',
  'bio2lang': 'bio2Lang',
  'description': 'bio1',
  'about': 'bio1',
  'email': 'email',
  'whatsapp': 'whatsapp',
  'telegram': 'telegram',
  'instagram': 'instagram',
  'linkedin': 'linkedin',
  'facebook': 'facebook',
  'status': 'status',
  'icf membership': 'icfMembership',
  'icfmembership': 'icfMembership',
  'membership': 'icfMembership',
  'submitted at': 'submittedAt',
  'submittedat': 'submittedAt',
  'timestamp': 'submittedAt',
};

/**
 * Convert CSV rows (with header) into Coach objects.
 * @param {string[][]} rows — first row is headers
 * @returns {Coach[]}
 */
function csvToCoaches(rows) {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => {
    const key = h.toLowerCase().trim();
    return HEADER_MAP[key] || key;
  });

  return rows.slice(1).map((row, index) => {
    /** @type {Record<string, string>} */
    const raw = {};
    headers.forEach((header, i) => {
      raw[header] = row[i] || '';
    });

    return {
      id: raw.id || String(index + 1),
      name: raw.name || '',
      photo: normalizePhotoUrl(raw.photo || ''),
      specializations: splitList(raw.specializations),
      icfLevel: normalizeLevel(raw.icfLevel),
      languages: splitList(raw.languages),
      format: normalizeFormat(raw.format),
      priceMin: parseInt(raw.priceMin, 10) || 0,
      priceMax: parseInt(raw.priceMax, 10) || 0,
      bio1: raw.bio1 || '',
      bio1Lang: normalizeLangCode(raw.bio1Lang),
      bio2: raw.bio2 || '',
      bio2Lang: normalizeLangCode(raw.bio2Lang),
      get bio() { return this.bio1; },
      email: raw.email || '',
      whatsapp: raw.whatsapp || '',
      telegram: raw.telegram || '',
      instagram: raw.instagram || '',
      linkedin: raw.linkedin || '',
      facebook: raw.facebook || '',
      status: normalizeStatus(raw.status),
    };
  }).filter((coach) => coach.name);
}

/**
 * Normalize a status string to a known value.
 * When the column is missing or empty, defaults to 'approved'
 * for backward compatibility with sheets that lack a Status column.
 * @param {string} value
 * @returns {string}
 */
/**
 * Convert Google Drive share links to direct thumbnail URLs.
 * @param {string} url
 * @returns {string}
 */
function normalizePhotoUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive file link: drive.google.com/file/d/{ID}/...
  const driveMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w256`;
  }

  // Google Drive open link: drive.google.com/open?id={ID}
  const openMatch = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  );
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w256`;
  }

  return trimmed;
}

function normalizeStatus(value) {
  const lower = (value || '').toLowerCase().trim();
  if (lower === 'pending') return 'pending';
  if (lower === 'rejected') return 'rejected';
  // Default: approved (backward compatible — no Status column = approved)
  return 'approved';
}

/**
 * Filter coaches to only include approved entries.
 * @param {Coach[]} coaches
 * @returns {Coach[]}
 */
function filterApproved(coaches) {
  return coaches.filter((coach) => coach.status === 'approved');
}

/**
 * Fetch the approved coaches through the registry's own API (`/api/coaches`,
 * which asks the Apps Script). The catalogue used to read the spreadsheet
 * straight from Google as CSV, which required the whole spreadsheet — every
 * tab, including private ones — to be shared as "anyone with the link".
 *
 * @param {object} [options]
 * @param {string} [options.apiBase='/api'] — where the registry's API lives
 * @param {boolean} [options.mock=false] — use local mock data (development)
 * @returns {Promise<Coach[]>}
 * @throws {Error} if the fetch or parse fails
 */
export async function fetchCoaches({ apiBase = '/api', mock = false } = {}) {
  if (mock) {
    const allCoaches = await loadMockData();
    return filterApproved(allCoaches);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${apiBase.replace(/\/$/, '')}/coaches`, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch coaches: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success || !Array.isArray(data.headers) || !Array.isArray(data.rows)) {
    throw new Error('Unexpected answer from /api/coaches');
  }
  return filterApproved(csvToCoaches([data.headers, ...data.rows]));
}

/**
 * Load mock coach data from local JSON file.
 * Uses import.meta.url to resolve path relative to this JS module,
 * so it works regardless of which HTML page loads the widget.
 * @returns {Promise<Coach[]>}
 */
async function loadMockData() {
  const baseUrl = new URL('.', import.meta.url).href;
  const mockUrl = new URL('../data/mock-coaches.json', baseUrl).href;
  const response = await fetch(mockUrl);

  if (!response.ok) {
    throw new Error('Failed to load mock data');
  }

  return response.json();
}
