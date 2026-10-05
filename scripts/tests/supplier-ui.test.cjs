const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const product = { id: 'supplier-faire-test', title: 'Test product', category: 'Home', short_description: 'Test only', description: 'Test only', hero_image_url: null, minimum_order_quantity: null, price_range: null, merchant_profiles: null,
  supplier: { name: 'Test supplier', source: 'Faire', url: 'https://www.faire.com/product/p_test', availability: 'unknown', checked_at: '2026-10-01T00:00:00Z' } };
function page(file, item) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, URLSearchParams, require(name) {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'next/link') return ({ children, ...props }) => React.createElement('a', props, children);
    if (name === 'next/navigation') return { notFound: () => { throw new Error('404'); } };
    if (name === '@/lib/shop/catalog') return { getShopProduct: async () => item, productImage: () => null,
      getShopCatalog: async () => ({ products: [item], categories: [{ category: 'Home', product_count: 1 }], total: 1 }) };
    throw new Error(name);
  } });
  return exports.default;
}
test('supplier detail identifies source and routes ordering to the supplier', async () => {
  const Page = page('app/(community)/market/[id]/page.tsx', product);
  const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ id: product.id }) }));
  assert.match(html, /External supplier/);
  assert.match(html, /View on Faire/);
  assert.match(html, /Confirm stock with the supplier/);
  assert.match(html, /href="https:\/\/www.faire.com\/product\/p_test"/);
  assert.doesNotMatch(html, /Request a quote|GiftGrid merchant|Minimum order:/);
});
test('merchant quote path is preserved', async () => {
  const merchant = { ...product, id: 'merchant-product', supplier: undefined, minimum_order_quantity: 12, merchant_profiles: { business_name: 'Real merchant' } };
  const Page = page('app/(community)/market/[id]/page.tsx', merchant);
  const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ id: merchant.id }) }));
  assert.match(html, /Request a quote/);
  assert.match(html, /buyer\/dashboard\?listing=merchant-product/);
  assert.doesNotMatch(html, /External supplier|View on Faire/);
});
test('supplier shop cards never imply GiftGrid merchant membership', async () => {
  const Page = page('app/(community)/market/page.tsx', product);
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
  assert.match(html, /External supplier/);
  assert.match(html, /Test supplier/);
  assert.match(html, /Check supplier pricing/);
  assert.doesNotMatch(html, /Minimum order:|In stock/);
});
