# TransitOps -- Trips Module Engineering Specification

> **Purpose:** Extend the existing TransitOps project by implementing
> the **Trips** module. This is an extension of the current
> codebase---not a redesign.

------------------------------------------------------------------------

# 1. Core Principles

## Preserve Existing Architecture

Do **not** rewrite:

-   AppShell
-   Sidebar
-   Authentication
-   RBAC
-   TransitData Context
-   Shared UI Components
-   Theme
-   Layout
-   Existing routes

The Trips module must feel like it has always been part of the
application.

------------------------------------------------------------------------

# 2. Existing Navigation

Keep the sidebar exactly as-is:

-   Dashboard
-   Fleet
-   Drivers
-   **Trips**
-   Maintenance
-   Fuel & Expenses
-   Analytics
-   Settings

Only implement the **Trips** page.

------------------------------------------------------------------------

# 3. Trips Workspace

The Trips page must contain three tabs:

1.  **New Trip**
2.  **Active Trips**
3.  **Trip History**

------------------------------------------------------------------------

# 4. Tab 1 -- New Trip

## Goal

Create and dispatch transport jobs.

## Layout

Two-column responsive layout.

### Left Panel -- Trip Form

Fields:

-   Source
-   Destination
-   Vehicle Selector
-   Driver Selector
-   Cargo Weight
-   Planned Distance
-   Planned Start Date
-   Estimated Arrival
-   Priority
-   Notes

### Right Panel -- Validation Summary

Display:

-   Vehicle Status
-   Driver Status
-   Registration Number
-   License Expiry
-   Vehicle Capacity
-   Remaining Capacity
-   Dispatch Readiness
-   Validation Warnings

## Buttons

-   Save Draft
-   Dispatch Trip

------------------------------------------------------------------------

## Validation Rules

Dispatch is disabled until all pass.

Vehicle:

-   Exists
-   Available
-   Not On Trip
-   Not In Shop
-   Not Retired

Driver:

-   Exists
-   Available
-   Not Suspended
-   License Valid
-   Not On Trip

Cargo:

Cargo Weight ≤ Vehicle Capacity

------------------------------------------------------------------------

## Dispatch Workflow

Draft

↓

Dispatched

↓

Vehicle → On Trip

Driver → On Trip

↓

Refresh:

-   Dashboard
-   Fleet
-   Drivers
-   Analytics

------------------------------------------------------------------------

# 5. Tab 2 -- Active Trips

## Purpose

Operations Control Center.

## KPI Cards

-   Active Trips
-   Delayed Trips
-   Vehicles On Trip
-   Drivers On Duty

## Enterprise Table

Columns

-   Trip ID
-   Vehicle
-   Driver
-   Source
-   Destination
-   Cargo
-   Planned Distance
-   ETA
-   Status
-   Actions

Status Badges

-   Draft
-   Dispatched
-   Delayed
-   Completed
-   Cancelled

## Actions

-   View
-   Edit
-   Complete
-   Cancel

------------------------------------------------------------------------

## Complete Trip Modal

Fields

-   Final Odometer
-   Actual Distance
-   Fuel Used
-   Arrival Time
-   Notes

Completion automatically updates:

Trip → Completed

Vehicle → Available

Driver → Available

Dashboard

Analytics

Fuel & Expenses

Fleet

Drivers

------------------------------------------------------------------------

## Cancel Trip

Show confirmation dialog.

Restore:

Vehicle → Available

Driver → Available

Trip → Cancelled

------------------------------------------------------------------------

# 6. Tab 3 -- Trip History

## KPI Cards

-   Completed Today
-   Completed This Week
-   Average Distance
-   Average Duration
-   Fuel Efficiency
-   Cancelled Trips

## Table

-   Trip ID
-   Vehicle
-   Driver
-   Source
-   Destination
-   Distance
-   Fuel Used
-   Duration
-   Operational Cost
-   Status
-   Completed Date

## Features

-   Search
-   Filters
-   Sort
-   CSV Export

------------------------------------------------------------------------

# 7. TransitData Integration

Extend existing context only.

Required methods:

-   createTrip()
-   updateTrip()
-   dispatchTrip()
-   completeTrip()
-   cancelTrip()
-   validateTrip()
-   getAvailableVehicles()
-   getAvailableDrivers()
-   calculateFuelEfficiency()
-   calculateOperationalCost()

No duplicate business logic.

------------------------------------------------------------------------

# 8. Business Rules

Implement every TransitOps rule:

-   Unique vehicle registration
-   Retired vehicles cannot dispatch
-   In Shop vehicles cannot dispatch
-   Suspended drivers cannot dispatch
-   Expired licenses cannot dispatch
-   Driver already On Trip cannot dispatch
-   Vehicle already On Trip cannot dispatch
-   Cargo cannot exceed capacity
-   Dispatch updates statuses
-   Completion restores statuses
-   Cancellation restores statuses
-   Maintenance blocks vehicles
-   Dashboard and Analytics auto-refresh

------------------------------------------------------------------------

# 9. UI Requirements

Reuse existing:

-   Cards
-   Tables
-   Dialogs
-   Buttons
-   Forms
-   Badges
-   Typography
-   Colors
-   Tailwind utilities
-   Animations
-   Toasts
-   Loading states
-   Empty states

Do not introduce a different design system.

------------------------------------------------------------------------

# 10. Files to Modify

Only extend existing project.

Expected additions:

    src/features/trips/
        TripsPage.jsx
        components/
            NewTripForm.jsx
            ActiveTripsTable.jsx
            TripHistory.jsx
            CompleteTripModal.jsx
            ValidationSummary.jsx

Update:

-   transit-data.jsx
-   routes/App.jsx (if required)
-   existing navigation registration

------------------------------------------------------------------------

# 11. Definition of Done

-   Three tabs implemented.
-   Fully integrated with TransitData.
-   Uses existing UI components.
-   Responsive.
-   RBAC respected.
-   No duplicated state.
-   No redesign.
-   Dashboard, Fleet, Drivers, Maintenance, Fuel & Expenses and
    Analytics stay synchronized.
