-- Public article content, private OAuth connections, and resumable publication records.
create table if not exists public.blog_articles (
 slug text primary key,
 article jsonb not null,
 status text not null default 'published' check (status in ('draft','published')),
 published_at timestamptz not null default now()
);
alter table public.blog_articles enable row level security;
create policy blog_articles_public_read on public.blog_articles for select using (status = 'published');
create policy blog_articles_admin on public.blog_articles for all using (public.is_admin()) with check (public.is_admin());
create table if not exists public.blog_connections (
 blog_id text primary key,
 hostname text unique not null,
 name text not null,
 encrypted_refresh_token text not null,
 connected_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.blog_connections enable row level security;
revoke all on public.blog_connections from anon, authenticated;
grant all on public.blog_connections to service_role;
create table if not exists public.blog_publications (
 slug text not null,
 blog_id text not null references public.blog_connections(blog_id),
 post_id text,
 url text,
 status text not null default 'pending' check (status in ('pending','published','failed')),
 error text,
 updated_at timestamptz not null default now(),
 primary key(slug, blog_id)
);
alter table public.blog_publications enable row level security;
create policy blog_publications_admin_read on public.blog_publications for select using (public.is_admin());
create table if not exists public.blog_jobs (
 id text primary key,
 lease_until timestamptz not null,
 completed_at timestamptz,
 result jsonb
);
alter table public.blog_jobs enable row level security;
create or replace function public.claim_blog_job(job_id text) returns boolean
language plpgsql security definer set search_path = public as $$
declare claimed text;
begin
 insert into public.blog_jobs(id,lease_until) values(job_id,now()+interval '10 minutes')
 on conflict(id) do update set lease_until=now()+interval '10 minutes'
 where blog_jobs.completed_at is null and blog_jobs.lease_until < now()
 returning id into claimed;
 return claimed is not null;
end; $$;
revoke all on function public.claim_blog_job(text) from public,anon,authenticated;
grant execute on function public.claim_blog_job(text) to service_role;
-- Keep appearance public while ensuring editor drafts cannot be read anonymously.
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select
using (key in ('site_design','site_pages','site_sections') or public.is_admin());
