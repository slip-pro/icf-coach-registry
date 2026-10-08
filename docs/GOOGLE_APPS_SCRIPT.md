# Google Apps Script — Backend

This guide explains how to set up the Google Apps Script web app that handles
coach registration, profile editing, and admin workflows.

## Full Source Code

**`docs/APPS_SCRIPT_FULL_CODE.js`** — single file with all functions.
Copy and paste the entire file into Apps Script.

## Three data files, one standalone script (since 5 Oct 2026)

ICF Cyprus no longer keeps everything in one spreadsheet bound to the script. The script is a
standalone project owned by the chapter's Google account (`info@icf-cyprus.com`) and opens three
spreadsheets in the chapter's `Data` folder:

| File | Tabs |
|---|---|
| Registry & membership | `Submissions`, `EditTokens`, `Members` |
| Events & media | `Event plan`, `Event media` |
| Board, partners & settings | `Board`, `Partners`, `Articles`, `Settings` |

Their IDs sit in Script Properties (`DATA_FILE_REGISTRY`, `DATA_FILE_EVENTS`, `DATA_FILE_BOARD`).
Without them the script reads the spreadsheet it is bound to, which is how a single-file instance
still works. The sites' secret `PEOPLE_API_SECRET` is a Script Property too; a `Settings` row with
that key is only a fallback for the old setup.

**Letters** (the edit link to a coach, "new registration" to `ADMIN_EMAIL`) go through Brevo's
transactional API when `BREVO_API_KEY` is set in Script Properties: from `SENDER_EMAIL` (Settings,
default `info@icf-cyprus.com`, must be an authenticated sender in Brevo), replies to `REPLY_TO`
(default `membership@icf-cyprus.com`). Without the key, or if Brevo refuses, MailApp sends instead —
from the script owner's Google account, which for a domain address fails SPF and lands in spam.

**Moving an instance from one file to three** (done once, in the new project, under the account
that should own everything):
1. Share the old spreadsheet with that account (viewer is enough).
2. New Apps Script project → paste `APPS_SCRIPT_FULL_CODE.js` → Project Settings: time zone of the
   chapter; Script Properties `SOURCE_SHEET` (old spreadsheet link) and `PEOPLE_API_SECRET` (new).
3. Run `setupDataFiles`. It finds `Website` from `DRIVE_FOLDER_COACHES` in the old Settings, makes
   `Data` beside it, creates the three files, copies the tabs, drops the secret row from the copied
   Settings, and installs the status colouring (On edit of the registry file) and the event-folder
   timer. It refuses a second run. The log lists the files and any tab no file claimed.
4. Deploy → New deployment → Web app, Execute as Me, Anyone. Check `getConfig` returns the new
   `version`, then point `APPS_SCRIPT_URL` (and the site's `PEOPLE_API_SECRET`) at it in both Vercel
   projects and redeploy.
5. Copy across any rows that reached the old file meanwhile; in the old project delete its
   triggers and archive its deployment; set the old spreadsheet to view-only.

## Prerequisites

- The same Google Sheet used for the coach directory
- A "Submissions" tab in that sheet
- Google account with owner/editor access to the sheet

## Setup

### 1. Create the Submissions tab

Add these column headers in the first row:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Status | Name | Email | ICF Level | Photo | Specializations | Languages | Format | Price Min | Price Max |

| K | L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|---|
| Bio 1 | Bio 1 Language | Bio 2 | Bio 2 Language | WhatsApp | Telegram | Instagram | LinkedIn | Facebook | ICF Membership | Submitted At |

### 2. Paste the script

1. In the Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code (Ctrl+A → Delete)
3. Copy the entire contents of `docs/APPS_SCRIPT_FULL_CODE.js`
4. Paste into the editor

### 3. Create the Settings sheet

Run the function `createSettingsSheet` from the function dropdown (▶️ Run).
This creates a "Settings" sheet with default values:

**Backend settings:**

| Key | Value | Description |
|-----|-------|-------------|
| SENDER_NAME | ICF Cyprus | Display name for outgoing emails |
| ADMIN_EMAIL | _(fill in)_ | Email for admin notifications |
| SITE_URL | https://coaches.icf-cyprus.com | Base URL of the registry |
| EDIT_PAGE | /src/edit.html | Path to the edit page |
| DRIVE_FOLDER | https://drive.google.com/drive/folders/... | Google Drive folder for photos (full URL) |
| REGISTRY_NAME | ICF Cyprus Coach Registry | Full name shown in emails |

**Frontend settings (loaded by website on page load):**

| Key | Value | Description |
|-----|-------|-------------|
| BRAND_NAME | ICF Cyprus | Brand name shown in headers and text |
| COLOR_PRIMARY | #212251 | Main text/background color |
| COLOR_SECONDARY | #2b379b | Secondary/accent color |
| COLOR_ACCENT | #efcb30 | CTA buttons, highlights |
| COLOR_SURFACE | #f8f0e4 | Light background surfaces |
| FONT_HEADING | Nunito | Google Font for headings |
| FONT_BODY | Plus Jakarta Sans | Google Font for body text |
| LOCATION | Cyprus | Location for "Offline (Cyprus)" label |
| COUNTRY_CODE | +357 | Default country code for WhatsApp |
| SHEET_URL | https://docs.google.com/spreadsheets/d/.../edit | Google Sheet with coach data (full URL) |

DRIVE_FOLDER and SHEET_URL accept full Google URLs — just paste the link from your browser. The script auto-extracts the ID.

For white-label deployments: change these values for each instance.

### 4. Set up the onEdit trigger

1. Click the **clock icon** in the left sidebar (Triggers)
2. Click **+ Add Trigger**
3. Choose which function to run: `colorByStatus`
4. Select event source: From spreadsheet
5. Select event type: On edit
6. Click **Save** and authorize

### 5. Run initial setup functions

1. Select `addStatusDropdown` → Run (adds dropdowns to Status column)
2. Select `colorAllRows` → Run (colors existing rows)

### 6. Deploy as web app

1. Click **Deploy > New deployment**
2. Select type: **Web app**
3. Execute as: **Me** / Who has access: **Anyone**
4. Click **Deploy** and authorize
5. Copy the Web app URL

### 7. Configure Vercel proxies

The web app URL must match in all Vercel API files:
- `api/submit.js`
- `api/request-edit-link.js`
- `api/verify-token.js`
- `api/save-profile.js`
- `api/config.js`

## Two more files: the open catalogue and Projects (since 8 Oct 2026)

| File | Tabs | Shared | Made by |
|---|---|---|---|
| Coach catalogue (public) | `Catalogue`, `Project places` | anyone with the link can **view** | `setupCatalogue` |
| Projects | `Projects`, `Project coaches`, `Matches` | restricted (participants' data) | `setupProjects` |

Script Properties: `CATALOGUE_FILE`, `PROJECTS_FILE` (set by the two setups), `FIENTA_API_KEY`
(Fienta → Settings → Integration; pasted by the owner, needed for paid projects).

**Open catalogue (D-025).** The Apps Script sometimes kept a 3-second run 30+ s in Google's queue,
and the first visitor after a quiet night saw an error. So `publishCatalogue` copies the catalogue
— the `PUBLIC_COACH_COLUMNS`, for approved, still-member, consenting coaches — into its own file,
on every edit of the registry file and every 10 minutes, writing only when something changed. The
registry's `/api/coaches` reads it as CSV when the registry's Vercel has `CATALOGUE_SHEET_ID`, and
falls back to the last good copy in Vercel Blob. `getCoaches` stays for an instance without it.

**Projects (site BACKLOG #57).** Coaching projects with partners; the first is WIT Cyprus (`wit`).
- `Projects`: one row per project — `Slug`, `Name`, `Partner`, `Lead name`, `Lead email` (replies
  to every project letter go there), `Status` (`draft` / `open` / `closed`), `Fienta event ID`
  (the number from the event's edit page in Fienta; empty = a free project, no ticket asked),
  `Sessions`, `Session minutes`, `Places per coach` (default), `Description`.
- `Project coaches`: `joinProject` adds an approved registry coach as `pending` and writes to the
  lead and the coach; the lead sets `accepted` / `declined`, and `Places` (empty = the default).
- `Matches`: `chooseCoach` writes one row per participant. A match that is not `cancelled` or
  `replaced` holds a place. Changing a coach is an exception: edit the row by hand.
- `chooseCoach` checks the Fienta ticket (`GET /tickets/{code}`: this event, status `UNUSED`),
  re-checks places under the script lock, writes the match, marks the ticket `USED`
  (`PUT /tickets/{code}`), refreshes `Project places` and sends the introduction letter to the
  participant and the coach. A ticket already in `Matches` is answered at once with that coach,
  before the lock, so repeating a request never makes a second match.
- `Project places` (in the open file): slug, name, status, accepted coach emails, places left —
  nothing about participants. Refreshed on every edit of the Projects file, after each choice and
  with `publishCatalogue`. The registry's `/api/project` reads it, so the choice page does not
  wait on the script.

Triggers (all reset by `installTriggers` or by re-running a setup): `colorByStatus` and
`publishCatalogueOnEdit` (edit of the registry file), `publishCatalogue` (10 min),
`publishProjectPlacesOnEdit` (edit of the Projects file), `syncEventFolders` (30 min).

## Functions Reference

| Function | Purpose | Trigger |
|----------|---------|---------|
| `doPost` | Main dispatcher — routes by `action` field | Web app POST (automatic) |
| `doGet` | GET dispatcher — serves frontend config | Web app GET (automatic) |
| `getSettings` | Reads config from Settings sheet | Called by other functions |
| `handleGetConfig` | Returns public config for frontend | `action: 'getConfig'` (GET or POST) |
| `handleRegister` | New coach registration | `action: 'register'` (default) |
| `handleRequestEditLink` | Generate magic link, send email | `action: 'requestEditLink'` |
| `handleVerifyToken` | Verify token, return profile | `action: 'verifyToken'` |
| `handleSaveProfile` | Update coach row in sheet | `action: 'saveProfile'` |
| `handleGetPeople` | Board access list + member roster | `action: 'getPeople'` |
| `handleSaveBoardProfile` | Set one board member's photo and bio | `action: 'saveBoardProfile'` |
| `handleGetContent` | Website events / articles / partners | `action: 'getContent'` |
| `handleSaveContent` | Add or replace one content record | `action: 'saveContent'` |
| `handleDeleteContent` | Remove one content record | `action: 'deleteContent'` |
| `handleUploadImage` | Store an image on Drive, return its URL | `action: 'uploadImage'` |
| `uploadImage_` | Shared Drive upload; sets sharing per file | Called by the above and by registration |
| `parseDriveFolderId` | Extract Drive folder ID from URL | Called by getSettings |
| `parseSheetId` | Extract Sheet ID from URL | Called by getSettings |
| `colorByStatus` | Color row on Status change | onEdit trigger |
| `colorAllRows` | Recolor all rows | Manual |
| `addStatusDropdown` | Add dropdown to Status cells | Manual (once) |
| `createSettingsSheet` | Create Settings sheet with defaults | Manual (once) |
| `setupCatalogue` | Make, share and fill the open catalogue file; set its triggers | Manual (once) |
| `publishCatalogue` | Copy the catalogue (and project places) into the open file | 10-min timer, registry edits |
| `setupProjects` | Make the Projects file with its tabs and a draft WIT row | Manual (once) |
| `handleJoinProject` | A registry coach asks to take part in a project | `action: 'joinProject'` |
| `handleChooseCoach` | A participant chooses her coach (Fienta ticket check) | `action: 'chooseCoach'` |
| `publishProjectPlaces_` | Coaches and places left into `Project places` | Projects edits, after a choice |

## Sheets Structure

### Submissions
Coach data — one row per coach. Column A (Status) controls visibility.

| Status | Color | Visible in catalog |
|--------|-------|--------------------|
| `pending` | Yellow (#fff2cc) | No |
| `approved` | Green (#d9ead3) | Yes |
| `rejected` | Red (#f4cccc) | No |

### EditTokens
Auto-created on first edit link request.

| Column | Content |
|--------|---------|
| A: Email | Coach's email (lowercase) |
| B: Token | UUID v4 |
| C: ExpiresAt | ISO timestamp (created + 24h) |
| D: Used | TRUE after profile is saved |

Rate limit: 1 token per email per 5 minutes.

### Board, Members
Who may sign in to the chapter website's admin, and who counts as an ICF member.
Auto-created on first `getPeople` call.

| Sheet | Columns |
|-------|---------|
| Board | `Email \| Name \| Role \| Expiration date \| Photo \| Bio` — blank date means a seat with no end; `Photo` and `Bio` feed the website's board block and are written by its admin |
| Members | `Email \| Name \| Member until` |

### Events, Articles, Partners
The chapter website's content. Auto-created on first `getContent` call. The site
reads them every five minutes; the board edits them either in the website admin
or directly here.

| Sheet | Columns |
|-------|---------|
| Events | `Slug \| Title \| Start \| End \| Category \| Location \| Cover \| Summary \| Description \| Fienta URL \| Gallery` |
| Articles | `Source URL \| Title \| Image \| Summary \| Tags \| Added at` |
| Partners | `Slug \| Name \| Kind \| URL \| Logo \| Summary \| Since` |

Three things worth knowing before editing by hand:

- **Columns are matched by their header text**, not position, so they can be
  reordered, and a column you add for your own notes survives a save from the admin.
- **A row added without a slug still works** — the slug is derived from the title.
- **Dates and times are stored as text on purpose.** Reformatting those cells as
  real dates makes Sheets reinterpret them: an event's `+03:00` offset is lost and
  it moves by hours.

### Settings
Configuration key-value pairs. Read by `getSettings()` on every request.
Falls back to defaults if sheet or key is missing.

Backend keys (used by Apps Script internally): SENDER_NAME, ADMIN_EMAIL, SITE_URL, EDIT_PAGE, DRIVE_FOLDER, REGISTRY_NAME, PEOPLE_API_SECRET.

`PEOPLE_API_SECRET` guards `getPeople` and all four content actions. The `/exec`
URL is public, so without it anyone holding that URL could read every email
address and rewrite the website's content. It must match the environment
variable of the same name on the chapter website.

Frontend keys (served to the website via `/api/config`): BRAND_NAME, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT, COLOR_SURFACE, FONT_HEADING, FONT_BODY, LOCATION, COUNTRY_CODE, SHEET_URL.

Sensitive keys (ADMIN_EMAIL, DRIVE_FOLDER) are NOT exposed to the frontend.

## How It Works

### Registration Flow
1. Coach fills form → Vercel proxy (`/api/submit`) → Apps Script
2. New row added to Submissions with status `pending` (yellow)
3. Admin gets email notification
4. Admin changes status to `approved` → row turns green → coach visible

### Edit Flow (Magic Link)
1. Coach enters email on edit page
2. `/api/request-edit-link` → Apps Script finds approved coach
3. UUID token generated, stored in EditTokens, email sent
4. Coach clicks link → `/api/verify-token` → profile data returned
5. Coach edits form → `/api/save-profile` → row updated, token marked used

### Photo Upload (base64)
1. Browser converts image to base64 (max 5 MB, JPEG/PNG/WebP)
2. Sent as JSON field `photoBase64` + `photoFilename`
3. Apps Script decodes, saves to Google Drive folder
4. Thumbnail URL stored in column E

## Updating the Deployment

After modifying the script:

1. **Deploy > Manage deployments**
2. Click the **✏️ pencil icon** on the active deployment
3. Version: select **New version**
4. Click **Deploy**

**Important**: Do NOT create a new deployment — it changes the URL.
Always edit the existing deployment.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No row appears after registration | Check Apps Script execution log (Executions sidebar) |
| Edit email not arriving | Check EditTokens tab was created. Check spam. Wait 5 min (rate limit). |
| Colors not updating | Verify onEdit trigger is set up (Triggers sidebar) |
| "Submissions tab not found" | Create tab named exactly "Submissions" |
| URL mismatch after redeployment | Update URL in all `api/*.js` files and push to Vercel |
