import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/members",
  }),
  head: () => ({
    meta: [
      { title: "Log In — Isobels" },
      { name: "description", content: "Sign in to your Isobels members account." },
    ],
  }),
  component: LoginPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect as "/members" });
    }
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setResetMessage(null);
    const data = new FormData(e.currentTarget);
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
      setFormError("Invalid email or password.");
      return;
    }
    navigate({ to: redirect as "/members" });
  }

  async function handleForgot() {
    setFormError(null);
    setResetMessage(null);
    const emailInput = (document.querySelector('input[name="email"]') as HTMLInputElement | null)?.value?.trim();
    if (!emailInput) {
      setFormError("Enter your email above first, then tap Forgot password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) {
      setFormError("Could not send reset email. Please try again.");
      return;
    }
    setResetMessage("Check your inbox for a password reset link.");
  }

  return (
    <section className="bg-brand-cream py-20 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Members
          </p>
          <h1 className="font-serif text-5xl md:text-6xl italic text-brand-ink mb-3">
            Welcome Back
          </h1>
          <p className="text-sm text-brand-ink/60">Sign in to your Isobels account</p>
        </div>

        <div className="bg-white border border-brand-taupe p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                className="w-full border-b border-brand-ink/20 bg-transparent py-2 text-sm focus:outline-none focus:border-brand-ink transition-colors"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={72}
                className="w-full border-b border-brand-ink/20 bg-transparent py-2 text-sm focus:outline-none focus:border-brand-ink transition-colors"
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            {formError && <p className="text-xs text-destructive">{formError}</p>}
            {resetMessage && <p className="text-xs text-brand-ink/70">{resetMessage}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-ink text-brand-cream py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-colors disabled:opacity-60"
            >
              {submitting ? "Please wait…" : "Log In"}
            </button>

            <div className="flex flex-col items-center gap-3 pt-2">
              <Link
                to="/auth"
                search={{ redirect, mode: "signup" }}
                className="text-xs text-brand-ink hover:text-brand-gold transition-colors"
              >
                New to Isobels? <span className="underline">Create an account</span>
              </Link>
              <button
                type="button"
                onClick={handleForgot}
                className="text-[11px] text-brand-ink/50 hover:text-brand-ink transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
