import { createServerFn } from "@tanstack/react-start";

export type CopilotTurn = { role: string; text: string; out?: boolean };

export type CopilotBrief = {
  summary: string;
  bullets: string[];
  replies: { tone: "Professional" | "Friendly" | "Short" | "Detailed"; text: string }[];
  insights: { mood: string; sentiment: string; urgency: string; language: string; risk: string };
  actions: string[];
  knowledge: { title: string; hint: string }[];
};

type Input = { conversationId: string; department: string; module: string; turns: CopilotTurn[] };

const validate = (input: unknown): Input => {
  const i = input as Input;
  if (!i || !Array.isArray(i.turns)) throw new Error("Invalid copilot input");
  return {
    conversationId: String(i.conversationId ?? "").slice(0, 64),
    department: String(i.department ?? "").slice(0, 64),
    module: String(i.module ?? "").slice(0, 64),
    turns: i.turns.slice(-24).map((t) => ({
      role: String(t.role ?? "USR").slice(0, 12),
      text: String(t.text ?? "").slice(0, 800),
      out: !!t.out,
    })),
  };
};

const SYSTEM = `You are AIRA, the executive AI copilot inside the Software Vala Enterprise Conversation OS.
Analyse the internal enterprise conversation and return STRICT JSON only, no markdown fences, with this exact shape:
{"summary":string,"bullets":string[],"replies":[{"tone":"Professional"|"Friendly"|"Short"|"Detailed","text":string}],"insights":{"mood":string,"sentiment":string,"urgency":string,"language":string,"risk":string},"actions":string[],"knowledge":[{"title":string,"hint":string}]}
Rules: summary under 40 words. 3 bullets max, each under 12 words. Exactly 4 replies, one per tone, each a ready-to-send message under 45 words, written as the internal employee replying. 3 actions max, imperative, under 8 words. 2 knowledge items max. insights values are short labels. Keep IDs (AMS-…, DOC-…, PRJ-…) intact.`;

export const generateCopilotBrief = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }): Promise<CopilotBrief> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const transcript = data.turns
      .map((t) => `${t.out ? "US" : "THEM"} [${t.role}]: ${t.text}`)
      .join("\n") || "No messages yet.";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Conversation ${data.conversationId} · ${data.department} · ${data.module}\n\n${transcript}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI Copilot is rate-limited. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
      throw new Error(`Copilot failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      output_text?: string;
      output?: { content?: { type?: string; text?: string }[] }[];
    };
    const raw =
      json.output_text ??
      json.output
        ?.flatMap((o) => o.content ?? [])
        .filter((c) => typeof c.text === "string")
        .map((c) => c.text)
        .join("") ??
      "";

    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Copilot returned an unreadable brief.");

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<CopilotBrief>;
    return {
      summary: parsed.summary ?? "No summary available.",
      bullets: (parsed.bullets ?? []).slice(0, 3),
      replies: (parsed.replies ?? []).slice(0, 4),
      insights: {
        mood: parsed.insights?.mood ?? "Neutral",
        sentiment: parsed.insights?.sentiment ?? "Neutral",
        urgency: parsed.insights?.urgency ?? "Normal",
        language: parsed.insights?.language ?? "English",
        risk: parsed.insights?.risk ?? "Low",
      },
      actions: (parsed.actions ?? []).slice(0, 3),
      knowledge: (parsed.knowledge ?? []).slice(0, 2),
    };
  });
