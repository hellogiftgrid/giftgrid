import test from "node:test";
import assert from "node:assert/strict";
import { parseSupplierCatalog, currentSupplierProducts, supplierPage } from "../../lib/shop/supplier-schema.ts";

const now = Date.parse("2026-10-01T08:00:00Z");
const product = {
  source: "aliexpress", source_id: "1005001234567", source_url: "https://www.aliexpress.com/item/1005001234567.html",
  supplier_name: "Test supplier", title: "Test product", description: "Test data only", category: "Home",
  image_url: "https://ae01.alicdn.com/kf/test.jpg", price: 12.5, currency: "GBP", minimum_order_quantity: null,
  availability: "unknown", checked_at: "2026-10-01T07:00:00Z",
};
const parse = value => parseSupplierCatalog({ version: 1, products: value }, now);

test("valid supplier feeds retain attribution, source, unknown stock and pricing", () => {
  const [result] = parse([product]);
  assert.equal(result.id, "supplier-aliexpress-1005001234567");
  assert.equal(result.availability, "unknown");
  assert.equal(result.price, 12.5);
  assert.equal(result.minimum_order_quantity, null);
  const [faire] = parse([{ ...product, source: "faire", source_id: "p_test", source_url: "https://www.faire.com/product/p_test", image_url: "https://cdn.faire.com/test.jpg", price: null, currency: null }]);
  assert.equal(faire.price, null);
  assert.equal(faire.source, "faire");
});
test("rejects spoofed supplier domains, credentials, unsafe images and non-product links", () => {
  for (const change of [
    { source_url: "https://aliexpress.com.attacker.example/item/123.html" },
    { source_url: "https://user:password@aliexpress.com/item/123.html" },
    { source_url: "https://www.aliexpress.com/store/123" },
    { image_url: "javascript:alert(1)" }, { image_url: "https://127.0.0.1/image" },
    { source: "unknown" },
  ]) assert.throws(() => parse([{ ...product, ...change }]));
});
test("rejects duplicate IDs and invalid numbers, text, timestamps", () => {
  assert.throws(() => parse([product, product]), /Duplicate/);
  for (const change of [{ title: "" }, { price: -1 }, { price: Infinity }, { minimum_order_quantity: 0 }, { currency: "dollars" }, { checked_at: "yesterday" }, { checked_at: "2026-10-03T00:00:00Z" }]) {
    assert.throws(() => parse([{ ...product, ...change }]));
  }
});
test("stale and out-of-stock products are hidden on every read", () => {
  assert.equal(currentSupplierProducts(parse([product]), now).length, 1);
  assert.equal(currentSupplierProducts(parse([product]), now + 8 * 86400000).length, 0);
  assert.equal(currentSupplierProducts(parse([{ ...product, availability: "out_of_stock" }]), now).length, 0);
});
test("merchant and supplier pagination has no missing or repeated products", () => {
  const products = Array.from({ length: 60 }, (_, index) => index);
  for (const merchantCount of [0, 1, 23, 24, 25, 48, 100]) {
    const pages = Math.ceil((merchantCount + products.length) / 24);
    const result = Array.from({ length: pages }, (_, index) => supplierPage(products, merchantCount, index + 1)).flat();
    assert.deepEqual(result, products);
    assert.deepEqual(supplierPage(products, merchantCount, pages + 1), []);
  }
});
test("empty catalog is valid and contains no demonstration inventory", () => {
  assert.deepEqual(parse([]), []);
});
