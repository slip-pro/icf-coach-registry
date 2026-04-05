# DESIGN.md

## Visual Theme & Atmosphere

**Mood**: Human, warm, empowering. The interface conveys the ICF philosophy: a human approach to coaching. It should feel professional yet approachable — like a curated directory of trusted professionals, not a marketplace.

**Density**: Medium. Cards provide enough information for quick scanning while maintaining breathing room. Content-to-whitespace ratio leans toward openness.

**Design philosophy**: Warm confidence. Deep blue grounds the visual hierarchy with authority. Bone warmth prevents clinical coldness. Yellow accents draw the eye to actions. The coaches themselves (their photos, bios, credentials) are the visual focus — the UI recedes.

**Brand alignment**: ICF (International Coaching Federation) — global professional body. Color priority: Deep Blue > Blue > Bone > Light Blue > Yellow > White. The palette communicates institutional trust through depth (deep blue) and human warmth through texture (bone, yellow).

**Chapter identity**: ICF Cyprus uses light blue (#5778fa) as its chapter accent, distinguishing it within the ICF family while maintaining brand coherence.

**CSS scoping**: All classes use `icf-` BEM prefix to avoid WordPress theme conflicts. The widget renders inside a single container element and must not leak styles.

**Fonts**:
- Headlines: [Nunito](https://fonts.google.com/specimen/Nunito) (700, 800) — rounded sans-serif, warm and approachable. Google Fonts fallback for Hoss Round (ICF brand headline font).
- Body: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (400, 500, 600, 700) — geometric sans-serif with warm, rounded terminals.
- Both loaded via Google Fonts.

---

## Color Palette & Roles

### Core — ICF Brand Palette

| Token | Hex | Role | Brand name |
|-------|-----|------|------------|
| `--icf-bg` | `#f8f0e4` | Page background (warm bone) | Bone |
| `--icf-surface` | `#ffffff` | Card / elevated surface | White |
| `--icf-text-primary` | `#212251` | Headings, names, primary text | Deep Blue |
| `--icf-text-secondary` | `#2b379b` | Bio text, section labels | Blue |
| `--icf-text-tertiary` | `#666666` | Meta items (price, format, languages) | — |
| `--icf-text-muted` | `#999999` | Placeholder text | — |
| `--icf-text-faint` | `#aaaaaa` | Social labels ("Profiles:") | — |
| `--icf-accent` | `#5778fa` | Chapter accent, decorative, large text | Light Blue |
| `--icf-accent-text` | `#4662e0` | Links, interactive text (WCAG AA safe) | Light Blue (dark) |
| `--icf-cta` | `#efcb30` | CTA buttons, highlights | Yellow |
| `--icf-cta-hover` | `#e0bc20` | CTA hover state | Yellow (dark) |
| `--icf-border` | `#e0dcd4` | Card border (warm neutral) | — |
| `--icf-border-input` | `#d8d2c8` | Input / chip / contact button border | — |
| `--icf-divider` | `#ede5d8` | In-card horizontal divider | — |

### Surfaces & Backgrounds

| Token | Hex | Role |
|-------|-----|------|
| `--icf-tag-bg` | `#ede5d8` | Tag background, social icon background |
| `--icf-tag-bg-hover` | `#e0d8ca` | Social icon hover |
| `--icf-chip-bg` | `#ffffff` | Filter chip default |
| `--icf-chip-active-bg` | `#212251` | Filter chip active / lang switch active |
| `--icf-chip-active-text` | `#ffffff` | Filter chip active text |
| `--icf-avatar-fallback` | `#e8e0d4` | Avatar placeholder (when image fails to load) |

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
| Email | `#d8d2c8` | `#212251` | `#f8f0e4` |

### AI Feature (Phase 2)

| Token | Value | Role |
|-------|-------|------|
| `--icf-ai-gradient-start` | `#212251` | AI button gradient start (Deep Blue) |
| `--icf-ai-gradient-end` | `#2b379b` | AI button gradient end (Blue) |
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

**Headline font family**: `'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Body font family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Element | Font | Size | Weight | Line-height | Letter-spacing | Color |
|---------|------|------|--------|-------------|----------------|-------|
| Page title (H1) | Nunito | 28px | 800 | 1.2 | 0 | `#212251` |
| Section heading (H2) | Nunito | 22px | 700 | 1.3 | 0 | `#212251` |
| Card name (H3) | Nunito | 17px | 700 | 1.3 | 0 | `#212251` |
| Body / Bio | Plus Jakarta Sans | 14px | 400 | 1.6 | 0 | `#2b379b` |
| AI button text | Plus Jakarta Sans | 16px | 600 | 1.4 | 0 | `#ffffff` |
| Filter chip | Plus Jakarta Sans | 14px | 400 | 1.4 | 0 | `#212251` |
| Meta item | Plus Jakarta Sans | 13px | 400 | 1.4 | 0 | `#666666` |
| Contact link | Plus Jakarta Sans | 13px | 600 | 1.4 | 0 | `#212251` |
| Contact label | Plus Jakarta Sans | 13px | 400 | 1.6 | 0 | `#2b379b` |
| Tag | Plus Jakarta Sans | 12px | 500 | 1.4 | 0 | `#212251` |
| ICF Badge | Plus Jakarta Sans | 11px | 600 | 1.2 | 0.5px | varies (see badges) |
| Social label | Plus Jakarta Sans | 12px | 400 | 1.4 | 0 | `#aaaaaa` |
| AI button subtitle | Plus Jakarta Sans | 13px | 400 | 1.4 | 0 | `#ffffff` (70% opacity) |
| Lang switch button | Plus Jakarta Sans | 13px | 500 | 1.4 | 0 | `#666666` |
| Overline / caption | Plus Jakarta Sans | 11px | 600 | 1.3 | 0.5px | `#666666` |
| Link text | Plus Jakarta Sans | inherit | 500 | inherit | 0 | `#4662e0` |

### Text truncation

- Bio text: 3-line clamp (`-webkit-line-clamp: 3`)
- Card name: no truncation (allow natural wrap)

---

## Component Stylings

### Card (`icf-card`)

| Property | Value |
|----------|-------|
| Background | `#ffffff` |
| Border | 1px solid `#e0dcd4` |
| Border-radius | 16px |
| Padding | 24px |
| Gap (internal) | 16px |
| Display | flex, column |

**States:**
- Default: no shadow
- Hover: `box-shadow: 0 4px 20px rgba(33, 34, 81, 0.08)`
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
- Background: per-coach generated color (e.g. `#2b379b`, `#5778fa`, `#212251`)
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
| Border | 1px solid `#d8d2c8` |
| Border-radius | 20px (pill) |
| Padding | 8px 16px |
| Font-size | 14px |
| Color | `#212251` |
| Gap (icon + text) | 6px |
| Icon size | 14px x 14px |

**States:**
- Default: white bg, `#d8d2c8` border
- Hover: border-color `#2b379b`
- Active: bg `#212251`, color `#ffffff`, border-color `#212251`

### Language Switch (`icf-lang-switch`)

| Property | Value |
|----------|-------|
| Container bg | `#ffffff` |
| Container border | 1px solid `#d8d2c8` |
| Container border-radius | 8px |
| Container padding | 4px |
| Gap between buttons | 4px |
| Button padding | 6px 12px |
| Button border-radius | 6px |
| Button font-size | 13px |
| Button font-weight | 500 |

**States:**
- Default: no bg, color `#666666`
- Active: bg `#212251`, color `#ffffff`

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
| Border | 1px solid `#d8d2c8` |
| Icon size | 15px x 15px |
| Transition | `all 0.15s ease` |

Variants: `.icf-contact-link--whatsapp`, `.icf-contact-link--telegram`, `.icf-contact-link--email` (see contact channel colors above).

### Social Icon (`icf-social-icon`)

| Property | Value |
|----------|-------|
| Size | 30px x 30px |
| Border-radius | 8px |
| Background | `#ede5d8` |
| Icon size | 16px x 16px |
| Icon color | `#2b379b` |
| Transition | `background 0.15s ease` |

**States:**
- Default: bg `#ede5d8`
- Hover: bg `#e0d8ca`

### Tag (`icf-tag`)

| Property | Value |
|----------|-------|
| Background | `#ede5d8` |
| Color | `#212251` |
| Font-size | 12px |
| Font-weight | 500 |
| Padding | 4px 10px |
| Border-radius | 6px |

### Divider (`icf-divider`)

| Property | Value |
|----------|-------|
| Border | none |
| Border-top | 1px solid `#ede5d8` |
| Margin | 0 (gap handled by card flex) |

### Primary Button / CTA (`icf-btn-primary`)

| Property | Value |
|----------|-------|
| Background | `#efcb30` |
| Color | `#212251` |
| Border | none |
| Border-radius | 14px |
| Padding | 14px 24px |
| Font-size | 15px |
| Font-weight | 700 |
| Font-family | Nunito |
| Transition | `background 0.2s ease` |

**States:**
- Default: bg `#efcb30`, color `#212251`
- Hover: bg `#e0bc20`
- Focus: `outline: 2px solid #5778fa; outline-offset: 2px`

### Secondary Button (`icf-btn-secondary`)

| Property | Value |
|----------|-------|
| Background | transparent |
| Color | `#212251` |
| Border | 2px solid `#212251` |
| Border-radius | 14px |
| Padding | 12px 22px |
| Font-size | 15px |
| Font-weight | 600 |
| Font-family | Nunito |

**States:**
- Default: transparent bg, Deep Blue border + text
- Hover: bg `#212251`, color `#ffffff`

### AI Button (`icf-ai-button`) (Phase 2)

| Property | Value |
|----------|-------|
| Background | `linear-gradient(135deg, #212251 0%, #2b379b 100%)` |
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
| Border | 1px solid `#d8d2c8` |
| Border-radius | 10px |
| Padding | 10px 16px |
| Font-size | 14px |
| Color | `#212251` |
| Placeholder color | `#999999` |

**States:**
- Focus: border-color `#5778fa`, outline none, `box-shadow: 0 0 0 3px rgba(87, 120, 250, 0.15)`
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
- Bone background provides inherent visual warmth — whitespace feels inviting, not empty

---

## Depth & Elevation

### Shadow Scale

| Level | Value | Usage |
|-------|-------|-------|
| `--icf-shadow-none` | `none` | Card default |
| `--icf-shadow-sm` | `0 1px 3px rgba(33, 34, 81, 0.04)` | Subtle elevation (future: dropdowns) |
| `--icf-shadow-md` | `0 4px 20px rgba(33, 34, 81, 0.08)` | Card hover |
| `--icf-shadow-lg` | `0 8px 30px rgba(33, 34, 81, 0.12)` | Modal / overlay (future: AI chat panel) |
| `--icf-shadow-xl` | `0 12px 40px rgba(33, 34, 81, 0.16)` | Full-screen overlay |

### Surface Hierarchy

1. **Page background** (`#f8f0e4` Bone) — base layer
2. **Card surface** (`#ffffff` + warm border) — content layer
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

- Use Bone (`#f8f0e4`) as page background — it provides the warm, human feel central to the ICF brand
- Use Deep Blue (`#212251`) as the primary text and UI weight color — it anchors the visual hierarchy
- Use Yellow (`#efcb30`) exclusively for CTAs and highlights — it draws the eye without overwhelming
- Keep cards visually equal — no card should draw more attention than another by default
- Use ICF badge colors consistently (MCC=gold, PCC=green, ACC=teal) — these are industry-standard
- Maintain 3-line bio clamp — enough to inform, not enough to overwhelm
- Scope all CSS with `icf-` prefix — this widget lives inside WordPress
- Use Nunito for headlines and Plus Jakarta Sans for body — two complementary warm sans-serifs
- Respect coach data language — display names, bios, and tags as the coach wrote them (no auto-translation)
- Make contact buttons clearly tappable with sufficient padding
- Use Light Blue (`#5778fa`) as the chapter accent for decorative elements and large text
- Use the accessible link color (`#4662e0`) for inline text links on white/bone backgrounds

### Don't

- Don't use pure white (`#ffffff`) as page background — Bone is the ICF brand surface
- Don't use pure black (`#000000`) for text — Deep Blue (`#212251`) is the brand text color
- Don't use Light Blue (`#5778fa`) for small body text — it fails WCAG AA. Use `#4662e0` instead
- Don't add decorative gradients, patterns, or illustrations to cards — let content speak
- Don't rank or highlight individual coaches above others — this is a peer directory, not a marketplace
- Don't use red for non-error purposes — reserve it for validation states
- Don't animate card entry on initial load — show content immediately for perceived performance
- Don't use shadows on cards at rest — only on hover. The border provides sufficient boundary
- Don't break the 1100px max-width — it maintains comfortable reading width
- Don't use icon-only contact buttons — always include text labels for accessibility
- Don't auto-play any media or animation in cards
- Don't mix font families within a single element — Nunito for headlines only, Plus Jakarta Sans for everything else

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
Page background:     #f8f0e4  (Bone — warm off-white, NOT pure white)
Card surface:        #ffffff  (white cards on warm background)
Card border:         #e0dcd4  (warm neutral border)
Primary text:        #212251  (Deep Blue — NOT pure black)
Secondary text:      #2b379b  (Blue — bios, descriptions)
Tertiary text:       #666666  (meta info, prices)
Muted text:          #aaaaaa  (labels, hints)
Input border:        #d8d2c8  (warm neutral, interactive element borders)
Tag background:      #ede5d8  (warm neutral chip fill)
Active state:        #212251 bg + #ffffff text (Deep Blue inverted)
Divider:             #ede5d8  (warm, subtle separator)
Accent:              #5778fa  (Light Blue — decorative, large text only)
Link text:           #4662e0  (accessible link color on white/bone)
CTA button:          #efcb30 bg + #212251 text (Yellow + Deep Blue)
CTA hover:           #e0bc20  (darker yellow)
AI gradient:         #212251 → #2b379b (Deep Blue → Blue)
```

### Badge colors (NEVER change -- ICF credential standard)

```
MCC (Master):       bg #fff3cd, text #7a5c00  (gold)
PCC (Professional): bg #d4edda, text #155724  (green)
ACC (Associate):    bg #d1ecf1, text #0c5460  (teal)
```

### Contact brand colors

```
WhatsApp:  border #25D366, text #128C7E, hover bg #f0fff4
Telegram:  border #29ABE2, text #0088cc, hover bg #f0f8ff
Email:     border #d8d2c8, text #212251, hover bg #f8f0e4
```

### WCAG AA contrast verification

```
Deep Blue #212251 on Bone #f8f0e4:   13.15:1  PASS
Deep Blue #212251 on White #ffffff:  14.87:1  PASS
Blue #2b379b on Bone #f8f0e4:        8.75:1  PASS
Blue #2b379b on White #ffffff:        9.89:1  PASS
Deep Blue #212251 on Yellow #efcb30:  9.39:1  PASS
Link #4662e0 on White #ffffff:        5.14:1  PASS
Link #4662e0 on Bone #f8f0e4:         4.55:1  PASS
Light Blue #5778fa on White:          3.84:1  FAIL (use for large text / decorative only)
Light Blue #5778fa on Bone:           3.39:1  FAIL (use for large text / decorative only)
```

### Ready-to-use prompts

**"Create a new card-style component"**
Use white background, 1px #e0dcd4 border, 16px border-radius, 24px padding. Hover: 0 4px 20px rgba(33,34,81,0.08). Internal layout: flex column with 16px gap. Headlines: Nunito. Body: Plus Jakarta Sans. Text color: #212251.

**"Create a filter/chip element"**
White background, 1px #d8d2c8 border, 20px border-radius (pill), 8px 16px padding, 14px font-size, #212251 text. Active: #212251 bg, white text. Hover: border-color #2b379b.

**"Create a CTA button"**
Background #efcb30 (Yellow), color #212251 (Deep Blue), 14px border-radius, 14px 24px padding, 15px Nunito weight 700. Hover: bg #e0bc20. Focus: 2px solid #5778fa outline.

**"Create a secondary button"**
Transparent bg, 2px solid #212251 border, #212251 text, 14px border-radius, 12px 22px padding, 15px Nunito weight 600. Hover: bg #212251, color #ffffff.

**"Create an AI action button"**
linear-gradient(135deg, #212251, #2b379b), white text, 14px border-radius, 18px 28px padding, 16px Plus Jakarta Sans weight 600. Hover: opacity 0.9.

**"Add a credential badge"**
11px uppercase Plus Jakarta Sans, 600 weight, 0.5px letter-spacing, 3px 8px padding, 6px border-radius. Use MCC/PCC/ACC color pairs from badge table.

**"Style a tag/label"**
12px, 500 weight, #ede5d8 background, #212251 text, 4px 10px padding, 6px border-radius.

**"Style a text link"**
Color #4662e0, weight 500, text-decoration underline on hover. NEVER use #5778fa for inline body text links.
