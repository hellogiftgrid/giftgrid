create extension if not exists btree_gist;

create table if not exists public.booking_admins (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  booking_title text not null default 'GiftGrid Consultation',
  bio text,
  avatar_url text,
  timezone text not null default 'Africa/Lagos',
  active boolean not null default true,
  accepting_bookings boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_event_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  duration_minutes integer not null
    check (duration_minutes in (5,10,15,30)),
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 5,
  minimum_notice_minutes integer not null default 30,
  booking_window_days integer not null default 30,
  active boolean not null default true,
  public_bookable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_availability (
  id uuid primary key default uuid_generate_v4(),
  booking_admin_id uuid not null
    references public.booking_admins(id) on delete cascade,
  day_of_week integer not null check(day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Africa/Lagos',
  active boolean not null default true,
  unique(
    booking_admin_id,
    day_of_week,
    start_time,
    end_time
  )
);

create table if not exists public.booking_overrides (
  id uuid primary key default uuid_generate_v4(),
  booking_admin_id uuid not null
    references public.booking_admins(id) on delete cascade,
  override_date date not null,
  available boolean not null default false,
  start_time time,
  end_time time,
  timezone text not null default 'Africa/Lagos',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),

  event_type_id uuid not null
    references public.booking_event_types(id),

  primary_admin_id uuid not null
    references public.booking_admins(id),

  secondary_admin_id uuid
    references public.booking_admins(id),

  merchant_id uuid references public.merchant_profiles(id)
    on delete set null,

  guest_name text not null,
  guest_email text not null,
  guest_phone text,

  start_at timestamptz not null,
  end_at timestamptz not null,
  guest_timezone text not null,

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
  meeting_url text,

  guest_notes text,
  admin_notes text,

  cancellation_token text unique,
  reschedule_token text unique,

  zoom_meeting_id text,
  zoom_join_url text,

  google_event_id text,

  confirmation_email_id text,
  reminder_email_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  booking_window tstzrange
    generated always as (
      tstzrange(start_at, end_at, '[)')
    ) stored
);

alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    booking_window with &&
  )
  where (
    status in (
      'pending',
      'confirmed',
      'rescheduled'
    )
  );

create index if not exists idx_booking_admin_slug
  on public.booking_admins(slug);

create index if not exists idx_booking_admin_active
  on public.booking_admins(active, accepting_bookings);

create index if not exists idx_booking_availability_admin
  on public.booking_availability(booking_admin_id, day_of_week);

create index if not exists idx_bookings_primary_admin
  on public.bookings(primary_admin_id);

create index if not exists idx_bookings_secondary_admin
  on public.bookings(secondary_admin_id);

create index if not exists idx_bookings_start_at
  on public.bookings(start_at);

create index if not exists idx_bookings_guest_email
  on public.bookings(guest_email);

alter table public.booking_admins enable row level security;
alter table public.booking_event_types enable row level security;
alter table public.booking_availability enable row level security;
alter table public.booking_overrides enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "booking_admin_public_read"
on public.booking_admins;

create policy "booking_admin_public_read"
on public.booking_admins
for select
using (
  active = true
  and accepting_bookings = true
);

drop policy if exists "booking_admin_admin"
on public.booking_admins;

create policy "booking_admin_admin"
on public.booking_admins
for all
using (is_admin())
with check (is_admin());

drop policy if exists "booking_event_public_read"
on public.booking_event_types;

create policy "booking_event_public_read"
on public.booking_event_types
for select
using (
  active = true
  and public_bookable = true
);

drop policy if exists "booking_event_admin"
on public.booking_event_types;

create policy "booking_event_admin"
on public.booking_event_types
for all
using (is_admin())
with check (is_admin());

drop policy if exists "booking_availability_public_read"
on public.booking_availability;

create policy "booking_availability_public_read"
on public.booking_availability
for select
using (
  exists (
    select 1
    from public.booking_admins ba
    where ba.id = booking_availability.booking_admin_id
      and ba.active = true
      and ba.accepting_bookings = true
  )
);

drop policy if exists "booking_availability_admin"
on public.booking_availability;

create policy "booking_availability_admin"
on public.booking_availability
for all
using (is_admin())
with check (is_admin());

drop policy if exists "booking_override_public_read"
on public.booking_overrides;

create policy "booking_override_public_read"
on public.booking_overrides
for select
using (
  exists (
    select 1
    from public.booking_admins ba
    where ba.id = booking_overrides.booking_admin_id
      and ba.active = true
      and ba.accepting_bookings = true
  )
);

drop policy if exists "booking_override_admin"
on public.booking_overrides;

create policy "booking_override_admin"
on public.booking_overrides
for all
using (is_admin())
with check (is_admin());

drop policy if exists "booking_admin_bookings"
on public.bookings;

create policy "booking_admin_bookings"
on public.bookings
for all
using (is_admin())
with check (is_admin());

drop policy if exists "booking_merchant_read"
on public.bookings;

create policy "booking_merchant_read"
on public.bookings
for select
using (
  merchant_id in (
    select id
    from public.merchant_profiles
    where profile_id = auth.uid()
  )
);

insert into public.booking_event_types
  (name, slug, description, duration_minutes)
values
  (
    '5 Minute Quick Call',
    'quick-5',
    'A quick GiftGrid introduction or question.',
    5
  ),
  (
    '10 Minute Quick Call',
    'quick-10',
    'A short focused GiftGrid consultation.',
    10
  ),
  (
    '15 Minute Consultation',
    'consultation-15',
    'A focused discussion about your store or opportunity.',
    15
  ),
  (
    '30 Minute Consultation',
    'consultation-30',
    'A full GiftGrid consultation.',
    30
  )
on conflict (slug) do nothing;
