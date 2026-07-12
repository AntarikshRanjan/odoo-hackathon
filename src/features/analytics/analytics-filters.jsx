import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

export function AnalyticsFilters({ filters, onFilterChange, filterOptions }) {
  const { dateFrom, dateTo, vehicleType, vehicleStatus, driverStatus, tripStatus, region } = filters;
  const { types, statuses, dStatuses, tStatuses, regions } = filterOptions;

  function update(key, value) {
    onFilterChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Date From">
        <Input
          type="date"
          value={dateFrom || ""}
          onChange={(e) => update("dateFrom", e.target.value)}
        />
      </Field>
      <Field label="Date To">
        <Input
          type="date"
          value={dateTo || ""}
          onChange={(e) => update("dateTo", e.target.value)}
        />
      </Field>
      <Field label="Vehicle Type">
        <Select value={vehicleType || "all"} onChange={(e) => update("vehicleType", e.target.value)}>
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field label="Vehicle Status">
        <Select value={vehicleStatus || "all"} onChange={(e) => update("vehicleStatus", e.target.value)}>
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Driver Status">
        <Select value={driverStatus || "all"} onChange={(e) => update("driverStatus", e.target.value)}>
          <option value="all">All statuses</option>
          {dStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Trip Status">
        <Select value={tripStatus || "all"} onChange={(e) => update("tripStatus", e.target.value)}>
          <option value="all">All statuses</option>
          {tStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Region">
        <Select value={region || "all"} onChange={(e) => update("region", e.target.value)}>
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </Field>
      {(dateFrom || dateTo || vehicleType !== "all" || vehicleStatus !== "all" || driverStatus !== "all" || tripStatus !== "all" || region !== "all") && (
        <button
          type="button"
          onClick={() => onFilterChange({})}
          className="h-10 px-4 text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--text-2)] border border-[var(--border)] bg-[var(--surface)] transition duration-150 hover:text-[var(--text)] hover:border-[var(--border-2)]"
        >
          Clear Filters
        </button>
      )}
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
