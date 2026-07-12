import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { ValidationSummary } from "./ValidationSummary";
import { useTransitData } from "../../../app/transit-data";

export function NewTripForm({ onSuccess }) {
  const {
    getAvailableVehicles,
    getAvailableDrivers,
    validateTrip,
    dispatchTrip,
  } = useTransitData();

  const dispatchVehicles = getAvailableVehicles();
  const dispatchDrivers = getAvailableDrivers();

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

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid) return;

    const payload = {
      ...form,
      cargoWeightKg: Number(form.cargoWeightKg),
    };
    
    try {
      await dispatchTrip(payload);
      setForm({
        origin: "", destination: "", cargoWeightKg: 0, plannedDistance: 0,
        vehicleId: "", driverId: "", departureDate: "", eta: "", priority: "Normal",
        notes: "", region: "West",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to dispatch trip.");
    }
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
                {dispatchVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.regNumber} · {v.model}</option>
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
                {dispatchDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · {d.licenseNumber}</option>
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
            <Button type="button" variant="ghost">Save Draft</Button>
            <Button type="submit" disabled={!isValid}>Dispatch Trip</Button>
          </div>
        </form>
      </Card>

      <div className="h-full">
        <ValidationSummary validation={validation} cargoWeightKg={form.cargoWeightKg} />
      </div>
    </div>
  );
}
