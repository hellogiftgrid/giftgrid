create or replace function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql stable security definer set search_path = public, storage as $$ select true; $$;
create or replace function public.merchant_can_list(merchant uuid) returns boolean
language sql stable security definer set search_path = public as $$ select true; $$;
drop policy if exists listing_trade_deck_visibility on public.merchant_listings;
drop trigger if exists listing_quota_guard on public.merchant_listings;
drop function if exists public.enforce_listing_quota();
drop function if exists public.merchant_listing_quota(uuid);
drop function if exists public.unlist_merchants_past_grace();
