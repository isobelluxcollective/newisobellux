import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { getMembersData } from "@/lib/entries.functions";

export const Route = createFileRoute("/members")({
  validateSearch: (search: Record<string, unknown>) => ({
    welcome: search.welcome === 1 || search.welcome === "1" ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Members Portal — Isobels" },
      { name: "description", content: "Your Isobels members portal: entries, orders and details." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { welcome } = Route.useSearch();
  const fetchMembers = useServerFn(getMembersData);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: "/members" } });
    }
  }, [loading, user, navigate]);

  const query = useQuery({
    queryKey: ["members-data"],
    queryFn: () => fetchMembers(),
    enabled: !!user,
  });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !user) {
    return (
      <section className="bg-brand-cream py-20 min-h-[60vh]">
        <div className="container mx-auto px-6 text-center text-sm text-brand-ink/60">Loading…</div>
      </section>
    );
  }

  const data = query.data;
  const profile = data?.profile;
  const firstName = profile?.first_name?.trim() || "there";
  const email = user.email ?? "";
  const balance = profile?.ticket_balance ?? 0;
  const expiry = profile?.ticket_expiry
    ? new Date(profile.ticket_expiry).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const active = data?.active_entries ?? [];
  const past = data?.past_entries ?? [];
  const orders = data?.orders ?? [];

  return (
    <section className="bg-brand-cream py-16 md:py-20 min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Members Portal
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="font-serif text-5xl md:text-6xl italic text-brand-ink">
              Welcome back, {firstName}
            </h1>
            <div className="inline-flex items-center gap-2 bg-brand-ink text-brand-cream px-5 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold">
              {balance} ticket{balance === 1 ? "" : "s"}
              {expiry && <span className="text-brand-cream/60 normal-case tracking-normal text-[11px]">· expires {expiry}</span>}
            </div>
          </div>
        </div>

        {welcome === 1 && (
          <Banner tone="success">
            You're in. Good luck, {firstName}.
          </Banner>
        )}
        {data?.expiring_soon && (
          <Banner tone="warn">
            Your tickets expire on {expiry}. Use them before they're gone.{" "}
            <Link to="/raffle" className="underline">View live draws</Link>
          </Banner>
        )}
        {data?.low_balance && !data.expiring_soon && balance > 0 && (
          <Banner tone="muted">
            You have {balance} unallocated ticket{balance === 1 ? "" : "s"}.{" "}
            <Link to="/members/allocate" className="underline">
              Allocate across live draws
            </Link>
          </Banner>
        )}
        {balance > 0 && (
          <div className="mb-8 text-center">
            <Link
              to="/members/allocate"
              className="inline-block rounded-full border border-brand-ink px-8 py-3 text-xs uppercase tracking-widest font-bold text-brand-ink hover:bg-brand-ink hover:text-brand-cream transition-colors"
            >
              Allocate subscription entries
            </Link>
          </div>
        )}

        {/* Active Entries */}
        <SectionHeading title="My Active Entries" />
        <div className="mb-16 bg-white border border-brand-taupe overflow-hidden">
          {active.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-brand-ink/60 italic">
              You haven't entered any live draws yet.
            </div>
          ) : (
            <ul className="divide-y divide-brand-taupe">
              {active.map((e: any) => (
                <li key={e.id} className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold mb-1">
                      Draw No. {e.raffles?.draw_number}
                    </p>
                    <p className="font-serif italic text-xl text-brand-ink">
                      {e.raffles?.prize_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-brand-ink">
                      {e.tickets} ticket{e.tickets === 1 ? "" : "s"}
                    </p>
                    <p className="text-[11px] text-brand-ink/50">
                      Draws {e.raffles?.draw_date ? new Date(e.raffles.draw_date).toLocaleDateString("en-GB") : "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Past Draws */}
        <SectionHeading title="Past Draws" />
        <div className="mb-16 bg-white border border-brand-taupe overflow-hidden">
          {past.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-brand-ink/60 italic">
              No past entries yet — your history will appear here after your first draw closes.
            </div>
          ) : (
            <ul className="divide-y divide-brand-taupe">
              {past.map((e: any) => (
                <li key={e.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink/40 mb-1">
                      Draw No. {e.raffles?.draw_number}
                    </p>
                    <p className="font-serif italic text-base text-brand-ink/80">
                      {e.raffles?.prize_name}
                    </p>
                  </div>
                  <p className="text-sm text-brand-ink/60">{e.tickets} tickets</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* My Details */}
        <SectionHeading title="My Details" />
        <div className="mb-16 bg-white border border-brand-taupe p-8 md:p-10">
          <dl className="space-y-4 mb-6">
            <DetailRow label="Name" value={profile?.first_name ?? "—"} />
            <DetailRow label="Email" value={email} />
          </dl>
        </div>

        {/* My Orders */}
        <SectionHeading title="My Orders" />
        <div className="mb-16 bg-white border border-brand-taupe overflow-hidden">
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-brand-ink/60 italic">
              No orders yet.
            </div>
          ) : (
            <ul className="divide-y divide-brand-taupe">
              {orders.map((o: any) => (
                <li key={o.id} className="px-6 py-4 grid grid-cols-4 gap-4 text-sm">
                  <span className="text-brand-ink/60">
                    {new Date(o.created_at).toLocaleDateString("en-GB")}
                  </span>
                  <span className="text-brand-ink">
                    {o.source_type === "subscription_renewal" ? "Subscription" : "One-off"}{" "}
                    {o.tier ? `(${o.tier})` : ""}
                  </span>
                  <span className="text-brand-ink/80">{o.tickets_granted} tickets</span>
                  <span className="text-brand-ink/80 text-right">
                    £{((o.amount_paid_pence ?? 0) / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-[12px] text-brand-ink/50 hover:text-brand-ink underline underline-offset-4 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
}

function Banner({ children, tone }: { children: React.ReactNode; tone: "success" | "warn" | "muted" }) {
  const cls =
    tone === "success"
      ? "bg-brand-ink text-brand-cream"
      : tone === "warn"
        ? "bg-brand-gold/20 text-brand-ink border border-brand-gold/40"
        : "bg-white text-brand-ink/80 border border-brand-taupe";
  return (
    <div className={`mb-8 px-6 py-4 text-sm text-center ${cls}`}>{children}</div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="font-serif italic text-3xl md:text-4xl text-brand-ink mb-5">{title}</h2>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-brand-ink/50 w-24">{label}</dt>
      <dd className="text-sm text-brand-ink">{value}</dd>
    </div>
  );
}
