import { cn } from "../../lib/utils";

const statusMarks = {
  Available: "○",
  Completed: "○",
  Closed: "○",
  "On Trip": "●",
  Dispatched: "●",
  "In Shop": "◐",
  Open: "◐",
  Suspended: "✕",
  Retired: "✕",
  Cancelled: "✕",
};

export function StatusMark({ status, pulsing = false, label }) {
  const text = (label || status || "").toUpperCase();
  const glyph = statusMarks[status] || "○";
  const shouldPulse = pulsing || glyph === "●";

  return (
    <span className="status-mark">
      <span className={cn("status-glyph", shouldPulse && "status-pulse")}>
        {glyph}
      </span>
      <span>{text}</span>
    </span>
  );
}

export const StatusChip = StatusMark;
