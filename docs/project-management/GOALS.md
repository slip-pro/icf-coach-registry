# Goals

## Active Goals

### _(no active goal)_

---

## Future Goals

### G-010: Photo Storage Solution
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05
**Description**: Coach photos auto-copied to chapter's Google Drive via Apps Script. URL in Sheet replaced with stable Drive thumbnail link. Coaches can delete their originals — photos persist.

### G-013: Registration Form Redesign
**Status**: Planned
**Phase**: 1.5
**Description**: Redesign the coach registration form page to match the new ICF brandbook design (cream cards, blue accents, yellow highlights). Currently uses old neutral style.

### G-014: Filter Cleanup + Translation
**Status**: Planned
**Phase**: 1.5
**Description**: Remove unnecessary filter parameters and fix missing translations in filter chips. Specific filters to remove TBD by owner.

### G-006: Conference Landing Workflow
**Status**: Planned
**Phase**: 1.5
**Description**: Workflow for potential clients from conference to access the registry. Details TBD.

### G-005: Embed Widget in WordPress (properly)
**Status**: Blocked
**Phase**: 2
**Description**: Embed the widget directly into the WP page (not via external link). Requires ability to insert `<script>` tags — need to ask WP admin how to do this on the ICF Chapters platform.
**Depends on**: WP admin guidance on custom scripts

### G-011: Coach Profile Editing Workflow
**Status**: Planned
**Phase**: 2
**Description**: Process for coaches to update their profile (new photo, ICF level upgrade, bio changes). Define who does it (coach self-service vs admin) and how. Currently admin edits Google Sheet manually — need a scalable approach as registry grows.

### G-012: ICF Membership Expiration Tracking
**Status**: Backlog (needs input from chapter admin)
**Phase**: 2+
**Description**: Track when a coach's ICF chapter membership expires and auto-hide or flag them in the registry. Need to understand from the responsible colleague: how membership data is tracked, is there an API/export, what's the renewal cycle.
**Action**: Ask responsible colleague about membership tracking process before designing solution.

### G-003: AI Coach Matching Assistant
**Status**: Deferred
**Phase**: 2
**Description**: AI chatbot widget that helps clients find the right coach through a short conversation.

### G-004: Analytics & Optimization
**Status**: Deferred
**Phase**: 2
**Description**: Track page views, filter usage, contact clicks, and AI conversation conversion.

### G-015: Migrate Infrastructure to ICF Cyprus Account
**Status**: Backlog
**Phase**: 2+
**Description**: Move all infrastructure from personal account to official ICF Cyprus account: Google Sheet, Google Drive (photos), Apps Script, Vercel project, GitHub repo. Currently everything runs under the personal account of the board member who set it up.
**Action**: Coordinate with ICF Cyprus admin to create/transfer ownership.

---

## Achieved Goals

### G-010: Photo Storage in Google Drive
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Apps Script auto-copies coach photos to chapter's Google Drive folder on registration. Stable thumbnail URL stored in Sheet.

---

### G-008+G-009: Vercel Deploy + ICF Brandbook Redesign
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

- Deployed to Vercel: https://icf-coach-registry.vercel.app/
- Full redesign per ICF Brand Guidelines 2025
- Colors: Deep Blue #212251, Blue #2b379b, Yellow #efcb30, Bone #f8f0e4
- Typography: Nunito headlines + Plus Jakarta Sans body
- Card hover: Blue bg with white text + yellow tags
- ICF badges: yellow bg default, white bg on hover
- Decorative brush stroke SVGs on background
- ICF logo in header (PNG placeholder, awaiting SVG from designer)
- Title: "Найти коуча" + "ICF Cyprus" in yellow pill badge

**Notes**: `docs/notes/G-008-009.md`

---

### G-005a: Deploy to GitHub Pages
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Catalog deployed at https://slip-pro.github.io/icf-coach-registry/
Linked from WP page Find a Coach. Full WP embed blocked by platform restrictions.

---

### G-002: Coach Registration Flow
**Status**: Achieved
**Phase**: 1
**Completed**: 2026-04-04
**Commit**: 5579d2a

**Acceptance Criteria**:
- [x] Коуч может заполнить и отправить форму без WP-доступа
- [x] Админ получает уведомление и может одобрить/отклонить
- [x] Одобренные коучи появляются в каталоге

**Notes**: `docs/notes/G-002.md`

---

### G-001: MVP Coach Catalog
**Status**: Achieved
**Phase**: 1
**Completed**: 2026-04-03
**Commit**: 884b48b

**Acceptance Criteria**:
- [x] Catalog displays coach cards from Google Sheets data
- [x] All 5 filters work without page reload
- [x] Contact buttons open messenger/email with pre-filled text
- [x] Works on mobile (iOS Safari, Android Chrome)
- [x] UI available in 3 languages

**Notes**: `docs/notes/G-001.md`

---

## Technical Debt

### TD-001: ARIA keyboard navigation in filter dropdown
**Problem**: Specialization dropdown uses `role="listbox"` but lacks arrow key navigation between options
**Fix**: Implement arrow key navigation or change to `role="group"`
**Priority**: Medium
**Source**: G-001 Sprint 1 (audit finding)

### TD-002: WhatsApp number country code assumption
**Problem**: WhatsApp normalization assumes Cyprus prefix (+357) for numbers starting with 0
**Fix**: Document assumption or require full international format
**Priority**: Low
**Source**: G-001 Sprint 1 (audit finding)

### TD-003: CSP compatibility for inline styles
**Problem**: Avatar placeholders use inline `style` attribute for dynamic colors — blocked by strict CSP
**Fix**: Move dynamic color to CSS variable via JS `.style` property
**Priority**: Low
**Source**: G-001 Sprint 1 (audit finding)
