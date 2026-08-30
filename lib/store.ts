/**
 * Runtime demo state — a directory of small JSON files under data/_runtime/.
 *
 * This is the whole "database". It is git-ignored and disposable: `rm -rf
 * data/_runtime` (or the reset button on /outbox) returns the demo to a clean
 * slate. The canonical dataset (data/rfx.json, data/grid.json, …) is never
 * touched here.
 *
 * Consumers: lib/mail.ts (outbox), app/api/rfx (draft-rfx),
 * app/api/analyst/history (analyst-history).
 */
import fs from "node:fs";
import path from "node:path";

export const RUNTIME_DIR = path.join(process.cwd(), "data", "_runtime");

function file(name: string) {
  return path.join(RUNTIME_DIR, `${name}.json`);
}

export function readJSON<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(name: string, value: unknown): void {
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(file(name), JSON.stringify(value, null, 2));
}

export function removeJSON(name: string): void {
  try { fs.rmSync(file(name), { force: true }); } catch {}
}

/** Wipe all runtime state — used by the /outbox reset button. */
export function resetRuntime(): void {
  try { fs.rmSync(RUNTIME_DIR, { recursive: true, force: true }); } catch {}
}
