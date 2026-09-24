# Feature Backlog

## G-001: MVP Coach Catalog — Done

### F-001: Coach Card Component — Done
### F-002: Filter Panel — Done
### F-003: Contact Buttons — Done
### F-004: Language Switcher (i18n) — Done
### F-005: Google Sheets Integration — Done
### F-006: Responsive Layout — Done
### F-007: WordPress Embedding — Done

---

## G-002: Coach Registration Flow — Done

### F-008: Registration Form — Done
### F-009: Admin Moderation — Done

---

## G-018: Coach Profile Modal -- Done

### F-013: Coach Profile Modal -- Done

---

## G-019: Registration Form Fix -- Done

### F-014: Apps Script Redeployment + Docs Fix -- Done

---

## G-020: Remove ICF Membership Field -- Done

### F-015: Remove Section 7 from Registration Form -- Done

---

## G-021: Avatar Photo Centering Fix -- Done

### F-016: Avatar object-position Fix -- Done

---

## G-022: Browser-Based Modal Tests -- Done

### F-017: Modal Test Suite (13 assertions) -- Done

---

## G-003: AI Coach Matching (Phase 2)

### F-010: AI Chatbot Widget
**Priority**: Low (Phase 2)
**Description**: Conversational assistant for coach matching.

### F-011: AI Topic Auto-fill
**Priority**: Low (Phase 2)
**Description**: Auto-insert coaching topic from AI conversation into contact pre-fill.

---

## G-024: Update WordPress Links — Done

### F-019: Replace old URLs on WP page — Done

---

## G-023: Photo Upload Rework — Done

### F-018: Direct file upload in registration form — Done

---

## G-011: Coach Profile Editing — Done

### F-022: Magic link auth + edit form — Done

---

## G-025: White-Label Product — Done

### F-020: Config-driven branding — Done
### F-021: Multi-instance deployment guide — Done

---

## G-026: First Client Instance (Russian Coaching School) — Done

### F-023: Client repo setup + Vercel deployment — Done
### F-024: Russian market customizations (currency, language, labels) — Done

---

## G-004: Analytics (Phase 2)

### F-012: Usage Analytics
**Priority**: Low (Phase 2)
**Description**: Track page views, filter usage, contact button clicks.

---

## G-027: Find a Coach by Name — Done

### F-025: Name search in the catalogue — Done
**Priority**: Medium
**Requested**: Owner, 17 Sep 2026

**Description**: A search box that filters the catalogue by coach name.

**Why**: the panel filters by specialization, language, format, ICF level and price — every way of
finding *a* coach, and no way of finding *a particular* coach. Someone told "talk to Maria, she is
in the ICF register" has to read every card. That is the most likely reason a person opens the
directory already knowing who they want.

**Where it fits**: `src/js/filters.js`. The state is a set of Sets built by `createEmptyState()`,
and `applyFilters()` runs a pure predicate per coach — a name term joins both cleanly. AND with the
other groups, matching the existing behaviour between groups.

**Matching — decided with the owner, 17 Sep 2026**: names in this registry are written in Russian
or English, never both for the same coach. Search should find a coach whichever script the person
typing happens to use.

The obvious approach — transliterate everything to English and compare — misses, because
transliteration is not one to one. Юлия is typed Yulia, Julia and Iuliya; Мария as Maria and
Mariya; Александр as Alexander, Aleksandr and Alexandr. Index one spelling and the others return
nothing, which reads to the user as "this coach is not in the register".

So reduce both the stored name and the query to the same rough skeleton, and compare those:

1. lowercase, strip accents and punctuation, collapse whitespace;
2. transliterate Cyrillic to Latin;
3. collapse the spellings that vary: `ya`/`ia`/`ja` to one, `y`/`i`/`j` to one, `ks`/`x` to one,
   `kh`/`h`, doubled letters to single.

Both "Юлия" and "Julia" then reduce to the same string, and either query finds the coach.

Substring match on the skeleton, not whole-word: people type partial names, and a surname alone
should find somebody.

**Worth deciding before building**:
- Placement: above the filter chips rather than among them. It is a different kind of action.
- Whether an empty result should say "no coach by that name" distinctly from "no coach matches
  these filters". The two are different disappointments.

**Not in scope**: searching bios or specialisations — a search that quietly matches a bio surprises
people, and name-only is predictable. Nor fuzzy matching of genuine misspellings: the skeleton above
handles spelling *variants*, which is a different thing, and whether real typos matter cannot be
known without usage data (see F-012).

**Re-requested by the owner on 23 Sep 2026** after the marketing and membership calls — still
Medium, but now the top registry item once the site launch is behind us.

**Built 23 Sep 2026.** Both questions above decided: the search box sits above the chips, and an
empty result under a name search says "no coach by that name" (`emptyStateName`), distinct from
the filter message. Matching lives in `src/js/name-search.js`; `tests/name-search.test.mjs` runs
under plain `node` and pins the spelling pairs. One rule beyond the list above: a word-initial
*Chr-/Khr-/Hr-* reads as *Kr-*, so Кристина finds the three Christinas in the register.
Known miss: Alexander vs Aleksandr differ by a vowel, not a spelling scheme — "Alex" finds both.
See `docs/notes/G-027.md`.

---

## G-028: Consent to publish, and to be featured

### F-026: Two consent checkboxes on registration and edit
**Priority**: Medium
**Requested**: Owner, 23 Sep 2026

**Description**: Two opt-ins on the registration form and the profile edit form:
- *Publish my profile in the coach registry* — stored as `PUBLISH_CONSENT`. A profile without it
  is kept in the sheet but never rendered in the catalogue, whatever its moderation status.
- *The chapter may feature me on its social media* — stored as `SOCIAL_CONSENT`. Read by the
  site's marketing desk (site backlog #28) when drafting welcome and congratulations posts.

Both are unticked by default; the first is effectively required to appear, and the form should say
so rather than silently hiding the person. Text in all three languages via `src/js/i18n.js`.

**Existing coaches** have answered neither. Treat the registry consent as given — they registered
in order to be listed — and ask the social one the next time they open the edit form (magic link).

**Where**: `src/js/registration.js` and `src/js/edit.js` for the fields; `docs/APPS_SCRIPT_FULL_CODE.js`
(`handleRegister`, `handleSaveProfile`) for writing the two new columns. The catalogue reads the
sheet directly as CSV (`src/js/sheets.js`), so the `PUBLISH_CONSENT` filter is applied there, next
to the existing `approved` status check. `docs/GOOGLE_SHEETS_SETUP.md` for the columns.

---

## G-029: Membership ends, profile goes

### F-027: A `Status` the site's membership desk can set
**Priority**: Medium — after the site's membership desk exists (site backlog #23)
**Unblocked 24 Sep 2026**: the desk exists. It already writes `Status` = `left` and `Member ID` into the
`Members` tab of this same spreadsheet — the registry can read leavers from there by email.
**Requested**: Owner, 23 Sep 2026

**Description**: When the roster says a coach is no longer an ICF member, the site's membership
admin hides their registry profile. The registry side is a `Membership status` column
(`active` / `left`) that the catalogue respects (filtered in `src/js/sheets.js`, like the status),
and one new Apps Script action, `setMembershipStatus`, guarded by `contentSecretOk_` — the same
`PEOPLE_API_SECRET` the site already sends for content and uploads.

Not a deletion: the row stays, the coach can be reinstated when they renew, and their photo and
consents survive. Deleting on a roster glitch and re-asking a coach to register is the failure to
avoid.

**Open**: what the coach sees if they open their magic link while hidden — probably a one-line
notice that the profile is paused while membership is renewed.

---

## G-030: Somebody hears about a new registration

### F-028: Set `ADMIN_EMAIL` — Minutes, already built
**Priority**: High — do now
**Requested**: Owner, 23 Sep 2026

The Apps Script already sends "New coach registration: <name>" to `ADMIN_EMAIL` from the `Settings`
sheet on every submission. The key is currently blank, so nothing is sent. Put the responsible
person's address there — nothing to build. Several addresses: comma-separated works for `MailApp`.

Later the site's membership desk can list pending registrations as well, but the email is the
right first step: it needs no code and reaches a person, which is the whole point.

---

## G-031: Find a coach by what they work with

### F-029: Keyword search — through the bio first, a keywords field if that is not enough
**Priority**: Medium
**Requested**: Owner, 24 Sep 2026

**Description**: A client looking for "burnout", "relocation" or "career change" today has only the
specialization chips — a fixed list the coach picked from — and the name box (G-027), which
deliberately does not look into bios. Wanted: typing a word finds the coaches who work with it.

Two ways, and they are not either/or:

1. **Search the bios — no new field, works for every coach already listed.** The same search box
   also matches words in `bio1` / `bio2` and the specialization labels. Cheap, and nobody has to
   re-register. The catch: bios are written in EN, RU or EL by the coach, so "выгорание" does not
   find a bio that says "burnout". The name search's transliteration (`name-search.js`) helps with
   the alphabet, not with the language — a translation of the word is a different problem.
2. **A `Keywords` field on registration and edit** — up to ~10 short tags the coach chooses
   ("burnout, leadership, expats"), in the language(s) they expect clients to search in. More
   precise than the bio and under the coach's control; costs a new sheet column, a form field in
   three languages, and only helps once coaches fill it in (existing profiles through the edit link).

**Suggested order:** ship 1 first and watch what people type; add 2 if bios turn out too thin or the
language gap bites. With 31 coaches, searching every bio in the browser is instant — no server
index needed.

**Open**: one box for name and keywords, or a separate one? One box is simpler for the client; the
results then need to say *why* a coach matched (name vs. bio), or a bio hit looks random.
Name search stays as it is (script-independent, prefix-friendly); bio matching is a plain
word match on top.
