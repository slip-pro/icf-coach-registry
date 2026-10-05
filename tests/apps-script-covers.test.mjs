// saveEventCover: a picture into an event folder's Cover, never twice, never outside the events root.
// Run: node tests/apps-script-covers.test.mjs
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
  catch (e) { if (pattern.test(e.message)) passed++; else { failed++; console.log(`FAIL: ${label} — threw "${e.message}"`); } }
}
const iter = (a) => { let i = 0; return { hasNext: () => i < a.length, next: () => a[i++] }; };
const folders = {};
function folder(id, parent) {
  const f = { id, parent, kids: [], files: [],
    getId: () => id, getParents: () => iter(parent ? [parent] : []),
    getFoldersByName: (n) => iter(f.kids.filter((k) => k.name === n)),
    createFolder: (n) => { const k = folder(id + "/" + n, f); k.name = n; f.kids.push(k); return k; },
    getFilesByName: (n) => iter(f.files.filter((x) => x.name === n)),
    createFile: (blob) => { f.files.push({ name: blob.name, type: blob.type, bytes: blob.bytes, isTrashed: () => false }); },
  };
  folders[id] = f; return f;
}
const root = folder("ROOT");
const event = root.createFolder("2026-05-27 Personal branding");
const elsewhere = folder("OTHER");
const store = { PEOPLE_API_SECRET: "s", EVENTS_ROOT_FOLDER_ID: "ROOT" };
const sb = {
  Logger: { log() {} },
  ContentService: { MimeType: { JSON: "json" }, createTextOutput: (t) => ({ setMimeType: () => JSON.parse(t) }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => store[k] ?? null }) },
  DriveApp: { getFolderById: (id) => { if (!folders[id]) throw new Error("no folder"); return folders[id]; } },
  Utilities: {
    base64Decode: (b) => [...Buffer.from(b, "base64")],
    newBlob: (bytes, type, name) => ({ bytes, type, name }),
  },
};
vm.createContext(sb); vm.runInContext(code, sb);
const pic = Buffer.from("jpeg bytes").toString("base64");

eq("saved", sb.saveEventCover_({ folderId: event.id, filename: "cover.jpg", base64: pic }), { success: true, saved: true });
const cover = event.kids.find((k) => k.name === "Cover");
eq("into Cover", cover.files.map((f) => [f.name, f.type]), [["cover.jpg", "image/jpeg"]]);
eq("bytes intact", Buffer.from(cover.files[0].bytes).toString(), "jpeg bytes");
eq("second time: left alone", sb.saveEventCover_({ folderId: event.id, filename: "cover.jpg", base64: pic }).saved, false);
eq("…still one file", cover.files.length, 1);
eq("png accepted", sb.saveEventCover_({ folderId: event.id, filename: "b.png", base64: pic }).saved, true);
eq("…as png", cover.files[1].type, "image/png");
throws("outside the events root", () => sb.saveEventCover_({ folderId: "OTHER", filename: "x.jpg", base64: pic }), /Not an event folder/);
throws("the root itself", () => sb.saveEventCover_({ folderId: "ROOT", filename: "x.jpg", base64: pic }), /Not an event folder/);
throws("not a picture", () => sb.saveEventCover_({ folderId: event.id, filename: "x.pdf", base64: pic }), /\.jpg or \.png/);
throws("no bytes", () => sb.saveEventCover_({ folderId: event.id, filename: "x.jpg", base64: "" }), /\.jpg or \.png/);
eq("handler needs the secret", sb.handleSaveEventCover({ secret: "no", folderId: event.id, filename: "z.jpg", base64: pic }).error, "Forbidden");
eq("handler with the secret", sb.handleSaveEventCover({ secret: "s", folderId: event.id, filename: "z.jpg", base64: pic }).saved, true);
eq("handler reports errors", sb.handleSaveEventCover({ secret: "s", folderId: "OTHER", filename: "z.jpg", base64: pic }).error, "Not an event folder");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
