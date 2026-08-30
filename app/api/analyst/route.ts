import { NextRequest, NextResponse } from "next/server";
import { getFastProvider } from "@/lib/providers";
import { QUERY_GRAMMAR, NARRATE_RULES } from "@/lib/schema";
import { AnalystEngine } from "@/lib/analyst";
import { parseJSONLoose } from "@/lib/extract";
import grid from "@/data/grid.json";
import qual from "@/data/qualification.json";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "No question" }, { status: 400 });

    const provider = getFastProvider();
    const engine = new AnalystEngine(grid as any, qual as any);

    // 1 — model writes a spec (no arithmetic)
    const specRaw = await provider.complete([
      { text: QUERY_GRAMMAR },
      { text: "Available vendors: " + engine.vendors.join(", ") },
      { text: "BUYER QUESTION:\n" + question },
    ], 0, 1024);
    const spec = parseJSONLoose(specRaw);

    // 2 — code executes it. This result is the authority.
    const result = engine.execute(spec);

    // 3 — model narrates the verified result
    const narration = await provider.complete([
      { text: NARRATE_RULES },
      { text: "BUYER QUESTION:\n" + question },
      { text: "QUERYSPEC EXECUTED:\n" + JSON.stringify(spec, null, 1) },
      { text: "RESULT (authoritative — all numbers must come from here):\n" +
              JSON.stringify(result, null, 1).slice(0, 14000) },
    ], 0.2, 2048);

    return NextResponse.json({ ok: true, spec, result, narration, provider: provider.name });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
