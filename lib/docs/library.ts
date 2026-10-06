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
  const steps = guide.steps.filter(Boolean);
  const half = Math.ceil(steps.length / 2);
  const sections = [
    { heading: 'What to expect', paragraphs: [guide.context, guide.summary + ' This guide covers ' + steps.length + ' practical actions, in the order they usually happen.'] },
    { heading: 'Do this first', paragraphs: steps.slice(0, half).map((step, i) => step + '.') },
    { heading: 'Then finish with', paragraphs: steps.slice(half).map((step, i) => step + '.') },
    { heading: 'Good to know', paragraphs: ['Everything here reflects the current GiftGrid interface. Labels and buttons may move as the product evolves, but the flow stays the same: prepare, act on the page this guide references, and confirm the result before moving on.', 'When something does not match what you see, the destination page for this guide is the source of truth.'] },
  ];
  const wordCount = (guide.summary + ' ' + guide.context + ' ' + steps.join(' ')).split(/\s+/).length + 60;
  return { ...guide, intro: guide.summary + ' ' + guide.context, sections, wordCount };
});
export function getPublishedGuide(slug: string) {
  const guide = publishedGuides.find(g => g.slug === slug);
  return guide || null;
}
