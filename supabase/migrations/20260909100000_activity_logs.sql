create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists activity_logs_admin_read on public.activity_logs;
create policy activity_logs_admin_read on public.activity_logs
  for select using (public.is_admin() or actor_id = auth.uid());

drop policy if exists activity_logs_admin_insert on public.activity_logs;
create policy activity_logs_admin_insert on public.activity_logs
  for insert with check (public.is_admin() or actor_id = auth.uid());
