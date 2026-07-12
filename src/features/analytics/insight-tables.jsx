import {
  AlertTriangle,
  ClipboardCheck,
  DollarSign,
  Route,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Card } from "../../components/ui/card";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { downloadCsv, formatCurrency, formatDate } from "../../lib/utils";

export function VehiclesAtRiskTable({ data }) {
  return (
    <Card
      eyebrow="Asset health"
      title="Which vehicles are creating the highest cost?"
      subtitle="Fleet health indicators with attention flags"
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv("transitops-vehicles-at-risk.csv", [
              ["Registration", "Model", "Type", "Status", "Odometer", "Last Service", "Fuel Efficiency", "Total Cost", "ROI", "Flags"],
              ...data.map((r) => [
                r.regNumber, r.model, r.type, r.status, r.odometerKm,
                r.lastService, `${r.fuelEfficiency} km/L`, r.totalCost, `${r.roi}x`,
                r.flags.join("; "),
              ]),
            ])
          }
          className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-2)] hover:text-[var(--text)] transition"
        >
          Export CSV
        </button>
      }
    >
      <TableShell
        columns={[
          { key: "reg", label: "REGISTRATION" },
          { key: "model", label: "VEHICLE" },
          { key: "type", label: "TYPE" },
          { key: "status", label: "STATUS" },
          { key: "odometer", label: "ODOMETER", className: "text-right" },
          { key: "service", label: "LAST SERVICE" },
          { key: "efficiency", label: "FUEL EFF.", className: "text-right" },
          { key: "cost", label: "TOTAL COST", className: "text-right" },
          { key: "roi", label: "ROI", className: "text-right" },
          { key: "flags", label: "FLAGS" },
        ]}
        data={data}
        emptyIcon={Truck}
        emptyTitle="No vehicle data"
        emptyDescription="Vehicle risk data will appear once fleet records are loaded."
        renderRow={(row) => (
          <tr key={row.id} className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]">
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.regNumber}</td>
            <td className="px-4 py-4 text-[var(--text-2)]">{row.model}</td>
            <td className="px-4 py-4 text-[var(--text-2)]">{row.type}</td>
            <td className="px-4 py-4"><StatusChip status={row.status} /></td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{row.odometerKm.toLocaleString()} km</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{formatDate(row.lastService)}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{row.fuelEfficiency > 0 ? `${row.fuelEfficiency} km/L` : "—"}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{formatCurrency(row.totalCost)}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{row.roi}x</td>
            <td className="px-4 py-4">
              {row.flags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {row.flags.map((f) => (
                    <span key={f} className="inline-block border border-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text)]">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[12px] text-[var(--muted)]">—</span>
              )}
            </td>
          </tr>
        )}
      />
    </Card>
  );
}

export function DriverReadinessTable({ data }) {
  return (
    <Card
      eyebrow="Workforce"
      title="Which drivers need compliance attention?"
      subtitle="Driver readiness and license compliance status"
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv("transitops-driver-readiness.csv", [
              ["Name", "License", "Category", "Expiry", "Days to Expiry", "Safety Score", "Status", "Eligible", "Risk Flags"],
              ...data.map((r) => [
                r.name, r.licenseNumber, r.licenseCategory, r.licenseExpiry,
                r.daysToExpiry, r.safetyScore, r.status, r.eligible ? "Yes" : "No",
                r.riskFlags.join("; "),
              ]),
            ])
          }
          className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-2)] hover:text-[var(--text)] transition"
        >
          Export CSV
        </button>
      }
    >
      <TableShell
        columns={[
          { key: "name", label: "DRIVER" },
          { key: "license", label: "LICENSE NO." },
          { key: "category", label: "CATEGORY" },
          { key: "expiry", label: "LICENSE EXPIRY" },
          { key: "daysLeft", label: "DAYS LEFT", className: "text-right" },
          { key: "safety", label: "SAFETY", className: "text-right" },
          { key: "status", label: "STATUS" },
          { key: "eligible", label: "ELIGIBLE" },
          { key: "risk", label: "RISK FLAGS" },
        ]}
        data={data}
        emptyIcon={ShieldAlert}
        emptyTitle="No driver data"
        emptyDescription="Driver readiness data will appear once records are loaded."
        renderRow={(row) => (
          <tr key={row.id} className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]">
            <td className="px-4 py-4 text-[var(--text)]">{row.name}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.licenseNumber}</td>
            <td className="px-4 py-4 text-[var(--text-2)]">{row.licenseCategory}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{formatDate(row.licenseExpiry)}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
              <span className={row.daysToExpiry < 0 ? "text-[var(--text)]" : row.daysToExpiry <= 30 ? "text-[var(--text)]" : ""}>
                {row.daysToExpiry < 0 ? `${Math.abs(row.daysToExpiry)}d overdue` : `${row.daysToExpiry}d`}
              </span>
            </td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{row.safetyScore}</td>
            <td className="px-4 py-4"><StatusChip status={row.status} /></td>
            <td className="px-4 py-4 text-center font-mono text-[var(--text)]">{row.eligible ? "○" : "✕"}</td>
            <td className="px-4 py-4">
              {row.riskFlags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {row.riskFlags.map((f) => (
                    <span key={f} className="inline-block border border-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text)]">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[12px] text-[var(--muted)]">Clear</span>
              )}
            </td>
          </tr>
        )}
      />
    </Card>
  );
}

export function TripPerformanceTable({ data }) {
  return (
    <Card
      eyebrow="Trip analytics"
      title="How are individual trips performing?"
      subtitle="Trip performance with actual versus planned metrics"
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv("transitops-trip-performance.csv", [
              ["Trip Code", "Origin", "Destination", "Vehicle", "Driver", "Planned Dist", "Actual Dist", "Fuel Used", "Status", "Cost"],
              ...data.map((r) => [
                r.id, r.origin, r.destination, r.vehicleReg, r.driverName,
                r.plannedDistance, r.actualDistance, r.fuelUsed, r.status, r.operationalCost,
              ]),
            ])
          }
          className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-2)] hover:text-[var(--text)] transition"
        >
          Export CSV
        </button>
      }
    >
      <TableShell
        columns={[
          { key: "code", label: "TRIP CODE" },
          { key: "route", label: "ROUTE" },
          { key: "vehicle", label: "VEHICLE" },
          { key: "driver", label: "DRIVER" },
          { key: "planned", label: "PLANNED", className: "text-right" },
          { key: "actual", label: "ACTUAL", className: "text-right" },
          { key: "fuel", label: "FUEL", className: "text-right" },
          { key: "status", label: "STATUS" },
          { key: "cost", label: "COST", className: "text-right" },
        ]}
        data={data}
        emptyIcon={Route}
        emptyTitle="No trips yet"
        emptyDescription="Trip performance data will populate as routes are dispatched."
        renderRow={(row) => (
          <tr key={row.id} className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]">
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.id}</td>
            <td className="px-4 py-4 text-[var(--text-2)]">{row.origin} → {row.destination}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.vehicleReg}</td>
            <td className="px-4 py-4 text-[var(--text-2)]">{row.driverName}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
              {typeof row.plannedDistance === "number" ? `${row.plannedDistance.toLocaleString()} km` : row.plannedDistance}
            </td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
              {typeof row.actualDistance === "number" ? `${row.actualDistance.toLocaleString()} km` : row.actualDistance}
            </td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
              {typeof row.fuelUsed === "number" ? `${row.fuelUsed} L` : row.fuelUsed}
            </td>
            <td className="px-4 py-4"><StatusChip status={row.status} /></td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{formatCurrency(row.operationalCost)}</td>
          </tr>
        )}
      />
    </Card>
  );
}

export function MaintenanceSummaryTable({ data }) {
  return (
    <Card
      eyebrow="Service history"
      title="What has maintenance cost the fleet so far?"
      subtitle="All maintenance records with downtime and status"
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv("transitops-maintenance-summary.csv", [
              ["Vehicle", "Type", "Start Date", "End Date", "Downtime", "Cost", "Status"],
              ...data.map((r) => [
                r.vehicleReg, r.type, r.openedAt, r.closedAt || "—", r.downtime, r.cost, r.status,
              ]),
            ])
          }
          className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-2)] hover:text-[var(--text)] transition"
        >
          Export CSV
        </button>
      }
    >
      <TableShell
        columns={[
          { key: "vehicle", label: "VEHICLE" },
          { key: "type", label: "ISSUE TYPE" },
          { key: "start", label: "START DATE" },
          { key: "end", label: "END DATE" },
          { key: "downtime", label: "DOWNTIME" },
          { key: "cost", label: "COST", className: "text-right" },
          { key: "status", label: "STATUS" },
        ]}
        data={data}
        emptyIcon={ClipboardCheck}
        emptyTitle="No maintenance records"
        emptyDescription="Work order history will appear once maintenance is logged."
        renderRow={(row) => (
          <tr key={row.id} className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]">
            <td className="px-4 py-4">
              <div>
                <p className="font-mono text-[var(--text)]">{row.vehicleReg}</p>
                <p className="text-[12px] text-[var(--muted)]">{row.vehicleModel}</p>
              </div>
            </td>
            <td className="px-4 py-4 text-[var(--text)]">{row.type}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{formatDate(row.openedAt)}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.closedAt ? formatDate(row.closedAt) : "—"}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.downtime}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{formatCurrency(row.cost)}</td>
            <td className="px-4 py-4"><StatusChip status={row.status} /></td>
          </tr>
        )}
      />
    </Card>
  );
}

export function ExpenseSummaryTable({ data }) {
  return (
    <Card
      eyebrow="Cost ledger"
      title="What are the operational expenses broken down by type?"
      subtitle="All logged expenses with vehicle and trip links"
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv("transitops-expense-summary.csv", [
              ["Category", "Vehicle", "Trip", "Amount", "Date", "Notes"],
              ...data.map((r) => [
                r.category, r.vehicleReg, r.tripId, r.amount, r.date, r.notes,
              ]),
            ])
          }
          className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-2)] hover:text-[var(--text)] transition"
        >
          Export CSV
        </button>
      }
    >
      <TableShell
        columns={[
          { key: "category", label: "EXPENSE TYPE" },
          { key: "vehicle", label: "VEHICLE" },
          { key: "trip", label: "TRIP" },
          { key: "amount", label: "AMOUNT", className: "text-right" },
          { key: "date", label: "DATE" },
          { key: "notes", label: "NOTES" },
        ]}
        data={data}
        emptyIcon={DollarSign}
        emptyTitle="No expenses logged"
        emptyDescription="Expense entries will appear as they are recorded."
        renderRow={(row) => (
          <tr key={row.id} className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]">
            <td className="px-4 py-4 text-[var(--text)]">
              <span className="inline-block border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-2)]">
                {row.category}
              </span>
            </td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.vehicleReg}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{row.tripId}</td>
            <td className="px-4 py-4 text-right font-mono text-[var(--text)]">{formatCurrency(row.amount)}</td>
            <td className="px-4 py-4 font-mono text-[var(--text)]">{formatDate(row.date)}</td>
            <td className="px-4 py-4 text-[var(--text-2)] text-[12px]">{row.notes || "—"}</td>
          </tr>
        )}
      />
    </Card>
  );
}
