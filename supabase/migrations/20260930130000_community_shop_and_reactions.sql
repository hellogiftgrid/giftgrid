create table public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,member_id)
);
create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(btrim(body)) between 1 and 1500),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index community_comments_post_idx on public.community_comments(post_id,created_at);
alter table public.community_likes enable row level security;
alter table public.community_comments enable row level security;
create policy "likes_owner_read" on public.community_likes for select to authenticated using (member_id = auth.uid());
create policy "likes_member_insert" on public.community_likes for insert to authenticated
with check (member_id = auth.uid() and exists (select 1 from public.community_posts where id = post_id and status = 'published'));
create policy "likes_owner_delete" on public.community_likes for delete to authenticated using (member_id = auth.uid());
create policy "comments_public_read" on public.community_comments for select
using (status = 'published' and exists (select 1 from public.community_posts where id = post_id and status = 'published'));
create policy "comments_member_insert" on public.community_comments for insert to authenticated
with check (author_id = auth.uid() and status = 'published'
  and author_name = coalesce((select left(nullif(btrim(full_name),''),120) from public.profiles where id = auth.uid()),'GiftGrid member')
  and exists (select 1 from public.community_posts where id = post_id and status = 'published'));
create policy "comments_owner_delete" on public.community_comments for delete to authenticated using (author_id = auth.uid());
grant select,insert,delete on public.community_likes to authenticated;
grant select on public.community_comments to anon;
grant select,insert,delete on public.community_comments to authenticated;
grant all on public.community_likes,public.community_comments to service_role;

create function public.community_post_stats(post_ids uuid[],viewer uuid default null)
returns table(post_id uuid,like_count bigint,comment_count bigint,liked boolean)
language sql stable security definer set search_path = public as $$
  select p.id,
    (select count(*) from public.community_likes l where l.post_id=p.id),
    (select count(*) from public.community_comments c where c.post_id=p.id and c.status='published'),
    exists(select 1 from public.community_likes l where l.post_id=p.id and l.member_id=viewer)
  from public.community_posts p where p.id=any(post_ids) and p.status='published';
$$;
revoke all on function public.community_post_stats(uuid[],uuid) from public,anon,authenticated;
grant execute on function public.community_post_stats(uuid[],uuid) to service_role;

create function public.shop_categories()
returns table(category text,product_count bigint)
language sql stable security definer set search_path = public as $$
  select category,count(*) from public.merchant_listings where status='published' group by category order by category;
$$;
revoke all on function public.shop_categories() from public,anon,authenticated;
grant execute on function public.shop_categories() to service_role;
