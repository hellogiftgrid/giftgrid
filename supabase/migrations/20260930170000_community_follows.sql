create table public.community_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,followed_id),
  check(follower_id<>followed_id)
);
create index community_follows_followed_idx on public.community_follows(followed_id);
alter table public.community_follows enable row level security;
create policy "follows_owner_read" on public.community_follows for select to authenticated using(follower_id=auth.uid());
create policy "follows_owner_insert" on public.community_follows for insert to authenticated with check(follower_id=auth.uid() and exists(select 1 from public.profiles p where p.id=followed_id and p.is_active));
create policy "follows_owner_delete" on public.community_follows for delete to authenticated using(follower_id=auth.uid());
grant select,insert,delete on public.community_follows to authenticated;
grant all on public.community_follows to service_role;
create function public.community_follower_counts(member_ids uuid[])
returns table(profile_id uuid,follower_count bigint)
language sql stable security definer set search_path=public as $$
select followed_id,count(*) from public.community_follows where followed_id=any(member_ids) group by followed_id;
$$;
revoke all on function public.community_follower_counts(uuid[]) from public,anon,authenticated;
grant execute on function public.community_follower_counts(uuid[]) to service_role;
