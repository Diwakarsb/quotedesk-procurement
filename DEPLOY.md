# Deploying QuoteDesk to Vercel

The app is Vercel-ready. Two things differ from local: state goes to Redis
instead of the filesystem, and the model calls must finish inside 60 s (Hobby's
function ceiling). Both are handled in code — you just wire up the env vars.

## 1. Import the repo

Vercel dashboard → **Add New… → Project** → import `Diwakarsb/quotedesk-procurement`.
Framework preset auto-detects **Next.js**. Leave build/output settings default.
Don't deploy yet — add the env vars first (step 3), or the first build will
deploy but the API routes will 500.

## 2. Add Redis (for the RFx draft, outbox, analyst history)

Vercel dashboard → your project → **Storage → Create Database → Upstash for Redis**
(free tier is fine) → **Connect to Project**.

This injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (and the `UPSTASH_*`
equivalents) into the project automatically. [`lib/store.ts`](lib/store.ts) picks
either naming up; with neither present it falls back to `os.tmpdir()` (works, but
ephemeral).

## 3. Add the model env vars

Project → **Settings → Environment Variables** (Production + Preview):

| Key | Value |
|---|---|
| `PROVIDER_ORDER` | `openrouter` |
| `OPENROUTER_API_KEY` | your `sk-or-v1-…` key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | `minimax/minimax-m3:free` (default) |

**Speed note.** `minimax/minimax-m3:free` runs ~20–40 s per call. Extraction and
RFx drafting (one call each) fit inside 60 s. The analyst makes **two** calls
(spec + narrate) and can brush the limit. For a reliably fast analyst, point the
same adapter at Groq instead — add:

| Key | Value |
|---|---|
| `OPENROUTER_BASE_URL` | `https://api.groq.com/openai/v1` |
| `OPENROUTER_API_KEY` | your `gsk_…` key from [console.groq.com](https://console.groq.com) |
| `OPENROUTER_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` |

## 4. Deploy

Push to `main` → Vercel builds and deploys automatically. Or from the repo:

```bash
npm i -g vercel        # if not installed
vercel login
vercel --prod
```

## 5. Verify

- `/` — sidebar dots all empty (no draft, not dispatched).
- `/rfx` — draft an RFx, hard-refresh, it restores. (Confirms Redis writes.)
- `/outbox` — Dispatch → 5 delivered, 5 received.
- `/upload` — drop `public/vendor-responses/V5_Ashoka_Boards_handwritten_ratesheet.jpg`;
  extraction returns grade rates, zero line rates.
- `/analyst` — ask "Compare all five vendors on landed cost"; if it times out,
  switch to the Groq config in step 3.
- `/grid` — loads `data/grid.json` (static, always works).
- Topbar **Reset demo** — clears Redis keys `quotedesk:outbox`,
  `quotedesk:draft-rfx`, `quotedesk:analyst-history`.

## Notes

- `data/ground_truth.json` ships in the bundle but is never imported at runtime.
- `next@14.2.5` carries a known advisory; `npm i next@14.2.32` when convenient.
- No auth / multi-tenancy — every visitor shares the one Redis namespace. Fine
  for a demo link; add a per-session key prefix in `lib/store.ts` if that matters.
