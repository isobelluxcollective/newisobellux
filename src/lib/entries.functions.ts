import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

const uuid = z.string().uuid();

export const getMembersData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, entriesRes, grantsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, ticket_balance, ticket_expiry, subscription_tier")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("entries")
        .select(
          "id, tickets, source, amount_paid_pence, created_at, raffle_id, raffles(id, draw_number, prize_name, prize_short, draw_date, status, hero_image_url)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("ticket_grants")
        .select("id, source_type, tier, tickets_granted, amount_paid_pence, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const profile = profileRes.data ?? null;
    const allEntries = (entriesRes.data ?? []) as any[];
    const active: any[] = [];
    const past: any[] = [];
    for (const e of allEntries) {
      const status = e.raffles?.status;
      if (status === "live") active.push(e);
      else if (status === "closed") past.push(e);
    }

    const orders = (grantsRes.data ?? []).filter((g: any) =>
      ["oneoff", "subscription_renewal"].includes(g.source_type),
    );

    const balance = profile?.ticket_balance ?? 0;
    const expiry = profile?.ticket_expiry ? new Date(profile.ticket_expiry) : null;
    const now = Date.now();
    const lowBalance = balance < 12;
    const expiringSoon =
      !!expiry && expiry.getTime() - now > 0 && expiry.getTime() - now < 7 * 24 * 60 * 60 * 1000;

    return {
      profile,
      active_entries: active,
      past_entries: past,
      orders,
      low_balance: lowBalance,
      expiring_soon: expiringSoon,
    };
  });

export const getDrawTicketInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { raffleId: string }) => {
    return { raffleId: uuid.parse(input.raffleId) };
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: info, error } = await supabase.rpc("get_draw_ticket_info", {
      p_raffle_id: data.raffleId,
    });
    if (error) throw new Error(error.message);
    return info as {
      user_existing: number;
      max_per_user: number;
      remaining_for_user: number;
    };
  });

export const enterDrawWithTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { raffleId: string; tickets: number }) => {
    return {
      raffleId: uuid.parse(input.raffleId),
      tickets: z.number().int().min(1).max(10000).parse(input.tickets),
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("enter_draw_with_tickets", {
      p_raffle_id: data.raffleId,
      p_tickets: data.tickets,
      p_source: "subscription",
    });
    if (error) {
      const msg = error.message || "Unknown error";
      if (msg.includes("INSUFFICIENT_BALANCE")) throw new Error("INSUFFICIENT_BALANCE");
      if (msg.includes("TICKET_CAP_EXCEEDED")) {
        const m = msg.match(/TICKET_CAP_EXCEEDED:(\d+)/);
        throw new Error(`TICKET_CAP_EXCEEDED:${m?.[1] ?? ""}`);
      }
      if (msg.includes("RAFFLE_NOT_LIVE")) throw new Error("RAFFLE_NOT_LIVE");
      throw new Error(msg);
    }
    return result as { entry_id: string; new_balance: number; max_per_user: number };
  });

export const getSavedPaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { environment: StripeEnv }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) throw new Error("Invalid userId");
    const stripe = createStripeClient(data.environment);
    const customers = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });
    if (!customers.data.length) return null;
    const customer = customers.data[0];
    const defaultPmId =
      typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id;
    let pm: any = null;
    if (defaultPmId) {
      pm = await stripe.paymentMethods.retrieve(defaultPmId);
    } else {
      const pms = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card",
        limit: 1,
      });
      pm = pms.data[0] ?? null;
    }
    if (!pm?.card) return null;
    return {
      brand: pm.card.brand as string,
      last4: pm.card.last4 as string,
    };
  });
