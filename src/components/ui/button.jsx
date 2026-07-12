import { cn } from "../../lib/utils";

const variants = {
  primary:
    "border border-[var(--text)] bg-[var(--invert-bg)] text-[var(--invert-text)] uppercase tracking-[0.08em] hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:bg-[var(--surface-2)] active:text-[var(--text)]",
  secondary:
    "border border-[var(--border-2)] bg-transparent text-[var(--text)] uppercase tracking-[0.08em] hover:border-[var(--text)] hover:bg-[var(--surface-2)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-2)] hover:text-[var(--text)]",
  danger:
    "border border-[var(--text)] bg-[var(--invert-bg)] text-[var(--invert-text)] uppercase tracking-[0.08em] hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:bg-[var(--surface-2)] active:text-[var(--text)]",
};

const sizes = {
  default: "h-10 px-4 text-[14px]",
  compact: "h-9 px-3 text-[13px]",
  icon: "h-9 w-9 p-0",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "default",
  ...props
}) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 font-medium transition duration-150 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
