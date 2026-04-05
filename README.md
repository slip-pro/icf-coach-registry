# ICF Cyprus Coach Registry

Interactive directory of certified ICF coaches in Cyprus. Phase 1 MVP is complete and deployed. Replaces the static list on the ICF Cyprus website with a filterable catalog, contact buttons, and (Phase 2) AI-powered coach matching.

**Live:** https://slip-pro.github.io/icf-coach-registry/

## Features (MVP) -- Implemented

- Coach profile cards with photo, specialization, ICF level, languages, pricing
- Client-side filtering (specialization, language, format, ICF level, price)
- Direct contact via WhatsApp, Telegram, Email with pre-filled messages
- Trilingual UI: English / Russian / Greek
- Google Sheets as data backend
- Coach registration form with Google Apps Script backend
- Deployed on GitHub Pages

## Tech Stack

- Vanilla JavaScript / HTML / CSS
- Google Sheets API for coach data
- No build tools required for MVP (single embeddable script)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/slip-pro/icf-coach-registry.git
cd icf-coach-registry

# Start local dev server
python3 server.py
# Open http://localhost:8000
```

## Documentation

- [Product Vision](docs/PRODUCT_VISION.md)
- [Roadmap](docs/ROADMAP.md)
- [Goals](docs/project-management/GOALS.md)
- [Feature Backlog](docs/project-management/BACKLOG.md)
- [Decisions](docs/project-management/DECISIONS.md)

## License

Private project for ICF Cyprus Chapter.
