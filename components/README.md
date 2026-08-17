# GiftGrid — Public Site

## Included in this pass
- App shell: `app/layout.tsx`, `app/globals.css`, Tailwind wired to brand tokens in `config/branding.ts`
- Shared `Header` / `Footer` / `Marquee` components
- Public pages: About, How It Works, Store Review, FAQ, Contact

## Not yet included
- Home page hero (built separately as HTML reference — port into `app/(public)/page.tsx` next)
- `/api/contact` route (the Contact form posts here — currently unimplemented)
- Auth, merchant portal, team workspace, admin portal
- Supabase schema / RLS

## Run locally
```
npm install
npm run dev
```
