# Google Sheets Setup Guide

This guide explains how to set up a Google Sheet as the data source for the
ICF Cyprus Coach Registry. No coding is required — just follow the steps.

---

## Overview

The Coach Registry reads coach data from a publicly published Google Sheet.
The sheet has two tabs:

- **Coaches** — the main directory (shown on the website)
- **Submissions** — new registrations waiting for review

Only coaches with `Status = approved` appear in the public catalog.

---

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank spreadsheet** to create a new sheet
3. Name it something like `ICF Cyprus Coach Registry`

---

## Step 2: Set Up the "Coaches" Tab

The first tab is named **Coaches** by default (rename the existing "Sheet1").
Right-click the tab name at the bottom and select **Rename**.

### Column Headers

Add these headers in **Row 1**, one per column (A through Q):

| Column | Header | Required | Description |
|--------|--------|----------|-------------|
| A | Name | Yes | Coach's full name |
| B | Photo | No | URL to a profile photo (hosted online) |
| C | Specializations | Yes | Comma-separated list (e.g. `Leadership, Business, Executive`) |
| D | ICF Level | Yes | One of: `ACC`, `PCC`, `MCC`, `Member` |
| E | Languages | Yes | Comma-separated list (e.g. `English, Russian, Greek`) |
| F | Format | Yes | `Online`, `Offline`, or `Both` |
| G | Price Min | No | Minimum session price in EUR (number only, e.g. `80`) |
| H | Price Max | No | Maximum session price in EUR (number only, e.g. `120`) |
| I | Bio | Yes | Short biography, up to 300 words |
| J | Email | Yes | Primary contact email |
| K | WhatsApp | No | Phone number with country code (e.g. `+35799123456`) |
| L | Telegram | No | Username without @ (e.g. `coach_username`) |
| M | Instagram | No | Profile URL or handle |
| N | LinkedIn | No | Full profile URL |
| O | Facebook | No | Full profile URL |
| P | Status | Yes | `approved`, `pending`, or `rejected` |

**Important notes:**
- The header names must match exactly (not case-sensitive, but spelling matters)
- Only coaches with **Status = approved** will appear on the website
- If you leave the Status column empty for a coach, they will appear as approved

---

## Step 3: Set Up the "Submissions" Tab

1. Click the **+** button at the bottom-left (next to existing tabs) to add a
   new tab
2. Name it **Submissions**

This tab uses the same columns as **Coaches**, plus two additional columns:

| Column | Header | Required | Description |
|--------|--------|----------|-------------|
| A-P | *(same as Coaches tab)* | | |
| Q | ICF Membership | No | ICF membership number or registered email |
| R | Submitted At | Auto | Date/time of submission |

### Workflow

1. New coach applications go into the **Submissions** tab (via a form or
   manual entry)
2. An administrator reviews each submission
3. When approved, copy the row to the **Coaches** tab and set Status to
   `approved`
4. Or set Status directly in Submissions — the website reads from the
   **Coaches** tab only

---

## Step 4: Publish the Sheet

The widget reads the sheet as a CSV file. To enable this:

1. Open your Google Sheet
2. Go to **File** menu at the top
3. Click **Share** > **Publish to web**
4. In the popup:
   - Under **Link**, select **Entire Document**
   - Under **format**, select **Comma-separated values (.csv)**
5. Click **Publish**
6. Click **OK** on the confirmation dialog

> **Note:** Publishing makes the data readable by anyone with the link.
> Do not include private information (personal phone numbers, home addresses)
> in the sheet unless you are comfortable with it being publicly accessible.

---

## Step 5: Get the Sheet ID

The Sheet ID is a long string of letters and numbers in the Google Sheet URL.

For example, if your sheet URL is:
```
https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
```

Then the Sheet ID is: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

It is the part between `/d/` and `/edit`.

---

## Step 6: Configure the Widget

In the HTML page where the widget is embedded, pass the Sheet ID when
initializing:

```html
<div id="icf-coach-registry"></div>
<script type="module">
  import { ICFRegistry } from './js/app.js';
  ICFRegistry.init({
    sheetId: 'YOUR_SHEET_ID_HERE'
  });
</script>
```

Replace `YOUR_SHEET_ID_HERE` with the actual Sheet ID from Step 5.

---

## Troubleshooting

### Coaches are not appearing

1. **Check the Status column** — only `approved` coaches are shown
2. **Check that the sheet is published** — File > Share > Publish to web
3. **Check column headers** — they must match the names listed above
4. **Check the Sheet ID** — make sure you copied it correctly

### Changes in the sheet are not reflected

- Google Sheets publishing may take up to 5 minutes to update the CSV
- Try refreshing the page with Ctrl+Shift+R (hard refresh)

### The widget shows an error

- Verify your internet connection
- Check that the Google Sheet has not been deleted or unpublished
- Open your browser console (F12) for detailed error messages

---

## Managing Coach Data

### Adding a new coach

1. Open the Google Sheet
2. Go to the **Coaches** tab
3. Add a new row with all required fields
4. Set Status to `approved`
5. The coach will appear on the website within a few minutes

### Hiding a coach temporarily

1. Change their Status from `approved` to `pending`
2. They will disappear from the website but their data is preserved

### Removing a coach

1. Change their Status to `rejected`, or
2. Delete the entire row from the sheet

### Editing coach information

1. Find the coach's row in the **Coaches** tab
2. Edit the relevant cells
3. Changes appear on the website within a few minutes
