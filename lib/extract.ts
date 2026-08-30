import { getProviderWithFallback, type Part } from "./providers";
import { EXTRACTION_SCHEMA } from "./schema";
import { toParts } from "./parse";

export function parseJSONLoose(txt: string): any {
  let t = txt.trim().replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
  try { return JSON.parse(t); } catch {}
  const m = t.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  throw new Error("Model did not return valid JSON: " + t.slice(0, 300));
}

export function rfxContext(rfx: any) {
  const rows = rfx.lines.map((l: any) =>
    `${l.line_no}|${l.sku}|${l.description}|${l.ply}ply|${l.flute}|${l.dims_mm}|` +
    `${l.gsm}gsm|qty ${l.annual_qty}|${l.unit_weight_kg}kg/box`);
  const qs = rfx.questionnaire.map((q: any) => `${q.ref}: ${q.question}`);
  return "BUYER RFx (canonical: INR, per_box). Map vendor items to these line " +
    "numbers ONLY when confident; else rfx_line_no=null.\n" +
    "line|sku|description|ply|flute|dims|gsm|annual_qty|unit_weight\n" +
    rows.join("\n") + "\n\nQUESTIONNAIRE:\n" + qs.join("\n");
}

export async function extractDocument(filename: string, buf: Buffer, rfx: any) {
  const provider = getProviderWithFallback();
  const parts: Part[] = [
    { text: "You are a procurement analyst extracting a vendor quotation.\n\n" +
            rfxContext(rfx) + "\n\n" + EXTRACTION_SCHEMA },
    ...(await toParts(filename, buf)),
  ];
  const raw = await provider.complete(parts, 0, 8192);
  const out = parseJSONLoose(raw);
  out._source_file = filename;
  out._provider = provider.name;
  return out;
}
