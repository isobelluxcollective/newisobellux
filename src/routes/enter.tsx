import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { postalAddress, type Raffle } from "@/lib/raffle-data";
import { getRaffleById, getLiveRaffles } from "@/lib/raffles.functions";
import {
  getMembersData,
  getDrawTicketInfo,
  enterDrawWithTickets,
  getSavedPaymentMethod,
} from "@/lib/entries.functions";
import { useAuth } from "@/hooks/use-auth";
import { StripeEmbeddedCheckout } from "@/components/stripe-embedded-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { getStripeEnvironment } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { TierGrid } from "@/components/tier-grid";
import {
  type TierId,
  tierFor,
} from "@/lib/tiers";

const searchSchema = z.object({
  raffle: z.string().uuid().optional(),
  plan: z.enum(["bundle1", "bundle3", "bundle6", "bundle12", "sub6", "sub14", "postal"]).optional(),
  mode: z.enum(["subscription", "oneoff", "tickets"]).optional(),
  confirm: z.coerce.boolean().optional(),
  error: z.enum(["payment_failed"]).optional(),
});

export const Route = createFileRoute("/enter")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ raffle: search.raffle }),
  loader: async ({ deps }): Promise<{ raffle: Raffle | null; live: Raffle[] }> => {
    if (deps.raffle) {
      const r = await getRaffleById({ data: { id: deps.raffle } });
      if (!r) throw notFound();
      return { raffle: r, live: [] };
    }
    const live = await getLiveRaffles();
    return { raffle: null, live };
  },
  head: () => ({
    meta: [
      { title: "Enter a Draw — Isobels" },
      { name: "description", content: "Choose a luxury draw and enter from £5." },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-serif text-3xl italic">Draw not found</p>
      <Link to="/raffle" className="text-xs uppercase tracking-widest underline mt-4 inline-block">
        Back to live draws
      </Link>
    </div>
  ),
  component: EnterPage,
});

function EnterPage() {
  const { raffle: loadedRaffle, live } = Route.useLoaderData();
  const search = Route.useSearch();
  const { user, loading: authLoading, signOut } = useAuth();

  // If no raffle in the URL, use the first live draw so "Enter to win" lands on the plan boxes.
  const raffle = loadedRaffle ?? live[0] ?? null;

  if (!raffle) {
    return (
      <section className="bg-brand-cream py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-brand-ink mb-4">
            No live draws right now
          </h1>
          <p className="text-sm text-brand-ink/60 mb-8">
            New draws are announced soon. Check back shortly.
          </p>
          <Link
            to="/raffle"
            className="inline-block text-xs uppercase tracking-widest border-b border-brand-ink pb-1"
          >
            View draws
          </Link>
        </div>
      </section>
    );
  }

  if (authLoading) {
    return (
      <section className="bg-brand-cream py-20 min-h-[60vh]">
        <div className="container mx-auto px-6 text-center text-sm text-brand-ink/60">Loading…</div>
      </section>
    );
  }

  // FLOW A — not logged in: show the pricing/postal tabs, redirect to /auth on tier select
  if (!user) {
    return <FlowAGuest raffle={raffle} errorParam={search.error} />;
  }

  // FLOW B — logged in
  const firstName =
    (user.user_metadata?.first_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "";

  return (
    <FlowBLoggedIn
      raffle={raffle}
      firstName={firstName}
      plan={search.plan}
      mode={search.mode}
      confirm={!!search.confirm}
      errorParam={search.error}
      onSignOut={signOut}
    />
  );
}

/* ------------------------------- FLOW A (guest) ------------------------------- */

type Tab = "subscription" | "oneoff" | "postal";

function FlowAGuest({ raffle, errorParam }: { raffle: Raffle; errorParam?: "payment_failed" }) {
  const [tab, setTab] = useState<Tab>("subscription");

  return (
    <>
      <PaymentTestModeBanner />
      {errorParam === "payment_failed" && <PaymentFailedBanner />}
      <section className="bg-white pt-16 pb-12 border-b border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
            Draw No. {raffle.draw_number}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-ink mb-4">Enter the Draw</h1>
          <p className="text-sm text-brand-ink/60 max-w-xl mx-auto">
            Win the <em>{raffle.prize_short}</em>. Choose how you'd like to enter.
          </p>
          <p className="text-xs text-brand-ink/50 mt-2">
            Winner's choice: claim the piece or its cash value.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-brand-taupe">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-center gap-8 sm:gap-14 mb-10 border-b border-black/10">
            {[
              { id: "postal", label: "Postal", sub: "No purchase necessary" },
              { id: "oneoff", label: "Single Purchase", sub: "From £5" },
              { id: "subscription", label: "Subscription", sub: "Best value" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as Tab)}
                className={cn(
                  "relative pb-4 pt-1 text-center transition-colors min-w-[5.5rem] sm:min-w-[7rem]",
                  tab === t.id ? "text-brand-ink" : "text-brand-ink/45 hover:text-brand-ink/70",
                )}
              >
                <span className="block text-sm sm:text-base font-semibold">{t.label}</span>
                <span className="hidden sm:block text-[10px] mt-0.5 opacity-70">{t.sub}</span>
                {tab === t.id && (
                  <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-brand-ink" />
                )}
              </button>
            ))}
          </div>

          {tab === "postal" && <PostalPanel raffle={raffle} />}
          {tab === "oneoff" && (
            <>
              <h2 className="text-center text-2xl sm:text-3xl font-bold text-brand-ink mb-10">
                Single Purchase
              </h2>
              <TierGrid raffle={raffle} mode="oneoff" guest />
            </>
          )}
          {tab === "subscription" && (
            <>
              <h2 className="text-center text-2xl sm:text-3xl font-bold text-brand-ink mb-10">
                Monthly Subscriptions
              </h2>
              <TierGrid raffle={raffle} mode="subscription" guest />
            </>
          )}
        </div>
      </section>
    </>
  );
}

function PostalPanel({ raffle }: { raffle: Raffle }) {
  return (
    <div className="bg-white border border-brand-taupe p-10 md:p-14 max-w-2xl mx-auto">
      <span className="text-[10px] uppercase tracking-widest text-brand-gold block mb-4">
        Free Postal Entry
      </span>
      <h3 className="font-serif text-3xl italic mb-6">Maximum one entry per postcard</h3>
      <p className="text-sm text-brand-ink/70 leading-relaxed mb-8">
        Isobels offers a free alternative means of entering every draw. To enter by post, write or
        type the following details on a blank sheet of paper or postcard:
      </p>
      <div className="border-l-2 border-brand-gold pl-6 mb-8">
        <ul className="text-sm space-y-1.5 text-brand-ink/80">
          <li>· Your full legal name</li>
          <li>· Your full address (no PO Box addresses accepted)</li>
          <li>· Your city and postcode</li>
          <li>· Your telephone number (optional)</li>
          <li>· Your email address</li>
          <li>
            · The name and number of the draw you wish to enter (e.g. "Isobels Draw —{" "}
            <em>{raffle.prize_name}</em>, Draw No. {raffle.draw_number}")
          </li>
        </ul>
      </div>
      <div className="bg-brand-cream p-6">
        <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-3">Post your entry to</p>
        <address className="not-italic text-sm text-brand-ink/90 leading-relaxed font-medium">
          {postalAddress.line2}<br />
          {postalAddress.line3}<br />
          {postalAddress.line4}<br />
          {postalAddress.line5}
        </address>
      </div>
      <p className="text-xs text-brand-ink/50 mt-6 leading-relaxed">
        Please note: a maximum of one entry is accepted per postcard or sheet of paper sent.
        Multiple entries on a single postcard will not be accepted. Postal entries are processed
        manually and will appear in your Members Portal within 5 working days of receipt. By
        entering by post you agree to our Terms and Conditions. No purchase is necessary to enter
        and postal entrants have an equal chance of winning.
      </p>
    </div>
  );
}

/* ------------------------------ FLOW B (logged in) ----------------------------- */

function FlowBLoggedIn({
  raffle,
  firstName,
  plan,
  mode,
  confirm,
  errorParam,
  onSignOut,
}: {
  raffle: Raffle;
  firstName: string;
  plan?: TierId | "postal";
  mode?: "subscription" | "oneoff" | "tickets";
  confirm: boolean;
  errorParam?: "payment_failed";
  onSignOut: () => Promise<unknown>;
}) {
  const { session } = useAuth();
  const authReady = typeof window !== "undefined" && !!session?.access_token;
  const fetchMembers = useServerFn(getMembersData);
  const membersQuery = useQuery({
    queryKey: ["members-data"],
    queryFn: () => fetchMembers(),
    enabled: authReady,
  });

  const balance = membersQuery.data?.profile?.ticket_balance ?? 0;
  const expiry = membersQuery.data?.profile?.ticket_expiry ?? null;

  return (
    <>
      <PaymentTestModeBanner />
      {errorParam === "payment_failed" && <PaymentFailedBanner />}
      <section className="bg-white pt-12 pb-8 border-b border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-[11px] text-brand-ink/50 mb-6">
            Entering as <span className="text-brand-ink/80">{firstName}</span>
            {" · "}
            Not you?{" "}
            <button
              type="button"
              onClick={() => onSignOut()}
              className="underline underline-offset-2 hover:text-brand-ink transition-colors"
            >
              Log out
            </button>
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
            Draw No. {raffle.draw_number}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-ink mb-3">
            {confirm ? "Confirm your entry" : "Enter the Draw"}
          </h1>
          <p className="text-sm text-brand-ink/60 max-w-xl mx-auto">
            Win the <em>{raffle.prize_short}</em>.
          </p>
          <p className="text-xs text-brand-ink/50 mt-2">
            Winner's choice: claim the piece or its cash value.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-brand-taupe">
        <div className="container mx-auto px-6 max-w-6xl">
          {confirm && plan && mode ? (
            <div className="max-w-3xl mx-auto">
              <ConfirmationCard raffle={raffle} plan={plan} mode={mode} />
            </div>
          ) : (
            <ChooseEntryOption raffle={raffle} balance={balance} expiry={expiry} />
          )}
        </div>
      </section>
    </>
  );
}

function ChooseEntryOption({
  raffle,
  balance,
  expiry,
}: {
  raffle: Raffle;
  balance: number;
  expiry: string | null;
}) {
  const [tab, setTab] = useState<"subscription" | "oneoff">("subscription");
  const expiryStr = expiry
    ? new Date(expiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="space-y-10">
      {balance > 0 && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-brand-taupe bg-white p-8 md:p-10 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-semibold mb-3">
            Use Subscription Tickets
          </p>
          <h3 className="font-serif text-2xl italic text-brand-ink mb-2">
            You have {balance} ticket{balance === 1 ? "" : "s"} remaining
          </h3>
          {expiryStr && <p className="text-xs text-brand-ink/60 mb-6">Expires {expiryStr}</p>}
          <Link
            to="/members/allocate"
            className="inline-block rounded-full bg-brand-ink px-8 py-3.5 text-sm font-bold text-brand-cream hover:brightness-95 transition-[filter]"
          >
            Allocate my tickets
          </Link>
        </div>
      )}

      <div className="flex justify-center gap-10 sm:gap-14 border-b border-black/10">
        {(
          [
            { id: "oneoff" as const, label: "Single Purchase" },
            { id: "subscription" as const, label: "Subscription" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "relative pb-4 text-sm sm:text-base font-semibold transition-colors",
              tab === t.id ? "text-brand-ink" : "text-brand-ink/45 hover:text-brand-ink/70",
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-brand-ink" />
            )}
          </button>
        ))}
      </div>

      <h2 className="text-center text-2xl sm:text-3xl font-bold text-brand-ink">
        {tab === "subscription" ? "Monthly Subscriptions" : "Single Purchase"}
      </h2>

      <TierGrid raffle={raffle} mode={tab} />
    </div>
  );
}

function isPurchasableTier(plan: string): plan is TierId {
  return (
    plan === "bundle1" ||
    plan === "bundle3" ||
    plan === "bundle6" ||
    plan === "bundle12" ||
    plan === "sub6" ||
    plan === "sub14"
  );
}

function ConfirmationCard({
  raffle,
  plan,
  mode,
}: {
  raffle: Raffle;
  plan: TierId | "postal";
  mode: "subscription" | "oneoff" | "tickets";
}) {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const authReady = typeof window !== "undefined" && !!session?.access_token;
  const tier =
    isPurchasableTier(plan) && mode !== "tickets"
      ? tierFor(mode === "subscription" ? "subscription" : "oneoff", plan)
      : null;

  // Saved card lookup (oneoff only)
  const fetchPm = useServerFn(getSavedPaymentMethod);
  const pmQuery = useQuery({
    queryKey: ["saved-pm"],
    queryFn: () => fetchPm({ data: { environment: getStripeEnvironment() } }),
    enabled: authReady && mode === "oneoff",
  });

  // Ticket cap check (tickets mode)
  const fetchInfo = useServerFn(getDrawTicketInfo);
  const ticketsToSpend = mode === "tickets" ? 1 : 0;
  const infoQuery = useQuery({
    queryKey: ["draw-info", raffle.id],
    queryFn: () => fetchInfo({ data: { raffleId: raffle.id } }),
    enabled: authReady && mode === "tickets",
  });

  const enterFn = useServerFn(enterDrawWithTickets);
  const enterMutation = useMutation({
    mutationFn: () => enterFn({ data: { raffleId: raffle.id, tickets: ticketsToSpend } }),
    onSuccess: () => navigate({ to: "/members", search: { welcome: 1 } as any }),
  });

  const [showCheckout, setShowCheckout] = useState(false);

  const remaining = infoQuery.data?.remaining_for_user ?? 0;
  const maxPerUser = infoQuery.data?.max_per_user ?? 0;
  const overCap = mode === "tickets" && infoQuery.data && remaining < ticketsToSpend;

  function handleConfirm() {
    if (mode === "tickets") {
      enterMutation.mutate();
    } else {
      setShowCheckout(true);
    }
  }

  if (showCheckout && tier) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-brand-taupe p-6 md:p-8">
          <h3 className="font-serif text-2xl italic text-brand-ink mb-1">Secure checkout</h3>
          <p className="text-xs text-brand-ink/60">
            {tier.label} — £{tier.price} · {tier.tickets} tickets
          </p>
        </div>
        <StripeEmbeddedCheckout
          priceId={tier.priceId}
          customerEmail={user?.email ?? undefined}
          userId={user?.id}
          raffleId={mode === "oneoff" ? raffle.id : undefined}
          checkoutMode={mode === "subscription" ? "subscription" : "oneoff"}
          returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&raffle=${raffle.id}&mode=${mode}`}
        />
        <button
          type="button"
          onClick={() => setShowCheckout(false)}
          className="mt-2 text-xs uppercase tracking-widest text-brand-ink/50 hover:text-brand-ink"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-taupe p-8 md:p-12 max-w-xl mx-auto">
      <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-semibold mb-3 text-center">
        Draw No. {raffle.draw_number}
      </p>
      <h3 className="font-serif text-2xl italic text-brand-ink mb-6 text-center">
        {raffle.prize_name}
      </h3>

      <dl className="space-y-3 border-y border-brand-ink/10 py-6 mb-6">
        <Row
          label="Option"
          value={
            mode === "tickets"
              ? `Use ${ticketsToSpend} subscription ticket${ticketsToSpend === 1 ? "" : "s"}`
              : `${tier?.label ?? plan} pack — ${tier?.tickets ?? 0} tickets`
          }
        />
        <Row
          label="Total"
          value={mode === "tickets" ? "£0.00" : `£${tier?.price.toFixed(2) ?? "0.00"}`}
        />
        {mode === "oneoff" && (
          <Row
            label="Payment method"
            value={
              pmQuery.isLoading
                ? "Loading…"
                : pmQuery.data
                  ? `${capitalise(pmQuery.data.brand)} ···· ${pmQuery.data.last4}`
                  : "No saved card — enter at checkout"
            }
            trailing={
              pmQuery.data ? (
                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  className="text-[10px] uppercase tracking-widest underline text-brand-ink/60 hover:text-brand-ink"
                >
                  Change
                </button>
              ) : undefined
            }
          />
        )}
        {mode === "tickets" && infoQuery.data && (
          <Row
            label="Cap"
            value={`Max ${maxPerUser} tickets per user in this draw (you have ${infoQuery.data.user_existing} entered)`}
          />
        )}
      </dl>

      {overCap && (
        <p className="text-xs text-destructive text-center mb-4">
          You can enter a maximum of {maxPerUser} tickets into this draw.
        </p>
      )}

      {enterMutation.isError && (
        <p className="text-xs text-destructive text-center mb-4">
          {enterMutation.error instanceof Error
            ? enterMutation.error.message.startsWith("TICKET_CAP_EXCEEDED")
              ? `You can enter a maximum of ${enterMutation.error.message.split(":")[1] || ""} tickets into this draw.`
              : enterMutation.error.message === "INSUFFICIENT_BALANCE"
                ? "You don't have enough tickets. Top up below."
                : "Could not complete entry. Please try again."
            : "Could not complete entry. Please try again."}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!!overCap || enterMutation.isPending || (mode === "tickets" && infoQuery.isLoading)}
        className="w-full bg-brand-ink text-brand-cream py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-colors disabled:opacity-60"
      >
        {enterMutation.isPending ? "Confirming…" : "Confirm Entry"}
      </button>

      <div className="text-center mt-4">
        <Link
          to="/raffle/$id"
          params={{ id: raffle.id }}
          className="text-[11px] text-brand-ink/50 hover:text-brand-ink underline underline-offset-2"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-brand-ink/50 pt-1">{label}</dt>
      <dd className="text-sm text-brand-ink text-right flex-1">
        {value}
        {trailing && <span className="ml-3 inline-block">{trailing}</span>}
      </dd>
    </div>
  );
}

function PaymentFailedBanner() {
  return (
    <div className="bg-brand-cream border-b border-brand-taupe">
      <div className="container mx-auto px-6 py-3 text-center text-xs text-brand-ink/60">
        Your payment was not completed. Please try again.
      </div>
    </div>
  );
}

function capitalise(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
