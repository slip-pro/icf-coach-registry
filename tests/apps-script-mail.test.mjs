// Letters from the script go through Brevo, with MailApp as the fallback (5 Oct 2026).
// Run: node tests/apps-script-mail.test.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../docs/APPS_SCRIPT_FULL_CODE.js", import.meta.url), "utf8");

let passed = 0, failed = 0;
function eq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`FAIL: ${label}\n  got      ${JSON.stringify(got)}\n  expected ${JSON.stringify(expected)}`); }
}

function world({ key = "", brevo = () => ({ code: 201 }), settings = [] } = {}) {
  const fetched = [], mailed = [];
  const book = {
    getSheetByName: (n) => n === "Settings" ? { getDataRange: () => ({ getValues: () => [["Key", "Value"], ...settings] }) } : null,
    getUrl: () => "https://sheet/registry",
  };
  const sandbox = {
    Logger: { log() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === "BREVO_API_KEY" ? key : null) }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    UrlFetchApp: { fetch: (url, opts) => {
      fetched.push({ url, opts });
      const r = brevo();
      if (r.throws) throw new Error(r.throws);
      return { getResponseCode: () => r.code, getContentText: () => "{}" };
    } },
    MailApp: { sendEmail: (m) => mailed.push(m) },
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { sb: sandbox, fetched, mailed };
}

const letter = { to: "coach@example.com", subject: "Edit your coach profile — ICF Cyprus", body: "Hello" };

{
  const w = world({ key: "k1" });
  eq("Brevo used when the key is set", w.sb.sendMail_(letter), "brevo");
  eq("…no MailApp", w.mailed.length, 0);
  const { url, opts } = w.fetched[0];
  const p = JSON.parse(opts.payload);
  eq("Brevo endpoint", url, "https://api.brevo.com/v3/smtp/email");
  eq("api key header", opts.headers["api-key"], "k1");
  eq("JSON body", opts.contentType, "application/json");
  eq("sender is the chapter address", p.sender, { name: "ICF Cyprus", email: "info@icf-cyprus.com" });
  eq("replies to membership desk", p.replyTo, { email: "membership@icf-cyprus.com" });
  eq("recipient", p.to, [{ email: "coach@example.com" }]);
  eq("subject keeps the dash as is", p.subject, "Edit your coach profile — ICF Cyprus");
  eq("plain text body", p.textContent, "Hello");
  eq("errors do not throw", opts.muteHttpExceptions, true);
}
{
  const w = world({ key: "k1", settings: [["SENDER_EMAIL", "hello@other.org"], ["SENDER_NAME", "Other"], ["REPLY_TO", "desk@other.org"]] });
  w.sb.sendMail_(letter);
  const p = JSON.parse(w.fetched[0].opts.payload);
  eq("sender from Settings", p.sender, { name: "Other", email: "hello@other.org" });
  eq("reply-to from Settings", p.replyTo, { email: "desk@other.org" });
}
{
  const w = world();
  eq("no key → MailApp", w.sb.sendMail_(letter), "mailapp");
  eq("…Brevo not called", w.fetched.length, 0);
  eq("…letter sent", w.mailed[0].to, "coach@example.com");
}
{
  const w = world({ key: "k1", brevo: () => ({ code: 401 }) });
  eq("Brevo refuses → MailApp", w.sb.sendMail_(letter), "mailapp");
  eq("…letter still sent", w.mailed.length, 1);
}
{
  const w = world({ key: "k1", brevo: () => ({ throws: "timeout" }) });
  eq("Brevo unreachable → MailApp", w.sb.sendMail_(letter), "mailapp");
}
eq("no MailApp.sendEmail outside sendMail_", (code.match(/MailApp\.sendEmail/g) || []).length, 1);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
