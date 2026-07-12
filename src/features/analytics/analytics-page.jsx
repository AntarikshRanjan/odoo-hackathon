import { Download, LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { TableShell } from "../../components/ui/table-shell";
import { downloadCsv, formatCurrency } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

const trendCards = [
  {
    label: "Fuel Efficiency",
    value: "12.8 km/L",
    data: [
      { name: "M", value: 10.1 },
      { name: "T", value: 11.2 },
      { name: "W", value: 12.3 },
      { name: "T", value: 12.1 },
      { name: "F", value: 12.8 },
    ],
    color: "var(--series-1)",
  },
  {
    label: "Fleet Utilization",
    value: "74%",
    data: [
      { name: "M", value: 61 },
      { name: "T", value: 68 },
      { name: "W", value: 66 },
      { name: "T", value: 71 },
      { name: "F", value: 74 },
    ],
    color: "var(--series-2)",
  },
  {
    label: "Operational Cost",
    value: "$8.4k",
    data: [
      { name: "M", value: 6.1 },
      { name: "T", value: 7.2 },
      { name: "W", value: 7.8 },
      { name: "T", value: 8.1 },
      { name: "F", value: 8.4 },
    ],
    color: "var(--series-3)",
  },
  {
    label: "Vehicle ROI",
    value: "1.42x",
    data: [
      { name: "M", value: 1.01 },
      { name: "T", value: 1.15 },
      { name: "W", value: 1.18 },
      { name: "T", value: 1.31 },
      { name: "F", value: 1.42 },
    ],
    color: "var(--series-4)",
  },
];

export function AnalyticsPage() {
  const loading = useDemoLoading("analytics");
  const { vehicles, trips, expenses, fuelLogs } = useTransitData();

  const comparisonRows = vehicles
    .filter((vehicle) => vehicle.status !== "Retired")
    .map((vehicle) => {
      const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.id);
      const vehicleExpenses = expenses
        .filter((expense) => expense.vehicleId === vehicle.id)
        .reduce((sum, item) => sum + item.amount, 0);
      const vehicleFuel = fuelLogs
        .filter((log) => log.vehicleId === vehicle.id)
        .reduce((sum, item) => sum + item.amount, 0);
      const utilization = Math.min(100, vehicleTrips.length * 18 + (vehicle.status === "On Trip" ? 18 : 0));
      const roi = ((vehicleTrips.length * 520) / Math.max(1, vehicleExpenses + vehicleFuel)).toFixed(2);

      return {
        id: vehicle.id,
        regNumber: vehicle.regNumber,
        utilization,
        operatingCost: vehicleExpenses + vehicleFuel,
        roi,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Reports
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">
            Analytics & Reports
          </h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Metric cards, trend sparklines, and a vehicle-level comparison export.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              downloadCsv("transitops-vehicle-comparison.csv", [
                ["Registration", "Utilization", "Operating Cost", "ROI"],
                ...comparisonRows.map((item) => [
                  item.regNumber,
                  `${item.utilization}%`,
                  item.operatingCost,
                  item.roi,
                ]),
              ])
            }
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" variant="ghost" disabled>
            <Download className="h-4 w-4" />
            Export PDF Soon
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trendCards.map((card) => (
          <Card key={card.label} className="metric-card">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
              {card.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="mono-display text-[30px]">{card.value}</p>
              <LineChartIcon className="h-4 w-4 text-[var(--muted)]" />
            </div>
            <div className="mt-4 h-[82px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.data}>
                  <XAxis hide dataKey="name" />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={card.color}
                    fill={card.color}
                    fillOpacity={0.16}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Vehicle Comparison" subtitle="Per-unit operating efficiency">
        <TableShell
          columns={[
            { key: "vehicle", label: "Vehicle" },
            { key: "util", label: "Utilization", className: "text-right" },
            { key: "cost", label: "Operating Cost", className: "text-right" },
            { key: "roi", label: "ROI", className: "text-right" },
          ]}
          data={comparisonRows}
          loading={loading}
          emptyIcon={LineChartIcon}
          emptyTitle="No analytics yet"
          emptyDescription="Once vehicles start moving, the comparison view will populate."
          renderRow={(row) => (
            <tr
              key={row.id}
              className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-4 font-mono text-[var(--text)]">
                {row.regNumber}
              </td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {row.utilization}%
              </td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {formatCurrency(row.operatingCost)}
              </td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {row.roi}x
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}
