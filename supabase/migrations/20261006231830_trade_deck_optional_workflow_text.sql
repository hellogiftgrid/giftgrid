create or replace function public.sync_merchant_workflow(target_merchant uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.merchant_profiles m join public.profiles p on p.id=m.user_id where m.id=target_merchant and p.role='merchant') then return; end if;
 if exists(select 1 from public.merchant_workflow_preferences where merchant_id=target_merchant and not enabled) then return; end if;
 perform 1 from public.merchant_profiles where id=target_merchant for update;
 update public.merchant_workflow_tasks set resolved=true,updated_at=now() where merchant_id=target_merchant and not resolved;
 insert into public.merchant_workflow_tasks(merchant_id,source_type,source_id,title,detail,href)
 select m.id,'profile',m.id,'Complete your merchant profile','Add your business details to finish merchant setup. A trade deck is optional and can be added anytime from your profile.','/dashboard/profile'
 from public.merchant_profiles m where m.id=target_merchant and m.onboarding_required and m.onboarding_completed_at is null
 on conflict(merchant_id,source_type,source_id) do update set resolved=false,updated_at=now();
 insert into public.merchant_workflow_tasks(merchant_id,source_type,source_id,title,detail,href)
 select l.merchant_id,'listing',l.id,'Complete product: ' || l.title,'Add a product image and full description.','/dashboard/listings'
 from public.merchant_listings l where l.merchant_id=target_merchant and (nullif(btrim(l.hero_image_url),'') is null or nullif(btrim(l.description),'') is null)
 on conflict(merchant_id,source_type,source_id) do update set title=excluded.title,resolved=false,updated_at=now();
 insert into public.merchant_workflow_tasks(merchant_id,source_type,source_id,title,detail,href)
 select i.merchant_id,'inquiry',i.id,'Respond to: ' || i.subject,'Review this buyer request and accept or decline the connection.','/dashboard/connections'
 from public.buyer_inquiries i where i.merchant_id=target_merchant and i.status in ('sent','viewed')
 on conflict(merchant_id,source_type,source_id) do update set title=excluded.title,resolved=false,updated_at=now();
end;
$$;
