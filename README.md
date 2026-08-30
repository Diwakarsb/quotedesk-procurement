# QuoteDesk

Turns five vendor quotes in five different formats into one comparison a buyer
can actually act on — without ever inventing a number.

Built for the Aerchain product assignment (RFX-2026-0417, corrugated packaging,
30 line items, ₹22.8 Cr annual contract).

---

## Run it

```bash
npm install
cp .env.local.example .env.local     # add one API key
npm run dev                          # → http://localhost:3000
```

**Get a key** (either works, the app tries both):

- **Gemini** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
  Recurring free tier, no card. Key starts `AIza`.
  *(If you get a string starting `AQ.`, that's an OAuth token — wrong page.)*
- **Eden AI** — [app.edenai.run/settings/api-keys](https://app.edenai.run/settings/api-keys).
  One-time free credits. Key starts `sk-eden-live-`.

## Prove it works before you demo

```bash
npm run dev            # in one terminal
node scripts_selftest.mjs        # in another — runs the hardest document
node scripts_selftest.mjs --all  # all five
```

The default test is the handwritten Ashoka sheet. If the model reads ₹42/kg as
₹4.2, you need to know before you're on camera, not during.

---

## The one idea

**The system never silently guesses.** Every cell is one of three states:

| State | Meaning |
|---|---|
| 🟢 Extracted | The vendor stated it, in canonical units |
| 🟡 Derived | *We* transformed it — the working is shown inline |
| 🔴 Unresolved | Not quoted, illegible, or conditional. **Never a number.** |

45 of 150 cells in the demo dataset are unresolved. None were estimated.

## Architecture

**Extraction** — documents go to a multimodal model with a schema contract whose
rules are the product: never infer a price, never convert units, never
paraphrase evidence, never fan a grade rate across line items. Images and PDFs
go natively; Excel and Word are flattened to text locally first.

**Normalization** — conversions produce an *Assumption* the buyer can see and
override. 150 cells collapse to **6 assumptions** — a reviewable surface, not a
wall of decisions.

**Landed cost** — list rate isn't what you pay. Ex-works, FOB and FOR quotes get
freight, duty, haulage and rebates applied as named, sourced adjustments. Global
Fibre looks ₹4.86 Cr cheaper on list; on landed cost it's ₹0.48 Cr *more
expensive*.

**Analyst chat** — the model never does arithmetic:

```
question → [LLM] → QuerySpec → [code] → Result → [LLM] → prose
```

The model writes a query. Deterministic code executes it. The model narrates a
verified result. Numbers in an answer were computed, not generated.

## Layout

```
lib/providers.ts   Gemini + Eden adapters behind one interface, with fallback
lib/schema.ts      Extraction contract, query grammar, narration rules
lib/parse.ts       Excel/Word → text; images/PDF → native multimodal
lib/extract.ts     Document → structured quote
lib/normalize.ts   Vendor units → INR/box, emitting Assumptions
lib/landed.ts      List rate → landed cost, per named adjustment
lib/analyst.ts     Deterministic query executors
app/api/*          Extraction and analyst endpoints
data/              RFx, qualification answers, extracted grid, ground truth
public/vendor-responses/   The five source documents
```

`data/ground_truth.json` is what a careful human would extract. It is **never
loaded at runtime** — it exists to grade the model and to prove nothing is
hardcoded.

## Deliberately not built

An RFx co-pilot and email dispatch are stubbed. The brief grades the ugly edges
and the trust surface; that's where the time went. See the decision note.
