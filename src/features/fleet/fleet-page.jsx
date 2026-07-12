import { useDeferredValue, useState } from "react";
import { Plus, Truck, Wrench } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { ActionMenu } from "../../components/ui/action-menu";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Drawer } from "../../components/ui/drawer";
import { Input, Textarea } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { formatDate, formatNumber } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

const pageSize = 5;

export function FleetPage() {
  const loading = useDemoLoading("fleet");
  const { vehicles, maintenance, addVehicle, pushToast } = useTransitData();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [form, setForm] = useState({
    regNumber: "",
    model: "",
    type: "Light Truck",
    capacityKg: 1000,
    odometerKm: 0,
    region: "West",
    fuelType: "Diesel",
    notes: "",
  });

  const types = ["All", ...new Set(vehicles.map((item) => item.type))];

  const filtered = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.regNumber.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(deferredSearch.toLowerCase());
    const matchesType = typeFilter === "All" || vehicle.type === typeFilter;
    const matchesStatus =
      statusFilter === "All" || vehicle.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSubmit(event) {
    event.preventDefault();
    addVehicle({
      regNumber: form.regNumber,
      model: form.model,
      type: form.type,
      capacityKg: Number(form.capacityKg),
      odometerKm: Number(form.odometerKm),
      region: form.region,
      fuelType: form.fuelType,
      notes: form.notes,
    });
    setAddOpen(false);
    setForm({
      regNumber: "",
      model: "",
      type: "Light Truck",
      capacityKg: 1000,
      odometerKm: 0,
      region: "West",
      fuelType: "Diesel",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Fleet registry
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Vehicles</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Searchable dispatch inventory with quick detail and service history.
          </p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <div className="mb-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search reg number or model"
          />
          <Select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setPage(1);
            }}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </Select>
        </div>

        <TableShell
          columns={[
            { key: "reg", label: "Reg. Number" },
            { key: "model", label: "Name / Model" },
            { key: "type", label: "Type" },
            { key: "capacity", label: "Capacity", className: "text-right" },
            { key: "odometer", label: "Odometer", className: "text-right" },
            { key: "status", label: "Status", className: "text-right" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          data={paginated}
          loading={loading}
          emptyIcon={Truck}
          emptyTitle="No vehicles yet"
          emptyDescription="Add your first one to start dispatching."
          emptyAction={
            <Button type="button" onClick={() => setAddOpen(true)}>
              Add Vehicle
            </Button>
          }
          renderRow={(vehicle) => (
            <tr
              key={vehicle.id}
              onClick={() => setDetailVehicle(vehicle)}
              className="h-14 cursor-pointer border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-4 font-mono text-[var(--text)]">
                {vehicle.regNumber}
              </td>
              <td className="px-4 py-4 text-[var(--text)]">{vehicle.model}</td>
              <td className="px-4 py-4 text-[var(--text-2)]">{vehicle.type}</td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {formatNumber(vehicle.capacityKg)} kg
              </td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {formatNumber(vehicle.odometerKm)} km
              </td>
              <td className="px-4 py-4 text-right">
                <StatusChip
                  status={vehicle.status}
                  pulsing={vehicle.status === "On Trip"}
                />
              </td>
              <td className="px-4 py-4 text-right">
                <ActionMenu
                  items={[
                    {
                      label: "View details",
                      onClick: () => setDetailVehicle(vehicle),
                    },
                    {
                      label: "Flag for review",
                      onClick: () =>
                        pushToast({
                          title: "Vehicle flagged.",
                          description: `${vehicle.regNumber} added to the review queue.`,
                        }),
                    },
                  ]}
                />
              </td>
            </tr>
          )}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] text-[var(--muted)]">
            Showing <span className="font-mono">{paginated.length}</span> of{" "}
            <span className="font-mono">{filtered.length}</span> vehicles
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="font-mono text-[12px] text-[var(--text-2)]">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="compact"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Drawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Vehicle"
        description="One shared drawer for the dispatch-ready vehicle form."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Registration Number">
              <Input
                required
                value={form.regNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, regNumber: event.target.value }))
                }
              />
            </Field>
            <Field label="Name / Model">
              <Input
                required
                value={form.model}
                onChange={(event) =>
                  setForm((current) => ({ ...current, model: event.target.value }))
                }
              />
            </Field>
            <Field label="Type">
              <Select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
              >
                <option>Mini Truck</option>
                <option>Light Truck</option>
                <option>Heavy Truck</option>
                <option>Van</option>
                <option>Three-Wheeler</option>
              </Select>
            </Field>
            <Field label="Region">
              <Select
                value={form.region}
                onChange={(event) =>
                  setForm((current) => ({ ...current, region: event.target.value }))
                }
              >
                <option>West</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
              </Select>
            </Field>
            <Field label="Capacity (kg)">
              <Input
                type="number"
                min="0"
                value={form.capacityKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacityKg: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Odometer (km)">
              <Input
                type="number"
                min="0"
                value={form.odometerKm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    odometerKm: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Fuel Type">
              <Select
                value={form.fuelType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fuelType: event.target.value }))
                }
              >
                <option>Diesel</option>
                <option>Electric</option>
                <option>CNG</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </Field>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] pt-4">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Vehicle</Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        isOpen={Boolean(detailVehicle)}
        onClose={() => setDetailVehicle(null)}
        title={detailVehicle?.regNumber}
        description={detailVehicle?.model}
      >
        {detailVehicle && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Type" value={detailVehicle.type} />
              <InfoCard
                label="Capacity"
                value={`${formatNumber(detailVehicle.capacityKg)} kg`}
              />
              <InfoCard
                label="Odometer"
                value={`${formatNumber(detailVehicle.odometerKm)} km`}
              />
              <InfoCard label="Region" value={detailVehicle.region} />
              <InfoCard label="Fuel Type" value={detailVehicle.fuelType} />
              <InfoCard
                label="Last Service"
                value={formatDate(detailVehicle.lastService)}
              />
            </div>
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[var(--text)]">
                Status
              </h3>
              <StatusChip
                status={detailVehicle.status}
                pulsing={detailVehicle.status === "On Trip"}
              />
            </div>
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[var(--text)]">
                Maintenance History
              </h3>
              <div className="space-y-3">
                {maintenance
                  .filter((record) => record.vehicleId === detailVehicle.id)
                  .map((record) => (
                    <div
                      key={record.id}
                      className="border border-[var(--border)] bg-[var(--surface-2)] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-[var(--text)]">{record.type}</p>
                        <StatusChip status={record.status} />
                      </div>
                      <p className="font-mono text-[12px] text-[var(--muted)]">
                        {formatDate(record.openedAt)}
                      </p>
                      <p className="mt-2 text-[13px] text-[var(--text-2)]">
                        {record.notes}
                      </p>
                    </div>
                  ))}
                {maintenance.filter((record) => record.vehicleId === detailVehicle.id)
                  .length === 0 && (
                  <div className="border border-dashed border-[var(--border)] p-4 text-[13px] text-[var(--muted)]">
                    No maintenance history yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
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

function InfoCard({ label, value }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-[14px] text-[var(--text)]">{value}</p>
    </div>
  );
}
