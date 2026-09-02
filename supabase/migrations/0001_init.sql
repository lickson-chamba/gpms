-- ============================================================================
-- Guesthouse management system — initial schema (Phase 0)
-- Run against a fresh Supabase project: paste into the SQL Editor, or
-- `supabase db push` if this file lives under supabase/migrations/ and the
-- project is linked via the Supabase CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.staff_role as enum ('receptionist', 'manager');
create type public.booking_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
create type public.payment_method_type as enum ('online', 'at_property');

-- ----------------------------------------------------------------------------
-- profiles — one row per staff member, linked 1:1 to auth.users.
-- Guests never get a row here; they book without creating an account.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.staff_role not null default 'receptionist',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- rooms
-- ----------------------------------------------------------------------------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_type text not null,
  description text,
  capacity int not null default 1,
  price_per_night numeric(10, 2) not null,
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Access-code generator: 6 chars, uppercase, skips ambiguous characters
-- (0/O, 1/I) so a guest can read it back to a receptionist over the phone
-- without confusion.
-- ----------------------------------------------------------------------------
create or replace function public.generate_access_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- ----------------------------------------------------------------------------
-- bookings
-- payment_status and payment_method are tracked separately from status,
-- since a "pay at property" booking is fully confirmed while still unpaid.
-- ----------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  payment_method public.payment_method_type not null default 'online',
  total_price numeric(10, 2) not null,
  access_code text not null unique default public.generate_access_code(),
  access_code_redeemed_at timestamptz,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  checked_in_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint valid_stay_dates check (check_out > check_in)
);

create index bookings_room_dates_idx on public.bookings (room_id, check_in, check_out);

-- ----------------------------------------------------------------------------
-- payments — written server-side only (an Edge Function / webhook using the
-- secret key, which bypasses RLS) or by a receptionist marking cash/card
-- received at the desk. See the RLS section below for why there's no
-- client-facing insert policy.
-- ----------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  amount numeric(10, 2) not null,
  provider text, -- 'stripe' | 'paystack' | 'front_desk'
  provider_reference text,
  status public.payment_status not null default 'unpaid',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a staff account is created in
-- Supabase Auth. Pass full_name/role in user_metadata when creating the
-- user, e.g.:
--   supabaseAdmin.auth.admin.createUser({
--     email, password,
--     user_metadata: { full_name: 'Jane Doe', role: 'receptionist' }
--   })
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_staff_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.staff_role, 'receptionist')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_staff_user();

-- ----------------------------------------------------------------------------
-- Prevent double-booking. Date ranges are treated as half-open
-- [check_in, check_out), so a same-day turnover — one guest's check-out
-- date equals the next guest's check-in date — is allowed, not blocked.
-- ----------------------------------------------------------------------------
create or replace function public.check_room_availability()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.bookings b
    where b.room_id = new.room_id
      and b.status <> 'cancelled'
      and b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and new.check_in < b.check_out
      and new.check_out > b.check_in
  ) then
    raise exception 'Room is already booked for the selected dates';
  end if;
  return new;
end;
$$;

create trigger enforce_room_availability
  before insert or update on public.bookings
  for each row execute function public.check_room_availability();

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_active = true
  );
$$;

create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager' and is_active = true
  );
$$;

-- profiles: staff can see the team; only managers change roles/status
create policy "Staff can view profiles" on public.profiles
  for select using (public.is_staff());
create policy "Managers can update profiles" on public.profiles
  for update using (public.is_manager());

-- rooms: anyone can see active rooms; only managers manage inventory
create policy "Anyone can view active rooms" on public.rooms
  for select using (is_active = true or public.is_staff());
create policy "Managers can insert rooms" on public.rooms
  for insert with check (public.is_manager());
create policy "Managers can update rooms" on public.rooms
  for update using (public.is_manager());
create policy "Managers can delete rooms" on public.rooms
  for delete using (public.is_manager());

-- bookings: anyone (including an anonymous guest) can create a booking, but
-- only in a fresh, unpaid, not-yet-processed state — everything else about
-- a booking is staff-only from there. A receptionist entering a walk-in
-- follows the same insert-then-update path a guest booking does: insert as
-- 'pending', then a second call (allowed by "Staff can update bookings")
-- moves it to 'confirmed' or 'checked_in'.
--
-- Deliberately no public SELECT policy: the booking confirmation screen
-- uses the row returned by the insert itself, not a separate lookup query,
-- so a booking's guest details are never publicly readable.
create policy "Anyone can create a pending booking" on public.bookings
  for insert
  with check (
    status = 'pending'
    and payment_status = 'unpaid'
    and access_code_redeemed_at is null
    and checked_in_at is null
    and checked_out_at is null
    and checked_in_by is null
  );
create policy "Staff can view bookings" on public.bookings
  for select using (public.is_staff());
create policy "Staff can update bookings" on public.bookings
  for update using (public.is_staff());

-- payments: staff can read for reporting. All writes happen server-side
-- with the secret key, which bypasses RLS entirely — so no insert/update
-- policy is defined here on purpose; a permissive one would let any
-- authenticated or anonymous client write fake payment records.
create policy "Staff can view payments" on public.payments
  for select using (public.is_staff());
