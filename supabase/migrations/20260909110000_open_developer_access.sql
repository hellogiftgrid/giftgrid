alter type public.user_role add value if not exists 'developer';

create or replace function public.become_developer()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set role = 'developer'::public.user_role,
      updated_at = now()
  where id = auth.uid()
    and role <> 'super_admin'::public.user_role;
end;
$$;

revoke all on function public.become_developer() from public, anon;
grant execute on function public.become_developer() to authenticated;
