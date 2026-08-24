import { createFileRoute, Link } from "@tanstack/react-router";
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
              Growing up, Isobel had an eye for the extraordinary — the kind of pieces that
              stopped you in your tracks in a boutique window. The Hermès Kelly. The Chanel Classic
              Flap. The Cartier Love Bracelet. She didn&apos;t just admire them. She understood them —
              the craft, the heritage, the meaning behind owning something built to outlast a
              lifetime.
            </p>
            <p>
              But like most women, she watched those pieces remain just out of reach. Not because
              she didn&apos;t work hard enough. Not because she didn&apos;t deserve them. Simply because
              the world of luxury had always been built for the few.
            </p>
            <p>
              Isobels exists to change that. Each draw sources a single, independently authenticated
              luxury piece from the world&apos;s leading houses, then opens it up to everyone from £5
              a ticket. One beautiful object. One winner. A real chance.
            </p>
            <p>
              Every entry carries a unique, verifiable number. Every draw is independently overseen.
              And every draw includes a free postal entry route, because no one should be locked
              out of the chance to win.
            </p>
            <p>
              Isobel is the face and heart of everything we do. You&apos;ll find her introducing every
              draw on our social media — sharing the story of each piece, where it came from, why
              it matters, and why you should have a chance to own it.
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

      {/* Section 3 — Winners */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
            Our Winners
          </p>
          <h2 className="font-serif text-4xl md:text-5xl italic text-brand-ink mb-8">
            Every draw creates a winner.
          </h2>
          <p className="text-base text-brand-ink/70 leading-relaxed max-w-2xl mx-auto">
            But what it also creates is a community of people who believe in the same thing — that
            beautiful things should be for everyone. Our winners aren't just lucky. They're
            members. They entered, they believed, and it happened. We celebrate every single one.
          </p>
          <div className="mt-10">
            <Link
              to="/community"
              className="inline-block border border-brand-ink text-brand-ink px-10 py-4 text-xs uppercase tracking-widest font-bold rounded-full hover:bg-brand-ink hover:text-brand-cream transition-colors"
            >
              Meet Our Winners
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
