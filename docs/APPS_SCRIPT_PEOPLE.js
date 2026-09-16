/**
 * ICF Cyprus — people lists for the chapter website.
 *
 * Adds one action, `getPeople`, returning:
 *   - Board  — who may sign in to the website admin
 *   - Members — ICF members and when their membership runs out
 *
 * HOW TO INSTALL
 * 1. Open the chapter spreadsheet → Extensions → Apps Script.
 * 2. Paste everything below at the end of the existing script.
 * 3. In doPost, add one line next to the other actions:
 *
 *        } else if (action === 'getPeople') {
 *          return handleGetPeople(data);
 *
 * 4. In the Settings sheet add a row:  PEOPLE_API_SECRET | <a long random string>
 *    The website sends this with every request. Without it the endpoint refuses —
 *    the /exec URL is public, and these are people's email addresses.
 * 5. Deploy → Manage deployments → edit the existing deployment → New version.
 *    Keep the same URL so nothing else breaks.
 *
 * SHEETS THIS EXPECTS (create them if missing; the script also creates headers)
 *   "Board"    — Email | Name | Role
 *   "Members"  — Email | Name | Member until   (a real date, or blank)
 */

var BOARD_SHEET = 'Board';
var MEMBERS_SHEET = 'Members';

/**
 * Returns the board access list and the member roster.
 * Requires the shared secret from the Settings sheet.
 */
function handleGetPeople(data) {
  var settings = getSettings();
  var expected = (settings.PEOPLE_API_SECRET || '').toString().trim();

  if (!expected) {
    return jsonResponse({
      success: false,
      error: 'PEOPLE_API_SECRET is not set in the Settings sheet',
    });
  }
  if (((data && data.secret) || '').toString().trim() !== expected) {
    return jsonResponse({ success: false, error: 'Forbidden' });
  }

  return jsonResponse({
    success: true,
    board: readBoard_(),
    members: readMembers_(),
  });
}

/** Board members who may sign in to the website admin. */
function readBoard_() {
  var sheet = ensureSheet_(BOARD_SHEET, ['Email', 'Name', 'Role']);
  var rows = sheet.getDataRange().getValues();
  var out = [];

  for (var i = 1; i < rows.length; i++) {
    var email = (rows[i][0] || '').toString().trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) continue;
    out.push({
      email: email,
      name: (rows[i][1] || '').toString().trim(),
      role: (rows[i][2] || '').toString().trim(),
    });
  }
  return out;
}

/** ICF members and the date their membership runs out. */
function readMembers_() {
  var sheet = ensureSheet_(MEMBERS_SHEET, ['Email', 'Name', 'Member until']);
  var rows = sheet.getDataRange().getValues();
  var out = [];

  for (var i = 1; i < rows.length; i++) {
    var email = (rows[i][0] || '').toString().trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) continue;
    out.push({
      email: email,
      name: (rows[i][1] || '').toString().trim(),
      until: formatDate_(rows[i][2]),
    });
  }
  return out;
}

/** A cell may hold a real date or typed text; both must come out as YYYY-MM-DD. */
function formatDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, 'UTC', 'yyyy-MM-dd');
  }
  var text = value.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, 'UTC', 'yyyy-MM-dd');
  }
  return '';
}

/** Create the sheet with headers if somebody has not made it yet. */
function ensureSheet_(name, headers) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
