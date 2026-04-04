# Google Apps Script -- Form Submission Backend

This guide explains how to set up a Google Apps Script web app that receives
coach registration submissions and writes them to the "Submissions" tab of
the Google Sheet.

## Prerequisites

- The same Google Sheet used for the coach directory
- A "Submissions" tab in that sheet (create one if missing)
- Google account with owner/editor access to the sheet

## Step-by-step Setup

### 1. Create the Submissions tab

Open the Google Sheet and add a new tab named **Submissions**.

Add these column headers in the first row:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Name | Photo | Specializations | ICF Level | Languages | Format | Price Min | Price Max | Bio | Email | WhatsApp | Telegram | Instagram | LinkedIn | Facebook | Status | ICF Membership | Submitted At |

### 2. Open Apps Script

1. In the Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor

### 3. Paste the script

Copy and paste the following code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Submissions');

    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Submissions tab not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.name || '',
      data.photo || '',
      (data.specializations || []).join(', '),
      data.icfLevel || '',
      (data.languages || []).join(', '),
      data.format || '',
      data.priceMin || '',
      data.priceMax || '',
      data.bio || '',
      data.email || '',
      data.whatsapp || '',
      data.telegram || '',
      data.instagram || '',
      data.linkedin || '',
      data.facebook || '',
      'pending',
      data.icfMembership || '',
      new Date().toISOString(),
    ]);

    // Optional: send email notification to admin
    var adminEmail = PropertiesService
      .getScriptProperties()
      .getProperty('ADMIN_EMAIL');

    if (adminEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: 'New coach registration: ' + (data.name || 'Unknown'),
        body: 'A new coach has submitted a registration:\n\n'
          + 'Name: ' + (data.name || '') + '\n'
          + 'Email: ' + (data.email || '') + '\n'
          + 'ICF Level: ' + (data.icfLevel || '') + '\n'
          + 'Specializations: '
          + (data.specializations || []).join(', ') + '\n\n'
          + 'Review in the "Submissions" tab of your Google Sheet.',
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. (Optional) Set admin email for notifications

1. In Apps Script, go to **Project Settings** (gear icon in the left sidebar)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Key: `ADMIN_EMAIL`, Value: your email address
5. Click **Save**

### 5. Deploy as web app

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set:
   - **Description**: Coach registration endpoint
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Authorize the app when prompted (review permissions and allow)
6. Copy the **Web app URL** -- you will need it for the widget configuration

### 6. Configure the widget

Pass the web app URL when initializing the widget:

```html
<script type="module">
  import { ICFRegistry } from './js/app.js';
  ICFRegistry.init({
    sheetId: 'YOUR_GOOGLE_SHEET_ID',
    scriptUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  });
</script>
```

## How it works

1. Coach fills out the registration form in the widget
2. Form data is sent as a JSON POST to the Apps Script web app
3. The script writes a new row to the "Submissions" tab with status "pending"
4. If ADMIN_EMAIL is configured, the admin receives an email notification
5. The admin reviews the submission in the sheet and changes status to "approved"
6. The approved coach appears in the public catalog on next page load

## Approval workflow

The "Status" column (P) controls visibility:

| Status | Meaning |
|--------|---------|
| `pending` | New submission, not yet visible in catalog |
| `approved` | Visible in the public catalog |
| `rejected` | Removed, not visible |

To approve a coach: change the Status cell from `pending` to `approved`.

## Updating the deployment

If you modify the script:

1. Click **Deploy > Manage deployments**
2. Click the pencil icon on the active deployment
3. Under "Version", select **New version**
4. Click **Deploy**

The URL stays the same after updating.

## Troubleshooting

- **"Submissions tab not found"** -- Create a tab named exactly "Submissions"
- **No email notifications** -- Check ADMIN_EMAIL script property is set
- **Form says success but no row appears** -- Check the Apps Script execution log
  (Executions in the left sidebar) for errors
- **CORS errors in console** -- Expected. The widget uses `mode: 'no-cors'`
  which means the browser cannot read the response, but the request still
  goes through. Check the Submissions tab to confirm data arrived.
