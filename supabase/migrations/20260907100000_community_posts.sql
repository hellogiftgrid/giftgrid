create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 1 and 120),
  topic text not null default 'General' check (char_length(trim(topic)) between 1 and 40),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  status text not null default 'published' check (status in ('published','hidden','removed')),
  system_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_posts alter column author_id drop not null;
alter table public.community_posts add column if not exists system_key text;
create unique index if not exists community_posts_system_key_idx on public.community_posts(system_key) where system_key is not null;

create index if not exists community_posts_published_created_idx
  on public.community_posts (created_at desc)
  where status = 'published';

alter table public.community_posts enable row level security;

drop policy if exists community_posts_public_read on public.community_posts;
create policy community_posts_public_read on public.community_posts
  for select using (status = 'published' or author_id = auth.uid() or public.is_admin());

drop policy if exists community_posts_member_insert on public.community_posts;
create policy community_posts_member_insert on public.community_posts
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists community_posts_author_update on public.community_posts;
create policy community_posts_author_update on public.community_posts
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists community_posts_author_delete on public.community_posts;
create policy community_posts_author_delete on public.community_posts
  for delete using (author_id = auth.uid() or public.is_admin());
