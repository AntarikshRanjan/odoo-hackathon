import { AnimatePresence, motion } from "framer-motion";

export function Modal({ isOpen, onClose, title, description, children }) {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="modal-panel w-full max-w-[560px] p-6">
              <div className="mb-6 space-y-1">
                <h2 className="text-[20px] font-bold text-[var(--text)]">{title}</h2>
                {description && (
                  <p className="text-[12px] text-[var(--muted)]">{description}</p>
                )}
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
