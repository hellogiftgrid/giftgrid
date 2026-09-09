#!/usr/bin/env node

/**
 * GiftGrid developer CLI. It intentionally uses only Node's built-in APIs so
 * developers can run it with `npx`/Node without installing another SDK.
 */
const args = process.argv.slice(2);
const API_URL = (process.env.GIFTGRID_API_URL || "https://www.degiftgrid.com/api").replace(/\/$/, "");
const API_KEY = process.env.GIFTGRID_API_KEY;

function help() {
  console.log(`GiftGrid Developer CLI

Usage:
  npm run giftgrid -- <resource> <action> [options]

Resources and actions:
  apps list
  apps create --name <name> [--description <text>]
  keys create --app-id <id> --scopes <scope,...> [--expires <ISO date>]
  keys revoke --key-id <id>
  webhooks add --app-id <id> --url <https URL> --events <event,...>

Environment:
  GIFTGRID_API_URL  API root (defaults to https://www.degiftgrid.com/api)
  GIFTGRID_API_KEY  developer API key (never pass keys as command arguments)
`);
}

function options(values) {
  const result = {};
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    result[key] = values[i + 1]?.startsWith("--") || values[i + 1] === undefined ? true : values[++i];
  }
  return result;
}

function requireKey() {
  if (!API_KEY) throw new Error("Set GIFTGRID_API_KEY before running this command.");
}

async function request(path, method = "GET", body) {
  requireKey();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { accept: "application/json", authorization: `Bearer ${API_KEY}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${response.status}: ${payload?.message || "GiftGrid API request failed"}`);
  return payload;
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const [resource, action, ...rest] = args;
  if (!resource || resource === "--help" || resource === "-h") return help();
  const opts = options(rest);
  let result;
  if (resource === "apps" && action === "list") result = await request("/developer/apps");
  else if (resource === "apps" && action === "create") {
    if (!opts.name) throw new Error("apps create requires --name");
    result = await request("/developer/apps", "POST", { name: opts.name, description: opts.description || undefined });
  } else if (resource === "keys" && action === "create") {
    if (!opts["app-id"] || !opts.scopes) throw new Error("keys create requires --app-id and --scopes");
    result = await request(`/developer/apps/${encodeURIComponent(opts["app-id"])}/keys`, "POST", {
      scopes: String(opts.scopes).split(",").map((scope) => scope.trim()).filter(Boolean),
      expiresAt: opts.expires || undefined,
    });
  } else if (resource === "keys" && action === "revoke") {
    if (!opts["key-id"]) throw new Error("keys revoke requires --key-id");
    result = await request(`/developer/keys/${encodeURIComponent(opts["key-id"])}`, "DELETE");
  } else if (resource === "webhooks" && action === "add") {
    if (!opts["app-id"] || !opts.url || !opts.events) throw new Error("webhooks add requires --app-id, --url, and --events");
    result = await request(`/developer/apps/${encodeURIComponent(opts["app-id"])}/webhooks`, "POST", {
      url: opts.url,
      events: String(opts.events).split(",").map((event) => event.trim()).filter(Boolean),
    });
  } else throw new Error("Unknown command. Run with --help.");
  print(result);
}

main().catch((error) => { console.error(`GiftGrid CLI: ${error.message}`); process.exitCode = 1; });
