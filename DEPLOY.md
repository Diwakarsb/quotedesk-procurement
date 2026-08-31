# Deploying QuoteDesk to Vercel

The app is Vercel-ready. Two things differ from local: state goes to Redis
instead of the filesystem, and one fast multimodal model serves every route so
all calls finish well inside Vercel's 60 s function ceiling. You just wire up the
env vars.

## 1. Import the repo

Vercel dashboard → **Add New… → Project** → import `Diwakarsb/quotedesk-procurement`.
Framework preset auto-detects **Next.js**. Leave build/output settings default.
Add the env vars (steps 2–3) before the first deploy, or the API routes will 500.

## 2. Add Redis (for the RFx draft, outbox, analyst history)

Project → **Storage → Create Database → Upstash for Redis** (free tier) →
**Connect to Project**. This injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`
(and the `UPSTASH_*` equivalents). [`lib/store.ts`](lib/store.ts) picks either up;
with neither, it falls back to `os.tmpdir()` — works, but ephemeral.

## 3. Add the model env vars

Project → **Settings → Environment Variables** (Production + Preview):

| Key | Value |
|---|---|
| `PROVIDER_ORDER` | `openrouter` |
| `OPENROUTER_API_KEY` | your `sk-or-v1-…` key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | `google/gemini-2.5-flash` |

`google/gemini-2.5-flash` is multimodal (~2–4 s/call) and costs ~$0.08 per full
demo run — needs a few dollars of credit at
[openrouter.ai/settings/credits](https://openrouter.ai/settings/credits).

Free alternative: `GEMINI_API_KEY` (an `AIza…` key from
[aistudio.google.com/apikey](https://aistudio.google.com/apikey)) with
`PROVIDER_ORDER=gemini` — free tier, also fast and multimodal.

Free-*and*-no-key (`minimax/minimax-m3:free`) works locally but is too slow /
rate-limited for a live deploy — the analyst and RFx routes will 504 or 429.

## 4. Deploy

Push to `main` → Vercel builds and deploys automatically. Or from the repo:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 5. Verify

- `/` — sidebar dots empty.
- `/rfx` — draft an RFx (~4 s), hard-refresh, it restores. (Confirms Redis.)
- `/outbox` — Dispatch → 5 delivered, 5 received.
- `/upload` — drop `public/vendor-responses/V5_Ashoka_Boards_handwritten_ratesheet.jpg`;
  extraction returns grade rates, zero line rates.
- `/analyst` — ask "Who should we award this contract to?" → Continental, ₹22.81 Cr.
- `/grid` — loads `data/grid.json` (static).
- Topbar **Reset demo** — clears Redis keys `quotedesk:outbox`,
  `quotedesk:draft-rfx`, `quotedesk:analyst-history`.

## Notes

- `data/ground_truth.json` ships in the bundle but is never imported at runtime.
- `next@14.2.5` carries a known advisory; `npm i next@14.2.32` when convenient.
- No auth / multi-tenancy — every visitor shares the one Redis namespace. Fine
  for a demo link; add a per-session key prefix in `lib/store.ts` if it matters.
