-- GiftGrid ↔ Cal.com booking/call integration

alter table public.bookings
  add column if not exists cal_booking_uid text;

alter table public.bookings
  add column if not exists cal_meeting_url text;

alter table public.bookings
  add column if not exists booked_call_token text;

create unique index if not exists bookings_cal_uid_unique
  on public.bookings (cal_booking_uid)
  where cal_booking_uid is not null;

create unique index if not exists bookings_call_token_unique
  on public.bookings (booked_call_token)
  where booked_call_token is not null;

create index if not exists bookings_start_at_idx
  on public.bookings (start_at);

create index if not exists bookings_guest_email_idx
  on public.bookings (guest_email);
