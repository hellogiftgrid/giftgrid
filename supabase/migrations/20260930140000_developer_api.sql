create table public.developer_apps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);
create index developer_apps_owner_idx on public.developer_apps(owner_id,created_at desc);
create table public.developer_api_keys (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  key_hash text not null unique,
  prefix text not null,
  scopes text[] not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index developer_keys_owner_idx on public.developer_api_keys(owner_id,created_at desc);
create table public.developer_webhooks (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  url text not null check (url like 'https://%'),
  events text[] not null,
  created_at timestamptz not null default now(),
  unique(app_id,url)
);
create index developer_webhooks_owner_idx on public.developer_webhooks(owner_id,created_at desc);
alter table public.developer_apps enable row level security;
alter table public.developer_api_keys enable row level security;
alter table public.developer_webhooks enable row level security;
create policy "developer_apps_owner_read" on public.developer_apps for select to authenticated using (owner_id=auth.uid());
create policy "developer_keys_owner_read" on public.developer_api_keys for select to authenticated using (owner_id=auth.uid());
create policy "developer_webhooks_owner_read" on public.developer_webhooks for select to authenticated using (owner_id=auth.uid());
revoke all on public.developer_apps,public.developer_api_keys,public.developer_webhooks from anon,authenticated;
grant select on public.developer_apps,public.developer_webhooks to authenticated;
grant select (id,app_id,owner_id,prefix,scopes,expires_at,revoked_at,created_at) on public.developer_api_keys to authenticated;
grant all on public.developer_apps,public.developer_api_keys,public.developer_webhooks to service_role;
