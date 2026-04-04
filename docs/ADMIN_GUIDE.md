# Admin Guide: Coach Moderation

## How it works

1. A coach fills out the registration form on the website
2. The data goes to the **"Submissions"** tab in your Google Sheet
3. You get an **email notification** with the coach's name and details
4. You review the submission in the Google Sheet
5. You **approve or reject** by changing the Status column
6. Approved coaches automatically appear in the catalog

## Step-by-step: Approve a coach

1. Open your Google Sheet
2. Go to the **"Submissions"** tab
3. Find the new row (it will have Status = `pending`)
4. Review the coach's information
5. **To approve**: Change the Status cell from `pending` to `approved`
6. **To reject**: Change the Status cell from `pending` to `rejected`
7. The catalog refreshes on next page load — the approved coach will appear

## Step-by-step: Remove a coach

If a coach leaves ICF Cyprus or asks to be removed:

1. Open your Google Sheet
2. Find the coach's row (in "Coaches" or "Submissions" tab)
3. Change the Status cell to `rejected`
4. The coach will disappear from the catalog on next page load

**Note**: Don't delete the row — just change the status. This keeps a record.

## Step-by-step: Edit a coach's profile

1. Open your Google Sheet
2. Find the coach's row
3. Edit any cell directly (name, bio, specializations, etc.)
4. Changes appear in the catalog on next page load

## Email notifications

Email notifications are sent automatically when a coach submits a registration.
To change the admin email:

1. Open the Google Sheet
2. Go to Extensions → Apps Script
3. Click the gear icon (Project Settings)
4. Under Script Properties, find `ADMIN_EMAIL`
5. Change the value to the new email address

## FAQ

**Q: How long until changes appear on the website?**
A: Changes appear the next time someone loads the page (usually within seconds).

**Q: Can I approve multiple coaches at once?**
A: Yes! Just change the Status column to `approved` for each coach you want to approve.

**Q: What if I accidentally reject a coach?**
A: Just change the Status back to `approved`. No data is lost.

**Q: Can coaches edit their own profiles?**
A: Not yet. For now, coaches contact you and you make the changes in the sheet. Self-editing is planned for a future version.
