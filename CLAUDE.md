# ICF Cyprus Coach Registry

## Overview

Interactive coach directory for ICF Cyprus website (`icf-chapters.org/icf-cyprus/find-a-coach/`).
Replaces the current static HTML list with a filterable catalog + AI matching assistant.

## Stack

- **Frontend**: Vanilla JavaScript / HTML / CSS (embeddable widget for WordPress page)
- **Data**: Google Sheets as backend (via Google Sheets API or CSV export)
- **AI (Phase 2)**: TBD — chatbot for coach matching
- **Hosting**: Embedded into existing WordPress site as a custom page
- **Languages**: 3 UI languages — EN / RU / EL

## Project Structure

```
/
├── CLAUDE.md                          # This file
├── DESIGN.md                          # Design system tokens
├── README.md                          # Project overview
├── docs/
│   ├── project-management/
│   │   ├── GOALS.md                   # Sprint goals
│   │   ├── BACKLOG.md                 # Feature backlog
│   │   └── DECISIONS.md               # Workflow & gates
│   └── architecture/
│       └── decisions/                 # ADRs
├── temp/                              # Source materials (concept, mockup, brandbook)
├── src/                               # Application source (TBD)
└── public/                            # Static assets (TBD)
```

## Key Docs

| Document | Path |
|----------|------|
| Product Vision | `docs/PRODUCT_VISION.md` |
| Roadmap | `docs/ROADMAP.md` |
| Goals | `docs/project-management/GOALS.md` |
| Backlog | `docs/project-management/BACKLOG.md` |
| Decisions | `docs/project-management/DECISIONS.md` |
| Original Concept | `temp/ICF_Cyprus_Coach_Registry_Concept.md` |
| Card Mockup | `temp/coach_card_mockup.html` |
| ICF Brandbook | `temp/ICF Brand Guidelines 2025-09-08.pdf` |

## Conventions

- UI text must support 3 languages: EN, RU, EL
- Coach data lives in Google Sheets — no WordPress admin required
- The widget is a standalone JS app embedded in a WP page
- Mobile-first responsive design
- Follow ICF brand guidelines (see brandbook in temp/)

## Commands

```bash
# TBD — will be defined when src/ is created
```
