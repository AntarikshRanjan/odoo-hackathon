export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="font-mono text-[28px] text-[var(--muted)]">○</div>
      <div className="space-y-1">
        <p className="font-medium uppercase tracking-[0.04em] text-[var(--text)]">
          {title}
        </p>
        <p className="max-w-[360px] text-[13px] text-[var(--muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}
