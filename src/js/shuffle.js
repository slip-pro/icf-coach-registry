/**
 * ICF Registry — an order of this visitor's own.
 *
 * The catalogue (F-033) and the project page (site BACKLOG #57) both show
 * coaches shuffled per visitor, so nobody is first for everybody. One seed per
 * browser tab, kept in sessionStorage: the order holds while the visitor
 * filters, switches language or reloads, and a new visit gets a new one.
 */

/** A small seeded generator, so one visitor keeps one order across re-renders. */
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** This tab's seed under `key`, made on first use. */
export function visitorSeed(key) {
  try {
    const kept = Number(sessionStorage.getItem(key));
    if (kept) return kept;
    const fresh = Math.floor(Math.random() * 2 ** 31) + 1;
    sessionStorage.setItem(key, String(fresh));
    return fresh;
  } catch (_err) {
    return Math.floor(Math.random() * 2 ** 31) + 1;
  }
}

/** A shuffled copy of `list` (Fisher–Yates); the same seed gives the same order. */
export function shuffled(list, seed) {
  const out = list.slice();
  const random = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
