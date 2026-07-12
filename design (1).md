# TransitOps — Design System v2 (Monochrome)
`design.md` — supersedes the color version. This is law.

---

## 0. Thesis

Strip it to black, white, and grayscale. No accent color to hide behind — every decision has to work on contrast, weight, spacing, and structure alone. This reads as *serious instrumentation*, not a consumer dashboard. Think: a flight ops board, a terminal, a spec sheet. Not: a SaaS marketing site that happens to be dark mode.

**Hard rules:**
- Zero border-radius. Everywhere. Buttons, cards, inputs, tables, chips, modals — all sharp corners.
- No bento grid. No cards of wildly different sizes tiled like a mosaic. Every card in a row shares the same height. The grid is a grid, not a collage.
- No color for meaning. Status is communicated by **shape, fill, and motion** — never hue. This is stricter than typical design and it's the whole point.
- No soft shadows, no glassmorphism, no gradients. Structure comes from 1px borders and contrast only.

**Signature element:** status is shown through a fixed vocabulary of marks, not color:
```
●  filled circle, pulsing   → active / live (On Trip, Dispatched)
○  hollow circle, static    → available / idle / completed
◐  half-filled circle       → in progress / partial (e.g. maintenance in shop)
▲  filled triangle          → warning (license expiring, near capacity)
✕  filled square + cross    → blocked / suspended / retired
```
Every one of these renders in pure white on black (or black on white in light contexts) — never colored. Pair the mark with the text label always; the mark alone is not the interface, it's reinforcement for people scanning fast.

---

## 1. Tokens

### Color — grayscale only
```
--bg:          #050505
--surface:     #111111
--surface-2:   #1C1C1C   /* modals, dropdowns, elevated panels */
--border:      #2A2A2A
--border-2:    #444444   /* hover/active border state */
--text:        #FFFFFF
--text-2:      #A3A3A3
--muted:       #666666
--invert-bg:   #FFFFFF   /* primary button fill */
--invert-text: #000000   /* text on primary button */
```
That's it. No blue, no green, no red. If a state absolutely requires disambiguation beyond the mark vocabulary in §0 (e.g. a destructive confirm), use **weight and inversion**, not color: a destructive button is white-filled with black text and a heavier border, same as primary — the danger signal comes from the icon (✕) and the copy ("Delete permanently"), not from red.

### Type
- **Display face:** Inter, ExtraBold, uppercase, tight letter-spacing (-0.01em) — used for page titles and section labels only.
- **Body face:** Inter, Regular — everything conversational (descriptions, form labels, empty-state copy).
- **Data face:** JetBrains Mono — every number, ID, date, currency, status label. This is non-negotiable; it's what makes the density feel technical instead of decorative.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| KPI number | JetBrains Mono | 40px | 700 | tabular-nums |
| H1 | Inter | 24px | 800 | uppercase, tracking +0.02em |
| Section label (eyebrow) | Inter | 11px | 700 | uppercase, tracking +0.08em, `--muted` |
| H3 (card title) | Inter | 15px | 600 | sentence case |
| Body | Inter | 14px | 400 | |
| Data value | JetBrains Mono | 14px | 500 | tabular-nums, right-aligned in tables |
| Caption | Inter | 12px | 400 | `--muted` |

### Spacing
Still 8px system: `8 · 16 · 24 · 32 · 40 · 48`. Monochrome doesn't relax discipline, it demands more of it — with no color to create rhythm, spacing is the only thing left to do that job.

### Radius
`0px`. Everywhere. This is the headline rule of v2 — if you see a rounded corner anywhere in a screenshot, it's wrong.

### Borders / elevation
No shadows. Elevation is communicated by border weight and background step only:
```
--surface bg + 1px --border        = resting card
--surface bg + 1px --border-2      = hovered/focused card
--surface-2 bg + 1px --border-2    = modal/dropdown (one step up, brighter)
```

### Motion
- Standard transition: `160ms ease-out` — slightly snappier than v1, matches the harder aesthetic
- Card entrance: opacity only (0→1), no translateY, no stagger beyond 30ms — motion should feel like data appearing, not elements floating in
- Hover: border brightens (`--border` → `--border-2`), no lift, no shadow
- Status pulse (● only): opacity 1↔0.3, 1.8s linear — sharper, more mechanical than a soft ease, reinforces "signal" over "breathing"
- Button press: no scale transform. Instead, invert briefly — fill flashes to `--surface-2` for 80ms. Feels like a physical switch, not a bouncy app.
- `prefers-reduced-motion`: disables pulse and all transitions, renders final state immediately

---

## 2. Components

### Status Mark (replaces "chip")
No pill, no background fill. Just the mark (§0) + label in Data face, inline, no border, no padding box:
```
● ON TRIP        (pulsing)
○ AVAILABLE
◐ IN SHOP
▲ EXPIRES IN 12D
✕ SUSPENDED
```
Uppercase, tracked. This alone is one of the biggest visual differentiators from every other team's colored-pill status system.

### Card
`--surface` bg, 1px `--border`, **0px radius**, 24px padding. Title = H3 in top-left, optional eyebrow label above it in section-label style. No shadow, ever. Hover only for navigational cards, and hover = border brightens, nothing else moves.

### Table
Header row: `--surface-2` bg, section-label style text (uppercase, tracked, muted), 1px bottom border in `--border-2`. Rows: 1px `--border` between rows only (no outer box radius — the table is a flat rule-based grid, closer to a ledger than a "card containing a table"). Row hover: background steps to `--surface-2`, no lift. Data columns mono, right-aligned. Row actions: a single `···` character button, ghost, right-aligned, opens a flat dropdown (`--surface-2`, 0 radius, 1px border).

### Buttons
- Primary: `--invert-bg` fill (white), `--invert-text` (black), 0 radius, Inter SemiBold, uppercase, tracked
- Secondary: transparent fill, 1px `--border-2`, `--text` label
- Ghost: transparent, no border, `--text-2`, brightens to `--text` on hover
- Destructive: same shape as Primary (white fill / black text) but paired with a ✕ icon and explicit copy — no red anywhere
- All buttons: 0 radius, 40px height default, uppercase labels for primary/secondary, sentence case for ghost/tertiary actions

### Sidebar
Fixed 240px / collapsed 64px. Active item: 2px solid left border in `--text` (white), no background tint, icon+label in `--text`; inactive items in `--text-2`. A pulsing ● next to a nav label only if that section has live active items — same rule as v1, just monochrome now.

### Command Palette
`⌘K`, `--surface-2` bg, 0 radius, 1px `--border-2`, centered. This still ships — it's aesthetic-agnostic and still the highest-ROI feature for the time cost.

### Forms
Section label (eyebrow style) → H2-equivalent title → one-line muted description → fields, full-width or 2-col grid, all inputs 0 radius with 1px `--border`, focus state = border to `--text` (full white, no glow). Inline errors: no red text — instead, the field border becomes `--text` (white, full contrast) and the message is prefixed with the ✕ mark, in `--text-2`.

---

## 3. Page-by-Page Adjustments from v1

Layouts stay the same as the v1 spec (KPI row, table pages, drawers for create/edit) — only the visual treatment changes. Two specific changes:

1. **Dashboard KPI row**: 6 cards, uniform width, uniform height, 1px dividers between them instead of gapped cards with individual borders — reinforces "single instrument panel" rather than six separate widgets. One outer border around the whole row, internal 1px dividers between cells.
2. **Charts**: no colored series. Use white/gray at different opacities (100%, 60%, 30%) to differentiate series, with direct end-of-line labels instead of a legend swatch (swatches imply color-coding, which we're not doing).

---

## 4. Empty / Loading / Error States

- **Empty table**: centered, ○ mark (large, muted) + one-line copy in the interface's voice + primary button. No color, no illustration.
- **Loading**: skeleton blocks in `--surface-2` on `--surface`, no shimmer gradient (a moving gradient reads as a "color" effect) — use a flat opacity pulse instead (0.4↔0.7, 1.2s).
- **Error (validation)**: border inverts to white + ✕ mark + plain-language message, per §2 Forms.
- **Error (system/toast)**: `--surface-2` bg, 1px `--border-2`, ✕ mark left-aligned, no colored border accent.

---

## 5. Microcopy Voice

Unchanged from v1: plain, active voice, buttons name the action, toasts echo the button's verb, errors name the rule that broke. Uppercase is used structurally (labels, statuses, primary buttons) — never for full sentences or body copy, which stays sentence case for readability.

---

## 6. Accessibility Floor

- Focus ring: 2px solid `--text` (white), 2px offset — high contrast by default since there's no color to fall back on
- Status marks (§0) are the accessibility win here: shape-coded status is colorblind-safe by construction, which color-only chips are not
- Contrast: white-on-#050505 and black-on-white both clear AAA; `--text-2`/`--muted` are for secondary/non-essential text only
- `prefers-reduced-motion` disables all pulse/transition motion, per §1
