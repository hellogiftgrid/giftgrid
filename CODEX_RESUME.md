# GiftGrid release status

## Supplier catalog work, 1 October 2026

User explicitly requested continuing AliExpress/Faire products and publishing. No supplier API credentials or product feeds were present in the local environment. Asked for API/feed access or product/store links; no answer received yet. Faire developer information says its integration is for connected brands and it has no general retailer API. Do not claim a whole-marketplace connection exists.

Implemented a validated bulk JSON import (`scripts/shop/import-suppliers.mjs`, Node 24+) into `config/supplier-products.json`, which is currently EMPTY. Default import is a dry run; `--write --confirm-rights` replaces the catalog locally for the next deployment. Expected fields and usage are in CLI `--help`. No database migration is required. Imported listings appear alongside merchant listings in shop categories/pagination/API; external product pages identify their source/supplier and link to AliExpress/Faire for ordering. Unknown price, MOQ, and availability stay unknown. Out-of-stock or older-than-seven-days entries are excluded on every read.

Read-only production check confirmed the existing shop view and category RPC work, with zero visible products. Six catalog validation/pagination tests and three rendered UI tests passed. Typecheck passed; targeted lint passed with existing img-element warnings. Production publishing is authorized, but verify deployment completion and live endpoints before reporting it live. Supplier catalog cannot be populated until genuine source data is supplied.

Local production build passed. First cloud deployment `giftgrid0-g1erxurif` failed because the unanchored `mobile` rule in `.vercelignore` also excluded required `lib/mobile/release.ts`. Fixed root-only `/mobile/`, `/android/`, `/ios/` exclusions; verified server-side mobile helpers are included and `.env.local` remains excluded. Production deployment retry is in progress. No migrations were applied.

## Recovered active work, 1 October 2026

This section supersedes conflicting older notes below. Recovered the three local threads from the 30 September / 1 October session. Latest project thread: `01a0f283-9bad-7123-b31a-6c692b6ca423` (Resume degiftgrid.com thread). Its final task was interrupted during research for developer-only automated community posting and supplier catalog imports.

Latest user direction: PAUSE Shopify and all further migrations. Keep Supabase primary. The three-day trade-deck migration was already applied according to that thread; Shopify migration was not applied. Capacitor removal and React Native work already exist in the working tree; preserve them. Prior thread reports the existing web release and live verification succeeded, but this does not establish that later native/grace-period changes are deployed.

Resumed implementation adds developer community publishing and AI draft endpoints, CLI commands, and two API scopes. Publishing requires both an approved profile UUID in server-only `GIFTGRID_PUBLISHER_IDS` and developer/admin/super_admin role, plus the relevant API scope. Missing allowlist disables automation. Attribution is bound to the authenticated account. Unique existing community `system_key` values prevent duplicate retries without a migration. AI uses the existing Groq provider, returns drafts only, and does not publish implicitly. No new public documentation or scheduler was added.

Still awaiting the answer originally requested by the interrupted thread: which account email receives publishing access, and whether “25 actively posting” means 25 daily official-account posts. Do not activate unattended posting, create synthetic member accounts, or fabricate supplier inventory while waiting. Supplier imports also need an authorized catalog/feed and genuine product/source/availability data.

No production changes, new migrations, or environment credential changes were made during this recovery. Do not blindly deploy the entire working tree: it includes unrelated unfinished changes from the previous threads.

Validation for the resumed publishing changes: 8 isolated behavior/security tests passed; targeted ESLint passed; `npm.cmd run typecheck` passed; `npm.cmd run build` passed. Build logged two warnings that published blog articles could not be read. AI provider calls and production publishing have not been exercised; no real posts were created. Test file: `scripts/tests/community-publishing.test.cjs`.

Last updated: 30 September 2026.

## Release in progress

Vercel project: giftgrid0, team hellogiftgrids-projects.

Cloud deployment: https://giftgrid0-xjs3sq7b0-hellogiftgrids-projects.vercel.app

Inspection: https://vercel.com/hellogiftgrids-projects/giftgrid0/CBvZkguRqMRQ8aFLx8RcNytTU7d8

The source upload has completed. Check the deployment status before describing this release as live. Verify the production domains and run `npm run giftgrid -- status`, `npm run giftgrid -- shop list`, and `npm run giftgrid -- community list` against the live deployment.

## DNS

community.giftgrid.com was added to giftgrid0. Domain ownership is verified. DNS configuration remains pending: CNAME name `community`, value `5c0d521ec5bf9999.vercel-dns-017.com`. Ask for confirmation of the record, then run `vercel domains verify community.giftgrid.com`. Existing community.degiftgrid.com is already a production alias; both hosts are supported by proxy.ts. Canonical links currently use the working degiftgrid community domain until DNS is confirmed.

## Database and validation

Five additive migrations, 20260930120000 through 20260930160000, were successfully applied to the linked Supabase project. They add merchant onboarding, community reactions and categories, developer APIs, member connections and photo storage, and reconcile the existing signup triggers with the live user_id schema.

All 16 tests in scripts/tests/onboarding.test.cjs passed after changing trade decks to PDF only. A subsequent changed-file lint run is pending. Previous lint found four effect warnings in Connections and DeveloperManager; these were corrected by deferred initial loads. Full local type checking exhausted memory twice; tsconfig.json now excludes public, android and local backup folders. Re-run checking without concurrent heavy Node processes.

## Final user requirements

Never automatically publish account emails in community posts, directories or public profiles. Public API projections exclude email. Trade decks can contain contact details voluntarily supplied by the merchant.

Anyone, including visitors without an account, can view an uploaded merchant PDF through their public member profile. Approval and rank do not gate viewing. PDF upload is still restricted to the merchant owner. TradeDeckViewer embeds the same-origin PDF with a download option; inline rendering depends on the device's PDF support. A more capable mobile renderer may still be needed for Android WebView; installing pdfjs-dist failed locally because Node ran out of memory and no PDF.js dependency was added.

The five navigation items are Home, Shop, Connect, Profile, Merchants. Shop uses existing published listings and category filters. Community supports photo posts, real likes/comments/share, opt-in member directories, connection requests and messages after acceptance. Theme switching is exposed in the community shell.

## Remaining work

- Confirm Vercel build succeeds, then verify public endpoints, unauthenticated protections, shop and community pages, PDF viewer and CLI on the live release.
- Check existing community author_name values for email fallback from the previous implementation; remove any automatically published email names without changing user-authored post content.
- Complete the full documentation library of 219 substantive guides at /docs, including exactly four CLI and four trade-deck guides. Documentation has not yet been created; old /console/docs content contains placeholder API paths and unsupported claims and must be replaced.
- Build, sign and verify a real Android APK before enabling the /app download button. Android SDK exists but no JDK or signing key was found. Do not create a fake APK or claim an available download.
- Webhook registration is implemented; event delivery is explicitly unavailable. Existing console overview still makes unsupported sandbox, quota and delivery claims and needs correction.
- Review the product detail quote link and buyer dashboard handling of the listing parameter.
- Add meaningful public-deck access and privacy tests, and rerun browser smoke checks with waitUntil domcontentloaded; prior test timed out on third-party tracking load.

Do not discard existing user changes or rebuild the application architecture. Never print .env.local or authentication secrets. Production deployment is already authorized.

## Latest work, 30 September 2026 afternoon

Production web release jwbu1zf7l was Ready and live. User then requested immediate publishing; deployments 7to5pg9pk and a subsequent follow-permission fix are in progress. Confirm the newest Vercel deployment before reporting completion.

Implemented: admin/system post logo avatars; /dashboard/profile combines merchant and community settings and is accessible to buyers/admins without merchant trade decks; merchants still require decks as explicitly clarified. All-country selector has 250 named entries and local SVG flags. Community navigation has Dashboard plus the existing five destinations. Signed-out feed displays Sign in to post, shared headers expose auth controls, and sign-out now uses POST with 303 redirects. Product listings upload images, show descriptions and support editing. Connect lists all registered active users without email exposure; messages start directly and remain participant-only.

Removed call-booking and Store Audit routes, APIs, integrations, dashboard controls, and public links. Historical database migrations/records remain.

Applied production migrations 20260930170000 (follows), 180000 (internal automatic merchant follow-up tasks with pause/status controls), 190000 (direct conversations). 17 onboarding tests passed, changed-file lint had no new errors, typecheck and local production build passed before the final tiny follow fix.

Live verification script .giftgrid-verification/live-check.cjs uses temporary accounts and cleanup. First failed because password policy requires upper/lower/digit/symbol; fixed. Second passed public routes, admin/buyer profile access, logo and directory checks, then failed Follow at RLS. Follow writes now use an authenticated server admin client after validating the target; actor IDs remain bound to session. Re-run the script after the new deployment is Ready. Further checks (messages, likes, listing upload/edit, workflows and sign-out) have NOT yet completed.

Still unfinished: /docs library of 222 guides (user raised prior 219 target by three trade-deck guides; no /docs route created yet); real signed Android APK. Existing mobile app is Capacitor; user mentioned React Native but did not answer whether to keep Capacitor or build a separate React Native app. Do not claim a React Native app was built. Android synced, branding/signing Gradle configuration prepared, verified Temurin Java 21 downloaded to .giftgrid-tools/jdk-21.0.12.1+1. Private signing properties are in ignored .giftgrid-signing/release.properties; no keystore generated or APK compiled yet. SDK at user AppData/Local/Android/Sdk. Never print signing passwords or environment secrets.

Shopify integration was discussed only; requirements explained, not implemented. User latest instruction: publish now and follow their next prompt.

Latest confirmed production: https://giftgrid0-19wlk9vdj-hellogiftgrids-projects.vercel.app (Vercel Ready; www.degiftgrid.com and community.degiftgrid.com aliases). Follow permission correction is included. JDK download and checksum verification completed. Latest user asks Shopify merchant connection requirements; answered with official Shopify authorization/distribution/privacy sources.

## Hosting decision, 30 September 2026

User clarified: keep Supabase primary; use Netlify PostgreSQL as backup/recovery copy; move web hosting to Cloudflare. User will create the new hosting accounts. No account access yet. See docs/operations/hosting-and-recovery.md for prerequisites, limitations and cost recommendation. No subscriptions or production routing changed. Cloudflare vinext compatibility check started; inspect its result before applying adapter changes. Prior live verification completed successfully on deployment 19wlk9vdj (roles, follows, messages/outsider denial, image upload/listing edits, workflow tasks and sign-out). Android release build retry is ongoing; do not claim a downloadable release before build and signature verification.
