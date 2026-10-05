-- Additive: legacy accounts keep access; only new merchants have required setup.
alter table public.merchant_profiles
  add column if not exists country text,
  add column if not exists business_description text,
  add column if not exists onboarding_required boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- Production documents have file_url; retain that controlled URL and add the private object reference.
alter table public.documents add column if not exists storage_path text;

create or replace function public.require_new_merchant_onboarding()
returns trigger language plpgsql set search_path = public as $$
begin
  new.onboarding_required := true;
  new.onboarding_completed_at := null;
  return new;
end;
$$;
create trigger require_new_merchant_onboarding
before insert on public.merchant_profiles
for each row execute function public.require_new_merchant_onboarding();

-- Direct browser writes cannot bypass authenticated server completion checks.
create or replace function public.protect_merchant_onboarding()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') and
    (new.onboarding_required is distinct from old.onboarding_required or
     new.onboarding_completed_at is distinct from old.onboarding_completed_at) then
    raise exception 'Merchant onboarding must be completed through GiftGrid setup';
  end if;
  return new;
end;
$$;
create trigger protect_merchant_onboarding
before update on public.merchant_profiles
for each row execute function public.protect_merchant_onboarding();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('trade-decks','trade-decks',false,4194304,
  array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Writes use the authenticated merchant API. Owners may read their own files.
create policy "trade_decks_merchant_read" on storage.objects for select to authenticated
using (bucket_id = 'trade-decks' and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'merchant'));

-- A single anonymous aggregate; no per-download records or personal data.
create table public.app_download_counts (
  platform text primary key check (platform = 'android'),
  download_starts bigint not null default 0 check (download_starts >= 0)
);
alter table public.app_download_counts enable row level security;
revoke all on public.app_download_counts from anon, authenticated;
grant all on public.app_download_counts to service_role;
create or replace function public.record_android_download()
returns void language sql security definer set search_path = public as $$
  insert into public.app_download_counts (platform,download_starts) values ('android',1)
  on conflict (platform) do update set download_starts = app_download_counts.download_starts + 1;
$$;
revoke all on function public.record_android_download() from public, anon, authenticated;
grant execute on function public.record_android_download() to service_role;
