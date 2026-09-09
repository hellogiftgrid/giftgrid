type Message = { role: "user" | "assistant"; content: string };
type ChatMessage = Message | { role: "system"; content: string };

type Provider = {
  key: string | undefined;
  url: string;
  headers: Record<string, string>;
  body: object;
  extract: (data: any) => unknown;
};

function openAiProvider(key: string | undefined, url: string, model: string, messages: ChatMessage[], headers: Record<string, string> = {}): Provider {
  return {
    key,
    url,
    headers: { Authorization: `Bearer ${key || ""}`, ...headers },
    body: { model, messages, temperature: 0.4, max_tokens: 1200 },
    extract: (data: any) => data?.choices?.[0]?.message?.content,
  };
}

// Imported only by the server route. No tools, search charges or database access.
export async function generateChatReply(system: string, messages: Message[]): Promise<string> {
  const chatMessages = [{ role: "system" as const, content: system }, ...messages];
  const providers: Provider[] = [
    // The self-hosted provider is first when configured. This lets Vercel use
    // GiftGrid's own Ollama/vLLM instance without changing the client API.
    openAiProvider(
      process.env.LOCAL_AI_BASE_URL ? (process.env.LOCAL_AI_API_KEY || "local") : undefined,
      `${(process.env.LOCAL_AI_BASE_URL || "").replace(/\/$/, "")}/v1/chat/completions`,
      process.env.LOCAL_AI_MODEL || "qwen2.5:3b",
      chatMessages,
      process.env.LOCAL_AI_API_KEY ? {} : { Authorization: "Bearer local" },
    ),
    openAiProvider(process.env.GROQ_API_KEY, "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b", chatMessages),
    openAiProvider(process.env.CEREBRAS_API_KEY, "https://api.cerebras.ai/v1/chat/completions", process.env.CEREBRAS_CHAT_MODEL || "llama-3.3-70b", chatMessages),
    openAiProvider(process.env.NVIDIA_API_KEY, "https://integrate.api.nvidia.com/v1/chat/completions", process.env.NVIDIA_CHAT_MODEL || "meta/llama-3.1-8b-instruct", chatMessages),
    openAiProvider(process.env.GITHUB_TOKEN, process.env.GITHUB_MODELS_URL || "https://models.github.ai/inference/chat/completions", process.env.GITHUB_CHAT_MODEL || "openai/gpt-4.1-mini", chatMessages),
    openAiProvider(process.env.OPENROUTER_API_KEY, "https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini", chatMessages, {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.degiftgrid.com",
      "X-Title": "GiftGrid Assistant",
    }),
    openAiProvider(process.env.MISTRAL_API_KEY, "https://api.mistral.ai/v1/chat/completions", process.env.MISTRAL_CHAT_MODEL || "mistral-small-latest", chatMessages),
    openAiProvider(process.env.HF_ACCESS_TOKEN, "https://router.huggingface.co/v1/chat/completions", process.env.HF_CHAT_MODEL || "HuggingFaceH4/zephyr-7b-beta", chatMessages),
    {
      key: process.env.GEMINI_API_KEY,
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash")}:generateContent`,
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
      body: {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
      },
      extract: (data: any) => data?.candidates?.[0]?.content?.parts?.filter((p: any) => !p.thought).map((p: any) => p.text || "").join(""),
    },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...provider.headers },
        body: JSON.stringify(provider.body),
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      });
      if (!response.ok) continue;
      const reply = provider.extract(await response.json());
      if (typeof reply === "string" && reply.trim()) return reply.trim();
    } catch {
      // Try the other configured provider, without logging user content or keys.
    }
  }
  throw new Error("No chat provider available");
}
