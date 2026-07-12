export function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-3 text-[13px] text-[var(--text-2)]">
      <input
        type="checkbox"
        className="focus-ring h-4 w-4 border border-[var(--border)] bg-[var(--surface)] accent-[var(--text)]"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
