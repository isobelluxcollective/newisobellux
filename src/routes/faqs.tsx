import { createFileRoute } from "@tanstack/react-router";
import { FaqSection } from "@/components/faq-section";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Isobels" },
      {
        name: "description",
        content:
          "Answers to common questions about Isobels luxury draws — odds, authentication, trust, and how winners are chosen.",
      },
      { property: "og:title", content: "FAQs — Isobels" },
      {
        property: "og:description",
        content: "Everything you need to know about entering and winning with Isobels.",
      },
    ],
  }),
  component: FaqsPage,
});

function FaqsPage() {
  return (
    <section className="bg-brand-cream pt-20 md:pt-28 pb-8">
      <div className="container mx-auto px-6 max-w-5xl lg:max-w-6xl text-center mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
          Isobels
        </p>
        <h1 className="font-serif italic text-5xl md:text-6xl text-brand-ink leading-[0.95]">
          FAQs
        </h1>
      </div>
      <FaqSection showHeading={false} className="pb-24 bg-brand-cream" />
    </section>
  );
}
