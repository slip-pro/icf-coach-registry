// The catalogue's order of this visitor's own (F-033): nobody is first for everybody.
// Run: node tests/catalogue-order.test.mjs
const { shuffled } = await import("../src/js/shuffle.js");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

const coaches = ["a", "b", "c", "d"];
const order = (seed) => shuffled(coaches, seed).join("");

eq("one visitor, one order", order(7), order(7));
eq("nobody lost or doubled", shuffled(coaches, 7).sort(), coaches);
eq("the list itself is left alone", coaches, ["a", "b", "c", "d"]);
eq("empty list", shuffled([], 3), []);
const seen = new Set(), firsts = {};
for (let seed = 1; seed <= 2400; seed++) { const o = order(seed); seen.add(o); firsts[o[0]] = (firsts[o[0]] || 0) + 1; }
eq("all 24 orders occur", seen.size, 24);
eq("each coach is first for about a quarter", Object.values(firsts).every((n) => n > 480 && n < 720), true);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
