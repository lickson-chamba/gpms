-- ============================================================================
-- Phase 1 — add profiles.email (auth.users isn't queryable from the client,
-- so the manager's staff list needs its own copy of the email to display).
-- ============================================================================

alter table public.profiles add column email text;

create or replace function public.handle_new_staff_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.staff_role, 'receptionist'),
    new.email
  );
  return new;
end;
$$;
-- Note: no need to re-run `create trigger` — on_auth_user_created already
-- points at this function by name, so replacing the body is enough.
