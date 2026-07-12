# TransitOps: Smart Transport Operations Platform

**TransitOps** is a real-time fleet, dispatch, and cost management control tower built for the Odoo Hackathon. It acts as an operational dashboard that coordinates dispatch logistics, tracks vehicle health, logs real-time expenses, and enforces strict, dynamic Role-Based Access Control (RBAC).

All data is stored in **PostgreSQL** and served through a **FastAPI** backend. The frontend reads from the database on every page load and updates in real time as workflows change.

---

## Key Features

### 1. User Authentication & Data Scoping
- **PostgreSQL-backed login**: Users authenticate against the `users` table via `POST /api/auth/login`.
- **Data scoping**: Seed/demo data is only visible to the default admin user (Ava Singh, `ops@transitops.io`). All other users start with an empty workspace and build their own data.
- **Session persistence**: Logged-in state persists across browser refreshes via localStorage.

### 2. Dynamic Role-Based Access Control (RBAC)
- **Five roles**: Operations Lead, Fleet Manager, Dispatcher, Safety Officer, Financial Analyst.
- **Access Control Matrix Grid**: Manage full-access, read-only, or no-access rights per module per role. Changes are immediately reflected across all tabs.
- **Access Alert Blocks**: Restricted layouts appear if a role does not have permission to view or manage a module.
- **Analytics tab adapts**: Charts and tables shown depend on the logged-in user's role (e.g., Fleet Manager sees fleet health; Financial Analyst sees cost analysis).

### 3. Fleet Management
- Full CRUD for vehicles with registration, model, type, capacity, odometer, fuel type, region, and acquisition cost.
- Status tracking: Available, On Trip, In Shop, Retired.
- Vehicle search and filtering by status, type, and region.

### 4. Driver Management
- Full CRUD for drivers with license number, category, expiry date, safety score, status, and region.
- License expiry warnings and safety score tracking.
- Driver availability validation for dispatch.

### 5. Trip Dispatch & Tracking
- Create, dispatch, complete, and cancel trips with vehicle and driver assignment.
- Capacity validation (cargo weight vs. vehicle capacity).
- License expiry and driver availability checks before dispatch.
- Trip history with status tracking and fuel consumption logging.

### 6. Maintenance Management
- Work orders with vehicle assignment, maintenance type, cost, and notes.
- Open/Close lifecycle with automatic vehicle status updates (Available ↔ In Shop).
- Maintenance expense auto-logged to the expenses table on creation.

### 7. Fuel & Expenses Tracking
- **Fuel logs**: Record liters, cost, odometer reading, and date per vehicle.
- **Expenses**: Log tolls, parking, insurance, permits, and other costs with vehicle/trip association.
- Cost calculations and price-per-litre computed on the fly.

### 8. Analytics & Reports
- **11 KPI cards** with sparkline trends: Active Vehicles, Available Vehicles, In Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization, Fuel Cost, Maintenance Cost, Operational Cost, Vehicle ROI.
- **7 primary charts**: Fleet Utilization Trend, Vehicle Status Distribution, Fuel Efficiency by Vehicle, Operational Cost Breakdown, Vehicle ROI Ranking, Trip Status Overview, Maintenance Impact, Driver Compliance Risk.
- **5 secondary charts**: Odometer Growth, Fuel Spend Trend, Trips Completed vs Cancelled, Maintenance Cost Trend, Revenue vs Cost.
- **5 insight tables**: Vehicles at Risk, Driver Readiness, Trip Performance, Maintenance Summary, Expense Summary.
- **Global filters**: Date range, vehicle type, vehicle status, driver status, trip status, region.
- **CSV export**: Per-table export and full analytics export.
- **Role-aware visibility**: Different users see different charts and tables based on their role.
- **Real-time updates**: All analytics recalculate instantly when any workflow action occurs.

### 9. Settings
- Depot configuration (name, currency, distance unit).
- Theme toggle (dark/light mode).
- Role simulation for testing different access levels.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite 8 | SPA framework and build tool |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Animations | Framer Motion | Page transitions and hover effects |
| Charts | Recharts | Interactive data visualizations |
| Icons | Lucide React | Consistent icon set |
| Backend | FastAPI | REST API server |
| Database | PostgreSQL 16 | Primary data store |
| DB Driver | psycopg2 | Python PostgreSQL adapter |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  Vite + Tailwind + Recharts + Framer Motion     │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ TransitData  │  │    Feature Pages          │ │
│  │   Context    │──│  Dashboard | Fleet | Trips│ │
│  │  (State)     │  │  Drivers | Maintenance    │ │
│  └──────┬───────┘  │  Fuel | Analytics | Settings│ │
│         │          └──────────────────────────┘ │
│         │ fetch()                               │
└─────────┼───────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend (port 8000)          │
│  REST endpoints: /api/vehicles, /api/drivers,    │
│  /api/trips, /api/maintenance, /api/fuel-logs,   │
│  /api/expenses, /api/auth/login, /api/settings,  │
│  /api/rbac                                        │
└─────────────────────┬───────────────────────────┘
                      │ psycopg2
                      ▼
┌─────────────────────────────────────────────────┐
│              PostgreSQL Database                  │
│  Tables: users, vehicles, drivers, trips,        │
│  maintenance_logs, fuel_logs, expenses,           │
│  system_settings                                  │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
transitops-odoo-hackathon/
├── backend/
│   ├── app/
│   │   └── main.py                  # FastAPI server, all REST endpoints
│   ├── db/
│   │   ├── .env                     # Database credentials (gitignored)
│   │   ├── .env.example             # Template for database config
│   │   ├── setup.py                 # Database schema + seed initializer
│   │   └── seed.py                  # Additional seed data (10+ records/table)
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Backend env (gitignored)
├── src/
│   ├── main.jsx                     # React root with BrowserRouter
│   ├── index.css                    # Global CSS: theme vars, component classes
│   ├── app/
│   │   ├── App.jsx                  # Route definitions + lazy loading + auth guard
│   │   └── transit-data.jsx         # Central React Context (all state + API calls)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.jsx        # Sidebar + Topbar + Outlet
│   │   │   ├── sidebar.jsx          # Navigation with collapsible state
│   │   │   ├── topbar.jsx           # Page title, theme toggle, user info
│   │   │   └── command-palette.jsx  # Cmd+K global search overlay
│   │   └── ui/
│   │       ├── button.jsx           # primary/secondary/ghost/danger variants
│   │       ├── card.jsx             # Section wrapper with eyebrow/title/subtitle
│   │       ├── table-shell.jsx      # Generic table with columns, renderRow, loading
│   │       ├── tabs.jsx             # Inline tab switcher
│   │       ├── status-chip.jsx      # Status glyphs with pulse animation
│   │       ├── skeleton.jsx         # Loading placeholder
│   │       ├── input.jsx            # Input + Textarea
│   │       ├── select.jsx           # Native select with chevron overlay
│   │       ├── modal.jsx            # Centered overlay dialog
│   │       ├── drawer.jsx           # Right-side slide panel
│   │       ├── toast.jsx            # Top-right notification stack
│   │       ├── action-menu.jsx      # Row-level dropdown via <details>
│   │       ├── empty-state.jsx      # Centered empty table state
│   │       └── checkbox.jsx         # Checkbox with label
│   ├── features/
│   │   ├── auth/
│   │   │   └── login-page.jsx       # Email/password login form
│   │   ├── dashboard/
│   │   │   └── dashboard-page.jsx   # KPIs, charts, recent trips
│   │   ├── fleet/
│   │   │   └── fleet-page.jsx       # Vehicle CRUD with drawer + table
│   │   ├── drivers/
│   │   │   └── drivers-page.jsx     # Driver CRUD with safety score bar
│   │   ├── trips/
│   │   │   ├── trips-page.jsx       # Trip dispatch orchestrator
│   │   │   └── components/
│   │   │       ├── ActiveTripsTable.jsx
│   │   │       ├── CompleteTripModal.jsx
│   │   │       ├── NewTripForm.jsx
│   │   │       ├── TripHistory.jsx
│   │   │       └── ValidationSummary.jsx
│   │   ├── maintenance/
│   │   │   └── maintenance-page.jsx # Work orders with RBAC gate
│   │   ├── expenses/
│   │   │   └── expenses-page.jsx    # Fuel + expense tabs with modals
│   │   ├── analytics/
│   │   │   ├── analytics-page.jsx   # Main analytics orchestrator
│   │   │   ├── use-analytics.js     # Computation engine (all metrics from DB)
│   │   │   ├── analytics-filters.jsx # Global filter controls
│   │   │   ├── kpi-section.jsx      # 11 KPI cards with sparklines
│   │   │   ├── primary-charts.jsx   # 7 primary charts
│   │   │   ├── secondary-charts.jsx # 5 secondary charts
│   │   │   ├── insight-tables.jsx   # 5 data tables with CSV export
│   │   │   └── chart-tooltip.jsx    # Shared Recharts tooltip
│   │   └── settings/
│   │       └── settings-page.jsx    # Profile, depot config, RBAC matrix
│   ├── hooks/
│   │   └── use-demo-loading.js      # Simulated page-load delay
│   └── lib/
│       └── utils.js                 # cn(), formatNumber, formatCurrency, etc.
├── index.html
├── package.json
└── vite.config.js
```

---

## Database Schema

| Table | Primary Key | Key Columns | Constraints |
|-------|------------|-------------|-------------|
| **users** | `id` SERIAL | name, email, password_hash, role | email UNIQUE, role CHECK (5 roles) |
| **vehicles** | `id` VARCHAR(50) | reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost | reg_number UNIQUE INDEX, status CHECK |
| **drivers** | `id` VARCHAR(50) | name, license_number, license_category, license_expiry, safety_score, status, region, contact_number | license_number UNIQUE, safety_score 0-100 |
| **trips** | `id` VARCHAR(50) | origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region, final_odometer, fuel_consumed | FK vehicles, FK drivers, status CHECK |
| **maintenance_logs** | `id` VARCHAR(50) | vehicle_id, type, cost, opened_at, closed_at, status, notes | FK vehicles (CASCADE), status CHECK |
| **fuel_logs** | `id` VARCHAR(50) | date, vehicle_id, liters, amount, odometer_reading | FK vehicles (CASCADE) |
| **expenses** | `id` VARCHAR(50) | date, category, amount, vehicle_id, trip_id | FK vehicles (CASCADE), category CHECK |
| **system_settings** | `key` VARCHAR(50) | value (JSONB) | Stores depot settings and RBAC matrix |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Make sure PostgreSQL is running, then:
cd backend/db
cp .env.example .env        # Set your DB_PASSWORD

# Initialize schema + seed data
cd ../..
python backend/db/setup.py

# Add extended seed data (10+ records per table)
python backend/db/seed.py
```

### 2. Backend

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

### 4. Open

Navigate to **http://localhost:5173/**

---

## Login Credentials

| User | Email | Password | Role | Data |
|------|-------|----------|------|------|
| Ava Singh (Admin) | `ops@transitops.io` | `demo123` | Operations Lead | Full seed data |
| Fleet Manager | `manager@transitops.io` | `demo123` | Fleet Manager | Empty (create your own) |
| Dispatcher | `dispatch@transitops.io` | `demo123` | Dispatcher | Empty |
| Safety Officer | `safety@transitops.io` | `demo123` | Safety Officer | Empty |
| Financial Analyst | `finance@transitops.io` | `demo123` | Financial Analyst | Empty |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user, return user info |
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles` | Create a vehicle |
| GET | `/api/drivers` | List all drivers |
| POST | `/api/drivers` | Create a driver |
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Dispatch a trip |
| PUT | `/api/trips/:id/status` | Update trip status |
| GET | `/api/maintenance` | List maintenance logs |
| POST | `/api/maintenance` | Create maintenance log |
| PUT | `/api/maintenance/:id/resolve` | Close maintenance log |
| GET | `/api/fuel-logs` | List fuel logs |
| POST | `/api/fuel-logs` | Create fuel log |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/settings` | Get depot settings |
| POST | `/api/settings` | Update depot settings |
| GET | `/api/rbac` | Get RBAC matrix |
| POST | `/api/rbac` | Update RBAC matrix |

---

## Analytics Tab Details

The analytics tab computes all metrics in real time from the PostgreSQL data layer. No values are hardcoded.

### KPI Cards
Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization, Fuel Cost, Maintenance Cost, Operational Cost, Vehicle ROI.

### Charts
- **Fleet Utilization Trend** — How utilization changes over time
- **Vehicle Status Distribution** — Available / On Trip / In Shop / Retired breakdown
- **Fuel Efficiency by Vehicle** — km/L ranked best to worst
- **Operational Cost Breakdown** — Fuel / Maintenance / Toll / Parking / Insurance / Permit
- **Vehicle ROI Ranking** — Revenue vs costs per vehicle
- **Trip Status Overview** — Draft / Dispatched / Completed / Cancelled
- **Maintenance Impact** — Downtime hours per vehicle
- **Driver Compliance Risk** — License expiry + safety score risk scoring
- **Revenue vs Cost** — Daily financial comparison
- **Fuel Spend Trend** — Daily fuel expenditure

### Tables
- **Vehicles at Risk** — High cost, overdue service, negative ROI flags
- **Driver Readiness** — License expiry, safety score, eligibility status
- **Trip Performance** — Route, fuel used, actual vs planned distance
- **Maintenance Summary** — Work order history with downtime
- **Expense Summary** — All expenses by category with vehicle/trip links

### Role-Based Visibility
| Role | Visible Sections |
|------|-----------------|
| Operations Lead | Everything |
| Fleet Manager | Fleet utilization, status, maintenance, ROI, vehicles at risk |
| Dispatcher | Trip status, trip performance |
| Safety Officer | Driver compliance, driver readiness |
| Financial Analyst | Cost breakdown, fuel efficiency, revenue vs cost, expenses |

---

## Design System

- **Dark mode default** with light mode toggle
- **No border-radius** — sharp brutalist aesthetic
- **CSS variables** for all colors (`--bg`, `--surface`, `--text`, `--series-1` through `--series-4`)
- **Typography**: Inter (sans), JetBrains Mono (data/metrics)
- **Component classes**: `panel-surface`, `metric-card`, `control-shell`, `table-container`, `mono-display`
- **Animations**: `pulse-glow` for live status, `skeleton-flat` for loading states
