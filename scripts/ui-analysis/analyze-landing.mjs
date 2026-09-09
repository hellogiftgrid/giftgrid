import fs from "node:fs";
import path from "node:path";

const imagePath = path.resolve(
  process.argv[2] || "design-reference/landing-reference.png"
);

if (!fs.existsSync(imagePath)) {
  console.error(`Missing image: ${imagePath}`);
  process.exit(1);
}

const image = fs.readFileSync(imagePath);
const imageBase64 = image.toString("base64");
const mimeType = "image/png";

const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!geminiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

if (!groqKey) {
  console.error("Missing GROQ_API_KEY");
  process.exit(1);
}

const prompt = `
Analyze this landing-page reference image as a senior product designer,
frontend engineer, and UX architect.

We will use your analysis to REBUILD the page as a real interactive
Next.js + Tailwind website.

Do NOT treat the image as something to simply display on the webpage.

Determine:

- exact section order
- section boundaries
- header/navigation
- hero composition
- headline hierarchy
- body copy hierarchy
- CTA placement
- cards
- grids
- image usage
- image cropping/aspect ratios
- backgrounds
- borders
- shadows
- gradients
- colors
- typography characteristics
- approximate spacing
- visual hierarchy
- responsive behavior
- mobile adaptation
- likely interactive elements
- animation opportunities
- reusable React components
- assets that appear to be required
- which elements must remain real HTML for SEO/accessibility
- which visuals can be decorative
- any repeated patterns

For every section, provide an estimated vertical start/end position
in the 2192px reference image.

Be conservative: do not invent business claims, statistics, testimonials,
logos, or functionality that are not visible in the reference.

Return JSON only, using this structure:

{
  "image": {
    "width": 480,
    "height": 2192
  },
  "design_summary": "",
  "sections": [
    {
      "id": "",
      "name": "",
      "start_y": 0,
      "end_y": 0,
      "purpose": "",
      "visual_description": "",
      "text_elements": [],
      "cta_elements": [],
      "images": [],
      "components": [],
      "interactions": [],
      "responsive_notes": []
    }
  ],
  "navigation": {},
  "hero": {},
  "typography": {},
  "color_system": {},
  "spacing_system": {},
  "components": [],
  "interactions": [],
  "responsive_strategy": {},
  "assets": [],
  "seo_requirements": [],
  "accessibility_requirements": [],
  "implementation_order": []
}
`;

async function gemini() {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: {
        "x-goog-api-key": geminiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Gemini ${response.status}: ${await response.text()}`
    );
  }

  return await response.json();
}

async function groq() {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        temperature: 0.2,
        max_completion_tokens: 8000,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert UI reverse-engineering designer. Return JSON only.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Groq ${response.status}: ${await response.text()}`
    );
  }

  return await response.json();
}

function extractGeminiText(result) {
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n") || ""
  );
}

function extractGroqText(result) {
  return result?.choices?.[0]?.message?.content || "";
}

const [geminiResult, groqResult] = await Promise.all([
  gemini(),
  groq(),
]);

const geminiText = extractGeminiText(geminiResult);
const groqText = extractGroqText(groqResult);

fs.writeFileSync(
  "design-reference/gemini-analysis.json",
  geminiText,
);

fs.writeFileSync(
  "design-reference/groq-analysis.json",
  groqText,
);

console.log("Gemini analysis saved:");
console.log("  design-reference/gemini-analysis.json");

console.log("Groq analysis saved:");
console.log("  design-reference/groq-analysis.json");

console.log("AI analysis complete.");
