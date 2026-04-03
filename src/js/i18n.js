/**
 * ICF Registry — Internationalization Module
 *
 * Manages UI translations for EN, RU, EL.
 * Coach content (names, bios, tags) is NOT translated — displayed as-is.
 *
 * Usage:
 *   import { t, setLanguage, getCurrentLanguage } from './i18n.js';
 *   const label = t('filterSpecialization');
 *   setLanguage('ru');
 */

const STORAGE_KEY = 'icf-lang';
const SUPPORTED_LANGS = ['en', 'ru', 'el'];
const DEFAULT_LANG = 'en';

/** @type {Record<string, Record<string, string>>} */
const dictionary = {
  // Page
  pageTitle: {
    en: 'ICF Cyprus Coach Registry',
    ru: 'Реестр коучей ICF Cyprus',
    el: 'Μητρώο Coaches ICF Cyprus',
  },

  // Filter labels
  filterSpecialization: {
    en: 'Specialization',
    ru: 'Специализация',
    el: 'Ειδίκευση',
  },
  filterLanguage: {
    en: 'Language',
    ru: 'Язык',
    el: 'Γλώσσα',
  },
  filterFormat: {
    en: 'Format',
    ru: 'Формат',
    el: 'Μορφή',
  },
  filterLevel: {
    en: 'ICF Level',
    ru: 'Уровень ICF',
    el: 'Επίπεδο ICF',
  },
  filterPrice: {
    en: 'Session Price',
    ru: 'Цена сессии',
    el: 'Τιμή Συνεδρίας',
  },

  // Filter options — Format
  formatOnline: {
    en: 'Online',
    ru: 'Онлайн',
    el: 'Online',
  },
  formatOffline: {
    en: 'Offline (Cyprus)',
    ru: 'Офлайн (Кипр)',
    el: 'Δια ζώσης (Κύπρος)',
  },
  formatBoth: {
    en: 'Online + Offline',
    ru: 'Онлайн + Офлайн',
    el: 'Online + Δια ζώσης',
  },

  // Filter options — Specialization
  specLeadership: {
    en: 'Leadership',
    ru: 'Лидерство',
    el: 'Ηγεσία',
  },
  specBusiness: {
    en: 'Business',
    ru: 'Бизнес',
    el: 'Επιχείρηση',
  },
  specLife: {
    en: 'Life',
    ru: 'Жизненные цели',
    el: 'Ζωή',
  },
  specCareer: {
    en: 'Career',
    ru: 'Карьера',
    el: 'Καριέρα',
  },
  specRelationships: {
    en: 'Relationships',
    ru: 'Отношения',
    el: 'Σχέσεις',
  },
  specExecutive: {
    en: 'Executive',
    ru: 'Executive',
    el: 'Executive',
  },

  // Contact
  contactWhatsApp: {
    en: 'WhatsApp',
    ru: 'WhatsApp',
    el: 'WhatsApp',
  },
  contactTelegram: {
    en: 'Telegram',
    ru: 'Telegram',
    el: 'Telegram',
  },
  contactEmail: {
    en: 'Email',
    ru: 'Email',
    el: 'Email',
  },
  contactLabel: {
    en: 'Contact:',
    ru: 'Связаться:',
    el: 'Επικοινωνία:',
  },
  contactMessage: {
    en: 'Hello, {name}! I found you in the ICF Cyprus coach registry and would like to learn about coaching sessions. I look forward to discussing details.',
    ru: 'Здравствуйте, {name}! Нашёл(а) вас в реестре коучей ICF Cyprus и хотел(а) бы узнать о возможности коучинговых сессий. Буду рад(а) обсудить детали.',
    el: 'Γεια σας, {name}! Σας βρήκα στο μητρώο coaches ICF Cyprus και θα ήθελα να μάθω για τις δυνατότητες coaching. Ανυπομονώ να συζητήσουμε.',
  },
  contactSubject: {
    en: 'Coaching inquiry from ICF Cyprus registry',
    ru: 'Запрос о коучинге из реестра ICF Cyprus',
    el: 'Ερώτημα coaching από το μητρώο ICF Cyprus',
  },
  socialsLabel: {
    en: 'Profiles:',
    ru: 'Профили:',
    el: 'Προφίλ:',
  },

  // Meta
  metaPerSession: {
    en: '/ session',
    ru: '/ сессия',
    el: '/ συνεδρία',
  },
  metaPriceOnRequest: {
    en: 'On request',
    ru: 'По запросу',
    el: 'Κατόπιν αιτήματος',
  },

  // States
  loading: {
    en: 'Loading coaches...',
    ru: 'Загружаем коучей...',
    el: 'Φόρτωση coaches...',
  },
  emptyState: {
    en: 'No coaches found matching your filters.',
    ru: 'Коучи по выбранным фильтрам не найдены.',
    el: 'Δεν βρέθηκαν coaches με τα επιλεγμένα φίλτρα.',
  },
  errorState: {
    en: 'Failed to load coach data. Please try again later.',
    ru: 'Не удалось загрузить данные. Попробуйте позже.',
    el: 'Αποτυχία φόρτωσης. Δοκιμάστε αργότερα.',
  },

  // AI button (Phase 2)
  aiButtonTitle: {
    en: 'Find a coach with AI',
    ru: 'Подобрать коуча с помощью AI',
    el: 'Βρείτε coach με AI',
  },
  aiButtonSubtitle: {
    en: '— 3-5 questions and we will find the right match',
    ru: '— 3–5 вопросов, и мы найдём подходящего',
    el: '— 3-5 ερωτήσεις και θα βρούμε τον κατάλληλο',
  },

  // Language names (for language filter chips)
  langRussian: {
    en: 'Russian',
    ru: 'Русский',
    el: 'Ρωσικά',
  },
  langEnglish: {
    en: 'English',
    ru: 'English',
    el: 'Αγγλικά',
  },
  langGreek: {
    en: 'Greek',
    ru: 'Ελληνικά',
    el: 'Ελληνικά',
  },
  langGerman: {
    en: 'German',
    ru: 'Немецкий',
    el: 'Γερμανικά',
  },

  // Filter actions
  filterClearAll: {
    en: 'Clear all',
    ru: 'Сбросить все',
    el: 'Καθαρισμός',
  },

  // Results count (placeholders: {shown}, {total})
  resultsCount: {
    en: 'Showing {shown} of {total} coaches',
    ru: 'Показано {shown} из {total} коучей',
    el: 'Εμφάνιση {shown} από {total} coaches',
  },

  // Price range labels
  priceUnder50: {
    en: '< \u20ac50',
    ru: '< \u20ac50',
    el: '< \u20ac50',
  },
  price50to100: {
    en: '\u20ac50\u2013100',
    ru: '\u20ac50\u2013100',
    el: '\u20ac50\u2013100',
  },
  price100to150: {
    en: '\u20ac100\u2013150',
    ru: '\u20ac100\u2013150',
    el: '\u20ac100\u2013150',
  },
  priceOver150: {
    en: '\u20ac150+',
    ru: '\u20ac150+',
    el: '\u20ac150+',
  },
};

/** @type {string} */
let currentLang = DEFAULT_LANG;

/**
 * Detect browser locale and map to supported language.
 * @returns {string} 'en' | 'ru' | 'el'
 */
function detectBrowserLanguage() {
  const nav = navigator.language || navigator.userLanguage || '';
  const code = nav.split('-')[0].toLowerCase();

  if (SUPPORTED_LANGS.includes(code)) {
    return code;
  }
  return DEFAULT_LANG;
}

/**
 * Initialize language from localStorage or browser locale.
 * @returns {string} The resolved language code
 */
export function initLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored && SUPPORTED_LANGS.includes(stored)) {
    currentLang = stored;
  } else {
    currentLang = detectBrowserLanguage();
    localStorage.setItem(STORAGE_KEY, currentLang);
  }

  return currentLang;
}

/**
 * Get translation for a key in the current language.
 * Falls back to English, then returns the key itself.
 * @param {string} key — dictionary key
 * @returns {string}
 */
export function t(key) {
  const entry = dictionary[key];
  if (!entry) {
    return key;
  }
  return entry[currentLang] || entry[DEFAULT_LANG] || key;
}

/**
 * Get current language code.
 * @returns {string} 'en' | 'ru' | 'el'
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Switch language, persist to localStorage, and update
 * all DOM elements with [data-i18n] attribute.
 * @param {string} lang — 'en' | 'ru' | 'el'
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    return;
  }

  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  updateDOM();
}

/**
 * Update all elements with [data-i18n] attribute to
 * reflect the current language.
 */
function updateDOM() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update data-i18n-placeholder for inputs
  const inputs = document.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update html lang attribute on the widget container
  const container = document.querySelector('.icf-registry');
  if (container) {
    container.setAttribute('lang', currentLang);
  }
}

export { SUPPORTED_LANGS, dictionary };
