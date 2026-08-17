-- ============================================================
-- GiftGrid — 0001_init_schema.sql
-- Core tables. Deliberately excludes analytics/activity-log
-- tables for this first pass — those come once the primary
-- workflows (apply → review → match → submit) are stable.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- ROLES ----------
create type user_role as enum (
  'merchant',
  'outreach_agent',
  'outreach_manager',
  'audit_manager',
  'support_agent',
  'admin',
  'super_admin'
);

-- ---------- PROFILES (extends auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'merchant',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MERCHANT ----------
create table merchant_profiles (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  business_name text not null,
  contact_email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references merchant_profiles(id) on delete cascade,
  store_url text not null,
  platform text, -- 'shopify' | 'woocommerce' | 'other'
  created_at timestamptz not null default now()
);

create type application_status as enum (
  'submitted', 'under_review', 'needs_info', 'approved', 'rejected'
);

create table merchant_applications (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references merchant_profiles(id) on delete cascade,
  store_id uuid references stores(id),
  status application_status not null default 'submitted',
  notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- ---------- AUDITS ----------
create type audit_status as enum ('draft', 'approved', 'archived');
create type finding_status as enum ('passed', 'needs_attention', 'failed', 'not_tested', 'manual_review');
create type finding_severity as enum ('low', 'medium', 'high', 'critical');

create table audits (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  status audit_status not null default 'draft',
  executive_summary text,
  overall_score numeric,
  created_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_sections (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid not null references audits(id) on delete cascade,
  name text not null, -- Technical, Mobile/UX, SEO, Accessibility, Navigation, Product
  sort_order int not null default 0,
  hidden boolean not null default false
);

create table audit_findings (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references audit_sections(id) on delete cascade,
  check_name text not null,
  result finding_status not null default 'not_tested',
  severity finding_severity,
  why_it_matters text,
  recommendation text,
  evidence_url text,
  is_automated boolean not null default true,
  created_at timestamptz not null default now()
);

create table audit_recommendations (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid not null references audits(id) on delete cascade,
  title text not null,
  description text,
  priority finding_severity,
  sort_order int not null default 0
);

-- ---------- TRUSTED DEVELOPERS ----------
create table developers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  photo_url text,
  specialties text[],
  portfolio_url text,
  contact_email text,
  typical_timeframe text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type dev_recommendation_status as enum ('suggested', 'introduction_requested', 'introduced', 'in_progress', 'completed');

create table developer_recommendations (
  id uuid primary key default uuid_generate_v4(),
  audit_finding_id uuid references audit_findings(id),
  merchant_id uuid not null references merchant_profiles(id),
  developer_id uuid not null references developers(id),
  status dev_recommendation_status not null default 'suggested',
  timeframe text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- OPPORTUNITY NETWORK ----------
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  logo_url text,
  website text,
  category text not null, -- Corporate Gifting, Wholesale, Bulk Buyers, etc.
  relationship_label text, -- Partner / Platform / Buyer / Ecosystem / Resource
  description text,
  requirements text,
  submission_url text,
  contact_info text,
  internal_notes text,
  active boolean not null default true,
  public_display boolean not null default false,
  created_at timestamptz not null default now()
);

create type submission_status as enum (
  'draft', 'researching', 'ready', 'submitted', 'under_review', 'accepted', 'declined', 'waiting', 'closed'
);

create table opportunity_submissions (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references merchant_profiles(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id),
  status submission_status not null default 'draft',
  submitted_by uuid references profiles(id),
  submitted_at timestamptz,
  external_reference text,
  response_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- TEAM / OUTREACH ----------
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  role user_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type lead_status as enum (
  'new', 'contacted', 'replied', 'interested', 'application_sent',
  'application_started', 'converted', 'not_interested', 'follow_up', 'do_not_contact'
);

create table outreach_leads (
  id uuid primary key default uuid_generate_v4(),
  merchant_name text,
  business_name text,
  email text,
  store_url text,
  source text,
  assigned_to uuid references profiles(id),
  status lead_status not null default 'new',
  last_contact_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table outreach_messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references outreach_leads(id) on delete cascade,
  sent_by uuid references profiles(id),
  template_used text,
  body text,
  sent_at timestamptz not null default now(),
  bounced boolean not null default false
);

-- ---------- COMMUNICATION ----------
create table message_threads (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchant_profiles(id) on delete cascade,
  subject text,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchant_profiles(id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- DOCUMENTS / NOTIFICATIONS ----------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references merchant_profiles(id) on delete cascade,
  audit_id uuid references audits(id),
  title text not null,
  storage_path text not null,
  visible_to_merchant boolean not null default true,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CHATBOT ----------
create table chatbot_leads (
  id uuid primary key default uuid_generate_v4(),
  name text,
  business_name text,
  email text,
  store_url text,
  reason text,
  created_at timestamptz not null default now()
);

create table chatbot_knowledge (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  question text not null,
  answer text not null,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- WEBSITE CMS ----------
create table partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  relationship_label text,
  active boolean not null default true
);

create table website_content (
  id uuid primary key default uuid_generate_v4(),
  page_key text not null unique, -- 'home', 'about', 'footer', etc.
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  published boolean not null default true,
  sort_order int not null default 0
);

create table settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
