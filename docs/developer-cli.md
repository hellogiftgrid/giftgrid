# GiftGrid CLI and automation setup

The GiftGrid CLI is included in this repository and uses Node.js built-in `fetch`; no global install or SDK is needed. On Windows, run `giftgrid.cmd` from the repository root. On any platform, run `node scripts/giftgrid-cli.mjs`. The CLI reads credentials from environment variables and never accepts an API key as an argument.

## Start the CLI

Install Node.js 22.11 or newer, open a terminal in the GiftGrid repository, and check the available commands:

```powershell
node --version
giftgrid.cmd --help
giftgrid.cmd status
giftgrid.cmd shop list --page 1
giftgrid.cmd community list
```

`status`, shop listing, and community reading are public requests and do not need an API key. On PowerShell, `npm.cmd run giftgrid -- --help` and `npm.cmd run giftgrid -- status` are equivalent. If Windows cannot find `giftgrid.cmd`, change directory to the repository root first or use the `node` command above.

## Create and protect an API key

Sign in to GiftGrid and open Console → Apps. Register an app with a clear name such as `n8n company posts`. Open Console → API keys, choose the app, select only the required scope, and create a key. The key is shown once. For community publishing, the required scope is `community:publish`; use `community:draft` only if you need AI-generated drafts for a person to review. Do not grant unrelated app, key, or webhook scopes.

Store the key in your terminal’s secret store or automation platform’s encrypted credential store. For a short local PowerShell session, set it as an environment variable, then clear it when you finish:

```powershell
$env:GIFTGRID_API_KEY = "paste-the-key-here"
node scripts/giftgrid-cli.mjs apps list
Remove-Item Env:GIFTGRID_API_KEY
```

The example is for an interactive terminal only. Do not save the key in a script, source repository, browser, community post, or workflow step output. Revoke it from Console → API keys if it is exposed. Keys expire after 90 days when created in Console; revoke and replace expired keys there.

## Post from n8n, Make, or Zapier

Each service can call GiftGrid’s HTTPS API with its standard HTTP request action. The workflow posts as the real GiftGrid account that owns the API key; GiftGrid chooses the author name. It cannot post as arbitrary members. Automated publishing is limited to three posts per account in any 24 hours, with at least four hours between posts. The API supports publishing a post only; it does not automate likes, comments, follows, or messages. Keep posts useful, factual, and relevant, and do not create fake member activity.

Before connecting a workflow, the account must have an active `developer`, `admin`, or `super_admin` role, and GiftGrid must enable that account for community publishing. The owner UUID must be included in the production `GIFTGRID_PUBLISHER_IDS` setting. If this has not been configured, publishing returns an error saying community automation is not configured. The API key’s app must also have the `community:publish` scope.

Use this request in an n8n HTTP Request node, Make an API Call / HTTP Make a request module, or Webhooks by Zapier Custom Request action:

```http
POST https://www.degiftgrid.com/api/developer/community/posts
Authorization: Bearer <API_KEY>
Content-Type: application/json
Idempotency-Key: <stable-unique-event-id>
```

```json
{
  "topic": "Business gifting",
  "body": "We are preparing a year-end gifting programme and are looking for suppliers who can confirm production lead times for orders of 250 units. What information do you need to provide an accurate quote?"
}
```

In n8n, use an HTTP Request node with method `POST`, the URL above, JSON body mode, and a credential for the Authorization header. Set `Idempotency-Key` to a stable unique value from the triggering record; for a schedule-only trigger, use the n8n execution ID. In Make, configure the HTTP “Make a request” module with the same method, URL, headers, and JSON body; map a unique source-record or scheduled-run identifier into `Idempotency-Key`. In Zapier, select Webhooks by Zapier → Custom Request, set `POST`, JSON payload type, and the same three headers; map the trigger record’s unique ID to `Idempotency-Key`. Use each platform’s encrypted credential field for the API key and disable task-data logging for the Authorization header.

The idempotency key must be 8–100 letters, digits, underscores, or hyphens. Retrying the same key with the same body returns the original post without publishing a duplicate. Reusing the key with changed content returns HTTP 409. The API rejects more than 2,000 characters, caller-supplied author fields, and posts that exceed the automated publishing schedule. Treat HTTP 429 as a stop-and-wait response; do not retry it in a tight loop. Review scheduled content and pause the workflow when the source data is stale or misleading.

For an AI-assisted flow, request an editorial draft using `community:draft`, route it to a human approval step, then send the approved body to the publish endpoint with a new idempotency key. Drafting does not publish. Never generate testimonials, buyer requests, supplier availability claims, or activity attributed to other people.

## Commands

```text
giftgrid.cmd status
giftgrid.cmd shop list [--category CATEGORY] [--page NUMBER]
giftgrid.cmd community list
giftgrid.cmd community draft --brief "Source material for an editorial draft"
giftgrid.cmd community publish --body "Approved post text" --topic "Business gifting" --idempotency-key unique-event-123
giftgrid.cmd apps list
giftgrid.cmd apps create --name "GiftGrid n8n posts" --description "Approved company publishing workflow"
giftgrid.cmd keys create --app-id APP_ID --scopes community:publish
giftgrid.cmd keys revoke --key-id KEY_ID
```

The CLI supports app and key management, public catalog/feed reads, editorial drafts, and the same scoped publishing API. Key creation needs an authenticated developer API key with `keys:write`; create the first app and key in the GiftGrid Console. A key returned by the CLI is shown once, so store it immediately in a secure credential manager.

## Webhook limitation

GiftGrid can register an HTTPS webhook URL and event names for an app, but outbound event delivery is not enabled in this release. For scheduled publishing, have n8n, Make, or Zapier call the HTTP publishing endpoint above. Do not rely on webhook registrations as triggers until GiftGrid announces event delivery.
