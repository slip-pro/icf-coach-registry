# Roadmap: ICF Cyprus Coach Registry

## Current Stage: Pre-development

Concept approved (v4), HTML mockup of coach card exists, brandbook available.
No code yet. WordPress access pending.

---

## Phase 1 — MVP (target: 3-5 weeks)

**Theme**: Working coach catalog with filtering and contact

### Capabilities
- Coach card grid with all profile fields (photo, name, specialization, ICF level, languages, format, price, bio, contacts)
- Client-side filtering: specialization, language, format, ICF level, price range
- Contact buttons: WhatsApp, Telegram, Email (pre-filled messages), social media icons
- 3-language UI: EN / RU / EL (language switcher)
- Google Sheets as data backend
- Self-registration form for coaches (with admin moderation)
- Migration of existing coaches from the static list
- Embedded into WordPress page (`/find-a-coach/`)

### Dependencies
- WordPress page access (embed code or custom page template)
- Google Sheets structure finalized
- Coach data migrated from current static list
- ICF brand guidelines applied

---

## Phase 2 — AI Assistant & Analytics

**Theme**: Smart coach matching + data-driven improvements

### Capabilities
- AI chatbot widget for coach matching (Scenario A: directed, Scenario B: cold audience)
- Auto-insert coaching topic into pre-filled contact messages
- Analytics: page views, contact clicks, conversion tracking
- Possible: reviews/testimonials, self-service profile editing

### Dependencies
- AI API provider selected and budgeted (~$10-30/month)
- Phase 1 stable and adopted by coaches

---

## Strategic Decisions

| Decision | Status |
|----------|--------|
| Google Sheets as data backend (not WordPress CPT) | Decided — no WP admin access needed |
| Standalone JS widget embedded in WP | Decided — decoupled from WP theme |
| AI provider (Claude / GPT / other) | Deferred to Phase 2 |
| Coach self-editing via WP account | Deferred to Phase 2+ |
