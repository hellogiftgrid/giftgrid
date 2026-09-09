-- Give the sole active GiftGrid booking host a useful native schedule.
insert into public.booking_availability
  (booking_admin_id, day_of_week, start_time, end_time, timezone, active)
select ba.id, weekday, time '09:00', time '17:00', ba.timezone, true
from public.booking_admins ba
cross join generate_series(1, 5) as weekday
where ba.active = true and ba.accepting_bookings = true
on conflict (booking_admin_id, day_of_week, start_time, end_time)
do update set active = true, timezone = excluded.timezone;
