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
const project = { coaches: [{ email: "A@x.com", placesLeft: 2 }, { email: "c@x.com", placesLeft: 0 }, { email: "e@x.com", placesLeft: 1 }, { email: "z@x.com", placesLeft: 1 }] };
const order = (seed) => projectCoaches(catalogue, project, seed).map((c) => c.name).join("");

eq("only the project's coaches, with places", projectCoaches(catalogue, project, 1).map((c) => [c.name, c.placesLeft]).sort(), [["a", 2], ["c", 0], ["e", 1]]);
eq("one visitor, one order", order(42), order(42));
const seen = new Set(), firsts = {};
for (let seed = 1; seed <= 600; seed++) { const o = order(seed); seen.add(o); firsts[o[0]] = (firsts[o[0]] || 0) + 1; }
eq("all six orders occur", seen.size, 6);
eq("each coach is first for about a third", Object.values(firsts).every((n) => n > 150 && n < 250), true);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
