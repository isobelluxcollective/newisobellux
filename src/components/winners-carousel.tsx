import type { Winner } from "@/lib/raffle-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function WinnersCarousel({ winners }: { winners: Winner[] }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {winners.map((w) => (
            <CarouselItem key={w.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className="space-y-4 text-center">
                <img
                  src={w.image}
                  alt={`Winner ${w.firstName} with ${w.prize}`}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="mx-auto w-full aspect-[4/5] object-cover outline-1 -outline-offset-1 outline-brand-ink/5"
                />
                <div>
                  <p className="font-serif text-xl md:text-2xl italic text-brand-ink">{w.firstName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mt-2">
                    {w.prize}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 sm:-left-10 md:-left-14 lg:-left-20 border-brand-ink/20 bg-white hover:bg-brand-cream size-10" />
        <CarouselNext className="right-0 sm:-right-10 md:-right-14 lg:-right-20 border-brand-ink/20 bg-white hover:bg-brand-cream size-10" />
      </Carousel>
    </div>
  );
}
