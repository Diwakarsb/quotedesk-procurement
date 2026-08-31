import { NextRequest, NextResponse } from "next/server";
import { getProviderWithFallback } from "@/lib/providers";
import { RFX_COPILOT_SCHEMA } from "@/lib/schema";
import { parseJSONLoose } from "@/lib/extract";
import { readJSON, writeJSON, removeJSON } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Hobby ceiling

const DRAFT = "draft-rfx";

/** GET → the last drafted RFx, so /rfx can restore it after a refresh. */
export async function GET() {
  return NextResponse.json({ ok: true, draft: await readJSON(DRAFT, null) });
}

/** DELETE → discard the saved draft. */
export async function DELETE() {
  await removeJSON(DRAFT);
  return NextResponse.json({ ok: true });
}

/**
 * The RFx co-pilot — a real AI loop, not a stub.
 *
 *   POST { brief }            → draft a fresh RFx from a plain-language brief
 *   POST { brief, current }   → revise the current RFx per a follow-up instruction
 *
 * The model returns the whole RFx as JSON; code never invents line items.
 */
export async function POST(req: NextRequest) {
  try {
    const { brief, current } = await req.json();
    if (!brief || typeof brief !== "string") {
      return NextResponse.json({ ok: false, error: "No brief supplied" }, { status: 400 });
    }

    const provider = getProviderWithFallback();
    const parts = [
      { text: RFX_COPILOT_SCHEMA },
      current
        ? { text:
            "REVISION MODE. Here is the current RFx draft:\n\n" +
            JSON.stringify(current, null, 1).slice(0, 12000) +
            "\n\nApply this instruction from the buyer, then return the FULL updated RFx:\n" +
            brief }
        : { text: "DRAFT MODE. Buyer's brief:\n\n" + brief },
    ];

    // Large schema — give it room. Truncation at a low token cap is the usual
    // cause of a JSON parse failure. Retry once, but only if there's time left
    // inside the 60s function budget (a second slow call would just 504).
    const started = Date.now();
    let rfx: any;
    try {
      rfx = parseJSONLoose(await provider.complete(parts, 0, 4096));
    } catch (e) {
      if (Date.now() - started > 32_000) throw e; // no room for a retry
      rfx = parseJSONLoose(await provider.complete(parts, 0, 4096));
    }

    // Defensive: guarantee the response contract exists on every line even if a
    // weak model drops it. We do not invent rates or specs — only enforce shape.
    if (Array.isArray(rfx.lines)) {
      rfx.lines.forEach((l: any, i: number) => {
        l.line_no ??= i + 1;
        l.response_contract ||= {};
        l.response_contract.locked_uom ||= rfx.canonical_uom || "per_box";
        l.response_contract.required_fields ||= ["unit_rate", "lead_time_days", "moq"];
        l.response_contract.forbid_same_as_last_year = true;
      });
    }
    rfx.rfx_id ||= "RFX-DRAFT";

    const draft = { rfx, provider: provider.name, saved_at: new Date().toISOString() };
    await writeJSON(DRAFT, draft);

    return NextResponse.json({ ok: true, ...draft });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
