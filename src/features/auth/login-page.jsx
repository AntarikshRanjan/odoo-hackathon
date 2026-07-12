import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTransitData } from "../../app/transit-data";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, forgotPassword, session, authLoading } = useTransitData();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    remember: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-[13px] text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    let result;
    if (mode === "signup") {
      result = await signup({
        email: form.email,
        password: form.password,
        displayName: form.name,
      });
    } else {
      result = await login({
        email: form.email,
        password: form.password,
      });
    }

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  }

  async function handleSocialLogin(method) {
    setError("");
    setSubmitting(true);
    const result = await login({ method });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
    } else {
      navigate("/dashboard");
    }
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");
    const result = await forgotPassword(form.email);
    if (result.ok) {
      setSuccess("Password reset email sent. Check your inbox.");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-[420px] p-8">
        <div className="mb-8 space-y-4">
          <div className="flex h-11 w-11 items-center justify-center border border-[var(--text)] bg-[var(--invert-bg)] font-mono text-[18px] font-bold text-[var(--invert-text)]">
            TO
          </div>
          <div className="space-y-1">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
              TransitOps
            </p>
            <h1 className="text-[28px] font-bold text-[var(--text)]">
              {mode === "login" ? "Sign in to the control tower" : "Create your account"}
            </h1>
            <p className="text-[13px] text-[var(--text-2)]">
              Dispatch, monitor, and recover the fleet from one place.
            </p>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocialLogin("google")}
            disabled={submitting}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocialLogin("github")}
            disabled={submitting}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-[12px] uppercase">
            <span className="bg-[var(--surface)] px-3 text-[var(--muted)]">or</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
                Name
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
          )}
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
            {mode === "login" && (
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
                  onClick={handleForgotPassword}
                >
                  Forgot Password
                </button>
              </div>
            )}
          </div>
          {error && (
            <p className="notice-line">
              <span className="font-mono text-[var(--text)]">&#10005;</span>
              <span>{error}</span>
            </p>
          )}
          {success && (
            <p className="text-[13px] text-emerald-500">{success}</p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[var(--text-2)]">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-[var(--text)] underline"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setSuccess("");
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </Card>
    </div>
  );
}
