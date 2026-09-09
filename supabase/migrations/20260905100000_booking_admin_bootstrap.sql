-- Complete the Cal.com → GiftGrid → Resend booking chain.

alter table if exists public.booking_admins
  add column if not exists google_calendar_email text;

alter table if exists public.booking_admins
  add column if not exists cal_username text;

alter table if exists public.bookings
  add column if not exists cal_booking_uid text;

alter table if exists public.bookings
  add column if not exists cal_meeting_url text;

alter table if exists public.bookings
  add column if not exists booked_call_token text;

create unique index if not exists bookings_cal_uid_unique
  on public.bookings (cal_booking_uid)
  where cal_booking_uid is not null;

create unique index if not exists bookings_call_token_unique
  on public.bookings (booked_call_token)
  where booked_call_token is not null;

create unique index if not exists booking_admins_profile_id_unique
  on public.booking_admins (profile_id);

insert into public.booking_event_types (
  name,
  slug,
  description,
  duration_minutes,
  buffer_before_minutes,
  buffer_after_minutes,
  minimum_notice_minutes,
  booking_window_days,
  active,
  public_bookable
)
values (
  'GiftGrid introduction call',
  'giftgrid-intro-call',
  'A 30-minute introduction to GiftGrid for brands and gifting teams.',
  30,
  0,
  10,
  60,
  60,
  true,
  true
)
on conflict (slug) do update set
  active = true,
  public_bookable = true,
  updated_at = now();

insert into public.booking_admins (
  profile_id,
  slug,
  display_name,
  booking_title,
  timezone,
  active,
  accepting_bookings
)
select
  p.id,
  'giftgrid-' || left(replace(p.id::text, '-', ''), 12),
  coalesce(nullif(p.full_name, ''), 'GiftGrid Team'),
  'Meet with GiftGrid',
  'UTC',
  true,
  true
from public.profiles p
where p.role = 'super_admin'
on conflict (profile_id) do update set
  display_name = excluded.display_name,
  active = true,
  accepting_bookings = true,
  updated_at = now();

create or replace function public.sync_super_admin_booking_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'super_admin' then
    insert into public.booking_admins (
      profile_id,
      slug,
      display_name,
      booking_title,
      timezone,
      active,
      accepting_bookings
    )
    values (
      new.id,
      'giftgrid-' || left(replace(new.id::text, '-', ''), 12),
      coalesce(nullif(new.full_name, ''), 'GiftGrid Team'),
      'Meet with GiftGrid',
      'UTC',
      true,
      true
    )
    on conflict (profile_id) do update set
      display_name = excluded.display_name,
      active = true,
      accepting_bookings = true,
      updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists sync_super_admin_booking_profile_trigger
on public.profiles;

create trigger sync_super_admin_booking_profile_trigger
after insert or update of role, full_name on public.profiles
for each row execute function public.sync_super_admin_booking_profile();
