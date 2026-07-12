import { useState } from "react";
import {
  ClipboardList,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransitData } from "../../app/transit-data";
import { Card } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { useDemoLoading } from "../../hooks/use-demo-loading";
import {
  DASHBOARD_CARD_META,
  DASHBOARD_CARD_ORDER,
  DASHBOARD_ROLE_COPY,
} from "../../lib/dashboard";
import {
  buildExpenseTrend,
  buildLicenseWatchlist,
  buildMaintenanceStatusData,
  buildRecentTrips,
  buildTransitStats,
  buildVehicleStatusData,
} from "../../lib/transit-selectors";
import { formatCurrency, formatDate, formatNumber, formatRelativeDays } from "../../lib/utils";
import { isLiveTripStatus } from "../../lib/rbac";

const series = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-[var(--border-2)] bg-[var(--surface-2)] px-3 py-2 text-[12px]">
      <p className="font-mono text-[var(--text)]">{payload[0].value}</p>
      <p className="text-[var(--muted)]">{payload[0].name}</p>
    </div>
  );
}

function InstrumentCell({ label, value, note, pulse = false }) {
  return (
    <div className="flex min-h-[168px] flex-col justify-between border-b border-[var(--border)] p-5 md:min-h-[176px] xl:border-b-0 xl:border-r xl:last:border-r-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mono-display mt-4">{value}</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[var(--text)]">
          {pulse ? (
            <span className="status-pulse inline-block font-mono text-[12px]">●</span>
          ) : (
            <span className="font-mono text-[18px]">○</span>
          )}
        </div>
      </div>
      <p className="text-[12px] text-[var(--text-2)]">{note}</p>
    </div>
  );
}

export function DashboardPage() {
  const loading = useDemoLoading("dashboard");
  const {
    session,
    vehicles,
    drivers,
    trips,
    maintenance,
    expenses,
    fuelLogs,
    canAccess,
  } = useTransitData();

  const role = session?.role || "Fleet Manager";
  const roleCopy = DASHBOARD_ROLE_COPY[role] || DASHBOARD_ROLE_COPY["Fleet Manager"];

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const vehicleTypes = ["All", ...new Set(vehicles.map((item) => item.type))];
  const regions = ["All", ...new Set(vehicles.map((item) => item.region))];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesType = typeFilter === "All" || vehicle.type === typeFilter;
    const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;
    const matchesRegion = regionFilter === "All" || vehicle.region === regionFilter;
    return matchesType && matchesStatus && matchesRegion;
  });

  const filteredVehicleIds = filteredVehicles.map((vehicle) => vehicle.id);
  const filteredTrips = trips.filter((trip) => {
    const vehicle = vehicles.find((item) => item.id === trip.vehicleId);
    const matchesType = typeFilter === "All" || vehicle?.type === typeFilter;
    const matchesVehicleStatus =
      statusFilter === "All" || vehicle?.status === statusFilter;
    const matchesRegion = regionFilter === "All" || trip.region === regionFilter;
    return matchesType && matchesVehicleStatus && matchesRegion;
  });
  const filteredTripDriverIds = filteredTrips.map((trip) => trip.driverId);
  const filteredDrivers = drivers.filter((driver) => {
    if (regionFilter !== "All" && driver.region !== regionFilter) {
      return false;
    }

    if (statusFilter !== "All" && !["Available", "On Trip", "Suspended"].includes(statusFilter)) {
      return true;
    }

    return statusFilter === "All" || driver.status === statusFilter;
  });
  const filteredMaintenance = maintenance.filter((record) =>
    filteredVehicleIds.includes(record.vehicleId),
  );
  const filteredExpenses = expenses.filter((item) =>
    filteredVehicleIds.includes(item.vehicleId),
  );
  const filteredFuelLogs = fuelLogs.filter((item) =>
    filteredVehicleIds.includes(item.vehicleId),
  );

  const stats = buildTransitStats({
    vehicles: filteredVehicles,
    drivers: filteredDrivers,
    trips: filteredTrips,
    maintenance: filteredMaintenance,
    expenses: filteredExpenses,
    fuelLogs: filteredFuelLogs,
  });
  const recentTrips = buildRecentTrips(filteredTrips, vehicles, drivers);
  const vehicleStatusData = buildVehicleStatusData(filteredVehicles);
  const maintenanceData = buildMaintenanceStatusData(filteredMaintenance, filteredVehicles);
  const expenseTrend = buildExpenseTrend(filteredExpenses, filteredFuelLogs);
  const licenseWatchlist = buildLicenseWatchlist(
    filteredDrivers.filter(
      (driver) =>
        filteredTripDriverIds.includes(driver.id) || regionFilter === "All" || driver.region === regionFilter,
    ),
  );
  const visibleMetricKeys = (DASHBOARD_CARD_ORDER[role] || DASHBOARD_CARD_ORDER["Fleet Manager"])
    .filter((key) => canAccess(DASHBOARD_CARD_META[key].permissionKey));
  const metricGridClass =
    visibleMetricKeys.length <= 2
      ? "xl:grid-cols-2"
      : visibleMetricKeys.length <= 4
        ? "xl:grid-cols-4"
        : "xl:grid-cols-6";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            {roleCopy.eyebrow}
          </p>
          <h1 className="text-[24px] font-extrabold text-[var(--text)]">Dashboard</h1>
          <p className="text-[14px] text-[var(--text-2)]">{roleCopy.summary}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All" ? "All vehicle types" : type}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </Select>
          <Select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === "All" ? "All regions" : region}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <section className="overflow-hidden border border-[var(--border)]">
        <div className={`grid md:grid-cols-2 ${metricGridClass}`}>
          {visibleMetricKeys.map((key) => (
            <InstrumentCell
              key={key}
              label={DASHBOARD_CARD_META[key].label}
              value={formatDashboardMetric(key, stats)}
              note={DASHBOARD_CARD_META[key].note}
              pulse={DASHBOARD_CARD_META[key].pulse}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {canAccess("trips") && (
          <Card eyebrow="Dispatch board" title="Recent Trips" subtitle="Latest state changes">
            <TableShell
              columns={[
                { key: "trip", label: "TRIP ID" },
                { key: "route", label: "ROUTE" },
                { key: "vehicle", label: "VEHICLE" },
                { key: "driver", label: "DRIVER" },
                { key: "status", label: "STATUS", className: "text-right" },
              ]}
              data={recentTrips}
              loading={loading}
              emptyIcon={ClipboardList}
              emptyTitle="No trips yet"
              emptyDescription="Create or dispatch a trip to populate the live board."
              renderRow={(trip) => (
                <tr
                  key={trip.id}
                  className="h-14 border-b border-[var(--border)] transition duration-150 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-4 font-mono text-[14px] text-[var(--text)]">
                    {trip.id}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-2)]">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {trip.vehicle?.regNumber}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-2)]">{trip.driver?.name}</td>
                  <td className="px-4 py-4 text-right">
                    <StatusChip status={trip.status} pulsing={isLiveTripStatus(trip.status)} />
                  </td>
                </tr>
              )}
            />
          </Card>
        )}

        {canAccess("fleet") && (
          <Card eyebrow="Fleet mix" title="Vehicle Status" subtitle="Distribution across the fleet">
            <div className="h-[300px]">
              {loading ? (
                <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
                  Rendering fleet distribution...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={108}
                      paddingAngle={2}
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={series[index % series.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid gap-2">
              {vehicleStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <StatusChip
                    status={item.name}
                    pulsing={item.name === "On Trip" || item.name === "Dispatched"}
                  />
                  <span className="font-mono text-[var(--text)]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {canAccess("drivers") && (
          <Card eyebrow="Compliance watch" title="License Watchlist" subtitle="Drivers expiring within 30 days">
            <TableShell
              columns={[
                { key: "driver", label: "DRIVER" },
                { key: "license", label: "LICENSE NO." },
                { key: "expiry", label: "EXPIRY" },
                { key: "status", label: "STATUS", className: "text-right" },
              ]}
              data={licenseWatchlist}
              loading={loading}
              emptyIcon={Users}
              emptyTitle="No urgent renewals"
              emptyDescription="No visible driver licenses are expiring in the next 30 days."
              renderRow={(driver) => (
                <tr
                  key={driver.id}
                  className="h-14 border-b border-[var(--border)] transition duration-150 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-4 text-[var(--text)]">{driver.name}</td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-2)]">
                    {formatDate(driver.licenseExpiry)} · {formatRelativeDays(driver.licenseExpiry)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <StatusChip status={driver.status} pulsing={driver.status === "On Trip"} />
                  </td>
                </tr>
              )}
            />
          </Card>
        )}

        {canAccess("maintenance") && (
          <Card eyebrow="Service load" title="Maintenance Overview" subtitle="Open versus completed work orders">
            <div className="h-[280px]">
              {loading ? (
                <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
                  Loading service data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceData} barCategoryGap={30}>
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value">
                      {maintenanceData.map((entry, index) => (
                        <Cell key={entry.name} fill={series[index + 1]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        {(canAccess("fuelExpenses") || canAccess("analytics")) && (
          <Card eyebrow="Cost drift" title="Expense Summary" subtitle="Seven-day operational spend trend">
            <div className="h-[280px]">
              {loading ? (
                <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
                  Loading cost trend...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenseTrend}>
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--series-1)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text-2)]">
              Visible cost layer across this filter set:{" "}
              <span className="font-mono text-[var(--text)]">
                {formatCurrency(stats.totalOperationalCost)}
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatDashboardMetric(key, stats) {
  const value = stats[key] ?? 0;
  const meta = DASHBOARD_CARD_META[key];

  if (meta.format === "currency") {
    return formatCurrency(value);
  }

  if (meta.suffix) {
    return `${value}${meta.suffix}`;
  }

  return formatNumber(value);
}
