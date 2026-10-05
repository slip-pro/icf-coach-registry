// The two registry permissions (G-028), as the Apps Script writes and reads them.
// Run: node tests/apps-script-consent.test.mjs
// Loads docs/APPS_SCRIPT_FULL_CODE.js in a sandbox with a fake Submissions sheet.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");
const TODAY = "2026-10-03";
const sandbox = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSpreadsheetTimeZone: () => "Asia/Nicosia" }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) },
  Utilities: { formatDate: () => TODAY },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

/** A sheet as a 2-D array, with just the calls writeConsents_ makes. */
function fakeSheet(rows) {
  const cell = (r, c) => ({
    getValue: () => (rows[r - 1] ?? [])[c - 1] ?? "",
    setValue(v) { (rows[r - 1] ??= [])[c - 1] = v; return this; },
    setFontWeight() { return this; },
  });
  return {
    rows,
    getLastColumn: () => Math.max(...rows.map((r) => r.length)),
    getRange: (r, c, nr, nc) =>
      nr ? { getValues: () => [rows[r - 1].slice(c - 1, c - 1 + nc)] } : cell(r, c),
  };
}

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

// ---- a new registration on a sheet without the columns
const sheet = fakeSheet([["Status", "Name", "Email"], ["pending", "Anna", "a@x.com"]]);
sandbox.writeConsents_(sheet, 2, { publishConsent: true, socialConsent: false });
eq("columns added", sheet.rows[0], ["Status", "Name", "Email", "Publish consent", "Social media consent"]);
eq("publish dated, social no", sheet.rows[1].slice(3), [TODAY, "no"]);

// ---- re-saving keeps the first date; a later yes to social gets today's date
sheet.rows[1][3] = "2026-01-15";
sandbox.writeConsents_(sheet, 2, { publishConsent: true, socialConsent: true });
eq("first publish date kept", sheet.rows[1][3], "2026-01-15");
eq("social now dated", sheet.rows[1][4], TODAY);

// ---- an old frontend sends neither: nothing changes
const before = JSON.stringify(sheet.rows);
sandbox.writeConsents_(sheet, 2, {});
eq("no answers, no writes", JSON.stringify(sheet.rows), before);

// ---- reading back for the edit form and the catalogue
const headers = ["Status", "Name", "Publish consent", "Social media consent"];
eq("dated = yes", sandbox.consentAnswer_(headers, ["approved", "A", "2026-10-03", ""], ["Publish consent"]), "yes");
eq("blank = never asked", sandbox.consentAnswer_(headers, ["approved", "A", "2026-10-03", ""], ["Social media consent"]), "");
eq("no = no", sandbox.consentAnswer_(headers, ["approved", "A", "No", ""], ["Publish consent"]), "no");
eq("date cell = yes", sandbox.consentAnswer_(headers, ["approved", "A", new Date("2026-10-03T12:00:00Z"), ""], ["Publish consent"]), "yes");
eq("no column = never asked", sandbox.consentAnswer_(["Status", "Name"], ["approved", "A"], ["Publish consent"]), "");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
