import { faqs } from "@/lib/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection({
  id,
  showHeading = true,
  className = "py-24 bg-white",
}: {
  id?: string;
  showHeading?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className="container mx-auto px-6 max-w-5xl lg:max-w-6xl">
        {showHeading ? (
          <div className="mb-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
              Questions
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-ink mb-3">
              You might be wondering...
            </h2>
          </div>
        ) : null}

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className="border-0 overflow-hidden rounded-2xl border border-black/10 bg-white px-6 md:px-8 shadow-none"
            >
              <AccordionTrigger className="py-6 text-lg sm:text-xl md:text-2xl font-bold text-brand-ink hover:no-underline [&[data-state=open]>svg]:rotate-180 [&>svg]:size-5 md:[&>svg]:size-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-0 text-base sm:text-lg md:text-xl font-serif italic text-brand-ink/70 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
