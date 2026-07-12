# TransitOps — Frontend Build Prompt

Paste this whole thing into your coding agent (Claude Code / Cursor). It assumes `design.md` is in the repo root and readable — reference it explicitly if your tool supports file context.

---

You are the Staff Frontend Engineer and Senior Product Designer building the complete frontend for **TransitOps**, a Smart Transport Operations Platform, for an 8-hour hackathon. The backend team owns the schema and API — you own every page, and the UI is our single biggest differentiator. Judges will see a lot of generic shadcn dashboards today. Ours cannot look like that.

**Read `design.md` in this repo first — it is the single source of truth for color, type, spacing, radius, motion, and every component spec. Do not deviate from it. Do not invent new colors, new spacing values, new button styles, or new card styles. Reuse the same Card, Button, Table, StatusChip, Drawer, Modal, Toast, Skeleton components on every page — build each of these ONCE as a shared component and import everywhere.**

## Stack
React + Vite + TailwindCSS + shadcn/ui (as the base primitives only — restyle everything per design.md, don't ship shadcn defaults) + Lucide Icons + React Router + Framer Motion. Feature-folder structure. No inline styles. No duplicate components — if you catch yourself writing a second button variant, stop and reuse the shared one.

## What "stand out" means here, concretely
1. **The status pulse** (design.md §0) — implement this once as a modifier on StatusChip (`pulsing?: boolean`), used only for genuinely active states. This is our signature and it must be everywhere it belongs and nowhere else.
2. **Mono-spaced data** — every number, ID, date, and currency value renders in JetBrains Mono per the type scale in design.md §1. This alone makes tables look like instrumentation instead of a spreadsheet export.
3. **Command palette (⌘K)** — build this if you get through the core pages with time to spare. Use `cmdk` via shadcn. Searchable across vehicle reg numbers, driver names, trip IDs. This is the single highest-ROI "wow" feature for the time it costs.
4. **Real empty/loading states everywhere** — skeletons that match final content shape, and empty states with a call to action, per design.md §4. A polished empty state is one of the fastest tells that a team actually finished the product instead of demoing the happy path only.
5. **Motion restraint** — card entrance stagger and hover-lift exactly as specified, nothing extra. Do not add slide transitions, bounce easing, or confetti. Judges have seen the over-animated version of this demo a dozen times today; ours reads as calmer and more "real."

## Pages to build (in priority order — build top to bottom, each one production-complete before starting the next)

1. **Login** — per design.md page spec. Wire to whatever auth stub/API the backend team provides; if it's not ready yet, build against a mock and leave one clearly marked TODO for the real call.
2. **Dashboard** — 6 KPI cards + Recent Trips table + Vehicle Status donut + Maintenance Overview bar + Expense Summary line chart. Use Recharts or a lightweight chart lib, restyled to match tokens (no default chart-library colors).
3. **Fleet (Vehicles)** — table with search/filter/sort/pagination, Add Vehicle Drawer, row-click detail Drawer.
4. **Drivers** — same table pattern, license-expiry warning styling per design.md.
5. **Trips** — table + Create Trip Drawer with live vehicle/driver availability filtering and live cargo-capacity validation UI (this is the page that most visibly proves the business rules — make the validation feedback immediate and satisfying, not just a submit-time error).
6. **Maintenance** — table + Log Maintenance modal, toast confirming the vehicle status flip.
7. **Fuel & Expenses** — tabbed page (Fuel Logs / Expenses) sharing one table shell, summary cards on top.
8. **Analytics/Reports** — 4 metric cards with sparklines + comparison table + CSV export button.
9. **Settings** — profile + preferences, dark/light toggle.
10. *(Bonus, only if time remains)* Command palette, PDF export, license-expiry email-reminder UI stub, vehicle document upload UI.

## Business rules the UI must visibly enforce (get this wrong and the demo breaks)
- Dispatch pool never shows `In Shop` or `Retired` vehicles, or `Suspended`/license-expired drivers.
- Cargo weight field blocks submission and shows a live inline mono comparison (`420 / 500 kg`) turning `--danger` when over capacity.
- A vehicle or driver already `On Trip` cannot be picked again in the create-trip form.
- Dispatching, completing, cancelling a trip, and opening/closing maintenance must optimistically update status chips across the app (or refetch) so the demo shows real-time-feeling state changes without a manual refresh.

## Definition of done for every page
- Matches design.md tokens exactly (spot-check colors/spacing/radius before moving on)
- Has a real empty state, a real loading skeleton, and handles the error case
- Keyboard-navigable, visible focus states, `aria-label` on icon buttons
- Responsive down to mobile per design.md (sidebar collapses, tables scroll horizontally rather than break)
- No inline styles, no new components duplicating an existing shared one

## Before you write any code
Do a quick internal pass: list the shared components you'll build once (Card, Button, StatusChip, Table, Drawer, Modal, Toast, Skeleton, Sidebar, Topbar) and confirm every page below only composes these — never redefines them. Then build.
