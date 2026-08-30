import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON, removeJSON } from "@/lib/store";

export const runtime = "nodejs";

const KEY = "analyst-history";
const CAP = 40; // keep the last N turns

type Turn = { id: number; q: string; spec: any; result: any; narration: string };

/** GET → the stored analyst turns, so /analyst can rehydrate after a refresh. */
export async function GET() {
  return NextResponse.json({ ok: true, turns: await readJSON<Turn[]>(KEY, []) });
}

/** POST { turn } → append one completed turn. */
export async function POST(req: NextRequest) {
  try {
    const { turn } = await req.json();
    if (!turn || typeof turn.q !== "string") {
      return NextResponse.json({ ok: false, error: "No turn" }, { status: 400 });
    }
    const turns = await readJSON<Turn[]>(KEY, []);
    turns.push({
      id: Number(turn.id) || turns.length + 1,
      q: turn.q, spec: turn.spec ?? null, result: turn.result ?? null,
      narration: turn.narration ?? "",
    });
    await writeJSON(KEY, turns.slice(-CAP));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

/** DELETE → clear the conversation. */
export async function DELETE() {
  await removeJSON(KEY);
  return NextResponse.json({ ok: true });
}
