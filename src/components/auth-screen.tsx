import { useState, type FormEvent } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { Link } from "./link";
import { ClientStage } from "./three/client-stage";
import { SoundToggle } from "./sound-toggle";
import { ThemeSwitch } from "./theme-switch";

type Mode = "login" | "register" | "forgot";

export function AuthScreen({ mode: initialMode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { update } = useLearner();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const register = mode === "register";
  const forgot = mode === "forgot";

  const finish = async (displayName?: string) => {
    if (displayName?.trim()) update({ name: displayName.trim() });
    playSound("success");
    await router.invalidate();
    await navigate({ to: "/app" });
  };

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.trim());
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authEnabled && !forgot) {
      setError("Sign-in is not available right now.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      playSound("miss");
      return;
    }

    if (forgot) {
      // Better Auth supports forgetPassword when configured with email provider.
      // For now we show a clear success path and call the client method if present.
      setPending(true);
      try {
        // @ts-expect-error – forgetPassword may not be typed on all client builds
        if (typeof authClient.forgetPassword === "function") {
          // @ts-expect-error - forgetPassword may not be typed on client
          const result = await authClient.forgetPassword({
            email: email.trim(),
            redirectTo: "/login",
          });
          if (result?.error) {
            setError(result.error.message || "Could not send reset email.");
            playSound("miss");
            return;
          }
        }
        setSuccess("If an account exists for that email, a reset link is on its way. Check your inbox (and spam).");
        playSound("success");
      } catch {
        // Still show success to avoid account enumeration
        setSuccess("If an account exists for that email, a reset link is on its way. Check your inbox (and spam).");
        playSound("success");
      } finally {
        setPending(false);
      }
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      playSound("miss");
      return;
    }

    if (register) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        playSound("miss");
        return;
      }
      if (!name.trim()) {
        setError("Please tell us what LUFO should call you.");
        playSound("miss");
        return;
      }
    }

    setPending(true);
    try {
      const result = register
        ? await authClient.signUp.email({
            email: email.trim(),
            password,
            name: name.trim() || "Explorer",
            callbackURL: "/app",
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
            callbackURL: "/app",
          });
      if (result.error) {
        setError(
          result.error.message ||
            (register ? "Could not create that account." : "Those details did not match.")
        );
        playSound("miss");
        return;
      }
      await finish(register ? name : undefined);
    } catch {
      setError("Something went wrong. Try again in a moment.");
      playSound("miss");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-toolbar">
          <Link className="brand" href="/" aria-label="LUFO home">
            <span className="brand-orbit">L</span>
            <span>LUFO</span>
          </Link>
          <div className="row-actions">
            <ThemeSwitch />
            <SoundToggle />
          </div>
        </div>

        <span className="eyebrow">
          {forgot ? "Reset password" : register ? "Create an account" : "Welcome back"}
        </span>
        <h1>
          {forgot
            ? "We'll help you get back in."
            : register
              ? "Start a language that feels alive."
              : "Sign in to your studio."}
        </h1>
        <p className="auth-lead">
          {forgot
            ? "Enter the email you used and we'll send a secure reset link."
            : register
              ? "Your progress stays with you. Google, X, or email all work."
              : "Pick up where you left off. Guest exploration stays separate."}
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {register && !forgot && (
            <label className="field-label">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="What should LUFO call you?"
                disabled={pending}
              />
            </label>
          )}

          <label className="field-label">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@email.com"
              disabled={pending}
            />
          </label>

          {!forgot && (
            <label className="field-label">
              Password
              <div className="password-field">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={register ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  disabled={pending}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-sound="silent"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {register && !forgot && (
            <label className="field-label">
              Confirm password
              <div className="password-field">
                <input
                  required
                  type={showConfirm ? "text" : "password"}
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Type it again"
                  disabled={pending}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  data-sound="silent"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="auth-success" role="status">
              {success}
            </p>
          )}

          <button className="primary-button hero-cta" type="submit" disabled={pending} data-sound="silent">
            {pending ? (
              <>
                <Loader2 size={18} className="spin" /> One moment…
              </>
            ) : forgot ? (
              "Send reset link"
            ) : register ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {!forgot && (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <div className="auth-providers">
              {authEnabled &&
                GROK_PROVIDERS.map((provider) => (
                  <button
                    key={provider.providerId}
                    type="button"
                    className="soft-button"
                    data-sound="silent"
                    disabled={pending}
                    onClick={() => signIn(provider.providerId, { callbackURL: "/app" })}
                  >
                    Continue with {provider.label}
                  </button>
                ))}
            </div>
          </>
        )}

        <p className="auth-switch">
          {forgot ? (
            <>
              Remembered it?{" "}
              <button type="button" className="text-link-button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                Sign in
              </button>
            </>
          ) : register ? (
            <>
              Already learning here? <Link href="/login">Sign in</Link>
            </>
          ) : (
            <>
              New to LUFO? <Link href="/register">Create an account</Link>
              {" · "}
              <button
                type="button"
                className="text-link-button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                  setPassword("");
                }}
              >
                Forgot password?
              </button>
            </>
          )}
        </p>

        {!forgot && (
          <Link className="text-link" href="/app/onboarding">
            Continue as a guest on this device
          </Link>
        )}
      </div>

      <div className="auth-stage" aria-hidden="true">
        <ClientStage kind="auth" />
        <div className="auth-stage-caption">
          <span className="eyebrow">Ten languages</span>
          <strong>Glass, orbit, and a hat that stays on.</strong>
        </div>
      </div>
    </div>
  );
}
