import { useEffect, useState } from "react";

export function useCountdown(targetISO: string) {
  const target = new Date(targetISO).getTime();
  const [now, setNow] = useState(target);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    days,
    hours,
    minutes,
    seconds,
    pad,
    display: `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
    short: `${pad(days)}:${pad(hours)}:${pad(minutes)}`,
    clock: `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}
