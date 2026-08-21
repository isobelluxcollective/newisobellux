import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface Props {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
  // Per-raffle ad-hoc pricing (one-time only)
  adhocAmountPence?: number;
  adhocProductName?: string;
  adhocRaffleId?: string;
}

export function StripeEmbeddedCheckout({
  priceId,
  quantity,
  customerEmail,
  userId,
  returnUrl,
  adhocAmountPence,
  adhocProductName,
  adhocRaffleId,
}: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const secret = await createCheckoutSession({
      data: {
        priceId,
        quantity,
        customerEmail,
        userId,
        returnUrl: returnUrl || `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
        adhocAmountPence,
        adhocProductName,
        adhocRaffleId,
      },
    });
    if (!secret) throw new Error("No client secret returned");
    return secret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
