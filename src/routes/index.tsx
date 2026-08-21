import { createFileRoute, Link } from "@tanstack/react-router";
import { pastWinners, type Raffle } from "@/lib/raffle-data";
import { getLiveRaffles, getFeaturedRaffles } from "@/lib/raffles.functions";
import { useCountdown } from "@/lib/countdown";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=2400&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isobel's — Win Luxury Designer Handbags & Jewellery from £10" },
      {
        name: "description",
        content:
          "Enter weekly draws to win iconic designer handbags and jewellery. Multiple live draws every week. 5% of profits to charity.",
      },
      { property: "og:title", content: "Isobel's — Luxury Designer Draws" },
      {
        property: "og:description",
        content: "Multiple live luxury draws every week. 5% of profits to charity.",
      },
    ],
  }),
  loader: async (): Promise<{ featured: Raffle[]; live: Raffle[] }> => {
    const [featured, live] = await Promise.all([getFeaturedRaffles(), getLiveRaffles()]);
    return { featured: featured.length ? featured : live.slice(0, 3), live };
  },
  component: HomePage,
});

function HomePage() {
  const { featured, live } = Route.useLoaderData() as { featured: Raffle[]; live: Raffle[] };
  const nextDraw =
    [...live].sort(
      (a, b) => new Date(a.draw_date).getTime() - new Date(b.draw_date).getTime(),
    )[0] ?? featured[0];
  const heroImage = nextDraw?.hero_image_url || HERO_FALLBACK;
  const enterSearch = nextDraw ? { raffle: nextDraw.id } : {};

  return (
    <>
      <HeroSection
        drawDate={nextDraw?.draw_date}
        heroImage={heroImage}
        prizeLabel={nextDraw?.prize_short}
        enterSearch={enterSearch}
      />

      {live.length > 0 && (
        <section className="py-20 md:py-24 bg-brand-cream">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-2">
                  This week
                </p>
                <h2 className="font-serif text-4xl md:text-5xl italic text-brand-ink leading-[0.95]">
                  Live draws
                </h2>
              </div>
              <Link
                to="/raffle"
                className="text-xs uppercase tracking-widest border-b border-brand-ink pb-1 w-fit"
              >
                All Live Draws
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {live.slice(0, 3).map((r) => (
                <RaffleCard key={r.id} raffle={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-brand-ink mb-4">How Isobel's Works</h2>
            <p className="text-brand-ink/50 uppercase tracking-widest text-[11px]">
              Three steps to your next heirloom
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                n: "01",
                t: "Choose a draw",
                d: "Every week, a single exceptional luxury piece enters the draw — hand-sourced from the world's leading houses and independently authenticated. Pick the prize that calls to you. Every winner may choose to receive the piece itself or its full cash equivalent.",
              },
              {
                n: "02",
                t: "Choose how to enter",
                d: "Enter from £10 per ticket — the more tickets you hold, the greater your chances. Prefer not to purchase? Every Isobel's draw includes a completely free postal entry route, by law and by principle. Postal entries are limited to one entry per postcard sent. No purchase is ever necessary to win.",
              },
              {
                n: "03",
                t: "Await the draw",
                d: "When the draw closes, one winner is chosen at random and verified independently. Every entry holds a unique verifiable number — full transparency, always. The winner is notified by email and has their choice of the prize or its cash value. One name. One prize. No exceptions.",
              },
            ].map((s) => (
              <div key={s.n} className="space-y-4">
                <span className="font-serif text-3xl italic text-brand-gold">{s.n}</span>
                <h3 className="text-lg font-medium tracking-tight text-brand-ink">{s.t}</h3>
                <p className="text-sm text-brand-ink/70 leading-relaxed max-w-[40ch]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity strip */}
      <section className="bg-brand-ink text-brand-cream py-5">
        <div className="container mx-auto px-6 max-w-7xl flex justify-center text-center">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-medium">
            5% of all profits donated to charity · Charity partner announcing soon
          </p>
        </div>
      </section>

      {/* Past winners preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
            <div>
              <h2 className="font-serif text-4xl italic text-brand-ink">Recent Winners</h2>
              <p className="text-xs uppercase tracking-widest text-brand-ink/50 mt-2">
                Real prizes, real people
              </p>
            </div>
            <Link
              to="/winners"
              className="text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-ink pb-1 w-fit"
            >
              View Archive
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {pastWinners.map((w) => (
              <div key={w.id} className="space-y-4">
                <img
                  src={w.image}
                  alt={`Winner ${w.firstName} with ${w.prize}`}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full aspect-[4/5] object-cover outline-1 -outline-offset-1 outline-brand-ink/5"
                />
                <div>
                  <p className="font-serif text-xl italic text-brand-ink">{w.firstName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mt-1">
                    {w.prize}
                    {w.instagram ? ` · ${w.instagram}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function HeroSection({
  drawDate,
  heroImage,
  prizeLabel,
  enterSearch,
}: {
  drawDate?: string;
  heroImage: string;
  prizeLabel?: string;
  enterSearch: { raffle?: string };
}) {
  const countdownTarget =
    drawDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const c = useCountdown(countdownTarget);

  return (
    <section className="relative min-h-[min(92vh,920px)] flex flex-col overflow-hidden text-white">
      <div className="absolute inset-0 hero-bg-zoom" aria-hidden>
        <img
          src={heroImage}
          alt={prizeLabel ? `${prizeLabel} — this week's draw` : "Isobel's luxury draw"}
          className="h-full w-full object-cover"
          width={2400}
          height={1600}
          fetchPriority="high"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-16 text-center">
        <div className="hero-fade-in hero-fade-in-1 mb-8 md:mb-10">
          <div className="inline-flex flex-col items-center rounded-full bg-white px-6 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:px-8 sm:py-3.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-brand-ink/55 font-medium mb-1">
              Next draw in
            </p>
            <div
              className="flex items-end justify-center gap-1.5 sm:gap-2.5 font-sans text-brand-ink tabular-nums"
              aria-live="polite"
              aria-label={`Countdown ${c.days} days ${c.hours} hours ${c.minutes} minutes ${c.seconds} seconds`}
            >
              {(
                [
                  ["Days", c.pad(c.days)],
                  ["Hrs", c.pad(c.hours)],
                  ["Mins", c.pad(c.minutes)],
                  ["Secs", c.pad(c.seconds)],
                ] as const
              ).map(([label, value], i) => (
                <div key={label} className="flex items-end gap-1.5 sm:gap-2.5">
                  {i > 0 && (
                    <span className="pb-4 text-xl sm:text-2xl font-semibold text-brand-ink/35">
                      :
                    </span>
                  )}
                  <div className="min-w-[2.4rem] sm:min-w-[2.75rem]">
                    <p className="text-2xl sm:text-3xl font-bold leading-none tracking-tight">
                      {value}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-wider text-brand-ink/45">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="hero-fade-in hero-fade-in-2 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl italic tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] mb-4 md:mb-5">
          Isobel's
        </p>

        <h1 className="hero-fade-in hero-fade-in-3 font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)] max-w-3xl leading-[1.05]">
          Win luxury. Give back.
        </h1>

        <p className="hero-fade-in hero-fade-in-4 mt-4 md:mt-5 text-base sm:text-lg md:text-xl text-white/90 font-light max-w-xl drop-shadow-[0_1px_12px_rgba(0,0,0,0.25)]">
          Designer handbags, jewellery &amp; couture from £10
        </p>

        <div className="hero-fade-in hero-fade-in-5 mt-8 md:mt-10">
          <Link
            to="/enter"
            search={enterSearch}
            className="inline-flex items-center justify-center rounded-full bg-brand-cream px-10 py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-brand-ink shadow-[0_10px_28px_rgba(21,61,117,0.28)] transition-transform duration-300 hover:scale-[1.03] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Enter to win
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between px-5 sm:px-8 pb-6 sm:pb-8 pointer-events-none">
        <div className="hero-fade-in hero-fade-in-5 flex size-[4.5rem] sm:size-20 items-center justify-center rounded-full border border-white/70 text-center">
          <div className="px-2">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/90 leading-tight">
              5% to
            </p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-semibold text-white leading-tight mt-0.5">
              Charity
            </p>
          </div>
        </div>
        <div className="hero-fade-in hero-fade-in-5 text-right text-white/90">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">
            From £10
          </p>
          <p className="text-[9px] sm:text-[10px] tracking-wide text-white/70 mt-0.5">
            Free postal entry available
          </p>
        </div>
      </div>
    </section>
  );
}

function RaffleCard({ raffle }: { raffle: Raffle }) {
  const c = useCountdown(raffle.draw_date);
  return (
    <Link
      to="/raffle/$id"
      params={{ id: raffle.id }}
      className="group block bg-white border border-brand-taupe hover:border-brand-ink transition-colors"
    >
      <div className="relative">
        <img
          src={raffle.hero_image_url || HERO_FALLBACK}
          alt={raffle.prize_short}
          loading="lazy"
          width={800}
          height={1000}
          className="w-full aspect-[4/5] object-cover"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1 text-[10px] uppercase tracking-widest text-brand-ink font-bold">
          £{raffle.ticket_price}
        </div>
      </div>
      <div className="p-5 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">
          Draw {raffle.draw_number}
        </p>
        <h3 className="font-serif text-xl italic text-brand-ink leading-tight">
          {raffle.prize_name}
        </h3>
        <p className="text-[11px] text-brand-ink/60 font-mono">Closes in {c.short}</p>
      </div>
    </Link>
  );
}
