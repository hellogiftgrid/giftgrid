import { readFile, writeFile } from 'node:fs/promises';
import { communityGuides, docSections } from '../../lib/docs/community-docs.ts';
import { validateDocArticle, docWordCount } from '../../lib/docs/article.ts';
import assert from 'node:assert/strict';

assert.equal(communityGuides.length, 219);
assert.equal(new Set(communityGuides.map(g => g.slug)).size, 219);
assert.equal(docSections.find(s => s.title === 'CLI').guides.length, 4);
assert.equal(docSections.find(s => s.title === 'Trade decks').guides.length, 4);
const articles = [], paragraphs = new Map(), problems = [];
for (const guide of communityGuides) {
  try {
    const saved = JSON.parse(await readFile(`content/docs/${guide.slug}.json`, 'utf8'));
    if (saved.reviewVersion !== 2) throw new Error('Editorial review missing');
    const article = validateDocArticle(saved, guide.slug);
    for (const p of [article.intro, ...article.sections.flatMap(s => s.paragraphs)]) {
      const normal = p.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (paragraphs.has(normal)) throw new Error(`Paragraph duplicated from ${paragraphs.get(normal)}`);
      paragraphs.set(normal, guide.slug);
    }
    articles.push(article);
  } catch (error) { problems.push({ slug: guide.slug, error: error.code === 'ENOENT' ? 'Missing guide' : error.message }); }
}
console.log(JSON.stringify({ valid: articles.length, required: 219, minimumWords: articles.length ? Math.min(...articles.map(docWordCount)) : 0, totalWords: articles.reduce((sum, a) => sum + docWordCount(a), 0), problems }, null, 2));
if (problems.length) process.exitCode = 1;
else if (process.argv.includes('--bundle')) await writeFile('lib/docs/articles.json', JSON.stringify(articles) + '\n');
