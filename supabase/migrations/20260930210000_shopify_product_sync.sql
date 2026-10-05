-- Private Shopify credentials, single-use OAuth handoffs, and durable product-sync jobs.
create table public.shopify_connections (
 id uuid primary key default gen_random_uuid(), merchant_id uuid not null unique references public.merchant_profiles(id) on delete cascade,
 shop text not null unique check (shop ~ '^[a-z0-9][a-z0-9-]*\.myshopify\.com$'),
 token_cipher text, refresh_cipher text, expires_at timestamptz, refresh_expires_at timestamptz,
 active boolean not null default true, scope text not null default '', last_synced_at timestamptz,
 last_error text, lock_token uuid, lock_until timestamptz, created_at timestamptz not null default now()
);
create table public.shopify_oauth_states (
 id uuid primary key default gen_random_uuid(), merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
 shop text not null, ticket_hash text unique, state_hash text unique, browser_hash text,
 expires_at timestamptz not null default now()+interval '10 minutes'
);
create table public.shopify_sync_jobs (
 id uuid primary key default gen_random_uuid(), connection_id uuid not null references public.shopify_connections(id) on delete cascade,
 event_id text not null unique, product_id text, cursor text, attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index shopify_sync_jobs_due on public.shopify_sync_jobs(next_attempt_at,created_at);
alter table public.shopify_connections enable row level security;
alter table public.shopify_oauth_states enable row level security;
alter table public.shopify_sync_jobs enable row level security;
revoke all on public.shopify_connections,public.shopify_oauth_states,public.shopify_sync_jobs from anon,authenticated;
grant all on public.shopify_connections,public.shopify_oauth_states,public.shopify_sync_jobs to service_role;

alter table public.merchant_listings add column shopify_connection_id uuid references public.shopify_connections(id) on delete cascade,
 add column shopify_product_id text, add column shopify_synced_at timestamptz,
 add column shopify_suppressed boolean not null default false,
 add column available_quantity integer;
create unique index merchant_listings_shopify_unique on public.merchant_listings(shopify_connection_id,shopify_product_id);

create function public.protect_shopify_listing_source() returns trigger language plpgsql set search_path=public as $$
begin
 if current_user not in ('postgres','service_role','supabase_admin') then
  if TG_OP='INSERT' and (new.shopify_connection_id is not null or new.shopify_product_id is not null) then raise exception 'Shopify products must be imported through GiftGrid'; end if;
  if TG_OP='UPDATE' then
   if new.shopify_connection_id is distinct from old.shopify_connection_id or new.shopify_product_id is distinct from old.shopify_product_id or new.shopify_synced_at is distinct from old.shopify_synced_at then raise exception 'Shopify source cannot be changed'; end if;
   if new.shopify_connection_id is not null and new.status in ('archived','rejected') and new.status is distinct from old.status then new.shopify_suppressed:=true; end if;
  end if;
 end if;
 return new;
end; $$;
create trigger protect_shopify_listing_source before insert or update on public.merchant_listings
for each row execute function public.protect_shopify_listing_source();

create function public.claim_shopify_connection(target uuid,lease uuid) returns setof public.shopify_connections
language sql security definer set search_path=public as $$
 update public.shopify_connections set lock_token=lease,lock_until=now()+interval '90 seconds'
 where id=target and active=true and (lock_until is null or lock_until<now()) returning *;
$$;
create function public.import_shopify_product(connection uuid,product jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare store public.shopify_connections;
begin
 select * into store from public.shopify_connections where id=connection for update;
 if not found or not store.active then return; end if;
 if product->>'id' is null then raise exception 'Missing Shopify product ID'; end if;
 if coalesce((product->>'deleted')::boolean,false) then
  update public.merchant_listings set status='archived',shopify_synced_at=now()
  where shopify_connection_id=connection and shopify_product_id=product->>'id';
  return;
 end if;
 insert into public.merchant_listings(merchant_id,title,short_description,description,hero_image_url,category,minimum_order_quantity,price_range,status,shopify_connection_id,shopify_product_id,shopify_synced_at,available_quantity)
 values(store.merchant_id,product->>'title',product->>'short_description',product->>'description',product->>'hero_image_url',product->>'category',50,product->>'price_range',product->>'status',connection,product->>'id',now(),(product->>'available_quantity')::integer)
 on conflict (shopify_connection_id,shopify_product_id) do update set
 title=excluded.title,short_description=excluded.short_description,description=excluded.description,
 hero_image_url=excluded.hero_image_url,category=excluded.category,price_range=excluded.price_range,
 available_quantity=excluded.available_quantity,shopify_synced_at=excluded.shopify_synced_at,
 status=case when merchant_listings.shopify_suppressed then 'archived' else excluded.status end;
end; $$;
revoke all on function public.claim_shopify_connection(uuid,uuid),public.import_shopify_product(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.claim_shopify_connection(uuid,uuid),public.import_shopify_product(uuid,jsonb) to service_role;
