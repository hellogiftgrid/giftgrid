-- Restore the narrow public reads required by the native scheduler.
grant select on public.booking_admins to anon, authenticated;
grant select on public.booking_event_types to anon, authenticated;
grant select on public.booking_availability to anon, authenticated;
grant select on public.booking_overrides to anon, authenticated;

drop policy if exists "booking_admin_public_read" on public.booking_admins;
create policy "booking_admin_public_read" on public.booking_admins
for select to anon, authenticated
using (active = true and accepting_bookings = true);

drop policy if exists "booking_event_public_read" on public.booking_event_types;
create policy "booking_event_public_read" on public.booking_event_types
for select to anon, authenticated
using (active = true and public_bookable = true);

drop policy if exists "booking_availability_public_read" on public.booking_availability;
create policy "booking_availability_public_read" on public.booking_availability
for select to anon, authenticated
using (exists (
  select 1 from public.booking_admins ba
  where ba.id = booking_availability.booking_admin_id
    and ba.active = true and ba.accepting_bookings = true
));

drop policy if exists "booking_override_public_read" on public.booking_overrides;
create policy "booking_override_public_read" on public.booking_overrides
for select to anon, authenticated
using (exists (
  select 1 from public.booking_admins ba
  where ba.id = booking_overrides.booking_admin_id
    and ba.active = true and ba.accepting_bookings = true
));
