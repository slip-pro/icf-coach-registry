// Directory applications waiting for approval, counted for the membership desk (site BACKLOG #46).
// Run: node tests/apps-script-pending.test.mjs
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

const count = sandbox.countPending_;
const head = ["Status", "Name", "Email"];
eq("pending counted", count([head, ["pending", "A", "a@x"], ["approved", "B", "b@x"], ["Pending ", "C", "c@x"]]), 2);
eq("none waiting", count([head, ["approved", "B", "b@x"], ["rejected", "D", "d@x"]]), 0);
eq("blank status is not pending", count([head, ["", "E", "e@x"]]), 0);
eq("status column anywhere", count([["Name", "Status"], ["A", "pending"]]), 1);
eq("no status column", count([["Name"], ["A"]]), 0);
eq("empty sheet", count([]), 0);
eq("header only", count([head]), 0);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
