import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  Truck,
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
import { formatCurrency, formatDate, formatNumber } from "../../lib/utils";

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

function InstrumentCell({ icon: Icon, label, value, note, pulse = false }) {
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
            <Icon className="h-5 w-5" />
          )}
        </div>
      </div>
      <p className="text-[12px] text-[var(--text-2)]">{note}</p>
    </div>
  );
}

export function DashboardPage() {
  const loading = useDemoLoading("dashboard");
  const { vehicles, drivers, trips, maintenance, expenseTrend, stats } = useTransitData();

  const vehicleStatusData = Object.entries(
    vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const maintenanceData = [
    { name: "OPEN", value: maintenance.filter((item) => item.status === "Open").length },
    { name: "CLOSED", value: maintenance.filter((item) => item.status === "Closed").length },
    {
      name: "DUE SOON",
      value: vehicles.filter((item) => {
        const diff =
          (new Date() - new Date(item.lastService)) / (1000 * 60 * 60 * 24);
        return diff > 25 && diff < 40;
      }).length,
    },
  ];

  const recentTrips = trips.slice(0, 5).map((trip) => ({
    ...trip,
    vehicle: vehicles.find((item) => item.id === trip.vehicleId),
    driver: drivers.find((item) => item.id === trip.driverId),
  }));

  const utilization = Math.round(
    (vehicles.filter((item) => item.status === "On Trip").length /
      Math.max(1, vehicles.filter((item) => item.status !== "Retired").length)) *
      100,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Live system view
          </p>
          <h1 className="text-[24px] font-extrabold text-[var(--text)]">Dashboard</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            The fleet state, dispatch pressure, and cost drift in one scan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select defaultValue="all">
            <option value="all">All vehicle types</option>
            <option value="mini">Mini Truck</option>
            <option value="light">Light Truck</option>
            <option value="heavy">Heavy Truck</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="live">On Trip</option>
            <option value="shop">In Shop</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All regions</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
          </Select>
        </div>
      </div>

      <section className="overflow-hidden border border-[var(--border)]">
        <div className="grid md:grid-cols-2 xl:grid-cols-6">
          <InstrumentCell
            icon={Truck}
            label="ACTIVE TRIPS"
            value={formatNumber(stats.activeTrips)}
            note="Trips live in the network right now."
            pulse
          />
          <InstrumentCell
            icon={ArrowUpRight}
            label="FLEET UTILIZATION"
            value={`${utilization}%`}
            note="Vehicles currently generating movement."
          />
          <InstrumentCell
            icon={ClipboardList}
            label="VEHICLES AVAILABLE"
            value={formatNumber(stats.availableVehicles)}
            note="Dispatch-ready units in the pool."
          />
          <InstrumentCell
            icon={AlertTriangle}
            label="OPEN MAINTENANCE"
            value={formatNumber(stats.inShopVehicles)}
            note="Vehicles unavailable due to service."
          />
          <InstrumentCell
            icon={Users}
            label="READY DRIVERS"
            value={formatNumber(stats.dispatchReadyDrivers)}
            note="Valid-license drivers with no active trip."
          />
          <InstrumentCell
            icon={DollarSign}
            label="OPERATIONAL COST"
            value={formatCurrency(stats.totalOperationalCost)}
            note="Fuel and expense spend in the current window."
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
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
            emptyDescription="Dispatch your first route to populate the live board."
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
                  <StatusChip status={trip.status} pulsing={trip.status === "Dispatched"} />
                </td>
              </tr>
            )}
          />
        </Card>

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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
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
            Peak spend this week landed on{" "}
            <span className="font-mono text-[var(--text)]">{formatDate("2026-07-12")}</span>.
          </div>
        </Card>
      </div>
    </div>
  );
}
