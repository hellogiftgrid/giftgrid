-- New conversations start immediately; previously declined requests stay declined.
alter table public.community_connections alter column status set default 'accepted';
update public.community_connections set status='accepted',updated_at=now() where status='pending';
