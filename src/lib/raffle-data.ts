import winner1 from "@/assets/winner-1.jpg";
import winner2 from "@/assets/winner-2.jpg";
import winner3 from "@/assets/winner-3.jpg";
import winner4 from "@/assets/winner-4.jpg";

export type Raffle = {
  id: string;
  draw_number: string;
  title: string;
  italic: string;
  prize_name: string;
  prize_short: string;
  description: string;
  ticket_price: number;
  hero_image_url: string;
  draw_date: string;
  odds: string;
  retail_value: string;
  status: "draft" | "live" | "closed";
  featured: boolean;
  sort_order: number;
  winner_first_name: string | null;
  winner_city: string | null;
  winner_quote: string | null;
  winner_instagram: string | null;
  winner_image_url: string | null;
};

export type Winner = {
  id: string;
  firstName: string;
  city: string;
  prize: string;
  drawNumber: string;
  drawDate: string;
  image: string;
  instagram: string | null;
  quote: string;
};

export const pastWinners: Winner[] = [
  {
    id: "041",
    firstName: "Sophia",
    city: "London",
    prize: "Chanel Classic Flap, Medium",
    drawNumber: "041",
    drawDate: "May 2026",
    image: winner1,
    instagram: "@sophia_v",
    quote:
      "I never thought I'd own a Chanel. I burst into tears when the email arrived.",
  },
  {
    id: "040",
    firstName: "Eleanor",
    city: "Bath",
    prize: "Cartier Love Bracelet, Yellow Gold",
    drawNumber: "040",
    drawDate: "April 2026",
    image: winner2,
    instagram: null,
    quote: "A gift to myself I never would have made. It hasn't left my wrist.",
  },
  {
    id: "039",
    firstName: "Isabella",
    city: "Chelsea",
    prize: "Lady Dior Mini, Rose Poudre",
    drawNumber: "039",
    drawDate: "March 2026",
    image: winner3,
    instagram: "@isa_styles",
    quote: "Isobel's is the loveliest little community. The bag is just the start.",
  },
  {
    id: "038",
    firstName: "Grace",
    city: "Edinburgh",
    prize: "Van Cleef Alhambra Pendant",
    drawNumber: "038",
    drawDate: "February 2026",
    image: winner4,
    instagram: null,
    quote: "Absolutely magical. I still can't quite believe it.",
  },
];

export const subscriptionTiers = [
  { id: "10", price: 10, entries: 12, label: "The Collector" },
  { id: "25", price: 25, entries: 30, label: "The Aficionado", popular: true },
  { id: "50", price: 50, entries: 60, label: "The Icon" },
] as const;

export const postalAddress = {
  line1: "Free Postal Entry",
  line2: "Isobel's Draws",
  line3: "[Company Address]",
  line4: "[City]",
  line5: "[Postcode]",
};
