import { createFileRoute } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/enquiry-form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Isobels" },
      {
        name: "description",
        content:
          "Get in touch with Isobels. Have a question about a draw, your account, or anything else? We're here to help.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="bg-brand-cream pt-20 md:pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-6">
            Isobels
          </p>
          <h1 className="font-serif italic text-5xl md:text-6xl text-brand-ink leading-[0.95] mb-8">
            Contact Us
          </h1>
          <div className="space-y-2 text-base text-brand-ink/70 leading-relaxed">
            <p>Have a question about a draw, your account, or anything else? We're here to help.</p>
            <p>Fill in this form and we'll get back to you as soon as possible.</p>
          </div>
        </div>
        <EnquiryForm kind="contact" submitLabel="Send Message" />
      </div>
    </section>
  );
}
