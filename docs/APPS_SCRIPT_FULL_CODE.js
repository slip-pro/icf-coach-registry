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
 *
 * НЕОБЯЗАТЕЛЬНО — папки под каждый вид картинок. Любая незаполненная
 * означает «класть туда же, куда и раньше», то есть в DRIVE_FOLDER:
 *   DRIVE_FOLDER_COACHES           фото коучей
 *   DRIVE_FOLDER_EVENT_COVERS      обложки событий
 *   DRIVE_FOLDER_EVENT_GALLERIES   фото с событий
 *   DRIVE_FOLDER_PARTNERS          логотипы партнёров
 * Значение — ссылка на папку или её ID, как и у DRIVE_FOLDER.
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

  // Optional per-kind folders. Absent ones fall back to DRIVE_FOLDER, so a
  // Settings sheet that predates these keys keeps behaving exactly as before.
  settings.DRIVE_FOLDER_COACHES_ID =
    parseDriveFolderId(settings.DRIVE_FOLDER_COACHES);
  settings.DRIVE_FOLDER_EVENT_COVERS_ID =
    parseDriveFolderId(settings.DRIVE_FOLDER_EVENT_COVERS);
  settings.DRIVE_FOLDER_EVENT_GALLERIES_ID =
    parseDriveFolderId(settings.DRIVE_FOLDER_EVENT_GALLERIES);
  settings.DRIVE_FOLDER_PARTNERS_ID =
    parseDriveFolderId(settings.DRIVE_FOLDER_PARTNERS);
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
    } else if (action === 'getContent') {
      return handleGetContent(data);
    } else if (action === 'saveContent') {
      return handleSaveContent(data);
    } else if (action === 'deleteContent') {
      return handleDeleteContent(data);
    } else if (action === 'uploadImage') {
      return handleUploadImage(data);
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
      photoUrl = uploadImage_(
        data.photoBase64,
        data.photoFilename,
        data.name || 'coach',
        400,
        'coach'
      );
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
      var uploaded = uploadImage_(
        data.photoBase64,
        data.photoFilename,
        data.name || 'coach',
        400,
        'coach'
      );
      if (uploaded) photoUrl = uploaded;
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

/**
 * A cell may hold a real date or typed text; both must come out as YYYY-MM-DD.
 *
 * Formatted in the spreadsheet's own timezone, not UTC. Sheets stores a date
 * cell as midnight local time, so in Cyprus reading it as UTC lands at 21:00
 * the previous day and the date comes back one day early — which, for a board
 * member's expiration date, ends their access a day before it should.
 */
function formatDate_(value) {
  if (!value) return '';
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'Etc/UTC';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  }
  var text = value.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, tz, 'yyyy-MM-dd');
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

/* ============================================================
   IMAGES ON DRIVE
   ============================================================ */

/**
 * Which folder an upload belongs in.
 *
 * Everything used to land in one folder — named "Coach Photos", and holding
 * event covers and gallery photos as well, because the code had nowhere else
 * to put them. A year of that and nobody can tell whose picture is whose.
 *
 * Each kind now has its own folder, configured in the Settings sheet:
 *
 *   coach          → DRIVE_FOLDER_COACHES          Website/Coach photos
 *   event-cover    → DRIVE_FOLDER_EVENT_COVERS     Website/Event covers
 *   event-gallery  → DRIVE_FOLDER_EVENT_GALLERIES  Website/Event galleries
 *   partner-logo   → DRIVE_FOLDER_PARTNERS         Website/Partner logos
 *
 * Any of these left blank falls back to DRIVE_FOLDER, which is also what an
 * unknown or missing kind gets. So this can be rolled out one folder at a time,
 * and a Settings sheet written before these keys existed keeps working.
 */
function folderIdForKind_(settings, kind) {
  var byKind = {
    'coach': settings.DRIVE_FOLDER_COACHES_ID,
    'event-cover': settings.DRIVE_FOLDER_EVENT_COVERS_ID,
    'event-gallery': settings.DRIVE_FOLDER_EVENT_GALLERIES_ID,
    'partner-logo': settings.DRIVE_FOLDER_PARTNERS_ID
  };
  return byKind[kind] || settings.DRIVE_FOLDER_ID || '';
}

/**
 * Put an image on Drive and return a link that renders on a public page.
 *
 * Sharing is set on the FILE rather than inherited from the folder. Inheriting
 * meant the folder itself had to be open "anyone with the link" for photos to
 * show at all — which let anyone holding the folder link page through every
 * photo in one go. Per-file sharing keeps each image reachable by its own link
 * while the folder stays private.
 *
 * `width` is the rendered width Drive serves: 400 is plenty for a coach
 * avatar, an event cover spans the page and needs far more.
 *
 * `kind` decides which folder the file lands in — see folderIdForKind_. It is
 * optional: without it, or without the matching folder configured, everything
 * goes where it always went.
 */
function uploadImage_(base64, filename, nameHint, width, kind) {
  if (!base64) return '';

  var settings = getSettings();
  var folderId = folderIdForKind_(settings, kind);
  if (!folderId) return '';

  var lower = (filename || '').toString().toLowerCase();
  var mimeType = lower.slice(-4) === '.png' ? 'image/png'
    : lower.slice(-5) === '.webp' ? 'image/webp'
    : 'image/jpeg';

  var blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    mimeType,
    filename || 'image.jpg'
  );

  var file = DriveApp.getFolderById(folderId).createFile(blob);
  file.setName((nameHint || 'image') + '_' + file.getId());

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    // Some Workspace domains forbid link sharing by policy. The file is stored
    // either way; it just will not render until somebody opens it up by hand.
  }

  return 'https://drive.google.com/thumbnail?id=' + file.getId()
    + '&sz=w' + (width || 400);
}

/**
 * Upload an image on its own, outside any form submission — used by the website
 * admin for event covers and galleries.
 */
function handleUploadImage(data) {
  if (!contentSecretOk_(data)) {
    return jsonResponse({ success: false, error: 'Forbidden' });
  }
  try {
    var url = uploadImage_(
      data.base64,
      data.filename,
      data.nameHint || 'image',
      data.width || 1200,
      data.kind
    );
    if (!url) {
      return jsonResponse({
        success: false,
        error: 'No image data, or DRIVE_FOLDER is not set in Settings',
      });
    }
    return jsonResponse({ success: true, url: url });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/* ============================================================
   WEBSITE CONTENT — events, articles, partners
   ============================================================
   The chapter website used to keep these in JSON files inside its own
   deployment. On Vercel that filesystem is read-only, so every save from the
   admin failed and nothing a board member typed survived. The records live
   here instead: the board can edit them in the spreadsheet directly, and the
   admin writes through this endpoint.

   Sheets, created on first use:
     "Events"    — Slug | Title | Start | End | Category | Location |
                   Cover | Summary | Description | Fienta URL | Gallery
     "Articles"  — Source URL | Title | Image | Summary | Tags | Added at
     "Partners"  — Slug | Name | Kind | URL | Logo | Summary | Since

   Guarded by the same PEOPLE_API_SECRET as the board list: the /exec URL is
   public, and write access to the chapter's content is not something to leave
   open to whoever finds it.
   ============================================================ */

var CONTENT_KINDS = {
  events: {
    sheet: 'Events',
    key: 'slug',
    titleField: 'title',
    fields: [
      { name: 'slug',        header: 'Slug',        aliases: ['Slug', 'ID'] },
      { name: 'title',       header: 'Title',       aliases: ['Title', 'Name'] },
      { name: 'start',       header: 'Start',       aliases: ['Start', 'Starts', 'Date'], datetime: true },
      { name: 'end',         header: 'End',         aliases: ['End', 'Ends'], datetime: true },
      { name: 'category',    header: 'Category',    aliases: ['Category'] },
      { name: 'location',    header: 'Location',    aliases: ['Location', 'Place'] },
      { name: 'cover',       header: 'Cover',       aliases: ['Cover', 'Cover image', 'Image'] },
      { name: 'summary',     header: 'Summary',     aliases: ['Summary'] },
      { name: 'description', header: 'Description', aliases: ['Description'] },
      { name: 'fientaUrl',   header: 'Fienta URL',  aliases: ['Fienta URL', 'Fienta', 'Ticket URL'] },
      { name: 'gallery',     header: 'Gallery',     aliases: ['Gallery', 'Photos'], list: true }
    ]
  },
  articles: {
    sheet: 'Articles',
    key: 'sourceUrl',
    titleField: 'title',
    fields: [
      { name: 'sourceUrl', header: 'Source URL', aliases: ['Source URL', 'URL', 'Link'] },
      { name: 'title',     header: 'Title',      aliases: ['Title', 'Name'] },
      { name: 'image',     header: 'Image',      aliases: ['Image', 'Cover'] },
      { name: 'summary',   header: 'Summary',    aliases: ['Summary'] },
      { name: 'tags',      header: 'Tags',       aliases: ['Tags'], list: true },
      { name: 'addedAt',   header: 'Added at',   aliases: ['Added at', 'Added', 'Date'], date: true }
    ]
  },
  partners: {
    sheet: 'Partners',
    key: 'slug',
    titleField: 'name',
    fields: [
      { name: 'slug',    header: 'Slug',    aliases: ['Slug', 'ID'] },
      { name: 'name',    header: 'Name',    aliases: ['Name', 'Title'] },
      { name: 'kind',    header: 'Kind',    aliases: ['Kind', 'Type'] },
      { name: 'url',     header: 'URL',     aliases: ['URL', 'Website', 'Link'] },
      { name: 'logo',    header: 'Logo',    aliases: ['Logo', 'Image'] },
      { name: 'summary', header: 'Summary', aliases: ['Summary'] },
      { name: 'since',   header: 'Since',   aliases: ['Since', 'Partner since'], date: true }
    ]
  }
};

/** The content endpoints share the board list's secret — same trust boundary. */
function contentSecretOk_(data) {
  var expected = (getSettings().PEOPLE_API_SECRET || '').toString().trim();
  if (!expected) return false;
  return ((data && data.secret) || '').toString().trim() === expected;
}

/**
 * Read one kind, or all three at once.
 * POST { action: 'getContent', secret: '...', kind: 'events' (optional) }
 */
function handleGetContent(data) {
  if (!contentSecretOk_(data)) {
    return jsonResponse({ success: false, error: 'Forbidden' });
  }

  var kind = ((data && data.kind) || '').toString().trim();
  if (kind) {
    if (!CONTENT_KINDS[kind]) {
      return jsonResponse({ success: false, error: 'Unknown kind: ' + kind });
    }
    return jsonResponse({ success: true, items: readContent_(kind) });
  }

  return jsonResponse({
    success: true,
    events: readContent_('events'),
    articles: readContent_('articles'),
    partners: readContent_('partners')
  });
}

/**
 * Add or replace one record, matched on its key.
 * POST { action: 'saveContent', secret: '...', kind: 'events', item: {...} }
 */
function handleSaveContent(data) {
  if (!contentSecretOk_(data)) {
    return jsonResponse({ success: false, error: 'Forbidden' });
  }

  var spec = CONTENT_KINDS[((data && data.kind) || '').toString().trim()];
  if (!spec) {
    return jsonResponse({ success: false, error: 'Unknown kind' });
  }

  var item = data.item || {};
  var key = (item[spec.key] || '').toString().trim();
  if (!key) {
    return jsonResponse({ success: false, error: spec.key + ' is required' });
  }

  var sheet = ensureSheet_(spec.sheet, contentHeaders_(spec));
  var at = contentColumns_(sheet, spec);
  var rows = sheet.getDataRange().getValues();

  // Find the existing row by key, so a re-save edits instead of duplicating.
  var target = -1;
  for (var i = 1; i < rows.length; i++) {
    if (contentKeyOf_(spec, rows[i], at, i) === key) { target = i + 1; break; }
  }
  var replaced = target !== -1;

  var width = Math.max(sheet.getLastColumn(), 1);
  for (var f = 0; f < spec.fields.length; f++) {
    if (at[spec.fields[f].name] + 1 > width) width = at[spec.fields[f].name] + 1;
  }

  // Start from what is already in the row and overwrite only our own columns.
  // The board edits this sheet by hand, so sooner or later somebody adds a
  // column of their own — rebuilding the row from scratch would wipe it.
  var row = [];
  for (var c = 0; c < width; c++) {
    row[c] = replaced && rows[target - 1][c] !== undefined ? rows[target - 1][c] : '';
  }
  for (var g = 0; g < spec.fields.length; g++) {
    var field = spec.fields[g];
    var value = item[field.name];
    row[at[field.name]] = field.list
      ? (value && value.length ? value.join(', ') : '')
      : (value === undefined || value === null ? '' : value.toString());
  }

  if (!replaced) target = sheet.getLastRow() + 1;

  // Dates and timestamps go in as plain text. Left as normal cells, Sheets
  // re-reads them as dates of its own: "2026-09-18T18:00:00+03:00" loses its
  // offset and the event moves by hours, and "2026-07-01" becomes midnight
  // local time, which read back anywhere west of here is the 30th of June.
  // Only our own date columns are reformatted; other people's are left alone.
  for (var h = 0; h < spec.fields.length; h++) {
    if (spec.fields[h].datetime || spec.fields[h].date) {
      sheet.getRange(target, at[spec.fields[h].name] + 1).setNumberFormat('@');
    }
  }
  sheet.getRange(target, 1, 1, row.length).setValues([row]);

  return jsonResponse({ success: true, key: key, replaced: replaced });
}

/**
 * Remove one record by key.
 * POST { action: 'deleteContent', secret: '...', kind: 'events', key: '...' }
 */
function handleDeleteContent(data) {
  if (!contentSecretOk_(data)) {
    return jsonResponse({ success: false, error: 'Forbidden' });
  }

  var spec = CONTENT_KINDS[((data && data.kind) || '').toString().trim()];
  if (!spec) {
    return jsonResponse({ success: false, error: 'Unknown kind' });
  }

  var key = ((data && data.key) || '').toString().trim();
  if (!key) {
    return jsonResponse({ success: false, error: 'key is required' });
  }

  var sheet = ensureSheet_(spec.sheet, contentHeaders_(spec));
  var at = contentColumns_(sheet, spec);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (contentKeyOf_(spec, rows[i], at, i) === key) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true, deleted: key });
    }
  }
  return jsonResponse({ success: true, deleted: null });
}

function contentHeaders_(spec) {
  var headers = [];
  for (var i = 0; i < spec.fields.length; i++) headers.push(spec.fields[i].header);
  return headers;
}

/** Map every field to its column, adding any header the sheet does not have yet. */
function contentColumns_(sheet, spec) {
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var at = {};
  for (var i = 0; i < spec.fields.length; i++) {
    var field = spec.fields[i];
    at[field.name] = ensureColumn_(sheet, headers, field.aliases, field.header);
  }
  return at;
}

/**
 * The key of a row. A record added through the admin always carries one, but a
 * board member adding a row by hand will not fill in a slug — so derive it from
 * the title rather than skipping the row and losing their work silently.
 */
function contentKeyOf_(spec, row, at, rowIndex) {
  var stored = (row[at[spec.key]] || '').toString().trim();
  if (stored) return stored;

  var title = (row[at[spec.titleField]] || '').toString().trim();
  if (!title) return '';
  // The key doubles as the page address for events and partners, so it has to
  // be an address-safe string, not the title itself.
  if (spec.key !== 'slug') return '';
  return slugify_(title) || ('item-' + hashOf_(title));
}

function slugify_(value) {
  return (value || '').toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/** Greek and Cyrillic titles slugify to nothing; they get a stable id instead. */
function hashOf_(value) {
  var hash = 5381;
  var text = (value || '').toString();
  for (var i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function readContent_(kind) {
  var spec = CONTENT_KINDS[kind];
  if (!spec) return [];

  var sheet = ensureSheet_(spec.sheet, contentHeaders_(spec));
  var at = contentColumns_(sheet, spec);
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var key = contentKeyOf_(spec, rows[i], at, i);
    if (!key) continue;

    var item = {};
    item[spec.key] = key;
    for (var f = 0; f < spec.fields.length; f++) {
      var field = spec.fields[f];
      if (field.name === spec.key) continue;
      var raw = rows[i][at[field.name]];
      if (field.list) {
        item[field.name] = splitList_(raw);
      } else if (field.datetime) {
        item[field.name] = formatDateTime_(raw);
      } else if (field.date) {
        item[field.name] = formatDate_(raw);
      } else {
        item[field.name] = (raw === undefined || raw === null) ? '' : raw.toString().trim();
      }
    }
    out.push(item);
  }
  return out;
}

function splitList_(value) {
  if (!value) return [];
  return value.toString().split(/[,\n]/)
    .map(function (part) { return part.trim(); })
    .filter(function (part) { return part.length > 0; });
}

/**
 * Event times carry a timezone offset ("2026-09-18T18:00:00+03:00") and must
 * keep it. Text written by the admin is passed through untouched; a cell
 * somebody typed a date into comes back in the spreadsheet's own timezone,
 * which is the timezone they meant.
 */
function formatDateTime_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'Etc/UTC';
    return Utilities.formatDate(value, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  return value.toString().trim();
}
