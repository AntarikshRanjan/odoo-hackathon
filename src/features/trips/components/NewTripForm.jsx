import { useState } from "react";
import { useTransitData } from "../../../app/transit-data";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { ValidationSummary } from "./ValidationSummary";

export function NewTripForm({ onSuccess }) {
  const {
    createTrip,
    getAvailableVehicles,
    getAvailableDrivers,
    validateTrip,
    dispatchTrip,
    canManage,
  } = useTransitData();

  const dispatchVehicles = getAvailableVehicles();
  const dispatchDrivers = getAvailableDrivers();
  const canEditTrips = canManage("trips");

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    cargoWeightKg: 0,
    plannedDistance: 0,
    vehicleId: "",
    driverId: "",
    departureDate: "",
    eta: "",
    priority: "Normal",
    notes: "",
    region: "West",
  });

  const validation = validateTrip(form);
  const { capacityExceeded, isValid } = validation;

  function resetForm() {
    setForm({
      origin: "",
      destination: "",
      cargoWeightKg: 0,
      plannedDistance: 0,
      vehicleId: "",
      driverId: "",
      departureDate: "",
      eta: "",
      priority: "Normal",
      notes: "",
      region: "West",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canEditTrips || !isValid) return;

    const result = await dispatchTrip({
      ...form,
      cargoWeightKg: Number(form.cargoWeightKg),
      plannedDistance: Number(form.plannedDistance),
    });

    if (!result?.ok) {
      setError(result?.message || "Failed to dispatch trip.");
      return;
    }

    setError("");
    resetForm();
    onSuccess?.();
  }

  async function handleSaveDraft() {
    if (!canEditTrips) return;

    const result = await createTrip({
      ...form,
      cargoWeightKg: Number(form.cargoWeightKg),
      plannedDistance: Number(form.plannedDistance),
      status: "Draft",
    });

    if (!result?.ok) {
      setError(result?.message || "Failed to save draft trip.");
      return;
    }

    setError("");
    resetForm();
    onSuccess?.();
  }

  if (!canEditTrips) {
    return (
      <Card className="p-6">
        <p className="text-[13px] text-[var(--text-2)]">
          Your current role can review trips, but only the dispatcher can create or dispatch them.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Source">
              <Input
                required
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
              />
            </Field>
            <Field label="Destination">
              <Input
                required
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
            </Field>
            <Field label="Vehicle Selector">
              <Select
                required
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              >
                <option value="">Select an available vehicle</option>
                {dispatchVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.regNumber} · {vehicle.model}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Driver Selector">
              <Select
                required
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
              >
                <option value="">Select an available driver</option>
                {dispatchDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} · {driver.licenseNumber}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cargo Weight (kg)">
              <Input
                required
                type="number"
                min="0"
                value={form.cargoWeightKg}
                onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })}
                className={capacityExceeded ? "border-red-500" : ""}
              />
            </Field>
            <Field label="Planned Distance (km)">
              <Input
                required
                type="number"
                min="0"
                value={form.plannedDistance}
                onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })}
              />
            </Field>
            <Field label="Planned Start Date">
              <Input
                required
                type="datetime-local"
                value={form.departureDate}
                onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
              />
            </Field>
            <Field label="Estimated Arrival">
              <Input
                required
                type="datetime-local"
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
              />
            </Field>
            <Field label="Priority">
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </Select>
            </Field>
            <Field label="Region">
              <Select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                <option>West</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
              </Select>
            </Field>
          </div>

          <Field label="Notes">
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special instructions..."
            />
          </Field>

          {error && <div className="text-red-500 text-[13px]">{error}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button type="submit" disabled={!isValid}>
              Dispatch Trip
            </Button>
          </div>
        </form>
      </Card>

      <div className="h-full">
        <ValidationSummary validation={validation} cargoWeightKg={form.cargoWeightKg} />
      </div>
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
