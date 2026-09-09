export type ContentTopic = {
  id: string;
  keyword: string;
  title_hint: string | null;
  pillar: string | null;
  search_intent: string | null;
  country: string | null;
  priority: number;
  status: string;
};

export type GeneratedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  article_html: string;
  faq: {
    question: string;
    answer: string;
  }[];
  internal_links: {
    url: string;
    anchor: string;
  }[];
  external_sources: {
    title: string;
    url: string;
  }[];
  image_prompt: string;
};
