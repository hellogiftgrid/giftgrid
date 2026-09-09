import type { GeneratedArticle } from "./types";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Groq did not return valid JSON.");
  }

  return JSON.parse(cleaned.slice(first, last + 1));
}

export async function generateArticle(input: {
  primaryKeyword: string;
  secondaryKeywords: string[];
  titleHint?: string | null;
  pillar?: string | null;
  research: string;
  internalLinks: {
    url: string;
    title: string;
  }[];
}) {
  const apiKey = required("GROQ_API_KEY");

  const prompt = `
You are the editorial engine for GiftGrid, an ecommerce merchant platform.

Your task is to create ONE genuinely useful, original article from the supplied
keyword and research.

IMPORTANT:
- Do not fabricate statistics, studies, quotes, companies, products, or facts.
- Use the supplied research as evidence.
- Do not keyword-stuff.
- Do not write filler merely to increase word count.
- Do not mention that AI was used.
- Do not make medical, legal, financial, or other high-risk claims.
- Write naturally for real ecommerce merchants.
- Use practical examples.
- Keep GiftGrid's services relevant but do not make the article a sales pitch.
- The GiftGrid website is the canonical source.
- Internal links must be relevant and natural.
- External sources must only come from the supplied research.
- Return JSON only.

Primary keyword:
${input.primaryKeyword}

Secondary keywords:
${JSON.stringify(input.secondaryKeywords)}

Pillar:
${input.pillar || "General ecommerce education"}

Possible title hint:
${input.titleHint || "None"}

GiftGrid internal pages:
${JSON.stringify(input.internalLinks)}

Research:
${input.research}

Return exactly this JSON shape:

{
  "title": "string",
  "slug": "lowercase-url-slug",
  "excerpt": "short summary",
  "meta_title": "string",
  "meta_description": "string",
  "primary_keyword": "string",
  "secondary_keywords": ["string"],
  "search_intent": "informational|commercial|transactional|navigational",
  "article_html": "<article>...</article>",
  "faq": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "internal_links": [
    {
      "url": "string",
      "anchor": "string"
    }
  ],
  "external_sources": [
    {
      "title": "string",
      "url": "https://..."
    }
  ],
  "image_prompt": "string"
}
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.4,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are a careful ecommerce editorial researcher and writer. Output valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Groq request failed (${response.status}): ${body.slice(0, 1000)}`
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  const article = extractJson(text) as GeneratedArticle;

  if (!article.title || !article.slug || !article.article_html) {
    throw new Error(
      "Groq returned incomplete article data."
    );
  }

  return article;
}
