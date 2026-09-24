// Search by what a coach works with — bios and specialization labels (G-031).
// Run: node tests/text-search.test.mjs
import { foldText, matchText } from '../src/js/text-search.js';
import { applyFilters, searchCoach } from '../src/js/filters.js';

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
  }
}

const finds = (coach, q, labels = []) =>
  assert(`"${q}" finds`, matchText(coach, labels, q) !== null);
const misses = (coach, q, labels = []) =>
  assert(`"${q}" misses`, matchText(coach, labels, q) === null);

// --- Folding keeps positions, so excerpts cut the original text correctly ---
for (const s of ['Выгорание, стресс!', 'Εξουθένωση και άγχος', 'Café — burnout']) {
  assert(`fold keeps length: ${s}`, foldText(s).length === s.length);
}
assert('ё folds to е', foldText('Ёлка') === 'елка');
assert('tonos is ignored', foldText('Ζωή') === 'ζωη');

// --- Bios ---
const ru = { bio1: 'Работаю с выгоранием, стрессом и сменой карьеры. Релокация на Кипр.' };
finds(ru, 'выгорание');
finds(ru, 'Выгоранием');
finds(ru, 'стресс');
finds(ru, 'релокация');
finds(ru, 'кипр');
finds(ru, 'выгорание стресс');       // every word, anywhere
misses(ru, 'выгорание лидерство');   // one word missing → no match
misses(ru, 'burnout');               // a translation is not a spelling

const en = { bio1: 'I help leaders through burnout and relocation.', bio2: 'Помогаю руководителям.' };
finds(en, 'Burnout');
finds(en, 'relocating');
finds(en, 'leader');
finds(en, 'руководитель');           // the second bio counts too
misses(en, 'lead generation');

const el = { bio1: 'Βοηθώ με την εξουθένωση και το άγχος.' };
finds(el, 'εξουθενωση');             // without the tonos
finds(el, 'ΆΓΧΟΣ');

// --- Short words match whole words only ---
const hr = { bio1: 'HR director, annual reviews, team coaching.' };
finds(hr, 'hr');
misses(hr, 'ann');
misses(hr, 'rev');
finds(hr, 'review');

// --- Nothing to search for ---
assert('empty query is no text match', matchText(ru, [], '') === null);
assert('one-letter query is no text match', matchText(ru, [], 'и') === null);

// --- Specialization labels, in any language ---
const plain = { bio1: 'Hello.' };
finds(plain, 'карьера', ['Career', 'Career', 'Карьера', 'Καριέρα']);
finds(plain, 'καριερα', ['Career', 'Career', 'Карьера', 'Καριέρα']);

// --- Excerpt ---
const long = {
  bio1: 'Over fifteen years I have worked with managers in banks, startups and '
    + 'family businesses, and most of them came to me with burnout that they '
    + 'had been ignoring for a long time before it caught up with them.',
};
const hit = matchText(long, [], 'burnout');
assert('excerpt marks the word', hit?.excerpt?.hit === 'burnout', JSON.stringify(hit));
assert('excerpt is cut in front', hit.excerpt.before.startsWith('…'));
assert('excerpt is cut behind', hit.excerpt.after.endsWith('…'));
assert('excerpt stays short',
  (hit.excerpt.before + hit.excerpt.hit + hit.excerpt.after).length < 140);
const fromLabel = matchText(plain, ['Career'], 'career');
assert('label-only hit has no excerpt', fromLabel && fromLabel.excerpt === null);
const inflected = matchText(ru, [], 'выгорание');
assert('excerpt shows the word as written', inflected.excerpt.hit === 'выгоранием',
  inflected.excerpt.hit);

// --- The catalogue: names first, then text ---
const coach = (name, bio1, specializations = []) => ({
  name, bio1, bio2: '', specializations, languages: [], format: 'online',
  icfLevel: 'PCC', priceMin: 0, priceMax: 0,
});
const maria = coach('Maria Stress', 'Leadership coach.');
const anna = coach('Анна Иванова', 'Помогаю при стрессе и выгорании.');
const olga = coach('Olga Petrova', 'Career transitions.', ['Career']);
const all = [anna, maria, olga];
const state = (name) => ({
  name, specializations: new Set(), languages: new Set(), formats: new Set(),
  levels: new Set(), priceRanges: new Set(),
});

const stress = applyFilters(all, state('stress'));
assert('name hit first, text hit after',
  stress.map((c) => c.name).join('|') === 'Maria Stress',
  stress.map((c) => c.name).join('|'));
const stressRu = applyFilters(all, state('стресс'));
// "Stress" in Cyrillic is also Maria's surname by skeleton: a name hit leads.
assert('Cyrillic query: name first, then bio',
  stressRu.map((c) => c.name).join('|') === 'Maria Stress|Анна Иванова',
  stressRu.map((c) => c.name).join('|'));
assert('no query → everybody, in order', applyFilters(all, state('')).length === 3);
assert('specialization label in Russian', searchCoach(olga, 'карьера')?.by === 'text');
assert('name search still works', searchCoach(anna, 'Anna')?.by === 'name');
assert('nobody', applyFilters(all, state('астрология')).length === 0);

const chips = state('стресс');
chips.levels.add('MCC');
assert('chips still narrow a search', applyFilters(all, chips).length === 0);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
