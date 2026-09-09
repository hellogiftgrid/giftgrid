# GiftGrid AI connection

The server-only `lib/ai/chat.ts` adapter tries configured providers in this order: Groq, Cerebras, NVIDIA NIM, GitHub Models, OpenRouter, Mistral, Hugging Face, then Gemini. It moves to the next provider on errors, timeout, quota exhaustion or empty output. Each provider has a 20-second timeout. The chat endpoint sends only the last 12 messages, with 2,000 characters per message. It does not load private member conversations or documents, and cannot make account changes.

Configure server environment variables (never NEXT_PUBLIC variables):

- GROQ_API_KEY: key from a Groq Free plan organisation.
- GEMINI_API_KEY: key from a Gemini free-tier project.
- GROQ_CHAT_MODEL: optional; default openai/gpt-oss-20b.
- GEMINI_CHAT_MODEL: optional; default gemini-3.8-flash.
- CEREBRAS_API_KEY and optional CEREBRAS_CHAT_MODEL (default llama-3.3-70b).
- NVIDIA_API_KEY and optional NVIDIA_CHAT_MODEL (default meta/llama-3.1-8b-instruct).
- GITHUB_TOKEN and optional GITHUB_CHAT_MODEL (default openai/gpt-4.1-mini); GITHUB_MODELS_URL can override the endpoint.
- OPENROUTER_API_KEY and optional OPENROUTER_CHAT_MODEL (default openai/gpt-4o-mini).
- MISTRAL_API_KEY and optional MISTRAL_CHAT_MODEL (default mistral-small-latest).
- HF_ACCESS_TOKEN and optional HF_CHAT_MODEL (default HuggingFaceH4/zephyr-7b-beta).

Each provider works independently. Configure at least two providers if you want automatic fallback. The adapter is reusable from server routes only. No paid tools or web grounding are requested. Free-tier eligibility and billing belong to provider accounts: code cannot turn a billed API key into a free key. Keep the selected accounts on free plans. Quotas can stop responses; exhausted providers return a temporary-unavailability message. This is not unlimited free service.

Sources checked 2026-09-05:
- https://console.groq.com/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/pricing

Gemini's free tier can use submitted content for product improvement. The widget discloses external AI processing and asks users to avoid sensitive information. Do not connect private messages/documents to this public support route. Future private-data analysis requires the separately agreed explicit opt-in and appropriate provider data handling.

Validation: `node scripts/ai/check-chat.cjs` and `npm run typecheck`.

## Agreed future progression guidance

Stages: Registered → Approved → Recommended → Preferred Partner → Strategic Partner. AI suggests promotions with reasons based on profile completeness, community conduct, successful gifting deals, feedback and trade deck readiness. Admins approve every promotion. Members see personalised next-stage improvement suggestions and receive email/in-app promotion notifications. These workflows are requirements, not implemented by this chatbot update.

Other planned AI workflows (moderation, Friday polls, report summaries and appeal review) need dedicated data access, permissions, durable processing and admin interfaces. This shared adapter alone does not implement them.
