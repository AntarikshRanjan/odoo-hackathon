import { useState } from "react";
import { Fuel, ReceiptText, Plus, ShieldAlert } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Card } from "../../components/ui/card";
import { TableShell } from "../../components/ui/table-shell";
import { Tabs } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";
import { Select } from "../../components/ui/select";
import { formatCurrency, formatDate, formatNumber } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

export function ExpensesPage() {
  const loading = useDemoLoading("expenses");
  const { fuelLogs, expenses, vehicles, addFuelLog, addExpense, session, rbacMatrix } = useTransitData();
  const [tab, setTab] = useState("fuel");
  
  // Modals state
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  
  // Forms state
  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    liters: "",
    amount: "",
    odometer: "",
    date: new Date().toISOString().split("T")[0],
  });
  
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const activeRole = session?.role || "Fleet Manager";
  const permission = rbacMatrix[activeRole]?.fuelExpenses || "none";

  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.amount, 0);
  const totalMaintenanceCost = expenses
    .filter((item) => item.category === "Maintenance")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalOperationalCost =
    totalFuelCost + expenses.reduce((sum, item) => sum + item.amount, 0);

  const activeVehicles = vehicles.filter((v) => v.status !== "Retired");

  function handleFuelSubmit(event) {
    event.preventDefault();
    addFuelLog({
      vehicleId: fuelForm.vehicleId,
      liters: Number(fuelForm.liters),
      amount: Number(fuelForm.amount),
      odometer: Number(fuelForm.odometer),
      date: fuelForm.date,
    });
    setFuelOpen(false);
    setFuelForm({
      vehicleId: "",
      liters: "",
      amount: "",
      odometer: "",
      date: new Date().toISOString().split("T")[0],
    });
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    addExpense({
      vehicleId: expenseForm.vehicleId,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
    });
    setExpenseOpen(false);
    setExpenseForm({
      vehicleId: "",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  }

  if (permission === "none") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border)] bg-[var(--surface)] rounded space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Access Restricted</h2>
        <p className="text-[14px] text-[var(--text-2)] max-w-md">
          Your active simulated role <strong>{activeRole}</strong> does not have permission to view or manage Fuel & Expenses. 
          You can adjust these permissions in the <strong>Settings</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Cost layers
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Fuel & Expenses</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Log fuel purchases, tolls, and parking costs with real-time operational calculations.
          </p>
        </div>
        {permission === "full" && (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setFuelOpen(true)}>
              <Plus className="h-4 w-4" />
              Log Fuel
            </Button>
            <Button type="button" onClick={() => setExpenseOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        )}
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
                    {vehicle ? `${vehicle.regNumber} (${vehicle.model})` : log.vehicleId}
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
                    {vehicle ? `${vehicle.regNumber} (${vehicle.model})` : expense.vehicleId}
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

      {/* Log Fuel Modal */}
      <Modal
        isOpen={fuelOpen}
        onClose={() => setFuelOpen(false)}
        title="Log Fuel Purchase"
        description="Logging fuel updates operational costs and vehicle odometer."
      >
        <form className="space-y-4" onSubmit={handleFuelSubmit}>
          <Field label="Vehicle">
            <Select
              required
              value={fuelForm.vehicleId}
              onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
            >
              <option value="">Select a vehicle</option>
              {activeVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.regNumber} · {vehicle.model}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Liters">
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={fuelForm.liters}
                onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
              />
            </Field>
            <Field label="Cost Amount">
              <Input
                required
                type="number"
                min="0"
                value={fuelForm.amount}
                onChange={(e) => setFuelForm({ ...fuelForm, amount: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Odometer Reading">
              <Input
                required
                type="number"
                min="0"
                value={fuelForm.odometer}
                onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <Input
                required
                type="date"
                value={fuelForm.date}
                onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setFuelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Log</Button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Add Other Expense"
        description="Record parking fees, highway tolls, or insurance layers."
      >
        <form className="space-y-4" onSubmit={handleExpenseSubmit}>
          <Field label="Vehicle">
            <Select
              required
              value={expenseForm.vehicleId}
              onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
            >
              <option value="">Select a vehicle</option>
              {activeVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.regNumber} · {vehicle.model}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select
              required
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              <option value="">Select a category</option>
              <option value="Toll">Toll Fee</option>
              <option value="Parking">Parking Fee</option>
              <option value="Insurance">Insurance</option>
              <option value="Permit">Permit Fee</option>
              <option value="Other">Other Miscellaneous</option>
            </Select>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Amount">
              <Input
                required
                type="number"
                min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <Input
                required
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setExpenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>
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

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
