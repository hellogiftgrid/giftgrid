const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const base = process.env.GIFTGRID_TEST_URL || 'http://127.0.0.1:3000';
async function main() {
  fs.mkdirSync('.giftgrid-verification/screenshots', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
      const page = await browser.newPage({ viewport });
      await page.route('**/api/community/posts*', route => route.fulfill({ json: { posts: [{ id: 'test-post', author_name: 'Test Member', topic: 'Gifting ideas', body: 'A'.repeat(2000), created_at: '2026-09-30T12:00:00Z' }] } }));
      for (const route of ['/community', '/giftgrid']) {
        const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('footer').count(), 0);
        assert.equal(await page.locator('nav[aria-label="Community navigation"]').count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} overflows at ${viewport.width}px`);
        const action = await page.getByRole('button', { name: 'Like', exact: true }).first().boundingBox();
        assert.ok(action.height >= 44);
        await page.screenshot({ path: `.giftgrid-verification/screenshots/${route.slice(1)}-${viewport.width}.png`, fullPage: true });
      }
      await page.goto(base + '/app', { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(await page.locator('footer').count(), 1);
      assert.equal(await page.getByRole('heading', { name: 'Get the GiftGrid App', exact: true }).count(), 1);
      assert.equal(await page.getByRole('img', { name: 'QR code linking to the GiftGrid app download page' }).count(), 1);
      assert.equal(await page.getByRole('link', { name: 'Download Android APK', exact: true }).count(), 0, 'No fabricated APK download');
      assert.ok(await page.getByRole('status').isVisible());
      await page.screenshot({ path: `.giftgrid-verification/screenshots/app-${viewport.width}.png`, fullPage: true });
      await page.close();
    }
    const page = await browser.newPage();
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(await page.locator('footer').count(), 1);
    await page.goto(base + '/buyers/apply', { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(await page.locator('input[name="website"],input[type="file"]').count(), 0);
    assert.equal(await page.locator('input[name="companyName"]').getAttribute('required'), null);
    assert.equal(await page.locator('input[name="jobTitle"]').getAttribute('required'), null);
    const signupRequests = [];
    await page.route('**/auth/v1/signup*', async route => {
      signupRequests.push(route.request().postDataJSON());
      const payload = signupRequests.at(-1);
      await route.fulfill({ json: { id: '00000000-0000-0000-0000-000000000001', aud: 'authenticated', role: 'authenticated', email: payload.email, app_metadata: { provider: 'email' }, user_metadata: payload.data, identities: [], created_at: '2026-09-30T12:00:00Z' } });
    });
    await page.locator('input[name="fullName"]').fill('Buyer Test');
    await page.locator('input[name="email"]').fill('buyer-test@example.com');
    await page.locator('input[name="password"]').fill('test-password');
    await page.getByRole('button', { name: 'Create buyer account', exact: true }).click();
    await page.waitForURL('**/auth/verify*', { timeout: 60000 });
    assert.equal(signupRequests.at(-1).data.account_type, 'corporate_buyer');
    assert.equal(signupRequests.at(-1).data.website, undefined);
    assert.match(page.url(), /next=\/buyer\/dashboard/);
    await page.goto(base + '/auth/sign-up', { waitUntil: 'networkidle', timeout: 120000 });
    await page.locator('input[name="fullName"]').fill('Merchant Test');
    await page.locator('input[name="businessName"]').fill('Test Store');
    await page.locator('input[name="email"]').fill('merchant-test@example.com');
    await page.locator('input[name="password"]').fill('test-password');
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();
    await page.waitForURL('**/auth/verify*', { timeout: 60000 });
    assert.equal(signupRequests.at(-1).data.account_type, 'merchant');
    assert.match(page.url(), /next=\/merchant\/setup/);
    const missingDownload = await page.request.get(base + '/app/download');
    assert.equal(missingDownload.status(), 404);
    for (const endpoint of ['/api/merchant/onboarding']) {
      const response = await page.request.post(base + endpoint, { data: {} });
      assert.equal(response.status(), 401);
    }
    console.log('PASS: desktop/mobile community, public footer, app availability, buyer/merchant signup routing, and unauthenticated endpoint checks. Auth requests were intercepted; no accounts were created.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
