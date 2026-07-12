import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { useTransitData } from "../../../app/transit-data";
import { ActionMenu } from "../../../components/ui/action-menu";
import { Card } from "../../../components/ui/card";
import { StatusChip } from "../../../components/ui/status-chip";
import { TableShell } from "../../../components/ui/table-shell";
import { useDemoLoading } from "../../../hooks/use-demo-loading";
import { formatNumber } from "../../../lib/utils";
import { CompleteTripModal } from "./CompleteTripModal";

export function ActiveTripsTable() {
  const loading = useDemoLoading("active-trips");
  const { trips, vehicles, drivers, cancelTrip, updateTripStatus, canManage } = useTransitData();
  const [completeTripObj, setCompleteTripObj] = useState(null);
  const canEditTrips = canManage("trips");

  const activeTrips = trips.filter((trip) => ["Dispatched", "Draft"].includes(trip.status));

  const tripRows = activeTrips.map((trip) => ({
    ...trip,
    vehicle: vehicles.find((item) => item.id === trip.vehicleId),
    driver: drivers.find((item) => item.id === trip.driverId),
  }));

  const activeCount = tripRows.filter((trip) => trip.status === "Dispatched").length;
  const pendingCount = tripRows.filter((trip) => trip.status === "Draft").length;
  const vehiclesOnTrip = vehicles.filter((vehicle) => vehicle.status === "On Trip").length;
  const driversOnDuty = drivers.filter((driver) => driver.status === "On Trip").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Active Trips</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Pending Trips</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Vehicles On Trip</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{vehiclesOnTrip}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">Drivers On Duty</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)]">{driversOnDuty}</p>
        </Card>
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
          emptyTitle="No active trips"
          emptyDescription="All vehicles are at the depot."
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
                <StatusChip status={trip.status} pulsing={trip.status === "Dispatched"} />
              </td>
              <td className="px-4 py-4 text-right">
                {canEditTrips ? (
                  <ActionMenu
                    items={[
                      ...(trip.status === "Draft"
                        ? [
                            {
                              label: "Dispatch trip",
                              onClick: async () => {
                                await updateTripStatus(trip.id, "Dispatched");
                              },
                            },
                          ]
                        : []),
                      ...(trip.status === "Dispatched"
                        ? [
                            {
                              label: "Complete trip",
                              onClick: () => setCompleteTripObj(trip),
                            },
                          ]
                        : []),
                      {
                        label: "Cancel trip",
                        onClick: async () => {
                          if (window.confirm("Are you sure you want to cancel this trip?")) {
                            await cancelTrip(trip.id);
                          }
                        },
                      },
                    ]}
                  />
                ) : (
                  <span className="text-[12px] font-medium text-[var(--muted)]">
                    Read Only
                  </span>
                )}
              </td>
            </tr>
          )}
        />
      </Card>

      {completeTripObj && (
        <CompleteTripModal
          trip={completeTripObj}
          isOpen={true}
          onClose={() => setCompleteTripObj(null)}
        />
      )}
    </div>
  );
}
