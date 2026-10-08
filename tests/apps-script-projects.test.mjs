// Coaching projects (site BACKLOG #57): coaches join, a participant chooses her coach.
// Run: node tests/apps-script-projects.test.mjs
// Loads docs/APPS_SCRIPT_FULL_CODE.js in a sandbox with fake sheets, Fienta and mail.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");

/** A tab as a 2-D array, with the calls readTable_ and appendObject_ make. */
function fakeSheet(rows) {
  return {
    rows,
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()), getDisplayValues: () => rows.map((r) => r.map(String)) }),
    appendRow(r) { rows.push(r.slice()); },
    clearContents() { rows.length = 0; },
    getRange: () => ({ setNumberFormat() { return this; }, setValues(v) { rows.push(...v.map((r) => r.slice())); return this; } }),
  };
}

function world({ fienta = {}, project = {} } = {}) {
  const projects = fakeSheet([
    ["Slug", "Name", "Partner", "Lead name", "Lead email", "Status", "Fienta event ID", "Sessions", "Session minutes", "Places per coach", "Description"],
    ["wit", "Coaching with WIT Cyprus", "WIT Cyprus", "Aleksandra", "lead@icf.test", project.status ?? "open", project.event ?? "777", "3", "60", "2", ""],
  ]);
  const coaches = fakeSheet([
    ["Project", "Coach email", "Coach name", "Status", "Places", "Joined at"],
    ["wit", "anna@x.com", "Anna", "accepted", "", ""],
    ["wit", "bea@x.com", "Bea", "accepted", "1", ""],
    ["wit", "cleo@x.com", "Cleo", "pending", "", ""],
  ]);
  const matches = fakeSheet([["Project", "Ticket", "Participant name", "Participant email", "Coach email", "Coach name", "Chosen at", "Consent", "Status", "Notes"]]);
  const places = fakeSheet([]);
  const submissions = [
    ["Status", "Name", "Email"],
    ["approved", "Dora", "dora@x.com"],
    ["pending", "Eva", "eva@x.com"],
    ["approved", "Anna", "anna@x.com"],
  ];
  const book = { getSheetByName: (n) => ({ Projects: projects, "Project coaches": coaches, Matches: matches })[n] || null };
  const mails = [], fetches = [];
  const sb = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => ({ PROJECTS_FILE: "proj", CATALOGUE_FILE: "cat", FIENTA_API_KEY: "key" })[k] ?? null }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    SpreadsheetApp: { openById: (id) => (id === "proj" ? book : { getSheetByName: (n) => (n === "Project places" ? places : null), insertSheet: () => places }) },
    ContentService: { createTextOutput: (t) => ({ setMimeType: () => JSON.parse(t) }), MimeType: { JSON: "json" } },
    Utilities: { formatDate: () => "2026-10-20" },
    Logger: { log() {} },
    UrlFetchApp: {
      fetch(url, opts = {}) {
        fetches.push({ url, method: opts.method || "get", body: opts.payload });
        const code = url.split("/tickets/")[1];
        const t = fienta[decodeURIComponent(code)];
        if (opts.method === "put") return { getResponseCode: () => 200, getContentText: () => "{}" };
        if (!t) return { getResponseCode: () => 404, getContentText: () => "{}" };
        return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ticket: t }) };
      },
    },
  };
  vm.createContext(sb);
  vm.runInContext(code, sb);
  sb.sendMail_ = (m) => { mails.push(m); return "brevo"; };
  sb.getSettings = () => ({ SENDER_NAME: "ICF Cyprus", REPLY_TO: "membership@icf.test" });
  sb.sheetFor_ = (tab) => (tab === "Submissions" ? { getDataRange: () => ({ getValues: () => submissions }) } : null);
  sb.formatDate_ = () => "2026-10-20";
  return { sb, projects, coaches, matches, places, mails, fetches };
}

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

const good = { event_id: 777, status: "UNUSED", order_email: "buyer@x.com" };
const choose = (w, extra = {}) => w.sb.handleChooseCoach({
  project: "wit", coachEmail: "anna@x.com", name: "Mia", email: "mia@x.com", ticket: "abc123", consent: true, ...extra,
});

// ---- places
{
  const w = world();
  const p = w.sb.findProject_("WIT");
  eq("accepted coaches only, default or own places",
    w.sb.projectPlaces_(p, w.sb.readTable_("Project coaches").rows, []).map((c) => [c.email, c.placesLeft]),
    [["anna@x.com", 2], ["bea@x.com", 1]]);
  const taken = [{ Project: "wit", "Coach email": "Anna@x.com", Status: "active" }, { Project: "wit", "Coach email": "anna@x.com", Status: "replaced" }];
  eq("a replaced match frees its place", w.sb.projectPlaces_(p, w.sb.readTable_("Project coaches").rows, taken)[0].placesLeft, 1);
}

// ---- choosing: the happy path
{
  const w = world({ fienta: { ABC123: good } });
  const r = choose(w);
  eq("chosen", [r.success, r.coachName], [true, "Anna"]);
  eq("match row written", w.matches.rows[1].slice(0, 6), ["wit", "ABC123", "Mia", "mia@x.com", "anna@x.com", "Anna"]);
  eq("ticket marked used in Fienta", w.fetches.filter((f) => f.method === "put").map((f) => [f.url, JSON.parse(f.body).status]),
    [["https://fienta.com/api/v1/tickets/ABC123", "USED"]]);
  eq("letters to both, replies to the lead", w.mails.map((m) => [m.to, m.replyTo]), [["mia@x.com", "lead@icf.test"], ["anna@x.com", "lead@icf.test"]]);
  eq("places tab: Anna has one left", w.places.rows.filter((r) => r[3] === "anna@x.com").map((r) => r[4]), ["1"]);

  const again = choose(w, { coachEmail: "bea@x.com" });
  eq("same ticket again: the first match, nothing new", [again.success, again.already, again.coachName, w.matches.rows.length], [true, true, "Anna", 2]);
}

// ---- choosing: refusals
{
  const w = world({ fienta: { USED1: { ...good, status: "USED" }, OTHER: { ...good, event_id: 5 } } });
  eq("unknown ticket", choose(w, { ticket: "nope" }).error, "ticket_not_found");
  eq("used ticket", choose(w, { ticket: "used1" }).error, "ticket_used");
  eq("ticket of another event", choose(w, { ticket: "other" }).error, "ticket_other_event");
  eq("no consent", choose(w, { consent: "yes" }).error, "consent_required");
  eq("no ticket", choose(w, { ticket: "" }).error, "ticket_required");
  eq("bad email", choose(w, { email: "mia" }).error, "name_email_required");
  eq("pending coach cannot be chosen", choose(w, { coachEmail: "cleo@x.com" }).error, "coach_not_in_project");
  eq("nothing written", w.matches.rows.length, 1);
}
{
  const w = world({ fienta: { T1: good, T2: good } });
  eq("Bea's one place taken", choose(w, { ticket: "t1", coachEmail: "bea@x.com" }).success, true);
  eq("Bea full", choose(w, { ticket: "t2", coachEmail: "bea@x.com" }).error, "coach_full");
}
{
  const w = world({ project: { status: "draft" } });
  eq("draft project: closed", choose(w).error, "project_closed");
}
{
  const w = world({ project: { event: "" } });
  const r = choose(w, { ticket: "" });
  eq("free project: no ticket, no Fienta", [r.success, w.fetches.length], [true, 0]);
  eq("…one choice per email", choose(w, { ticket: "", coachEmail: "bea@x.com" }).already, true);
}

// ---- coaches joining
{
  const w = world();
  eq("registry coach joins: pending", w.sb.handleJoinProject({ project: "wit", email: "Dora@x.com" }), { success: true, status: "pending" });
  eq("row added", w.coaches.rows[4].slice(0, 4), ["wit", "dora@x.com", "Dora", "pending"]);
  eq("letters to the lead and the coach", w.mails.map((m) => m.to), ["lead@icf.test", "dora@x.com"]);
  eq("twice: no second row", [w.sb.handleJoinProject({ project: "wit", email: "dora@x.com" }).status, w.coaches.rows.length], ["pending", 5]);
  eq("accepted coach asking again sees accepted", w.sb.handleJoinProject({ project: "wit", email: "anna@x.com" }).status, "accepted");
  eq("not an approved registry coach", w.sb.handleJoinProject({ project: "wit", email: "eva@x.com" }).error, "not_in_registry");
}

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
