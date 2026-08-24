import { Link } from "@tanstack/react-router";
import type { Raffle } from "@/lib/raffle-data";
import {
  SINGLE_PURCHASE_COPY,
  SUBSCRIPTION_COPY,
  tierFor,
  tierOrderFor,
  type TierId,
} from "@/lib/tiers";
import { cn } from "@/lib/utils";

function CheckIcon() {
  return (
    <span
      className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-oxblood text-white"
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
        <path
          d="M2.5 6.2 4.8 8.5 9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function TierGrid({
  raffle,
  mode,
  guest = false,
}: {
  raffle: Raffle;
  mode: "subscription" | "oneoff";
  guest?: boolean;
}) {
  const tiers = tierOrderFor(mode);
  const ctaClass =
    "mt-auto block w-full rounded-full bg-brand-oxblood py-3.5 text-center text-sm font-bold text-brand-cream shadow-sm transition-transform hover:scale-[1.02] hover:bg-brand-gold";

  return (
    <div className="space-y-8">
      <p className="mx-auto max-w-3xl text-center text-sm text-brand-ink/70 leading-relaxed px-2">
        {mode === "oneoff" ? SINGLE_PURCHASE_COPY : SUBSCRIPTION_COPY}
      </p>

      <div
        className={cn(
          "grid gap-6 lg:gap-8 mb-12 items-stretch",
          mode === "oneoff" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 max-w-3xl mx-auto",
        )}
      >
        {tiers.map((id) => {
          const t = tierFor(mode, id);
          const redirect = `/basket?raffle=${raffle.id}&plan=${id}&mode=${mode}&step=1`;
          const basketSearch = {
            raffle: raffle.id,
            plan: id,
            mode,
            step: 1 as const,
          };
          const isBestValue = mode === "oneoff" && id === "bundle12";

          return (
            <div
              key={id}
              className={cn(
                "relative flex flex-col rounded-2xl overflow-visible bg-white shadow-[0_8px_28px_rgba(94,36,48,0.12)]",
                isBestValue && "ring-[3px] ring-brand-oxblood",
              )}
            >
              {isBestValue && (
                <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-oxblood px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Best value
                </div>
              )}

              <div className="rounded-t-2xl bg-brand-oxblood px-5 pb-7 pt-8 text-center text-white">
                <p className="mb-2 text-lg font-bold text-brand-cream sm:text-xl">
                  {t.tickets} {t.tickets === 1 ? "Entry" : "Entries"}
                </p>
                <p className="leading-none">
                  <span className="text-3xl font-bold sm:text-4xl">£{t.price}</span>
                  <span className="text-sm font-semibold text-white/85">
                    {mode === "subscription" ? "/month" : ""}
                  </span>
                </p>
                <p className="mt-2 text-xs text-white/70">
                  {t.perEntry} per entry
                  {t.discount ? ` · ${t.discount}` : ""}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-5">
                <ul className="space-y-2.5 text-left text-sm text-brand-ink/80">
                  {mode === "subscription" ? (
                    <>
                      <li className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span>Cancel at any time</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span>Split entries across live draws each month</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span>Adjust allocation before each draw closes</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span>
                          {t.tickets} {t.tickets === 1 ? "entry" : "entries"} into this draw only
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span>Cannot be moved to other live draws</span>
                      </li>
                    </>
                  )}
                </ul>

                {guest ? (
                  <Link to="/auth" search={{ redirect, mode: "signup" }} className={ctaClass}>
                    Enter Now
                  </Link>
                ) : (
                  <Link to="/basket" search={basketSearch} className={ctaClass}>
                    Enter Now
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mode === "oneoff" && (
        <p className="text-center text-xs text-brand-ink/55 max-w-2xl mx-auto leading-relaxed">
          Single-purchase tickets apply to <strong>{raffle.prize_short}</strong> (Draw No.{" "}
          {raffle.draw_number}) only.
        </p>
      )}
    </div>
  );
}

export type { TierId };
