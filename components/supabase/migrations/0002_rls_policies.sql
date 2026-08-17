-- ============================================================
-- GiftGrid — 0002_rls_policies.sql
-- Every table with user-scoped data gets RLS. Public-readable
-- CMS-style tables (faqs, chatbot_knowledge, website_content,
-- opportunities) get a narrow "published/active only" public
-- read policy and nothing else for anon.
-- ============================================================

-- ---------- helper: current user's role, bypasses RLS recursion ----------
create or replace function current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select current_user_role() in ('admin', 'super_admin');
$$;

-- ---------- PROFILES ----------
alter table profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

-- ---------- MERCHANT PROFILES ----------
alter table merchant_profiles enable row level security;

create policy "merchant_profiles_owner_or_staff"
  on merchant_profiles for select
  using (profile_id = auth.uid() or current_user_role() in ('admin', 'super_admin', 'audit_manager', 'support_agent'));

create policy "merchant_profiles_owner_write"
  on merchant_profiles for all
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

-- ---------- STORES ----------
alter table stores enable row level security;

create policy "stores_owner_or_staff"
  on stores for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "stores_owner_write"
  on stores for all
  using (merchant_id in (select id from merchant_profiles where profile_id = auth.uid()) or is_admin())
  with check (merchant_id in (select id from merchant_profiles where profile_id = auth.uid()) or is_admin());

-- ---------- MERCHANT APPLICATIONS ----------
alter table merchant_applications enable row level security;

create policy "applications_owner_or_staff"
  on merchant_applications for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "applications_owner_insert"
  on merchant_applications for insert
  with check (merchant_id in (select id from merchant_profiles where profile_id = auth.uid()));

create policy "applications_staff_update"
  on merchant_applications for update
  using (current_user_role() in ('admin', 'super_admin', 'audit_manager'));

-- ---------- AUDITS (merchants only ever see approved audits for their own store) ----------
alter table audits enable row level security;

create policy "audits_merchant_sees_approved_only"
  on audits for select
  using (
    (
      status = 'approved'
      and store_id in (
        select s.id from stores s
        join merchant_profiles mp on mp.id = s.merchant_id
        where mp.profile_id = auth.uid()
      )
    )
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "audits_staff_write"
  on audits for all
  using (current_user_role() in ('admin', 'super_admin', 'audit_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'audit_manager'));

-- ---------- AUDIT SECTIONS / FINDINGS / RECOMMENDATIONS (inherit audit visibility) ----------
alter table audit_sections enable row level security;
alter table audit_findings enable row level security;
alter table audit_recommendations enable row level security;

create policy "audit_sections_inherit"
  on audit_sections for select
  using (
    not hidden and audit_id in (
      select id from audits where
        status = 'approved' and store_id in (
          select s.id from stores s join merchant_profiles mp on mp.id = s.merchant_id
          where mp.profile_id = auth.uid()
        )
    )
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "audit_sections_staff_write"
  on audit_sections for all
  using (current_user_role() in ('admin', 'super_admin', 'audit_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'audit_manager'));

create policy "audit_findings_inherit"
  on audit_findings for select
  using (
    section_id in (
      select id from audit_sections where not hidden and audit_id in (
        select id from audits where status = 'approved' and store_id in (
          select s.id from stores s join merchant_profiles mp on mp.id = s.merchant_id
          where mp.profile_id = auth.uid()
        )
      )
    )
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "audit_findings_staff_write"
  on audit_findings for all
  using (current_user_role() in ('admin', 'super_admin', 'audit_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'audit_manager'));

create policy "audit_recommendations_inherit"
  on audit_recommendations for select
  using (
    audit_id in (
      select id from audits where status = 'approved' and store_id in (
        select s.id from stores s join merchant_profiles mp on mp.id = s.merchant_id
        where mp.profile_id = auth.uid()
      )
    )
    or current_user_role() in ('admin', 'super_admin', 'audit_manager')
  );

create policy "audit_recommendations_staff_write"
  on audit_recommendations for all
  using (current_user_role() in ('admin', 'super_admin', 'audit_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'audit_manager'));

-- ---------- DEVELOPERS & RECOMMENDATIONS ----------
alter table developers enable row level security;
alter table developer_recommendations enable row level security;

create policy "developers_staff_only"
  on developers for select
  using (
    is_admin()
    or id in (select developer_id from developer_recommendations where merchant_id in (
      select id from merchant_profiles where profile_id = auth.uid()
    ))
  );

create policy "developers_admin_write"
  on developers for all
  using (is_admin())
  with check (is_admin());

create policy "dev_recommendations_owner_or_staff"
  on developer_recommendations for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or is_admin()
  );

create policy "dev_recommendations_staff_write"
  on developer_recommendations for all
  using (is_admin())
  with check (is_admin());

-- ---------- OPPORTUNITIES ----------
alter table opportunities enable row level security;

create policy "opportunities_public_read"
  on opportunities for select
  using (public_display = true and active = true);

create policy "opportunities_staff_full_read"
  on opportunities for select
  using (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'));

create policy "opportunities_admin_write"
  on opportunities for all
  using (is_admin())
  with check (is_admin());

-- ---------- OPPORTUNITY SUBMISSIONS ----------
alter table opportunity_submissions enable row level security;

create policy "submissions_owner_or_staff"
  on opportunity_submissions for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager')
  );

create policy "submissions_staff_write"
  on opportunity_submissions for all
  using (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'));

-- ---------- TEAM ----------
alter table team_members enable row level security;

create policy "team_members_admin_only"
  on team_members for all
  using (is_admin())
  with check (is_admin());

-- ---------- OUTREACH ----------
alter table outreach_leads enable row level security;
alter table outreach_messages enable row level security;

create policy "outreach_leads_assigned_or_staff"
  on outreach_leads for select
  using (assigned_to = auth.uid() or current_user_role() in ('admin', 'super_admin', 'outreach_manager'));

create policy "outreach_leads_staff_write"
  on outreach_leads for all
  using (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'));

create policy "outreach_messages_staff_only"
  on outreach_messages for all
  using (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'))
  with check (current_user_role() in ('admin', 'super_admin', 'outreach_agent', 'outreach_manager'));

-- ---------- MESSAGING ----------
alter table message_threads enable row level security;
alter table messages enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;

create policy "threads_owner_or_staff"
  on message_threads for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or current_user_role() in ('admin', 'super_admin', 'support_agent')
  );

create policy "messages_owner_or_staff"
  on messages for select
  using (
    thread_id in (
      select id from message_threads where merchant_id in (
        select id from merchant_profiles where profile_id = auth.uid()
      )
    )
    or current_user_role() in ('admin', 'super_admin', 'support_agent')
  );

create policy "messages_participant_insert"
  on messages for insert
  with check (sender_id = auth.uid());

create policy "tickets_owner_or_staff"
  on support_tickets for select
  using (
    merchant_id in (select id from merchant_profiles where profile_id = auth.uid())
    or current_user_role() in ('admin', 'super_admin', 'support_agent')
  );

create policy "tickets_owner_insert"
  on support_tickets for insert
  with check (merchant_id in (select id from merchant_profiles where profile_id = auth.uid()));

create policy "support_messages_owner_or_staff"
  on support_messages for select
  using (
    ticket_id in (
      select id from support_tickets where merchant_id in (
        select id from merchant_profiles where profile_id = auth.uid()
      )
    )
    or current_user_role() in ('admin', 'super_admin', 'support_agent')
  );

-- ---------- DOCUMENTS / NOTIFICATIONS ----------
alter table documents enable row level security;
alter table notifications enable row level security;

create policy "documents_owner_or_staff"
  on documents for select
  using (
    (visible_to_merchant and merchant_id in (select id from merchant_profiles where profile_id = auth.uid()))
    or is_admin()
  );

create policy "documents_admin_write"
  on documents for all
  using (is_admin())
  with check (is_admin());

create policy "notifications_owner_only"
  on notifications for select
  using (profile_id = auth.uid());

create policy "notifications_owner_update"
  on notifications for update
  using (profile_id = auth.uid());

-- ---------- CHATBOT ----------
alter table chatbot_leads enable row level security;
alter table chatbot_knowledge enable row level security;

create policy "chatbot_leads_admin_only"
  on chatbot_leads for select
  using (is_admin());

create policy "chatbot_knowledge_public_read"
  on chatbot_knowledge for select
  using (published = true);

create policy "chatbot_knowledge_admin_write"
  on chatbot_knowledge for all
  using (is_admin())
  with check (is_admin());

-- ---------- WEBSITE CMS ----------
alter table partners enable row level security;
alter table website_content enable row level security;
alter table faqs enable row level security;
alter table settings enable row level security;

create policy "partners_public_read"
  on partners for select
  using (active = true);

create policy "partners_admin_write"
  on partners for all
  using (is_admin())
  with check (is_admin());

create policy "website_content_public_read"
  on website_content for select
  using (true);

create policy "website_content_admin_write"
  on website_content for all
  using (is_admin())
  with check (is_admin());

create policy "faqs_public_read"
  on faqs for select
  using (published = true);

create policy "faqs_admin_write"
  on faqs for all
  using (is_admin())
  with check (is_admin());

create policy "settings_admin_only"
  on settings for all
  using (is_admin())
  with check (is_admin());
