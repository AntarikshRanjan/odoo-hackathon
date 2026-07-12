import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Truck, UserSquare2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Input } from "../ui/input";
import { StatusChip } from "../ui/status-chip";

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { vehicles, drivers, trips } = useTransitData();
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          onOpenChange(false);
        } else {
          setQuery("");
          onOpenChange(true);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  const value = query.trim().toLowerCase();
  const pool = [
    ...vehicles.map((item) => ({
      id: item.id,
      label: item.regNumber,
      meta: item.model,
      route: "/fleet",
      icon: Truck,
      status: item.status,
    })),
    ...drivers.map((item) => ({
      id: item.id,
      label: item.name,
      meta: item.licenseNumber,
      route: "/drivers",
      icon: UserSquare2,
      status: item.status,
    })),
    ...trips.map((item) => ({
      id: item.id,
      label: item.id,
      meta: `${item.origin} → ${item.destination}`,
      route: "/trips",
      icon: ShieldCheck,
      status: item.status,
    })),
  ];
  const results = !value
    ? [
        ...pool.filter((item) => item.route === "/fleet").slice(0, 3),
        ...pool.filter((item) => item.route === "/drivers").slice(0, 3),
        ...pool.filter((item) => item.route === "/trips").slice(0, 3),
      ]
    : pool
        .filter(
          (item) =>
            item.label.toLowerCase().includes(value) ||
            item.meta.toLowerCase().includes(value),
        )
        .slice(0, 9);

  function handleClose() {
    setQuery("");
    onOpenChange(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-x-4 top-[14vh] z-[60] mx-auto w-full max-w-[720px]"
          >
            <div className="modal-panel overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <Command className="h-5 w-5 text-[var(--muted)]" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search vehicle reg numbers, driver names, or trip IDs"
                  className="h-auto border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="px-4 py-10 text-center text-[13px] text-[var(--muted)]">
                    No matching records. Try a reg number, driver, or trip ID.
                  </div>
                ) : (
                  results.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${item.route}-${item.id}`}
                        type="button"
                        onClick={() => {
                          navigate(item.route);
                          handleClose();
                        }}
                        className="focus-ring flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition duration-150 hover:bg-[var(--surface)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-2)]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text)]">{item.label}</p>
                            <p className="font-mono text-[12px] text-[var(--muted)]">
                              {item.meta}
                            </p>
                          </div>
                        </div>
                        <StatusChip
                          status={item.status}
                          pulsing={item.status === "On Trip" || item.status === "Dispatched"}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
