#!/usr/bin/env node
import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseSupplierCatalog, currentSupplierProducts } from "../../lib/shop/supplier-schema.ts";

// Run with Node 24+. Nothing is uploaded and no database is changed by this command.
const args = process.argv.slice(2);
async function main() {
  if (args.includes("--help") || !args.length) {
    console.log("Usage: node scripts/shop/import-suppliers.mjs <supplier-feed.json> [--write --confirm-rights]\nWithout --write, validates only. --write replaces the complete supplier catalog for the next deployment.\nFeed: {version:1,products:[{source,source_id,source_url,supplier_name,title,description,category,image_url,price,currency,minimum_order_quantity,availability,checked_at}]}\nsource: aliexpress or faire. Use null for unknown price/minimum order and unknown for unconfirmed stock. checked_at is the actual source verification time. Products expire after seven days.\n--confirm-rights confirms you may republish the supplied product data and images.");
    return;
  }
  if (args.slice(1).some(arg => !["--write", "--confirm-rights"].includes(arg))) throw new Error("Unknown option.");
  const raw = await readFile(args[0], "utf8");
  if (Buffer.byteLength(raw) > 25 * 1024 * 1024) throw new Error("Feed exceeds 25 MB.");
  const products = parseSupplierCatalog(JSON.parse(raw));
  const visible = currentSupplierProducts(products);
  console.log(JSON.stringify({ valid: products.length, visible: visible.length, expiredOrUnavailable: products.length - visible.length }));
  if (!args.includes("--write")) return;
  if (!args.includes("--confirm-rights")) throw new Error("Confirm permission to republish this feed with --confirm-rights.");
  const destination = fileURLToPath(new URL("../../config/supplier-products.json", import.meta.url));
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify({ version: 1, products }, null, 2) + "\n", { flag: "wx" });
  await rename(temporary, destination);
  console.log("Supplier catalog saved locally. Review and deploy to publish it.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
