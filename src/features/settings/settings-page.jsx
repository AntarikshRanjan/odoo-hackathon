import { useState } from "react";
import { Moon, Save, Sun } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";

export function SettingsPage() {
  const { session, theme, setTheme, pushToast } = useTransitData();
  const [profile, setProfile] = useState({
    name: session?.name || "",
    email: session?.email || "",
    role: session?.role || "",
  });
  const [preferences, setPreferences] = useState({
    summaryEmails: true,
    incidentAlerts: true,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
          Workspace
        </p>
        <h1 className="text-[28px] font-bold text-[var(--text)]">Settings</h1>
        <p className="text-[14px] text-[var(--text-2)]">
          Profile details, notification preferences, and theme controls.
        </p>
      </div>

      <Card title="Profile" subtitle="Keep the operator context current">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <Input
              value={profile.name}
              onChange={(event) =>
                setProfile((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile((current) => ({ ...current, email: event.target.value }))
              }
            />
          </Field>
          <Field label="Role">
            <Input
              value={profile.role}
              onChange={(event) =>
                setProfile((current) => ({ ...current, role: event.target.value }))
              }
            />
          </Field>
        </div>
      </Card>

      <Card title="Preferences" subtitle="Control delivery and visual mode">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-4">
            <Checkbox
              label="Daily summary emails"
              checked={preferences.summaryEmails}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  summaryEmails: event.target.checked,
                }))
              }
            />
            <Checkbox
              label="Immediate incident alerts"
              checked={preferences.incidentAlerts}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  incidentAlerts: event.target.checked,
                }))
              }
            />
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Theme
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={theme === "dark" ? "primary" : "secondary"}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                type="button"
                variant={theme === "light" ? "primary" : "secondary"}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={() =>
              pushToast({
                title: "Preferences saved.",
                description: "Your operator defaults are updated.",
              })
            }
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
