-- GiftGrid buyer-to-merchant marketplace (payments intentionally excluded).
-- Apply after 0001_init_schema.sql and 0002_rls_policies.sql.

create table if not exists public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null,
  website text,
  job_title text,
  phone text,
  company_size text,
  buying_categories text[] not null default '{}',
  annual_gifting_budget text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buyer_applications (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null unique references public.buyer_profiles(id) on delete cascade,
  use_case text,
  estimated_recipients integer,
  desired_timeline text,
  requirements text,
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'needs_info', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);

create table if not exists public.merchant_listings (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
  title text not null,
  short_description text not null,
  description text,
  hero_image_url text,
  category text not null,
  minimum_order_quantity integer not null default 1,
  price_range text,
  lead_time text,
  ships_internationally boolean not null default false,
  customization_available boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buyer_inquiries (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyer_profiles(id) on delete cascade,
  merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
  listing_id uuid references public.merchant_listings(id) on delete set null,
  subject text not null,
  message text not null,
  quantity integer,
  target_date date,
  budget text,
  status text not null default 'sent'
    check (status in ('sent', 'viewed', 'accepted', 'declined', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connection_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.buyer_inquiries(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists buyer_profiles_profile_idx on public.buyer_profiles(profile_id);
create index if not exists merchant_listings_status_idx on public.merchant_listings(status, category);
create index if not exists buyer_inquiries_buyer_idx on public.buyer_inquiries(buyer_id, created_at desc);
create index if not exists buyer_inquiries_merchant_idx on public.buyer_inquiries(merchant_id, created_at desc);
create index if not exists connection_messages_inquiry_idx on public.connection_messages(inquiry_id, created_at);

alter table public.buyer_profiles enable row level security;
alter table public.buyer_applications enable row level security;
alter table public.merchant_listings enable row level security;
alter table public.buyer_inquiries enable row level security;
alter table public.connection_messages enable row level security;

create policy "buyers_read_own_profile" on public.buyer_profiles for select
  using (profile_id = auth.uid() or public.is_admin());
create policy "buyers_update_own_profile" on public.buyer_profiles for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy "admins_manage_buyers" on public.buyer_profiles for all
  using (public.is_admin()) with check (public.is_admin());

create policy "buyers_read_own_application" on public.buyer_applications for select
  using (buyer_id in (select id from public.buyer_profiles where profile_id = auth.uid()) or public.is_admin());
create policy "buyers_create_own_application" on public.buyer_applications for insert
  with check (buyer_id in (select id from public.buyer_profiles where profile_id = auth.uid()));
create policy "admins_manage_buyer_applications" on public.buyer_applications for all
  using (public.is_admin()) with check (public.is_admin());

create policy "published_listings_are_visible" on public.merchant_listings for select
  using (
    status = 'published'
    or merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
    or public.is_admin()
  );
create policy "merchants_manage_own_listings" on public.merchant_listings for all
  using (merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid()) or public.is_admin())
  with check (merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid()) or public.is_admin());

create policy "inquiry_participants_read" on public.buyer_inquiries for select
  using (
    buyer_id in (select id from public.buyer_profiles where profile_id = auth.uid())
    or merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
    or public.is_admin()
  );
create policy "approved_buyers_create_inquiries" on public.buyer_inquiries for insert
  with check (
    buyer_id in (select id from public.buyer_profiles where profile_id = auth.uid() and status = 'approved')
  );
create policy "inquiry_participants_update" on public.buyer_inquiries for update
  using (
    buyer_id in (select id from public.buyer_profiles where profile_id = auth.uid())
    or merchant_id in (select id from public.merchant_profiles where profile_id = auth.uid())
    or public.is_admin()
  );

create policy "connection_participants_read" on public.connection_messages for select
  using (inquiry_id in (select id from public.buyer_inquiries));
create policy "connection_participants_write" on public.connection_messages for insert
  with check (sender_id = auth.uid() and inquiry_id in (select id from public.buyer_inquiries));

-- Creates the correct workspace record directly from sign-up metadata.
create or replace function public.handle_new_giftgrid_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data->>'account_type', 'merchant');
  new_buyer_id uuid;
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case when requested_role = 'corporate_buyer' then 'corporate_buyer'::user_role else 'merchant'::user_role end,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;

  if requested_role = 'corporate_buyer' then
    insert into public.buyer_profiles (profile_id, company_name, website, job_title, company_size, annual_gifting_budget, buying_categories)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'company_name', 'Unnamed company'),
      new.raw_user_meta_data->>'website',
      new.raw_user_meta_data->>'job_title',
      new.raw_user_meta_data->>'company_size',
      new.raw_user_meta_data->>'annual_gifting_budget',
      case when new.raw_user_meta_data ? 'buying_categories'
        then array(select jsonb_array_elements_text(new.raw_user_meta_data->'buying_categories'))
        else '{}'::text[] end
    )
    returning id into new_buyer_id;

    insert into public.buyer_applications (buyer_id, use_case, estimated_recipients, desired_timeline, requirements)
    values (
      new_buyer_id,
      new.raw_user_meta_data->>'use_case',
      nullif(new.raw_user_meta_data->>'estimated_recipients', '')::integer,
      new.raw_user_meta_data->>'desired_timeline',
      new.raw_user_meta_data->>'requirements'
    );
  else
    insert into public.merchant_profiles (profile_id, business_name, contact_email, business_email)
    values (new.id, coalesce(new.raw_user_meta_data->>'business_name', 'Unnamed brand'), new.email, new.email)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_giftgrid on auth.users;
create trigger on_auth_user_created_giftgrid
  after insert on auth.users for each row execute procedure public.handle_new_giftgrid_user();
