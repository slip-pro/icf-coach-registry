// The event plan's Date column, as the Apps Script reads it.
// Run: node tests/apps-script-plan.test.mjs
// Loads docs/APPS_SCRIPT_FULL_CODE.js in a sandbox with just enough of the
// Google services stubbed for the date helpers to run.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");
const sandbox = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSpreadsheetTimeZone: () => "Asia/Nicosia" }) },
  Utilities: {
    formatDate: (d, tz, fmt) => {
      const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(d).map((x) => [x.type, x.value]));
      if (fmt !== "yyyy-MM-dd") throw new Error("unexpected format " + fmt);
      return `${p.year}-${p.month}-${p.day}`;
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}
const when = (text, value = text) => sandbox.planWhen_(value, text);
const D = (date, endDate = "") => ({ date, endDate, month: "" });
const M = (month) => ({ date: "", endDate: "", month });
const NONE = { date: "", endDate: "", month: "" };

// Every Date value in ICF_Cyprus_Events_2026_2027.xlsx (25 Sep 2026).
eq("range in a month", when("9–10 Oct 2026"), D("2026-10-09", "2026-10-10"));
eq("month", when("Oct 2026"), M("2026-10"));
eq("day", when("20 Oct 2026"), D("2026-10-20"));
eq("day 2", when("3 Nov 2026"), D("2026-11-03"));
eq("summit", when("13 Apr 2027"), D("2027-04-13"));
eq("season", when("Spring 2027"), NONE);
eq("undecided", when("2026/27 — TBC"), NONE);

// Other ways people type dates.
eq("range across months", when("30 Oct – 1 Nov 2026"), D("2026-10-30", "2026-11-01"));
eq("range across the new year", when("30 Dec – 2 Jan 2027"), D("2026-12-30", "2027-01-02"));
eq("full month name", when("November 2026"), M("2026-11"));
eq("hyphen range", when("9-10 Oct 2026"), D("2026-10-09", "2026-10-10"));
eq("iso text", when("2026-10-20"), D("2026-10-20"));
eq("not a month", when("Foo 2026"), NONE);
eq("empty", when(""), NONE);

// Sheets turned the text into a date on paste.
const oct20 = new Date("2026-10-20T00:00:00+03:00");
eq("real date shown with a day", when("20/10/2026", oct20), D("2026-10-20"));
const oct1 = new Date("2026-10-01T00:00:00+03:00");
eq("real date shown as a month stays a month", when("Oct 2026", oct1), M("2026-10"));

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
