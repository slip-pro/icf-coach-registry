# Deployment Guide — New Registry Instance

How to deploy your own coach registry from this repo.
You'll need: a Google account, a GitHub account, and a free Vercel account.

**Time**: ~30 minutes.

---

## Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Your Site   │────▶│  Vercel      │────▶│  Google Apps      │
│  (browser)   │     │  (hosting +  │     │  Script (backend) │
│              │     │   API proxy) │     │                    │
└─────────────┘     └──────────────┘     └──────────────────┘
                                                │
                                         ┌──────┴───────┐
                                         │ Google Sheet  │
                                         │ (data +      │
                                         │  settings)   │
                                         └──────────────┘
```

The website runs on Vercel (free tier).
All data lives in your Google Sheet.
Google Apps Script handles form submissions, emails, and photo uploads.

---

## Step 1: Google Sheet

### 1.1 Create a new Google Sheet

Name it something like "Coach Registry".

### 1.2 Create the "Submissions" tab

Rename the default "Sheet1" to **Submissions**.

Add these headers in row 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Status | Name | Email | ICF Level | Photo | Specializations | Languages | Format | Price Min | Price Max |

| K | L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|---|
| Bio 1 | Bio 1 Language | Bio 2 | Bio 2 Language | WhatsApp | Telegram | Instagram | LinkedIn | Facebook | ICF Membership | Submitted At |

### 1.3 Create a Google Drive folder for photos

1. In Google Drive, create a folder (e.g. "Coach Photos")
2. Right-click → Share → **Anyone with the link** → Viewer
3. Copy the folder URL (you'll need it for Settings)

---

## Step 2: Google Apps Script

### 2.1 Open Apps Script

In your Google Sheet: **Extensions → Apps Script**

### 2.2 Paste the code

1. Select all existing code (Ctrl+A) and delete it
2. Open the file `docs/APPS_SCRIPT_FULL_CODE.js` from this repo
3. Copy the entire file (759 lines) and paste it into Apps Script
4. Click **Save** (Ctrl+S)

### 2.3 Create the Settings sheet

1. In the function dropdown at the top, select **createSettingsSheet**
2. Click **▶ Run**
3. Authorize when prompted (Google will ask for permissions)
4. Go back to your Google Sheet — a "Settings" tab should appear

### 2.4 Fill in your Settings

Open the **Settings** tab and update these values:

| Key | What to put |
|-----|-------------|
| SENDER_NAME | Your organization name (shown in emails) |
| ADMIN_EMAIL | Email that receives notifications about new registrations |
| SITE_URL | Your website URL (e.g. `https://coaches.your-org.com`) |
| DRIVE_FOLDER | Full URL of the Google Drive photos folder from step 1.3 |
| REGISTRY_NAME | Full name (e.g. "Your Org Coach Registry") |
| BRAND_NAME | Short name (e.g. "Your Org") — shown in headers |
| COLOR_PRIMARY | Main dark color (hex, e.g. `#212251`) |
| COLOR_SECONDARY | Secondary color (hex, e.g. `#2b379b`) |
| COLOR_ACCENT | Accent/button color (hex, e.g. `#efcb30`) |
| COLOR_SURFACE | Light background color (hex, e.g. `#f8f0e4`) |
| FONT_HEADING | Google Font name for headings (e.g. `Nunito`) |
| FONT_BODY | Google Font name for body text (e.g. `Plus Jakarta Sans`) |
| LOCATION | Country/city for "Offline" label (e.g. `Cyprus`) |
| COUNTRY_CODE | Phone country code for WhatsApp (e.g. `+357`) |
| LOGO_URL | URL to your logo image (optional — see below) |

**Logo**: You can upload your logo to Google Drive, then use this URL format:
```
https://drive.google.com/thumbnail?id=YOUR_FILE_ID&sz=w200
```
To get the file ID: right-click the file in Drive → "Get link" → the long string between `/d/` and `/`.

Leave LOGO_URL empty to use the default logo from the repo.

### 2.5 Set up triggers

1. Click the **clock icon** (⏰) in the left sidebar → Triggers
2. Click **+ Add Trigger**:
   - Function: `colorByStatus`
   - Event source: From spreadsheet
   - Event type: On edit
3. Click **Save** and authorize

### 2.6 Run initial setup

1. Select `addStatusDropdown` from the dropdown → **▶ Run**
2. Select `colorAllRows` from the dropdown → **▶ Run**

### 2.7 Deploy as web app

1. Click **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** and authorize
6. **Copy the Web app URL** — you'll need it in the next step

The URL looks like:
```
https://script.google.com/macros/s/AKfycb.../exec
```

> **Important**: After any code changes, go to **Deploy → Manage deployments → ✏️ (edit) → New version → Deploy**. Do NOT create a new deployment — it changes the URL.

---

## Step 3: GitHub

### 3.1 Fork the repository

1. Go to this repo on GitHub
2. Click **Fork** (top right)
3. This creates a copy in your GitHub account

---

## Step 4: Vercel

### 4.1 Create a Vercel project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your forked repository
4. Click **Deploy**

### 4.2 Add the environment variable

1. Go to your project → **Settings → Environment Variables**
2. Add:
   - **Name**: `APPS_SCRIPT_URL`
   - **Value**: the Web app URL from step 2.7
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
3. Click **Save**

### 4.3 Redeploy

After adding the env var, trigger a new deploy:
1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment → **Redeploy**

### 4.4 (Optional) Custom domain

1. Go to **Settings → Domains**
2. Add your domain (e.g. `coaches.your-org.com`)
3. Create a **CNAME** record in your DNS:
   - Name: `coaches` (or your subdomain)
   - Value: `cname.vercel-dns.com`
4. Vercel will auto-issue an SSL certificate

---

## Step 5: Verify

Open your Vercel URL and check:

- [ ] Catalog page loads (even if empty — no coaches yet)
- [ ] Your brand name appears in the header
- [ ] Your colors are applied
- [ ] Registration form works: `your-url/src/register.html`
- [ ] Submit a test registration
- [ ] Check Google Sheet — new row should appear in Submissions
- [ ] Check your admin email — notification should arrive
- [ ] Change status to "approved" — coach should appear in catalog
- [ ] Edit page works: `your-url/src/edit.html`

---

## Customization

### Change branding at any time

Edit the **Settings** tab in your Google Sheet. Changes appear on the site within 5 minutes (cached).

No code changes needed for:
- Brand name, colors, fonts
- Logo, location, country code
- Admin email, site URL

### Decorative elements

The repo includes ICF-branded SVG decorations (star, symbol).
To use your own:
1. Replace files in `src/assets/` in your fork
2. Push to GitHub → Vercel auto-deploys

### Replace the default logo

Either:
- Set LOGO_URL in Settings (recommended — no code change)
- Or replace `src/assets/icf-logo.png` in your fork

---

## Updating from upstream

When the original repo gets new features:

```bash
# One-time: add the original repo as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/icf-coach-registry.git

# Pull updates
git fetch upstream
git merge upstream/main
git push origin main
```

Your Settings sheet and env var stay unchanged.

---

## Architecture Summary

| Component | Purpose | Where |
|-----------|---------|-------|
| Google Sheet | Coach data + configuration | Your Google account |
| Google Apps Script | Backend (forms, emails, photos) | Attached to your Sheet |
| Vercel | Hosting + API proxy | Your Vercel account |
| GitHub fork | Source code | Your GitHub account |

All instance-specific config is in two places:
1. **Settings sheet** (17 keys — branding, colors, emails)
2. **Vercel env var** (`APPS_SCRIPT_URL` — 1 variable)

No code changes needed to deploy a new instance.
