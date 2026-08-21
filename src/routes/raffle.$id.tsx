import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getRaffleById } from "@/lib/raffles.functions";
import type { Raffle } from "@/lib/raffle-data";
import { useCountdown } from "@/lib/countdown";

export const Route = createFileRoute("/raffle/$id")({
  head: ({ loaderData }) => {
    const r = loaderData as Raffle | undefined;
    const title = r ? `${r.prize_name} — Isobel's` : "Draw — Isobel's";
    const desc = r
      ? `Enter to win a ${r.prize_short}. Tickets from £${r.ticket_price}.`
      : "Isobel's luxury draw.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(r?.hero_image_url ? [{ property: "og:image", content: r.hero_image_url }] : []),
      ],
    };
  },
  loader: async ({ params }): Promise<Raffle> => {
    const r = await getRaffleById({ data: { id: params.id } });
    if (!r) throw notFound();
    return r;
  },
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <p className="font-serif text-3xl italic">Draw not found</p>
      <Link to="/raffle" className="text-xs uppercase tracking-widest underline mt-4 inline-block">
        Back to live draws
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="py-24 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: RaffleDetailPage,
});

function RaffleDetailPage() {
  const r = Route.useLoaderData() as Raffle;
  const c = useCountdown(r.draw_date);
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        <img
          src={r.hero_image_url || "/hero-prize.jpg"}
          alt={r.prize_short}
          width={1080}
          height={1350}
          className="w-full aspect-[4/5] object-cover outline-1 -outline-offset-1 outline-brand-ink/5"
        />
        <div className="space-y-8 md:sticky md:top-24">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold">
            Draw No. {r.draw_number}
            {r.status === "closed" ? " · Closed" : " · Live"}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-brand-ink">
            {r.prize_name}
          </h1>
          <p className="text-base text-brand-ink/70 leading-relaxed max-w-prose">{r.description}</p>
          <p className="text-xs text-brand-ink/50 italic -mt-4">
            The winner may choose to receive this piece or its full cash value equivalent.
          </p>

          <dl className="grid grid-cols-2 gap-6 border-t border-b border-brand-ink/10 py-6">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-brand-ink/50">Retail value</dt>
              <dd className="font-serif text-2xl italic mt-1">{r.retail_value || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-brand-ink/50">Per ticket</dt>
              <dd className="font-serif text-2xl italic mt-1">£{r.ticket_price}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-brand-ink/50">Closes in</dt>
              <dd className="font-mono text-sm mt-2">{c.display}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-brand-ink/50">Odds</dt>
              <dd className="text-sm mt-2">{r.odds || "—"}</dd>
            </div>
          </dl>

          {r.status === "live" ? (
            <Link
              to="/enter"
              search={{ raffle: r.id }}
              className="block text-center bg-brand-ink text-brand-cream px-10 py-5 text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-colors"
            >
              Enter Now
            </Link>
          ) : (
            <p className="text-sm text-brand-ink/60 italic">This draw has closed.</p>
          )}
        </div>
      </div>
    </section>
  );
}
