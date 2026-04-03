# ICF Cyprus Coach Registry — Deployment Guide

This guide explains how to set up the coach registry widget
on the ICF Cyprus WordPress website. No coding experience required.

---

## Step 1: Create the Google Sheet

The coach data lives in a Google Sheet. Each row is one coach.

### Column names (first row)

Use these exact column headers in the first row:

| Column | Example | Required? |
|--------|---------|-----------|
| Name | Maria Schneider | Yes |
| Photo | https://example.com/photo.jpg | No |
| Specializations | Leadership, Business, Executive | No |
| ICF Level | PCC | Yes |
| Languages | English, Russian | Yes |
| Format | online | Yes |
| Price Min | 80 | No |
| Price Max | 120 | No |
| Bio | Certified coach with 10 years... | No |
| Email | coach@example.com | No |
| WhatsApp | +35799123456 | No |
| Telegram | @username | No |
| Instagram | https://instagram.com/handle | No |
| LinkedIn | https://linkedin.com/in/profile | No |
| Facebook | https://facebook.com/page | No |

### Values explained

- **ICF Level**: Use one of: `MCC`, `PCC`, `ACC`, or `Member`
- **Format**: Use one of: `online`, `offline`, or `both`
- **Specializations**: Comma-separated list (e.g. `Leadership, Business`)
- **Languages**: Comma-separated list (e.g. `English, Russian, Greek`)
- **Price Min / Price Max**: Numbers only, no currency symbol.
  Leave both as 0 or empty for "On request"
- **WhatsApp**: Include country code (e.g. `+35799123456`)
- **Telegram**: Username with or without @ (e.g. `@coach_name`)
- **Photo**: Direct URL to an image (JPG or PNG).
  If empty, the widget shows the coach's initials

### Important notes

- Each coach must have a **Name** — rows without a name are skipped
- The widget displays bio text, specializations, and names exactly
  as written in the sheet. It does NOT translate coach content
- Coaches can leave contact fields empty — only provided channels
  are shown on the card

---

## Step 2: Publish the Google Sheet

The widget reads the sheet data publicly. You need to publish it.

1. Open your Google Sheet
2. Go to **File > Share > Publish to web**
3. In the dialog:
   - Select **Entire Document**
   - Choose **Comma-separated values (.csv)**
4. Click **Publish**
5. Copy the **Sheet ID** from the URL.
   The URL looks like:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
   The Sheet ID is the long string between `/d/` and `/edit`.
   Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`

Also make sure the sheet is shared:
1. Click **Share** (top right)
2. Under "General access", set to **Anyone with the link** > **Viewer**

---

## Step 3: Upload widget files to your server

You need to upload these files to your WordPress hosting:

```
your-site.com/
  wp-content/
    themes/your-theme/
      icf-registry/           <-- create this folder
        js/
          app.js
          cards.js
          contacts.js
          filters.js
          i18n.js
          sheets.js
        styles/
          main.css
```

Upload all files from `src/js/` into the `js/` folder,
and `src/styles/main.css` into the `styles/` folder.

You can use your hosting's File Manager or an FTP client
(like FileZilla) to upload.

---

## Step 4: Add the widget to a WordPress page

1. Go to your WordPress admin panel
2. Edit the page where the registry should appear
   (e.g. "Find a Coach")
3. Add a **Custom HTML** block (in Gutenberg editor)
   or switch to **Text/HTML** mode (in Classic editor)
4. Paste this code:

```html
<!-- Google Font for the widget -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet">

<!-- Widget CSS -->
<link rel="stylesheet"
      href="/wp-content/themes/YOUR-THEME/icf-registry/styles/main.css">

<!-- Widget container -->
<div id="icf-coach-registry"></div>

<!-- Widget script -->
<script type="module">
  import { ICFRegistry }
    from '/wp-content/themes/YOUR-THEME/icf-registry/js/app.js';

  ICFRegistry.init({
    sheetId: 'YOUR_GOOGLE_SHEET_ID'
  });
</script>
```

5. Replace `YOUR-THEME` with your actual theme folder name
6. Replace `YOUR_GOOGLE_SHEET_ID` with the ID from Step 2
7. Save and preview the page

---

## Step 5: Verify it works

After saving the page, check the following:

- [ ] The page shows "Loading coaches..." briefly, then cards appear
- [ ] Each coach card shows name, badge, bio, tags, and contact buttons
- [ ] Language switcher (EN / RU / EL) changes all UI text
- [ ] Filter chips work — selecting a filter narrows the card list
- [ ] Contact buttons open WhatsApp, Telegram, or email correctly
- [ ] The page looks good on mobile (test on your phone)

---

## Updating coach data

To add, remove, or edit coaches:

1. Open the Google Sheet
2. Edit the rows directly
3. Changes appear on the website automatically
   (within a few minutes, or on page reload)

No need to touch the WordPress page or re-upload any files.

---

## Troubleshooting

**Cards don't appear / "Failed to load" error**
- Check that the Google Sheet is published (Step 2)
- Check that sharing is set to "Anyone with the link"
- Verify the Sheet ID is correct in the script

**Styles look broken / overlapping with theme**
- Make sure the CSS file path is correct
- The widget uses `icf-` prefixed classes to avoid conflicts,
  but some aggressive theme CSS may still interfere.
  Contact support if this happens

**Language switcher not working**
- Ensure the script is loaded as `type="module"`
- Check browser console for JavaScript errors (press F12)

**Contact buttons show wrong text**
- The pre-filled message uses the current UI language.
  Switch to the desired language before clicking contact buttons
