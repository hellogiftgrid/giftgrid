insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trade-decks', 'trade-decks', false, 500000, array['application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = 500000,
  allowed_mime_types = array['application/pdf'];
