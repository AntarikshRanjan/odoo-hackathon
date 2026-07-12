import { useState } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { useDemoLoading } from "../../hooks/use-demo-loading";
import { useAnalytics } from "./use-analytics";
import { AnalyticsFilters } from "./analytics-filters";
import { KpiSection } from "./kpi-section";
import {
  FleetUtilizationTrend,
  VehicleStatusDistribution,
  FuelEfficiencyByVehicle,
  OperationalCostBreakdown,
  VehicleROIRanking,
  TripStatusOverview,
  MaintenanceImpactChart,
  DriverComplianceRiskChart,
} from "./primary-charts";
import {
  OdometerGrowthChart,
  FuelSpendTrendChart,
  TripsCompletedVsCancelledChart,
  MaintenanceCostTrendChart,
  RevenueVsCostChart,
} from "./secondary-charts";
import {
  VehiclesAtRiskTable,
  DriverReadinessTable,
  TripPerformanceTable,
  MaintenanceSummaryTable,
  ExpenseSummaryTable,
} from "./insight-tables";

const roleVisibility = {
  "Fleet Manager": "all",
  "Dispatcher": "trips",
  "Safety Officer": "safety",
  "Financial Analyst": "finance",
};

export function AnalyticsPage() {
  const loading = useDemoLoading("analytics");
  const { session, rbacMatrix, vehicles, drivers, trips, maintenance, fuelLogs, expenses } = useTransitData();
  const [filters, setFilters] = useState({});

  const activeRole = session?.role || "Fleet Manager";
  const permission = rbacMatrix[activeRole]?.analytics || "none";
  const viewMode = roleVisibility[activeRole] || "all";

  const analytics = useAnalytics(filters);

  const {
    kpis,
    sparklines,
    vehicleStatusDistribution,
    fuelEfficiencyByVehicle,
    operationalCostBreakdown,
    vehicleROIRanking,
    tripStatusOverview,
    maintenanceImpact,
    driverComplianceRisk,
    odometerGrowth,
    fuelSpendTrend,
    tripsCompletedVsCancelled,
    maintenanceCostTrend,
    revenueVsCost,
    vehiclesAtRisk,
    driverReadiness,
    tripPerformance,
    maintenanceSummary,
    expenseSummary,
    filterOptions,
  } = analytics;

  function handleExportAll() {
    const rows = [
      ["TRANSITOPS ANALYTICS EXPORT"],
      [""],
      ["KPI Summary"],
      ["Active Vehicles", kpis.activeVehicles],
      ["Available Vehicles", kpis.availableVehicles],
      ["Vehicles in Maintenance", kpis.vehiclesInMaintenance],
      ["Active Trips", kpis.activeTrips],
      ["Pending Trips", kpis.pendingTrips],
      ["Drivers On Duty", kpis.driversOnDuty],
      ["Fleet Utilization", `${kpis.fleetUtilization}%`],
      ["Fuel Cost", kpis.fuelCost],
      ["Maintenance Cost", kpis.maintenanceCost],
      ["Operational Cost", kpis.operationalCost],
      ["Vehicle ROI", kpis.vehicleROI],
      [""],
      ["Vehicle Risk Assessment"],
      ["Registration", "Model", "Status", "Odometer", "Total Cost", "ROI", "Flags"],
      ...vehiclesAtRisk.map((r) => [
        r.regNumber, r.model, r.status, r.odometerKm, r.totalCost, `${r.roi}x`, r.flags.join("; "),
      ]),
      [""],
      ["Driver Readiness"],
      ["Name", "License", "Expiry", "Safety Score", "Status", "Eligible", "Risk Flags"],
      ...driverReadiness.map((r) => [
        r.name, r.licenseNumber, r.licenseExpiry, r.safetyScore, r.status, r.eligible ? "Yes" : "No", r.riskFlags.join("; "),
      ]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transitops-analytics-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (permission === "none") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <div className="flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Access Restricted</h2>
        <p className="text-[14px] text-[var(--text-2)] max-w-md">
          Your active simulated role <strong>{activeRole}</strong> does not have permission to view Analytics.
          You can adjust these permissions in the <strong>Settings</strong> tab.
        </p>
      </div>
    );
  }

  const isLoading = loading || (vehicles.length === 0 && drivers.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Live system intelligence
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">
            Analytics & Reports
          </h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Real-time operational intelligence computed from every fleet record, trip, fuel log, and expense in the system.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleExportAll}>
            <Download className="h-4 w-4" />
            Export All CSV
          </Button>
        </div>
      </div>

      <AnalyticsFilters filters={filters} onFilterChange={setFilters} filterOptions={filterOptions} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="panel-surface p-6">
              <div className="skeleton-flat h-3 w-24 bg-[var(--surface-2)]" />
              <div className="skeleton-flat mt-4 h-8 w-20 bg-[var(--surface-2)]" />
              <div className="skeleton-flat mt-4 h-[82px] w-full bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      ) : (
        <KpiSection kpis={kpis} sparklines={sparklines} />
      )}

      {(viewMode === "all" || viewMode === "fleet") && (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <FleetUtilizationTrend data={sparklines.fleetUtilization} />
            <VehicleStatusDistribution data={vehicleStatusDistribution} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <FuelEfficiencyByVehicle data={fuelEfficiencyByVehicle} />
            <OperationalCostBreakdown data={operationalCostBreakdown} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <VehicleROIRanking data={vehicleROIRanking} />
            <MaintenanceImpactChart data={maintenanceImpact} />
          </div>
        </>
      )}

      {(viewMode === "all" || viewMode === "trips") && (
        <div className="grid gap-6 xl:grid-cols-2">
          <TripStatusOverview data={tripStatusOverview} />
          <TripsCompletedVsCancelledChart data={tripsCompletedVsCancelled} />
        </div>
      )}

      {(viewMode === "all" || viewMode === "safety") && (
        <DriverComplianceRiskChart data={driverComplianceRisk} />
      )}

      {(viewMode === "all" || viewMode === "finance") && (
        <div className="grid gap-6 xl:grid-cols-2">
          <RevenueVsCostChart data={revenueVsCost} />
          <FuelSpendTrendChart data={fuelSpendTrend} />
        </div>
      )}

      {viewMode === "all" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <OdometerGrowthChart data={odometerGrowth} />
          <MaintenanceCostTrendChart data={maintenanceCostTrend} />
        </div>
      )}

      {(viewMode === "all" || viewMode === "fleet") && (
        <VehiclesAtRiskTable data={vehiclesAtRisk} />
      )}

      {(viewMode === "all" || viewMode === "safety") && (
        <DriverReadinessTable data={driverReadiness} />
      )}

      {(viewMode === "all" || viewMode === "trips") && (
        <TripPerformanceTable data={tripPerformance} />
      )}

      {(viewMode === "all" || viewMode === "fleet") && (
        <MaintenanceSummaryTable data={maintenanceSummary} />
      )}

      {(viewMode === "all" || viewMode === "finance") && (
        <ExpenseSummaryTable data={expenseSummary} />
      )}
    </div>
  );
}
