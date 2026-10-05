-- Internal follow-up tasks only: no outgoing messages or external actions.
create table public.merchant_workflow_preferences (
 merchant_id uuid primary key references public.merchant_profiles(id) on delete cascade,
 enabled boolean not null default true
);
create table public.merchant_workflow_tasks (
 id uuid primary key default gen_random_uuid(),
 merchant_id uuid not null references public.merchant_profiles(id) on delete cascade,
 source_type text not null check(source_type in ('profile','listing','inquiry')),
 source_id uuid not null,
 title text not null,
 detail text not null,
 href text not null,
 status text not null default 'todo' check(status in ('todo','in_progress','done')),
 resolved boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(merchant_id,source_type,source_id)
);
alter table public.merchant_workflow_preferences enable row level security;
alter table public.merchant_workflow_tasks enable row level security;
create policy workflow_preferences_owner_read on public.merchant_workflow_preferences for select to authenticated
 using(exists(select 1 from public.merchant_profiles m where m.id=merchant_id and m.user_id=auth.uid()));
create policy workflow_tasks_owner_read on public.merchant_workflow_tasks for select to authenticated
 using(exists(select 1 from public.merchant_profiles m where m.id=merchant_id and m.user_id=auth.uid()));
revoke all on public.merchant_workflow_preferences,public.merchant_workflow_tasks from anon,authenticated;
grant select on public.merchant_workflow_preferences,public.merchant_workflow_tasks to authenticated;
grant all on public.merchant_workflow_preferences,public.merchant_workflow_tasks to service_role;

create function public.sync_merchant_workflow(target_merchant uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.merchant_profiles m join public.profiles p on p.id=m.user_id where m.id=target_merchant and p.role='merchant') then return; end if;
 if exists(select 1 from public.merchant_workflow_preferences where merchant_id=target_merchant and not enabled) then return; end if;
 -- Serialise concurrent events to prevent duplicate tasks and stale resolution.
 perform 1 from public.merchant_profiles where id=target_merchant for update;
 update public.merchant_workflow_tasks set resolved=true,updated_at=now() where merchant_id=target_merchant and not resolved;
 insert into public.merchant_workflow_tasks(merchant_id,source_type,source_id,title,detail,href)
 select m.id,'profile',m.id,'Complete your merchant profile','Add your business details and trade deck to finish merchant setup.','/dashboard/profile'
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
revoke all on function public.sync_merchant_workflow(uuid) from public,anon,authenticated;
grant execute on function public.sync_merchant_workflow(uuid) to service_role;
create function public.refresh_merchant_workflow() returns trigger
language plpgsql security definer set search_path=public as $$
declare target_merchant uuid;
begin
 if tg_table_name='merchant_profiles' then target_merchant:=new.id;
 elsif tg_op='DELETE' then target_merchant:=old.merchant_id;
 else target_merchant:=new.merchant_id;
 end if;
 perform public.sync_merchant_workflow(target_merchant);
 return null;
end;
$$;
revoke all on function public.refresh_merchant_workflow() from public,anon,authenticated;
create trigger workflow_profile_changed after insert or update of onboarding_required,onboarding_completed_at on public.merchant_profiles for each row execute function public.refresh_merchant_workflow();
create trigger workflow_listing_changed after insert or update or delete on public.merchant_listings for each row execute function public.refresh_merchant_workflow();
create trigger workflow_inquiry_changed after insert or update or delete on public.buyer_inquiries for each row execute function public.refresh_merchant_workflow();
