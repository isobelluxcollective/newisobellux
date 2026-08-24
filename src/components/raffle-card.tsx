import { Link } from "@tanstack/react-router";
import type { Raffle } from "@/lib/raffle-data";
import { useCountdown } from "@/lib/countdown";
import { CountdownPill } from "@/components/countdown-pill";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=2400&q=80";

export function RaffleCard({ raffle }: { raffle: Raffle }) {
  const c = useCountdown(raffle.draw_date);
  return (
    <Link
      to="/raffle/$id"
      params={{ id: raffle.id }}
      className="group block bg-white border border-brand-taupe hover:border-brand-ink transition-colors"
    >
      <div className="relative">
        <img
          src={raffle.hero_image_url || HERO_FALLBACK}
          alt={raffle.prize_short}
          loading="lazy"
          width={800}
          height={1000}
          className="w-full aspect-[4/5] object-cover"
        />
        <div className="absolute top-3 left-3 bg-white px-3.5 py-1.5 text-sm sm:text-base font-bold tracking-wide text-brand-ink shadow-sm">
          From £5
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <CountdownPill countdown={c} size="sm" caption="Closes in" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl italic font-bold text-brand-ink leading-tight">
          {raffle.prize_name}
        </h3>
      </div>
    </Link>
  );
}
