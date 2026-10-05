-- Both existing auth triggers remain installed. They now agree about role and owner fields.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare requested_role public.user_role := case when new.raw_user_meta_data->>'account_type'='corporate_buyer' then 'corporate_buyer'::public.user_role else 'merchant'::public.user_role end;
begin
  insert into public.profiles(id,email,role,full_name)
  values(new.id,new.email,requested_role,new.raw_user_meta_data->>'full_name')
  on conflict(id) do update set email=excluded.email,full_name=coalesce(excluded.full_name,profiles.full_name);
  if requested_role='merchant' and not exists(select 1 from public.merchant_profiles where user_id=new.id) then
    insert into public.merchant_profiles(user_id,business_name,business_email)
    values(new.id,coalesce(nullif(new.raw_user_meta_data->>'business_name',''),'Unnamed brand'),new.email);
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_giftgrid_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare requested_role public.user_role := case when new.raw_user_meta_data->>'account_type'='corporate_buyer' then 'corporate_buyer'::public.user_role else 'merchant'::public.user_role end;
new_buyer_id uuid;
recipient_text text := new.raw_user_meta_data->>'estimated_recipients';
begin
  insert into public.profiles(id,email,role,full_name)
  values(new.id,new.email,requested_role,new.raw_user_meta_data->>'full_name') on conflict(id) do nothing;
  if requested_role='corporate_buyer' then
    if not exists(select 1 from public.buyer_profiles where profile_id=new.id) then
      insert into public.buyer_profiles(profile_id,company_name,job_title,company_size,annual_gifting_budget,buying_categories)
      values(new.id,coalesce(nullif(new.raw_user_meta_data->>'company_name',''),nullif(new.raw_user_meta_data->>'full_name',''),'GiftGrid buyer'),new.raw_user_meta_data->>'job_title',new.raw_user_meta_data->>'company_size',new.raw_user_meta_data->>'annual_gifting_budget',
      case when jsonb_typeof(new.raw_user_meta_data->'buying_categories')='array' then array(select jsonb_array_elements_text(new.raw_user_meta_data->'buying_categories')) else '{}'::text[] end)
      returning id into new_buyer_id;
      insert into public.buyer_applications(buyer_id,use_case,estimated_recipients,desired_timeline,requirements)
      values(new_buyer_id,new.raw_user_meta_data->>'use_case',case when recipient_text ~ '^[0-9]{1,8}$' then recipient_text::integer else null end,new.raw_user_meta_data->>'desired_timeline',new.raw_user_meta_data->>'requirements');
    end if;
  elsif not exists(select 1 from public.merchant_profiles where user_id=new.id) then
    insert into public.merchant_profiles(user_id,business_name,business_email)
    values(new.id,coalesce(nullif(new.raw_user_meta_data->>'business_name',''),'Unnamed brand'),new.email);
  end if;
  return new;
end;
$$;

-- Member posts display a verified name. Email is never copied into public posts.
create or replace function public.community_post_identity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.author_id is not null then
    select coalesce(nullif(btrim(full_name),''),'GiftGrid member') into new.author_name
    from public.profiles where id=new.author_id;
  end if;
  return new;
end;
$$;
create trigger community_post_identity before insert or update of author_id,author_name on public.community_posts
for each row execute function public.community_post_identity();
