import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, session } = useTransitData();
  const [form, setForm] = useState({
    email: "ops@transitops.io",
    password: "demo123",
    remember: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const result = login(form);
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              Password
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={form.remember}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    remember: event.target.checked,
                  }))
                }
              />
              <button
                type="button"
                className="focus-ring text-[13px] text-[var(--text)]"
              >
                Forgot Password
              </button>
            </div>
          </div>
          {error && (
            <p className="notice-line">
              <span className="font-mono text-[var(--text)]">✕</span>
              <span>{error}</span>
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
