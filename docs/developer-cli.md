# GiftGrid Developer CLI

The GiftGrid Developer CLI lets an approved developer manage multiple registered apps, app-specific API keys, and webhooks from a terminal. It is a thin client for the GiftGrid Developer API and uses Node's built-in `fetch`, so no SDK dependency is required.

## Setup

Create an API key in the GiftGrid Developer area, then set it in the shell. Keep it out of source control and never use a `NEXT_PUBLIC_` variable for it.

```bash
export GIFTGRID_API_KEY="your-key"
export GIFTGRID_API_URL="https://www.degiftgrid.com/api" # optional
npm run giftgrid -- --help
```

The CLI never prints the key. Revoke a key immediately if it is exposed.

## Plans and capacity

Starter, Growth, and Scale plans control app count, API and webhook volume, cron frequency, concurrency, retries, sandbox retention, and log retention. See [developer plans](./developer-plans.md) for the initial limits. Plan capacity is separate from a user's GiftGrid merchant stage or buyer status.

## Commands

```bash
npm run giftgrid -- apps list
npm run giftgrid -- apps create --name "My Gift App" --description "Gift recommendations"
npm run giftgrid -- keys create --app-id APP_ID --scopes merchants:read,bookings:read --expires 2027-01-01T00:00:00Z
npm run giftgrid -- keys revoke --key-id KEY_ID
npm run giftgrid -- webhooks add --app-id APP_ID --url https://example.com/giftgrid-hook --events booking.created,merchant.updated
```

Each app has independent keys, scopes, webhooks, logs, AI monitoring, and suspension state. A developer can register multiple apps. A suspended app is isolated from the developer's other apps unless the developer account is also restricted.

## Access and review

Developer access inherits the user's GiftGrid status. A developer may be a merchant at Registered, Approved, Recommended, Preferred Partner, or Strategic Partner stage, or a corporate buyer. Chatbot and automation integrations receive immediate access for eligible developers and are monitored by AI. AI may suspend an integration immediately for a serious security or abuse signal; the Super Admin receives an alert and the developer receives a GiftGrid-branded appeal email.

The CLI does not bypass status, scope, review, suspension, or appeal rules. API keys should be scoped to the smallest set of resources required by an app.

## API resources

The CLI calls these API resources:

| CLI command | API request |
| --- | --- |
| `apps list` | `GET /api/developer/apps` |
| `apps create` | `POST /api/developer/apps` |
| `keys create` | `POST /api/developer/apps/{appId}/keys` |
| `keys revoke` | `DELETE /api/developer/keys/{keyId}` |
| `webhooks add` | `POST /api/developer/apps/{appId}/webhooks` |

All requests use `Authorization: Bearer <GIFTGRID_API_KEY>`. Store API keys and webhook signing secrets securely. Webhook consumers should verify signatures, reject replays, and return a 2xx response quickly before doing slow work.

The CLI is ready for these Developer API routes; route handlers can be added without changing the command interface.
