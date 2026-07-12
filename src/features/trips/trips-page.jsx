import { useState } from "react";
import { Tabs } from "../../components/ui/tabs";
import { NewTripForm } from "./components/NewTripForm";
import { ActiveTripsTable } from "./components/ActiveTripsTable";
import { TripHistory } from "./components/TripHistory";

export function TripsPage() {
  const [activeTab, setActiveTab] = useState("active");

  const tabs = [
    { value: "new", label: "New Trip" },
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
            Create live trips, manage active dispatches, and review fleet history.
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />
      </div>

      <div className="pt-2">
        {activeTab === "new" && (
          <NewTripForm onSuccess={() => setActiveTab("active")} />
        )}
        {activeTab === "active" && <ActiveTripsTable />}
        {activeTab === "history" && <TripHistory />}
      </div>
    </div>
  );
}
