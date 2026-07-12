import { MoreHorizontal } from "lucide-react";
import { Button } from "./button";

export function ActionMenu({ items = [] }) {
  return (
    <details
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <summary className="list-none">
        <Button
          aria-label="Open row actions"
          type="button"
          variant="ghost"
          size="icon"
        >
          <span className="font-mono text-[16px] leading-none">···</span>
        </Button>
      </summary>
      <div className="absolute right-0 z-20 mt-2 flex min-w-[168px] flex-col border border-[var(--border-2)] bg-[var(--surface-2)] p-1">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="focus-ring px-3 py-2 text-left text-[13px] text-[var(--text-2)] transition duration-150 hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}
