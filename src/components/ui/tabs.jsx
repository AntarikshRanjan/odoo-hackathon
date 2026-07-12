import { cn } from "../../lib/utils";

export function Tabs({ value, onValueChange, tabs }) {
  return (
    <div className="inline-flex border border-[var(--border)] bg-[var(--surface-2)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onValueChange(tab.value)}
          className={cn(
            "focus-ring px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition duration-150",
            value === tab.value
              ? "border border-[var(--text)] bg-[var(--invert-bg)] text-[var(--invert-text)]"
              : "text-[var(--text-2)] hover:text-[var(--text)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
