import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, RefreshCw, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { adminCheckAccess, adminGetDashboard, type PrelaunchSignupRow } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Isobels" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

function downloadCsv(rows: PrelaunchSignupRow[]) {
  const header = ["Full name", "Email", "Mobile", "Marketing consent", "Source", "Signed up at"];
  const lines = rows.map((r) =>
    [
      r.full_name,
      r.email,
      r.mobile,
      r.marketing_consent ? "yes" : "no",
      r.source,
      new Date(r.created_at).toISOString(),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `isobels-prelaunch-signups-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(adminCheckAccess);
  const fetchDashboard = useServerFn(adminGetDashboard);
  const [allowed, setAllowed] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    let cancelled = false;
    checkAdmin()
      .then((res) => {
        if (cancelled) return;
        if (!res.isAdmin) {
          setGateError("You do not have admin access.");
          setAllowed(false);
          return;
        }
        setAllowed(true);
      })
      .catch(() => {
        if (!cancelled) {
          setGateError("Could not verify admin access.");
          setAllowed(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, checkAdmin, navigate]);

  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchDashboard(),
    enabled: allowed,
  });

  const filtered = useMemo(() => {
    const rows = query.data?.signups ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.mobile.toLowerCase().includes(q),
    );
  }, [query.data?.signups, search]);

  if (loading || (!allowed && !gateError)) {
    return (
      <div className="px-6 py-16 text-sm text-brand-ink/55">Loading dashboard…</div>
    );
  }

  if (gateError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-serif text-3xl italic text-brand-ink mb-3">Access denied</h1>
        <p className="text-sm text-brand-ink/60 mb-6">{gateError}</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/login" })}
          className="rounded-full bg-brand-oxblood px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream"
        >
          Back to login
        </button>
      </div>
    );
  }

  const stats = query.data?.stats;

  return (
    <div className="min-h-screen">
      {/* Top content bar */}
      <div className="sticky top-0 z-20 border-b border-brand-ink/10 bg-[#f4efe6]/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-brand-gold font-semibold">
              Stage 1
            </p>
            <h1 className="font-serif text-2xl md:text-3xl italic text-brand-ink">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => query.refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-ink/15 bg-white px-3 py-2.5 text-xs font-medium text-brand-ink hover:bg-brand-cream transition-colors"
            >
              <RefreshCw className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              disabled={!query.data?.signups.length}
              onClick={() => query.data && downloadCsv(query.data.signups)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-oxblood px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-cream hover:bg-brand-gold transition-colors disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8 space-y-6">
        <p className="text-sm text-brand-ink/60 max-w-2xl">
          Pre-launch sign-ups from the Coming Soon page. Export anytime as CSV for email / SMS tools.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Total sign-ups", value: stats?.totalSignups ?? "—", hint: "All time" },
            { label: "Last 24 hours", value: stats?.last24h ?? "—", hint: "New today" },
            { label: "Last 7 days", value: stats?.last7d ?? "—", hint: "This week" },
            {
              label: "Marketing consent",
              value: stats?.marketingConsent ?? "—",
              hint: "Can be contacted",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-brand-ink/10 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(31,27,22,0.04)]"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-brand-ink/45 mb-3">
                {s.label}
              </p>
              <p className="font-serif text-3xl md:text-4xl italic text-brand-ink leading-none">
                {s.value}
              </p>
              <p className="mt-2 text-[11px] text-brand-ink/40">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* Signups table panel */}
        <section
          id="signups"
          className="rounded-xl border border-brand-ink/10 bg-white shadow-[0_1px_2px_rgba(31,27,22,0.04)] overflow-hidden scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-ink/10 px-4 md:px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-oxblood/10 text-brand-oxblood">
                <Users className="size-4" />
              </span>
              <div>
                <h2 className="font-serif text-xl italic text-brand-ink">Pre-launch list</h2>
                <p className="text-[11px] text-brand-ink/45">
                  {filtered.length} shown
                  {query.data ? ` · ${query.data.signups.length} total` : ""}
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-ink/35" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, mobile…"
                className="w-full rounded-lg border border-brand-ink/15 bg-[#faf7f2] py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-oxblood"
              />
            </div>
          </div>

          {query.isLoading ? (
            <p className="px-5 py-12 text-sm text-brand-ink/55">Loading sign-ups…</p>
          ) : query.isError ? (
            <div className="px-5 py-10 space-y-3">
              <p className="text-sm text-destructive font-medium">Could not load sign-ups.</p>
              <p className="text-sm text-brand-ink/60 leading-relaxed max-w-xl">
                The <code className="text-brand-oxblood">prelaunch_signups</code> table is missing
                in Supabase. Open the Supabase SQL Editor and run the migration file{" "}
                <code className="text-xs bg-brand-cream px-1.5 py-0.5 rounded">
                  20260907120000_prelaunch_signups.sql
                </code>
                , then click Refresh.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-12 text-sm text-brand-ink/55">
              No sign-ups yet. Once someone submits the Coming Soon form, they&apos;ll appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-[#faf7f2] text-[10px] uppercase tracking-[0.14em] text-brand-ink/50">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Mobile</th>
                    <th className="px-5 py-3 font-semibold">Consent</th>
                    <th className="px-5 py-3 font-semibold">Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-brand-ink/8 hover:bg-[#faf7f2]/70">
                      <td className="px-5 py-3.5 font-medium text-brand-ink">{r.full_name}</td>
                      <td className="px-5 py-3.5 text-brand-ink/75">{r.email}</td>
                      <td className="px-5 py-3.5 text-brand-ink/75 whitespace-nowrap">{r.mobile}</td>
                      <td className="px-5 py-3.5">
                        {r.marketing_consent ? (
                          <span className="inline-flex rounded-full bg-brand-oxblood/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-oxblood">
                            Yes
                          </span>
                        ) : (
                          <span className="text-brand-ink/35">No</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-brand-ink/55 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
