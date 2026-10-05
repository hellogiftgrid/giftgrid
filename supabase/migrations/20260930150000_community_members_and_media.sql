alter table public.community_posts add column if not exists image_url text;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community-media','community-media',true,4194304,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table public.community_member_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 120),
  kind text not null check(kind in ('merchant','buyer')),
  bio text check(char_length(bio)<=1000),
  country text,
  avatar_url text,
  is_listed boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.community_member_profiles enable row level security;
create policy "community_member_profile_read" on public.community_member_profiles for select
using(is_listed or profile_id=auth.uid());
revoke all on public.community_member_profiles from anon,authenticated;
grant select on public.community_member_profiles to anon,authenticated;
grant all on public.community_member_profiles to service_role;

create table public.community_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(requester_id<>recipient_id)
);
create unique index community_connection_pair_idx on public.community_connections(least(requester_id,recipient_id),greatest(requester_id,recipient_id));
create index community_connections_recipient_idx on public.community_connections(recipient_id,created_at desc);
create index community_connections_requester_idx on public.community_connections(requester_id,created_at desc);
alter table public.community_connections enable row level security;
create policy "community_connections_participant_read" on public.community_connections for select to authenticated
using(auth.uid() in (requester_id,recipient_id));
revoke all on public.community_connections from anon,authenticated;
grant select on public.community_connections to authenticated;
grant all on public.community_connections to service_role;

create table public.community_connection_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.community_connections(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index community_connection_messages_idx on public.community_connection_messages(connection_id,created_at desc);
alter table public.community_connection_messages enable row level security;
create policy "community_messages_participant_read" on public.community_connection_messages for select to authenticated
using(exists(select 1 from public.community_connections c where c.id=connection_id and c.status='accepted' and auth.uid() in (c.requester_id,c.recipient_id)));
create policy "community_messages_participant_insert" on public.community_connection_messages for insert to authenticated
with check(sender_id=auth.uid() and exists(select 1 from public.community_connections c where c.id=connection_id and c.status='accepted' and auth.uid() in (c.requester_id,c.recipient_id)));
revoke all on public.community_connection_messages from anon,authenticated;
grant select,insert on public.community_connection_messages to authenticated;
grant all on public.community_connection_messages to service_role;
