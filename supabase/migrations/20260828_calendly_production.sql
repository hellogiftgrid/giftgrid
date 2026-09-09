alter table public.booking_admins
  add column if not exists calendly_user_uri text;

alter table public.booking_admins
  add column if not exists calendly_scheduling_url text;

alter table public.bookings
  add column if not exists calendly_invitee_uri text;

alter table public.bookings
  add column if not exists calendly_event_uri text;

alter table public.bookings
  add column if not exists calendly_event_type_uri text;

alter table public.bookings
  add column if not exists calendly_status text;

create unique index if not exists bookings_calendly_invitee_uri_uidx
  on public.bookings(calendly_invitee_uri)
  where calendly_invitee_uri is not null;
