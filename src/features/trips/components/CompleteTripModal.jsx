import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Modal } from "../../../components/ui/modal";
import { useTransitData } from "../../../app/transit-data";

export function CompleteTripModal({ trip, isOpen, onClose }) {
  const { completeTrip } = useTransitData();
  const [form, setForm] = useState({
    finalOdometer: "",
    actualDistance: "",
    fuelUsed: "",
    arrivalTime: "",
    notes: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await completeTrip(trip.id, form);
    onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Trip" description="Enter final metrics to complete this trip. This will automatically release the vehicle and driver.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Final Odometer (km)">
            <Input
              required
              type="number"
              value={form.finalOdometer}
              onChange={(e) => setForm({ ...form, finalOdometer: e.target.value })}
            />
          </Field>
          <Field label="Actual Distance (km)">
            <Input
              required
              type="number"
              value={form.actualDistance}
              onChange={(e) => setForm({ ...form, actualDistance: e.target.value })}
            />
          </Field>
          <Field label="Fuel Used (Liters)">
            <Input
              required
              type="number"
              step="0.01"
              value={form.fuelUsed}
              onChange={(e) => setForm({ ...form, fuelUsed: e.target.value })}
            />
          </Field>
          <Field label="Arrival Time">
            <Input
              required
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Notes">
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any incident reports or general notes..."
          />
        </Field>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Complete Trip</Button>
        </div>
      </form>
    </Modal>
  );
}
