import { createFileRoute, Link } from "@tanstack/react-router";
import { pastWinners, type Raffle } from "@/lib/raffle-data";
import { getLiveRaffles, getFeaturedRaffles } from "@/lib/raffles.functions";
import { useCountdown } from "@/lib/countdown";
import { CountdownPill } from "@/components/countdown-pill";
import { RaffleCard } from "@/components/raffle-card";
import { FaqSection } from "@/components/faq-section";
import { WinnersCarousel } from "@/components/winners-carousel";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=2400&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isobels — Win Luxury Designer Handbags & Jewellery" },
      {
        name: "description",
        content:
          "Enter live draws to win iconic designer handbags and jewellery, independently authenticated, from £5",
      },
      { property: "og:title", content: "Isobels — Luxury Designer Draws" },
      {
        property: "og:description",
        content:
          "Enter live draws to win iconic designer handbags and jewellery, independently authenticated, from £5",
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
          <div className="container mx-auto px-6 max-w-7xl text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-2">
              This week
            </p>
            <h2 className="font-serif text-4xl md:text-5xl italic text-brand-ink leading-[0.95] mb-6">
              Live draws
            </h2>
            <Link
              to="/raffle"
              className="inline-block text-xs uppercase tracking-widest border-b border-brand-ink pb-1 mb-12"
            >
              All Live Draws
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left">
              {live.slice(0, 3).map((r) => (
                <RaffleCard key={r.id} raffle={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent winners — before How it Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="font-serif text-4xl italic text-brand-ink">Recent Winners</h2>
          <Link
            to="/winners"
            className="inline-block mt-6 mb-12 text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-ink pb-1"
          >
            View Archive
          </Link>

          <WinnersCarousel winners={pastWinners} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="font-serif text-4xl text-brand-ink mb-4">How Isobels Works</h2>
          <p className="text-brand-ink/50 uppercase tracking-widest text-[11px] mb-16">
            Three steps to your next heirloom
          </p>
          <div className="rounded-sm border border-brand-ink/15 bg-[#F5EBE0] p-8 md:p-12 lg:p-14 text-left md:text-center">
            <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
              {[
                {
                  n: "01",
                  t: "Choose a draw",
                  d: "Every draw features a single exceptional luxury piece, hand sourced from the world's leading houses and independently authenticated. Browse our current draws and choose the piece that calls to you. Every winner can choose to receive the piece itself or its full cash equivalent.",
                },
                {
                  n: "02",
                  t: "Choose how to enter",
                  d: "Enter from £5 per ticket; the more tickets you hold, the greater your chances. Prefer not to purchase? Every Isobels draw also includes a free postal entry route. This is required under UK prize draw regulations, and it reflects something we believe in: no one should be locked out of the chance to win. Postal entries are limited to one entry per postcard.",
                },
                {
                  n: "03",
                  t: "Await the draw",
                  d: "When the draw closes, one winner is chosen at random and verified independently. Every entry carries its own unique, verifiable number, so the process is fully transparent. The winner is notified by email and may choose the prize or its cash equivalent. One name. One prize. No exceptions.",
                },
              ].map((s) => (
                <div key={s.n} className="space-y-4">
                  <span className="font-serif text-3xl italic text-brand-gold">{s.n}</span>
                  <h3 className="text-lg font-medium tracking-tight text-brand-ink">{s.t}</h3>
                  <p className="text-sm text-brand-ink/70 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FaqSection id="faqs" />
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
          alt={prizeLabel ? `${prizeLabel} — this week's draw` : "Isobels luxury draw"}
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
          <CountdownPill countdown={c} size="lg" caption="Next draw in" />
        </div>

        <div className="hero-fade-in hero-fade-in-2 mb-3 md:mb-4">
          <p className="inline-block rounded-md bg-[#F8F0E6]/95 px-5 py-2 sm:px-7 sm:py-2.5 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic tracking-tight text-brand-ink shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
            Isobels
          </p>
        </div>

        <h1 className="hero-fade-in hero-fade-in-3">
          <span className="inline-block rounded-md bg-[#F8F0E6]/95 px-5 py-2.5 sm:px-7 sm:py-3 font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-brand-ink shadow-[0_4px_24px_rgba(0,0,0,0.12)] max-w-3xl leading-[1.15]">
            Your dream luxury, within reach.
          </span>
        </h1>

        <p className="hero-fade-in hero-fade-in-4 mt-5 md:mt-6 text-base sm:text-lg md:text-xl text-white/95 italic font-light max-w-xl drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
          Designer handbags, jewellery &amp; couture from £5
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

        <div className="hero-fade-in hero-fade-in-5 mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold text-brand-ink shadow-sm">
            From £5
          </span>
          <span className="rounded-full bg-white/95 px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold text-brand-ink shadow-sm">
            Free postal entry available
          </span>
        </div>
      </div>
    </section>
  );
}
