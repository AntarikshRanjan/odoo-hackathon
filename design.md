# TransitOps — Design System
`design.md` — this is law. Every page must be traceable back to a rule in this file.

---

## 0. Thesis

TransitOps is not a pretty CRUD app — it's a **control tower**. The design language of an ops platform should feel like the person using it is watching a live system, not filling out forms. Every screen should communicate: *this is happening right now, and I am in control of it.*

**Signature element:** a live **status pulse** — every status chip (vehicle, driver, trip) that is in an "active" state (`On Trip`, `Dispatched`) carries a soft 2px breathing glow animation (opacity 0.6 → 1 → 0.6, 2.4s ease-in-out loop) in its status color. Static states (`Available`, `Retired`, `Completed`) never pulse. This single motif — glowing only what is truly live — is what makes the product feel real-time even where the backend polling is simple. It appears exactly three places: status chips, the sidebar nav-item for a page with active alerts, and the dashboard KPI for Active Trips. Nowhere else. Restraint is the point.

**Typography pairing:**
- **Inter** — all UI chrome, labels, body copy, headings.
- **JetBrains Mono** — every data value: registration numbers, license numbers, odometer readings, currency figures, dates/timestamps, KPI numbers on the dashboard. This is deliberate: mono-spaced data reads as instrumentation, not decoration. Never use it for prose or button labels.

Why this works for TransitOps specifically: fleet ops people scan numbers constantly (odometer, cost, capacity, license expiry). Monospacing those values makes them easier to compare at a glance — digits align vertically in tables — which is a real usability win, not just an aesthetic flex.

---

## 1. Tokens

### Color (fixed — do not deviate)
```
--primary:     #2563EB
--success:     #22C55E
--warning:     #F59E0B
--danger:      #EF4444
--info:        #06B6D4
--bg:          #0F172A
--surface:     #1E293B
--surface-2:   #24324A   /* new: elevated surface, for modals/dropdowns over surface */
--border:      #334155
--text:        #F8FAFC
--text-2:      #CBD5E1
--muted:       #94A3B8
```
`--surface-2` is the one addition beyond the locked palette — needed so modals/dropdowns/popovers have a visible edge when they sit on top of cards. Same hue family, one step lighter. Nothing else is added.

### Type scale
| Role | Font | Size | Weight |
|---|---|---|---|
| Display (KPI numbers) | JetBrains Mono | 36px | 800 (ExtraBold) |
| H1 (page title) | Inter | 28px | 700 |
| H2 (section title) | Inter | 20px | 700 |
| H3 (card title) | Inter | 16px | 600 |
| Body | Inter | 14px | 400 |
| Small / caption | Inter | 12px | 400 |
| Data value (table cells, IDs, costs) | JetBrains Mono | 14px | 500 |

### Spacing
8px system, no exceptions: `8 · 16 · 24 · 32 · 40 · 48`

### Radius
Buttons/Inputs `12px` · Cards/Tables `16px`

### Shadow (subtle only)
```
--shadow-card:  0 1px 2px rgba(0,0,0,0.24), 0 1px 1px rgba(0,0,0,0.12)
--shadow-hover: 0 8px 24px rgba(0,0,0,0.32)
--shadow-modal: 0 16px 48px rgba(0,0,0,0.48)
```

### Motion
- Standard transition: `180ms cubic-bezier(0.4, 0, 0.2, 1)`
- Card entrance: fade + translateY(8px→0), staggered 40ms per card in a grid, max 6 items staggered
- Card hover: translateY(-2px) + `--shadow-hover`
- Button press: scale(0.98)
- Status pulse (signature element only): 2.4s ease-in-out infinite, opacity 0.6↔1
- Page transition: 120ms fade, no slide (slides read as "template")
- **Never** animate more than one property group per element at once. Never use bounce/elastic easing anywhere — this is enterprise software, not a consumer app.

---

## 2. Components

### Status Chip
Pill, 12px radius, `surface-2` background, colored dot + colored text (not colored fill — keeps dark mode legible). Dot pulses per §0 signature rule only for active states.
```
[● On Trip]   dot + text = --primary, pulsing
[● Available] dot + text = --success, static
[● In Shop]   dot + text = --warning, static
[● Retired]   dot + text = --muted, static
[● Suspended] dot + text = --danger, static
```

### Card
`surface` bg, `border` 1px, 16px radius, 24px padding, `--shadow-card`. Title = H3, optional muted subtitle below, optional top-right action slot (icon button or dropdown). Hover only if the card is clickable/navigational — dashboard KPI cards don't hover, list-item cards do.

### Table
Sticky header row (`surface-2` bg), 16px radius on the outer container only (not per-row), row height 56px, hover = `surface-2` tint, zebra striping OFF (too noisy at this density). Row actions live in a right-aligned overflow (⋮) menu, never inline icon clusters. Numeric/data columns right-aligned and mono. Empty state lives inside the table body, not a separate screen (see §4).

### Buttons
- Primary: `--primary` fill, white text, 12px radius, 40px height default / 36px compact
- Secondary: `surface-2` fill, `--text` text, `border` 1px
- Danger: `--danger` fill, white text — reserved for destructive confirms only, never for a page's main CTA
- Ghost: transparent, `--text-2` text, `surface-2` on hover
- Icon-only buttons are always 36×36px, centered icon, ghost by default

### Sidebar
Fixed 240px expanded / 72px collapsed. Active item = `primary` left border (2px) + `surface-2` bg tint + icon/text in `--primary`. Collapse toggle pinned at the bottom. Pulsing dot on a nav item only if that section has a live active-trip count > 0.

### Command Palette (bonus, high ROI)
`⌘K` / `Ctrl+K` opens a centered modal, `surface-2` bg, fuzzy search across vehicles/drivers/trips by their mono-formatted ID. This is the single most "we peaked" feature you can add in under an hour with shadcn's `cmdk` — judges notice it immediately because almost no hackathon team ships it.

### Forms
Section title (H2) → one-line muted description → fields in a 2-column grid on desktop (1-column mobile) → inline error below the field in `--danger`, 12px, appears on blur not on keystroke → sticky-bottom action bar with Cancel (ghost) + Save (primary) once the form scrolls.

---

## 3. Page-by-Page Spec

### Login
Centered card, 400px wide, on a plain `--bg` background — no illustration, no gradient blob. Logo/wordmark top-left inside the card. Email, password, Remember Me checkbox, Forgot Password link right-aligned under password. Primary button full-width. This page earns its restraint: an enterprise tool's login should feel instant and serious, not marketed at.

### Dashboard
```
┌─────────────────────────────────────────────┐
│ H1: Dashboard          [filters: type/status/region] │
├───────┬───────┬───────┬───────┬───────┬─────┤
│ KPI   │ KPI   │ KPI   │ KPI   │ KPI   │ KPI │  ← 6 KPI cards, mono numbers
├───────┴───────┴───────┴───────┴───────┴─────┤
│ Recent Trips (table, 5 rows)  │ Vehicle Status (donut) │
├────────────────────────────────┼─────────────────────┤
│ Maintenance Overview (bar)    │ Expense Summary (line) │
└─────────────────────────────────────────────┘
```
KPI cards: label (small, muted, top) → number (Display style, mono) → delta/sub-label (small, colored if meaningful). Active Trips KPI carries the pulse.

### Fleet (Vehicles)
Table page. Top bar: H1 + "Add Vehicle" primary button right-aligned. Below: search input + filter dropdowns (Type, Status) inline, left-aligned. Table columns: Reg. Number (mono) · Name/Model · Type · Capacity (mono) · Odometer (mono) · Status (chip) · ⋮. Row click opens a Drawer (not a new page) with full detail + edit + maintenance history.

### Drivers
Same table pattern as Fleet. Columns: Name · License No. (mono) · License Expiry (mono, `--danger` text if <30 days out) · Safety Score (mono, small horizontal bar behind the number) · Status (chip) · ⋮.

### Trips
Table + "Create Trip" primary button. Create Trip opens a Drawer, not a modal (it's a multi-field form — modals should stay short). Fields resolve live: selecting a vehicle filters out anything not `Available`; same for driver. Cargo weight field shows a live inline capacity check (`420 / 500 kg` mono, turns `--danger` if over). Status column uses the chip + pulse for `Dispatched`.

### Maintenance
Table + "Log Maintenance" button. Creating a record for a vehicle immediately reflects that vehicle's status as `In Shop` elsewhere in the app — call this out with a toast: `"Van-05 moved to In Shop"`.

### Fuel & Expenses
Two tabs within one page (not two sidebar items) — Fuel Logs / Expenses — using the same table shell. A summary card row at top: Total Fuel Cost, Total Maintenance Cost, Total Operational Cost (all mono, all live-computed).

### Analytics / Reports
Four metric cards (Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI) each with a small trend sparkline. Below: a per-vehicle comparison table. "Export CSV" ghost button top-right; "Export PDF" (bonus) next to it, both icon+label.

### Settings
Simple form sections: Profile, Role/Team management (if time allows), Preferences (dark/light toggle lives here too, in addition to the topbar).

---

## 4. Empty, Loading, Error States

- **Empty table:** centered inside the table body — icon (Lucide, muted), one-line message in the interface's voice ("No vehicles yet — add your first one to start dispatching"), primary button to the relevant create action. Never a blank white table.
- **Loading:** skeleton rows/cards matching the exact shape of the real content (same height, same column widths) — never a centered spinner for anything list-shaped. A spinner is fine only inside a button mid-submit.
- **Error (validation):** inline, under the field, `--danger` text, 12px, plain language ("License has expired — update it before assigning this driver").
- **Error (system/toast):** toast in `surface-2`, `--danger` left border, states what happened and, where possible, what to do next.

---

## 5. Microcopy Voice

Plain, active, no filler. Buttons say what they do: "Dispatch Trip," not "Submit." A toast confirming an action reuses the button's verb: "Dispatch Trip" → toast reads "Trip dispatched." Errors never apologize and are never vague — they name the rule that was broken (e.g. "Cargo exceeds vehicle capacity (500 kg max)" not "Invalid input").

---

## 6. Accessibility Floor (non-negotiable, judges do check)

- Visible keyboard focus ring on every interactive element (`--primary`, 2px, offset 2px)
- All icon-only buttons have `aria-label`
- Color is never the only status signal — chips always pair color with text, never a bare dot
- Contrast: `--text` on `--bg`/`--surface` passes AA; `--muted` used only for non-essential labels, never for anything requiring a response
- `prefers-reduced-motion` disables the status pulse and card-entrance stagger, falls back to instant states
