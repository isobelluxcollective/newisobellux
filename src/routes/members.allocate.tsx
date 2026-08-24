import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { allocateSubscriptionTickets, getMembersData } from "@/lib/entries.functions";
import { getLiveRaffles } from "@/lib/raffles.functions";
import type { Raffle } from "@/lib/raffle-data";

export const Route = createFileRoute("/members/allocate")({
  validateSearch: (search: Record<string, unknown>) => ({
    welcome: search.welcome === 1 || search.welcome === "1" ? 1 : undefined,
  }),
  loader: async (): Promise<Raffle[]> => getLiveRaffles(),
  head: () => ({
    meta: [
      { title: "Allocate Entries — Isobels" },
      { name: "description", content: "Split your monthly subscription entries across live draws." },
    ],
  }),
  component: AllocatePage,
});

function AllocatePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { welcome } = Route.useSearch();
  const liveDraws = Route.useLoaderData() as Raffle[];
  const fetchMembers = useServerFn(getMembersData);
  const allocateFn = useServerFn(allocateSubscriptionTickets);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: "/members/allocate" } });
    }
  }, [loading, user, navigate]);

  const membersQuery = useQuery({
    queryKey: ["members-data"],
    queryFn: () => fetchMembers(),
    enabled: !!user,
  });

  const balance = membersQuery.data?.profile?.ticket_balance ?? 0;
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!liveDraws.length) return;
    setAllocations((prev) => {
      if (Object.keys(prev).length) return prev;
      const even = Math.floor(balance / liveDraws.length);
      const next: Record<string, number> = {};
      liveDraws.forEach((r, i) => {
        next[r.id] = i === 0 ? balance - even * (liveDraws.length - 1) : even;
      });
      return next;
    });
  }, [liveDraws, balance]);

  const allocatedTotal = useMemo(
    () => Object.values(allocations).reduce((sum, n) => sum + (Number(n) || 0), 0),
    [allocations],
  );

  const mutation = useMutation({
    mutationFn: () =>
      allocateFn({
        data: {
          allocations: liveDraws.map((r) => ({
            raffleId: r.id,
            tickets: Number(allocations[r.id] ?? 0),
          })),
        },
      }),
    onSuccess: () => navigate({ to: "/members", search: { welcome: 1 } as any }),
  });

  if (loading || !user) {
    return (
      <section className="bg-brand-cream py-20 min-h-[60vh]">
        <div className="container mx-auto px-6 text-center text-sm text-brand-ink/60">Loading…</div>
      </section>
    );
  }

  return (
    <section className="bg-brand-cream py-16 md:py-20 min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Subscription
          </p>
          <h1 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-4">
            Allocate your entries
          </h1>
          <p className="text-sm text-brand-ink/70 max-w-xl mx-auto leading-relaxed">
            Split your monthly entries across all currently live draws — up to three at a time.
            Adjust anytime before a draw closes.
          </p>
        </div>

        {welcome === 1 && (
          <div className="mb-8 bg-brand-oxblood text-brand-cream px-6 py-4 text-sm text-center rounded-sm">
            Payment received. Choose how to split your {balance} entries below.
          </div>
        )}

        {balance <= 0 ? (
          <div className="bg-white border border-brand-taupe p-10 text-center">
            <p className="text-sm text-brand-ink/70 mb-6">
              You don&apos;t have any subscription entries to allocate right now.
            </p>
            <Link
              to="/enter"
              className="inline-block rounded-full bg-brand-oxblood px-8 py-3 text-xs uppercase tracking-widest font-bold text-brand-cream hover:bg-brand-gold transition-colors"
            >
              View entry options
            </Link>
          </div>
        ) : liveDraws.length === 0 ? (
          <div className="bg-white border border-brand-taupe p-10 text-center text-sm text-brand-ink/70">
            No live draws are open yet. Your {balance} entries will stay on your account until draws
            go live.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-sm bg-white border border-brand-taupe px-5 py-4">
              <span className="text-sm text-brand-ink/70">Entries to allocate</span>
              <span className="font-bold text-brand-ink">{balance}</span>
            </div>

            <ul className="space-y-4">
              {liveDraws.map((draw) => (
                <li
                  key={draw.id}
                  className="bg-white border border-brand-taupe p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1">
                      Draw {draw.draw_number}
                    </p>
                    <p className="font-serif italic text-lg text-brand-ink">{draw.prize_name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label htmlFor={`alloc-${draw.id}`} className="text-xs uppercase tracking-widest text-brand-ink/50">
                      Entries
                    </label>
                    <input
                      id={`alloc-${draw.id}`}
                      type="number"
                      min={0}
                      max={balance}
                      value={allocations[draw.id] ?? 0}
                      onChange={(e) =>
                        setAllocations((prev) => ({
                          ...prev,
                          [draw.id]: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-20 border border-brand-ink/20 rounded px-3 py-2 text-center text-sm"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between text-sm px-1">
              <span className={allocatedTotal === balance ? "text-brand-ink" : "text-destructive"}>
                Allocated: {allocatedTotal} / {balance}
              </span>
              {allocatedTotal !== balance && (
                <span className="text-destructive text-xs">Total must equal your allowance</span>
              )}
            </div>

            {mutation.isError && (
              <p className="text-xs text-destructive text-center">
                {mutation.error instanceof Error
                  ? mutation.error.message.startsWith("TICKET_CAP_EXCEEDED")
                    ? `One or more draws exceed the per-user ticket cap.`
                    : mutation.error.message
                  : "Could not save allocation. Please try again."}
              </p>
            )}

            <button
              type="button"
              disabled={allocatedTotal !== balance || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="w-full rounded-full bg-brand-oxblood py-4 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream hover:bg-brand-gold transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Saving…" : "Confirm allocation"}
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            to="/members"
            className="text-xs uppercase tracking-widest text-brand-ink/60 hover:text-brand-ink underline underline-offset-4"
          >
            Back to My Account
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs text-brand-ink/50 hover:text-brand-ink underline underline-offset-4"
          >
            Log out
          </button>
        </div>
      </div>
    </section>
  );
}
