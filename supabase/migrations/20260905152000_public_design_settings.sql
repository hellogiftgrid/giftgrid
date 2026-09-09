-- Public visitors may read site appearance settings. Only the sole
-- super-admin (through is_admin) may create, change, or remove them.
drop policy if exists "settings_admin_only" on public.settings;
drop policy if exists "settings_public_read" on public.settings;
drop policy if exists "settings_super_admin_write" on public.settings;

create policy "settings_public_read"
  on public.settings for select
  using (true);

create policy "settings_super_admin_write"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());
