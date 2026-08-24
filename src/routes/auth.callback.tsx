import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "/enter",
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
  }),
  head: () => ({
    meta: [{ title: "Signing you in — Isobels" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { next, error, error_description } = Route.useSearch();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    async function finish() {
      if (error) {
        setMessage(error_description || "Google sign-in was cancelled.");
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setMessage(exchangeError.message || "Could not complete Google sign-in.");
          return;
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setMessage("Could not complete Google sign-in. Please try again.");
          return;
        }
      }

      if (next.includes("?") || next.startsWith("/basket")) {
        window.location.assign(next);
        return;
      }
      navigate({ to: next as "/enter" });
    }

    void finish();
  }, [error, error_description, next, navigate]);

  const failed = Boolean(error) || message !== "Signing you in…";

  return (
    <section className="bg-brand-cream min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          Isobels
        </p>
        <h1 className="font-serif text-3xl italic text-brand-ink mb-4">
          {failed && message !== "Signing you in…" ? "Sign-in issue" : "Almost there"}
        </h1>
        <p className="text-sm text-brand-ink/70 mb-8">{message}</p>
        {failed && message !== "Signing you in…" ? (
          <button
            type="button"
            onClick={() => navigate({ to: "/auth", search: { redirect: next, mode: "signin" } })}
            className="rounded-full bg-brand-oxblood px-8 py-3 text-xs uppercase tracking-widest font-bold text-brand-cream hover:bg-brand-gold transition-colors"
          >
            Back to sign in
          </button>
        ) : null}
      </div>
    </section>
  );
}
