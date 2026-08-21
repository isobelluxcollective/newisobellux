import { createFileRoute, Link } from "@tanstack/react-router";
import { pastWinners } from "@/lib/raffle-data";

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "Past Winners — Isobel's Draws" },
      {
        name: "description",
        content:
          "See the women who've won iconic designer pieces with Isobel's — Chanel, Cartier, Dior, Van Cleef and more.",
      },
      { property: "og:title", content: "Past Winners — Isobel's" },
      {
        property: "og:description",
        content: "Real women, real luxury wins. Browse the Isobel's winners archive.",
      },
    ],
  }),
  component: WinnersPage,
});

function WinnersPage() {
  return (
    <>
      <section className="bg-white pt-20 md:pt-28 pb-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
            Real prizes · Real people
          </p>
          <h1 className="font-serif text-5xl md:text-7xl italic text-brand-ink leading-[0.95] mb-6">
            Past Winners
          </h1>
          <p className="text-base text-brand-ink/70 leading-relaxed">
            A small archive of the women who've taken home an Isobel's prize. With their permission,
            we share their first names and Instagram handles.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-brand-cream">
        <div className="container mx-auto px-6 max-w-7xl space-y-20">
          {pastWinners.map((w, i) => (
            <article
              key={w.id}
              className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <img
                  src={w.image}
                  alt={`Winner ${w.firstName} with ${w.prize}`}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full aspect-[4/5] object-cover outline-1 -outline-offset-1 outline-brand-ink/5"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-brand-ink/50">
                  <span>Draw {w.drawNumber}</span>
                  <span className="size-1 rounded-full bg-brand-ink/30" />
                  <span>{w.drawDate}</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl italic text-brand-ink">
                  {w.firstName}, <span className="text-brand-ink/60">{w.city}</span>
                </h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-gold font-semibold">
                  Won: {w.prize}
                </p>
                <blockquote className="border-l-2 border-brand-gold pl-6 text-lg italic text-brand-ink/80 leading-relaxed max-w-prose">
                  "{w.quote}"
                </blockquote>
                {w.instagram && (
                  <p className="text-xs text-brand-ink/50">
                    Follow {w.firstName} on Instagram:{" "}
                    <span className="text-brand-ink">{w.instagram}</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white text-center border-t border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-ink mb-4">
            Your name could be next.
          </h2>
          <p className="text-sm text-brand-ink/60 mb-8">
            The current draw closes soon. Enter from £10 or subscribe for the best value.
          </p>
          <Link
            to="/enter"
            className="inline-block bg-brand-ink text-brand-cream px-10 py-5 text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-colors"
          >
            Enter the Current Draw
          </Link>
        </div>
      </section>
    </>
  );
}
