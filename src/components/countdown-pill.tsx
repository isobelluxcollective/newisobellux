import type { useCountdown } from "@/lib/countdown";

export function CountdownPill({
  countdown: c,
  size = "lg",
  caption,
}: {
  countdown: ReturnType<typeof useCountdown>;
  size?: "lg" | "sm";
  caption?: string;
}) {
  const isLg = size === "lg";
  return (
    <div
      className={`inline-flex flex-col items-center rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] ${
        isLg ? "px-6 py-3 sm:px-8 sm:py-3.5" : "px-3.5 py-2"
      }`}
    >
      {caption ? (
        <p
          className={`uppercase tracking-[0.18em] text-brand-ink/55 font-medium ${
            isLg ? "text-[10px] mb-1" : "text-[8px] mb-0.5"
          }`}
        >
          {caption}
        </p>
      ) : null}
      <div
        className={`flex items-end justify-center font-sans text-brand-ink tabular-nums ${
          isLg ? "gap-1.5 sm:gap-2.5" : "gap-1"
        }`}
        aria-live="polite"
        aria-label={`Countdown ${c.days} days ${c.hours} hours ${c.minutes} minutes ${c.seconds} seconds`}
      >
        {(
          [
            ["Days", c.pad(c.days)],
            ["Hrs", c.pad(c.hours)],
            ["Mins", c.pad(c.minutes)],
            ["Secs", c.pad(c.seconds)],
          ] as const
        ).map(([label, value], i) => (
          <div key={label} className={`flex items-end ${isLg ? "gap-1.5 sm:gap-2.5" : "gap-1"}`}>
            {i > 0 && (
              <span
                className={`font-semibold text-brand-ink/35 ${
                  isLg ? "pb-4 text-xl sm:text-2xl" : "pb-2.5 text-sm"
                }`}
              >
                :
              </span>
            )}
            <div className={isLg ? "min-w-[2.4rem] sm:min-w-[2.75rem]" : "min-w-[1.55rem]"}>
              <p
                className={`font-bold leading-none tracking-tight ${
                  isLg ? "text-2xl sm:text-3xl" : "text-base"
                }`}
              >
                {value}
              </p>
              <p
                className={`uppercase tracking-wider text-brand-ink/45 ${
                  isLg ? "mt-1 text-[9px]" : "mt-0.5 text-[7px]"
                }`}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
