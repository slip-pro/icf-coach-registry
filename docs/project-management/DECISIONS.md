# Decisions & Workflow

## Development Workflow

### Gates

| Gate | Description | Who |
|------|-------------|-----|
| PRE-GATE | Plan sprint, decompose features into tasks | TPM + Owner |
| GATE 1 | Code review before merge | Claude Code |
| GATE 2 | Audit (security, quality, accessibility) | Auditor agent |
| POST-GATE | Sprint review, retrospective | TPM + Owner |

### Sprint Cycle

1. `/tpm plan` or `/tpm G-XXX` — open sprint with goal
2. `/task` — pick and work on individual features
3. `/done` — close task, tests, commit
4. `/audit` — code quality check
5. `/close` — close sprint, retrospective

### Branching

- `main` — stable, deployable
- `feature/F-NNN-short-name` — per feature branch
- Merge via PR after GATE 1

## Key Decisions Log

### D-001: Google Sheets as data backend
**Date**: 2026-04-03
**Decision**: Use Google Sheets instead of WordPress Custom Post Types
**Rationale**: No WordPress admin access available. Google Sheets allows anyone with sheet access to manage coach data. Simpler to implement and maintain.
**Trade-offs**: No native WP search/SEO for coach profiles. Data size limited (~50 coaches, fine for Sheets).

### D-002: Standalone JS widget (not WP plugin)
**Date**: 2026-04-03
**Decision**: Build a standalone JavaScript application embedded via script tag, not a WordPress plugin
**Rationale**: Decoupled from WP theme. Can be developed and tested independently. Doesn't require WP admin to deploy. Can have its own design language.
**Trade-offs**: No access to WP theme styles/functions. Need to handle CSS isolation.

### D-003: Claude Code as primary developer
**Date**: 2026-04-03
**Decision**: AI writes all code, owner reviews and deploys
**Rationale**: No developer hired. Owner is not a developer but can follow instructions for deployment.
**Trade-offs**: Need extra attention to code quality and testing. Deployment instructions must be clear and step-by-step.
