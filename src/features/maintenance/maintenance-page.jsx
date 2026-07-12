import { useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { ActionMenu } from "../../components/ui/action-menu";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input, Textarea } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";
import { Select } from "../../components/ui/select";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { formatCurrency, formatDate } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

export function MaintenancePage() {
  const loading = useDemoLoading("maintenance");
  const { maintenance, vehicles, logMaintenance, closeMaintenance } = useTransitData();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vehicleId: "",
    type: "",
    cost: "",
    notes: "",
  });

  const availableVehicles = vehicles.filter((vehicle) => vehicle.status !== "Retired");

  function handleSubmit(event) {
    event.preventDefault();
    const result = logMaintenance({
      vehicleId: form.vehicleId,
      type: form.type,
      cost: Number(form.cost),
      notes: form.notes,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOpen(false);
    setError("");
    setForm({ vehicleId: "", type: "", cost: "", notes: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Service queue
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Maintenance</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Open, close, and track work orders with immediate fleet status updates.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Maintenance
        </Button>
      </div>

      <Card>
        <TableShell
          columns={[
            { key: "vehicle", label: "Vehicle" },
            { key: "type", label: "Maintenance Type" },
            { key: "opened", label: "Opened At" },
            { key: "cost", label: "Cost", className: "text-right" },
            { key: "status", label: "Status", className: "text-right" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          data={maintenance}
          loading={loading}
          emptyIcon={ClipboardCheck}
          emptyTitle="No maintenance records"
          emptyDescription="Log the first service event to populate the queue."
          emptyAction={
            <Button type="button" onClick={() => setOpen(true)}>
              Log Maintenance
            </Button>
          }
          renderRow={(record) => {
            const vehicle = vehicles.find((item) => item.id === record.vehicleId);
            return (
              <tr
                key={record.id}
                className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-mono text-[var(--text)]">{vehicle?.regNumber}</p>
                    <p className="text-[12px] text-[var(--muted)]">{vehicle?.model}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-[var(--text)]">{record.type}</td>
                <td className="px-4 py-4 font-mono text-[var(--text)]">
                  {formatDate(record.openedAt)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                  {formatCurrency(record.cost)}
                </td>
                <td className="px-4 py-4 text-right">
                  <StatusChip status={record.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <ActionMenu
                    items={
                      record.status === "Open"
                        ? [
                            {
                              label: "Close maintenance",
                              onClick: () => closeMaintenance(record.id),
                            },
                          ]
                        : [{ label: "Record closed", onClick: () => {} }]
                    }
                  />
                </td>
              </tr>
            );
          }}
        />
      </Card>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Log Maintenance"
        description="Creating a record immediately moves the selected vehicle to In Shop."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Vehicle">
            <Select
              required
              value={form.vehicleId}
              onChange={(event) =>
                setForm((current) => ({ ...current, vehicleId: event.target.value }))
              }
            >
              <option value="">Select a vehicle</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.regNumber} · {vehicle.model}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Maintenance Type">
            <Input
              required
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
            />
          </Field>
          <Field label="Cost">
            <Input
              required
              type="number"
              min="0"
              value={form.cost}
              onChange={(event) =>
                setForm((current) => ({ ...current, cost: event.target.value }))
              }
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </Field>
          {error && (
            <p className="notice-line">
              <span className="font-mono text-[var(--text)]">✕</span>
              <span>{error}</span>
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </Modal>
    </div>
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
