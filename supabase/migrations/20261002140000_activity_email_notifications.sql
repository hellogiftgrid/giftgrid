create table if not exists public.activity_email_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('buyer_inquiry', 'product_listing', 'post_comment', 'post_like')),
  owner_profile_id uuid,
  actor_name text not null,
  summary text not null,
  image_url text,
  href text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  ignored_at timestamptz
);
create index if not exists activity_email_events_pending_idx
  on public.activity_email_events (created_at)
  where sent_at is null and ignored_at is null;
create index if not exists activity_email_events_daily_idx
  on public.activity_email_events (created_at desc, event_type);
alter table public.activity_email_events enable row level security;
revoke all on public.activity_email_events from anon, authenticated;
grant all on public.activity_email_events to service_role;

create table if not exists public.activity_email_summaries (
  summary_date date primary key,
  sent_at timestamptz not null default now()
);
alter table public.activity_email_summaries enable row level security;
revoke all on public.activity_email_summaries from anon, authenticated;
grant all on public.activity_email_summaries to service_role;

create or replace function public.queue_buyer_inquiry_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare buyer_name text; merchant_name text; product_title text; product_image text;
begin
  select company_name into buyer_name from public.buyer_profiles where id=new.buyer_id;
  select business_name into merchant_name from public.merchant_profiles where id=new.merchant_id;
  select title,hero_image_url into product_title,product_image from public.merchant_listings where id=new.listing_id;
  insert into public.activity_email_events(event_type,actor_name,summary,image_url,href)
  values('buyer_inquiry',coalesce(buyer_name,'Buyer'),coalesce(buyer_name,'A buyer') || ' requested ' || coalesce(product_title,new.subject) || ' from ' || coalesce(merchant_name,'a merchant'),product_image,'/admin/marketplace');
  return new;
end; $$;
drop trigger if exists queue_buyer_inquiry_email on public.buyer_inquiries;
create trigger queue_buyer_inquiry_email after insert on public.buyer_inquiries
for each row execute function public.queue_buyer_inquiry_email();

create or replace function public.queue_product_listing_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare merchant_name text;
begin
  if new.status <> 'pending_review' then return new; end if;
  select business_name into merchant_name from public.merchant_profiles where id=new.merchant_id;
  insert into public.activity_email_events(event_type,actor_name,summary,image_url,href)
  values('product_listing',coalesce(merchant_name,'Merchant'),coalesce(merchant_name,'A merchant') || ' submitted ' || new.title || ' for review',new.hero_image_url,'/admin/marketplace');
  return new;
end; $$;
drop trigger if exists queue_product_listing_email on public.merchant_listings;
create trigger queue_product_listing_email after insert or update of status on public.merchant_listings
for each row execute function public.queue_product_listing_email();

create or replace function public.queue_post_comment_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare post_owner uuid; post_image text;
begin
  if new.status <> 'published' then return new; end if;
  select author_id,image_url into post_owner,post_image from public.community_posts where id=new.post_id and status='published';
  if post_owner is null then return new; end if;
  insert into public.activity_email_events(event_type,owner_profile_id,actor_name,summary,image_url,href)
  values('post_comment',post_owner,new.author_name,new.author_name || ' commented on your post: ' || left(new.body,240),post_image,'/community');
  return new;
end; $$;
drop trigger if exists queue_post_comment_email on public.community_comments;
create trigger queue_post_comment_email after insert on public.community_comments
for each row execute function public.queue_post_comment_email();

create or replace function public.queue_post_like_email()
returns trigger language plpgsql security definer set search_path=public as $$
declare post_owner uuid; post_image text; actor text;
begin
  select author_id,image_url into post_owner,post_image from public.community_posts where id=new.post_id and status='published';
  if post_owner is null or post_owner=new.member_id then return new; end if;
  select coalesce(nullif(btrim(full_name),''),'GiftGrid member') into actor from public.profiles where id=new.member_id;
  insert into public.activity_email_events(event_type,owner_profile_id,actor_name,summary,image_url,href)
  values('post_like',post_owner,coalesce(actor,'GiftGrid member'),coalesce(actor,'A GiftGrid member') || ' liked your community post',post_image,'/community');
  return new;
end; $$;
drop trigger if exists queue_post_like_email on public.community_likes;
create trigger queue_post_like_email after insert on public.community_likes
for each row execute function public.queue_post_like_email();

revoke all on function public.queue_buyer_inquiry_email(),public.queue_product_listing_email(),public.queue_post_comment_email(),public.queue_post_like_email() from public,anon,authenticated;
