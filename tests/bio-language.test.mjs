// A coach's text with no language beside it: the letters say which it is.
// Run: node tests/bio-language.test.mjs
import { detectBioLanguage } from "../src/js/bio-language.js";

import { fetchCoaches } from "../src/js/sheets.js";

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

eq("Russian", detectBioLanguage("Работаю с предпринимателями"), "ru");
eq("Greek", detectBioLanguage("Είμαι επαγγελματίας προπονητής"), "el");
eq("Greek, final sigma and accents", detectBioLanguage("Προπονητής ζωής"), "el");
eq("English", detectBioLanguage("I work with entrepreneurs"), "en");
eq("Russian with Latin titles in it stays Russian",
  detectBioLanguage("Коуч ICF PCC, работаю с предпринимателями и руководителями в эмиграции"), "ru");
eq("English with a Russian word in it stays English",
  detectBioLanguage("I work with leaders and teams, my motto is коучинг"), "en");
eq("no letters", detectBioLanguage(". 123 —"), "");
eq("empty", detectBioLanguage(""), "");
eq("nothing", detectBioLanguage(undefined), "");

// ---- as the page reads a coach
const HEADERS = ["Name", "Status", "Bio 1", "Bio 1 Language", "Bio 2", "Bio 2 Language"];
async function read(rows) {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: true, headers: HEADERS, rows }) });
  return fetchCoaches({ apiBase: "/api" });
}
const langs = (c) => [c.bio1Lang, c.bio2Lang];

const [noLangs, tagged, oneText, wrongOnPurpose] = await read([
  ["Iuliana", "approved", "Работаю с людьми", "", "I work with people", ""],
  ["Elena", "approved", "I work with people", "en", "Работаю с людьми", "ru"],
  ["Pauline", "approved", "I work with people", "", "", ""],
  ["Maria", "approved", "Short Latin text", "ru", "Текст", "en"],
]);
eq("two texts, no languages: both detected", langs(noLangs), ["ru", "en"]);
eq("languages already set are kept", langs(tagged), ["en", "ru"]);
eq("no second text: no second language", langs(oneText), ["en", ""]);
eq("a language the coach chose wins over the letters", langs(wrongOnPurpose), ["ru", "en"]);

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
