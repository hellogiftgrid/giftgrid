export const developerDocs = [
  ["getting-started", "Getting started", "Create a GiftGrid app, choose an environment, and make your first authenticated request."],
  ["authentication", "Authentication", "Use scoped sandbox and production credentials without exposing secrets in client code."],
  ["projects", "Projects", "Organize integrations into projects with separate settings, owners, and deployment history."],
  ["sandbox", "Sandbox", "Test webhooks, chatbots, automations, and merchant workflows using isolated test data."],
  ["api-keys", "API keys", "Create, rotate, expire, and revoke keys with the smallest required scope."],
  ["scopes", "Scopes", "Understand read, write, profile, marketplace, and automation permissions."],
  ["profiles", "Merchant profiles", "Read approved merchant profile fields while keeping private contact details protected."],
  ["buyers", "Buyer workflows", "Submit sourcing requests and track responses without exchanging personal contact details."],
  ["community", "Community posts", "Publish and read moderated community posts through the live feed API."],
  ["webhooks", "Webhooks", "Receive signed event notifications and verify every delivery before processing it."],
  ["retries", "Retries and idempotency", "Make network retries safe and prevent duplicate applications and posts."],
  ["cron", "Cron jobs", "Schedule recurring jobs with explicit timezones, run history, and failure handling."],
  ["automations", "Automations", "Design automations that remain observable, reversible, and within granted scopes."],
  ["chatbots", "Chatbots", "Add a GiftGrid chatbot while keeping prompts, user data, and actions inside policy boundaries."],
  ["rate-limits", "Rate limits", "Read usage headers, back off correctly, and avoid noisy retry loops."],
  ["errors", "Errors", "Interpret API errors and return useful user-facing messages without leaking internals."],
  ["security", "Security", "Protect keys, validate signatures, redact logs, and report suspected abuse."],
  ["production", "Production checklist", "Review domains, callbacks, monitoring, data retention, and rollback plans before launch."],
  ["changelog", "Changelog", "Track API behavior changes and prepare integrations for version updates."],
] as const;

export function getDeveloperDoc(slug: string) { return developerDocs.find((doc) => doc[0] === slug); }
