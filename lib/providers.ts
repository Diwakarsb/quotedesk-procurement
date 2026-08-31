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

/**
 * Google AI Studio — recurring free tier, native multimodal.
 *
 * Google retired the classic `models/{m}:generateContent` endpoint for keys
 * issued from mid-2026 (the `AQ.` prefix ones). The current surface is the
 * Interactions API: POST /v1beta/interactions with { model, input, generation_config }.
 * Input is a list of typed items; a turn is { type:"user_input", content:[…] }
 * where each content item is { type:"text", text } or { type:"image"|"document",
 * data:<base64>, mime_type }. The reply comes back as steps[]; the answer is the
 * text of the step with type "model_output".
 */
// Each model name is a separate free-tier quota bucket (~20 req/min), so
// falling through the list also multiplies the effective rate limit. The
// gemini-3.x models honour thinking_level:"minimal" and stay fast; the
// aliases don't and reason slowly, so they sit last as a safety net.
export const GEMINI_FALLBACKS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
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
    const content: any[] = [];
    for (const p of parts) {
      if ("text" in p) { content.push({ type: "text", text: p.text }); continue; }
      const mt = p.inline_data.mime_type;
      content.push({
        type: mt === "application/pdf" ? "document" : "image",
        data: p.inline_data.data,
        mime_type: mt,
      });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${this.key}`;
    // gemini-3.x "thinks" by default and that reasoning draws from
    // max_output_tokens — on a long extraction it starves the JSON. Ask for the
    // lightest reasoning; models that reject the knob are retried without it.
    const think = process.env.GEMINI_THINKING || "minimal";
    const call = (m: string, withThink: boolean) => postJSON(url, {
      model: m,
      input: [{ type: "user_input", content }],
      generation_config: withThink
        ? { temperature, max_output_tokens: maxTokens, thinking_level: think }
        : { temperature, max_output_tokens: maxTokens },
    }, {});
    const textOf = (d: any): string => (d?.steps || [])
      .filter((s: any) => s?.type === "model_output")
      .flatMap((s: any) => s?.content || [])
      .filter((c: any) => c?.type === "text")
      .map((c: any) => c.text)
      .join("");

    const tried: string[] = [];
    for (const m of this.models) {
      try {
        let d;
        try { d = await call(m, true); }
        catch (te: any) {
          if (!/thinking.level/i.test(te.message || "")) throw te;
          d = await call(m, false); // this model doesn't take the knob
        }
        const out = textOf(d);
        if (!out) throw new ProviderError("Gemini: no model_output text in response");
        this.name = `gemini:${m}`;
        return out;
      } catch (e: any) {
        tried.push(m);
        const msg = e.message || "";
        // fall through when the MODEL is retired, OR when it is rate-limited —
        // the next model has its own quota bucket. A bad key still surfaces.
        const recoverable =
          /404|NOT_FOUND|no longer available|is not found|not supported for '?model|invalid.*model/i.test(msg) ||
          /429|RESOURCE_EXHAUSTED|too_many_requests|exceeded your current quota/i.test(msg);
        if (!recoverable) throw e;
      }
    }
    throw new ProviderError(
      `No available Gemini model (all rate-limited or retired). Tried: ${tried.join(", ")}.`);
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
    private model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
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
