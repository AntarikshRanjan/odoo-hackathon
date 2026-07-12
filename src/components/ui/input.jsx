import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "control-shell focus-ring placeholder:text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "control-shell focus-ring min-h-[112px] py-3 placeholder:text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

