import 'server-only';
import raw from './articles.json';
import { communityGuides } from './community-docs';
import { type DocArticle, docWordCount } from './article';

const articles = new Map((raw as DocArticle[]).map(article => [article.slug, article]));
const isLiveGuide = (guide: { slug: string; title: string; summary: string; category: string }) =>
  !`${guide.slug} ${guide.title} ${guide.summary} ${guide.category}`.toLowerCase().includes('trade deck');
export const publishedGuides = communityGuides.filter(guide => articles.has(guide.slug) && isLiveGuide(guide)).map(guide => ({ ...guide, wordCount: docWordCount(articles.get(guide.slug)!) }));
export function getPublishedGuide(slug: string) {
  const guide = publishedGuides.find(guide => guide.slug === slug);
  const article = articles.get(slug);
  return guide && article ? { ...guide, ...article } : null;
}
