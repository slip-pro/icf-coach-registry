/**
 * ============================================================
 * Coach Registry — Google Apps Script
 * ============================================================
 * ИНСТРУКЦИЯ: Скопируйте ВЕСЬ этот файл и вставьте в Apps Script.
 * Удалите ВСЁ старое содержимое перед вставкой.
 * После вставки: Deploy → Manage deployments → ✏️ → New version → Deploy
 *
 * НАСТРОЙКИ: Создайте лист "Settings" в Google Sheet:
 *   A1: Key              B1: Value
 *   A2: SENDER_NAME      B2: ICF Cyprus
 *   A3: ADMIN_EMAIL      B3: admin@example.com
 *   A4: SITE_URL         B4: https://coaches.icf-cyprus.com
 *   A5: EDIT_PAGE        B5: /src/edit.html
 *   A6: DRIVE_FOLDER     B6: https://drive.google.com/drive/folders/XXXXX
 *   A7: REGISTRY_NAME    B7: ICF Cyprus Coach Registry
 *   A8: BRAND_NAME       B8: ICF Cyprus
 *   A9: COLOR_PRIMARY    B9: #212251
 *  A10: COLOR_SECONDARY B10: #2b379b
 *  A11: COLOR_ACCENT    B11: #efcb30
 *  A12: COLOR_SURFACE   B12: #f8f0e4
 *  A13: FONT_HEADING    B13: Nunito
 *  A14: FONT_BODY       B14: Plus Jakarta Sans
 *  A15: LOCATION        B15: Cyprus
 *  A16: COUNTRY_CODE    B16: +357
 *  A17: SHEET_URL       B17: https://docs.google.com/spreadsheets/d/XXXXX/edit
 *  A18: LOGO_URL        B18: https://drive.google.com/thumbnail?id=XXXXX&sz=w200
 * ============================================================
 */

// ==================== SETTINGS ====================

/**
 * Read settings from the "Settings" sheet.
 * Returns an object with key-value pairs.
 * Falls back to defaults if sheet or key is missing.
 */
/**
 * Extract Google Drive folder ID from a full URL or plain ID.
 * Accepts:
 *   https://drive.google.com/drive/folders/ABC123
 *   https://drive.google.com/drive/u/0/folders/ABC123
 *   ABC123
 */
function parseDriveFolderId(value) {
  if (!value) return '';
  var match = value.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Already a plain ID (no slashes)
  if (value.indexOf('/') === -1) return value;
  return value;
}

/**
 * Extract Google Sheet ID from a full URL or plain ID.
 * Accepts:
 *   https://docs.google.com/spreadsheets/d/ABC123/edit
 *   https://docs.google.com/spreadsheets/d/ABC123/edit#gid=0
 *   ABC123
 */
function parseSheetId(value) {
  if (!value) return '';
  var match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (value.indexOf('/') === -1) return value;
  return value;
}

function getSettings() {
  var defaults = {
    SENDER_NAME: 'ICF Cyprus',
    ADMIN_EMAIL: '',
    SITE_URL: 'https://coaches.icf-cyprus.com',
    EDIT_PAGE: '/src/edit.html',
    DRIVE_FOLDER: 'https://drive.google.com/drive/folders/1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr',
    REGISTRY_NAME: 'ICF Cyprus Coach Registry',
    BRAND_NAME: 'ICF Cyprus',
    COLOR_PRIMARY: '#212251',
    COLOR_SECONDARY: '#2b379b',
    COLOR_ACCENT: '#efcb30',
    COLOR_SURFACE: '#f8f0e4',
    FONT_HEADING: 'Nunito',
    FONT_BODY: 'Plus Jakarta Sans',
    LOCATION: 'Cyprus',
    COUNTRY_CODE: '+357',
    SHEET_URL: '',
    LOGO_URL: '',
  };

  var settingsSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Settings');

  if (!settingsSheet) return defaults;

  var data = settingsSheet.getDataRange().getValues();
  var settings = {};
  for (var key in defaults) {
    settings[key] = defaults[key];
  }
  for (var i = 1; i < data.length; i++) {
    var k = (data[i][0] || '').toString().trim();
    var v = (data[i][1] || '').toString().trim();
    if (k && v) {
      settings[k] = v;
    }
  }

  // Parse URLs into IDs for internal use
  settings.DRIVE_FOLDER_ID =
    parseDriveFolderId(settings.DRIVE_FOLDER);
  settings.SHEET_ID =
    parseSheetId(settings.SHEET_URL);

  // Fallback: check Script Properties for ADMIN_EMAIL
  if (!settings.ADMIN_EMAIL) {
    var prop = PropertiesService
      .getScriptProperties()
      .getProperty('ADMIN_EMAIL');
    if (prop) settings.ADMIN_EMAIL = prop;
  }

  return settings;
}

// ==================== MAIN DISPATCHER ====================

/**
 * Main entry point — dispatches based on action field.
 * Backwards-compatible: requests without action are treated
 * as registration submissions.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'register';

    if (action === 'register') {
      return handleRegister(data);
    } else if (action === 'requestEditLink') {
      return handleRequestEditLink(data);
    } else if (action === 'verifyToken') {
      return handleVerifyToken(data);
    } else if (action === 'saveProfile') {
      return handleSaveProfile(data);
    } else if (action === 'getConfig') {
      return handleGetConfig();
    } else if (action === 'getPeople') {
      return handleGetPeople(data);
    }

    return jsonResponse({
      success: false,
      error: 'Unknown action',
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message,
    });
  }
}

/**
 * GET handler — returns public config for frontend.
 * URL: https://script.google.com/.../exec?action=getConfig
 */
function doGet(e) {
  var action = (e.parameter.action || '').trim();
  if (action === 'getConfig') {
    return handleGetConfig();
  }
  return jsonResponse({
    success: false,
    error: 'Unknown action',
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== CONFIG ====================

/**
 * Return public frontend config from Settings sheet.
 * Excludes sensitive keys (ADMIN_EMAIL, DRIVE_FOLDER).
 */
function handleGetConfig() {
  var settings = getSettings();
  return jsonResponse({
    success: true,
    config: {
      brandName: settings.BRAND_NAME,
      registryName: settings.REGISTRY_NAME,
      siteUrl: settings.SITE_URL,
      editPage: settings.EDIT_PAGE,
      sheetId: settings.SHEET_ID,
      location: settings.LOCATION,
      countryCode: settings.COUNTRY_CODE,
      logoUrl: settings.LOGO_URL,
      colors: {
        primary: settings.COLOR_PRIMARY,
        secondary: settings.COLOR_SECONDARY,
        accent: settings.COLOR_ACCENT,
        surface: settings.COLOR_SURFACE,
      },
      fonts: {
        heading: settings.FONT_HEADING,
        body: settings.FONT_BODY,
      },
    },
  });
}

// ==================== REGISTRATION ====================

/**
 * Handle new coach registration.
 */
function handleRegister(data) {
  var settings = getSettings();
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');

  if (!sheet) {
    return jsonResponse({
      success: false,
      error: 'Submissions tab not found',
    });
  }

  var photoUrl = '';
  if (data.photoBase64) {
    try {
      var decoded = Utilities.base64Decode(data.photoBase64);
      var mimeType = data.photoFilename
        && data.photoFilename.toLowerCase().endsWith('.png')
        ? 'image/png' : 'image/jpeg';
      var blob = Utilities.newBlob(
        decoded, mimeType,
        data.photoFilename || 'photo.jpg'
      );
      var folder = DriveApp.getFolderById(
        settings.DRIVE_FOLDER_ID
      );
      var file = folder.createFile(blob);
      file.setName(
        (data.name || 'coach') + '_' + file.getId()
      );
      photoUrl =
        'https://drive.google.com/thumbnail?id='
        + file.getId() + '&sz=w400';
    } catch (photoErr) {
      photoUrl = '';
    }
  }

  sheet.appendRow([
    'pending',
    data.name || '',
    data.email || '',
    data.icfLevel || '',
    photoUrl,
    (data.specializations || []).join(', '),
    (data.languages || []).join(', '),
    data.format || '',
    data.priceMin || '',
    data.priceMax || '',
    data.bio1 || data.bio || '',
    data.bio1Language || '',
    data.bio2 || '',
    data.bio2Language || '',
    data.whatsapp || '',
    data.telegram || '',
    data.instagram || '',
    data.linkedin || '',
    data.facebook || '',
    data.icfMembership || '',
    new Date().toISOString(),
  ]);

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
    .setBackground('#fff2cc');

  var statusCell = sheet.getRange(lastRow, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['pending', 'approved', 'rejected'], true
    )
    .build();
  statusCell.setDataValidation(rule);

  if (settings.ADMIN_EMAIL) {
    MailApp.sendEmail({
      to: settings.ADMIN_EMAIL,
      name: settings.SENDER_NAME,
      subject: 'New coach registration: '
        + (data.name || 'Unknown'),
      body: 'A new coach has submitted a registration:\n\n'
        + 'Name: ' + (data.name || '') + '\n'
        + 'Email: ' + (data.email || '') + '\n'
        + 'ICF Level: ' + (data.icfLevel || '') + '\n'
        + 'Specializations: '
        + (data.specializations || []).join(', ') + '\n\n'
        + 'Review in the "Submissions" tab.\n'
        + settings.REGISTRY_NAME,
    });
  }

  return jsonResponse({ success: true });
}

// ==================== EDIT: REQUEST LINK ====================

/**
 * Handle request for edit link.
 * Finds approved coach by email, generates a token,
 * stores it in EditTokens tab, and sends email.
 * Always returns success to prevent email enumeration.
 */
function handleRequestEditLink(data) {
  var settings = getSettings();
  var email = (data.email || '').trim().toLowerCase();
  if (!email) return jsonResponse({ success: true });

  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return jsonResponse({ success: true });

  // Find approved coach by email
  var dataRange = sheet.getDataRange().getValues();
  var coachRow = -1;
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][2].toString().trim().toLowerCase()
        === email
        && dataRange[i][0].toString().trim().toLowerCase()
        === 'approved') {
      coachRow = i;
      break;
    }
  }

  if (coachRow === -1) {
    return jsonResponse({ success: true });
  }

  // Get or create EditTokens tab
  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
      .insertSheet('EditTokens');
    tokensSheet.appendRow([
      'Email', 'Token', 'ExpiresAt', 'Used',
    ]);
  }

  // Rate limit: no token sent in last 5 minutes
  var tokenData = tokensSheet.getDataRange().getValues();
  var now = new Date();
  var fiveMinAgo = new Date(
    now.getTime() - 5 * 60 * 1000
  );
  for (var j = 1; j < tokenData.length; j++) {
    if (tokenData[j][0].toString().trim().toLowerCase()
        === email) {
      var expiresAt = new Date(tokenData[j][2]);
      // expiresAt minus 24h = created time
      var createdTime = new Date(
        expiresAt.getTime() - 24 * 60 * 60 * 1000
      );
      if (createdTime > fiveMinAgo) {
        return jsonResponse({ success: true });
      }
    }
  }

  // Generate token
  var token = Utilities.getUuid();
  var expires = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  );
  tokensSheet.appendRow([
    email, token, expires.toISOString(), false,
  ]);

  // Send email
  var editUrl = settings.SITE_URL
    + settings.EDIT_PAGE + '?token=' + token;
  MailApp.sendEmail({
    to: email,
    name: settings.SENDER_NAME,
    subject: 'Edit your coach profile — '
      + settings.SENDER_NAME,
    body: 'Hello,\n\n'
      + 'You requested to edit your coach profile '
      + 'in the ' + settings.REGISTRY_NAME + '.\n\n'
      + 'Click this link to edit your profile:\n'
      + editUrl + '\n\n'
      + 'This link is valid for 24 hours.\n\n'
      + 'If you did not request this, '
      + 'please ignore this email.\n\n'
      + settings.REGISTRY_NAME + '\n'
      + settings.SITE_URL,
  });

  return jsonResponse({ success: true });
}

// ==================== EDIT: VERIFY TOKEN ====================

/**
 * Verify an edit token and return the coach's profile.
 */
function handleVerifyToken(data) {
  var token = (data.token || '').trim();
  if (!token) {
    return jsonResponse({
      success: false,
      error: 'No token',
    });
  }

  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var tokenData = tokensSheet.getDataRange().getValues();
  var tokenRow = -1;
  var tokenEmail = '';
  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][1] === token) {
      tokenRow = i;
      tokenEmail = tokenData[i][0].toString()
        .trim().toLowerCase();
      break;
    }
  }

  if (tokenRow === -1) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var expiresAt = new Date(tokenData[tokenRow][2]);
  if (new Date() > expiresAt) {
    return jsonResponse({
      success: false,
      error: 'Token expired',
    });
  }

  if (tokenData[tokenRow][3] === true
      || tokenData[tokenRow][3] === 'true') {
    return jsonResponse({
      success: false,
      error: 'Token already used',
    });
  }

  // Find coach in Submissions
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  var allData = sheet.getDataRange().getValues();
  for (var j = 1; j < allData.length; j++) {
    var row = allData[j];
    if (row[2].toString().trim().toLowerCase()
        === tokenEmail
        && row[0].toString().trim().toLowerCase()
        === 'approved') {
      return jsonResponse({
        success: true,
        profile: {
          name: row[1] || '',
          email: row[2] || '',
          icfLevel: row[3] || '',
          photo: row[4] || '',
          specializations: row[5] || '',
          languages: row[6] || '',
          format: row[7] || '',
          priceMin: row[8] || '',
          priceMax: row[9] || '',
          bio1: row[10] || '',
          bio1Language: row[11] || '',
          bio2: row[12] || '',
          bio2Language: row[13] || '',
          whatsapp: row[14] || '',
          telegram: row[15] || '',
          instagram: row[16] || '',
          linkedin: row[17] || '',
          facebook: row[18] || '',
        },
      });
    }
  }

  return jsonResponse({
    success: false,
    error: 'Coach not found',
  });
}

// ==================== EDIT: SAVE PROFILE ====================

/**
 * Save edited profile. Re-verifies token, updates the
 * Submissions row, marks token as used.
 */
function handleSaveProfile(data) {
  var settings = getSettings();
  var token = (data.token || '').trim();
  if (!token) {
    return jsonResponse({
      success: false,
      error: 'No token',
    });
  }

  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var tokenData = tokensSheet.getDataRange().getValues();
  var tokenRow = -1;
  var tokenEmail = '';
  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][1] === token) {
      tokenRow = i;
      tokenEmail = tokenData[i][0].toString()
        .trim().toLowerCase();
      break;
    }
  }

  if (tokenRow === -1) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var expiresAt = new Date(tokenData[tokenRow][2]);
  if (new Date() > expiresAt) {
    return jsonResponse({
      success: false,
      error: 'Token expired',
    });
  }

  if (tokenData[tokenRow][3] === true
      || tokenData[tokenRow][3] === 'true') {
    return jsonResponse({
      success: false,
      error: 'Token already used',
    });
  }

  // Find coach row
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  var allData = sheet.getDataRange().getValues();
  var coachRowNum = -1;
  for (var j = 1; j < allData.length; j++) {
    if (allData[j][2].toString().trim().toLowerCase()
        === tokenEmail
        && allData[j][0].toString().trim().toLowerCase()
        === 'approved') {
      coachRowNum = j + 1; // 1-indexed
      break;
    }
  }

  if (coachRowNum === -1) {
    return jsonResponse({
      success: false,
      error: 'Coach not found',
    });
  }

  // Handle photo
  var photoUrl = allData[coachRowNum - 1][4] || '';
  if (data.photoBase64) {
    try {
      var decoded = Utilities.base64Decode(
        data.photoBase64
      );
      var mimeType = data.photoFilename
        && data.photoFilename.toLowerCase()
          .endsWith('.png')
        ? 'image/png' : 'image/jpeg';
      var blob = Utilities.newBlob(
        decoded, mimeType,
        data.photoFilename || 'photo.jpg'
      );
      var folder = DriveApp.getFolderById(
        settings.DRIVE_FOLDER_ID
      );
      var file = folder.createFile(blob);
      file.setName(
        (data.name || 'coach') + '_' + file.getId()
      );
      photoUrl =
        'https://drive.google.com/thumbnail?id='
        + file.getId() + '&sz=w400';
    } catch (photoErr) {
      // keep existing photo on error
    }
  }

  // Update row (B through S = 18 columns)
  var range = sheet.getRange(coachRowNum, 2, 1, 18);
  range.setValues([[
    data.name || '',
    tokenEmail,
    data.icfLevel || '',
    photoUrl,
    (data.specializations || []).join(', '),
    (data.languages || []).join(', '),
    data.format || '',
    data.priceMin || '',
    data.priceMax || '',
    data.bio1 || '',
    data.bio1Language || '',
    data.bio2 || '',
    data.bio2Language || '',
    data.whatsapp || '',
    data.telegram || '',
    data.instagram || '',
    data.linkedin || '',
    data.facebook || '',
  ]]);

  // Mark token as used
  tokensSheet.getRange(tokenRow + 1, 4).setValue(true);

  return jsonResponse({ success: true });
}

// ==================== COLOR CODING ====================

/**
 * Automatically colors a row when the Status cell is changed.
 * Set this up as an onEdit trigger.
 */
function colorByStatus(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Submissions') return;

  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  if (col !== 1 || row === 1) return;

  var status = range.getValue().toString().toLowerCase().trim();
  var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

  if (status === 'approved') {
    rowRange.setBackground('#d9ead3');
  } else if (status === 'rejected') {
    rowRange.setBackground('#f4cccc');
  } else if (status === 'pending') {
    rowRange.setBackground('#fff2cc');
  }
}

/**
 * Recolors ALL rows based on their current Status value.
 * Run manually if colors get out of sync.
 */
function colorAllRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  for (var row = 2; row <= lastRow; row++) {
    var status = sheet.getRange(row, 1).getValue()
      .toString().toLowerCase().trim();
    var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

    if (status === 'approved') {
      rowRange.setBackground('#d9ead3');
    } else if (status === 'rejected') {
      rowRange.setBackground('#f4cccc');
    } else if (status === 'pending') {
      rowRange.setBackground('#fff2cc');
    }
  }
}

/**
 * Adds a dropdown list (pending / approved / rejected) to every
 * Status cell in the Submissions tab.
 * Run once during initial setup.
 */
function addStatusDropdown() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, 1, lastRow - 1, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'approved', 'rejected'], true)
    .build();
  range.setDataValidation(rule);
}

/**
 * Creates the Settings sheet with default values.
 * Run once during initial setup.
 */
function createSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var existing = ss.getSheetByName('Settings');
  if (existing) return;

  var sheet = ss.insertSheet('Settings');
  sheet.getRange('A1:B1').setValues([['Key', 'Value']]);
  sheet.getRange('A2:B18').setValues([
    ['SENDER_NAME', 'ICF Cyprus'],
    ['ADMIN_EMAIL', ''],
    ['SITE_URL', 'https://coaches.icf-cyprus.com'],
    ['EDIT_PAGE', '/src/edit.html'],
    ['DRIVE_FOLDER', 'https://drive.google.com/drive/folders/1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr'],
    ['REGISTRY_NAME', 'ICF Cyprus Coach Registry'],
    ['BRAND_NAME', 'ICF Cyprus'],
    ['COLOR_PRIMARY', '#212251'],
    ['COLOR_SECONDARY', '#2b379b'],
    ['COLOR_ACCENT', '#efcb30'],
    ['COLOR_SURFACE', '#f8f0e4'],
    ['FONT_HEADING', 'Nunito'],
    ['FONT_BODY', 'Plus Jakarta Sans'],
    ['LOCATION', 'Cyprus'],
    ['COUNTRY_CODE', '+357'],
    ['SHEET_URL', ''],
    ['LOGO_URL', ''],
    ['', ''],
  ]);
  sheet.getRange('A1:B1').setFontWeight('bold');
  sheet.autoResizeColumns(1, 2);
}


/* ============================================================
   PEOPLE LISTS — board access and the ICF member roster
   Used by the chapter website: who may sign in to its admin,
   and when each member's ICF membership runs out.

   Sheets (created automatically on first call):
     "Board"    — Email | Name | Role | Expiration date
     "Members"  — Email | Name | Member until

   Requires a row in Settings:
     PEOPLE_API_SECRET | <a long random string>
   The /exec URL is public and these are email addresses, so the
   endpoint refuses any request without the matching secret.
   ============================================================ */

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

/**
 * Find a column by header name. Reading by position breaks the moment somebody
 * inserts a column; reading by name survives it, and lets people label the
 * column whichever way reads naturally to them.
 */
function columnIndex_(headers, names) {
  for (var i = 0; i < headers.length; i++) {
    var header = (headers[i] || '').toString().trim().toLowerCase();
    for (var j = 0; j < names.length; j++) {
      if (header === names[j].toLowerCase()) return i;
    }
  }
  return -1;
}

/** Append a header the sheet does not have yet, so older sheets pick up new fields. */
function ensureColumn_(sheet, headers, names, label) {
  var index = columnIndex_(headers, names);
  if (index !== -1) return index;
  sheet.getRange(1, headers.length + 1).setValue(label).setFontWeight('bold');
  headers.push(label);
  return headers.length - 1;
}

/** Board members who may sign in to the website admin. */
function readBoard_() {
  var sheet = ensureSheet_(BOARD_SHEET, ['Email', 'Name', 'Role', 'Expiration date']);
  var rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return [];

  var headers = rows[0];
  var emailAt = columnIndex_(headers, ['Email', 'E-mail']);
  var nameAt = columnIndex_(headers, ['Name']);
  var roleAt = columnIndex_(headers, ['Role']);
  var untilAt = ensureColumn_(
    sheet, headers,
    ['Expiration date', 'Expires', 'Until', 'Term ends'],
    'Expiration date'
  );
  if (emailAt === -1) return [];

  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var email = (rows[i][emailAt] || '').toString().trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) continue;
    out.push({
      email: email,
      name: nameAt === -1 ? '' : (rows[i][nameAt] || '').toString().trim(),
      role: roleAt === -1 ? '' : (rows[i][roleAt] || '').toString().trim(),
      // Blank means no end date — a permanent seat, not an expired one.
      until: formatDate_(rows[i][untilAt]),
    });
  }
  return out;
}

/** ICF members and the date their membership runs out. */
function readMembers_() {
  var sheet = ensureSheet_(MEMBERS_SHEET, ['Email', 'Name', 'Member until']);
  var rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return [];

  var headers = rows[0];
  var emailAt = columnIndex_(headers, ['Email', 'E-mail']);
  var nameAt = columnIndex_(headers, ['Name']);
  var untilAt = columnIndex_(headers, ['Member until', 'Expiration date', 'Expires', 'Until']);
  if (emailAt === -1) return [];

  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var email = (rows[i][emailAt] || '').toString().trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) continue;
    out.push({
      email: email,
      name: nameAt === -1 ? '' : (rows[i][nameAt] || '').toString().trim(),
      until: untilAt === -1 ? '' : formatDate_(rows[i][untilAt]),
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
