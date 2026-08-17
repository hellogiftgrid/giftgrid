-- ============================================================
-- GiftGrid — Migration 0002: Merchant Portal Supporting Tables
-- ============================================================

-- ----------------------------------------------------------
-- AUDIT ITEMS  (individual check results within an audit)
-- ----------------------------------------------------------
create table if not exists public.audit_items (
  id               uuid primary key default gen_random_uuid(),
  audit_id         uuid not null references public.store_audits(id) on delete cascade,
  category         text not null,              -- e.g. 'Mobile Experience', 'SEO Fundamentals'
  check_name       text not null,              -- e.g. 'Page speed score', 'Meta descriptions'
  result           text not null default 'not_checked',
                                               -- passed | failed | manual_review | not_checked
  detail           text,                       -- human-readable explanation
  evidence_url     text,                       -- screenshot/link
  severity         text default 'medium',      -- high | medium | low
  created_at       timestamptz default now()
);

-- ----------------------------------------------------------
-- MERCHANT DOCUMENTS
-- ----------------------------------------------------------
create table if not exists public.merchant_documents (
  id                      uuid primary key default gen_random_uuid(),
  merchant_id             uuid not null references public.merchant_profiles(id) on delete cascade,
  title                   text not null,
  document_type           text not null default 'other',  -- report | contract | other
  file_url                text,
  description             text,
  is_visible_to_merchant  boolean not null default true,
  uploaded_by             uuid references public.profiles(id),
  created_at              timestamptz default now()
);

-- ----------------------------------------------------------
-- OPPORTUNITY TARGETS  (external orgs/platforms GiftGrid submits to)
-- ----------------------------------------------------------
create table if not exists public.opportunity_targets (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text,                   -- Corporate Gifting | Wholesale | etc.
  description  text,
  website      text,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- Add FK on opportunity_submissions if table exists
-- (this safely adds the column only if it isn't there yet)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='opportunity_submissions' and column_name='opportunity_target_id'
  ) then
    alter table public.opportunity_submissions
      add column opportunity_target_id uuid references public.opportunity_targets(id);
  end if;
end $$;

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------

alter table public.audit_items         enable row level security;
alter table public.merchant_documents  enable row level security;
alter table public.opportunity_targets enable row level security;

-- audit_items: merchant can read items for their own audits
create policy "merchant_read_own_audit_items"
  on public.audit_items for select
  using (
    exists (
      select 1 from public.store_audits sa
      join public.merchant_profiles mp on mp.id = sa.merchant_id
      where sa.id = audit_items.audit_id
        and mp.user_id = auth.uid()
    )
  );

-- audit_items: team/admin full access
create policy "team_all_audit_items"
  on public.audit_items for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','team')
    )
  );

-- merchant_documents: merchant sees only their visible docs
create policy "merchant_read_own_docs"
  on public.merchant_documents for select
  using (
    is_visible_to_merchant = true
    and exists (
      select 1 from public.merchant_profiles
      where id = merchant_documents.merchant_id
        and user_id = auth.uid()
    )
  );

-- merchant_documents: team/admin full access
create policy "team_all_docs"
  on public.merchant_documents for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','team')
    )
  );

-- opportunity_targets: readable by all authenticated users
create policy "auth_read_targets"
  on public.opportunity_targets for select
  using (auth.uid() is not null);

-- opportunity_targets: team/admin manage
create policy "team_manage_targets"
  on public.opportunity_targets for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin','team')
    )
  );
