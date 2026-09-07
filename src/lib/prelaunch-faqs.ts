import { faqs as existingFaqs } from "@/lib/faqs";

/** Stage 1 pre-launch FAQs: 4 new questions first, then the existing 4. */
export const prelaunchFaqs = [
  {
    q: "When is the first draw?",
    a: "Our first draw is coming soon. We're not announcing the exact date yet — sign up to our pre-launch list and we'll let you know the moment it goes live.",
  },
  {
    q: "Is this legal in the UK?",
    a: "Yes. Isobels operates as a prize draw, not a lottery, and includes a free postal entry route so no purchase is ever necessary to win. This keeps every draw compliant with UK prize draw law.",
  },
  {
    q: "Will you do more draws?",
    a: "Yes. Our first draw is just the beginning — once Isobels launches, new draws will follow regularly, each featuring a different exceptional piece.",
  },
  {
    q: "Can I take cash instead of the physical prize?",
    a: "Yes. Every winner can choose to receive the piece itself or its full cash equivalent.",
  },
  ...existingFaqs,
] as const;
