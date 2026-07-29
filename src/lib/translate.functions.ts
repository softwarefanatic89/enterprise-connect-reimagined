import { createServerFn } from "@tanstack/react-start";

type Input = { text: string; target: string; source?: string };

const validate = (input: unknown): Input => {
  const i = input as Input;
  if (!i || typeof i.text !== "string" || typeof i.target !== "string") {
    throw new Error("Invalid translation input");
  }
  return {
    text: i.text.slice(0, 4000),
    target: i.target.slice(0, 8),
    source: typeof i.source === "string" ? i.source.slice(0, 8) : undefined,
  };
};

export const translateText = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    if (!data.text.trim()) return { translated: data.text, detected: data.source ?? "auto" };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a professional real-time translator for an enterprise chat platform. Translate the user's message into the requested target language. Preserve tone, punctuation, emoji, code blocks, IDs (e.g. AMS-002041, DOC-044120), URLs and numbers exactly. If the text is already in the target language, return it unchanged. Reply with ONLY the translated text — no quotes, no commentary, no language labels.",
          },
          {
            role: "user",
            content: `Target language code: ${data.target}\n\nText:\n${data.text}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Translation rate-limited. Try again shortly.");
      if (res.status === 402) throw new Error("Translation credits exhausted.");
      throw new Error(`Translation failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const translated = json.choices?.[0]?.message?.content?.trim() ?? data.text;
    return { translated, detected: data.source ?? "auto" };
  });
