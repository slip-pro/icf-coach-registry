/**
 * ICF Registry — Name search matching
 *
 * Names in the registry are written in Russian or English, and the person
 * searching types in whichever script comes to hand. Transliteration is not
 * one-to-one (Юлия is Yulia, Julia and Iuliya), so instead of comparing
 * spellings we reduce both the stored name and the query to the same rough
 * skeleton and compare those. See BACKLOG G-027 for the reasoning.
 *
 * Skeleton, in order:
 *   1. lowercase; Cyrillic → Latin (fixed table below);
 *   2. strip accents (é → e, ά → α) and everything but letters and spaces;
 *      collapse whitespace;
 *   3. collapse the spellings that vary between transliteration schemes:
 *      word-initial chr/khr/hr→kr, kh→h, ks→x, ph→f, w→v, ck→k, shch→sch,
 *      ya/ja→ia, yu/ju→iu, yo/jo→io, leading ye/je→e, y/j→i, then any
 *      doubled letter → single.
 *
 * The match is a substring match on the skeleton: people type partial names,
 * and a surname alone should find somebody.
 *
 * Out of scope: real misspellings (fuzzy matching) and searching bios.
 *
 * @module name-search
 */

/** Cyrillic → Latin, one scheme, applied before the collapse step. */
const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Ukrainian / Belarusian letters that turn up in names
  і: 'i', ї: 'yi', є: 'ye', ґ: 'g', ў: 'u',
};

/**
 * Replace Cyrillic letters with their Latin counterparts.
 * Other characters pass through untouched.
 * @param {string} s — already lowercased
 * @returns {string}
 */
function transliterate(s) {
  let out = '';
  for (const ch of s) {
    out += ch in CYRILLIC ? CYRILLIC[ch] : ch;
  }
  return out;
}

/**
 * Collapse spelling variants that differ between transliteration schemes.
 * Order matters: digraphs first, single letters after, doubles last.
 * @param {string} s — lowercased Latin (or other non-Cyrillic) text
 * @returns {string}
 */
function collapseVariants(s) {
  return s
    .replace(/shch/g, 'sch')
    // Christina / Кристина / Христина, Christos / Кристос / Христос:
    // a word-initial Chr-, Khr-, Hr- all read as Kr-.
    .replace(/(^|\s)(?:ch|kh|h)r/g, '$1kr')
    .replace(/kh/g, 'h')
    .replace(/ks/g, 'x')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/w/g, 'v')
    .replace(/[yj]a/g, 'ia')
    .replace(/[yj]u/g, 'iu')
    .replace(/[yj]o/g, 'io')
    .replace(/(^|\s)[yj]e/g, '$1e')
    .replace(/[yj]/g, 'i')
    .replace(/(\p{L})\1+/gu, '$1');
}

/**
 * Reduce a name or a query to its comparable skeleton.
 * Exported for tests; the module's public contract is `matchesName`.
 *
 * @param {string} s
 * @returns {string} — empty string for empty / non-letter input
 */
export function nameSkeleton(s) {
  if (!s) return '';
  const lower = String(s).toLowerCase();
  const latin = transliterate(lower);
  const stripped = latin
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')       // accents, tonos, breves
    .replace(/[^\p{L}\s]+/gu, '')  // punctuation, digits, apostrophes
    .replace(/\s+/g, ' ')
    .trim();
  return collapseVariants(stripped);
}

/**
 * Does this coach's name match what the person typed?
 * An empty or whitespace-only query matches everybody.
 *
 * @param {string} name — the coach's name as written in the sheet
 * @param {string} query — what the visitor typed
 * @returns {boolean}
 */
export function matchesName(name, query) {
  const q = nameSkeleton(query);
  if (!q) return true;
  return nameSkeleton(name).includes(q);
}
