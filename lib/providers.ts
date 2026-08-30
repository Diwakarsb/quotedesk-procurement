/**
 * Provider-agnostic model layer.
 *
 * One interface, several backends. The extraction prompt and schema contract
 * live in extract.ts and never change; only transport changes here.
 * Selected by PROVIDER_ORDER so the demo survives a dead key.
 */

export type Part =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export interface Provider {
  name: string;
  complete(parts: Part[], temperature?: number, maxTokens?: number): Promise<string>;
}

export class ProviderError extends Error {}

async function postJSON(url: string, body: any, headers: Record<string, string>) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new ProviderError(`${new URL(url).host} HTTP ${r.status}: ${text.slice(0, 400)}`);
  try { return JSON.parse(text); }
  catch { throw new ProviderError(`Non-JSON response: ${text.slice(0, 300)}`); }
}

/** Google AI Studio. Recurring free tier, native multimodal. */
/**
 * Models get retired. Rather than pinning one name and breaking on a Tuesday,
 * try a list newest-first and fall through on 404 / NOT_FOUND. GEMINI_MODEL,
 * when set, is tried first.
 */
export const GEMINI_FALLBACKS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

export class GeminiProvider implements Provider {
  name = "gemini";
  private models: string[];
  constructor(private key = process.env.GEMINI_API_KEY || "", model?: string) {
    if (!this.key) throw new ProviderError("GEMINI_API_KEY not set");
    const pinned = model || process.env.GEMINI_MODEL;
    this.models = pinned
      ? [pinned, ...GEMINI_FALLBACKS.filter((m) => m !== pinned)]
      : [...GEMINI_FALLBACKS];
  }
  async complete(parts: Part[], temperature = 0, maxTokens = 8192) {
    const tried: string[] = [];
    for (const m of this.models) {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${m}:generateContent?key=${this.key}`;
      try {
        const d = await postJSON(url, {
          contents: [{ parts }],
          generationConfig: {
            temperature, maxOutputTokens: maxTokens, responseMimeType: "application/json",
          },
        }, {});
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof t !== "string") throw new ProviderError("Gemini: unexpected shape");
        this.name = `gemini:${m}`;
        return t;
      } catch (e: any) {
        tried.push(m);
        const msg = e.message || "";
        // Only fall through when the MODEL is the problem. A bad key or a rate
        // limit must surface immediately, not be masked by four more attempts.
        const retire = /404|NOT_FOUND|no longer available|is not found/i.test(msg);
        if (!retire) throw e;
        // Google names the replacement in the error. Trust it over our list.
        const hinted = msg.match(/use\s+models\/([a-z0-9.\-]+)/i)?.[1];
        if (hinted && !tried.includes(hinted) && !this.models.includes(hinted)) {
          this.models.push(hinted);
        }
      }
    }
    throw new ProviderError(
      `No available Gemini model. Tried: ${tried.join(", ")}. ` +
      `Set GEMINI_MODEL in .env.local to a current model name.`);
  }
}

/** Eden AI aggregator. Converts Gemini-style parts to Eden's chat schema. */
export class EdenProvider implements Provider {
  name = "eden";
  constructor(
    private key = process.env.EDENAI_API_KEY || "",
    private provider = process.env.EDEN_PROVIDER || "google",
  ) {
    if (!this.key) throw new ProviderError("EDENAI_API_KEY not set");
  }
  async complete(parts: Part[], temperature = 0, maxTokens = 8192) {
    const texts: string[] = [];
    const images: string[] = [];
    for (const p of parts) {
      if ("text" in p) texts.push(p.text);
      else images.push(`data:${p.inline_data.mime_type};base64,${p.inline_data.data}`);
    }
    const headers = { Authorization: `Bearer ${this.key}` };
    let url: string, body: any;
    if (images.length) {
      url = "https://api.edenai.run/v2/multimodal/chat";
      body = {
        providers: this.provider, temperature, max_tokens: maxTokens,
        messages: [{
          role: "user",
          content: [
            { type: "text", content: { text: texts.join("\n\n") } },
            ...images.map((u) => ({ type: "media_url", content: { media_url: u } })),
          ],
        }],
      };
    } else {
      url = "https://api.edenai.run/v2/text/chat";
      body = { providers: this.provider, text: texts.join("\n\n"), temperature, max_tokens: maxTokens };
    }
    const d = await postJSON(url, body, headers);
    const node = d?.[this.provider];
    const t = node?.generated_text ?? node?.message?.at?.(-1)?.content;
    if (typeof t !== "string") throw new ProviderError("Eden: unexpected shape");
    return t;
  }
}

/**
 * OpenRouter (openrouter.ai) — one key, many models, free multimodal tiers.
 * Plain OpenAI chat-completions schema, so this also works against any
 * OpenAI-compatible host by overriding OPENROUTER_BASE_URL (Groq, NVIDIA NIM…).
 */
export class OpenRouterProvider implements Provider {
  name = "openrouter";
  constructor(
    private key = process.env.OPENROUTER_API_KEY || "",
    private model = process.env.OPENROUTER_MODEL || "minimax/minimax-m3:free",
    private baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  ) {
    if (!this.key) throw new ProviderError("OPENROUTER_API_KEY not set");
  }
  async complete(parts: Part[], temperature = 0, maxTokens = 8192) {
    const content: any[] = [];
    for (const p of parts) {
      if ("text" in p) {
        content.push({ type: "text", text: p.text });
      } else {
        const url = `data:${p.inline_data.mime_type};base64,${p.inline_data.data}`;
        if (p.inline_data.mime_type === "application/pdf") {
          content.push({ type: "file", file: { filename: "document.pdf", file_data: url } });
        } else {
          content.push({ type: "image_url", image_url: { url } });
        }
      }
    }
    // No response_format: several free models (Gemma etc.) 400 on it. The
    // extraction prompt already demands bare JSON and parseJSONLoose strips fences.
    const d = await postJSON(`${this.baseUrl}/chat/completions`, {
      model: this.model,
      temperature,
      max_tokens: maxTokens,
      messages: [{ role: "user", content }],
    }, {
      Authorization: `Bearer ${this.key}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "QuoteDesk",
    });
    const t = d?.choices?.[0]?.message?.content;
    if (typeof t !== "string") throw new ProviderError("OpenRouter: unexpected shape");
    return t;
  }
}

export function getProvider(name?: string): Provider {
  const n = (name || process.env.MODEL_PROVIDER || "gemini").toLowerCase();
  if (n === "gemini") return new GeminiProvider();
  if (n === "eden") return new EdenProvider();
  if (n === "openrouter") return new OpenRouterProvider();
  throw new ProviderError(`Unknown provider '${n}' (use: gemini | eden | openrouter)`);
}

/** Try providers in order; first constructible wins. */
export function getProviderWithFallback(order?: string[]): Provider {
  const list = order || (process.env.PROVIDER_ORDER || "gemini,eden").split(",");
  const errs: string[] = [];
  for (const n of list) {
    try { return getProvider(n.trim()); }
    catch (e: any) { errs.push(`${n.trim()}: ${e.message}`); }
  }
  throw new ProviderError(
    "No model provider available. Add a key to .env.local → " + errs.join(" | "),
  );
}

/**
 * A fast, text-only lane for the analyst (spec + narrate) and RFx drafting —
 * neither sends images, so a quick model like Groq's gpt-oss keeps both calls
 * well inside Vercel's 60s function budget. Set FAST_API_KEY (+ optional
 * FAST_BASE_URL / FAST_MODEL) to use it; otherwise falls back to the normal
 * provider chain. Extraction always uses getProviderWithFallback() — it needs
 * a multimodal model.
 */
export function getFastProvider(): Provider {
  if (process.env.FAST_API_KEY) {
    return new OpenRouterProvider(
      process.env.FAST_API_KEY,
      process.env.FAST_MODEL || "openai/gpt-oss-120b",
      process.env.FAST_BASE_URL || "https://api.groq.com/openai/v1",
    );
  }
  return getProviderWithFallback();
}
