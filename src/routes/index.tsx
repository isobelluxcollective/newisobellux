import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gift, Instagram, Sparkles, Ticket } from "lucide-react";
import { FaqSection } from "@/components/faq-section";
import { PrelaunchSignupDialog } from "@/components/prelaunch-signup-dialog";
import { prelaunchFaqs } from "@/lib/prelaunch-faqs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isobels — Coming Soon" },
      {
        name: "description",
        content:
          "Isobels is coming soon. Our first draw features a prize valued at over £10,000. Sign up for the chance to receive free pre-launch tickets.",
      },
      { property: "og:title", content: "Isobels — Coming Soon" },
      {
        property: "og:description",
        content:
          "Sign up now to be first to hear about our first drop — prize valued at over £10,000 — and get access to our pre-launch ticket giveaway.",
      },
    ],
  }),
  component: LaunchHomePage,
});

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.6 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.64-.04Z" />
    </svg>
  );
}

const howItWorks = [
  {
    n: "01",
    t: "Choose a draw",
    d: "Every draw features a single exceptional luxury piece, hand sourced from the world's leading houses and independently authenticated. Browse our current draws and choose the piece that calls to you. Every winner can choose to receive the piece itself or its full cash equivalent.",
    Icon: Sparkles,
  },
  {
    n: "02",
    t: "Choose how to enter",
    d: "Enter from £5 per ticket; the more tickets you hold, the greater your chances. Prefer not to purchase? Every Isobels draw also includes a free postal entry route. This is required under UK prize draw regulations, and it reflects something we believe in: no one should be locked out of the chance to win. Postal entries are limited to one entry per postcard.",
    Icon: Ticket,
  },
  {
    n: "03",
    t: "Await the draw",
    d: "When the draw closes, one winner is chosen at random and verified independently. Every entry carries its own unique, verifiable number, so the process is fully transparent. The winner is notified by email and may choose the prize or its cash equivalent. One name. One prize. No exceptions.",
    Icon: Gift,
  },
];

function LaunchHomePage() {
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <>
      <PrelaunchSignupDialog open={signupOpen} onOpenChange={setSignupOpen} />

      {/* Hero: Coming Soon + first draw teaser */}
      <section className="relative overflow-hidden bg-brand-ink text-brand-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #c9a86f 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, #5e2430 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <div className="relative container mx-auto px-6 max-w-4xl py-20 md:py-28 lg:py-32 text-center">
          <p className="inline-block mb-8 rounded-full border border-brand-gold/50 bg-brand-gold/10 px-5 py-2 text-[10px] sm:text-xs uppercase tracking-[0.28em] font-semibold text-brand-gold">
            Coming Soon
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic leading-[0.95] mb-6">
            Isobels — Coming Soon
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-brand-cream/85 max-w-2xl mx-auto leading-relaxed mb-4">
            Our first draw is coming soon, featuring a prize valued at over £10,000.
          </p>
          <p className="text-sm sm:text-base text-brand-cream/65 max-w-xl mx-auto leading-relaxed mb-10">
            Sign up now to be the first to hear about the drop, and get access to our pre-launch
            ticket giveaway.
          </p>
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-brand-oxblood px-8 sm:px-10 py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-cream shadow-[0_12px_32px_rgba(94,36,48,0.45)] transition-transform duration-300 hover:scale-[1.03] hover:bg-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
          >
            Sign up for our first drop.
          </button>
        </div>
      </section>

      {/* Pre-launch free-ticket offer */}
      <section className="bg-brand-cream py-14 md:py-16 border-b border-brand-ink/5">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="font-serif text-2xl sm:text-3xl italic text-brand-ink leading-snug">
            Sign up today for the chance to receive free tickets to our first draw. Good luck.
          </p>
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="mt-8 inline-flex rounded-full border border-brand-oxblood px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold text-brand-oxblood hover:bg-brand-oxblood hover:text-brand-cream transition-colors"
          >
            Join the list
          </button>
        </div>
      </section>

      {/* Short Isobels introduction */}
      <section className="bg-white py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
            About Isobels
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-brand-ink leading-[0.95] mb-6">
            Luxury, within reach
          </h2>
          <p className="text-base sm:text-lg text-brand-ink/70 leading-relaxed">
            Isobels is a prize draw for women who love exceptional handbags and jewellery. Each draw
            features a single, independently authenticated piece from the world&apos;s leading houses —
            and every winner can choose the prize itself or its full cash equivalent. Our aim is for
            every woman to own their dream luxury accessory.
          </p>
        </div>
      </section>

      {/* Visual How It Works */}
      <section className="bg-brand-cream py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="font-serif text-4xl text-brand-ink mb-4">How Isobels Works</h2>
          <p className="text-brand-ink/50 uppercase tracking-widest text-[11px] mb-14">
            Three steps to your next heirloom
          </p>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 text-left">
            {howItWorks.map((s) => (
              <div
                key={s.n}
                className="rounded-sm border border-brand-ink/10 bg-white p-8 space-y-4"
              >
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-brand-oxblood/10 text-brand-oxblood">
                  <s.Icon className="size-5" strokeWidth={1.5} />
                </div>
                <span className="block font-serif text-2xl italic text-brand-gold">{s.n}</span>
                <h3 className="text-lg font-medium tracking-tight text-brand-ink">{s.t}</h3>
                <p className="text-sm text-brand-ink/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expanded FAQ */}
      <FaqSection
        id="faqs"
        items={prelaunchFaqs}
        className="py-20 md:py-24 bg-white"
      />

      {/* Social / footer CTA strip */}
      <section className="bg-brand-ink text-brand-cream py-16 md:py-20">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl italic mb-4">Stay close</h2>
          <p className="text-sm text-brand-cream/65 mb-8 leading-relaxed">
            Follow along for launch updates — and sign up so you never miss the first drop.
          </p>
          <div className="flex items-center justify-center gap-5 mb-10">
            <a
              href="https://www.instagram.com/isobelluxcollective"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Isobels on Instagram"
              className="text-brand-cream/70 hover:text-brand-gold transition-colors"
            >
              <Instagram className="size-6" />
            </a>
            <a
              href="https://www.tiktok.com/@isobelmarysalter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Isobels on TikTok"
              className="text-brand-cream/70 hover:text-brand-gold transition-colors"
            >
              <TikTokIcon className="size-6" />
            </a>
          </div>
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="inline-flex rounded-full bg-brand-oxblood px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream hover:bg-brand-gold transition-colors"
          >
            Sign up for our first drop.
          </button>
          <p className="mt-10 text-[11px] text-brand-cream/40">
            <a href="/privacy" className="underline underline-offset-2 hover:text-brand-cream/70">
              Privacy Policy
            </a>
            {" · "}
            <a href="/cookies" className="underline underline-offset-2 hover:text-brand-cream/70">
              Cookie Policy
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
