/**
 * ICF Registry — Search by what a coach works with
 *
 * The search box finds a coach by name (name-search.js) and, failing that,
 * by words in what they wrote about themselves: both bios and the labels of
 * their specializations in every UI language, so "карьера" finds a coach who
 * ticked Career. See BACKLOG G-031.
 *
 * Unlike names, this is not transliterated: a bio is prose in one language,
 * and "burnout" will not find "выгорание" — that is a translation, not a
 * spelling. What it does handle:
 *   - case and accents (Greek tonos too) are ignored;
 *   - word endings: a longer query word is cut by a letter or two and matched
 *     as the start of a word, so "выгоранием" finds "выгорание" and
 *     "relocation" finds "relocating";
 *   - every word typed must be found (somewhere in the bios or labels);
 *   - words of three letters or fewer must match a whole word, so "HR" is
 *     found but "Ann" does not hit every "annual".
 *
 * @module text-search
 */

/** Fold one character: lowercase, accents off, anything but a letter or digit → space. */
function foldChar(ch) {
  const base = ch.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '');
  if (base.length !== 1 || !/[\p{L}\p{N}]/u.test(base)) return ' ';
  return base === 'ё' ? 'е' : base;
}

/**
 * Fold a whole text, one output character per input character, so a
 * position found in the folded text is the same position in the original.
 * @param {string} s
 * @returns {string}
 */
export function foldText(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) out += foldChar(s[i]);
  return out;
}

/**
 * The words of a query, each reduced to what must be found.
 * @param {string} query
 * @returns {{stem: string, whole: boolean}[]}
 */
export function queryWords(query) {
  return foldText(query || '')
    .split(' ')
    .filter((w) => w.length >= 2)
    .map((w) => {
      if (w.length <= 3) return { stem: w, whole: true };
      const cut = w.length >= 7 ? 2 : w.length >= 5 ? 1 : 0;
      return { stem: w.slice(0, w.length - cut), whole: false };
    });
}

/**
 * Where a word first occurs in a folded text, or -1.
 * @param {string} folded
 * @param {{stem: string, whole: boolean}} word
 * @returns {number}
 */
function findWord(folded, word) {
  let from = 0;
  for (;;) {
    const at = folded.indexOf(word.stem, from);
    if (at === -1) return -1;
    const startsWord = at === 0 || folded[at - 1] === ' ';
    const end = at + word.stem.length;
    const endsWord = end === folded.length || folded[end] === ' ';
    if (startsWord && (!word.whole || endsWord)) return at;
    from = at + 1;
  }
}

/**
 * Does the coach's own text contain every word of the query?
 * When it does and a bio carries the first word, returns a short excerpt
 * around it so the card can show why the coach turned up.
 *
 * @param {{bio1?: string, bio2?: string}} coach
 * @param {string[]} labels — specialization labels, all languages
 * @param {string} query
 * @returns {null | {excerpt: null | {before: string, hit: string, after: string}}}
 *   null when the coach does not match
 */
export function matchText(coach, labels, query) {
  const words = queryWords(query);
  if (words.length === 0) return null;

  const bios = [coach.bio1 || '', coach.bio2 || ''].filter(Boolean);
  const texts = [...bios, labels.join(' | ')];
  const folded = texts.map(foldText);
  const everyWord = words.every((w) => folded.some((f) => findWord(f, w) !== -1));
  if (!everyWord) return null;

  for (let i = 0; i < bios.length; i++) {
    const at = findWord(folded[i], words[0]);
    if (at !== -1) return { excerpt: excerptAround(bios[i], folded[i], at) };
  }
  return { excerpt: null };
}

/** About a line and a half of card text around position `at`, cut at word boundaries. */
function excerptAround(text, folded, at) {
  let end = at;
  while (end < folded.length && folded[end] !== ' ') end++;

  let start = Math.max(0, at - 40);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    start = space === -1 || space >= at ? start : space + 1;
  }
  let stop = Math.min(text.length, end + 70);
  if (stop < text.length) {
    const space = text.lastIndexOf(' ', stop);
    stop = space > end ? space : stop;
  }

  return {
    before: (start > 0 ? '…' : '') + text.slice(start, at),
    hit: text.slice(at, end),
    after: text.slice(end, stop) + (stop < text.length ? '…' : ''),
  };
}
