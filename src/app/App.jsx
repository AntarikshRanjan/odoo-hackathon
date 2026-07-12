import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTransitData } from "./transit-data";
import { AppShell } from "../components/layout/app-shell";
import { LoginPage } from "../features/auth/login-page";
import { getDefaultRouteForRole } from "../lib/rbac";

const DashboardPage = lazy(() =>
  import("../features/dashboard/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);
const FleetPage = lazy(() =>
  import("../features/fleet/fleet-page").then((module) => ({
    default: module.FleetPage,
  })),
);
const DriversPage = lazy(() =>
  import("../features/drivers/drivers-page").then((module) => ({
    default: module.DriversPage,
  })),
);
const TripsPage = lazy(() =>
  import("../features/trips/trips-page").then((module) => ({
    default: module.TripsPage,
  })),
);
const MaintenancePage = lazy(() =>
  import("../features/maintenance/maintenance-page").then((module) => ({
    default: module.MaintenancePage,
  })),
);
const ExpensesPage = lazy(() =>
  import("../features/expenses/expenses-page").then((module) => ({
    default: module.ExpensesPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("../features/analytics/analytics-page").then((module) => ({
    default: module.AnalyticsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../features/settings/settings-page").then((module) => ({
    default: module.SettingsPage,
  })),
);

function ProtectedRoutes() {
  const { session } = useTransitData();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell />
  );
}

function RouteFallback() {
  return (
    <div className="panel-surface p-6 text-[13px] text-[var(--muted)]">
      Loading page...
    </div>
  );
}

function suspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function AccessGate({ permissionKey, children }) {
  const { session, rbacMatrix, canAccess } = useTransitData();

  if (!canAccess(permissionKey)) {
    return (
      <Navigate
        to={getDefaultRouteForRole(rbacMatrix, session?.role)}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const { session } = useTransitData();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={suspense(<DashboardPage />)} />
        <Route
          path="/fleet"
          element={<AccessGate permissionKey="fleet">{suspense(<FleetPage />)}</AccessGate>}
        />
        <Route
          path="/drivers"
          element={<AccessGate permissionKey="drivers">{suspense(<DriversPage />)}</AccessGate>}
        />
        <Route
          path="/trips"
          element={<AccessGate permissionKey="trips">{suspense(<TripsPage />)}</AccessGate>}
        />
        <Route
          path="/maintenance"
          element={
            <AccessGate permissionKey="maintenance">
              {suspense(<MaintenancePage />)}
            </AccessGate>
          }
        />
        <Route
          path="/expenses"
          element={
            <AccessGate permissionKey="fuelExpenses">
              {suspense(<ExpensesPage />)}
            </AccessGate>
          }
        />
        <Route
          path="/analytics"
          element={
            <AccessGate permissionKey="analytics">
              {suspense(<AnalyticsPage />)}
            </AccessGate>
          }
        />
        <Route path="/settings" element={suspense(<SettingsPage />)} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
