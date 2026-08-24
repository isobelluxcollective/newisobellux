export type OneoffTierId = "bundle1" | "bundle3" | "bundle6" | "bundle12";
export type SubTierId = "sub6" | "sub14";
export type TierId = OneoffTierId | SubTierId;

export type TierPlan = {
  priceId: string;
  price: number;
  tickets: number;
  label: string;
  perEntry: string;
  discount?: string;
};

export const ONEOFF_TIER_ORDER: OneoffTierId[] = ["bundle1", "bundle3", "bundle6", "bundle12"];
export const SUB_TIER_ORDER: SubTierId[] = ["sub6", "sub14"];

export const TIER_ONEOFF_PRICE: Record<OneoffTierId, TierPlan> = {
  bundle1: {
    priceId: "tickets_bundle1_onetime",
    price: 5,
    tickets: 1,
    label: "1 Entry",
    perEntry: "£5.00",
  },
  bundle3: {
    priceId: "tickets_bundle3_onetime",
    price: 12,
    tickets: 3,
    label: "3 Entries",
    perEntry: "£4.00",
    discount: "20% off",
  },
  bundle6: {
    priceId: "tickets_bundle6_onetime",
    price: 20,
    tickets: 6,
    label: "6 Entries",
    perEntry: "£3.33",
    discount: "33% off",
  },
  bundle12: {
    priceId: "tickets_bundle12_onetime",
    price: 35,
    tickets: 12,
    label: "12 Entries",
    perEntry: "£2.92",
    discount: "42% off",
  },
};

export const TIER_SUB_PRICE: Record<SubTierId, TierPlan> = {
  sub6: {
    priceId: "tickets_sub6_monthly",
    price: 20,
    tickets: 6,
    label: "Monthly Entry",
    perEntry: "£3.33",
  },
  sub14: {
    priceId: "tickets_sub14_monthly",
    price: 35,
    tickets: 14,
    label: "Monthly Entry",
    perEntry: "£2.50",
  },
};

export function tierFor(mode: "subscription" | "oneoff", id: TierId): TierPlan {
  return mode === "subscription"
    ? TIER_SUB_PRICE[id as SubTierId]
    : TIER_ONEOFF_PRICE[id as OneoffTierId];
}

export function tierOrderFor(mode: "subscription" | "oneoff"): TierId[] {
  return mode === "subscription" ? SUB_TIER_ORDER : ONEOFF_TIER_ORDER;
}

export const SINGLE_PURCHASE_COPY =
  "Buy tickets for this draw. Entries start from £5, with better value the more you buy in one go. All tickets bought here enter this draw only — they can't be moved or split across other live draws. The more tickets you hold in this draw, the greater your chances of winning it.";

export const SUBSCRIPTION_COPY =
  "Your monthly entries can be split across all currently live draws — up to three at a time. Adjust your allocation any time before a draw closes.";
