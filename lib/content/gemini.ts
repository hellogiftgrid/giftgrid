import { GoogleGenAI } from "@google/genai";

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function researchTopic(
  keyword: string,
  country = "Nigeria"
) {
  const ai = getGemini();

  const prompt = `
Research this topic for GiftGrid:

Primary keyword: ${keyword}
Target market: ${country}

GiftGrid is an ecommerce merchant platform focused on merchant profiles,
store readiness, corporate gifting, wholesale and commercial opportunities.

Research:
1. Search intent.
2. Closely related search questions.
3. Important subtopics.
4. Current information that should be verified.
5. Useful sources.
6. Terms/phrases users commonly use.
7. Content angles that would be genuinely useful to ecommerce merchants.

Do not invent statistics or sources.

Return a concise research brief suitable for another AI model to turn into
an original article.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

  return response.text || "";
}

export async function researchUrl(url: string) {
  const ai = getGemini();

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `
Analyze this webpage as research for GiftGrid:
${url}

Summarize only information useful for an ecommerce knowledge article.
Do not invent information that is not present on the page.
`,
    config: {
      tools: [
        {
          urlContext: {},
        },
      ],
    },
  });

  return response.text || "";
}
