-- One 72-hour period per merchant, beginning with their first listing.
-- Existing listed merchants get 72 hours from rollout. Saving/deleting products never resets it.
alter table public.merchant_profiles add column listing_grace_started_at timestamptz;
update public.merchant_profiles m set listing_grace_started_at=now()
where exists(select 1 from public.merchant_listings l where l.merchant_id=m.id);

create function public.protect_listing_grace() returns trigger language plpgsql set search_path=public as $$
begin
 if current_user not in ('postgres','service_role','supabase_admin') then
  if TG_OP='INSERT' then new.listing_grace_started_at:=null;
  elsif new.listing_grace_started_at is distinct from old.listing_grace_started_at then
   raise exception 'Listing grace period cannot be changed';
  end if;
 end if;
 return new;
end; $$;
create trigger protect_listing_grace before insert or update on public.merchant_profiles
for each row execute function public.protect_listing_grace();

create function public.start_listing_grace() returns trigger language plpgsql security definer set search_path=public as $$
begin
 update public.merchant_profiles set listing_grace_started_at=now()
 where id=new.merchant_id and listing_grace_started_at is null;
 return new;
end; $$;
revoke all on function public.start_listing_grace() from public;
create trigger start_listing_grace before insert on public.merchant_listings
for each row execute function public.start_listing_grace();

create function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.documents d
 join public.merchant_profiles m on m.id=d.merchant_id
 join storage.objects o on o.bucket_id='trade-decks' and o.name=d.storage_path
 where m.id=merchant and d.file_type='pdf'
 and d.storage_path like m.user_id::text || '/%');
$$;
create function public.merchant_can_list(merchant uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select p.role in ('admin','super_admin') or
 (p.role='merchant' and (public.merchant_has_trade_deck(m.id) or
 m.listing_grace_started_at + interval '72 hours' > now()))
 from public.merchant_profiles m join public.profiles p on p.id=m.user_id
 where m.id=merchant and p.is_active=true),false);
$$;
revoke all on function public.merchant_has_trade_deck(uuid),public.merchant_can_list(uuid) from public;
grant execute on function public.merchant_has_trade_deck(uuid),public.merchant_can_list(uuid) to anon,authenticated,service_role;

-- Restrictive policy applies in addition to existing owner/admin/public policies.
create policy listing_trade_deck_visibility on public.merchant_listings as restrictive for select
using (public.is_admin() or merchant_id in (select id from public.merchant_profiles where user_id=auth.uid())
 or (status='published' and public.merchant_can_list(merchant_id)));
-- Public API uses a service-role client, so the view also enforces eligibility explicitly.
create view public.shop_visible_listings with (security_invoker=true) as
 select * from public.merchant_listings where status='published' and public.merchant_can_list(merchant_id);
grant select on public.shop_visible_listings to anon,authenticated,service_role;
create or replace function public.shop_categories() returns table(category text,product_count bigint)
language sql stable security definer set search_path=public as $$
 select category,count(*) from public.shop_visible_listings group by category order by category;
$$;
