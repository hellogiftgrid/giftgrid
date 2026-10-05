-- Retain historical records while disabling removed social features for clients.
begin;
revoke insert, update, delete on public.community_connections from anon, authenticated;
revoke insert, update, delete on public.community_connection_messages from anon, authenticated;
revoke insert, update, delete on public.community_follows from anon, authenticated;
drop policy if exists "community_messages_participant_insert" on public.community_connection_messages;
drop policy if exists "follows_owner_insert" on public.community_follows;
drop policy if exists "follows_owner_delete" on public.community_follows;
commit;
