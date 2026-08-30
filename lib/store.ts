/**
 * Runtime demo state — the RFx draft, the faked outbox, the analyst history.
 *
 *  - In production (Vercel), backed by Redis (Vercel KV / Upstash). The
 *    serverless filesystem is read-only, so file writes are not an option.
 *  - Locally, or on a deploy without Redis configured, backed by JSON files
 *    (data/_runtime in dev, os.tmpdir() in a read-only environment).
 *
 * The canonical dataset (data/rfx.json, data/grid.json, …) is never touched here.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Redis } from "@upstash/redis";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = KV_URL && KV_TOKEN ? new Redis({ url: KV_URL, token: KV_TOKEN }) : null;

const PREFIX = "quotedesk:";
const KNOWN_KEYS = ["outbox", "draft-rfx", "analyst-history"];

export const RUNTIME_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "quotedesk")
    : path.join(process.cwd(), "data", "_runtime");

const file = (name: string) => path.join(RUNTIME_DIR, `${name}.json`);

export async function readJSON<T>(name: string, fallback: T): Promise<T> {
  if (redis) {
    const v = await redis.get<T>(PREFIX + name);
    return v ?? fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(name: string, value: unknown): Promise<void> {
  if (redis) {
    await redis.set(PREFIX + name, value);
    return;
  }
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(file(name), JSON.stringify(value, null, 2));
}

export async function removeJSON(name: string): Promise<void> {
  if (redis) {
    await redis.del(PREFIX + name);
    return;
  }
  try { fs.rmSync(file(name), { force: true }); } catch {}
}

/** Wipe all runtime state — used by the /outbox reset button. */
export async function resetRuntime(): Promise<void> {
  if (redis) {
    await Promise.all(KNOWN_KEYS.map((k) => redis.del(PREFIX + k)));
    return;
  }
  try { fs.rmSync(RUNTIME_DIR, { recursive: true, force: true }); } catch {}
}
