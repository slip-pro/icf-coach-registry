// Name search — skeleton matching across Cyrillic / Latin spellings.
// Run: node tests/name-search.test.mjs
import { nameSkeleton, matchesName } from '../src/js/name-search.js';

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

function same(a, b) {
  const sa = nameSkeleton(a);
  const sb = nameSkeleton(b);
  assert(`"${a}" ≡ "${b}"`, sa === sb, `${sa} vs ${sb}`);
}

// --- Spelling variants that must collapse to one skeleton ---
same('Юлия', 'Julia');
same('Юлия', 'Yulia');
same('Юлия', 'Iuliya');
same('Мария', 'Maria');
same('Мария', 'Mariya');
same('Наталья', 'Natalia');
same('Наталья', 'Natalya');
same('Татьяна', 'Tatiana');
same('Дмитрий', 'Dmitry');
same('Дмитрий', 'Dmitri');
same('Андрей', 'Andrei');
same('Андрей', 'Andrey');
same('Сергей', 'Sergej');
same('Алексей', 'Alexey');
same('Алексей', 'Aleksei');
same('Ксения', 'Xenia');
same('Ксения', 'Kseniya');
same('Оксана', 'Oxana');
same('Михаил', 'Mikhail');
same('Елена', 'Yelena');
same('Екатерина', 'Yekaterina');
same('Анна', 'Ana');
same('Жанна', 'Zhanna');
same('Ольга', 'Olga');
same('Игорь', 'Igor');
same('Юрий', 'Yuri');
same('Юрий', 'Yury');
same('Владимир', 'Wladimir');
same('Филипп', 'Philip');
same('Щукин', 'Shchukin');
same('Фёдор', 'Fedor');
same('Кристина', 'Christina');
same('Христина', 'Christina');
same('Христос', 'Christos');
same('Кристос', 'Christos');
same('Ирина', 'Iryna');
same('Любовь', 'Liubov');

// --- Accents and punctuation do not matter ---
same('Zoë', 'Zoe');
same("O'Brien", 'obrien');
same('Anna-Maria', 'annamaria');
same('  Anna   Smith ', 'anna smith');

// --- Greek stays Greek, minus the tonos ---
same('Μαρία', 'Μαρια');

// --- Matching: substring, whichever script ---
assert('surname alone finds the coach', matchesName('Мария Иванова', 'Ivanova'));
assert('partial first name finds the coach', matchesName('Maria Ivanova', 'Мар'));
assert('full name in the other script', matchesName('Юлия Петрова', 'Julia Petrova'));
assert('empty query matches everyone', matchesName('Anyone', ''));
assert('whitespace query matches everyone', matchesName('Anyone', '   '));
assert('punctuation-only query matches everyone', matchesName('Anyone', '-'));
assert('different name does not match', !matchesName('Maria Ivanova', 'Olga'));
assert('empty name never matches a real query', !matchesName('', 'Olga'));
assert('undefined name is tolerated', !matchesName(undefined, 'Olga'));

// --- Skeleton shape ---
assert('skeleton is lowercase Latin', nameSkeleton('ЮЛИЯ') === 'iulia', nameSkeleton('ЮЛИЯ'));
assert('empty in, empty out', nameSkeleton('') === '');

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
