export type DocArticle = { slug: string; intro: string; sections: { heading: string; paragraphs: string[] }[] };
export function docWordCount(article: DocArticle) {
  return [article.intro, ...article.sections.flatMap(section => section.paragraphs)].join(' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length || 0;
}
export function validateDocArticle(value: unknown, slug: string): DocArticle {
  const a = value as DocArticle;
  if (!a || typeof a.intro !== 'string' || !Array.isArray(a.sections) || a.sections.length < 6 || a.sections.length > 12 || a.sections.some(s => typeof s.heading !== 'string' || !Array.isArray(s.paragraphs) || s.paragraphs.length < 1 || s.paragraphs.some(p => typeof p !== 'string' || p.length < 30))) throw new Error('Invalid guide structure.');
  const result = { slug, intro: a.intro, sections: a.sections };
  const words = docWordCount(result);
  if (words < 1000 || words > 2400) throw new Error(`Guide has ${words} words; expected 1000–2400.`);
  const paragraphs = [a.intro, ...a.sections.flatMap(s => s.paragraphs)];
  if (new Set(paragraphs.map(p => p.trim().toLowerCase())).size !== paragraphs.length) throw new Error('Repeated paragraph.');
  if (paragraphs.some(p => /<\/?[a-z][^>]*>|\/api\/v1\/|community (?:publish|draft) --|GIFTGRID_PUBLISHER_IDS/i.test(p))) throw new Error('Unsupported markup, route, or private automation instructions.');
  return result;
}
