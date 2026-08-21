import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SECTIONS = [
  "Store Presentation",
  "Brand Identity",
  "Product Readiness",
  "Operational Credibility",
  "Compliance",
] as const;

type SectionName = (typeof SECTIONS)[number];

type Check = {
  id: string;
  section: SectionName;
  title: string;
  passed: boolean;
  score: number;
  evidence: string;
  recommendation: string;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service-role configuration is missing.");
  }

  return createAdminClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function cleanText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function links(html: string, baseUrl: string) {
  const result = new Set<string>();

  for (const match of html.matchAll(
    /<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi
  )) {
    try {
      const url = new URL(match[1], baseUrl);

      if (
        url.protocol === "http:" ||
        url.protocol === "https:"
      ) {
        const base = new URL(baseUrl);

        if (url.hostname === base.hostname) {
          result.add(url.toString());
        }
      }
    } catch {}
  }

  return [...result];
}

async function fetchPage(url: string) {
  try {
    const started = Date.now();

    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "GiftGridAuditBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await response.text();

    return {
      url,
      response,
      html,
      text: cleanText(html),
      responseTime: Date.now() - started,
    };
  } catch {
    return null;
  }
}

function hasAny(text: string, patterns: string[]) {
  return patterns.some((pattern) =>
    text.toLowerCase().includes(pattern.toLowerCase())
  );
}

function scoreSection(checks: Check[]) {
  if (!checks.length) return 0;

  return Math.round(
    checks.reduce((sum, check) => sum + check.score, 0) /
      checks.length
  );
}

function statusFor(score: number) {
  if (score >= 90) return "passed";
  if (score >= 50) return "needs_attention";
  return "failed";
}

function severityFor(score: number) {
  if (score >= 90) return "low";
  if (score >= 50) return "medium";
  if (score >= 25) return "high";
  return "critical";
}

export async function POST() {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data: merchant, error: merchantError } =
      await supabase
        .from("merchant_profiles")
        .select(
          "id, business_name, business_email, store_url, business_category, product_category"
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (merchantError) {
      return NextResponse.json(
        { error: merchantError.message },
        { status: 500 }
      );
    }

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant profile not found." },
        { status: 404 }
      );
    }

    if (!merchant.store_url) {
      return NextResponse.json(
        {
          error:
            "Add your store URL in your profile before running the audit.",
        },
        { status: 400 }
      );
    }

    let storeUrl = merchant.store_url.trim();

    if (!/^https?:\/\//i.test(storeUrl)) {
      storeUrl = `https://${storeUrl}`;
    }

    const parsed = new URL(storeUrl);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "The store URL must use HTTP or HTTPS." },
        { status: 400 }
      );
    }

    const homepage = await fetchPage(parsed.toString());

    if (!homepage || !homepage.response.ok) {
      return NextResponse.json(
        {
          error: `Could not access the store. ${
            homepage
              ? `HTTP ${homepage.response.status}`
              : "Connection failed"
          }`,
        },
        { status: 400 }
      );
    }

    const discoveredLinks = links(
      homepage.html,
      parsed.toString()
    );

    const priorityWords = [
      "about",
      "contact",
      "privacy",
      "terms",
      "return",
      "refund",
      "shipping",
      "product",
      "collection",
      "shop",
      "bundle",
      "gift",
      "wholesale",
      "bulk",
      "partner",
      "faq",
      "cancellation",
    ];

    const prioritized = discoveredLinks
      .sort((a, b) => {
        const score = (url: string) =>
          priorityWords.reduce(
            (n, word) =>
              n + (url.toLowerCase().includes(word) ? 1 : 0),
            0
          );

        return score(b) - score(a);
      })
      .slice(0, 12);

    const pages = [homepage];

    for (const url of prioritized) {
      if (pages.length >= 13) break;
      if (url === homepage.url) continue;

      const page = await fetchPage(url);

      if (page?.response.ok) {
        pages.push(page);
      }
    }

    const combinedText = pages
      .map((page) => page.text)
      .join("\n\n")
      .slice(0, 90000);

    const html = homepage.html;

    const titleMatch = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    const descriptionMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    );

    const h1Count = [
      ...html.matchAll(/<h1\b[^>]*>/gi),
    ].length;

    const imageTags = [
      ...html.matchAll(/<img\b[^>]*>/gi),
    ].map((m) => m[0]);

    const imageAltCount = imageTags.filter((img) =>
      /\salt=["'][^"']+["']/i.test(img)
    ).length;

    const imageCoverage = imageTags.length
      ? imageAltCount / imageTags.length
      : 1;

    const viewport = /<meta[^>]*name=["']viewport["']/i.test(
      html
    );

    const heroCopy =
      h1Count > 0 &&
      Boolean(
        titleMatch?.[1]?.trim() ||
          descriptionMatch?.[1]?.trim()
      );

    const text = combinedText.toLowerCase();

    const contact =
      hasAny(text, ["contact us", "contact", "get in touch"]) ||
      prioritized.some((u) => u.toLowerCase().includes("contact"));

    const about =
      hasAny(text, ["about us", "our story", "founder", "our mission"]) ||
      prioritized.some((u) => u.toLowerCase().includes("about"));

    const products =
      /\/products?\//i.test(combinedText) ||
      /\/collections?\//i.test(combinedText) ||
      hasAny(text, ["add to cart", "shop now", "buy now", "products"]);

    const inventorySignal =
      hasAny(text, ["sold out", "out of stock"]) ||
      /add to cart|buy now|purchase/i.test(combinedText);

    const bundles =
      hasAny(text, [
        "bundle",
        "gift set",
        "gift box",
        "set of",
        "corporate gift",
      ]);

    const wholesale =
      hasAny(text, [
        "wholesale",
        "bulk order",
        "bulk orders",
        "corporate orders",
        "partner with us",
        "become a partner",
      ]);

    const privacy =
      hasAny(text, ["privacy policy"]) ||
      prioritized.some((u) =>
        u.toLowerCase().includes("privacy")
      );

    const terms =
      hasAny(text, ["terms of service", "terms and conditions"]) ||
      prioritized.some((u) =>
        u.toLowerCase().includes("terms")
      );

    const refund =
      hasAny(text, ["refund policy", "returns policy", "return policy"]) ||
      prioritized.some((u) =>
        /refund|return/i.test(u)
      );

    const shipping =
      hasAny(text, ["shipping policy", "delivery policy", "shipping"]) ||
      prioritized.some((u) =>
        u.toLowerCase().includes("shipping")
      );

    const cancellation =
      hasAny(text, ["cancellation policy", "cancellation"]) ||
      prioritized.some((u) =>
        u.toLowerCase().includes("cancellation")
      );

    const checks: Check[] = [
      {
        id: "presentation-reachable",
        section: "Store Presentation",
        title: "Store is publicly reachable",
        passed: homepage.response.ok,
        score: homepage.response.ok ? 100 : 0,
        evidence: `Homepage returned HTTP ${homepage.response.status} in ${homepage.responseTime}ms.`,
        recommendation: "Keep the storefront publicly reachable and stable.",
      },
      {
        id: "presentation-mobile",
        section: "Store Presentation",
        title: "Mobile viewport is configured",
        passed: viewport,
        score: viewport ? 100 : 0,
        evidence: viewport
          ? "A viewport meta tag was detected."
          : "No viewport meta tag was detected.",
        recommendation:
          "Add a responsive viewport configuration and test the storefront on mobile devices.",
      },
      {
        id: "presentation-heading",
        section: "Store Presentation",
        title: "Clear primary heading",
        passed: h1Count === 1 && heroCopy,
        score: h1Count === 1 && heroCopy ? 100 : h1Count > 0 ? 60 : 0,
        evidence: `Detected ${h1Count} H1 heading(s).`,
        recommendation:
          "Create one clear opening brand/value statement above the fold.",
      },
      {
        id: "presentation-images",
        section: "Store Presentation",
        title: "Product imagery has useful alternative text",
        passed: imageCoverage >= 0.8,
        score:
          imageCoverage >= 0.8
            ? 100
            : Math.round(imageCoverage * 60),
        evidence: `${imageAltCount} of ${imageTags.length} homepage images contain alt text.`,
        recommendation:
          "Add descriptive alt text to important product and brand imagery.",
      },
      {
        id: "presentation-title",
        section: "Store Presentation",
        title: "Page title is present",
        passed: Boolean(titleMatch?.[1]?.trim()),
        score: titleMatch?.[1]?.trim() ? 100 : 0,
        evidence: titleMatch?.[1]?.trim()
          ? `Title: ${titleMatch[1].trim()}`
          : "No HTML title was detected.",
        recommendation:
          "Add a concise title that explains the brand and its offer.",
      },

      {
        id: "brand-about",
        section: "Brand Identity",
        title: "Brand story or About information",
        passed: about,
        score: about ? 100 : 0,
        evidence: about
          ? "About/story/mission content or an About page was detected."
          : "No strong About/story signal was detected.",
        recommendation:
          "Create a proper About page with the founder story, mission, and real brand photography.",
      },
      {
        id: "brand-mission",
        section: "Brand Identity",
        title: "Brand mission or values are visible",
        passed: hasAny(text, [
          "mission",
          "our values",
          "why we exist",
          "our story",
          "crafted",
          "sustainable",
        ]),
        score: hasAny(text, [
          "mission",
          "our values",
          "why we exist",
          "our story",
          "crafted",
          "sustainable",
        ])
          ? 100
          : 40,
        evidence:
          "Mission/value language was searched across the crawled pages.",
        recommendation:
          "Bring the brand mission and values closer to the main customer journey.",
      },
      {
        id: "brand-name",
        section: "Brand Identity",
        title: "Brand name is present",
        passed: Boolean(merchant.business_name),
        score: merchant.business_name ? 100 : 0,
        evidence: merchant.business_name
          ? `Merchant brand name is ${merchant.business_name}.`
          : "No merchant business name is stored.",
        recommendation:
          "Maintain a consistent brand name throughout the storefront.",
      },
      {
        id: "brand-contact",
        section: "Brand Identity",
        title: "Brand has a visible contact identity",
        passed: contact,
        score: contact ? 100 : 0,
        evidence: contact
          ? "Contact information/page signal detected."
          : "No clear contact signal detected.",
        recommendation:
          "Make a clear contact path available from the main navigation or footer.",
      },
      {
        id: "brand-story",
        section: "Brand Identity",
        title: "Dedicated storytelling content",
        passed:
          about &&
          hasAny(text, [
            "founder",
            "our story",
            "mission",
            "values",
          ]),
        score:
          about &&
          hasAny(text, [
            "founder",
            "our story",
            "mission",
            "values",
          ])
            ? 100
            : about
              ? 60
              : 0,
        evidence:
          "The crawl looked for dedicated brand-story language.",
        recommendation:
          "Expand the story beyond product descriptions with founder and mission content.",
      },

      {
        id: "product-links",
        section: "Product Readiness",
        title: "Products or collections are discoverable",
        passed: products,
        score: products ? 100 : 0,
        evidence: products
          ? "Product, collection, shopping, or purchase signals were detected."
          : "No strong product purchasing signal was detected.",
        recommendation:
          "Make your main product catalog immediately discoverable.",
      },
      {
        id: "product-purchase",
        section: "Product Readiness",
        title: "Purchasing action is visible",
        passed: inventorySignal,
        score: inventorySignal ? 100 : 0,
        evidence: inventorySignal
          ? "Purchase or inventory language was detected."
          : "No clear purchase/inventory signal was detected.",
        recommendation:
          "Ensure core products have visible purchase actions and current inventory.",
      },
      {
        id: "product-bundle",
        section: "Product Readiness",
        title: "Gift bundles are available",
        passed: bundles,
        score: bundles ? 100 : 0,
        evidence: bundles
          ? "Bundle/gift set language was detected."
          : "No clear bundle or gift-set offering was detected.",
        recommendation:
          "Create a live purchasable gift bundle for easier corporate buying.",
      },
      {
        id: "product-category",
        section: "Product Readiness",
        title: "Product category is defined",
        passed: Boolean(merchant.product_category),
        score: merchant.product_category ? 100 : 0,
        evidence: merchant.product_category
          ? `Stored product category: ${merchant.product_category}.`
          : "No product category is stored in the merchant profile.",
        recommendation:
          "Define a precise product category to improve matching and merchandising.",
      },
      {
        id: "product-description",
        section: "Product Readiness",
        title: "Product-focused content exists",
        passed: text.length > 300,
        score: text.length > 300 ? 100 : 40,
        evidence: `The audit crawler collected approximately ${text.length} characters of page text.`,
        recommendation:
          "Expand product copy with gifting use cases, benefits, and buyer-oriented context.",
      },

      {
        id: "ops-contact",
        section: "Operational Credibility",
        title: "Contact path exists",
        passed: contact,
        score: contact ? 100 : 0,
        evidence: contact
          ? "Contact information or contact page detected."
          : "No strong contact signal detected.",
        recommendation:
          "Maintain a clear customer and buyer contact path.",
      },
      {
        id: "ops-wholesale",
        section: "Operational Credibility",
        title: "Bulk or wholesale capability is documented",
        passed: wholesale,
        score: wholesale ? 100 : 0,
        evidence: wholesale
          ? "Bulk, wholesale, corporate, or partnership language detected."
          : "No bulk/wholesale/partner signal detected.",
        recommendation:
          "Add a bulk, wholesale, or corporate enquiry page.",
      },
      {
        id: "ops-returns",
        section: "Operational Credibility",
        title: "Returns/refunds process is documented",
        passed: refund,
        score: refund ? 100 : 0,
        evidence: refund
          ? "Returns/refund policy signal detected."
          : "No clear returns/refund policy detected.",
        recommendation:
          "Publish a clear returns/refunds process for buyers.",
      },
      {
        id: "ops-shipping",
        section: "Operational Credibility",
        title: "Shipping information is documented",
        passed: shipping,
        score: shipping ? 100 : 0,
        evidence: shipping
          ? "Shipping/delivery policy signal detected."
          : "No clear shipping/delivery policy detected.",
        recommendation:
          "Publish clear shipping and delivery expectations.",
      },
      {
        id: "ops-partner",
        section: "Operational Credibility",
        title: "Partner or buyer enquiry route",
        passed: wholesale || contact,
        score: wholesale ? 100 : contact ? 60 : 0,
        evidence:
          wholesale
            ? "Partner/bulk enquiry capability detected."
            : contact
              ? "General contact route detected but not a dedicated buyer route."
              : "No obvious buyer enquiry route detected.",
        recommendation:
          "Create a dedicated wholesale/corporate buyer enquiry route.",
      },

      {
        id: "compliance-privacy",
        section: "Compliance",
        title: "Privacy policy",
        passed: privacy,
        score: privacy ? 100 : 0,
        evidence: privacy
          ? "Privacy policy detected."
          : "Privacy policy not detected.",
        recommendation:
          "Publish an accessible privacy policy.",
      },
      {
        id: "compliance-terms",
        section: "Compliance",
        title: "Terms of service",
        passed: terms,
        score: terms ? 100 : 0,
        evidence: terms
          ? "Terms of service detected."
          : "Terms of service not detected.",
        recommendation:
          "Publish accessible terms and conditions.",
      },
      {
        id: "compliance-refund",
        section: "Compliance",
        title: "Refund/returns policy",
        passed: refund,
        score: refund ? 100 : 0,
        evidence: refund
          ? "Refund/returns policy detected."
          : "Refund/returns policy not detected.",
        recommendation:
          "Document refund and returns rules clearly.",
      },
      {
        id: "compliance-shipping",
        section: "Compliance",
        title: "Shipping policy",
        passed: shipping,
        score: shipping ? 100 : 0,
        evidence: shipping
          ? "Shipping policy detected."
          : "Shipping policy not detected.",
        recommendation:
          "Document shipping and delivery rules clearly.",
      },
      {
        id: "compliance-cancellation",
        section: "Compliance",
        title: "Cancellation policy",
        passed: cancellation,
        score: cancellation ? 100 : 0,
        evidence: cancellation
          ? "Cancellation policy detected."
          : "Cancellation policy not detected.",
        recommendation:
          "Publish a clear cancellation policy where relevant.",
      },
    ];

    const sectionChecks = new Map<
      SectionName,
      Check[]
    >();

    for (const section of SECTIONS) {
      sectionChecks.set(
        section,
        checks.filter((check) => check.section === section)
      );
    }

    const sectionScores = Object.fromEntries(
      SECTIONS.map((section) => [
        section,
        scoreSection(sectionChecks.get(section) || []),
      ])
    );

    const overallScore = Math.round(
      SECTIONS.reduce(
        (sum, section) =>
          sum + Number(sectionScores[section]),
        0
      ) / SECTIONS.length
    );

    const verdict =
      overallScore >= 75
        ? "Grid Ready"
        : overallScore >= 50
          ? "Grid Pending"
          : "Grid Not Ready";

    let aiSummary = "";
    let aiNextSteps: string[] = [];

    if (process.env.GROQ_API_KEY) {
      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: `
You are the GiftGrid audit analyst.

GiftGrid audits have exactly these five sections:
1. Store Presentation
2. Brand Identity
3. Product Readiness
4. Operational Credibility
5. Compliance

Use only the supplied evidence.
Do not invent facts.
Do not change the scores.

Return JSON:
{
  "executive_summary": "short professional audit summary",
  "next_steps": ["action 1", "action 2", "action 3", "action 4"],
  "finding_explanations": [
    {
      "check_id": "exact supplied check id",
      "description": "what the evidence means",
      "why_it_matters": "business impact",
      "recommendation": "specific action"
    }
  ]
}
                `.trim(),
              },
              {
                role: "user",
                content: JSON.stringify({
                  store: {
                    business_name: merchant.business_name,
                    business_email: merchant.business_email,
                    store_url: parsed.toString(),
                  },
                  overall_score: overallScore,
                  verdict,
                  section_scores: sectionScores,
                  checks,
                  crawled_pages: pages.map((page) => page.url),
                }),
              },
            ],
          }),
        }
      );

      if (groqResponse.ok) {
        try {
          const groq = await groqResponse.json();
          const content =
            groq?.choices?.[0]?.message?.content;

          if (content) {
            const parsedAi =
              typeof content === "string"
                ? JSON.parse(content)
                : content;

            aiSummary =
              parsedAi.executive_summary || "";

            aiNextSteps =
              Array.isArray(parsedAi.next_steps)
                ? parsedAi.next_steps.slice(0, 5)
                : [];

            for (const explanation of
              parsedAi.finding_explanations || []) {
              const check = checks.find(
                (item) =>
                  item.id === explanation.check_id
              );

              if (check) {
                check.evidence =
                  check.evidence;

                check.recommendation =
                  explanation.recommendation ||
                  check.recommendation;

                (
                  check as Check & {
                    aiDescription?: string;
                    aiWhy?: string;
                  }
                ).aiDescription =
                  explanation.description || "";

                (
                  check as Check & {
                    aiDescription?: string;
                    aiWhy?: string;
                  }
                ).aiWhy =
                  explanation.why_it_matters || "";
              }
            }
          }
        } catch (error) {
          console.error(
            "Groq audit explanation error:",
            error
          );
        }
      }
    }

    if (!aiSummary) {
      aiSummary =
        `${merchant.business_name || "This store"} received an overall GiftGrid score of ${overallScore}/100 and is currently ${verdict}.`;
    }

    if (!aiNextSteps.length) {
      aiNextSteps = checks
        .filter((check) => !check.passed)
        .slice(0, 5)
        .map((check) => check.recommendation);
    }

    const db = admin();

    const { data: audit, error: auditError } =
      await db
        .from("audits")
        .insert({
          merchant_id: merchant.id,
          created_by: user.id,
          status: "admin_review",
          overall_score: overallScore,
          executive_summary: `${aiSummary}\n\nNext Steps:\n${aiNextSteps
            .map((step) => `• ${step}`)
            .join("\n")}`,
        })
        .select("id")
        .single();

    if (auditError || !audit) {
      throw new Error(
        auditError?.message ||
          "Could not create audit."
      );
    }

    for (let index = 0; index < SECTIONS.length; index++) {
      const section = SECTIONS[index];
      const sectionItems =
        sectionChecks.get(section) || [];

      const score = Number(
        sectionScores[section]
      );

      const { data: sectionRow, error } =
        await db
          .from("audit_sections")
          .insert({
            audit_id: audit.id,
            title: section,
            description:
              `GiftGrid assessment of ${section}.`,
            score,
            sort_order: index + 1,
            is_visible: true,
          })
          .select("id")
          .single();

      if (error || !sectionRow) {
        throw new Error(
          error?.message ||
            `Could not create ${section} section.`
        );
      }

      const findingRows = sectionItems.map(
        (check, findingIndex) => ({
          section_id: sectionRow.id,
          title: check.title,
          description:
            (
              check as Check & {
                aiDescription?: string;
              }
            ).aiDescription ||
            check.evidence,
          status: check.passed
            ? "passed"
            : score >= 50
              ? "needs_attention"
              : "failed",
          severity: check.passed
            ? "low"
            : score >= 50
              ? "medium"
              : score < 25
                ? "critical"
                : "high",
          what_was_checked: check.evidence,
          why_it_matters:
            (
              check as Check & {
                aiWhy?: string;
              }
            ).aiWhy ||
            "This affects merchant readiness and buyer confidence.",
          recommendation: check.recommendation,
          is_automated: true,
          sort_order: findingIndex + 1,
        })
      );

      const { error: findingsError } =
        await db
          .from("audit_findings")
          .insert(findingRows);

      if (findingsError) {
        throw new Error(
          findingsError.message
        );
      }
    }

    return NextResponse.json({
      ok: true,
      audit_id: audit.id,
      score: overallScore,
      verdict,
      status: "admin_review",
      sections: sectionScores,
    });
  } catch (error) {
    console.error("GiftGrid audit error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Audit failed.",
      },
      { status: 500 }
    );
  }
}
