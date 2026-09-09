-- Booking administration follows the single-super-admin rule.
update public.booking_admins ba
set active = false, accepting_bookings = false, updated_at = now()
where not exists (
  select 1 from public.profiles p
  where p.id = ba.profile_id
    and p.role = 'super_admin'
    and coalesce(p.is_active, true)
);

update public.booking_admins ba
set active = true, accepting_bookings = true, updated_at = now()
where exists (
  select 1 from public.profiles p
  where p.id = ba.profile_id
    and p.role = 'super_admin'
    and coalesce(p.is_active, true)
);

update public.booking_availability set active = false;

insert into public.booking_availability
  (booking_admin_id, day_of_week, start_time, end_time, timezone, active)
select ba.id, weekday, time '09:00', time '17:00', ba.timezone, true
from public.booking_admins ba
cross join generate_series(1, 5) as weekday
where ba.active = true and ba.accepting_bookings = true
on conflict (booking_admin_id, day_of_week, start_time, end_time)
do update set active = true, timezone = excluded.timezone;
