create or replace function public.notify_admins_of_buyer_quote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_name text;
  merchant_name text;
begin
  select company_name into buyer_name from public.buyer_profiles where id = new.buyer_id;
  select business_name into merchant_name from public.merchant_profiles where id = new.merchant_id;

  insert into public.notifications (profile_id, title, body)
  select p.id, 'New quote request',
    coalesce(buyer_name, 'A buyer') || ' sent a quote request to ' || coalesce(merchant_name, 'a merchant') || ': ' || new.subject
  from public.profiles p
  where p.role = 'super_admin' and p.is_active = true;

  return new;
end;
$$;

drop trigger if exists notify_admins_of_buyer_quote on public.buyer_inquiries;
create trigger notify_admins_of_buyer_quote
after insert on public.buyer_inquiries
for each row execute function public.notify_admins_of_buyer_quote();

revoke all on function public.notify_admins_of_buyer_quote() from public, anon, authenticated;
