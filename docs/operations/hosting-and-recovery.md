# Hosting and recovery decision — 30 September 2026

User decision: retain Supabase for production PostgreSQL, authentication and Storage. Move the application from Vercel to Cloudflare when the new account is available. Use Netlify PostgreSQL as a secondary recovery copy. User will create Cloudflare and Netlify accounts; account access has not been connected.

## Plan and costs

Recommend Supabase Pro for the live application: currently starts at USD25/month with daily database backups retained seven days. Free can support development, but has no included automatic backups and may pause after seven days of inactivity. Do not change subscriptions or enable paid add-ons without the user's authorization. Start new hosting accounts on their free entry plans for compatibility testing; evaluate measured limits before the production cutover.

Netlify Database is available on credit-based plans. Free currently allows a maximum 5GB database and 5GB written per billing period, with limited compute. Repeated full imports can exhaust the monthly write allowance even when the source database fits. Confirm account pricing and restore size before scheduling imports. Do not assume Netlify storage is free: current documentation contains an expired July 2026 introductory-storage statement.

## Recovery design

Supabase already runs PostgreSQL. A second PostgreSQL service is a recovery destination, not a replacement for Supabase Auth, its REST API, or Storage. Do not change application database URLs to the backup database or introduce dual writes.

1. Produce encrypted, timestamped logical exports with recorded database version, schema/migration version, checksums and completion status. Retain older successful snapshots so accidental deletion is recoverable. A continuously overwritten replica alone is insufficient.
2. Separately preserve Storage objects (product images, community media, trade decks) and their metadata. Database backups contain file metadata, not file contents. Store the encryption key separately from backup files.
3. Validate PostgreSQL versions, required extensions, Supabase roles, auth schema dependencies and RLS functions in an isolated restore before importing into Netlify. A plain PostgreSQL restore cannot be assumed compatible with a complete Supabase platform dump.
4. Restrict the backup target to the backup operator. Never expose connection strings or service-role keys to clients. Do not copy secrets into documentation or commits.
5. Define a daily recovery-point target initially (up to 24 hours of data loss); this is a proposed target, not an existing service guarantee. Record restore duration and missing dependencies in a rehearsal before calling recovery operational.
6. Fail closed on incomplete exports; alert on backup failure and preserve the last known-good snapshots. Do not automatically fail over the application to the recovery database.

## Cloudflare cutover prerequisites

GiftGrid is a full-stack Next.js application and needs Workers, not static-only Pages. Cloudflare currently recommends vinext (beta); run its compatibility checker before selecting or installing an adapter.

Known project work to validate: host-based routing in proxy.ts; server-side Supabase session cookies; uploads and PDF viewing; the mobile release filesystem check in lib/mobile/release.ts; content files; existing Vercel Analytics/Speed Insights; and the daily 09:00 UTC /api/cron/blog schedule in vercel.json. Recreate authenticated scheduled execution once only; avoid two active publishers during cutover.

Build and verify a Cloudflare preview first. Transfer environment secrets privately, check Supabase redirect allowlists, and exercise sign-in/out, all roles, follows, private messaging, listing media and workflow tasks. Switch domain routes only after successful checks. Preserve Vercel deployment and DNS records for rollback until Cloudflare operation is confirmed. Do not remove or repoint the existing Supabase project.

## Status

No Cloudflare deployment, Netlify database, scheduled external backup, or subscription change has been made. The last confirmed live host remains Vercel. This file records the approved architecture and the remaining implementation checks; it is not evidence that migration or recovery is complete.

## References

- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/self-hosting/restore-from-platform
- https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/
- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
