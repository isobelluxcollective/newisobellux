import { createFileRoute } from "@tanstack/react-router";
import aboutCraft from "@/assets/about-craft.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Isobels — Luxury Designer Draws" },
      {
        name: "description",
        content:
          "Isobels makes iconic designer handbags and jewellery accessible through independently authenticated luxury draws, from £5.",
      },
      { property: "og:title", content: "About Isobels" },
      {
        property: "og:description",
        content: "Luxury designer draws for women. Independently authenticated pieces from £5.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      {/* Section 1 — Founder Story */}
      <section className="bg-white pt-20 md:pt-28 pb-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
            Our Story
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-brand-ink leading-[0.95] mb-8">
            Luxury, <em>shared</em>.
          </h1>
          <p className="text-lg text-brand-ink/70 max-w-2xl mx-auto leading-relaxed italic font-serif">
            "Some women are born knowing exactly what they want. Isobel was one of them."
          </p>
        </div>
      </section>

      <section className="pb-20 md:pb-28 bg-white">
        <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <img
            src={aboutCraft}
            alt="Detail of luxury leather craftsmanship"
            loading="lazy"
            width={1280}
            height={900}
            className="w-full aspect-[4/3] object-cover outline-1 -outline-offset-1 outline-brand-ink/5"
          />
          <div className="space-y-5 text-brand-ink/70 leading-relaxed text-base">
            <p>
              Isobel has always had an eye for the extraordinary: the kind of pieces that stop you
              in your tracks in a boutique window. The Hermès Kelly. The Chanel Classic Flap. The
              Cartier Love Bracelet. She didn&apos;t just admire them. She understood them, the
              craft, the heritage, the meaning behind owning something built to outlast a lifetime.
            </p>
            <p>
              But like most, she watched those pieces stay just out of reach. Not because she
              hadn&apos;t worked hard enough, and not because she didn&apos;t deserve them. Simply
              because luxury had always been built for the few.
            </p>
            <p className="font-medium text-brand-ink">What if that changed?</p>
            <p>
              Isobels: not just a business, but a belief. That the most beautiful things in the
              world shouldn&apos;t be reserved for the wealthiest handful, and that everyone who
              has ever pressed their face to a boutique window and walked away deserves a real
              chance.
            </p>
            <p>
              Each draw, we source and independently authenticate a single exceptional piece from
              the world&apos;s leading luxury houses, from Chanel to Cartier, and open it up to
              everyone, from just £5 a ticket. One winner. One extraordinary piece. Every draw runs
              with complete transparency, every entry carries its own verifiable number, and a free
              postal entry route means no purchase is ever necessary to take part.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — How Isobels Works */}
      <section id="how-it-works" className="py-24 bg-brand-ink text-brand-cream scroll-mt-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
              How It Works
            </p>
            <h2 className="font-serif text-4xl md:text-5xl italic mb-8">
              One piece. One winner. Every time.
            </h2>
            <div className="space-y-5 text-base text-brand-cream/70 leading-relaxed text-left md:text-center">
              <p>
                Isobels is a prize draw company. We source a single, exceptional luxury item —
                authenticated, pristine, and hand-selected from the world's leading houses. We
                open a draw. Members enter using tickets. One winner is chosen at random, verified
                independently, and the prize is theirs.
              </p>
              <p>
                Every winner chooses how to claim — take the piece itself, or its full cash
                equivalent. The choice is always yours.
              </p>
              <p>
                No bundles. No compromise pieces. One beautiful object, one fortunate winner,
                every draw.
              </p>
              <p>
                Every draw includes a free postal entry route — because fairness isn't just good
                ethics, it's the law. Every entry is assigned a verifiable number and every draw
                is independently overseen.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mt-20">
            {[
              {
                t: "Authenticated",
                d: "Every piece is sourced from authorised boutiques and verified by an independent authentication partner before the draw.",
              },
              {
                t: "Transparent",
                d: "Single prize, single winner, one draw at a time. Every entry assigned a verifiable number.",
              },
              {
                t: "Fair",
                d: "A free postal entry route on every draw, by law and by principle. No purchase necessary.",
              },
            ].map((v) => (
              <div key={v.t} className="space-y-3">
                <h3 className="font-serif text-2xl italic text-brand-cream">{v.t}</h3>
                <p className="text-sm text-brand-cream/70 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
