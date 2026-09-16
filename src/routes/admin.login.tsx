import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { adminCheckAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Isobels" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const ADMIN_EMAIL = "isobelluxcollective@gmail.com";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .refine((v) => v.toLowerCase() === ADMIN_EMAIL, {
      message: "Use the Isobels staff email to sign in",
    }),
  password: z.string().min(1, "Password is required").max(72),
});

function AdminLoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminCheckAccess);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function syncSession() {
      if (!user) return;

      // Stale session from another account (e.g. jam752575) — clear it so staff can sign in fresh
      if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        if (!cancelled) {
          setFormError(null);
          setChecking(false);
        }
        return;
      }

      setChecking(true);
      try {
        const res = await checkAdmin();
        if (cancelled) return;
        if (res.isAdmin) navigate({ to: "/admin" });
        else setFormError("This account does not have admin access. Ask a developer to grant the admin role in Supabase.");
      } catch {
        if (!cancelled) setFormError("Could not verify admin access.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void syncSession();
    return () => {
      cancelled = true;
    };
  }, [loading, user, checkAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const data = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
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
    if (error) {
      setSubmitting(false);
      setFormError("Invalid email or password.");
      return;
    }

    try {
      const res = await checkAdmin();
      if (!res.isAdmin) {
        await supabase.auth.signOut();
        setFormError("This account does not have admin access.");
        setSubmitting(false);
        return;
      }
      navigate({ to: "/admin" });
    } catch {
      await supabase.auth.signOut();
      setFormError("Could not verify admin access.");
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Staff only
          </p>
          <h1 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-2">
            Admin login
          </h1>
          <p className="text-sm text-brand-ink/60">Sign in with your Isobels staff account</p>
        </div>

        <div className="rounded-2xl border border-brand-ink/10 bg-white p-8 shadow-sm">
          {loading || checking ? (
            <p className="text-center text-sm text-brand-ink/55">Checking session…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  readOnly
                  defaultValue={ADMIN_EMAIL}
                  maxLength={255}
                  className="w-full rounded-md border border-brand-ink/15 bg-brand-cream/40 px-4 py-3 text-sm text-brand-ink focus:outline-none"
                />
                {errors.email ? <p className="text-xs text-destructive mt-1">{errors.email}</p> : null}
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={72}
                  className="w-full rounded-md border border-brand-ink/15 px-4 py-3 text-sm focus:outline-none focus:border-brand-oxblood"
                />
                {errors.password ? (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                ) : null}
              </div>

              {formError ? <p className="text-xs text-destructive">{formError}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-brand-oxblood py-3.5 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream hover:bg-brand-gold transition-colors disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
