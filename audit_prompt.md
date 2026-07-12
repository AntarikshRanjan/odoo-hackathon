# TransitOps — Build Audit Prompt

Run this against the repo whenever you want a status check — after the first pages land, and again before the demo. Paste into your coding agent with repo access.

---

You are auditing the current state of the TransitOps frontend against `design.md` (the design system) and the project spec. Do not fix anything yet — first produce a written audit, then wait for direction on what to fix.

## 1. Inventory — what actually exists
Scan the codebase and list, page by page (Login, Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel & Expenses, Analytics/Reports, Settings):
- Built and functional
- Built but incomplete (name the missing piece)
- Not started

Also list which shared components exist (Card, Button, StatusMark, Table, Drawer, Modal, Toast, Skeleton, Sidebar, Topbar, CommandPalette) and whether each page actually reuses them or has a one-off duplicate implementation somewhere.

## 2. Design-system compliance — check every rule that's easy to violate silently
- **Radius:** grep for any `rounded-*` Tailwind class or non-zero `border-radius` anywhere in components. List every offending file/line.
- **Color:** grep for any non-grayscale color usage — `red-`, `green-`, `blue-`, `amber-`, `emerald-`, any hex code outside the design.md token list, any shadcn default color class left un-overridden. List every offending file/line.
- **Typography:** confirm JetBrains Mono is actually applied to data values (numbers, IDs, dates, currency, status labels) and not just imported and unused. Flag any table/card where data renders in the body font.
- **Status marks:** confirm status is rendered via the `● ○ ◐ ▲ ✕` vocabulary + text, not a colored pill/chip. Flag any remaining chip-style status rendering.
- **Shadows:** flag any `shadow-*` class or box-shadow beyond what design.md specifies (none — elevation is border/background only).

## 3. Business-rule enforcement — check against the functional spec, not just the UI
For each rule below, state whether it's enforced in the UI, enforced only in a form validator, enforced nowhere, or untestable right now because the relevant page isn't built:
- Registration number uniqueness
- In Shop / Retired vehicles excluded from dispatch pool
- Suspended / expired-license drivers excluded from assignment
- Vehicle or driver already On Trip can't be assigned again
- Cargo weight capacity check, with live inline feedback (not just submit-time)
- Dispatch → vehicle/driver → On Trip, trip → Dispatched
- Complete → vehicle/driver → Available, trip → Completed
- Cancel (dispatched) → vehicle/driver restored to Available
- Create maintenance → vehicle → In Shop, removed from dispatch pool
- Close maintenance → vehicle → Available (unless Retired)
- Dashboard/analytics reflect state changes without manual refresh

## 4. States coverage
For each page, confirm presence of: a real empty state (not a blank table), a loading skeleton matching final content shape, and at least one handled error case. Flag any page missing one of the three.

## 5. Accessibility spot-check
- Visible focus ring present on interactive elements (not just default browser outline, not suppressed)
- Icon-only buttons have `aria-label`
- `prefers-reduced-motion` respected for the status pulse and transitions

## 6. Output format
Produce the audit as a single markdown table plus a short prose summary at the top with:
- Overall % of pages demo-ready
- The 3 highest-priority fixes given remaining time (rank by "most likely to be visible to a judge" × "cheapest to fix")
- Anything that's currently a hard blocker for the reference demo workflow (register vehicle → register driver → create/dispatch trip → complete trip → log maintenance → see dashboard update)

Do not start fixing issues in this pass — audit only, then stop and report.
