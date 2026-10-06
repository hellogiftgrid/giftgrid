import 'server-only';
import raw from './articles.json';
import { communityGuides } from './community-docs';
import { type DocArticle, docWordCount } from './article';

const articles = new Map((raw as DocArticle[]).map(article => [article.slug, article]));
const isLiveGuide = (guide: { slug: string; title: string; summary: string; category: string }) =>
  !`${guide.slug} ${guide.title} ${guide.summary} ${guide.category}`.toLowerCase().includes('trade deck');
export const publishedGuides = communityGuides.filter(isLiveGuide).map(guide => {
  const article = articles.get(guide.slug);
  if (article) return { ...guide, intro: article.intro, sections: article.sections, wordCount: docWordCount(article) };
  const sections = [{ heading: 'How it works', paragraphs: [guide.context, guide.steps.join(' ')] }, { heading: 'Next steps', paragraphs: [guide.steps.slice(-2).join(' '), 'Use the destination link below to continue.'] }];
  return { ...guide, intro: guide.summary + ' ' + guide.context, sections, wordCount: (guide.summary + guide.context + guide.steps.join(' ')).split(/\s+/).length };
});
export function getPublishedGuide(slug: string) {
  const guide = publishedGuides.find(g => g.slug === slug);
  return guide || null;
}
