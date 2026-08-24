import { createFileRoute, Link } from "@tanstack/react-router";
import { getLiveRaffles } from "@/lib/raffles.functions";
import type { Raffle } from "@/lib/raffle-data";
import { useCountdown } from "@/lib/countdown";
import { CountdownPill } from "@/components/countdown-pill";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=2400&q=80";

export const Route = createFileRoute("/raffle")({
  head: () => ({
    meta: [
      { title: "Live Draws — Isobels" },
      { name: "description", content: "Browse every live luxury draw at Isobels." },
      { property: "og:title", content: "Live Draws — Isobels" },
      { property: "og:description", content: "All currently open luxury draws." },
    ],
  }),
  loader: async (): Promise<Raffle[]> => await getLiveRaffles(),
  component: RaffleListPage,
});

function RaffleListPage() {
  const raffles = Route.useLoaderData() as Raffle[];
  return (
    <section className="py-16 md:py-24 bg-brand-cream min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Open now
          </p>
          <h1 className="font-serif text-5xl md:text-6xl italic text-brand-ink">Live Draws</h1>
          <p className="text-sm text-brand-ink/60 mt-3">
            {raffles.length} {raffles.length === 1 ? "draw" : "draws"} currently open.
          </p>
        </div>
        {raffles.length === 0 ? (
          <p className="text-brand-ink/60 italic">No live draws right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {raffles.map((r) => (
              <Card key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Card({ r }: { r: Raffle }) {
  const c = useCountdown(r.draw_date);
  return (
    <div className="group block bg-white border border-brand-taupe hover:border-brand-ink transition-colors">
      <div className="relative overflow-hidden">
        <img
          src={r.hero_image_url || HERO_FALLBACK}
          alt={r.prize_short}
          loading="lazy"
          width={800}
          height={1000}
          className="w-full aspect-[4/5] object-cover"
        />
        <div className="absolute top-3 left-3 bg-white px-3.5 py-1.5 text-sm sm:text-base font-bold tracking-wide text-brand-ink shadow-sm z-10">
          From £5
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <CountdownPill countdown={c} size="sm" caption="Closes in" />
        </div>
        <div className="absolute inset-0 bg-brand-ink/45 opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 px-6 z-20">
          <Link
            to="/enter"
            search={{ raffle: r.id }}
            className="w-full max-w-[200px] text-center bg-brand-oxblood text-brand-cream px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-colors"
          >
            Enter Now
          </Link>
          <Link
            to="/raffle/$id"
            params={{ id: r.id }}
            className="w-full max-w-[200px] text-center border border-brand-cream text-brand-cream px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-cream hover:text-brand-ink transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
      <div className="p-5 space-y-2">
        <Link to="/raffle/$id" params={{ id: r.id }} className="block">
          <h3 className="font-serif text-xl italic font-bold text-brand-ink leading-tight">
            {r.prize_name}
          </h3>
        </Link>
        <Link
          to="/enter"
          search={{ postal: true }}
          className="block text-[10px] text-brand-ink/50 hover:text-brand-ink/70 underline underline-offset-2 transition-colors"
        >
          or free via postal entry
        </Link>
      </div>
    </div>
  );
}
