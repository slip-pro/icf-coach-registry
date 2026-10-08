// The catalogue proxy: a second try alongside a hung one (api/coaches.js).
// Run: node tests/api-coaches.test.mjs
process.env.APPS_SCRIPT_URL = "https://script.example/exec";
const { askAppsScript, default: handler } = await import("../api/coaches.js");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

/** Scripted tries: each answers `value` / throws `error` after `ms`, unless aborted. */
function script(steps) {
  const log = { started: 0, aborted: 0 };
  const ask = (signal) => {
    const step = steps[log.started++];
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => (step.error ? reject(step.error) : resolve(step.value)), step.ms);
      signal.addEventListener("abort", () => { clearTimeout(t); log.aborted++; reject(new Error("aborted")); });
    });
  };
  return { ask, log };
}
const ok = (n) => ({ success: true, headers: ["Name"], rows: [[n]] });

{
  const s = script([{ ms: 5, value: ok("a") }]);
  eq("quick: one try", [(await askAppsScript({ ask: s.ask, hedgeMs: 50 })).rows, s.log.started], [[["a"]], 1]);
}
{
  const s = script([{ ms: 1000, value: ok("slow") }, { ms: 5, value: ok("fast") }]);
  const t = Date.now();
  const data = await askAppsScript({ ask: s.ask, hedgeMs: 50 });
  eq("hung first: second wins", data.rows, [["fast"]]);
  eq("…quickly", Date.now() - t < 400, true);
  eq("…hung one aborted", s.log.aborted, 1);
}
{
  const s = script([{ ms: 5 }, { ms: 5, value: ok("b") }]);
  eq("fast miss: next at once", (await askAppsScript({ ask: s.ask, hedgeMs: 5000 })).rows, [["b"]]);
}
{
  const s = script([{ ms: 5, error: Object.assign(new Error("Forbidden"), { final: true }) }, { ms: 5, value: ok("x") }]);
  let msg = "";
  try { await askAppsScript({ ask: s.ask, hedgeMs: 50 }); } catch (e) { msg = e.message; }
  eq("final refusal: stop", [msg, s.log.started], ["Forbidden", 1]);
}
{
  const s = script([{ ms: 5, error: new Error("timeout") }, { ms: 5 }, { ms: 5, error: new Error("timeout") }]);
  let msg = "";
  try { await askAppsScript({ ask: s.ask, hedgeMs: 50 }); } catch (e) { msg = e.message; }
  eq("all three miss: error", [msg, s.log.started], ["timeout", 3]);
}

// handler: a failure after one good answer serves that answer, briefly cached
function fakeRes() {
  const r = { headers: {}, code: 0, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}
const realFetch = globalThis.fetch;
{
  globalThis.fetch = async () => ({ ok: true, text: async () => JSON.stringify(ok("live")) });
  const r = fakeRes(); await handler({ method: "GET" }, r);
  eq("live answer", [r.code, r.body.rows, r.headers["Cache-Control"]], [200, [["live"]], "public, s-maxage=300, stale-while-revalidate=86400"]);
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  const r2 = fakeRes(); await handler({ method: "GET" }, r2);
  eq("script down: last good, short cache", [r2.code, r2.body.rows, r2.headers["Cache-Control"]], [200, [["live"]], "public, s-maxage=30, stale-while-revalidate=86400"]);
}

// a fresh instance (a deploy, a cold start) with the script down: the saved copy
{
  const cold = await import("../api/coaches.js?cold");
  const writes = [];
  cold.savedCopy.write = async (json) => { writes.push(json); };
  cold.savedCopy.read = async () => ({ headers: ["Name"], rows: [["saved"]] });
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  const r = fakeRes(); await cold.default({ method: "GET" }, r);
  eq("cold, script down: saved copy, short cache", [r.code, r.body.rows, r.headers["Cache-Control"]], [200, [["saved"]], "public, s-maxage=30, stale-while-revalidate=86400"]);

  globalThis.fetch = async () => ({ ok: true, text: async () => JSON.stringify(ok("new")) });
  await cold.default({ method: "GET" }, fakeRes());
  await cold.default({ method: "GET" }, fakeRes());
  eq("live answer saved once while unchanged", writes, [JSON.stringify({ headers: ["Name"], rows: [["new"]] })]);
}
{
  const cold = await import("../api/coaches.js?cold-nothing");
  cold.savedCopy.read = async () => { throw new Error("no store"); };
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  const r = fakeRes(); await cold.default({ method: "GET" }, r);
  eq("cold, script down, no saved copy: 502", r.code, 502);
}
{
  const cold = await import("../api/coaches.js?cold-failing-save");
  cold.savedCopy.write = async () => { throw new Error("store down"); };
  globalThis.fetch = async () => ({ ok: true, text: async () => JSON.stringify(ok("live")) });
  const r = fakeRes(); await cold.default({ method: "GET" }, r);
  eq("save fails: page still served", [r.code, r.body.rows], [200, [["live"]]]);
}
// a hung script on a cold instance: the saved copy right away, the live answer saved later
{
  const cold = await import("../api/coaches.js?cold-hung");
  const writes = [];
  cold.savedCopy.write = async (json) => { writes.push(json); };
  cold.savedCopy.read = async () => ({ headers: ["Name"], rows: [["saved"]] });
  globalThis.fetch = () => new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, text: async () => JSON.stringify(ok("late")) }), 300));
  const t = Date.now();
  const r = fakeRes(); await cold.default({ method: "GET" }, r, { serveSavedAfterMs: 50 });
  eq("hung script: saved copy, short cache", [r.code, r.body.rows, r.headers["Cache-Control"]], [200, [["saved"]], "public, s-maxage=30, stale-while-revalidate=86400"]);
  eq("…without waiting for it", Date.now() - t < 250, true);
  await new Promise((resolve) => setTimeout(resolve, 400));
  eq("…its late answer still saved", writes, [JSON.stringify({ headers: ["Name"], rows: [["late"]] })]);
}
{
  const cold = await import("../api/coaches.js?cold-hung-nothing");
  cold.savedCopy.read = async () => null;
  cold.savedCopy.write = async () => {};
  globalThis.fetch = () => new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, text: async () => JSON.stringify(ok("late")) }), 150));
  const r = fakeRes(); await cold.default({ method: "GET" }, r, { serveSavedAfterMs: 50 });
  eq("slow script, nothing saved: waits for it", [r.code, r.body.rows], [200, [["late"]]]);
}
// the open catalogue file (CATALOGUE_SHEET_ID): CSV parsing and reading
{
  const { parseCsv } = await import("../api/coaches.js");
  eq("csv: plain", parseCsv("Name,Email\nAnna,a@x\n"), [["Name", "Email"], ["Anna", "a@x"]]);
  eq("csv: quoted comma, line break, quote", parseCsv('Name,Bio\r\n"Anna","Hi, I\'m\n""Anna"""\r\n'), [["Name", "Bio"], ["Anna", 'Hi, I\'m\n"Anna"']]);
  eq("csv: empty cells", parseCsv("Name,A,B\nX,,\n"), [["Name", "A", "B"], ["X", "", ""]]);

  process.env.CATALOGUE_SHEET_ID = "cat-id";
  const file = await import("../api/coaches.js?file");
  file.savedCopy.write = async () => {};
  let asked = "";
  globalThis.fetch = async (url) => {
    asked = url;
    return { ok: true, headers: new Map([["content-type", "text/csv"]]), text: async () => "Name,Email\nAnna,a@x\n,\n" };
  };
  const r = fakeRes(); await file.default({ method: "GET" }, r);
  eq("file: read from Google as CSV", asked, "https://docs.google.com/spreadsheets/d/cat-id/export?format=csv");
  eq("file: rows, blank ones dropped", [r.code, r.body.headers, r.body.rows], [200, ["Name", "Email"], [["Anna", "a@x"]]]);

  const notShared = await import("../api/coaches.js?file-not-shared");
  notShared.savedCopy.read = async () => ({ headers: ["Name"], rows: [["saved"]] });
  let tries = 0;
  globalThis.fetch = async () => { tries++; return { ok: true, headers: new Map([["content-type", "text/html"]]), text: async () => "<html>" }; };
  const r2 = fakeRes(); await notShared.default({ method: "GET" }, r2);
  eq("file not shared: one try, saved copy", [tries, r2.code, r2.body.rows], [1, 200, [["saved"]]]);
  delete process.env.CATALOGUE_SHEET_ID;
}
globalThis.fetch = realFetch;

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
