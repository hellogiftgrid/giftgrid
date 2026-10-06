-- GiftGrid update pack: trade deck compulsory, reviews + AI rating,
-- multiple buyer profiles, merchant ranking, campaign emailing,
-- message notification emails, support outreach log.

-- 1. Trade deck compulsory --------------------------------------------------
create or replace function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql stable security definer set search_path = public, storage
as $$
  select exists(select 1 from public.documents d
    join public.merchant_profiles m on m.id = d.merchant_id
    join storage.objects o on o.bucket_id = 'trade-decks' and o.name = d.storage_path
   where m.id = merchant and d.file_type = 'pdf' and d.review_status = 'approved'
     and d.storage_path like m.user_id::text || '/%');
$$;

create or replace function public.merchant_can_list(merchant uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select public.merchant_has_trade_deck(merchant);
$$;

revoke all on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) from public;
grant execute on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) to anon, authenticated, service_role;

drop policy if exists listing_trade_deck_visibility on public.merchant_listings;
create policy listing_trade_deck_visibility on public.merchant_listings
  for select to anon, authenticated
  using (status <> 'published' or public.merchant_can_list(merchant_id));

-- 2. Listing reviews + AI rating -------------------------------------------
alter table public.merchant_listings
  add column if not exists click_count integer not null default 0,
  add column if not exists impression_count integer not null default 0,
  add column if not exists review_count integer not null default 0,
  add column if not exists average_rating numeric(3,2) not null default 0,
  add column if not exists ai_rating numeric(3,2) not null default 0;

create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.merchant_listings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, profile_id)
);
alter table public.listing_reviews enable row level security;
drop policy if exists "listing_reviews_read" on public.listing_reviews;
create policy "listing_reviews_read" on public.listing_reviews for select using (true);
drop policy if exists "listing_reviews_insert" on public.listing_reviews;
create policy "listing_reviews_insert" on public.listing_reviews for insert to authenticated with check (profile_id = auth.uid());
drop policy if exists "listing_reviews_update" on public.listing_reviews;
create policy "listing_reviews_update" on public.listing_reviews for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists "listing_reviews_delete" on public.listing_reviews;
create policy "listing_reviews_delete" on public.listing_reviews for delete to authenticated using (profile_id = auth.uid());

-- AI rating blends review average with engagement (clicks per impression).
create or replace function public.compute_ai_rating(clicks bigint, impressions bigint, review_avg numeric, reviews integer)
returns numeric language sql immutable as $$
  select round(greatest(0, least(5,
    coalesce(review_avg, 0) * 0.7
    + case when impressions > 0 then least(5, (clicks::numeric / impressions::numeric) * 25) else 0 end * 0.3
    + case when reviews > 0 then 0.5 else 0 end
  ))::numeric, 2);
$$;

create or replace function public.refresh_listing_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_listing uuid := coalesce(new.listing_id, old.listing_id);
  v_avg numeric; v_count integer;
begin
  select coalesce(avg(rating), 0), count(*) into v_avg, v_count from public.listing_reviews where listing_id = v_listing;
  update public.merchant_listings
     set average_rating = round(v_avg, 2), review_count = v_count,
         ai_rating = public.compute_ai_rating(click_count, impression_count, v_avg, v_count),
         updated_at = now()
   where id = v_listing;
  return null;
end $$;

drop trigger if exists listing_reviews_refresh on public.listing_reviews;
create trigger listing_reviews_refresh after insert or update or delete on public.listing_reviews
  for each row execute function public.refresh_listing_rating();

-- 3. Multiple buyer profiles per account ------------------------------------
alter table public.buyer_profiles drop constraint if exists buyer_profiles_profile_id_key;
alter table public.buyer_profiles add column if not exists is_primary boolean not null default false;
create index if not exists buyer_profiles_profile_idx on public.buyer_profiles(profile_id);

-- 4. Merchant ranking view ---------------------------------------------------
create or replace view public.merchant_ranking as
select m.id as merchant_id,
       m.business_name,
       m.business_category,
       m.country,
       coalesce(avg(l.ai_rating), 0)::numeric(3,2) as ai_rating,
       coalesce(avg(l.average_rating), 0)::numeric(3,2) as average_rating,
       coalesce(sum(l.click_count), 0) as clicks,
       count(l.id) filter (where l.status = 'published') as live_listings,
       rank() over (order by coalesce(avg(l.ai_rating), 0) desc, coalesce(sum(l.click_count), 0) desc, m.created_at asc) as rank
from public.merchant_profiles m
left join public.merchant_listings l on l.merchant_id = m.id
group by m.id, m.business_name, m.business_category, m.country, m.created_at;

-- 5. Campaigns ----------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html text not null,
  audience text not null default 'all' check (audience in ('all','merchant','buyer','community')),
  status text not null default 'draft' check (status in ('draft','sent','failed')),
  sent_count integer not null default 0,
  sent_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
drop policy if exists "campaigns_admin" on public.campaigns;
create policy "campaigns_admin" on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 6. Message notification email ----------------------------------------------
create or replace function public.queue_message_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_recipient uuid;
begin
  begin
    select case when requester_id = new.sender_id then recipient_id else requester_id end
      into v_recipient
      from public.community_connections where id = new.connection_id;
    insert into public.activity_email_events (event_type, owner_profile_id, actor_name, summary, href)
    select 'message', v_recipient, p.full_name, 'Sent you a new message', '/messages'
      from public.profiles p where p.id = new.sender_id;
    insert into public.notifications (profile_id, title, body) values (v_recipient, 'New message', left(new.body, 200));
  exception when others then
    -- Notification side-effects must never block the message itself.
    null;
  end;
  return new;
end $$;

drop trigger if exists community_messages_notify on public.community_connection_messages;
create trigger community_messages_notify after insert on public.community_connection_messages
  for each row execute function public.queue_message_email();

-- allow 'message' event type
alter table public.activity_email_events drop constraint if exists activity_email_events_event_type_check;
alter table public.activity_email_events add constraint activity_email_events_event_type_check
  check (event_type in ('buyer_inquiry','product_listing','post_comment','post_like','message','community_post','buyer_brief'));

-- 7. Support outreach log ------------------------------------------------------
create table if not exists public.support_outreach (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists support_outreach_profile_idx on public.support_outreach(profile_id, created_at desc);
alter table public.support_outreach enable row level security;
drop policy if exists "support_outreach_self_read" on public.support_outreach;
create policy "support_outreach_self_read" on public.support_outreach for select to authenticated using (profile_id = auth.uid());

-- Trade deck is optional (per product decision): visibility gating stays off.
create or replace function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql stable security definer set search_path = public, storage as $$ select true; $$;
create or replace function public.merchant_can_list(merchant uuid) returns boolean
language sql stable security definer set search_path = public as $$ select true; $$;
revoke all on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) from public;
grant execute on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) to anon, authenticated, service_role;
drop policy if exists listing_trade_deck_visibility on public.merchant_listings;

-- Fiverr-style likes on listings.
create table if not exists public.listing_likes (
  listing_id uuid not null references public.merchant_listings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, profile_id)
);
alter table public.listing_likes enable row level security;
drop policy if exists "listing_likes_read" on public.listing_likes;
create policy "listing_likes_read" on public.listing_likes for select using (true);
drop policy if exists "listing_likes_insert" on public.listing_likes;
create policy "listing_likes_insert" on public.listing_likes for insert to authenticated with check (profile_id = auth.uid());
drop policy if exists "listing_likes_delete" on public.listing_likes;
create policy "listing_likes_delete" on public.listing_likes for delete to authenticated using (profile_id = auth.uid());

alter table public.merchant_listings add column if not exists like_count integer not null default 0;

-- Auto-follow the official GiftGrid account for every new (and existing) member.
create or replace function public.giftgrid_official_profile() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profiles where is_active and role in ('super_admin','admin') order by created_at asc limit 1;
$$;

create or replace function public.auto_follow_giftgrid() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  official uuid := public.giftgrid_official_profile();
begin
  begin
    if official is not null and new.id <> official then
      insert into public.community_follows(follower_id, followed_id)
      values (new.id, official)
      on conflict (follower_id, followed_id) do nothing;
    end if;
  exception when others then
    null;
  end;
  return new;
end $$;

drop trigger if exists profiles_auto_follow_giftgrid on public.profiles;
create trigger profiles_auto_follow_giftgrid after insert on public.profiles
  for each row execute function public.auto_follow_giftgrid();

insert into public.community_follows(follower_id, followed_id)
select p.id, o.id from public.profiles p
cross join lateral (select public.giftgrid_official_profile() as id) o
where p.is_active and p.id <> o.id
on conflict (follower_id, followed_id) do nothing;

-- No buyer approval gating: all buyers start approved.
alter table public.buyer_profiles alter column status set default 'approved';
update public.buyer_profiles set status = 'approved' where status = 'pending';
