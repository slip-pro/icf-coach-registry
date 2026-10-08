// The open catalogue file: what goes into it and when it is written.
// Run: node tests/apps-script-catalogue.test.mjs
// Loads docs/APPS_SCRIPT_FULL_CODE.js in a sandbox with fake sheets.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");
const props = { CATALOGUE_FILE: "cat-id" };
let locked = false;
const catalogue = { rows: [], writes: 0, format: "" };
const sandbox = {
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null }) },
  LockService: { getScriptLock: () => ({ tryLock: () => !locked, releaseLock() {} }) },
  SpreadsheetApp: {
    openById: () => ({
      getSheets: () => [{
        getDataRange: () => ({ getDisplayValues: () => catalogue.rows.map((r) => r.slice()) }),
        clearContents() { catalogue.rows = []; },
        getRange: () => ({
          setNumberFormat(f) { catalogue.format = f; return this; },
          setValues(v) { catalogue.rows = v.map((r) => r.slice()); catalogue.writes++; return this; },
        }),
      }],
    }),
  },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

const submissions = [
  ["Status", "Name", "Email", "WhatsApp", "Edit token note", "Publish consent"],
  ["approved", "Anna", "anna@x.com", "+357 99 123456", "secret", "2026-10-03"],
  ["pending", "Boris", "b@x.com", "", "", "2026-10-03"],
  ["approved", "Chloe", "c@x.com", "", "", "no"],
  ["", "Dora", "d@x.com", 35799000000, "", ""],
  ["approved", "", "nobody@x.com", "", "", ""],
];
sandbox.sheetFor_ = (tab) => (tab === "Submissions" ? { getDataRange: () => ({ getValues: () => submissions }) } : null);
sandbox.readRoster_ = () => [];

const cols = sandbox.PUBLIC_COACH_COLUMNS;
const at = (name) => cols.indexOf(name);

// ---- who and what goes in
const rows = sandbox.publicCoachRows_();
eq("approved, consenting, named: Anna and Dora", rows.map((r) => r[at("Name")]), ["Anna", "Dora"]);
eq("only the card's columns", rows[0].length, cols.length);
eq("a column not on the list stays out", JSON.stringify(rows).includes("secret"), false);
eq("numbers become text", rows[1][at("WhatsApp")], "35799000000");

// ---- writing the file
eq("first run writes", sandbox.publishCatalogue(), "written 2");
eq("as plain text", catalogue.format, "@");
eq("header row first", catalogue.rows[0], [...cols]);
eq("nothing new: no write", [sandbox.publishCatalogue(), catalogue.writes], ["unchanged", 1]);

submissions[2][0] = "approved";
eq("Boris approved: written again", sandbox.publishCatalogue(), "written 3");

locked = true;
eq("another run busy: skip", sandbox.publishCatalogue(), "busy");
locked = false;

delete props.CATALOGUE_FILE;
eq("before setupCatalogue: nothing", sandbox.publishCatalogue(), "no file");

// ---- comparing what is in the file with what should be
eq("trailing empty rows ignored", sandbox.catalogueChanged_([["a"], [""]], [["a"]]), false);
eq("a changed cell counts", sandbox.catalogueChanged_([["a"]], [["b"]]), true);

// ---- the edit trigger only cares about two tabs
let runs = 0;
const real = sandbox.publishCatalogue;
sandbox.publishCatalogue = () => { runs++; return "ok"; };
const edit = (tab) => ({ range: { getSheet: () => ({ getName: () => tab }) } });
sandbox.publishCatalogueOnEdit(edit("Submissions"));
sandbox.publishCatalogueOnEdit(edit("Members"));
sandbox.publishCatalogueOnEdit(edit("EditTokens"));
eq("Submissions and Members edits publish, others not", runs, 2);
sandbox.publishCatalogue = real;

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
