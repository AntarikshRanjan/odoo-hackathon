import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { ActionMenu } from "../../components/ui/action-menu";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Drawer } from "../../components/ui/drawer";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { formatDate, formatNumber } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

export function TripsPage() {
  const loading = useDemoLoading("trips");
  const { vehicles, drivers, trips, createTrip, updateTripStatus } = useTransitData();
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    cargoWeightKg: 0,
    vehicleId: "",
    driverId: "",
    eta: "",
    region: "West",
  });

  const dispatchVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Available" && !["In Shop", "Retired"].includes(vehicle.status),
  );
  const dispatchDrivers = drivers.filter((driver) => {
    const validLicense = new Date(driver.licenseExpiry) >= new Date();
    return driver.status === "Available" && validLicense && driver.status !== "Suspended";
  });

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);
  const capacityExceeded =
    selectedVehicle && Number(form.cargoWeightKg) > selectedVehicle.capacityKg;
  const capacityNear =
    selectedVehicle &&
    Number(form.cargoWeightKg) > 0 &&
    Number(form.cargoWeightKg) / selectedVehicle.capacityKg >= 0.8;

  const tripRows = trips.map((trip) => ({
    ...trip,
    vehicle: vehicles.find((item) => item.id === trip.vehicleId),
    driver: drivers.find((item) => item.id === trip.driverId),
  }));

  function handleSubmit(event) {
    event.preventDefault();
    const result = createTrip({
      ...form,
      cargoWeightKg: Number(form.cargoWeightKg),
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCreateOpen(false);
    setError("");
    setForm({
      origin: "",
      destination: "",
      cargoWeightKg: 0,
      vehicleId: "",
      driverId: "",
      eta: "",
      region: "West",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Dispatch board
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Trips</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            Create live trips with immediate capacity and availability validation.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      <Card>
        <TableShell
          columns={[
            { key: "trip", label: "Trip ID" },
            { key: "route", label: "Route" },
            { key: "cargo", label: "Cargo", className: "text-right" },
            { key: "vehicle", label: "Vehicle" },
            { key: "driver", label: "Driver" },
            { key: "status", label: "Status", className: "text-right" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          data={tripRows}
          loading={loading}
          emptyIcon={ClipboardList}
          emptyTitle="No trips yet"
          emptyDescription="Dispatch your first trip to light up the board."
          emptyAction={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Create Trip
            </Button>
          }
          renderRow={(trip) => (
            <tr
              key={trip.id}
              className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-4 font-mono text-[var(--text)]">{trip.id}</td>
              <td className="px-4 py-4 text-[var(--text-2)]">
                {trip.origin} → {trip.destination}
              </td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {formatNumber(trip.cargoWeightKg)} kg
              </td>
              <td className="px-4 py-4 font-mono text-[var(--text)]">
                {trip.vehicle?.regNumber}
              </td>
              <td className="px-4 py-4 text-[var(--text)]">{trip.driver?.name}</td>
              <td className="px-4 py-4 text-right">
                <StatusChip
                  status={trip.status}
                  pulsing={trip.status === "Dispatched"}
                />
              </td>
              <td className="px-4 py-4 text-right">
                <ActionMenu
                  items={
                    trip.status === "Dispatched"
                      ? [
                          {
                            label: "Complete trip",
                            onClick: () => updateTripStatus(trip.id, "Completed"),
                          },
                          {
                            label: "Cancel trip",
                            onClick: () => updateTripStatus(trip.id, "Cancelled"),
                          },
                        ]
                      : [{ label: "Trip closed", onClick: () => {} }]
                  }
                />
              </td>
            </tr>
          )}
        />
      </Card>

      <Drawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Trip"
        description="Only dispatch-ready vehicles and valid-license drivers appear in this pool."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-[20px] font-bold text-[var(--text)]">Dispatch Trip</h2>
            <p className="text-[12px] text-[var(--muted)]">
              Selections update live against vehicle status, license validity, and payload capacity.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Origin">
              <Input
                required
                value={form.origin}
                onChange={(event) =>
                  setForm((current) => ({ ...current, origin: event.target.value }))
                }
              />
            </Field>
            <Field label="Destination">
              <Input
                required
                value={form.destination}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Vehicle">
              <Select
                required
                value={form.vehicleId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, vehicleId: event.target.value }))
                }
              >
                <option value="">Select a vehicle</option>
                {dispatchVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.regNumber} · {vehicle.model}
                  </option>
                ))}
              </Select>
              {dispatchVehicles.length === 0 && (
                <p className="notice-line">
                  <span className="font-mono text-[var(--text)]">✕</span>
                  <span>No dispatch-ready vehicles available right now.</span>
                </p>
              )}
            </Field>
            <Field label="Driver">
              <Select
                required
                value={form.driverId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, driverId: event.target.value }))
                }
              >
                <option value="">Select a driver</option>
                {dispatchDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} · {driver.licenseNumber}
                  </option>
                ))}
              </Select>
              {dispatchDrivers.length === 0 && (
                <p className="notice-line">
                  <span className="font-mono text-[var(--text)]">✕</span>
                  <span>No valid-license drivers are available for dispatch.</span>
                </p>
              )}
            </Field>
            <Field label="Cargo Weight (kg)">
              <Input
                required
                type="number"
                min="0"
                value={form.cargoWeightKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cargoWeightKg: event.target.value,
                  }))
                }
              />
              <p
                className={`font-mono text-[12px] ${
                  capacityExceeded || capacityNear ? "text-[var(--text)]" : "text-[var(--muted)]"
                }`}
              >
                {capacityExceeded || capacityNear ? "▲ " : ""}{formatNumber(Number(form.cargoWeightKg) || 0)} /{" "}
                {formatNumber(selectedVehicle?.capacityKg || 0)} kg
              </p>
              {capacityExceeded && (
                <p className="notice-line">
                  <span className="font-mono text-[var(--text)]">✕</span>
                  <span>
                    Cargo exceeds vehicle capacity ({selectedVehicle.capacityKg} kg max).
                  </span>
                </p>
              )}
            </Field>
            <Field label="ETA">
              <Input
                required
                type="datetime-local"
                value={form.eta}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eta: event.target.value }))
                }
              />
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
          </div>
          {error && (
            <p className="notice-line">
              <span className="font-mono text-[var(--text)]">✕</span>
              <span>{error}</span>
            </p>
          )}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] pt-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={capacityExceeded || !form.vehicleId || !form.driverId}
            >
              Dispatch Trip
            </Button>
          </div>
        </form>
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
