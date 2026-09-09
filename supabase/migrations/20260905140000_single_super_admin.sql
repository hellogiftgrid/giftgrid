-- GiftGrid has one platform owner. All other accounts are customers.
-- Preserve the earliest active super-admin as the current owner and remove
-- legacy staff privileges from every other profile.
do $$
declare
  owner_id uuid;
begin
  select id into owner_id
  from public.profiles
  where role = 'super_admin' and coalesce(is_active, true)
  order by created_at asc, id asc
  limit 1;

  if owner_id is null then
    raise exception 'Single-admin migration stopped: no active super_admin exists';
  end if;

  update public.profiles
  set role = 'merchant', updated_at = now()
  where id <> owner_id
    and role::text in (
      'admin',
      'super_admin',
      'team',
      'audit_manager',
      'support_agent',
      'outreach_agent',
      'outreach_manager'
    );
end
$$;

create unique index if not exists profiles_single_super_admin_idx
  on public.profiles ((role))
  where role = 'super_admin';

-- Every broad administrator policy that calls is_admin() now recognizes only
-- the sole super-admin. Legacy admin accounts no longer inherit broad access.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
      and coalesce(is_active, true)
  );
$$;

-- Stop a signed-in user from changing their own role through the profiles
-- update policy. Trusted database/service operations remain possible.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active then
    if current_user not in ('postgres', 'service_role', 'supabase_admin')
       and not public.is_admin() then
      raise exception 'Only the GiftGrid super-admin can change account access';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges_trigger on public.profiles;
create trigger protect_profile_privileges_trigger
before update on public.profiles
for each row execute function public.protect_profile_privileges();

revoke all on function public.protect_profile_privileges() from public;
revoke all on function public.protect_profile_privileges() from anon;
revoke all on function public.protect_profile_privileges() from authenticated;
