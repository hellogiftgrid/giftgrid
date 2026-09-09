# GiftGrid journal and Blogger publishing

The journal uses the checked-in `lib/blog/library.json` plus published `blog_articles` database records. Each article has at least 700 words of body prose. React renders structured text; external HTML is never injected into the website. The build stops if the initial fifty-article library has not been generated with a valid provider credential.

## Initial library

Run `npm run content:generate` with `GROQ_API_KEY` available to Node. The script writes one recoverable JSON file per article under `content/blog`, skips completed articles, and builds the library only after all fifty pass length and uniqueness checks. The production build can perform this step with the existing deployment credential. Do not commit credentials or print provider authorization headers. `GROQ_MODEL` optionally overrides the configured writing model.

## Publishing destinations

- GiftGrid: https://www.degiftgrid.com/blog
- Community announcements: https://community.degiftgrid.com/
- Blogger: https://gift-grid.blogspot.com
- Blogger: https://degiftgrid.blogspot.com

The default schedule is 09:00 UTC daily. Each generated article is saved to GiftGrid and announced in the community; Blogger delivery is attempted for both destinations when connected. Initial articles are available immediately on GiftGrid; subsequent generated articles are saved to GiftGrid before Blogger delivery. A failed destination can be retried without reposting to successful destinations or duplicating the community announcement. A database lease prevents concurrent daily jobs; stable Blogger labels reconcile interrupted requests.

Apply `supabase/migrations/20260905210000_blog_publishing.sql` before enabling publishing. Google refresh tokens are encrypted and stored in a table inaccessible to anonymous and authenticated browser clients. The server service role performs publishing.

## Connection

In the Google Cloud project, enable Blogger API and add this authorized redirect URI to the OAuth web client:

`https://www.degiftgrid.com/api/admin/blog/callback`

Configure `BLOGGER_CLIENT_ID` and `BLOGGER_CLIENT_SECRET`, or reuse the existing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. `BLOGGER_REDIRECT_URI` overrides the callback for a separate test environment. Set `CRON_SECRET` in the deployment so the scheduler can authenticate. Optionally set a persistent `BLOGGER_TOKEN_ENCRYPTION_KEY`; otherwise tokens are encrypted using a key derived from the service-role secret. If that secret rotates, reconnect Blogger accounts.

Visit `/admin/blog` as the super-admin and choose **Connect Blogger account**. Authorize the Google account with author access to the requested blogs. Connect again using another account if needed. Only the two named hostnames are accepted. The dashboard shows connection status, word counts and delivery errors; it never exposes tokens.

Google account consent cannot be completed by setting a blog URL. See [Blogger post insertion](https://developers.google.com/blogger/docs/3.0/reference/posts/insert) and [web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server).

## Editor

`/admin/design` edits the actual section documents used by public pages. The homepage, about, process, readiness and FAQ content are section-managed. Contact, booking and buyer pages keep working application forms below or beside their editable sections. Legal text and signed-in dashboards do not use decorative marketing heroes.

Drafts save separately; Publish saves theme and page documents in one database operation and invalidates the published layout. Preview messages must come from the parent editor on the same origin. Preview changes cannot persist without a super-admin save request. Desktop previews use a 1280px viewport scaled to fit, while mobile uses 390px. The homepage headline uses a light font weight, as requested.
