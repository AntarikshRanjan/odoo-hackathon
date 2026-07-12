import { useState } from "react";
import { Moon, Save, Sun } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Modal } from "../../components/ui/modal";

export function SettingsPage() {
  const { 
    session, 
    theme, 
    setTheme, 
    pushToast, 
    settings, 
    updateSettings, 
    setSessionRole,
    logout
  } = useTransitData();

  const [profile, setProfile] = useState({
    name: session?.name || "",
    email: session?.email || "",
  });

  const [depotForm, setDepotForm] = useState({
    depotName: settings?.depotName || "",
    currency: settings?.currency || "₹",
    distanceUnit: settings?.distanceUnit || "km",
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const rolesList = ["Operations Lead", "Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  
  function handleProfileSave() {
    pushToast({
      title: "Profile saved.",
      description: "Operator details updated.",
    });
  }

  function handleDepotSave(e) {
    e.preventDefault();
    updateSettings(depotForm);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
          Workspace
        </p>
        <h1 className="text-[28px] font-bold text-[var(--text)]">Settings</h1>
        <p className="text-[14px] text-[var(--text-2)]">
          Profile details, depot controls, and account settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card title="Profile" subtitle="Operator context and simulated role">
          <div className="space-y-4">
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
            <Field label="Simulated Role (RBAC)">
              <Select
                value={session?.role || ""}
                onChange={(event) => setSessionRole(event.target.value)}
              >
                {rolesList.map((role) => (
                   <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={handleProfileSave}>
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Depot Settings Card */}
        <Card title="Depot Config" subtitle="Set system-wide operational metrics">
          <form className="space-y-4" onSubmit={handleDepotSave}>
            <Field label="Depot Name">
              <Input
                required
                value={depotForm.depotName}
                onChange={(event) =>
                  setDepotForm((current) => ({ ...current, depotName: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Currency">
                <Select
                  value={depotForm.currency}
                  onChange={(event) =>
                    setDepotForm((current) => ({ ...current, currency: event.target.value }))
                  }
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </Select>
              </Field>
              <Field label="Distance Metric">
                <Select
                  value={depotForm.distanceUnit}
                  onChange={(event) =>
                    setDepotForm((current) => ({ ...current, distanceUnit: event.target.value }))
                  }
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </Select>
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit">
                <Save className="h-4 w-4" />
                Save Depot
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Account Security & Termination Card */}
      <Card title="Account Security & Termination" subtitle="Manage account state and termination options">
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--text-2)]">
            Permanently removing your account will revoke access to the control tower and delete your operator profile settings from this workspace.
          </p>
          <div>
            <Button
              type="button"
              className="border-red-500 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
              onClick={() => setIsDeleteOpen(true)}
            >
              Terminate Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteConfirmationText("");
        }}
        title="Confirm Account Deletion"
        description="Are you absolutely sure you want to delete your operator account? This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--text-2)]">
            To proceed, type <span className="font-mono font-bold text-[var(--text)] bg-[var(--surface-2)] px-1 py-0.5 rounded">DELETE</span> in the box below to confirm:
          </p>
          <Input
            value={deleteConfirmationText}
            placeholder="Type DELETE"
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteConfirmationText("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="border-red-500 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
              disabled={deleteConfirmationText !== "DELETE"}
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteConfirmationText("");
                logout();
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
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
