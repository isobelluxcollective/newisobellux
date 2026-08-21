import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string; raffle?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    raffle: typeof search.raffle === "string" ? search.raffle : undefined,
  }),
  beforeLoad: ({ search }) => {
    // Stripe Embedded Checkout always returns with a session_id on completion.
    // We don't have direct access to the session status here, but Embedded
    // Checkout only navigates to return_url after a successful payment (failed
    // attempts stay in the iframe). Send the user to Members with a welcome flag.
    if (search.session_id) {
      throw redirect({ to: "/members", search: { welcome: 1 } as any });
    }
    // No session id → treat as failed/abandoned
    if (search.raffle) {
      throw redirect({
        to: "/enter",
        search: { raffle: search.raffle, error: "payment_failed" } as any,
      });
    }
    throw redirect({ to: "/enter", search: { error: "payment_failed" } as any });
  },
  component: () => null,
});
