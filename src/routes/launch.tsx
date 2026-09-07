import { createFileRoute, redirect } from "@tanstack/react-router";

/** Stage 1: pre-launch lives at `/`. Keep `/launch` as an alias. */
export const Route = createFileRoute("/launch")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
