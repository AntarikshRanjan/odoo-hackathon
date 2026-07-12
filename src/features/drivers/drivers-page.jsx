import { useDeferredValue, useState } from "react";
import { Plus, UserSquare2 } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { ActionMenu } from "../../components/ui/action-menu";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Drawer } from "../../components/ui/drawer";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { StatusChip } from "../../components/ui/status-chip";
import { TableShell } from "../../components/ui/table-shell";
import { formatDate, formatRelativeDays } from "../../lib/utils";
import { useDemoLoading } from "../../hooks/use-demo-loading";

const pageSize = 6;

export function DriversPage() {
  const loading = useDemoLoading("drivers");
  const { drivers, addDriver, pushToast } = useTransitData();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [detailDriver, setDetailDriver] = useState(null);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    safetyScore: 90,
    region: "West",
  });

  const filtered = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(deferredSearch.toLowerCase());
    const matchesStatus = statusFilter === "All" || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSubmit(event) {
    event.preventDefault();
    addDriver({
      name: form.name,
      licenseNumber: form.licenseNumber,
      licenseExpiry: form.licenseExpiry,
      safetyScore: Number(form.safetyScore),
      region: form.region,
    });
    setAddOpen(false);
    setForm({
      name: "",
      licenseNumber: "",
      licenseExpiry: "",
      safetyScore: 90,
      region: "West",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Driver board
          </p>
          <h1 className="text-[28px] font-bold text-[var(--text)]">Drivers</h1>
          <p className="text-[14px] text-[var(--text-2)]">
            License visibility, safety performance, and dispatch eligibility in one table.
          </p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <Card>
        <div className="mb-5 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search driver or license number"
          />
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
            <option value="Suspended">Suspended</option>
          </Select>
        </div>

        <TableShell
          columns={[
            { key: "name", label: "Name" },
            { key: "license", label: "License No." },
            { key: "expiry", label: "License Expiry" },
            { key: "score", label: "Safety Score", className: "text-right" },
            { key: "status", label: "Status", className: "text-right" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          data={paginated}
          loading={loading}
          emptyIcon={UserSquare2}
          emptyTitle="No drivers yet"
          emptyDescription="Add your first driver to open the dispatch pool."
          emptyAction={
            <Button type="button" onClick={() => setAddOpen(true)}>
              Add Driver
            </Button>
          }
          renderRow={(driver) => {
            const daysLeft =
              (new Date(driver.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24);
            const warning = daysLeft < 30;
            return (
              <tr
                key={driver.id}
                onClick={() => setDetailDriver(driver)}
                className="h-14 cursor-pointer border-b border-[var(--border)] transition duration-200 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-4 text-[var(--text)]">{driver.name}</td>
                <td className="px-4 py-4 font-mono text-[var(--text)]">
                  {driver.licenseNumber}
                </td>
                <td className="px-4 py-4 font-mono text-[var(--text)]">
                  {warning ? `▲ ${formatDate(driver.licenseExpiry)}` : formatDate(driver.licenseExpiry)}
                </td>
                <td className="px-4 py-4">
                  <SafetyBar score={driver.safetyScore} />
                </td>
                <td className="px-4 py-4 text-right">
                  <StatusChip
                    status={driver.status}
                    pulsing={driver.status === "On Trip"}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  <ActionMenu
                    items={[
                      {
                        label: "View details",
                        onClick: () => setDetailDriver(driver),
                      },
                      {
                        label: "Flag follow-up",
                        onClick: () =>
                          pushToast({
                            title: "Driver flagged.",
                            description: `${driver.name} added to the compliance queue.`,
                          }),
                      },
                    ]}
                  />
                </td>
              </tr>
            );
          }}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] text-[var(--muted)]">
            Showing <span className="font-mono">{paginated.length}</span> of{" "}
            <span className="font-mono">{filtered.length}</span> drivers
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
        title="Add Driver"
        description="Add a driver to the pool with license validity and safety metadata."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Driver Name">
              <Input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field label="License Number">
              <Input
                required
                value={form.licenseNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    licenseNumber: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="License Expiry">
              <Input
                required
                type="date"
                value={form.licenseExpiry}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    licenseExpiry: event.target.value,
                  }))
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
            <Field label="Safety Score">
              <Input
                type="number"
                min="0"
                max="100"
                value={form.safetyScore}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    safetyScore: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] pt-4">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Driver</Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        isOpen={Boolean(detailDriver)}
        onClose={() => setDetailDriver(null)}
        title={detailDriver?.name}
        description={detailDriver?.licenseNumber}
      >
        {detailDriver && (
          <div className="space-y-4">
            <InfoCard label="License Number" value={detailDriver.licenseNumber} />
            <InfoCard
              label="License Expiry"
              value={`${formatDate(detailDriver.licenseExpiry)} · ${formatRelativeDays(detailDriver.licenseExpiry)}`}
            />
            <InfoCard label="Region" value={detailDriver.region} />
            <InfoCard label="Safety Score" value={`${detailDriver.safetyScore} / 100`} />
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[var(--text)]">
                Dispatch Status
              </h3>
              <StatusChip
                status={detailDriver.status}
                pulsing={detailDriver.status === "On Trip"}
              />
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

function SafetyBar({ score }) {
  return (
    <div className="ml-auto flex max-w-[160px] items-center justify-end gap-3">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className={`h-2 flex-1 ${
              index < Math.round(score / 10)
                ? "bg-[var(--text)]"
                : "bg-[var(--surface-2)]"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-[var(--text)]">{score}</span>
    </div>
  );
}
