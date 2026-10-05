-- Add the fields used by the merchant trade-deck upload and protected viewer.
alter table public.documents
  add column if not exists file_url text,
  add column if not exists file_type text,
  add column if not exists is_visible_to_merchant boolean not null default true,
  add column if not exists uploaded_by uuid references public.profiles(id);

create index if not exists documents_merchant_trade_deck_idx
  on public.documents (merchant_id, created_at desc)
  where file_type = 'pdf' and is_visible_to_merchant = true;
