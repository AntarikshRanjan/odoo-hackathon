import { Command, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../ui/button";
import { ROUTE_TITLES } from "../../lib/rbac";

export function Topbar({ onOpenMobileMenu, onOpenCommandPalette }) {
  const location = useLocation();
  const { session, theme, setTheme, logout } = useTransitData();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-[1600px] flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Open navigation menu"
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--muted)]">
              TransitOps
            </p>
            <h1 className="text-[28px] font-bold text-[var(--text)]">
              {ROUTE_TITLES[location.pathname] || "Control Tower"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="hidden min-w-[168px] justify-between sm:inline-flex"
            onClick={onOpenCommandPalette}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search records
            </span>
            <span className="flex items-center gap-1 border border-[var(--border)] px-2 py-1 font-mono text-[12px] text-[var(--muted)]">
              <Command className="h-3 w-3" />K
            </span>
          </Button>
          <Button
            aria-label="Open command palette"
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={onOpenCommandPalette}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Toggle color theme"
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <div className="hidden border border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:block">
            <p className="text-[13px] font-medium text-[var(--text)]">{session?.name}</p>
            <p className="text-[12px] text-[var(--muted)]">{session?.role}</p>
          </div>
          <Button
            aria-label="Sign out"
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
