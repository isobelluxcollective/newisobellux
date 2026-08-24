import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { pastWinners } from "@/lib/raffle-data";

const INSTAGRAM_HANDLE = "isobelluxcollective";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const TAGGED_URL = `https://instagram.com/${INSTAGRAM_HANDLE}/tagged/`;

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Tagged on Instagram | Isobels" },
      {
        name: "description",
        content:
          "See past winners and the Isobels community shared on Instagram. Tag @isobelluxcollective to be featured.",
      },
      { property: "og:title", content: "The Isobels Community on Instagram" },
      {
        property: "og:description",
        content: "Tagged photos from past winners and the wider Isobels community.",
      },
    ],
  }),
  component: CommunityPage,
});

// Curated grid — repeats winner imagery as placeholders until the
// Instagram Graph API is wired up (requires a Business account + long-lived token).
const feedItems = [
  ...pastWinners,
  ...pastWinners,
  ...pastWinners,
].slice(0, 12).map((w, i) => ({
  id: `${w.id}-${i}`,
  image: w.image,
  caption: `${w.firstName} · ${w.prize}`,
  href: INSTAGRAM_URL,
}));

function CommunityPage() {
  return (
    <>
      <section className="bg-white pt-20 pb-16 border-b border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-6xl text-brand-ink mb-6">
            Community
          </h1>
          <p className="text-sm md:text-base text-brand-ink/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Isobels isn&apos;t just about winning. It&apos;s about being part of something. Every
            week, our community shares what happens after the draw: the reveal, the reaction, the
            moment a bag or bracelet they never imagined winning becomes theirs. Tag{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand-ink underline underline-offset-4 hover:text-brand-gold"
            >
              @{INSTAGRAM_HANDLE}
            </a>{" "}
            on Instagram or TikTok, and you might see yourself featured right here. This is where
            our winners become part of the story, not just the result. Follow along, share your
            entry, and be part of the next win.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brand-oxblood text-brand-cream px-8 py-3 rounded-full hover:bg-brand-gold transition-colors text-xs uppercase tracking-[0.2em] font-medium"
          >
            <Instagram className="size-4" />
            Follow @{INSTAGRAM_HANDLE}
          </a>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-brand-cream">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {feedItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden bg-brand-ink/5"
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/60 transition-colors duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Instagram className="size-4 text-brand-cream mb-2" />
                    <p className="text-[11px] text-brand-cream tracking-wide">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={TAGGED_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs uppercase tracking-[0.25em] font-bold border-b border-brand-ink pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors"
            >
              View All Tagged Photos on Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
