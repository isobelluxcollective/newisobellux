export type TierId = "collector" | "aficionado" | "icon";

export type TierPlan = {
  priceId: string;
  price: number;
  tickets: number;
  label: string;
};

export const TIER_ONEOFF_PRICE: Record<TierId, TierPlan> = {
  collector: { priceId: "tickets_collector_onetime", price: 10, tickets: 12, label: "Collector" },
  aficionado: { priceId: "tickets_aficionado_onetime", price: 25, tickets: 30, label: "Aficionado" },
  icon: { priceId: "tickets_icon_onetime", price: 50, tickets: 60, label: "Icon" },
};

export const TIER_SUB_PRICE: Record<TierId, TierPlan> = {
  collector: { priceId: "tickets_collector_monthly", price: 10, tickets: 12, label: "Collector" },
  aficionado: { priceId: "tickets_aficionado_monthly", price: 25, tickets: 30, label: "Aficionado" },
  icon: { priceId: "tickets_icon_monthly", price: 50, tickets: 60, label: "Icon" },
};

export const TIER_ORDER: TierId[] = ["collector", "aficionado", "icon"];

export function tierFor(mode: "subscription" | "oneoff", id: TierId): TierPlan {
  return mode === "subscription" ? TIER_SUB_PRICE[id] : TIER_ONEOFF_PRICE[id];
}
