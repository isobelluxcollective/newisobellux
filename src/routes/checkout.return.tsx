import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): {
    session_id?: string;
    raffle?: string;
    mode?: string;
  } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    raffle: typeof search.raffle === "string" ? search.raffle : undefined,
    mode: typeof search.mode === "string" ? search.mode : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.session_id) {
      if (search.mode === "subscription") {
        throw redirect({ to: "/members/allocate", search: { welcome: 1 } as any });
      }
      throw redirect({ to: "/members", search: { welcome: 1 } as any });
    }
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
