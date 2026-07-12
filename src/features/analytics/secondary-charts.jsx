import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/card";
import { ChartTooltip } from "./chart-tooltip";

const series = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
];

export function OdometerGrowthChart({ data }) {
  return (
    <Card
      eyebrow="Asset wear"
      title="Which vehicles have accumulated the most distance?"
      subtitle="Current odometer reading by vehicle"
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} width={110} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="odometer" name="Odometer (km)">
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

export function FuelSpendTrendChart({ data }) {
  return (
    <Card
      eyebrow="Fuel cost"
      title="How has fuel spending changed over time?"
      subtitle="Daily fuel expenditure trend"
    >
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
            No fuel data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="var(--series-1)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function TripsCompletedVsCancelledChart({ data }) {
  return (
    <Card
      eyebrow="Trip outcomes"
      title="Are more trips being completed or cancelled?"
      subtitle="Completed vs cancelled trips over time"
    >
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
            No trip data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={20}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="completed" name="Completed" fill="var(--series-1)" />
              <Bar dataKey="cancelled" name="Cancelled" fill="var(--series-3)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function MaintenanceCostTrendChart({ data }) {
  return (
    <Card
      eyebrow="Service cost"
      title="Is maintenance spending increasing or stabilising?"
      subtitle="Daily maintenance expenditure trend"
    >
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
            No maintenance cost data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="var(--series-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function RevenueVsCostChart({ data }) {
  return (
    <Card
      eyebrow="Profitability"
      title="Is the fleet earning more than it spends?"
      subtitle="Revenue versus total operational cost"
    >
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-[var(--muted)]">
            No financial data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={20}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--series-1)" />
              <Bar dataKey="cost" name="Cost" fill="var(--series-3)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
