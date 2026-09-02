-- ============================================================================
-- Guest booking flow (Phase 2) — two RPCs.
--
-- If you already have a 0002_*.sql from your own phase 1 work, rename this
-- file's number prefix so it doesn't collide (e.g. 0003_guest_booking.sql).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- available_rooms: rooms with no overlapping, non-cancelled booking for the
-- given range. SECURITY DEFINER because it has to read across the bookings
-- table to check overlaps, which anon/authenticated can't do directly (see
-- the "no public SELECT on bookings" note in 0001_init.sql) — but it only
-- ever returns room rows, never booking details, so that restriction still
-- holds. Same half-open-interval logic as enforce_room_availability.
-- ----------------------------------------------------------------------------
create or replace function public.available_rooms(p_check_in date, p_check_out date)
returns setof public.rooms
language sql
security definer
stable
as $$
  select r.*
  from public.rooms r
  where p_check_in < p_check_out
    and r.is_active = true
    and not exists (
      select 1
      from public.bookings b
      where b.room_id = r.id
        and b.status <> 'cancelled'
        and p_check_in < b.check_out
        and p_check_out > b.check_in
    )
  order by r.price_per_night asc;
$$;

grant execute on function public.available_rooms(date, date) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- get_booking_confirmation: the one sanctioned way to read back a single
-- booking without being staff. Callable by anyone who has the booking's
-- UUID (a 122-bit random value — effectively only someone who was just
-- handed the link, the same trust model as most order-confirmation pages).
-- Intentionally excludes guest_email/guest_phone from the return, since the
-- confirmation screen doesn't need to display them.
-- ----------------------------------------------------------------------------
create or replace function public.get_booking_confirmation(p_booking_id uuid)
returns table (
  id uuid,
  room_name text,
  room_type text,
  guest_name text,
  check_in date,
  check_out date,
  status public.booking_status,
  payment_status public.payment_status,
  payment_method public.payment_method_type,
  total_price numeric,
  access_code text,
  created_at timestamptz
)
language sql
security definer
stable
as $$
  select
    b.id,
    r.name as room_name,
    r.room_type,
    b.guest_name,
    b.check_in,
    b.check_out,
    b.status,
    b.payment_status,
    b.payment_method,
    b.total_price,
    b.access_code,
    b.created_at
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where b.id = p_booking_id;
$$;

grant execute on function public.get_booking_confirmation(uuid) to anon, authenticated;
