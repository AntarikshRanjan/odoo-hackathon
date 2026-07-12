import { useState } from "react";
import { Fuel, ReceiptText } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Card } from "../../components/ui/card";
import { TableShell } from "../../components/ui/table-shell";
import { Tabs } from "../../components/ui/tabs";
import { formatCurrency, formatDate, formatNumber } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

export function ExpensesPage() {
  const loading = useDemoLoading("expenses");
  const { fuelLogs, expenses, vehicles } = useTransitData();
  const [tab, setTab] = useState("fuel");

  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.amount, 0);
  const totalMaintenanceCost = expenses
    .filter((item) => item.category === "Maintenance")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalOperationalCost =
    totalFuelCost + expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
          Cost layers
        </p>
        <h1 className="text-[28px] font-bold text-[var(--text)]">Fuel & Expenses</h1>
        <p className="text-[14px] text-[var(--text-2)]">
          One page, two tabs, and a shared table shell for operational cost visibility.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Fuel Cost" value={formatCurrency(totalFuelCost)} />
        <SummaryCard
          label="Total Maintenance Cost"
          value={formatCurrency(totalMaintenanceCost)}
        />
        <SummaryCard
          label="Total Operational Cost"
          value={formatCurrency(totalOperationalCost)}
        />
      </div>

      <Card
        title="Cost Logs"
        subtitle="Shared shell for fuel logs and expenses"
        action={
          <Tabs
            value={tab}
            onValueChange={setTab}
            tabs={[
              { label: "Fuel Logs", value: "fuel" },
              { label: "Expenses", value: "expenses" },
            ]}
          />
        }
      >
        {tab === "fuel" ? (
          <TableShell
            columns={[
              { key: "id", label: "Log ID" },
              { key: "date", label: "Date" },
              { key: "vehicle", label: "Vehicle" },
              { key: "liters", label: "Liters", className: "text-right" },
              { key: "amount", label: "Amount", className: "text-right" },
            ]}
            data={fuelLogs}
            loading={loading}
            emptyIcon={Fuel}
            emptyTitle="No fuel logs yet"
            emptyDescription="Fuel purchases will land here once drivers start topping up."
            renderRow={(log) => {
              const vehicle = vehicles.find((item) => item.id === log.vehicleId);
              return (
                <tr
                  key={log.id}
                  className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-4 font-mono text-[var(--text)]">{log.id}</td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {formatDate(log.date)}
                  </td>
                  <td className="px-4 py-4 text-[var(--text)]">
                    {vehicle?.regNumber}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                    {formatNumber(log.liters)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                    {formatCurrency(log.amount)}
                  </td>
                </tr>
              );
            }}
          />
        ) : (
          <TableShell
            columns={[
              { key: "id", label: "Expense ID" },
              { key: "date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "vehicle", label: "Vehicle" },
              { key: "amount", label: "Amount", className: "text-right" },
            ]}
            data={expenses}
            loading={loading}
            emptyIcon={ReceiptText}
            emptyTitle="No expenses yet"
            emptyDescription="Operational expenses will appear here as they are logged."
            renderRow={(expense) => {
              const vehicle = vehicles.find((item) => item.id === expense.vehicleId);
              return (
                <tr
                  key={expense.id}
                  className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {expense.id}
                  </td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-4 text-[var(--text)]">{expense.category}</td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">
                    {vehicle?.regNumber}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card className="metric-card">
      <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mono-display mt-3">{value}</p>
    </Card>
  );
}

