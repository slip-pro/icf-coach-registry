# Goals

## Active Goals

### _(no active goal)_

---

## Future Goals

### G-005: Embed Widget in WordPress (properly)
**Status**: Blocked
**Phase**: 1.5
**Description**: Embed the widget directly into the WP page (not via external link). Requires ability to insert `<script>` tags — need to ask WP admin how to do this on the ICF Chapters platform.
**Depends on**: WP admin guidance on custom scripts

### G-006: Conference Landing Workflow
**Status**: Planned
**Phase**: 1.5
**Description**: Workflow for potential clients from conference to access the registry. Details TBD.

### G-007: Photo Storage in WordPress
**Status**: Planned (after G-005)
**Phase**: 2
**Description**: Upload coach photos to WP Media Library instead of relying on external URLs. Photos become stable and backed up with the site. Currently coaches provide a URL which can break if they delete the source.
**Depends on**: G-005

### G-003: AI Coach Matching Assistant
**Status**: Deferred
**Phase**: 2
**Description**: AI chatbot widget that helps clients find the right coach through a short conversation.

### G-004: Analytics & Optimization
**Status**: Deferred
**Phase**: 2
**Description**: Track page views, filter usage, contact clicks, and AI conversation conversion.

---

## Achieved Goals

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
