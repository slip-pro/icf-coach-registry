// /api/project: a project's places from the open file, and choosing through the Apps Script.
// Run: node tests/api-project.test.mjs
process.env.APPS_SCRIPT_URL = "https://script.example/exec";
process.env.CATALOGUE_SHEET_ID = "cat-id";
const { projectFromRows, forward, default: handler } = await import("../api/project.js");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}
function fakeRes() {
  const r = { headers: {}, code: 0, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}

const rows = [
  ["Project", "Project name", "Project status", "Coach email", "Places left"],
  ["wit", "Coaching with WIT Cyprus", "open", "Anna@x.com", "2"],
  ["wit", "Coaching with WIT Cyprus", "open", "bea@x.com", "0"],
  ["cim", "CIM", "closed", "anna@x.com", "1"],
];
eq("the project's coaches and places", projectFromRows(rows, "wit"), {
  slug: "wit", name: "Coaching with WIT Cyprus", status: "open",
  coaches: [{ email: "anna@x.com", placesLeft: 2 }, { email: "bea@x.com", placesLeft: 0 }],
});
eq("unknown project", projectFromRows(rows, "nope"), null);
eq("empty file", projectFromRows([], "wit"), null);

const realFetch = globalThis.fetch;
const answer = (data, ms = 0) => () => new Promise((resolve) =>
  setTimeout(() => resolve({ ok: true, text: async () => JSON.stringify(data) }), ms));

{
  let calls = 0;
  globalThis.fetch = (url, opts) => {
    calls++;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve({ ok: true, text: async () => JSON.stringify({ success: true, coachName: calls === 1 ? "slow" : "fast" }) }), calls === 1 ? 500 : 10);
      opts.signal?.addEventListener("abort", () => { clearTimeout(t); reject(new Error("aborted")); });
    });
  };
  const data = await forward({ action: "chooseCoach" }, { retryAfterMs: 50, timeoutMs: 2000 });
  eq("choose: a second try alongside a slow first, first answer wins", [data.coachName, calls], ["fast", 2]);
}
{
  let calls = 0;
  globalThis.fetch = (...a) => { calls++; return answer({ success: true })(...a); };
  await forward({ action: "joinProject" }, { retryAfterMs: 1, timeoutMs: 2000 });
  await new Promise((r) => setTimeout(r, 20));
  eq("join: one try only", calls, 1);
}
{
  globalThis.fetch = answer({ success: false, error: "coach_full" });
  const r = fakeRes();
  await handler({ method: "POST", body: { action: "chooseCoach", project: "wit" } }, r);
  eq("a refusal is passed on as it is", [r.code, r.body.error], [200, "coach_full"]);
}
{
  const r = fakeRes();
  await handler({ method: "POST", body: { action: "saveRoster" } }, r);
  eq("other actions are not let through", r.code, 400);
}
{
  let asked = "";
  globalThis.fetch = async (url) => { asked = url; return { ok: true, text: async () => rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n") }; };
  const r = fakeRes();
  await handler({ method: "GET", query: { slug: "WIT" } }, r);
  eq("GET reads the places tab", asked, "https://docs.google.com/spreadsheets/d/cat-id/gviz/tq?tqx=out:csv&sheet=Project%20places");
  eq("…and answers with the project, briefly cached", [r.code, r.body.project.coaches.length, r.headers["Cache-Control"]], [200, 2, "public, s-maxage=30, stale-while-revalidate=60"]);
}
globalThis.fetch = realFetch;

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
