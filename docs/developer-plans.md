# GiftGrid developer plans

Developer plans control platform capacity. A developer's GiftGrid status still controls eligibility, scopes, suspension, and appeal rules. Plan limits apply per developer account unless a plan says otherwise.

| Capability | Starter | Growth | Scale |
| --- | ---: | ---: | ---: |
| Registered apps | 2 | 10 | Unlimited |
| Sandbox environments | One per app | One per app | One per app, with extra test projects |
| Active cron jobs | 3 | 20 | 100 |
| Minimum cron interval | Daily | Hourly | Every 5 minutes |
| Monthly API requests | 10,000 | 250,000 | 2,000,000 |
| Monthly webhook deliveries | 10,000 | 250,000 | 2,000,000 |
| Concurrent webhook deliveries | 2 | 10 | 50 |
| API keys per app/environment | 5 | 20 | 100 |
| Webhook endpoints per app | 3 | 15 | 50 |
| Request and delivery log retention | 7 days | 30 days | 90 days |
| Cron run history | 7 days | 30 days | 90 days |
| Failed-delivery retries | 2 | 3 | 5 |
| Sandbox data retention | 7 days | 30 days | 90 days |
| AI monitoring | Enabled | Enabled with alerts | Enabled with alerts and priority review |
| Support | Documentation | Standard support | Priority support |

All plans receive separate sandbox and production credentials. Production access still depends on the developer's status and approved scopes. Chatbot and automation integrations are monitored on every plan and may be suspended immediately by AI for serious abuse or security risk.

When a plan limit is reached, the console should explain the limit, preserve the request or job state safely, and offer an upgrade path. It must not silently drop webhooks or cron jobs. Rate-limit responses should include a retry time, and failed email notifications follow GiftGrid's provider fallback and retry policy.

Scale can later support negotiated limits, dedicated support, custom retention, IP allowlists, signed build attestations, and a separate production region without changing the API contract.
