# TransitOps — Frontend Build Prompt (v2, Monochrome)

Paste this into your coding agent. It assumes `design.md` (v2, monochrome) is in the repo root.

---

You are the Staff Frontend Engineer and Senior Product Designer building the complete frontend for **TransitOps**. Read `design.md` in this repo before writing any code — it is the single source of truth and it is strict. Every rule in it is intentional, not a placeholder.

**The three things that will break this design if you get them wrong:**
1. **Zero border-radius, everywhere.** If shadcn's default primitives ship with rounded corners, override them globally in the Tailwind config (`borderRadius: { DEFAULT: '0px', ... }` — set every radius token to 0, don't override component-by-component). Check this first, it's the one thing that will silently creep back in from library defaults.
2. **No color for meaning, ever.** Status is the mark vocabulary in design.md §0 (`● ○ ◐ ▲ ✕`) plus text — never a colored dot, never a colored pill background, never red/green/amber anywhere in the UI. If you're about to reach for a semantic Tailwind color class (`text-red-500`, `bg-green-500`, etc.) for a status, stop — that's the exact thing this system forbids. Grep your own output for hex-color or `red`/`green`/`amber`/`blue` class usage before calling a page done.
3. **JetBrains Mono on every data value.** Numbers, IDs, dates, currency, status labels. If a table column looks like it's in the body font, it's wrong — check every column.

## Stack
React + Vite + TailwindCSS + shadcn/ui (primitives only, fully restyled per design.md) + Lucide Icons + React Router + Framer Motion. Feature-folder structure, no inline styles, no duplicate components.

## Build order (same page list and business-rule requirements as before — only the visual system changed)
1. Login
2. Dashboard (6-cell KPI instrument panel per design.md §3, donut/bar/line charts restyled to grayscale-only per §3.2)
3. Fleet (Vehicles)
4. Drivers
5. Trips (live capacity check and availability filtering still apply — render the validation feedback using the mark vocabulary, e.g. `▲ 420 / 500 KG` when nearing capacity)
6. Maintenance
7. Fuel & Expenses
8. Analytics / Reports
9. Settings
10. Bonus: Command Palette (⌘K), PDF export, license-reminder UI stub

Business rules to visibly enforce (unchanged from the functional spec): dispatch pool excludes In Shop/Retired vehicles and Suspended/expired-license drivers; a vehicle or driver already On Trip can't be picked again; cargo weight blocks over-capacity submission with live feedback; dispatch/complete/cancel/maintenance actions optimistically update status marks app-wide.

## Definition of done, per page
- Zero rounded corners anywhere in a screenshot of the page
- Zero non-grayscale colors anywhere in a screenshot of the page
- Every data value (numbers/IDs/dates/currency) is visibly mono, every label/body text is visibly Inter
- Status uses the mark vocabulary, never a colored chip
- Has a real empty state, real loading skeleton (flat opacity pulse, not shimmer), and error handling per design.md §4
- Keyboard-navigable, visible white focus ring, `aria-label` on icon-only buttons
- Responsive to mobile: sidebar collapses to 64px icon rail, tables scroll horizontally

Before writing code: build the shared components once (Card, Button, StatusMark, Table, Drawer, Modal, Toast, Skeleton, Sidebar, Topbar, CommandPalette) exactly per design.md §2, then only compose them on pages. Confirm the Tailwind radius override is in place before building a single page — this is the rule most likely to get silently violated by a shadcn default sneaking through.
