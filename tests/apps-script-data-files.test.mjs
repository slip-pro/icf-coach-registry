// Three data files under the chapter's account (site BACKLOG #34 / #53): tab routing, the secret,
// and the one-off setupDataFiles, against fake spreadsheets.
// Run: node tests/apps-script-data-files.test.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}
function throws(label, fn, pattern) {
  try { fn(); failed++; console.log(`FAIL: ${label} — did not throw`); }
  catch (e) {
    if (pattern.test(e.message)) passed++;
    else { failed++; console.log(`FAIL: ${label} — threw "${e.message}"`); }
  }
}

// ---------- fakes ----------
let nextId = 0;
function fakeSheet(name, rows = []) {
  return {
    name, rows: rows.map((r) => r.slice()),
    getName() { return this.name; },
    setName(n) { this.name = n; return this; },
    getDataRange() { const s = this; return { getValues: () => s.rows.map((r) => r.slice()) }; },
    getLastRow() { return this.rows.length; },
    getRange(row, col, n) { const s = this; return { getValues: () => s.rows.slice(row - 1, row - 1 + n).map((r) => [r[col - 1]]), setFontWeight() { return this; } }; },
    deleteRow(i) { this.rows.splice(i - 1, 1); },
    appendRow(r) { this.rows.push(r.slice()); },
    setFontWeight() { return this; },
    setFrozenRows() {},
    copyTo(book) { const c = fakeSheet("Copy of " + this.name, this.rows); book.sheets.push(c); return c; },
  };
}
function fakeBook(name, sheets = [], tz = "Etc/UTC") {
  const id = "id" + (++nextId);
  return {
    id, name, sheets, tz,
    getId: () => id, getUrl: () => "https://sheet/" + id,
    getSheets() { return this.sheets; },
    getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; },
    insertSheet(n) { const s = fakeSheet(n); this.sheets.push(s); return s; },
    deleteSheet(s) { this.sheets = this.sheets.filter((x) => x !== s); },
    getSpreadsheetTimeZone() { return this.tz; },
    setSpreadsheetTimeZone(z) { this.tz = z; },
  };
}
function fakeFolder(name, parent) {
  const children = [];
  const f = {
    name, children, files: [],
    getName: () => name, getUrl: () => "https://folder/" + name,
    getParents: () => ({ next: () => parent }),
    getFoldersByName(n) { const m = children.filter((c) => c.name === n); return { hasNext: () => m.length > 0, next: () => m[0] }; },
    createFolder(n) { return fakeFolder(n, f); },
  };
  if (parent) parent.children.push(f);
  return f;
}

function world({ props = {}, active = null, books = {}, folders = {} } = {}) {
  const store = { ...props };
  const created = [];
  const triggers = [];
  const sandbox = {
    Logger: { log() {} },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (k in store ? store[k] : null),
      setProperty: (k, v) => { store[k] = v; },
    }) },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => active,
      openById: (id) => { if (!books[id]) throw new Error("no file " + id); return books[id]; },
      create: (name) => { const b = fakeBook(name, [fakeSheet("Sheet1")]); books[b.id] = b; created.push(b); return b; },
    },
    DriveApp: {
      getFolderById: (id) => folders[id],
      getFileById: (id) => ({ moveTo: (folder) => folder.files.push(id) }),
    },
    ScriptApp: {
      getProjectTriggers: () => [],
      deleteTrigger() {},
      newTrigger: (fn) => ({
        timeBased: () => ({ everyMinutes: () => ({ create: () => triggers.push(fn) }) }),
        forSpreadsheet: (id) => ({ onEdit: () => ({ create: () => triggers.push(fn + " on edit of " + books[id].name) }) }),
      }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  sandbox.syncEventFolders = () => ({ stubbed: true });
  return { sb: sandbox, store, created, triggers, books };
}

// ---------- routing ----------
{
  const { sb } = world();
  eq("Submissions → registry", sb.fileForTab_("Submissions"), "registry");
  eq("EditTokens → registry", sb.fileForTab_("EditTokens"), "registry");
  eq("Members → registry", sb.fileForTab_("Members"), "registry");
  eq("Event plan → events", sb.fileForTab_("Event plan"), "events");
  eq("Event media → events", sb.fileForTab_("Event media"), "events");
  eq("Board → board", sb.fileForTab_("Board"), "board");
  eq("Partners → board", sb.fileForTab_("Partners"), "board");
  eq("Articles → board (owner, 5 Oct)", sb.fileForTab_("Articles"), "board");
  eq("Settings → board", sb.fileForTab_("Settings"), "board");
  eq("unknown tab → none", sb.fileForTab_("Scratch"), "");
  // every tab name the script uses is claimed by some file
  for (const t of [sb.BOARD_SHEET, sb.MEMBERS_SHEET, sb.EVENT_PLAN_SHEET, sb.EVENT_MEDIA_SHEET]) {
    eq(`${t} is claimed`, sb.fileForTab_(t) !== "", true);
  }
}

// before setup: everything from the active (bound) spreadsheet — the old project keeps working
{
  const old = fakeBook("old", [fakeSheet("Submissions"), fakeSheet("Board"), fakeSheet("Event plan")], "Asia/Nicosia");
  const { sb } = world({ active: old });
  eq("no IDs: Submissions from active", sb.bookFor_("Submissions").name, "old");
  eq("no IDs: Board from active", sb.bookFor_("Board").name, "old");
  eq("no IDs: zone from active", sb.sheetZone_(), "Asia/Nicosia");
}

// after setup: each tab from its own file
{
  const reg = fakeBook("reg", [fakeSheet("Submissions")]);
  const ev = fakeBook("ev", [fakeSheet("Event plan")]);
  const bd = fakeBook("bd", [fakeSheet("Settings", [["Key", "Value"], ["BRAND_NAME", "X"]])]);
  const { sb } = world({
    props: { DATA_FILE_REGISTRY: reg.id, DATA_FILE_EVENTS: ev.id, DATA_FILE_BOARD: bd.id },
    books: { [reg.id]: reg, [ev.id]: ev, [bd.id]: bd },
  });
  eq("Submissions from registry file", sb.bookFor_("Submissions").name, "reg");
  eq("Members from registry file", sb.bookFor_("Members").name, "reg");
  eq("Event plan from events file", sb.bookFor_("Event plan").name, "ev");
  eq("Settings from board file", sb.bookFor_("Settings").name, "bd");
  eq("unknown tab from board file", sb.bookFor_("Scratch").name, "bd");
  eq("settings read from board file", sb.getSettings().BRAND_NAME, "X");
  eq("ensureSheet_ creates in the right file", (sb.ensureSheet_("Members", ["Email"]), reg.getSheetByName("Members") !== null), true);
  eq("…and not in another", bd.getSheetByName("Members"), null);
}

// standalone with no IDs and no active spreadsheet — a clear error, not a null crash
{
  const { sb } = world();
  throws("standalone before setup", () => sb.bookFor_("Submissions"), /setupDataFiles/);
}

// ---------- secret ----------
{
  const old = fakeBook("old", [fakeSheet("Settings", [["Key", "Value"], ["PEOPLE_API_SECRET", "cell"]])]);
  eq("secret from Settings when no property", world({ active: old }).sb.peopleSecret_(), "cell");
  eq("property wins over Settings", world({ active: old, props: { PEOPLE_API_SECRET: " prop " } }).sb.peopleSecret_(), "prop");
  const w = world({ active: old, props: { PEOPLE_API_SECRET: "prop" } });
  eq("content secret: right", w.sb.contentSecretOk_({ secret: "prop" }), true);
  eq("content secret: old cell refused", w.sb.contentSecretOk_({ secret: "cell" }), false);
  const none = fakeBook("none", [fakeSheet("Settings", [["Key", "Value"]])]);
  eq("no secret anywhere refuses everything", world({ active: none }).sb.contentSecretOk_({ secret: "" }), false);
}

// ---------- setupDataFiles ----------
function oldWorld(extraProps = {}) {
  const root = fakeFolder("ICF Cyprus", null);
  const website = fakeFolder("Website", root);
  const photos = fakeFolder("Coach photos", website);
  const tabs = ["Submissions", "EditTokens", "Members", "Event plan", "Event media", "Board", "Partners", "Articles", "Notes"]
    .map((n) => fakeSheet(n, [["h"], [n + " row"]]));
  tabs.push(fakeSheet("Settings", [["Key", "Value"], ["PEOPLE_API_SECRET", "old"], ["DRIVE_FOLDER_COACHES", "https://drive.google.com/drive/folders/PHOTOS"], ["BRAND_NAME", "ICF Cyprus"]]));
  const source = fakeBook("old", tabs, "Asia/Nicosia");
  const w = world({
    props: { SOURCE_SHEET: "https://docs.google.com/spreadsheets/d/" + source.id + "/edit", PEOPLE_API_SECRET: "new", ...extraProps },
    books: { [source.id]: source },
    folders: { PHOTOS: photos },
  });
  return { ...w, root, source };
}

{
  const w = oldWorld();
  const report = w.sb.setupDataFiles();
  const byName = Object.fromEntries(w.created.map((b) => [b.name, b]));
  const names = (b) => b.getSheets().map((s) => s.getName());
  eq("three files", w.created.map((b) => b.name), ["Registry & membership", "Events & media", "Board, partners & settings"]);
  eq("registry tabs", names(byName["Registry & membership"]), ["Submissions", "EditTokens", "Members"]);
  eq("events tabs", names(byName["Events & media"]), ["Event plan", "Event media"]);
  eq("board tabs", names(byName["Board, partners & settings"]), ["Board", "Partners", "Articles", "Settings"]);
  eq("rows copied", byName["Registry & membership"].getSheetByName("Submissions").rows[1], ["Submissions row"]);
  eq("timezone copied", w.created.map((b) => b.tz), ["Asia/Nicosia", "Asia/Nicosia", "Asia/Nicosia"]);
  const settings = byName["Board, partners & settings"].getSheetByName("Settings").rows.map((r) => r[0]);
  eq("secret row removed from the new Settings", settings, ["Key", "DRIVE_FOLDER_COACHES", "BRAND_NAME"]);
  eq("old Settings untouched", w.source.getSheetByName("Settings").rows.length, 4);
  const data = w.root.children.find((c) => c.name === "Data");
  eq("Data folder next to Website", !!data, true);
  eq("all three files in Data", data.files.length, 3);
  eq("IDs stored", [w.store.DATA_FILE_REGISTRY, w.store.DATA_FILE_EVENTS, w.store.DATA_FILE_BOARD].map(Boolean), [true, true, true]);
  eq("routing uses the new files right after", w.sb.bookFor_("Members").name, "Registry & membership");
  eq("status colouring on the registry file, then the timer", w.triggers, ["colorByStatus on edit of Registry & membership", "syncEventFolders"]);
  eq("unclaimed tab reported", report.notCopied, ["Notes"]);
  throws("second run refused", () => w.sb.setupDataFiles(), /Already done/);
  eq("…and made nothing", w.created.length, 3);
}
throws("needs SOURCE_SHEET", () => oldWorld({ SOURCE_SHEET: "" }).sb.setupDataFiles(), /SOURCE_SHEET/);
throws("needs the secret first", () => oldWorld({ PEOPLE_API_SECRET: "" }).sb.setupDataFiles(), /PEOPLE_API_SECRET/);
{
  const w = oldWorld();
  w.root.createFolder("Data");
  w.sb.setupDataFiles();
  eq("existing Data folder reused", w.root.children.filter((c) => c.name === "Data").length, 1);
}

eq("version is a 2026-10-05 build", world().sb.SCRIPT_VERSION.startsWith("2026-10-05"), true);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
