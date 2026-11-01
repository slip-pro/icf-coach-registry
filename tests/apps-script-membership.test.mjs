// Who is paused in the catalogue: left the chapter, or "Member until" more
// than 30 days gone (G-029, F-034). Run: node tests/apps-script-membership.test.mjs
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

eq("30 days before", sandbox.isoDaysBefore_("2026-10-29", 30), "2026-09-29");
eq("across a year", sandbox.isoDaysBefore_("2026-01-10", 30), "2025-12-11");

sandbox.todayInSheetZone_ = () => "2026-10-29";
const member = (email, until, status = "active", memberId = "") => ({ email, memberUntil: until, status, memberId });
let roster = [];
sandbox.readRoster_ = () => roster;

const headers = ["Status", "Name", "Email", "Member ID"];
const paused = (email, id = "") => sandbox.membershipPaused_(sandbox.membershipIndex_(), headers, ["approved", "X", email, id]);

roster = [
  member("current@x.com", "2027-03-01"),
  member("grace@x.com", "2026-09-30"),      // 29 days ago: still listed
  member("edge@x.com", "2026-09-29"),       // exactly 30 days: still listed
  member("lapsed@x.com", "2026-09-28"),     // 31 days: paused
  member("left@x.com", "2027-03-01", "left"),
  member("nodate@x.com", ""),
  member("renewed@x.com", "2025-09-30"), member("renewed@x.com", "2026-09-30"),
  member("other@x.com", "2025-01-01", "active", "42"),
];
eq("current member listed", paused("current@x.com"), false);
eq("29 days after: listed", paused("grace@x.com"), false);
eq("exactly 30 days after: listed", paused("edge@x.com"), false);
eq("31 days after: paused", paused("lapsed@x.com"), true);
eq("Status = left: paused", paused("left@x.com"), true);
eq("no date: listed", paused("nodate@x.com"), false);
eq("an old row and a renewed one: listed", paused("renewed@x.com"), false);
eq("not in the roster (another chapter): listed", paused("stranger@x.com"), false);
eq("email case ignored", paused("LAPSED@x.com"), true);
eq("Member ID wins: lapsed by ID", paused("whatever@x.com", "42"), true);
eq("Member ID wins: current email does not save it", paused("current@x.com", "42"), true);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
