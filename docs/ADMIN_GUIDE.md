# Admin Guide: Coach Moderation

## Where the data lives (since 5 Oct 2026)

Everything belongs to the chapter's Google account, **info@icf-cyprus.com**, in the Drive folder
`ICF Cyprus / Data`. Three spreadsheets, one per desk:

| File | Tabs | Who edits it |
|---|---|---|
| **Registry & membership** | `Submissions`, `EditTokens`, `Members` | the membership desk |
| **Events & media** | `Event plan`, `Event media` | the events director |
| **Board, partners & settings** | `Board`, `Partners`, `Articles`, `Settings` | the board |
| **Coach catalogue (public)** | `Catalogue`, `Project places` | nobody — the script rewrites it |
| **Projects** | `Projects`, `Project coaches`, `Matches` | each project's lead |

The open catalogue file is shared with anyone who has the link: the site reads coaches from it.
It holds only what the cards already show. **Do not edit it** — every change in the registry
reaches it within minutes, and anything typed there by hand is overwritten.

"The Google Sheet" below means the file that holds the tab in question. The old single spreadsheet
in the owner's personal Drive is read-only and no longer read by either site.

The Apps Script project is **ICF Cyprus data** under the same account. It sends its letters (edit
links, new-registration notices) through Brevo from info@icf-cyprus.com, replies going to
membership@. Its secrets (`PEOPLE_API_SECRET`, `BREVO_API_KEY`) are in the project's Script
Properties, not in any sheet. With four Google accounts in one browser, open the project as
`https://script.google.com/home?authuser=info@icf-cyprus.com`; a permission prompt that fails with
"cannot open the file" works in a private window signed in as info@ only.

## How it works

1. A coach fills out the registration form on the website
2. The data goes to the **"Submissions"** tab in your Google Sheet
3. The new row is highlighted in **yellow** (pending review)
4. You get an **email notification** with the coach's name and details
5. You review the submission in the Google Sheet
6. You **approve or reject** by selecting a value from the Status dropdown
7. The row color changes automatically: **green** = approved, **red** = rejected
8. Approved coaches automatically appear in the catalog

## Single tab: everything in Submissions

All coach data lives in **one tab** called **Submissions**. There is no separate "Coaches" tab. The website catalog reads directly from Submissions and shows only coaches with Status = `approved`.

**Status is the first column (A)** -- this makes it the easiest column to scan when moderating submissions.

The sheet also has columns for two bios: **Bio 1** (with Bio 1 Language) and **Bio 2** (with Bio 2 Language). This lets coaches provide their biography in two languages.

This means:
- New registrations appear here
- Approved coaches stay here
- Rejected coaches stay here too (for your records)
- You never need to copy rows between tabs

## Color coding

Rows in the Submissions tab are color-coded automatically based on the Status column:

| Status | Row color | Meaning |
|--------|-----------|---------|
| `pending` | Yellow | New submission, needs your review |
| `approved` | Green | Visible in the public catalog |
| `rejected` | Red | Not visible, kept for records |

The colors update automatically when you change the Status. This makes it easy to scan the sheet and see what needs attention -- just look for yellow rows.

## Status dropdown

The Status column has a **dropdown list** -- you do not need to type the values manually. Just click the cell and select one of:
- `pending`
- `approved`
- `rejected`

This prevents typos and ensures the catalog works correctly.

## Step-by-step: Approve a coach

1. Open your Google Sheet
2. Go to the **"Submissions"** tab
3. Find the yellow row (Status = `pending`)
4. Review the coach's information
5. Click the **Status cell** and select `approved` from the dropdown
6. The row turns **green** automatically
7. The catalog refreshes on next page load -- the approved coach will appear

## Step-by-step: Reject a coach

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Click the **Status cell** and select `rejected` from the dropdown
4. The row turns **red** automatically
5. The coach will not appear in the catalog

## Step-by-step: Remove a coach

If a coach leaves ICF Cyprus or asks to be removed:

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Change the Status cell to `rejected`
4. The coach will disappear from the catalog on next page load

**Note**: Don't delete the row -- just change the status. This keeps a record.

## When a coach's ICF membership ends

You don't need to do anything. When the website's membership desk marks someone `left` in the
**Members** tab, their card disappears from the catalogue (within about 5 minutes). The row in
Submissions is untouched. When the desk marks them a member again, the card comes back by itself.

A coach who opens their edit link while hidden sees a short note that the profile is paused until
they renew; they can still edit it.

Matching is by email. If a coach registered with a different address than the one ICF has:

1. In the **Members** tab, find the person and copy their **Member ID**
2. In **Submissions**, if there is no **Member ID** column yet, add one — type `Member ID` into the
   first empty cell of row 1, **after the last column** (never between existing columns)
3. Paste the ID into that coach's row

A coach the Members tab does not know at all stays visible.

## Permissions: listing and social media

The registration and edit forms ask two things, and the script writes the answer into two columns
at the end of **Submissions** (it adds them itself):

- **Publish consent** — the date the coach agreed to be listed. The form will not send without it.
  Blank means the coach registered before October 2026; they registered to be listed, so blank
  counts as agreed. If a coach asks to be taken off, type `no` here — the card disappears within
  about 5 minutes, and the row stays.
- **Social media consent** — the date the coach allowed the chapter to post about them, using the
  photo and description from their profile, or `no`. Blank means not asked yet; the edit form asks
  the next time they open it. **Before any post about a coach, check that this cell has a date.**

## Step-by-step: Edit a coach's profile

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Edit any cell directly (name, bio, specializations, etc.)
4. Changes appear in the catalog on next page load

## Photos

Coaches upload photos directly during registration (JPEG, PNG, WebP, max 5 MB). Photos are automatically saved to your Google Drive folder and displayed as thumbnails in the catalog. You do not need to do anything special with photos.

**If photos show for you but not for visitors.** Each photo must be readable by anyone with its
link. The script opens every uploaded file that way, but if Google refuses it says nothing — and
you, signed in as the owner, still see the photo. On 4 Oct 2026, 30 of 32 directory photos were
visible to nobody else. The fix that covers every file at once: in Google Drive, right-click the
photo folder → **Share** → General access **"Anyone with the link"**, role **Viewer**. Do it for
both photo folders (the old `Coach Photos` and the chapter's `Website/Coach photos`). To check,
open the catalog in a private browser window.

## Coach self-editing

Coaches can update their own profiles via a magic link:

1. Coach goes to the **Edit Profile** page
2. Enters their email address
3. Receives a one-time link by email (valid for 24 hours)
4. Clicks the link to open a pre-filled form
5. Makes changes and saves

The link can only be used once. After saving, the coach must request a new link for further edits. Only approved coaches can request edit links.

Edit tokens are stored in a separate **EditTokens** tab (created automatically).

## Email notifications

Email notifications are sent automatically when a coach submits a registration — since
4 Oct 2026 to the membership desk's address. The website's membership desk also shows how many
applications are waiting for approval.
To change the admin email:

1. Open **Board, partners & settings**
2. Go to the **Settings** tab
3. Find the row with Key = `ADMIN_EMAIL`
4. Change the Value to the new email address

## Event plan and event folders (for the chapter website)

The **Events & media** file holds the chapter's event plan, in the `Event plan` tab, and the website
reads it through the script. The full how-to — what the Date column may say, what `Category` and `Always show` do,
how to use each event's Drive folder — is in the website repository, `docs/CONTENT-FILL.md` §0.

Two things belong to the script, not to people:
- the `Folder` column of `Event plan` and `Events` — the link that ties a row to its folder;
- the `Event media` tab — what the script last found in the folders. It is rewritten every 30
  minutes; edits there are lost.

The 30-minute timer was set by `setupDataFiles` in the new project (5 Oct 2026); `installEventSync`
resets it if ever needed.

## Running a coaching project (WIT Cyprus and the next ones)

Everything for a project is in the **Projects** file (`Data` folder). In stage 1 the lead works in
the file itself; a project page in /admin comes later.

**Setting up a project** — one row on the `Projects` tab:
1. `Slug` — a short code for the address (`wit`); the choice page is
   `coaches.icf-cyprus.com/?project=<slug>`.
2. `Name`, `Partner`, `Lead name`, **`Lead email`** — participants' and coaches' replies go there.
3. Paid project: create the event in Fienta; put the choice page link into the ticket text; copy
   the number from the event's edit page address (`fienta.com/my/events/<number>/…`) into
   **`Fienta event ID`** — digits only. Free project: leave it empty, no ticket is asked.
4. `Places per coach` — how many participants a coach takes by default.
5. `Status`: `draft` while preparing, **`open`** to take coaches and participants, `closed` after.

**Coaches** — send the project page (for WIT: `icf-cyprus.com/projects/wit`) to the chapter chat.
A coach leaves the email of their registry profile; a `pending` row appears on `Project coaches`
and you get a letter. Set `Status` to **`accepted`** (or `declined`). `Places` empty = the default;
type a number to give a coach more or fewer. Only accepted coaches appear on the choice page.

**Participants** — they buy a ticket, open the link in it, choose a coach and enter the ticket
number. The site checks the ticket in Fienta, marks it used, adds a row to `Matches` and sends an
introduction letter to both. The page shows places left; a full coach shows "Fully booked".

**Changing a coach (exception)** — on `Matches`, set the old row's `Status` to `replaced` and type
the new coach's email and name into a new row (or simply change `Coach email` / `Coach name` in
the row). Write to both coaches and the participant yourself — no letters go out for hand edits.

**Cancelling a participant** — `Status` → `cancelled`; the coach's place is free again.

**What WIT (the partner) gets** — totals only: participants, sessions, average rating. Never the
`Matches` tab.

## FAQ

**Q: How long until changes appear on the website?**
A: Changes appear the next time someone loads the page (usually within seconds).

**Q: Can I approve multiple coaches at once?**
A: Yes! Just select `approved` from the Status dropdown for each coach you want to approve.

**Q: What if I accidentally reject a coach?**
A: Just change the Status back to `approved`. No data is lost. The row will turn green again.

**Q: Can coaches edit their own profiles?**
A: Yes! Coaches go to the Edit Profile page, enter their email, and receive a one-time edit link. The link is valid for 24 hours. You can also edit their data directly in the sheet.

**Q: Why are some rows yellow/green/red?**
A: The colors show the status at a glance. Yellow = pending review, green = approved (visible on website), red = rejected. The colors update automatically when you change the Status.

**Q: What if the colors are wrong or missing?**
A: Open Extensions > Apps Script and run the `colorAllRows` function. This recolors all rows based on their current Status. See the Apps Script guide for details.
