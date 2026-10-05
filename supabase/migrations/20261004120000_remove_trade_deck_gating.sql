drop policy if exists listing_trade_deck_visibility on public.merchant_listings;

create or replace function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select true;
$$;

create or replace function public.merchant_can_list(merchant uuid) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select true;
$$;

revoke all on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) from public;
grant execute on function public.merchant_has_trade_deck(uuid), public.merchant_can_list(uuid) to anon, authenticated, service_role;
