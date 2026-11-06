/**
 * ICF Registry -- which language a coach's text is written in.
 *
 * Coaches imported before the forms asked for a language have two texts and no
 * language beside them. The card then had nothing to match the visitor's
 * language against, so the second text never showed (Nov 2026: five coaches).
 * The site's three languages use three different alphabets, so the letters tell.
 *
 * @module bio-language
 */

/**
 * @param {string} text
 * @returns {string} 'en', 'ru', 'el', or '' when the text has no letters to go by
 */
export function detectBioLanguage(text) {
  const value = text || '';
  const count = (pattern) => (value.match(pattern) || []).length;
  const counts = [
    ['ru', count(/[Ѐ-ӿ]/g)],
    ['el', count(/[Ͱ-Ͽἀ-῿]/g)],
    ['en', count(/[A-Za-zÀ-ɏ]/g)],
  ];
  const [lang, letters] = counts.reduce((best, next) => (next[1] > best[1] ? next : best));
  return letters > 0 ? lang : '';
}
