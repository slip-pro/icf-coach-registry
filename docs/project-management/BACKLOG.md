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

## G-027: Find a Coach by Name

### F-025: Name search in the catalogue
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

**Worth deciding before building**:
- Match on a substring, or on whole words? Substring is kinder for partial spellings.
- Case and accents: Cypriot names carry Greek spellings and diacritics, and people type them without.
  Normalise both sides — the registry already does something similar when building slugs.
- Should it search anything besides the name — the bio, the specialisations written in free text?
  A search that quietly matches a bio surprises people; keeping it to the name is honest and
  predictable. Recommend name only, at least at first.
- Placement: above the filter chips rather than among them. It is a different kind of action.

**Not in scope**: fuzzy or phonetic matching. Worth it only if real use shows people misspelling
names, and there is no usage data yet (see F-012).
