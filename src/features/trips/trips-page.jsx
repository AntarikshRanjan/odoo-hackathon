import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Card } from "../../components/ui/card";
import { StatusChip } from "../../components/ui/status-chip";
import { Tabs } from "../../components/ui/tabs";
import { TRIP_LIFECYCLE, isLiveTripStatus } from "../../lib/rbac";
import { ActiveTripsTable } from "./components/ActiveTripsTable";
import { NewTripForm } from "./components/NewTripForm";
import { TripHistory } from "./components/TripHistory";

export function TripsPage() {
  const { getAccessLevel } = useTransitData();
  const canManage = getAccessLevel("trips") === "full";
  const [activeTab, setActiveTab] = useState(canManage ? "new" : "active");

  const tabs = [
    ...(canManage ? [{ value: "new", label: "New Trip" }] : []),
    { value: "active", label: "Active Trips" },
    { value: "history", label: "Trip History" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Dispatch board
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Trips</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            {canManage
              ? "Plan draft trips, dispatch live movements, and complete them without leaving the board."
              : "Track live dispatches and review fleet trip history for your current role."}
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />
      </div>

      {!canManage && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-500" />
            <div className="space-y-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
                Read-only trip access
              </p>
              <p className="text-[13px] text-[var(--text-2)]">
                This role can monitor trip progress and history, but only the dispatcher can create,
                dispatch, cancel, or complete trips.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Trip Lifecycle" subtitle="Aligned to the workflow in the project brief">
        <div className="grid gap-3 md:grid-cols-4">
          {TRIP_LIFECYCLE.map((status, index) => (
            <div key={status} className="border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                Step {index + 1}
              </p>
              <div className="mt-3">
                <StatusChip status={status} pulsing={isLiveTripStatus(status)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="pt-2">
        {activeTab === "new" && <NewTripForm onSuccess={() => setActiveTab("active")} />}
        {activeTab === "active" && <ActiveTripsTable />}
        {activeTab === "history" && <TripHistory />}
      </div>
    </div>
  );
}
