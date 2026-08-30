import { NextRequest, NextResponse } from "next/server";
import { extractDocument } from "@/lib/extract";
import rfx from "@/data/rfx.json";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file supplied" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await extractDocument(file.name, buf, rfx as any);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
