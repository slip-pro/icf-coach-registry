# DESIGN.md

## Visual Theme & Atmosphere

**Mood**: Warm, professional, trustworthy. The interface conveys competence and approachability — qualities essential for coaching professionals. It should feel like a curated directory, not a marketplace.

**Density**: Medium. Cards provide enough information for quick scanning while maintaining breathing room. Content-to-whitespace ratio leans toward openness.

**Design philosophy**: Quiet confidence. Minimal decoration, strong typography hierarchy, warm neutral palette. The coaches themselves (their photos, bios, credentials) are the visual focus — the UI recedes.

**Brand alignment**: ICF (International Coaching Federation) — global professional body. The design must feel institutional-grade yet human. No startup energy, no corporate coldness.

**CSS scoping**: All classes use `icf-` BEM prefix to avoid WordPress theme conflicts. The widget renders inside a single container element and must not leak styles.

**Font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (400, 500, 600, 700) — geometric sans-serif with warm, rounded terminals. Loaded via Google Fonts.

---

## Color Palette & Roles

### Core

| Token | Hex | Role |
|-------|-----|------|
| `--icf-bg` | `#f5f5f0` | Page background (warm off-white) |
| `--icf-surface` | `#ffffff` | Card / elevated surface |
| `--icf-text-primary` | `#1a1a1a` | Headings, names, primary text |
| `--icf-text-secondary` | `#555555` | Bio text, contact labels |
| `--icf-text-tertiary` | `#666666` | Meta items (price, format, languages) |
| `--icf-text-muted` | `#999999` | Placeholder text |
| `--icf-text-faint` | `#aaaaaa` | Social labels ("Profiles:") |
| `--icf-border` | `#ebebeb` | Card border |
| `--icf-border-input` | `#e0e0e0` | Input / chip / contact button border |
| `--icf-divider` | `#f0f0f0` | In-card horizontal divider |

### Surfaces & Backgrounds

| Token | Hex | Role |
|-------|-----|------|
| `--icf-tag-bg` | `#f0f0ee` | Tag background, social icon background |
| `--icf-tag-bg-hover` | `#e4e4e0` | Social icon hover |
| `--icf-chip-bg` | `#ffffff` | Filter chip default |
| `--icf-chip-active-bg` | `#1a1a1a` | Filter chip active / lang switch active |
| `--icf-chip-active-text` | `#ffffff` | Filter chip active text |
| `--icf-avatar-fallback` | `#e8e8e8` | Avatar placeholder (when image fails to load) |

### ICF Credential Badges

| Badge | Background | Text | Usage |
|-------|-----------|------|-------|
| MCC | `#fff3cd` | `#7a5c00` | Master Certified Coach (gold) |
| PCC | `#d4edda` | `#155724` | Professional Certified Coach (green) |
| ACC | `#d1ecf1` | `#0c5460` | Associate Certified Coach (teal) |

### Contact Channels

| Channel | Border | Text | Hover BG |
|---------|--------|------|----------|
| WhatsApp | `#25D366` | `#128C7E` | `#f0fff4` |
| Telegram | `#29ABE2` | `#0088cc` | `#f0f8ff` |
| Email | `#e0e0e0` | `#444444` | `#f8f8f8` |

### AI Feature (Phase 2)

| Token | Value | Role |
|-------|-------|------|
| `--icf-ai-gradient-start` | `#1a1a1a` | AI button gradient start |
| `--icf-ai-gradient-end` | `#3a3a3a` | AI button gradient end |
| `--icf-ai-text` | `#ffffff` | AI button text |
| `--icf-ai-sub-opacity` | `0.7` | AI button subtitle opacity |

### Semantic (for future forms, validation, states)

| Token | Hex | Role |
|-------|-----|------|
| `--icf-success` | `#155724` | Success messages |
| `--icf-success-bg` | `#d4edda` | Success background |
| `--icf-warning` | `#7a5c00` | Warning messages |
| `--icf-warning-bg` | `#fff3cd` | Warning background |
| `--icf-info` | `#0c5460` | Info messages |
| `--icf-info-bg` | `#d1ecf1` | Info background |
| `--icf-error` | `#721c24` | Error messages |
| `--icf-error-bg` | `#f8d7da` | Error background |

---

## Typography Rules

**Font family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Element | Size | Weight | Line-height | Letter-spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Page title (H1) | 28px | 700 | 1.2 | 0 | `#1a1a1a` |
| Section heading (H2) | 22px | 700 | 1.3 | 0 | `#1a1a1a` |
| Card subheading (H3) | 17px | 700 | 1.3 | 0 | `#1a1a1a` |
| Body / Bio | 14px | 400 | 1.6 | 0 | `#555555` |
| AI button text | 16px | 600 | 1.4 | 0 | `#ffffff` |
| Filter chip | 14px | 400 | 1.4 | 0 | `#444444` |
| Meta item | 13px | 400 | 1.4 | 0 | `#666666` |
| Contact link | 13px | 600 | 1.4 | 0 | `#1a1a1a` |
| Contact label | 13px | 400 | 1.6 | 0 | `#555555` |
| Tag | 12px | 500 | 1.4 | 0 | `#444444` |
| ICF Badge | 11px | 600 | 1.2 | 0.5px | varies (see badges) |
| Social label | 12px | 400 | 1.4 | 0 | `#aaaaaa` |
| AI button subtitle | 13px | 400 | 1.4 | 0 | `#ffffff` (70% opacity) |
| Lang switch button | 13px | 500 | 1.4 | 0 | `#666666` |
| Overline / caption | 11px | 600 | 1.3 | 0.5px | `#666666` |

### Text truncation

- Bio text: 3-line clamp (`-webkit-line-clamp: 3`)
- Card name: no truncation (allow natural wrap)

---

## Component Stylings

### Card (`icf-card`)

| Property | Value |
|----------|-------|
| Background | `#ffffff` |
| Border | 1px solid `#ebebeb` |
| Border-radius | 16px |
| Padding | 24px |
| Gap (internal) | 16px |
| Display | flex, column |

**States:**
- Default: no shadow
- Hover: `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)`
- Transition: `box-shadow 0.2s ease`

### Avatar (`icf-avatar`)

| Property | Value |
|----------|-------|
| Size | 64px x 64px |
| Border-radius | 50% (circle) |
| Object-fit | cover |
| Flex-shrink | 0 |

**Placeholder variant** (`icf-avatar-placeholder`):
- Same dimensions
- Background: per-coach generated color (e.g. `#2d6a4f`, `#5e548e`, `#c77dff`)
- Text: initials, 22px, weight 700, color `#ffffff`
- Centered (flex align + justify)

### ICF Badge (`icf-badge`)

| Property | Value |
|----------|-------|
| Display | inline-flex |
| Align-items | center |
| Gap | 4px |
| Font-size | 11px |
| Font-weight | 600 |
| Letter-spacing | 0.5px |
| Padding | 3px 8px |
| Border-radius | 6px |
| Text-transform | uppercase |

Variants: `.icf-badge--mcc`, `.icf-badge--pcc`, `.icf-badge--acc` (see color table above).

Badge icons: MCC uses `✦`, PCC uses `▲`, ACC uses `●`.

### Filter Chip (`icf-filter-chip`)

| Property | Value |
|----------|-------|
| Background | `#ffffff` |
| Border | 1px solid `#e0e0e0` |
| Border-radius | 20px (pill) |
| Padding | 8px 16px |
| Font-size | 14px |
| Color | `#444444` |
| Gap (icon + text) | 6px |
| Icon size | 14px x 14px |

**States:**
- Default: white bg, `#e0e0e0` border
- Hover: border-color `#999999`
- Active: bg `#1a1a1a`, color `#ffffff`, border-color `#1a1a1a`

### Language Switch (`icf-lang-switch`)

| Property | Value |
|----------|-------|
| Container bg | `#ffffff` |
| Container border | 1px solid `#e0e0e0` |
| Container border-radius | 8px |
| Container padding | 4px |
| Gap between buttons | 4px |
| Button padding | 6px 12px |
| Button border-radius | 6px |
| Button font-size | 13px |
| Button font-weight | 500 |

**States:**
- Default: no bg, color `#666666`
- Active: bg `#1a1a1a`, color `#ffffff`

### Contact Link (`icf-contact-link`)

| Property | Value |
|----------|-------|
| Display | inline-flex |
| Align-items | center |
| Gap | 5px |
| Font-size | 13px |
| Font-weight | 600 |
| Padding | 6px 12px |
| Border-radius | 8px |
| Border | 1px solid `#e0e0e0` |
| Icon size | 15px x 15px |
| Transition | `all 0.15s ease` |

Variants: `.icf-contact-link--whatsapp`, `.icf-contact-link--telegram`, `.icf-contact-link--email` (see contact channel colors above).

### Social Icon (`icf-social-icon`)

| Property | Value |
|----------|-------|
| Size | 30px x 30px |
| Border-radius | 8px |
| Background | `#f0f0ee` |
| Icon size | 16px x 16px |
| Icon color | `#555555` |
| Transition | `background 0.15s ease` |

**States:**
- Default: bg `#f0f0ee`
- Hover: bg `#e4e4e0`

### Tag (`icf-tag`)

| Property | Value |
|----------|-------|
| Background | `#f0f0ee` |
| Color | `#444444` |
| Font-size | 12px |
| Font-weight | 500 |
| Padding | 4px 10px |
| Border-radius | 6px |

### Divider (`icf-divider`)

| Property | Value |
|----------|-------|
| Border | none |
| Border-top | 1px solid `#f0f0f0` |
| Margin | 0 (gap handled by card flex) |

### AI Button (`icf-ai-button`) (Phase 2)

| Property | Value |
|----------|-------|
| Background | `linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)` |
| Color | `#ffffff` |
| Border | none |
| Border-radius | 14px |
| Padding | 18px 28px |
| Font-size | 16px |
| Font-weight | 600 |
| Width | 100% |
| Display | flex, center |
| Gap | 10px |
| Transition | `opacity 0.2s ease` |

**States:**
- Default: full opacity
- Hover: `opacity: 0.9`

Subtitle span: 13px, weight 400, opacity 0.7.

### Input / Search (future)

| Property | Value |
|----------|-------|
| Background | `#ffffff` |
| Border | 1px solid `#e0e0e0` |
| Border-radius | 10px |
| Padding | 10px 16px |
| Font-size | 14px |
| Color | `#1a1a1a` |
| Placeholder color | `#999999` |

**States:**
- Focus: border-color `#1a1a1a`, outline none
- Error: border-color `#721c24`

---

## Layout Principles

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--icf-space-1` | 4px | Minimal gaps (lang switch buttons) |
| `--icf-space-2` | 6px | Tag gap, badge gap, card-name margin-bottom |
| `--icf-space-3` | 8px | Social icon gap, chip padding vertical |
| `--icf-space-4` | 10px | Filter gap, contact links gap, social margin-top |
| `--icf-space-5` | 12px | Meta gap, contact link padding horizontal |
| `--icf-space-6` | 14px | Card-top gap |
| `--icf-space-7` | 16px | Card internal gap, page-header gap, chip padding horizontal |
| `--icf-space-8` | 20px | Grid gap, body padding horizontal |
| `--icf-space-9` | 24px | Card padding |
| `--icf-space-10` | 28px | AI button padding horizontal |
| `--icf-space-11` | 32px | Section margin-bottom (filters, header) |
| `--icf-space-12` | 40px | Body padding vertical |

### Grid

| Property | Value |
|----------|-------|
| Max-width | 1100px |
| Margin | 0 auto |
| Display | grid |
| Columns | `repeat(auto-fill, minmax(320px, 1fr))` |
| Gap | 20px |

### Content widths

| Element | Max-width |
|---------|-----------|
| Page container | 1100px |
| Card minimum | 320px |
| Card maximum | 1fr (fluid) |

### Whitespace philosophy

- Generous internal card padding (24px) for readability
- Section spacing (32px) creates clear visual separation
- 20px grid gap is tight enough for scanning but open enough to avoid crowding
- Body has 40px top/bottom, 20px left/right padding

---

## Depth & Elevation

### Shadow Scale

| Level | Value | Usage |
|-------|-------|-------|
| `--icf-shadow-none` | `none` | Card default |
| `--icf-shadow-sm` | `0 1px 3px rgba(0, 0, 0, 0.04)` | Subtle elevation (future: dropdowns) |
| `--icf-shadow-md` | `0 4px 20px rgba(0, 0, 0, 0.08)` | Card hover |
| `--icf-shadow-lg` | `0 8px 30px rgba(0, 0, 0, 0.12)` | Modal / overlay (future: AI chat panel) |
| `--icf-shadow-xl` | `0 12px 40px rgba(0, 0, 0, 0.16)` | Full-screen overlay |

### Surface Hierarchy

1. **Page background** (`#f5f5f0`) — base layer
2. **Card surface** (`#ffffff` + border) — content layer
3. **Elevated surface** (`#ffffff` + shadow-md) — hover / interactive layer
4. **Overlay** (`#ffffff` + shadow-lg) — modal / panel layer

### Z-index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--icf-z-base` | 0 | Default |
| `--icf-z-card` | 1 | Cards on hover (optional) |
| `--icf-z-dropdown` | 10 | Filter dropdowns |
| `--icf-z-modal` | 100 | AI chat panel, modals |
| `--icf-z-overlay` | 200 | Backdrop behind modal |
| `--icf-z-toast` | 300 | Toast notifications |

---

## Do's and Don'ts

### Do

- Use warm off-white (`#f5f5f0`) as page background — it softens the screen and feels approachable
- Keep cards visually equal — no card should draw more attention than another by default
- Use ICF badge colors consistently (MCC=gold, PCC=green, ACC=teal) — these are industry-standard
- Maintain 3-line bio clamp — enough to inform, not enough to overwhelm
- Scope all CSS with `icf-` prefix — this widget lives inside WordPress
- Use the same font (Plus Jakarta Sans) everywhere — no mixing typefaces
- Respect coach data language — display names, bios, and tags as the coach wrote them (no auto-translation)
- Make contact buttons clearly tappable with sufficient padding

### Don't

- Don't use pure white (`#ffffff`) as page background — it looks clinical and harsh
- Don't use pure black (`#000000`) for text — `#1a1a1a` is softer
- Don't add decorative gradients, patterns, or illustrations to cards — let content speak
- Don't rank or highlight individual coaches above others — this is a peer directory, not a marketplace
- Don't use red for non-error purposes — reserve it for validation states
- Don't animate card entry on initial load — show content immediately for perceived performance
- Don't use shadows on cards at rest — only on hover. The border provides sufficient boundary
- Don't break the 1100px max-width — it maintains comfortable reading width
- Don't use icon-only contact buttons — always include text labels for accessibility
- Don't auto-play any media or animation in cards

---

## Responsive Behavior

### Breakpoints

| Name | Value | Columns | Behavior |
|------|-------|---------|----------|
| Mobile | < 640px | 1 column | Cards stack, full-width. Filters scroll horizontally. Page padding 16px. |
| Tablet | 640px - 1024px | 2 columns | Grid fills. Filters wrap. |
| Desktop | > 1024px | 3 columns (at 1100px) | Full grid. All filters visible. |

### Grid behavior

The grid uses `auto-fill, minmax(320px, 1fr)` which handles responsiveness natively:
- At 1100px: 3 columns (320px each + gaps)
- At ~700px: 2 columns
- At <640px: 1 column (320px min ensures single column)

### Touch targets

- All interactive elements: minimum 44px touch target height
- Contact buttons: 6px + 13px line-height + 6px = ~31px rendered, pad to 44px with outer spacing
- Filter chips: 8px + 14px + 8px = 30px rendered, acceptable when wrapped in 44px touch area
- Social icons: 30px rendered — wrap in 44px hitbox via padding or min-height

### Mobile-specific adaptations

- Page title: consider reducing to 24px on mobile
- Filter bar: horizontal scroll with `-webkit-overflow-scrolling: touch`, hide scrollbar
- AI button: reduce padding to 14px 20px on mobile
- Card padding: reduce to 20px on narrow screens
- Avatar: keep 64px (important for recognition)
- Lang switch: keep same size (compact enough)

### Collapsing strategy

- Filters: horizontal scroll on mobile (no wrapping to prevent excessive vertical space)
- Social icons: keep inline (they are compact at 30px)
- Contact links: allow wrapping (already handled by flex-wrap)
- Meta items: allow wrapping (already handled by flex-wrap)

---

## Agent Prompt Guide

### Quick color reference

When building UI for ICF Cyprus, use these values:

```
Page background:     #f5f5f0  (warm off-white, NOT pure white)
Card surface:        #ffffff  (white cards on warm background)
Card border:         #ebebeb  (subtle, low-contrast border)
Primary text:        #1a1a1a  (near-black, NOT pure black)
Secondary text:      #555555  (bios, descriptions)
Tertiary text:       #666666  (meta info, prices)
Muted text:          #aaaaaa  (labels, hints)
Input border:        #e0e0e0  (interactive element borders)
Tag background:      #f0f0ee  (warm neutral chip fill)
Active state:        #1a1a1a bg + #ffffff text (inverted)
Divider:             #f0f0f0  (barely visible separator)
```

### Badge colors (NEVER change — ICF credential standard)

```
MCC (Master):       bg #fff3cd, text #7a5c00  (gold)
PCC (Professional): bg #d4edda, text #155724  (green)
ACC (Associate):    bg #d1ecf1, text #0c5460  (teal)
```

### Contact brand colors

```
WhatsApp:  border #25D366, text #128C7E, hover bg #f0fff4
Telegram:  border #29ABE2, text #0088cc, hover bg #f0f8ff
Email:     border #e0e0e0, text #444444, hover bg #f8f8f8
```

### Ready-to-use prompts

**"Create a new card-style component"**
Use white background, 1px #ebebeb border, 16px border-radius, 24px padding. Hover: 0 4px 20px rgba(0,0,0,0.08). Internal layout: flex column with 16px gap. Font: Plus Jakarta Sans.

**"Create a filter/chip element"**
White background, 1px #e0e0e0 border, 20px border-radius (pill), 8px 16px padding, 14px font-size. Active: #1a1a1a bg, white text. Hover: border-color #999.

**"Create an action button"**
For primary: linear-gradient(135deg, #1a1a1a, #3a3a3a), white text, 14px border-radius, 18px 28px padding, 16px font-size weight 600. Hover: opacity 0.9.

**"Add a credential badge"**
11px uppercase, 600 weight, 0.5px letter-spacing, 3px 8px padding, 6px border-radius. Use MCC/PCC/ACC color pairs from badge table.

**"Style a tag/label"**
12px, 500 weight, #f0f0ee background, #444 text, 4px 10px padding, 6px border-radius.
