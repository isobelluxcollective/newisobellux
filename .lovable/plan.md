# Entry Flow + Ticket Balance System

## Universal ticket model

Tickets are the single currency for entering draws. Every paid action grants tickets to the user's balance; entering a draw spends tickets.

| Tier | Price | Tickets |
| --- | --- | --- |
| Collector | £10 | 12 |
| Aficionado | £25 | 30 |
| Icon | £50 | 60 |

Applies to both subscription (refreshed monthly, no rollover) and one-off purchase (granted once at purchase).

## Database (migration)

- `profiles` adds:
  - `ticket_balance int not null default 0`
  - `ticket_expiry timestamptz null` — next subscription renewal date (null for one-off-only users)
  - `subscription_tier text null` — 'collector' | 'aficionado' | 'icon' (drives monthly reset)
- `raffles` adds: `total_ticket_pool int not null default 10000` (used for the 10% per-user cap).
- `entries` (new): `id`, `user_id` (fk auth.users), `raffle_id` (fk raffles), `tickets int`, `source text` ('subscription' | 'oneoff' | 'postal'), `amount_paid_pence int default 0`, `created_at`. RLS: user can SELECT own; insert via SECURITY DEFINER fn only.
- `ticket_grants` (new, idempotency log): `id`, `user_id`, `source_type` ('subscription_renewal' | 'oneoff' | 'postal' | 'reset'), `stripe_event_id text unique`, `tickets_granted int`, `created_at`.
- Function `public.enter_draw_with_tickets(p_raffle_id uuid, p_tickets int)` SECURITY DEFINER:
  - Validates raffle status='live'.
  - Computes user's existing entries for the raffle; rejects if existing+new > 10% of `total_ticket_pool` → raise exception `TICKET_CAP_EXCEEDED:max=N`.
  - Validates balance ≥ p_tickets.
  - Atomically decrements `profiles.ticket_balance` and inserts `entries` row with source='subscription' or 'oneoff' inferred (caller passes source via wrapper).
  - Returns json `{ entry_id, new_balance, draw_max_per_user }`.

## Stripe products

Create 3 one-off products (in addition to existing subscription prices):
- `tickets_collector_onetime` — £10 → 12 tickets
- `tickets_aficionado_onetime` — £25 → 30 tickets
- `tickets_icon_onetime` — £50 → 60 tickets

Each Stripe checkout session metadata carries `userId` + `ticketsToGrant` + `tier`.

## Webhook (`src/routes/api/public/payments/webhook.ts`)

New handlers, all keyed by stripe event for idempotency in `ticket_grants`:
- `checkout.session.completed` (mode=payment) → grant `metadata.ticketsToGrant` tickets, source 'oneoff', keyed by `session.id`.
- `invoice.paid` (subscription renewal) → resolve tier from line-item `lookup_key`, **reset** `profiles.ticket_balance` to tier allocation (no rollover), update `profiles.ticket_expiry` to next period end, `profiles.subscription_tier`, log to `ticket_grants` keyed by `invoice.id`.
- `customer.subscription.deleted` → null `subscription_tier`, leave balance as-is (until next reset cycle wouldn't fire).
- Failed/incomplete sessions: do nothing. No tickets, no entries.

## Server functions (`src/lib/entries.functions.ts`)

All auth-protected via `requireSupabaseAuth`:
- `getMembersData()` → `{ profile (balance, expiry, tier), active_entries[] (joined to live raffles), past_entries[] (joined to closed raffles), orders[], payment_method, low_balance, expiring_soon }`.
- `getDrawTicketInfo({ raffleId })` → `{ user_existing_tickets, max_per_user, remaining_for_user }`.
- `enterDrawWithTickets({ raffleId, tickets })` → calls SQL fn; on success enqueues the entry-confirmation email; returns `{ entry_id, new_balance }`. Maps `TICKET_CAP_EXCEEDED` to a typed error.
- `getSavedPaymentMethod()` → Stripe customer lookup, returns `{ brand, last4 } | null`.

## Routes

### `src/routes/enter.tsx`
Search schema: `raffle` (uuid), `plan` ('collector' | 'aficionado' | 'icon' | 'postal'), `mode` ('subscription' | 'oneoff' | 'tickets'), `confirm` (bool), `error` ('payment_failed').

- **Top of page**: when `error=payment_failed`, render muted banner: "Your payment was not completed. Please try again."
- **Flow A (not logged in)**:
  - Show existing Postal / Single Purchase / Subscription tabs.
  - Postal tab: show postal screen with address + rules + "Postal entries are processed manually and will appear in your Members Portal within 5 working days." No form, no payment.
  - Selecting a tier card → navigate to `/auth?redirect=/enter?raffle=X&plan=Y&mode=Z&confirm=1`.
- **Flow B (logged in, no `plan`)**:
  - Greeting line "Entering as [First Name] · Not you? Log out".
  - Two-option screen:
    - "Use Subscription Tickets" — shown only when `ticket_balance > 0`; displays `"You have N tickets remaining"` and (if expiry set) `"· expires <date>"`. Click → set `mode=tickets` and go to confirmation.
    - "Buy Individual Tickets" — always shown; renders 3 one-off tier cards (Collector/Aficionado/Icon). Click a tier → set `plan`+`mode=oneoff` and go to confirmation.
- **Confirmation screen (`confirm=1`, logged in)**:
  - Centred card: draw name + number, selected option (tier label + tickets), total (£0 for tickets path, tier price for oneoff), saved payment method (brand + last4 + "Change payment method" link) for oneoff only.
  - Per-draw cap check: if user attempts more than 10% of pool, inline error "You can enter a maximum of [X] tickets into this draw." Cancels Confirm button.
  - "Confirm Entry" filled black pill.
  - "Cancel" muted text link → back to raffle page.
  - On confirm:
    - tickets path → `enterDrawWithTickets` → redirect `/members?welcome=1`.
    - oneoff path → open Stripe Embedded Checkout for the tier price; success → `/checkout/return` → `/members?welcome=1`; failure/abandon → `/enter?raffle=X&error=payment_failed`.

### `src/routes/auth.tsx`
Preserve full `redirect` URL (incl. `plan`, `mode`, `confirm`). After successful signup/signin → land back at `/enter?...confirm=1` so user lands directly on confirmation. (No changes to email-confirm flow.)

### `src/routes/members.tsx` — replace placeholders with real data
- Header pill: "N tickets · expires <date>" (or just "N tickets" if no expiry).
- **Banners (above sections)**:
  - Low balance (`< 12`): "You're running low on tickets. Top up to keep entering draws." with button to `/enter`.
  - Tickets expiring within 7 days: "Your tickets expire on <date>. Use them before they're gone." with link to `/raffle`.
  - Success (`?welcome=1`): "You're in. Good luck, [First Name]."
- Active Entries: real rows from `entries` joined to live raffles.
- Past Draws: rows from `entries` joined to closed raffles.
- My Orders: from `ticket_grants` (oneoff + subscription_renewal rows).

### `src/routes/checkout.return.tsx`
On `status === 'complete'` → redirect to `/members?welcome=1`. On any other terminal status → redirect to `/enter?raffle=<id>&error=payment_failed` if raffle context known, else `/enter?error=payment_failed`.

### `src/routes/raffle.tsx`, `src/routes/index.tsx`, `src/components/site-header.tsx`
All "Enter Now" buttons go to `/enter?raffle=<id>` (or `/enter` for the nav). The enter route handles the rest.

## Email — entry confirmation

After every successful `enter_draw_with_tickets`, send transactional email:
- Subject: `You're entered — Draw No. <XXX>`
- Body: cream background, serif heading, muted body. Includes draw name+number, tickets allocated, new balance, expiry date (if any), link to Members Portal.
- Requires email infrastructure: domain, infra, transactional scaffold + new template `entry-confirmation`. This is its own setup step — will prompt to configure email domain when we reach that stage if not done.

## Postal entries
- UI: dedicated info-only screen on the Postal tab (no payment).
- Database: no auto-created row. Admins later insert rows into `entries` with `source='postal'`, `amount_paid_pence=0`. Out of scope for this build.

## Failed payment handling
- Webhook ignores incomplete sessions. No tickets, no entries.
- `checkout.return.tsx` redirects to `/enter?raffle=...&error=payment_failed`.
- Failed `session.id`s appear naturally in Stripe dashboard / can be logged via console for now.

## Build order
1. **Migration** (tables, functions, RLS).
2. **Stripe products** (3 one-off tier products via batch_create_product).
3. **Webhook** updates (one-off + invoice.paid + reset logic).
4. **Server fns** (`entries.functions.ts`).
5. **Route changes** (enter, members, checkout.return, raffle, index, header).
6. **Email** (setup infra + scaffold + entry-confirmation template + wire to enterDrawWithTickets).

## Files touched
- migration
- `src/lib/raffle-data.ts` (tier↔tickets map, tier prices)
- `src/routes/api/public/payments/webhook.ts`
- `src/lib/entries.functions.ts` (new)
- `src/routes/enter.tsx`
- `src/routes/members.tsx`
- `src/routes/checkout.return.tsx`
- `src/routes/raffle.tsx`, `src/routes/index.tsx`, `src/components/site-header.tsx`
- `src/lib/email-templates/entry-confirmation.tsx` + registry update (email phase)
