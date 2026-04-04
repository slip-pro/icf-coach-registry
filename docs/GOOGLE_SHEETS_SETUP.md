# Google Sheets Setup Guide

This guide explains how to set up a Google Sheet as the data source for the
ICF Cyprus Coach Registry. No coding is required -- just follow the steps.

---

## Overview

The Coach Registry reads coach data from a publicly published Google Sheet.
The sheet has one tab:

- **Submissions** -- all coach data (registrations, approved coaches, rejected coaches)

Only coaches with `Status = approved` appear in the public catalog.

Rows are color-coded automatically: yellow = pending, green = approved, red = rejected.

---

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank spreadsheet** to create a new sheet
3. Name it something like `ICF Cyprus Coach Registry`

---

## Step 2: Set Up the "Submissions" Tab

Rename the default "Sheet1" tab to **Submissions**.
Right-click the tab name at the bottom and select **Rename**.

### Column Headers

Add these headers in **Row 1**, one per column (A through R):

| Column | Header | Required | Description |
|--------|--------|----------|-------------|
| A | Name | Yes | Coach's full name |
| B | Photo | No | URL to a profile photo (Google Drive link or web URL) |
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
| P | Status | Yes | `approved`, `pending`, or `rejected` (dropdown) |
| Q | ICF Membership | No | ICF membership number or registered email |
| R | Submitted At | Auto | Date/time of submission (filled automatically) |

**Important notes:**
- The header names must match exactly (not case-sensitive, but spelling matters)
- Only coaches with **Status = approved** will appear on the website
- The Status column has a **dropdown** -- you select a value, not type it
- Rows are **color-coded automatically**: yellow = pending, green = approved, red = rejected
- Google Drive photo URLs are automatically converted to thumbnails by the widget

---

## Step 3: Set Up the Status Dropdown and Color Coding

After setting up the columns, run the Apps Script functions to enable the
dropdown and color coding. See the [Apps Script guide](GOOGLE_APPS_SCRIPT.md)
for instructions on:

- `addStatusDropdown` -- adds the dropdown list to the Status column
- `colorAllRows` -- colors all existing rows based on their Status
- `colorByStatus` (onEdit trigger) -- automatically colors rows when you change the Status

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

1. **Check the Status column** -- only `approved` coaches are shown
2. **Check that the sheet is published** -- File > Share > Publish to web
3. **Check column headers** -- they must match the names listed above
4. **Check the Sheet ID** -- make sure you copied it correctly

### Changes in the sheet are not reflected

- Google Sheets publishing may take up to 5 minutes to update the CSV
- Try refreshing the page with Ctrl+Shift+R (hard refresh)

### The widget shows an error

- Verify your internet connection
- Check that the Google Sheet has not been deleted or unpublished
- Open your browser console (F12) for detailed error messages

### Colors are wrong or missing

- Open Extensions > Apps Script and run `colorAllRows` to recolor all rows
- Make sure the `colorByStatus` trigger is set up (see Apps Script guide)

---

## Managing Coach Data

### Adding a coach manually

1. Open the Google Sheet
2. Go to the **Submissions** tab
3. Add a new row with all required fields
4. Set Status to `approved` (select from dropdown)
5. The row turns green and the coach appears on the website within a few minutes

### Hiding a coach temporarily

1. Change their Status from `approved` to `pending`
2. The row turns yellow and the coach disappears from the website

### Removing a coach

1. Change their Status to `rejected`
2. The row turns red and the coach disappears from the website
3. Don't delete the row -- keep it for records

### Editing coach information

1. Find the coach's row in the **Submissions** tab
2. Edit the relevant cells
3. Changes appear on the website within a few minutes
