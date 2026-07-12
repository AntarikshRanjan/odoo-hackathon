import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/card";
import { formatCurrency } from "../../lib/utils";
import { ChartTooltip } from "./chart-tooltip";

const kpiCards = [
  { key: "activeVehicles", label: "Active Vehicles", icon: "●", note: "Currently on trip", color: "var(--series-1)" },
  { key: "availableVehicles", label: "Available Vehicles", icon: "○", note: "Dispatch-ready units", color: "var(--series-2)" },
  { key: "vehiclesInMaintenance", label: "In Maintenance", icon: "◐", note: "Vehicles in shop", color: "var(--series-3)" },
  { key: "activeTrips", label: "Active Trips", icon: "●", note: "Live in the network", color: "var(--series-1)" },
  { key: "pendingTrips", label: "Pending Trips", icon: "○", note: "Draft awaiting dispatch", color: "var(--series-4)" },
  { key: "driversOnDuty", label: "Drivers On Duty", icon: "●", note: "Currently assigned", color: "var(--series-2)" },
  { key: "fleetUtilization", label: "Fleet Utilization", icon: "%", note: "Active / Total fleet", color: "var(--series-1)", suffix: "%" },
  { key: "fuelCost", label: "Fuel Cost", icon: "₹", note: "Total fuel spend", color: "var(--series-3)", currency: true },
  { key: "maintenanceCost", label: "Maintenance Cost", icon: "₹", note: "All work orders", color: "var(--series-4)", currency: true },
  { key: "operationalCost", label: "Operational Cost", icon: "₹", note: "Fuel + maintenance + expenses", color: "var(--series-2)", currency: true },
  { key: "vehicleROI", label: "Vehicle ROI", icon: "x", note: "Revenue / costs ratio", color: "var(--series-1)" },
];

function formatValue(card, value) {
  if (card.currency) {
    return formatCurrency(value);
  }
  if (card.suffix) return `${value}${card.suffix}`;
  if (typeof value === "number" && value % 1 !== 0) return `${value}x`;
  return String(value);
}

export function KpiSection({ kpis, sparklines }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((card) => {
        const value = kpis[card.key];
        const sparkData = sparklines[card.key === "fuelCost" ? "operationalCost" : card.key === "maintenanceCost" ? "operationalCost" : card.key === "operationalCost" ? "operationalCost" : card.key === "vehicleROI" ? "vehicleROI" : card.key === "fleetUtilization" ? "fleetUtilization" : card.key === "activeVehicles" ? "fleetUtilization" : null];

        return (
          <Card key={card.key} className="metric-card">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
              {card.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="mono-display text-[30px]">{formatValue(card, value)}</p>
              <span className="font-mono text-[14px] text-[var(--muted)]">{card.icon}</span>
            </div>
            {sparkData && (
              <div className="mt-4 h-[82px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <XAxis hide dataKey="name" />
                    <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip content={<ChartTooltip />} />
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
            )}
            <p className="mt-2 text-[11px] text-[var(--muted)]">{card.note}</p>
          </Card>
        );
      })}
    </div>
  );
}
