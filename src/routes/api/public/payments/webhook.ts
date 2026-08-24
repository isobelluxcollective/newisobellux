import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type StripeEnv, createStripeClient, verifyWebhook } from "@/lib/stripe.server";

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

// Tier mapping (universal — applies to subscriptions and one-off)
const TIER_TICKETS: Record<string, number> = {
  bundle1: 1,
  bundle3: 3,
  bundle6: 6,
  bundle12: 12,
  sub6: 6,
  sub14: 14,
  // Legacy tiers
  collector: 12,
  aficionado: 30,
  icon: 60,
};

function resolveTier(lookupKey?: string | null): { tier: string; tickets: number } | null {
  if (!lookupKey) return null;
  const key = lookupKey.toLowerCase();
  if (key.includes("sub14")) return { tier: "sub14", tickets: 14 };
  if (key.includes("sub6")) return { tier: "sub6", tickets: 6 };
  if (key.includes("bundle12")) return { tier: "bundle12", tickets: 12 };
  if (key.includes("bundle6")) return { tier: "bundle6", tickets: 6 };
  if (key.includes("bundle3")) return { tier: "bundle3", tickets: 3 };
  if (key.includes("bundle1")) return { tier: "bundle1", tickets: 1 };
  if (key.includes("collector")) return { tier: "collector", tickets: 12 };
  if (key.includes("aficionado")) return { tier: "aficionado", tickets: 30 };
  if (key.includes("icon")) return { tier: "icon", tickets: 60 };
  return null;
}

async function directDrawEntry(userId: string, raffleId: string, tickets: number) {
  const { data: raffle } = await getSupabase()
    .from("raffles")
    .select("status, total_ticket_pool")
    .eq("id", raffleId)
    .maybeSingle();
  if (!raffle || raffle.status !== "live") {
    console.error("directDrawEntry: raffle not live", raffleId);
    return false;
  }

  const maxPerUser = Math.max(1, Math.floor((raffle.total_ticket_pool ?? 0) / 10));
  const { data: existingRows } = await getSupabase()
    .from("entries")
    .select("tickets")
    .eq("user_id", userId)
    .eq("raffle_id", raffleId);
  const existing = (existingRows ?? []).reduce((sum, row) => sum + (row.tickets ?? 0), 0);
  if (existing + tickets > maxPerUser) {
    console.error("directDrawEntry: cap exceeded", { userId, raffleId, tickets, maxPerUser });
    return false;
  }

  const { error } = await getSupabase().from("entries").insert({
    user_id: userId,
    raffle_id: raffleId,
    tickets,
    source: "oneoff",
  });
  if (error) {
    console.error("directDrawEntry failed", error);
    return false;
  }
  return true;
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("ticket_grants")
    .select("id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();
  return !!data;
}

async function recordGrant(args: {
  userId: string;
  eventId: string;
  sourceType: "oneoff" | "subscription_renewal";
  tier: string;
  tickets: number;
  amountPaidPence: number;
}) {
  await getSupabase().from("ticket_grants").insert({
    user_id: args.userId,
    stripe_event_id: args.eventId,
    source_type: args.sourceType,
    tier: args.tier,
    tickets_granted: args.tickets,
    amount_paid_pence: args.amountPaidPence,
  });
}

async function incrementBalance(userId: string, tickets: number, expiry?: Date | null, tier?: string | null) {
  const { data: profile } = await getSupabase()
    .from("profiles")
    .select("ticket_balance")
    .eq("id", userId)
    .maybeSingle();
  const current = profile?.ticket_balance ?? 0;
  const update: Record<string, any> = {
    ticket_balance: current + tickets,
    updated_at: new Date().toISOString(),
  };
  if (expiry !== undefined) update.ticket_expiry = expiry ? expiry.toISOString() : null;
  if (tier !== undefined) update.subscription_tier = tier;
  await getSupabase().from("profiles").update(update).eq("id", userId);
}

async function resetBalance(userId: string, tickets: number, expiry: Date | null, tier: string) {
  await getSupabase()
    .from("profiles")
    .update({
      ticket_balance: tickets,
      ticket_expiry: expiry ? expiry.toISOString() : null,
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const item = subscription.items?.data?.[0];
  const lookupKey = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id;
  const priceId = lookupKey || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const item = subscription.items?.data?.[0];
  const lookupKey = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id;
  const priceId = lookupKey || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase()
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  const userId = subscription.metadata?.userId;
  if (userId) {
    await getSupabase()
      .from("profiles")
      .update({ subscription_tier: null, updated_at: new Date().toISOString() })
      .eq("id", userId);
  }
}

async function handleCheckoutCompleted(session: any, env: StripeEnv, eventId: string) {
  // Only handle one-off ticket purchases here. Subscription mode is handled via invoice.paid.
  if (session.mode !== "payment") return;
  const userId = session.metadata?.userId;
  if (!userId) return;

  if (await alreadyProcessed(eventId)) return;

  // Resolve tier from the line item lookup_key
  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 5,
    expand: ["data.price"],
  });
  const first = lineItems.data[0];
  const lookupKey = (first?.price as any)?.lookup_key;
  const tierInfo = resolveTier(lookupKey);
  if (!tierInfo) {
    console.log("checkout.session.completed: unknown tier, skipping", { lookupKey });
    return;
  }

  const raffleId = session.metadata?.raffleId as string | undefined;
  if (raffleId) {
    const ok = await directDrawEntry(userId, raffleId, tierInfo.tickets);
    if (!ok) {
      console.error("checkout.session.completed: direct entry failed, crediting balance instead");
      await incrementBalance(userId, tierInfo.tickets);
    }
  } else {
    await incrementBalance(userId, tierInfo.tickets);
  }

  await recordGrant({
    userId,
    eventId,
    sourceType: "oneoff",
    tier: tierInfo.tier,
    tickets: tierInfo.tickets,
    amountPaidPence: session.amount_total ?? 0,
  });
}

async function handleInvoicePaid(invoice: any, env: StripeEnv, eventId: string) {
  // Subscription renewals (and first payment) → reset balance to tier allocation
  if (!invoice.subscription) return;
  if (await alreadyProcessed(eventId)) return;

  const stripe = createStripeClient(env);
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = (subscription.metadata as any)?.userId;
  if (!userId) {
    console.log("invoice.paid: no userId on subscription", invoice.subscription);
    return;
  }
  const item = subscription.items?.data?.[0] as any;
  const lookupKey = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id;
  const tierInfo = resolveTier(lookupKey);
  if (!tierInfo) {
    console.log("invoice.paid: unknown tier", { lookupKey });
    return;
  }
  const periodEnd = item?.current_period_end ?? (subscription as any).current_period_end;
  const expiry = periodEnd ? new Date(periodEnd * 1000) : null;

  await resetBalance(userId, tierInfo.tickets, expiry, tierInfo.tier);
  await recordGrant({
    userId,
    eventId,
    sourceType: "subscription_renewal",
    tier: tierInfo.tier,
    tickets: tierInfo.tickets,
    amountPaidPence: invoice.amount_paid ?? 0,
  });
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event: any = await verifyWebhook(req, env);
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object, env);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env, event.id);
      break;
    case "invoice.paid":
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object, env, event.id);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
