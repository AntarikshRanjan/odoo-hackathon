import { ClipboardList } from "lucide-react";
import { useTransitData } from "../../../app/transit-data";
import { Card } from "../../../components/ui/card";
import { StatusChip } from "../../../components/ui/status-chip";
import { TableShell } from "../../../components/ui/table-shell";
import { formatCurrency } from "../../../lib/utils";
import { useDemoLoading } from "../../../hooks/use-demo-loading";

export function TripHistory() {
  const loading = useDemoLoading("trip-history");
  const { trips, vehicles, drivers, calculateOperationalCost, calculateFuelEfficiency } = useTransitData();

  const historyTrips = trips.filter((t) => ["Completed", "Cancelled"].includes(t.status));

  const tripRows = historyTrips.map((trip) => ({
    ...trip,
    vehicle: vehicles.find((item) => item.id === trip.vehicleId),
    driver: drivers.find((item) => item.id === trip.driverId),
  }));

  const today = new Date().toISOString().split("T")[0];
  const completedToday = tripRows.filter(
    (trip) => trip.status === "Completed" && trip.departureDate?.startsWith(today),
  ).length;
  const completedTotal = tripRows.filter((trip) => trip.status === "Completed").length;
  const cancelledTotal = tripRows.filter((trip) => trip.status === "Cancelled").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Completed Today</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{completedToday}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Completed Total</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{completedTotal}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Fleet Fuel Efficiency</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{calculateFuelEfficiency()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Cancelled Trips</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{cancelledTotal}</p>
        </Card>
      </div>

      <Card>
        <TableShell
          columns={[
            { key: "trip", label: "Trip ID" },
            { key: "route", label: "Route" },
            { key: "vehicle", label: "Vehicle" },
            { key: "driver", label: "Driver" },
            { key: "cost", label: "Op. Cost", className: "text-right" },
            { key: "status", label: "Status", className: "text-right" },
          ]}
          data={tripRows}
          loading={loading}
          emptyIcon={ClipboardList}
          emptyTitle="No trip history"
          emptyDescription="Completed and cancelled trips will appear here."
          renderRow={(trip) => (
            <tr
              key={trip.id}
              className="h-14 border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
            >
              <td className="px-4 py-4 font-mono text-[var(--text)]">{trip.id}</td>
              <td className="px-4 py-4 text-[var(--text-2)]">
                {trip.origin} → {trip.destination}
              </td>
              <td className="px-4 py-4 font-mono text-[var(--text)]">
                {trip.vehicle?.regNumber}
              </td>
              <td className="px-4 py-4 text-[var(--text)]">{trip.driver?.name}</td>
              <td className="px-4 py-4 text-right font-mono text-[var(--text)]">
                {formatCurrency(calculateOperationalCost(trip.id))}
              </td>
              <td className="px-4 py-4 text-right">
                <StatusChip status={trip.status} />
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}
