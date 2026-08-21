import { createFileRoute } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/enquiry-form";

export const Route = createFileRoute("/public-relations")({
  head: () => ({
    meta: [
      { title: "Public Relations — Isobel's" },
      {
        name: "description",
        content:
          "Press and media enquiries for Isobel's. Get in touch with our team and we'll be in touch shortly.",
      },
    ],
  }),
  component: PublicRelationsPage,
});

function PublicRelationsPage() {
  return (
    <section className="bg-brand-cream pt-20 md:pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
            Isobel's
          </p>
          <h1 className="font-serif italic text-5xl md:text-6xl text-brand-ink leading-[0.95] mb-8">
            Public Relations
          </h1>
          <div className="space-y-2 text-base text-brand-ink/70 leading-relaxed">
            <p>Do you have a press or media enquiry? We'd love to hear from you.</p>
            <p>Fill in this form and we'll get back to you as soon as possible.</p>
          </div>
        </div>
        <EnquiryForm kind="pr" submitLabel="Send Enquiry" />
      </div>
    </section>
  );
}
