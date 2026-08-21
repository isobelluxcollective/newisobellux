import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      priceId: string;
      quantity?: number;
      customerEmail?: string;
      userId?: string;
      returnUrl: string;
      environment: StripeEnv;
      // Optional per-raffle ad-hoc pricing (one-time only).
      // When provided, ignores the stored Stripe price and creates a price_data line item.
      adhocAmountPence?: number;
      adhocProductName?: string;
      adhocRaffleId?: string;
    }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      if (data.adhocAmountPence !== undefined) {
        if (!Number.isFinite(data.adhocAmountPence) || data.adhocAmountPence < 50 || data.adhocAmountPence > 1_000_000) {
          throw new Error("Invalid amount");
        }
        if (!data.adhocProductName || data.adhocProductName.length > 200) {
          throw new Error("Invalid product name");
        }
        if (data.adhocRaffleId && !/^[a-zA-Z0-9_-]+$/.test(data.adhocRaffleId)) {
          throw new Error("Invalid raffleId");
        }
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);

    const customerId =
      data.customerEmail || data.userId
        ? await resolveOrCreateCustomer(stripe, {
            email: data.customerEmail,
            userId: data.userId,
          })
        : undefined;

    // Ad-hoc one-time price branch — used for per-raffle single tickets
    if (data.adhocAmountPence !== undefined) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: data.quantity || 1,
            price_data: {
              currency: "gbp",
              unit_amount: data.adhocAmountPence,
              product_data: {
                name: data.adhocProductName!,
                ...(data.adhocRaffleId && { metadata: { raffleId: data.adhocRaffleId } }),
              },
            },
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(customerId && { customer: customerId }),
        payment_intent_data: {
          description: data.adhocProductName!,
          ...(data.adhocRaffleId && { metadata: { raffleId: data.adhocRaffleId } }),
        },
        ...(data.userId && {
          metadata: {
            userId: data.userId,
            ...(data.adhocRaffleId && { raffleId: data.adhocRaffleId }),
          },
        }),
      });
      return session.client_secret;
    }

    // Stored price branch — subscriptions (or shared one-off prices)
    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    let productDescription: string | undefined;
    if (!isRecurring) {
      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);
      productDescription = product.name;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: data.quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      ...(customerId && { customer: customerId }),
      ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
      ...(data.userId && {
        metadata: { userId: data.userId },
        ...(isRecurring && { subscription_data: { metadata: { userId: data.userId } } }),
      }),
    });

    return session.client_secret;
  });
