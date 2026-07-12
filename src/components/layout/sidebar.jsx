import {
  BarChart3,
  Fuel,
  Gauge,
  Settings,
  ShieldCheck,
  Truck,
  UserSquare2,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/fleet", label: "Fleet", icon: Truck },
  { to: "/drivers", label: "Drivers", icon: UserSquare2 },
  { to: "/trips", label: "Trips", icon: ShieldCheck },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/expenses", label: "Fuel & Expenses", icon: Fuel },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobileOpen, onMobileClose }) {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    stats,
    maintenance,
  } = useTransitData();

  const widthClass = sidebarCollapsed ? "w-[64px]" : "w-[240px]";
  const openMaintenance = maintenance.filter((item) => item.status === "Open").length;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition duration-150 lg:translate-x-0",
          widthClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center border border-[var(--text)] bg-[var(--invert-bg)] font-mono text-[18px] font-bold text-[var(--invert-text)]">
            TO
          </div>
          {!sidebarCollapsed && (
            <div className="space-y-0.5">
              <p className="text-[16px] font-semibold text-[var(--text)]">TransitOps</p>
              <p className="text-[12px] text-[var(--muted)]">Control tower</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const pulse =
              item.to === "/trips"
                ? stats.activeTrips > 0
                : item.to === "/maintenance"
                  ? openMaintenance > 0
                  : false;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    "focus-ring relative flex items-center gap-3 border-l-2 px-3 py-3 transition duration-150",
                    isActive
                      ? "border-[var(--text)] text-[var(--text)]"
                      : "border-transparent text-[var(--text-2)] hover:text-[var(--text)]",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {pulse && (
                  <span
                    className={cn(
                      "ml-auto font-mono text-[var(--text)]",
                      "sidebar-dot-pulse",
                    )}
                  >
                    ●
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {!sidebarCollapsed && "Collapse"}
          </Button>
        </div>
      </aside>
    </>
  );
}
