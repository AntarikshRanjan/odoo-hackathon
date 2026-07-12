import { AnimatePresence, motion } from "framer-motion";
import { useTransitData } from "../../app/transit-data";
import { Button } from "./button";

export function ToastViewport() {
  const { toasts, dismissToast } = useTransitData();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-[420px] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-auto border border-[var(--border-2)] bg-[var(--surface-2)] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-mono text-[12px] text-[var(--text)]">
                  {toast.variant === "danger" ? "✕" : "○"}
                </p>
                <p className="font-medium text-[var(--text)]">{toast.title}</p>
                {toast.description && (
                  <p className="text-[13px] text-[var(--text-2)]">
                    {toast.description}
                  </p>
                )}
              </div>
              <Button
                aria-label="Dismiss notification"
                variant="ghost"
                size="icon"
                onClick={() => dismissToast(toast.id)}
              >
                <span className="font-mono text-[14px]">✕</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
