# Goals

## Active Goals

### G-002: Coach Registration Flow
**Status**: In progress (Sprint 2)
**Phase**: 1
**Started**: 2026-04-04

**Context**: Каталог (G-001) работает и показывает коучей из Google Sheets. Сейчас добавить коуча может только человек с доступом к таблице. Нужна публичная форма, чтобы коучи ICF Cyprus добавляли себя сами, а админ чаптера модерировал заявки.

**Acceptance Criteria**:
- [ ] Коуч может заполнить и отправить форму без WP-доступа
- [ ] Админ получает уведомление и может одобрить/отклонить
- [ ] Одобренные коучи появляются в каталоге

**Sprint Decomposition**:
- [ ] T1: Google Sheet структура + sheets.js status-фильтрация
- [ ] T2: Registration Form UI (F-008)
- [ ] T3: Google Forms интеграция (POST submit)
- [ ] T4: Admin workflow + инструкции (F-009)
- [ ] T5: Навигация каталог ↔ форма

**Notes**: `docs/notes/G-002.md`

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
