// The registry's project mode (site BACKLOG #57): who is shown, in what order.
// Run: node tests/project-mode.test.mjs
const { projectSlug, projectCoaches } = await import("../src/js/project.js");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

eq("slug from the address", projectSlug("?project=WIT"), "wit");
eq("no project", projectSlug("?lang=ru"), "");
eq("odd characters refused", projectSlug("?project=../x"), "");

const catalogue = ["a", "b", "c", "d", "e"].map((n) => ({ name: n, email: `${n}@x.com` }));
const project = { coaches: [{ email: "A@x.com", placesLeft: 2 }, { email: "c@x.com", placesLeft: 1 }, { email: "e@x.com", placesLeft: 1 }, { email: "z@x.com", placesLeft: 1 }] };
const order = (seed) => projectCoaches(catalogue, project, seed).map((c) => c.name).join("");

eq("only the project's coaches, with places", projectCoaches(catalogue, project, 1).map((c) => [c.name, c.placesLeft]).sort(), [["a", 2], ["c", 1], ["e", 1]]);
eq("one visitor, one order", order(42), order(42));
const seen = new Set(), firsts = {};
for (let seed = 1; seed <= 600; seed++) { const o = order(seed); seen.add(o); firsts[o[0]] = (firsts[o[0]] || 0) + 1; }
eq("all six orders occur", seen.size, 6);
eq("each coach is first for about a third", Object.values(firsts).every((n) => n > 150 && n < 250), true);

// ---- waves: fewest clients first, the fully booked last, random within a wave
const waves = {
  coaches: [
    { email: "a@x.com", placesLeft: 1, taken: 1 },
    { email: "b@x.com", placesLeft: 3, taken: 0 },
    { email: "c@x.com", placesLeft: 0, taken: 1 },
    { email: "d@x.com", placesLeft: 4, taken: 1 },
    { email: "e@x.com", placesLeft: 1, taken: 0 },
  ],
};
const waveOrder = (seed) => projectCoaches(catalogue, { coaches: waves.coaches }, seed).map((c) => c.name).join("");
const waveOrders = new Set();
for (let seed = 1; seed <= 200; seed++) waveOrders.add(waveOrder(seed));
eq("no clients first, then one, the full one last", [...waveOrders].every((o) => /^[be]{2}[ad]{2}c$/.test(o)), true);
eq("within a wave the order varies", waveOrders.size, 4);
eq("a project file without the Taken column: plain shuffle, full last",
  [...new Set(Array.from({ length: 100 }, (_, s) => projectCoaches(catalogue, { coaches: waves.coaches.map(({ taken, ...c }) => c) }, s + 1).map((c) => c.name).join("").at(-1)))], ["c"]);
const { renderProjectAction } = await import("../src/js/project.js");
globalThis.document = { createElement: () => ({ set textContent(v) { this.innerHTML = v; } }) };
eq("no places count on the card", renderProjectAction({ placesLeft: 3 }, 0).includes("icf-project-places"), false);

// ---- a language set with no text under it must not blank the card
const { getBioForLanguage } = await import("../src/js/cards.js");
const emptyRu = { bio1: "Hello", bio1Lang: "en", bio2: "", bio2Lang: "ru" };
eq("empty Russian bio: the English one", getBioForLanguage(emptyRu, "ru"), "Hello");
eq("English asked: English", getBioForLanguage(emptyRu, "en"), "Hello");
eq("the language's own bio first", getBioForLanguage({ bio1: "Hello", bio1Lang: "en", bio2: "Привет", bio2Lang: "ru" }, "ru"), "Привет");
eq("no languages set: the first bio", getBioForLanguage({ bio1: "Hello", bio1Lang: "", bio2: "Привет", bio2Lang: "" }, "ru"), "Hello");
eq("only the second bio: that one", getBioForLanguage({ bio1: "", bio1Lang: "", bio2: "Привет", bio2Lang: "" }, "en"), "Привет");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
