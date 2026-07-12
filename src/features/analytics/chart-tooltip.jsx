export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-[var(--border-2)] bg-[var(--surface-2)] px-3 py-2 text-[12px]">
      {label && <p className="mb-1 text-[var(--muted)]">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-[var(--text)]">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}
