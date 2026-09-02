# Guesthouse management system

Next.js (App Router) + Supabase. This scaffold covers Phase 0 of the build:
project structure + initial schema. Nothing here talks to a real Supabase
project yet — that's the next step.

## What's here

- `app/` — routes for the guest site (`/`, `/rooms/[roomId]`,
  `/booking/confirmation/[bookingId]`) and the staff dashboards
  (`/reception`, `/manager`), plus `/login`. Every staff page is a
  placeholder — real functionality lands in phase 5 (reception) and
  phase 6 (manager).
- `lib/supabase/client.ts` / `server.ts` — browser and server Supabase
  clients using `@supabase/ssr`, scoped to the publishable key (RLS still
  applies).
- `lib/supabase/admin.ts` — a privileged client using the secret key,
  for server-only code that needs to bypass RLS (creating staff accounts,
  the payment webhook). Never import this into a Client Component.
- `middleware.ts` — refreshes the Supabase session on every request and
  redirects signed-out visitors away from `/reception` and `/manager`.
  Splitting receptionist vs manager access is phase 1 work — it needs a
  profile lookup this pass deliberately left out.
- `types/database.ts` — hand-written types matching the schema below.
  Swap for generated types once the project is linked:
  `supabase gen types typescript --linked > types/database.ts`
- `supabase/migrations/0001_init.sql` — the full initial schema: `rooms`,
  `bookings`, `payments`, `profiles`, a double-booking guard, an
  access-code generator, a trigger that creates a `profiles` row whenever
  a staff account is created, and the RLS policies for all of it.

## Setup

1. `npm install`
2. Create a Supabase project. Copy `.env.example` to `.env.local` and fill
   in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   from **Project Settings → API Keys**. Use the new publishable/secret
   keys, not the legacy anon/service_role ones — Supabase is retiring
   those by the end of 2026. Also fill in `SUPABASE_SECRET_KEY` (server
   only — never commit a real value or expose it to the browser).
3. Run `supabase/migrations/0001_init.sql` against the project: paste it
   into the SQL Editor, or `supabase db push` if the project is linked via
   the Supabase CLI.
4. `npm run dev`, then open http://localhost:3000.

Node.js 20+ is required (Next.js 16).

## Phase 2 — guest booking flow

Adds the public-facing side: `/` (room listing + date search), `/rooms/[roomId]`
(detail + booking form), `/booking/confirmation/[bookingId]` (the access
code). New pieces:

- `supabase/migrations/0002_guest_booking.sql` — two RPCs. `available_rooms`
  powers the date-range search; `get_booking_confirmation` is the one
  sanctioned way to read a booking back without being staff (see the
  comments in that file for why). **Run this migration too** — and if you
  already have a `0002_*.sql` of your own from phase 1, rename this file's
  prefix so the two don't collide.
- `supabase/seed.sql` — four sample rooms so the listing page has something
  to show locally. Supabase runs this separately from migrations (e.g. on
  `supabase db reset`); otherwise just paste it into the SQL Editor once.
- `lib/actions/bookings.ts` — the `createBooking` Server Action. Re-checks
  the room's price server-side (never trusts a client-submitted total) and
  relies on the `enforce_room_availability` trigger from phase 0 to reject
  a race-condition double-booking.
- `lib/pricing.ts` — night-count and currency formatting, shared by the
  form's live total and the server action's authoritative one. Defaults to
  ZAR — change the `CURRENCY` constant if that's wrong for you.

Selecting "Pay online now" doesn't charge a card yet — that's phase 3. Both
payment options currently just create the booking as unpaid.

## Phase 1 — staff auth & role-based routing

Adds real sign-in at `/login`, sign-out from the reception/manager headers,
and role enforcement in `middleware.ts`: signed-out visitors are bounced to
`/login`, and a receptionist hitting `/manager/*` is bounced to
`/reception` instead. `lib/actions/auth.ts` holds `signIn`/`signOut`;
`lib/actions/staff.ts` holds `createStaffAccount`, which re-checks the
caller is a manager itself rather than trusting the route it was called
from.

New pieces:

- `supabase/migrations/0003_staff_profiles.sql` — adds `profiles.email`
  (needed to show a readable staff list; `auth.users` isn't queryable from
  the client) and updates the signup trigger to fill it in. **Run this
  migration too.**
- `/manager/staff` — lists everyone in `profiles` and has a form to create
  new staff accounts. A manager sets a temporary password directly (no
  email step yet — that's phase 4) and shares it with the new hire
  out-of-band.

**Bootstrapping the first manager** — only a manager can create staff
accounts, but there isn't one yet on a fresh project. One-time fix: in the
Supabase dashboard, go to **Authentication → Users → Add user** and create
yourself with an email/password. **Tick "Auto Confirm User"** — if you
don't, the account is created but can't sign in, and the login page has
no way to explain why beyond a generic error. If you already hit that,
fix the existing account instead of recreating it:

```sql
update auth.users set email_confirmed_at = now() where email = 'you@example.com';
```

Creating the user also fires the signup trigger, so a `profiles` row
appears automatically with the default `receptionist` role. Promote it:

```sql
update public.profiles set role = 'manager' where email = 'you@example.com';
```

From then on, use `/manager/staff` for every account after that — it
already sets `email_confirm: true` itself, so this particular gotcha only
bites the one dashboard-created bootstrap account.

## Decisions baked into this schema — revisit if wrong

- Guests book without an account: name/email/phone are captured at
  booking time. Add guest accounts later if returning guests should see
  booking history.
- Single property for now. Nothing here assumes multi-property, but
  nothing blocks adding a `properties` table and a `property_id` column
  later either.
- A booking blocks its room's dates the moment it's created (any status
  except `cancelled`), even before payment — otherwise two guests could
  both "reserve now, pay later" the same room.
