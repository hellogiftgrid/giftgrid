alter table public.documents
  add column if not exists review_status text not null default 'approved'
    check (review_status in ('pending_review', 'approved', 'rejected')),
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

create index if not exists documents_trade_deck_review_queue_idx
  on public.documents (review_status, created_at desc)
  where file_type = 'pdf';

create or replace function public.merchant_has_trade_deck(merchant uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.documents d
 join public.merchant_profiles m on m.id=d.merchant_id
 join storage.objects o on o.bucket_id='trade-decks' and o.name=d.storage_path
 where m.id=merchant and d.file_type='pdf' and d.review_status='approved'
 and d.storage_path like m.user_id::text || '/%');
$$;
