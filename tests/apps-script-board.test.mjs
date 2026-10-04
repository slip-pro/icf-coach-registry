// The board's "since" year, as the Apps Script reads it from the Board tab.
// Run: node tests/apps-script-board.test.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

const year = sandbox.boardYear_;
eq("typed number", year(2023), "2023");
eq("typed text", year("2025"), "2025");
eq("with words", year("since 2026"), "2026");
// A Date made inside the script's own realm, as Sheets would hand it over.
eq("Sheets made a date of it", year(vm.runInContext("new Date(2023, 5, 1)", sandbox)), "2023");
eq("empty cell", year(""), "");
eq("column added a moment ago", year(undefined), "");
eq("not a year", year("TBC"), "");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
