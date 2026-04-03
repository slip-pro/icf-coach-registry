# Feature Backlog

## G-001: MVP Coach Catalog

### F-001: Coach Card Component
**Priority**: High
**Description**: Render a coach profile card with photo, name, ICF badge, specializations, languages, format, price range, bio excerpt, contact buttons, and social icons.
**Acceptance Criteria**:
- All fields from concept section 5 are displayed
- Missing optional fields (WhatsApp, Telegram, socials) are gracefully hidden
- ICF level shown as colored badge (ACC/PCC/MCC/Member)
- Card is responsive (stacks well on mobile)

### F-002: Filter Panel
**Priority**: High
**Description**: Client-side filtering without page reload.
**Filters**: Specialization (multi-select), Language (multi-select), Format (online/offline/both), ICF level (ACC/PCC/MCC), Price range (slider).
**Acceptance Criteria**:
- Filters combine with AND logic
- Results update instantly
- Active filters shown as chips
- "Clear all" resets filters
- Empty state: "No coaches match your criteria"

### F-003: Contact Buttons
**Priority**: High
**Description**: Dynamic contact row per coach with pre-filled messages.
**Channels**: WhatsApp (`wa.me`), Telegram (`t.me`), Email (`mailto:`), social icons (Instagram, LinkedIn, Facebook — link only).
**Acceptance Criteria**:
- Only channels the coach provided are shown
- Pre-filled message includes coach name
- Works on mobile (opens native apps)

### F-004: Language Switcher (i18n)
**Priority**: High
**Description**: Toggle UI language between EN / RU / EL.
**Acceptance Criteria**:
- All UI strings (labels, placeholders, buttons) translated
- Coach profiles shown as-is (in whatever language the coach wrote)
- Language preference persisted (localStorage)
- Default language matches browser locale or falls back to EN

### F-005: Google Sheets Integration
**Priority**: High
**Description**: Read coach data from a Google Sheet (public or API-based).
**Acceptance Criteria**:
- Coach data fetched on page load
- Handles empty/malformed rows gracefully
- Loading state while data fetches
- Data refreshes on page reload (no stale cache issues)

### F-006: Responsive Layout
**Priority**: High
**Description**: Mobile-first grid layout for coach cards.
**Acceptance Criteria**:
- 1 column on mobile, 2 on tablet, 3 on desktop
- Cards maintain consistent height
- Touch-friendly filter chips and buttons
- No horizontal scroll

### F-007: WordPress Embedding
**Priority**: Medium
**Description**: Package the widget for embedding into a WP page.
**Acceptance Criteria**:
- Single script tag or shortcode to embed
- Works inside WP page content area
- No conflicts with WP theme CSS/JS
- Loads fast (< 3s on 3G)

---

## G-002: Coach Registration Flow

### F-008: Registration Form
**Priority**: Medium
**Description**: Web form for coaches to submit their profile.
**Fields**: All from concept section 5 + ICF membership number/email.
**Acceptance Criteria**:
- Form validates required fields
- Photo upload with preview
- Submission confirmation message
- Data goes to Google Sheet (new tab or separate sheet) for admin review

### F-009: Admin Moderation
**Priority**: Medium
**Description**: Simple workflow for admin to approve/reject coach submissions.
**Acceptance Criteria**:
- Admin gets email notification on new submission
- Admin can approve (move to main sheet) or reject
- Approved coaches appear in catalog on next page load

---

## G-003: AI Coach Matching (Phase 2)

### F-010: AI Chatbot Widget
**Priority**: Low (Phase 2)
**Description**: Conversational assistant for coach matching.

### F-011: AI Topic Auto-fill
**Priority**: Low (Phase 2)
**Description**: Auto-insert coaching topic from AI conversation into contact pre-fill.

---

## G-004: Analytics (Phase 2)

### F-012: Usage Analytics
**Priority**: Low (Phase 2)
**Description**: Track page views, filter usage, contact button clicks.
