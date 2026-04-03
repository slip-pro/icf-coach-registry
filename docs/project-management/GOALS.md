# Goals

## Active Goals

### G-001: MVP Coach Catalog
**Status**: In progress (Sprint 1)
**Phase**: 1
**Started**: 2026-04-03

**Context**: ICF Cyprus website has a static coach list with no filtering or search. Clients can't find the right coach efficiently. This goal delivers the core catalog — the foundation everything else builds on (registration, AI matching, analytics).

**Acceptance Criteria**:
- [ ] Catalog displays coach cards from Google Sheets data
- [ ] All 5 filters work without page reload
- [ ] Contact buttons open messenger/email with pre-filled text
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] UI available in 3 languages

**Sprint Decomposition**:
- [ ] T1: DESIGN.md + UI spec (@designer)
- [ ] T2: Scaffolding + i18n module
- [ ] T3: Google Sheets integration (F-005)
- [ ] T4: Coach Card component (F-001)
- [ ] T5: Filter Panel + Responsive Layout (F-002, F-006)
- [ ] T6: Contact Buttons (F-003)
- [ ] T7: WP Embedding + final bundle (F-007)

**Notes**: `docs/notes/G-001.md`

---

### G-002: Coach Registration Flow
**Status**: Not started
**Phase**: 1
**Description**: Self-service registration form for new coaches with admin moderation.

**Key Results**:
- [ ] Registration form with all required fields
- [ ] Photo upload
- [ ] Form submission to admin (email or Google Sheets workflow)
- [ ] Moderation process (admin approves -> coach appears in catalog)

**Acceptance Criteria**:
- Coach can fill and submit the form without WP access
- Admin receives notification and can approve/reject
- Approved coaches appear in the catalog

---

## Future Goals (Phase 2)

### G-003: AI Coach Matching Assistant
**Status**: Planned
**Phase**: 2
**Description**: AI chatbot widget that helps clients find the right coach through a short conversation.

### G-004: Analytics & Optimization
**Status**: Planned
**Phase**: 2
**Description**: Track page views, filter usage, contact clicks, and AI conversation conversion.

---

## Achieved Goals

_(none yet)_

---

## Technical Debt

_(none yet — project hasn't started)_
