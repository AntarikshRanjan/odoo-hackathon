import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = "max-w-[560px]",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="app-overlay fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`fixed inset-y-0 right-0 z-50 w-full ${width}`}
            aria-modal="true"
            role="dialog"
          >
            <div className="drawer-panel flex h-full flex-col">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
                <div className="space-y-1">
                  <h2 className="text-[20px] font-bold text-[var(--text)]">{title}</h2>
                  {description && (
                    <p className="text-[12px] text-[var(--muted)]">{description}</p>
                  )}
                </div>
                <Button
                  aria-label="Close drawer"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 px-6 py-6">{children}</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
