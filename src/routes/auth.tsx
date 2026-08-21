import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/enter",
    mode: (search.mode as "signup" | "signin") || "signup",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or Sign up — Isobel's" },
      {
        name: "description",
        content: "Create your Isobel's account to enter the draw and manage your subscription.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [emailPrefill, setEmailPrefill] = useState("");

  function goAfterAuth(target: string) {
    // Preserve query strings (e.g. /basket?raffle=...&plan=...)
    if (target.includes("?") || target.startsWith("/basket")) {
      window.location.assign(target);
      return;
    }
    navigate({ to: target as "/enter" });
  }

  useEffect(() => {
    if (!loading && user) {
      goAfterAuth(redirect);
    }
  }, [loading, user, redirect]);

  async function handleGoogle() {
    setFormError(null);
    setInfoMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirect,
    });
    if (result.error) {
      setFormError("Could not sign in with Google. Please try again.");
    }
  }

  function friendlyAuthError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("rate limit")) {
      return "Too many attempts for this email. Wait a few minutes, or try signing in if you already created an account.";
    }
    if (m.includes("already registered") || m.includes("already been registered")) {
      return "This email already has an account. Switch to Sign in.";
    }
    if (m.includes("email not confirmed")) {
      return "Please confirm your email first (check your inbox), then sign in.";
    }
    if (m.includes("invalid login") || m.includes("invalid credentials")) {
      return "Invalid email or password.";
    }
    return message;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setInfoMessage(null);
    const data = new FormData(e.currentTarget);

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse({
        firstName: data.get("firstName"),
        email: data.get("email"),
        password: data.get("password"),
      });
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        for (const i of parsed.error.issues) {
          const k = i.path[0]?.toString() ?? "form";
          if (!fe[k]) fe[k] = i.message;
        }
        setErrors(fe);
        return;
      }
      setSubmitting(true);
      // Supabase Auth stores email + hashed password in auth.users (not in our SQL tables).
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin + redirect,
          data: { first_name: parsed.data.firstName },
        },
      });
      if (error) {
        setSubmitting(false);
        setFormError(friendlyAuthError(error.message));
        return;
      }

      // Confirm-email off → session is returned and user can continue.
      if (signUpData.session) {
        setSubmitting(false);
        goAfterAuth(redirect);
        return;
      }

      // Confirm-email on, or edge case: account created but no session yet.
      // Try immediate sign-in (works when confirmation is disabled / already confirmed).
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setSubmitting(false);

      if (signInData.session) {
        goAfterAuth(redirect);
        return;
      }

      setEmailPrefill(parsed.data.email);
      setMode("signin");
      if (signInError?.message.toLowerCase().includes("email not confirmed")) {
        setInfoMessage(
          "Account created. Check your email to confirm, then sign in with the same password.",
        );
      } else {
        setInfoMessage(
          "Account created. Sign in with your email and password to continue.",
        );
        if (signInError) setFormError(friendlyAuthError(signInError.message));
      }
    } else {
      const parsed = signInSchema.safeParse({
        email: data.get("email"),
        password: data.get("password"),
      });
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        for (const i of parsed.error.issues) {
          const k = i.path[0]?.toString() ?? "form";
          if (!fe[k]) fe[k] = i.message;
        }
        setErrors(fe);
        return;
      }
      setSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setSubmitting(false);
      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }
      goAfterAuth(redirect);
    }
  }

  return (
    <section className="bg-brand-cream py-20 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Members
          </p>
          <h1 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-3">
            {mode === "signup" ? "Join Isobel's" : "Welcome back"}
          </h1>
          <p className="text-sm text-brand-ink/60">
            {mode === "signup"
              ? "Create an account to enter the draw and manage your subscription."
              : "Sign in to continue with your entry."}
          </p>
        </div>

        <div className="bg-white border border-brand-taupe p-8 md:p-10">
          <div className="grid grid-cols-2 border-b border-brand-ink/10 mb-8 -mx-2">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErrors({});
                  setFormError(null);
                  setInfoMessage(null);
                }}
                className={cn(
                  "py-3 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors border-b-2 -mb-px",
                  mode === m
                    ? "border-brand-ink text-brand-ink"
                    : "border-transparent text-brand-ink/40 hover:text-brand-ink",
                )}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-brand-ink/20 hover:border-brand-ink py-3 text-sm transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-ink/10" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] uppercase tracking-[0.2em] text-brand-ink/40">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <Field label="First name" name="firstName" error={errors.firstName}>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={50}
                  className="w-full border-b border-brand-ink/20 bg-transparent py-2 text-sm focus:outline-none focus:border-brand-ink transition-colors"
                />
              </Field>
            )}

            <Field label="Email" name="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                defaultValue={emailPrefill}
                key={`${mode}-${emailPrefill}`}
                className="w-full border-b border-brand-ink/20 bg-transparent py-2 text-sm focus:outline-none focus:border-brand-ink transition-colors"
              />
            </Field>

            <Field label="Password" name="password" error={errors.password}>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={mode === "signup" ? 8 : 1}
                maxLength={72}
                className="w-full border-b border-brand-ink/20 bg-transparent py-2 text-sm focus:outline-none focus:border-brand-ink transition-colors"
              />
            </Field>

            {infoMessage && (
              <p className="text-xs text-brand-ink/70 bg-brand-cream border border-brand-taupe px-3 py-2">
                {infoMessage}
              </p>
            )}

            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-ink text-brand-cream py-4 text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-colors disabled:opacity-60"
            >
              {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>

            <p className="text-[10px] text-brand-ink/50 text-center leading-relaxed">
              By continuing you agree to our{" "}
              <Link to="/about" className="underline">Terms</Link> and confirm you are 18 or over.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
