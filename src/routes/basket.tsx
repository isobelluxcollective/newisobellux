import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import type { Raffle } from "@/lib/raffle-data";
import { getRaffleById } from "@/lib/raffles.functions";
import { tierFor, type TierId } from "@/lib/tiers";
import { cn } from "@/lib/utils";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";

const searchSchema = z.object({
  raffle: z.string().uuid(),
  plan: z.enum(["collector", "aficionado", "icon"]),
  mode: z.enum(["subscription", "oneoff"]),
  step: z.coerce.number().int().min(1).max(2).default(1),
});

export const Route = createFileRoute("/basket")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ raffle: search.raffle }),
  loader: async ({ deps }): Promise<Raffle> => {
    const r = await getRaffleById({ data: { id: deps.raffle } });
    if (!r) throw notFound();
    return r;
  },
  head: () => ({
    meta: [
      { title: "Your Basket — Isobel's" },
      { name: "description", content: "Review your Isobel's draw entry before checkout." },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-serif text-3xl italic">Draw not found</p>
      <Link to="/enter" className="text-xs uppercase tracking-widest underline mt-4 inline-block">
        Back to enter
      </Link>
    </div>
  ),
  component: BasketPage,
});

const STEPS = [
  { n: 1, label: "Your Draw" },
  { n: 2, label: "Summary" },
] as const;

function BasketPage() {
  const raffle = Route.useLoaderData();
  const { plan, mode, step } = Route.useSearch();
  const tier = tierFor(mode, plan as TierId);
  const currentStep = step === 2 ? 2 : 1;

  return (
    <>
      <PaymentTestModeBanner />
      <section className="bg-brand-taupe min-h-[70vh] pb-20">
        <div className="container mx-auto px-6 max-w-3xl pt-10 md:pt-14">
          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-ink mb-10">
            Your Basket
          </h1>

          <BasketStepper current={currentStep} plan={plan} mode={mode} raffleId={raffle.id} />

          {currentStep === 1 ? (
            <StepOneDraw raffle={raffle} plan={plan} mode={mode} tier={tier} />
          ) : (
            <StepTwoSummary raffle={raffle} plan={plan} mode={mode} tier={tier} />
          )}
        </div>
      </section>
    </>
  );
}

function BasketStepper({
  current,
  plan,
  mode,
  raffleId,
}: {
  current: 1 | 2;
  plan: string;
  mode: "subscription" | "oneoff";
  raffleId: string;
}) {
  return (
    <nav aria-label="Basket progress" className="mb-10 md:mb-12">
      <ol className="relative mx-auto flex max-w-md items-start justify-between">
        <div
          className="absolute left-[16%] right-[16%] top-4 h-px bg-[#cfcfcf]"
          aria-hidden
        />
        {STEPS.map((s) => {
          const done = current > s.n;
          const active = current === s.n;
          const searchable = {
            raffle: raffleId,
            plan: plan as TierId,
            mode,
            step: s.n as 1 | 2,
          };
          return (
            <li key={s.n} className="relative z-10 flex w-28 flex-col items-center text-center">
              {s.n < current ? (
                <Link
                  to="/basket"
                  search={searchable}
                  className="flex size-8 items-center justify-center rounded-full bg-brand-ink text-sm font-bold text-brand-cream"
                  aria-label={`Go to step ${s.n}: ${s.label}`}
                >
                  {s.n}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                    active
                      ? "bg-brand-ink text-brand-cream"
                      : "border border-[#cfcfcf] bg-white text-[#9a9a9a]",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {s.n}
                </span>
              )}
              <span
                className={cn(
                  "mt-2 text-xs font-semibold",
                  active || done ? "text-brand-ink" : "text-[#9a9a9a]",
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepOneDraw({
  raffle,
  plan,
  mode,
  tier,
}: {
  raffle: Raffle;
  plan: TierId;
  mode: "subscription" | "oneoff";
  tier: ReturnType<typeof tierFor>;
}) {
  return (
    <div className="space-y-6">
      <BasketItemCard raffle={raffle} mode={mode} tier={tier} />

      <Link
        to="/basket"
        search={{ raffle: raffle.id, plan, mode, step: 2 }}
        className="block w-full rounded-full bg-brand-ink py-4 text-center text-base font-bold text-brand-cream shadow-sm transition-[filter] hover:brightness-95"
      >
        Next
      </Link>

      <Link
        to="/enter"
        search={{ raffle: raffle.id }}
        className="block text-center text-sm text-brand-ink hover:underline"
      >
        &lt; Continue shopping
      </Link>
    </div>
  );
}

function StepTwoSummary({
  raffle,
  plan,
  mode,
  tier,
}: {
  raffle: Raffle;
  plan: TierId;
  mode: "subscription" | "oneoff";
  tier: ReturnType<typeof tierFor>;
}) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
        <div className="border-b border-[#eee] px-5 py-4 sm:px-6">
          <p className="text-lg font-bold text-brand-ink">Order summary</p>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <SummaryRow
            title="Luxury Draw"
            detail={`${raffle.prize_name} · Draw No. ${raffle.draw_number}`}
            meta={`${tier.tickets} entries`}
            price={
              mode === "subscription" ? `£${tier.price}/month` : `£${tier.price}`
            }
          />
          <SummaryRow
            title={`${tier.label} pack`}
            detail={
              mode === "subscription"
                ? "Monthly subscription — cancel anytime"
                : "One-time ticket pack"
            }
            meta={tier.label}
            price={
              mode === "subscription" ? `£${tier.price}/month` : `£${tier.price}`
            }
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#eee] bg-[#fafafa] px-5 py-4 sm:px-6">
          <span className="text-sm font-semibold text-brand-ink">Total</span>
          <span className="text-lg font-bold text-brand-ink">
            £{tier.price}
            {mode === "subscription" ? (
              <span className="text-sm font-semibold">/month</span>
            ) : null}
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-[#444] leading-relaxed px-2">
        {mode === "subscription" ? (
          <>
            When your subscription renews each month, you&apos;ll get{" "}
            <strong>{tier.tickets} entries</strong> into Isobel&apos;s live luxury draws.
          </>
        ) : (
          <>
            You&apos;ll receive <strong>{tier.tickets} entries</strong> to use across Isobel&apos;s
            live luxury draws.
          </>
        )}
      </p>

      <Link
        to="/enter"
        search={{ raffle: raffle.id, plan, mode, confirm: true }}
        className="block w-full rounded-full bg-brand-ink py-4 text-center text-base font-bold text-brand-cream shadow-sm transition-[filter] hover:brightness-95"
      >
        Checkout
      </Link>

      <Link
        to="/basket"
        search={{ raffle: raffle.id, plan, mode, step: 1 }}
        className="block text-center text-sm text-brand-ink hover:underline"
      >
        &lt; Back to your draw
      </Link>

      <p className="pt-4 text-center text-[11px] leading-relaxed text-[#777] max-w-xl mx-auto">
        Isobel&apos;s draws are open to UK residents aged 18+. No purchase necessary — a free postal
        entry route is available. 5% of profits are donated to charity. Winner may choose the prize
        or its cash equivalent.
      </p>
    </div>
  );
}

function BasketItemCard({
  raffle,
  mode,
  tier,
}: {
  raffle: Raffle;
  mode: "subscription" | "oneoff";
  tier: ReturnType<typeof tierFor>;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
      <div className="relative">
        <img
          src={
            raffle.hero_image_url ||
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1600&q=80"
          }
          alt={raffle.prize_short}
          className="h-48 w-full object-cover sm:h-56"
          width={1200}
          height={640}
        />
        <span className="absolute right-3 top-3 rounded bg-brand-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-cream">
          Luxury Draw
        </span>
      </div>

      <div className="space-y-3 px-5 py-5 sm:px-6">
        <h2 className="text-xl font-bold uppercase tracking-tight text-brand-ink sm:text-2xl">
          {raffle.prize_name}
        </h2>
        <p className="text-sm text-[#555]">
          Draw No. {raffle.draw_number}
          {raffle.retail_value ? ` · RRP ${raffle.retail_value}` : ""}
        </p>
        <p className="text-base font-bold text-brand-ink">
          Total: £{tier.price}
          {mode === "subscription" ? "/month" : ""}
        </p>
        <p className="text-sm font-semibold text-brand-ink">
          {tier.tickets} Entries into the {raffle.prize_short} Draw
        </p>

        <div className="rounded-lg bg-[#fde8ef] px-4 py-3 text-sm leading-snug text-[#2a2a2a]">
          <span className="font-bold text-brand-ink">BONUS: </span>
          5% of profits donated to charity with every entry. Winner&apos;s choice of the piece or
          cash equivalent.
        </div>
      </div>
    </article>
  );
}

function SummaryRow({
  title,
  detail,
  meta,
  price,
}: {
  title: string;
  detail: string;
  meta: string;
  price: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-bold text-brand-ink">{title}</p>
        <p className="text-sm text-[#666] mt-0.5">{detail}</p>
        <p className="text-xs font-semibold text-brand-ink mt-1">{meta}</p>
      </div>
      <p className="shrink-0 font-bold text-brand-ink">{price}</p>
    </div>
  );
}
