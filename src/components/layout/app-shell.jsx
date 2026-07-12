import { useState } from "react";
import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { ToastViewport } from "../ui/toast";
import { useTransitData } from "../../app/transit-data";
import { cn } from "../../lib/utils";

export function AppShell() {
  const location = useLocation();
  const { sidebarCollapsed } = useTransitData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="page-shell">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div
        className={cn(
          "page-main transition-[padding] duration-150",
          sidebarCollapsed ? "lg:pl-[64px]" : "lg:pl-[240px]",
        )}
      >
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandOpen(true)}
        />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="page-section"
        >
          <Outlet />
        </motion.main>
      </div>
      <CommandPalette
        open={commandOpen}
        onOpenChange={(nextOpen) => setCommandOpen(nextOpen)}
      />
      <ToastViewport />
    </div>
  );
}
