"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, User, Mail, Lock, Zap, BarChart3, Clock } from "lucide-react";
import { login, signup, getCurrentUser, SessionSummary } from "@/lib/auth";

type Tab = "login" | "signup";

interface FieldState {
  value: string;
  touched: boolean;
  error: string;
}

function useField(initial = ""): [FieldState, (v: string) => void, () => void] {
  const [state, setState] = useState<FieldState>({ value: initial, touched: false, error: "" });
  const set = (v: string) => setState((s) => ({ ...s, value: v, error: "" }));
  const touch = () => setState((s) => ({ ...s, touched: true }));
  return [state, set, touch];
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail, touchLoginEmail] = useField();
  const [loginPassword, setLoginPassword, touchLoginPassword] = useField();

  // Signup fields
  const [signupName, setSignupName, touchSignupName] = useField();
  const [signupEmail, setSignupEmail, touchSignupEmail] = useField();
  const [signupPassword, setSignupPassword, touchSignupPassword] = useField();
  const [confirmPassword, setConfirmPassword, touchConfirmPassword] = useField();

  useEffect(() => {
    if (getCurrentUser()) router.replace("/training");
  }, []);

  const resetErrors = () => {
    setGlobalError("");
    setSuccess("");
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetErrors();
  };

  // Password strength
  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" };
    if (pw.length < 8) return { label: "Weak", color: "bg-orange-500", width: "45%" };
    if (pw.length < 12 && /[^a-zA-Z0-9]/.test(pw)) return { label: "Good", color: "bg-yellow-500", width: "65%" };
    if (pw.length >= 12) return { label: "Strong", color: "bg-green-500", width: "100%" };
    return { label: "Fair", color: "bg-yellow-400", width: "55%" };
  };

  const strength = getPasswordStrength(signupPassword.value);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    touchLoginEmail(); touchLoginPassword();
    resetErrors();
    if (!loginEmail.value || !loginPassword.value) {
      setGlobalError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    const result = await login(loginEmail.value, loginPassword.value);
    setSubmitting(false);
    if (result.success) {
      const firstName = result.user.name.split(" ")[0];
      if (result.sessionSummary.totalAttempts > 0) {
        setSessionSummary(result.sessionSummary);
        setSuccess(`Welcome back, ${firstName}! Your previous progress has been restored.`);
      } else {
        setSuccess(`Welcome back, ${firstName}!`);
      }
      setTimeout(() => router.push("/training"), result.sessionSummary.totalAttempts > 0 ? 2200 : 900);
    } else {
      setGlobalError(result.error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    touchSignupName(); touchSignupEmail(); touchSignupPassword(); touchConfirmPassword();
    resetErrors();
    if (signupPassword.value !== confirmPassword.value) {
      setGlobalError("Passwords do not match.");
      return;
    }
    if (!signupName.value || !signupEmail.value || !signupPassword.value) {
      setGlobalError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    const result = await signup(signupName.value, signupEmail.value, signupPassword.value);
    setSubmitting(false);
    if (result.success) {
      setSuccess(`Account created! Welcome, ${result.user.name.split(" ")[0]}.`);
      setTimeout(() => router.push("/training"), 900);
    } else {
      setGlobalError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 hero-glow">
      {/* Back link */}
      <Link href="/" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm mb-8 transition-colors self-start max-w-md w-full mx-auto">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-shield-accent/10 border border-shield-accent/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-shield-accent" size={28} />
          </div>
          <h1 className="text-3xl font-black">
            Fraud<span className="text-shield-accent">Shield</span>
          </h1>
          <p className="text-shield-muted text-sm mt-1">
            {tab === "login" ? "Sign in to continue your training" : "Create an account to start training"}
          </p>
        </div>

        {/* Card */}
        <div className="card border border-shield-border p-8">
          {/* Tabs */}
          <div className="flex bg-shield-bg rounded-xl p-1 mb-7 gap-1">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? "bg-shield-card text-shield-text shadow-sm"
                    : "text-shield-muted hover:text-shield-text"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-4 text-sm animate-slide-up">
              <CheckCircle size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Session restore summary — shown on login when previous data exists */}
          {sessionSummary && sessionSummary.totalAttempts > 0 && (
            <div className="bg-shield-bg border border-shield-accent/30 rounded-xl p-4 mb-5 animate-slide-up">
              <p className="text-xs text-shield-muted uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                <BarChart3 size={12} className="text-shield-accent" />
                Previous Session Restored
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-shield-card rounded-lg py-2 px-3">
                  <div className="text-2xl font-black text-shield-accent">{sessionSummary.totalAttempts}</div>
                  <div className="text-xs text-shield-muted mt-0.5">Scenarios Attempted</div>
                </div>
                <div className="text-center bg-shield-card rounded-lg py-2 px-3">
                  <div className="text-2xl font-black text-green-400">{sessionSummary.totalScore}</div>
                  <div className="text-xs text-shield-muted mt-0.5">Total Points</div>
                </div>
              </div>
              {sessionSummary.lastActive && (
                <p className="text-xs text-shield-muted mt-3 flex items-center gap-1.5">
                  <Clock size={11} />
                  Last active: {new Date(sessionSummary.lastActive).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              )}
              <p className="text-xs text-shield-accent mt-2">Redirecting to your training hub…</p>
            </div>
          )}

          {/* Error message */}
          {globalError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm animate-slide-up">
              <AlertCircle size={16} className="flex-shrink-0" />
              {globalError}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-shield-muted mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type="email"
                    value={loginEmail.value}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onBlur={touchLoginEmail}
                    placeholder="you@example.com"
                    className="w-full bg-shield-bg border border-shield-border rounded-xl pl-10 pr-4 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none focus:border-shield-accent transition-colors text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-shield-muted">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      // In a real app, route to forgot password flow
                      setGlobalError("Password reset would send an email in a real app.");
                    }}
                    className="text-xs text-shield-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword.value}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onBlur={touchLoginPassword}
                    placeholder="••••••••"
                    className="w-full bg-shield-bg border border-shield-border rounded-xl pl-10 pr-11 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none focus:border-shield-accent transition-colors text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-shield-muted hover:text-shield-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <p className="text-center text-sm text-shield-muted pt-1">
                No account?{" "}
                <button type="button" onClick={() => switchTab("signup")} className="text-shield-accent hover:underline font-medium">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-shield-muted mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type="text"
                    value={signupName.value}
                    onChange={(e) => setSignupName(e.target.value)}
                    onBlur={touchSignupName}
                    placeholder="Margaret Wilson"
                    className="w-full bg-shield-bg border border-shield-border rounded-xl pl-10 pr-4 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none focus:border-shield-accent transition-colors text-sm"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-shield-muted mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type="email"
                    value={signupEmail.value}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onBlur={touchSignupEmail}
                    placeholder="you@example.com"
                    className="w-full bg-shield-bg border border-shield-border rounded-xl pl-10 pr-4 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none focus:border-shield-accent transition-colors text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-shield-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword.value}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onBlur={touchSignupPassword}
                    placeholder="At least 6 characters"
                    className="w-full bg-shield-bg border border-shield-border rounded-xl pl-10 pr-11 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none focus:border-shield-accent transition-colors text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-shield-muted hover:text-shield-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupPassword.value.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-shield-bg rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="text-xs text-shield-muted mt-1">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-shield-muted mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-shield-muted" size={16} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword.value}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={touchConfirmPassword}
                    placeholder="Repeat password"
                    className={`w-full bg-shield-bg border rounded-xl pl-10 pr-11 py-3 text-shield-text placeholder-shield-muted/50 focus:outline-none transition-colors text-sm ${
                      confirmPassword.value && confirmPassword.value !== signupPassword.value
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-shield-border focus:border-shield-accent"
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-shield-muted hover:text-shield-text transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {confirmPassword.value && confirmPassword.value === signupPassword.value && (
                    <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 text-green-400" size={14} />
                  )}
                </div>
              </div>

              {/* What you get */}
              <div className="bg-shield-bg rounded-xl p-3 flex items-start gap-3 border border-shield-border">
                <Zap className="text-shield-accent flex-shrink-0 mt-0.5" size={15} />
                <p className="text-xs text-shield-muted leading-relaxed">
                  Your progress, risk profile, and training history will be saved to your account across sessions.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 !mt-5"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-center text-sm text-shield-muted pt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-shield-accent hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Continue as guest */}
        <div className="text-center mt-5">
          <Link href="/training" className="text-sm text-shield-muted hover:text-shield-text transition-colors">
            Continue as guest — no account needed →
          </Link>
        </div>
      </div>
    </div>
  );
}
