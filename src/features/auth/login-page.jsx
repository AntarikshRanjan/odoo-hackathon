import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { DEMO_PASSWORD, findProfileByRole } from "../../lib/rbac";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, session, roleProfiles } = useTransitData();
  const [form, setForm] = useState({
    email: roleProfiles[0]?.email || "",
    password: DEMO_PASSWORD,
    role: roleProfiles[0]?.role || "",
    remember: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateForm(nextValues) {
    setForm((current) => ({ ...current, ...nextValues }));
    setError("");
  }

  function handleRoleChange(role) {
    const previousProfile = findProfileByRole(form.role);
    const nextProfile = findProfileByRole(role);
    const shouldSyncEmail = !form.email || form.email === previousProfile?.email;

    updateForm({
      role,
      email: shouldSyncEmail ? nextProfile?.email || "" : form.email,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-[400px] p-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex h-11 w-11 items-center justify-center border border-[var(--text)] bg-[var(--invert-bg)] font-mono text-[18px] font-bold text-[var(--invert-text)]">
            TO
          </div>
          <div className="space-y-1">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
              TransitOps
            </p>
            <h1 className="text-[28px] font-bold text-[var(--text)]">
              Sign in to the control tower
            </h1>
            <p className="text-[13px] text-[var(--text-2)]">
              Dispatch, monitor, and recover the fleet from one place.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateForm({ email: event.target.value })}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Password
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => updateForm({ password: event.target.value })}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Role
            </label>
            <Select
              value={form.role}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              {roleProfiles.map((profile) => (
                <option key={profile.role} value={profile.role}>
                  {profile.role}
                </option>
              ))}
            </Select>
          </div>

          {/* Demo hint */}
          <p className="text-[12px] text-[var(--muted)]">
            Demo password for all roles:{" "}
            <span className="font-mono text-[var(--text-2)]">{DEMO_PASSWORD}</span>
          </p>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={form.remember}
              onChange={(event) => updateForm({ remember: event.target.checked })}
            />
            <button
              type="button"
              className="focus-ring text-[12px] text-[var(--muted)] transition-colors duration-150 hover:text-[var(--text)]"
            >
              Forgot Password
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="notice-line">
              <span className="font-mono text-[var(--text)]">✕</span>
              <span>{error}</span>
            </p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
