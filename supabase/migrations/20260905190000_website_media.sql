insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-media', 'website-media', true, 8000000, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8000000;
