-- ============================================================
-- GiftGrid Native Booking System
-- ============================================================

create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- EVENT TYPES
-- ------------------------------------------------------------

create table if not exists public.booking_event_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  duration_minutes integer not null default 30,
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 10,
  minimum_notice_minutes integer not null default 120,
  booking_window_days integer not null default 30,
  active boolean not null default true,
  public_bookable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ADMIN AVAILABILITY
-- ------------------------------------------------------------

create table if not exists public.booking_availability (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Africa/Lagos',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(profile_id, day_of_week, start_time, end_time)
);

-- ------------------------------------------------------------
-- DATE OVERRIDES
-- ------------------------------------------------------------

create table if not exists public.booking_overrides (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  override_date date not null,
  available boolean not null default false,
  start_time time,
  end_time time,
  timezone text not null default 'Africa/Lagos',
  note text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),

  event_type_id uuid not null
    references public.booking_event_types(id),

  merchant_id uuid references public.merchant_profiles(id)
    on delete set null,

  guest_name text not null,
  guest_email text not null,
  guest_phone text,

  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null,

  status text not null default 'confirmed'
    check (
      status in (
        'pending',
        'confirmed',
        'rescheduled',
        'completed',
        'cancelled',
        'no_show'
      )
    ),

  meeting_type text not null default 'giftgrid_consultation',

  merchant_notes text,
  admin_notes text,

  cancellation_token text unique,
  reschedule_token text unique,

  confirmation_email_id text,
  reminder_email_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  booking_window tstzrange
    generated always as (
      tstzrange(start_at, end_at, '[)')
    ) stored
);

-- ------------------------------------------------------------
-- PREVENT DOUBLE BOOKING
-- ------------------------------------------------------------

alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    booking_window with &&
  )
  where (status in ('pending', 'confirmed', 'rescheduled'));

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------

create index if not exists idx_booking_event_types_active
  on public.booking_event_types(active, public_bookable);

create index if not exists idx_booking_availability_profile_day
  on public.booking_availability(profile_id, day_of_week);

create index if not exists idx_bookings_start_at
  on public.bookings(start_at);

create index if not exists idx_bookings_guest_email
  on public.bookings(guest_email);

create index if not exists idx_bookings_merchant_id
  on public.bookings(merchant_id);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.booking_event_types enable row level security;
alter table public.booking_availability enable row level security;
alter table public.booking_overrides enable row level security;
alter table public.bookings enable row level security;

-- Public users may see active event types.
drop policy if exists "booking_event_types_public_read"
on public.booking_event_types;

create policy "booking_event_types_public_read"
on public.booking_event_types
for select
using (
  active = true
  and public_bookable = true
);

-- Admin event type management.
drop policy if exists "booking_event_types_admin"
on public.booking_event_types;

create policy "booking_event_types_admin"
on public.booking_event_types
for all
using (is_admin())
with check (is_admin());

-- Admin availability.
drop policy if exists "booking_availability_admin"
on public.booking_availability;

create policy "booking_availability_admin"
on public.booking_availability
for all
using (is_admin())
with check (is_admin());

-- Admin date overrides.
drop policy if exists "booking_overrides_admin"
on public.booking_overrides;

create policy "booking_overrides_admin"
on public.booking_overrides
for all
using (is_admin())
with check (is_admin());

-- Admin can see/manage every booking.
drop policy if exists "bookings_admin"
on public.bookings;

create policy "bookings_admin"
on public.bookings
for all
using (is_admin())
with check (is_admin());

-- A merchant can see their own bookings.
drop policy if exists "bookings_merchant_select"
on public.bookings;

create policy "bookings_merchant_select"
on public.bookings
for select
using (
  merchant_id in (
    select id
    from public.merchant_profiles
    where profile_id = auth.uid()
  )
);

-- ------------------------------------------------------------
-- DEFAULT EVENT TYPES
-- ------------------------------------------------------------

insert into public.booking_event_types (
  name,
  slug,
  description,
  duration_minutes,
  buffer_before_minutes,
  buffer_after_minutes,
  minimum_notice_minutes,
  booking_window_days
)
values
(
  'Store Audit Review',
  'store-audit-review',
  'Review your GiftGrid store audit and understand the highest-impact improvements.',
  30,
  0,
  10,
  120,
  30
),
(
  'Store Improvement Consultation',
  'store-improvement-consultation',
  'Work through practical improvements for your online store.',
  45,
  0,
  10,
  120,
  30
),
(
  'Corporate Gifting Consultation',
  'corporate-gifting-consultation',
  'Discuss how to prepare your products and storefront for corporate gifting opportunities.',
  30,
  0,
  10,
  120,
  30
),
(
  'Expert Strategy Session',
  'expert-strategy-session',
  'A deeper strategy session with a GiftGrid expert.',
  60,
  0,
  15,
  240,
  30
)
on conflict (slug) do nothing;

