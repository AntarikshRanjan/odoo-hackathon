import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTransitData } from "./transit-data";
import { AppShell } from "../components/layout/app-shell";
import { LoginPage } from "../features/auth/login-page";

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
        <Route path="/fleet" element={suspense(<FleetPage />)} />
        <Route path="/drivers" element={suspense(<DriversPage />)} />
        <Route path="/trips" element={suspense(<TripsPage />)} />
        <Route path="/maintenance" element={suspense(<MaintenancePage />)} />
        <Route path="/expenses" element={suspense(<ExpensesPage />)} />
        <Route path="/analytics" element={suspense(<AnalyticsPage />)} />
        <Route path="/settings" element={suspense(<SettingsPage />)} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
