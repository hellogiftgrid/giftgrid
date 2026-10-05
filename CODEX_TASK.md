

You are working inside the existing GiftGrid repository for degiftgrid.com.

Before changing anything, inspect the current implementation thoroughly. Do not rebuild working systems unnecessarily. Reuse the existing architecture, authentication, Supabase integration, components, routes, styling system, user roles, merchant onboarding, community, marketplace, footer, app-download logic, and existing database schema wherever possible.

The goal is to update GiftGrid in four major areas:

1. Merchant signup and trade deck requirements.
2. Gift sourcing / buyer signup requirements.
3. Direct GiftGrid mobile app distribution.
4. Community/mobile UI cleanup.

FIRST: AUDIT THE CURRENT IMPLEMENTATION

Inspect and identify:

- authentication and signup routes
- merchant registration/onboarding
- buyer/user registration
- user role selection
- profile creation
- merchant profile fields
- marketplace/sourcing flows
- community layout
- global layout
- footer implementation
- app download links/components
- any Google Play or App Store links
- existing upload system
- Supabase tables and storage usage
- existing trade deck fields or merchant verification fields
- middleware/proxy/auth guards
- responsive/mobile navigation
- any existing Capacitor/React Native/mobile app references

Before editing, briefly summarize what currently exists and which files you plan to modify.

Then implement the requirements below.

---

## A. MERCHANT SIGNUP — TRADE DECK IS COMPULSORY

A merchant must not be able to complete merchant onboarding without providing a trade deck.

Treat the trade deck as a required merchant-business document.

During merchant signup/onboarding, require:

- business/store name
- merchant/business category
- country/location where appropriate
- business contact information already required by GiftGrid
- website/store URL if the merchant has one
- trade deck upload — REQUIRED

The trade deck field must be visibly marked as required.

Accepted trade deck formats should preferably include:

- PDF
- PPT
- PPTX

Use the existing upload/storage architecture if one exists.

If Supabase Storage is already used, use the appropriate existing bucket or create a logically named bucket/configuration only if required.

Store the resulting trade deck reference against the merchant/business profile using the existing schema wherever possible.

Do not expose private storage/service-role credentials to the browser.

The merchant should not reach the completed merchant state unless the trade deck upload has succeeded.

Validation must exist on both client and server sides.

Do not rely only on HTML `required`.

If the merchant tries to continue without a trade deck, show a clear inline validation message such as:

"Upload your trade deck to continue as a merchant."

Do not make this requirement apply to ordinary GiftGrid users or gift-sourcing users.

If an existing merchant account has no trade deck because it predates this change, do not break the whole application. Instead, when that merchant next accesses an appropriate merchant setup/profile area, clearly prompt them to complete the missing trade deck requirement.

Do not accidentally block legitimate existing users from signing into their account.

---

## B. GIFT SOURCING USERS — SIMPLE ONBOARDING

Users who are sourcing gifts, requesting gifts, browsing products, requesting quotes, or otherwise acting as buyers must NOT be required to have:

- a website
- a trade deck
- a merchant/storefront
- merchant business documentation

Do not force buyer/sourcing accounts through merchant onboarding.

The signup/onboarding architecture should clearly distinguish:

MERCHANT / SUPPLIER

versus

BUYER / GIFT SOURCING USER

For gift-sourcing users, keep onboarding minimal.

Use the user information that is actually needed for GiftGrid to function, such as:

- name
- email/authentication
- optional profile information
- location where required
- gift sourcing/request information when they begin a sourcing request

Do not ask buyers to upload a trade deck.

Do not require buyers to enter a website.

If the current onboarding mixes buyers and merchants together, refactor it carefully so merchant-specific fields only appear when the merchant role is selected.

---

## C. GIFTGRID MOBILE APP — DIRECT DOWNLOAD, NOT GOOGLE PLAY

GiftGrid should NOT advertise Google Play as the primary app-download route.

Remove or replace Google Play/App Store style calls-to-action that imply the user must leave GiftGrid to get the app.

GiftGrid must have its own dedicated app-download landing page.

Use a route such as:

/app

or reuse the existing app download route if the project already has one.

The page should visibly present itself as:

"Get the GiftGrid App"

The actual GiftGrid application file should be downloadable directly from GiftGrid.

For Android:

- use the actual APK file
- provide a direct APK download button
- provide an APK QR code
- display the current APK version where available
- display file size where available
- provide concise installation instructions
- tell users that Android may ask permission to install apps from the browser/file manager

Do NOT create a fake APK URL.

Inspect the repository first for an existing APK file or existing app build artifact.

If an APK already exists, wire the download page to that actual file.

If no APK exists, create the page and component structure so an APK can be placed in a clear static location such as:

/public/downloads/

but do not fabricate the binary.

Clearly report the expected filename/path if the actual APK file is absent.

Only expose the latest app download prominently.

If historical app builds exist, do not clutter the user-facing page with them.

Include a QR code that resolves to the GiftGrid app download page or actual current download endpoint.

The app download should remain hosted under GiftGrid/degiftgrid.com rather than making Google Play the dependency.

Do not display fake App Store availability if a real iOS package/distribution path is not currently available.

If there is no valid direct iOS build/distribution method in the current project, represent iOS honestly instead of inventing one.

The design should match GiftGrid rather than looking like a generic app-store clone.

---

## D. APP DOWNLOAD EXPERIENCE

The dedicated download page should include:

- GiftGrid branding
- app name
- concise app value proposition
- current version if known
- file size if known
- direct Android APK download
- QR code
- installation instructions
- security/trust explanation
- what users can do in the app

Use actual functionality already supported by GiftGrid. Do not invent capabilities that do not exist.

Where consistent with the existing application, mention capabilities such as:

- community access
- product discovery
- merchant discovery
- gift sourcing
- messaging
- order/opportunity tracking
- merchant account access

Only include features actually supported by the repository.

If the existing project already counts app downloads, preserve and repair that functionality.

If it has no download tracking, implement a minimal anonymous download counter only if this can be done safely with the current architecture without collecting unnecessary personal information.

---

## E. FOOTER — DO NOT SHOW IT INSIDE THE COMMUNITY

The normal marketing/site footer must not appear inside the community experience.

This applies to community routes and community-centric mobile screens.

Do NOT globally delete the footer.

The footer should continue to appear on appropriate public/marketing pages, for example:

- homepage
- merchant pages where appropriate
- about pages
- app download page
- informational pages

But community routes should have a cleaner app-like layout.

Determine the community route group/path from the existing code.

Implement the layout correctly, preferably using route-specific Next.js layouts rather than fragile client-side pathname checks when the existing architecture allows it.

The community should feel like an application/feed, not like a marketing website placed inside a footer wrapper.

---

## F. COMMUNITY UI

While working on the community layout, preserve all existing working functionality.

Do not remove:

- posts
- likes
- comments
- connections
- profile links
- image/media posting
- navigation

If any of those are currently broken, document the problem before making unrelated changes.

On mobile:

- prioritize the feed
- avoid oversized marketing sections
- remove the global marketing footer
- keep navigation compact
- avoid duplicated navigation
- make post actions easy to tap
- prevent horizontal overflow

Do not redesign the entire community unless necessary for these requirements.

---

## G. APP DOWNLOAD LINKS THROUGHOUT GIFTGRID

Inspect every current app CTA/link.

Replace outdated Google Play/App Store links where they are being used as the main GiftGrid app-installation route.

Point GiftGrid app CTAs to the new GiftGrid app landing page.

Examples:

"Get the App"

"Download GiftGrid"

"Get the GiftGrid App"

should route to the dedicated GiftGrid download page.

Do not inject excessive app-download promotions into the community feed.

Do not put the marketing footer back into the community just to expose the app download.

Use appropriate navigation/header/profile/settings placements where necessary.

---

## H. DATABASE / SUPABASE CHANGES

Inspect the existing Supabase schema and migrations before proposing schema changes.

Reuse an existing merchant/profile metadata field if one already represents business documents/trade decks appropriately.

If no suitable field exists, introduce the smallest necessary schema change.

For example, a merchant profile may need fields conceptually equivalent to:

trade_deck_url
trade_deck_uploaded_at

but DO NOT use those exact names if the existing schema follows another naming convention.

Follow the repository's conventions.

If a migration is required:

- create the migration
- do not automatically destroy/reset the database
- do not run destructive reset commands
- explain what the migration does
- keep backwards compatibility with existing merchant accounts

Do not expose `SUPABASE_SERVICE_ROLE_KEY` client-side.

Respect existing RLS policies.

If storage policies are required for trade decks, ensure merchants can upload/access their own document while unauthorized users cannot modify another merchant's document.

---

## I. SECURITY

Treat trade decks as business documents.

Do not automatically make them public unless the current GiftGrid product explicitly requires public merchant decks.

Prefer private or controlled-access storage if practical within the existing architecture.

Validate:

- MIME type
- file extension
- reasonable maximum file size
- authenticated user
- merchant ownership

Do not trust file extensions alone.

Prevent buyers from exploiting merchant-only upload/update endpoints.

Do not leak service-role keys or server-only environment variables.

---

## J. DO NOT BREAK EXISTING PRODUCTION

This repository is connected to the existing GiftGrid project.

Do not make destructive Supabase changes.

Do not delete existing working authentication or profiles.

Do not replace production configuration with local dummy credentials.

Do not commit `.env.local`.

Do not expose secrets.

Do not remove existing routes unless a replacement has been verified.

Do not blindly rewrite large areas of the project.

Make focused, maintainable changes.

---

## K. TESTING

After implementation, test at minimum:

1. Merchant signup without a trade deck:
   must fail cleanly.

2. Merchant signup with a valid trade deck:
   must proceed.

3. Buyer/gift-sourcing signup:
   must NOT request a website or trade deck.

4. Existing user login:
   must continue working.

5. Existing merchant login:
   must continue working.

6. Community desktop view:
   must not show the global marketing footer.

7. Community mobile view:
   must not show the global marketing footer.

8. Public/marketing pages:
   footer should still appear where appropriate.

9. App download page:
   must render correctly.

10. APK download:
    if a real APK exists, verify the actual file is downloadable.

11. QR code:
    must resolve to the correct GiftGrid download destination.

12. Google Play/App Store CTA audit:
    outdated primary download links must be removed/replaced.

13. TypeScript:
    no new type errors.

14. Lint:
    no new lint errors.

15. Production build:
    run the repository's normal build command and report failures.

Use the existing package scripts.

---

## L. FINAL REPORT

When finished, give me:

1. What you discovered before editing.
2. Every feature changed.
3. Every file created.
4. Every file modified.
5. Any Supabase migration created.
6. Any storage bucket/policy requirement.
7. Exact location where I should place the real APK if it is currently missing.
8. The final app-download URL.
9. Whether buyers are completely free from the trade deck/website requirement.
10. Whether merchants are prevented from completing onboarding without a trade deck.
11. Whether the footer has been removed specifically from community routes.
12. Any remaining issue I need to handle manually.
13. Results of lint/type/build tests.

IMPORTANT:

Do not merely give me instructions.

Inspect the repository and implement the changes directly.

Do not change files until you have first inspected the relevant implementation and identified the smallest safe set of changes.

Do not use Google Play as the primary GiftGrid app-distribution mechanism.

Trade deck is compulsory for merchants.

Trade deck and website are NOT compulsory for gift-sourcing users/buyers.

The community must not show the normal site footer.
