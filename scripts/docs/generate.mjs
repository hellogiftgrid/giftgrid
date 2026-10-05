import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { communityGuides } from '../../lib/docs/community-docs.ts';
import { validateDocArticle, docWordCount } from '../../lib/docs/article.ts';

const origin = 'https://community.degiftgrid.com';
const token = (await readFile('.giftgrid-docs-build-token', 'utf8')).trim();
const only = process.argv.includes('--sample') ? communityGuides.slice(0, 2) : communityGuides;
await mkdir('content/docs', { recursive: true });
await mkdir('.giftgrid-docs-drafts', { recursive: true });
let next = 0, completed = 0, failed = 0;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function worker() {
  while (next < only.length) {
    const guide = only[next++];
    const filename = `content/docs/${guide.slug}.json`;
    try {
      const saved = JSON.parse(await readFile(filename, 'utf8'));
      if (saved.reviewVersion !== 2) throw new Error('Needs editorial review');
      const existing = validateDocArticle(saved, guide.slug);
      completed++; console.log(`Existing ${completed}/${only.length}: ${guide.slug} (${docWordCount(existing)} words)`); continue;
    } catch { /* Missing or invalid drafts are regenerated. */ }
    let saved = false;
    let feedback = '';
    let candidate = null;
    try { candidate = validateDocArticle(JSON.parse(await readFile(`.giftgrid-docs-drafts/${guide.slug}.json`, 'utf8')), guide.slug); } catch {}
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        let article = candidate;
        if (!article || feedback) {
        const response = await fetch(`${origin}/api/admin/docs/draft`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: guide.slug, feedback, ...(article && feedback ? { mode: 'correct', article } : {}) }), redirect: 'error', signal: AbortSignal.timeout(175000) });
        const result = await response.json();
        if (response.status === 403) throw new Error('BUILD_AUTH_FAILED');
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${result.error || 'generation failed'}`);
        article = validateDocArticle(result.article, guide.slug);
        candidate = article;
        feedback = '';
        await writeFile(`.giftgrid-docs-drafts/${guide.slug}.json`, JSON.stringify(article));
        }
        const reviewResponse = await fetch(`${origin}/api/admin/docs/draft`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: guide.slug, mode: 'review', article }), redirect: 'error', signal: AbortSignal.timeout(175000) });
        const review = await reviewResponse.json();
        if (!reviewResponse.ok) throw new Error(`Review HTTP ${reviewResponse.status}`);
        if (review.approved !== true) { feedback = (review.issues || ['Review failed']).join(' '); throw new Error('Editorial corrections: ' + feedback.slice(0, 500)); }
        await writeFile(filename + '.tmp', JSON.stringify({ ...article, reviewVersion: 2 }, null, 2) + '\n');
        await rename(filename + '.tmp', filename);
        completed++; saved = true;
        console.log(`Draft ${completed}/${only.length}: ${guide.slug} (${docWordCount(article)} words)`);
        break;
      } catch (error) {
        if (error.message === 'BUILD_AUTH_FAILED') throw error;
        console.log(`Retry ${attempt}/10 ${guide.slug}: ${error.message}`);
        await delay(Math.min(attempt * 15000, 60000));
      }
    }
    if (!saved) { failed++; console.log(`FAILED ${guide.slug}`); }
  }
}
await Promise.all(Array.from({ length: 2 }, worker));
console.log(JSON.stringify({ completed, failed, total: only.length }));
if (failed) process.exitCode = 1;
