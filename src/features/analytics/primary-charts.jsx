import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/card";
import { StatusChip } from "../../components/ui/status-chip";
import { ChartTooltip } from "./chart-tooltip";

const series = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
];

export function FleetUtilizationTrend({ data }) {
  return (
    <Card
      eyebrow="Performance"
      title="Which vehicles are generating the most movement?"
      subtitle="Fleet utilization trend over time"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="value" stroke="var(--series-1)" fill="var(--series-1)" fillOpacity={0.16} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[12px] text-[var(--text-2)]">
        Utilization = active vehicles / total active fleet. Higher values indicate better asset deployment.
      </div>
    </Card>
  );
}

export function VehicleStatusDistribution({ data }) {
  return (
    <Card
      eyebrow="Fleet mix"
      title="How is the fleet distributed right now?"
      subtitle="Vehicle status breakdown"
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={series[index % series.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3" style={{ background: series[i % series.length] }} />
              <StatusChip status={item.name} pulsing={item.name === "On Trip"} />
            </div>
            <span className="font-mono text-[var(--text)]">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FuelEfficiencyByVehicle({ data }) {
  return (
    <Card
      eyebrow="Efficiency"
      title="Which vehicles consume the least fuel per kilometre?"
      subtitle="Fuel efficiency ranked best to worst (km/L)"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} width={110} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="efficiency" name="km/L">
              {data.map((entry, index) => (
                <Cell key={entry.id} fill={series[index % series.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function OperationalCostBreakdown({ data }) {
  return (
    <Card
      eyebrow="Cost analysis"
      title="Where is the fleet spending the most?"
      subtitle="Operational cost split by category"
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={series[index % series.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3" style={{ background: series[i % series.length] }} />
              <span className="text-[13px] text-[var(--text)]">{item.name}</span>
            </div>
            <span className="font-mono text-[var(--text)]">${item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function VehicleROIRanking({ data }) {
  return (
    <Card
      eyebrow="Profitability"
      title="Which assets are generating the best return?"
      subtitle="Vehicle ROI ranking (revenue minus costs / costs)"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} width={110} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="roi" name="ROI">
              {data.map((entry, index) => (
                <Cell key={entry.id} fill={entry.roi >= 0 ? series[index % series.length] : "var(--series-3)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function TripStatusOverview({ data }) {
  return (
    <Card
      eyebrow="Dispatch"
      title="How many trips succeeded versus failed?"
      subtitle="Trip outcome distribution"
    >
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={30}>
            <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Trips">
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={series[index % series.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function MaintenanceImpactChart({ data }) {
  return (
    <Card
      eyebrow="Service load"
      title="Which vehicles are losing the most time to maintenance?"
      subtitle="Downtime hours per vehicle"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} width={110} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="downtimeHrs" name="Downtime (hrs)">
              {data.map((entry, index) => (
                <Cell key={entry.id} fill={series[(index + 1) % series.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function DriverComplianceRiskChart({ data }) {
  const chartData = data
    .filter((d) => d.riskScore > 0)
    .map((d) => ({ name: d.name.split(" ")[0], risk: d.riskScore, daysToExpiry: d.daysToExpiry }));

  return (
    <Card
      eyebrow="Safety"
      title="Which drivers need compliance attention?"
      subtitle="Risk score based on license validity, safety rating, and status"
    >
      <div className="h-[280px]">
        {chartData.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
            No compliance risks detected.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap={30}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="risk" name="Risk Score">
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.risk >= 50 ? "var(--series-1)" : entry.risk >= 20 ? "var(--series-3)" : "var(--series-4)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
