insert into public.booking_event_types (name, slug, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, minimum_notice_minutes, booking_window_days, active, public_bookable)
values ('Merchant introduction call', 'merchant-introduction-5', 'A five-minute GiftGrid-hosted introduction between an approved buyer and merchant.', 5, 0, 5, 30, 30, true, true)
on conflict (slug) do update set active = true, public_bookable = true, duration_minutes = 5, updated_at = now();
