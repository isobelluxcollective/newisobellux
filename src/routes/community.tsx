import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { pastWinners } from "@/lib/raffle-data";

const INSTAGRAM_HANDLE = "isobel";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const TAGGED_URL = `https://instagram.com/${INSTAGRAM_HANDLE}/tagged/`;

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Tagged on Instagram | Isobel's" },
      {
        name: "description",
        content:
          "See past winners and the Isobel's community shared on Instagram. Tag @isobel to be featured.",
      },
      { property: "og:title", content: "The Isobel's Community on Instagram" },
      {
        property: "og:description",
        content: "Tagged photos from past winners and the wider Isobel's community.",
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
  caption:
    w.instagram && i % 2 === 0
      ? `${w.instagram} · ${w.prize}`
      : `${w.firstName} · ${w.prize}`,
  href: w.instagram ? `https://instagram.com/${w.instagram.replace("@", "")}` : INSTAGRAM_URL,
}));

function CommunityPage() {
  return (
    <>
      <section className="bg-white pt-20 pb-16 border-b border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
            #Isobel'sMoments
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-brand-ink mb-6">
            Tagged on <em className="text-brand-gold">Instagram</em>
          </h1>
          <p className="text-sm md:text-base text-brand-ink/70 max-w-xl mx-auto leading-relaxed mb-8">
            A living gallery of the Isobel's community — past winners with their prizes
            and members styling their pieces. Tag{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand-ink underline underline-offset-4 hover:text-brand-gold"
            >
              @{INSTAGRAM_HANDLE}
            </a>{" "}
            to be featured.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brand-ink text-brand-cream px-8 py-3 rounded-full hover:bg-brand-gold transition-colors text-xs uppercase tracking-[0.2em] font-medium"
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
