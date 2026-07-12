import { useState } from "react";
import { Moon, Save, Sun, Shield, Upload } from "lucide-react";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { updateUserProfile } from "../../lib/auth";
import { updateUserProfileData } from "../../lib/firestore";
import { uploadProfilePhoto } from "../../lib/storage";

export function SettingsPage() {
  const { 
    session, 
    theme, 
    setTheme, 
    pushToast, 
    settings, 
    rbacMatrix, 
    updateSettings, 
    updateRBACMatrix, 
    setSessionRole 
  } = useTransitData();

  const [profile, setProfile] = useState({
    name: session?.name || "",
    email: session?.email || "",
  });

  const [preferences, setPreferences] = useState({
    summaryEmails: true,
    incidentAlerts: true,
  });

  const [depotForm, setDepotForm] = useState({
    depotName: settings?.depotName || "",
    currency: settings?.currency || "₹",
    distanceUnit: settings?.distanceUnit || "km",
  });

  const [saving, setSaving] = useState(false);

  const rolesList = ["Operations Lead", "Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  
  const pagesList = [
    { key: "fleet", label: "Fleet Registry" },
    { key: "drivers", label: "Drivers & Safety" },
    { key: "trips", label: "Trips (Dispatch)" },
    { key: "maintenance", label: "Maintenance" },
    { key: "fuelExpenses", label: "Fuel & Expenses" },
    { key: "analytics", label: "Reports & Analytics" }
  ];

  async function handleProfileSave() {
    setSaving(true);
    try {
      await updateUserProfile(profile.name);
      await updateUserProfileData(session.uid, {
        displayName: profile.name,
      });
      pushToast({
        title: "Profile saved.",
        description: "Operator details updated in Firebase.",
      });
    } catch (error) {
      pushToast({
        title: "Error",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      pushToast({
        title: "Error",
        description: "Image must be under 5MB.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const photoURL = await uploadProfilePhoto(session.uid, file);
      await updateUserProfile(undefined, photoURL);
      await updateUserProfileData(session.uid, { photoURL });
      pushToast({
        title: "Photo updated.",
        description: "Profile photo uploaded successfully.",
      });
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to upload photo.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
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
          Profile details, notification preferences, depot controls, and RBAC matrix.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card title="Profile" subtitle="Operator context and simulated role">
          <div className="space-y-4">
            {/* Profile Photo */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden">
                {session?.photoURL ? (
                  <img
                    src={session.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[20px] font-bold text-[var(--muted)]">
                    {session?.name?.charAt(0) || session?.email?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button type="button" variant="secondary" size="compact" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
                <p className="text-[11px] text-[var(--muted)] mt-1">Max 5MB</p>
              </div>
            </div>

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
                disabled
                className="opacity-60"
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
              <Button type="button" onClick={handleProfileSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
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

      {/* RBAC Matrix Card */}
      <Card 
        title="Role-Based Access Control (RBAC)" 
        subtitle="Manage permission levels across roles (Changes apply in real-time)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 px-4 text-[12px] uppercase font-semibold text-[var(--muted)]">Role</th>
                {pagesList.map((page) => (
                  <th key={page.key} className="py-3 px-4 text-[12px] uppercase font-semibold text-[var(--muted)] text-center">
                    {page.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolesList.map((role) => (
                <tr 
                  key={role} 
                  className={`border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] ${
                    session?.role === role ? "bg-[var(--surface-2)] font-semibold" : ""
                  }`}
                >
                  <td className="py-4 px-4 text-[14px] text-[var(--text)]">
                    <div className="flex items-center gap-2">
                      {session?.role === role && <Shield className="h-4 w-4 text-emerald-500" />}
                      {role}
                    </div>
                  </td>
                  {pagesList.map((page) => {
                    const currentAccess = rbacMatrix[role]?.[page.key] || "none";
                    return (
                      <td key={page.key} className="py-4 px-4 text-center">
                        <select
                          className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          value={currentAccess}
                          onChange={(e) => updateRBACMatrix(role, page.key, e.target.value)}
                        >
                          <option value="full">Full Access</option>
                          <option value="view">Read Only</option>
                          <option value="none">No Access</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preferences Card */}
      <Card title="Preferences" subtitle="Control delivery alerts">
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
