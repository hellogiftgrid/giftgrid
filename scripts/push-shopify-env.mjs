import { spawn } from "node:child_process";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const names = ["SHOPIFY_CLIENT_ID", "SHOPIFY_CLIENT_SECRET", "SHOPIFY_TOKEN_ENCRYPTION_KEY", "SHOPIFY_APP_URL", "SHOPIFY_API_VERSION"];
const configured = names.filter(name => process.env[name]?.trim());
const required = ["SHOPIFY_TOKEN_ENCRYPTION_KEY", "SHOPIFY_APP_URL", "SHOPIFY_API_VERSION"];
const missing = required.filter(name => !process.env[name]?.trim());
if (missing.length) { process.stderr.write(`Missing Shopify environment keys: ${missing.join(", ")}\n`); process.exit(1); }
const appUrl = new URL(process.env.SHOPIFY_APP_URL);
if (appUrl.protocol !== "https:" || !["community.degiftgrid.com", "www.degiftgrid.com"].includes(appUrl.hostname)) {
  process.stderr.write("SHOPIFY_APP_URL must use the HTTPS GiftGrid production origin before upload.\n");
  process.exit(1);
}

for (const name of configured) {
  const child = spawn("vercel.cmd", ["env", "add", name, "production", "--sensitive", "--force", "--yes", "--non-interactive"], { shell: true, stdio: ["pipe", "ignore", "ignore"] });
  child.stdin.end(`${process.env[name]}\n`);
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  if (exitCode !== 0) {
    process.stderr.write(`Vercel rejected Shopify setting ${name}; value was not printed.\n`);
    process.exit(1);
  }
  process.stdout.write(`Updated sensitive production setting: ${name}\n`);
}
