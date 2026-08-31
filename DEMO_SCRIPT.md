# QuoteDesk — demo recording script

Target length **~6 minutes**. Three sections: RFx drafting → Comparison grid →
Award analyst. Recorded against the deployed app.

All figures below are deterministic — they come from `data/grid.json` via
`lib/analyst.ts`, not from the model. The model only narrates.

---

## Before you hit record

1. Open the app — you land on **Overview**.
2. Click **Reset demo** (top-right) → sidebar status dots go empty, outbox clears.
3. **RFx drafting + extraction on the live Vercel URL:** these call a multimodal
   model and can exceed Vercel's 60s function limit on the free tier.
   - **If a Gemini `AIza` key is set** (`PROVIDER_ORDER=gemini`): everything runs
     live at 2–4s. Nothing to pre-do.
   - **Otherwise:** pre-warm one RFx draft before recording so `/rfx` shows it on
     load. From the repo:
     ```bash
     URL=https://quotedesk-procurement.vercel.app
     until curl -s -m 65 -X POST $URL/api/rfx -H 'Content-Type: application/json' \
       -d '{"brief":"12 lines corrugated packaging, Pune plant, ~8 crore/year. RSC shippers, e-comm mailers, two 7-ply export cases. BRC and FSC mandatory. Net 45. Per box INR."}' \
       | grep -q '"ok":true'; do echo retrying…; done
     echo "draft is warm — open /rfx and it will restore"
     ```
     On camera you then open `/rfx`, it's populated with a "restored from a saved
     draft" note, and you narrate the drafted RFx (skip the live keystroke).
4. Browser zoom ~110–125%. Sidebar + tables read better on video.

---

## Cold open (~20s) — on Overview

> "This is QuoteDesk. A category buyer needs thirty line items of corrugated
> packaging — about twenty-two crore rupees a year. Five vendors reply, in five
> different formats: a spreadsheet that ignores the template, a PDF with the
> discount buried in a footnote, a Word doc that prices in prose, a phone photo
> of a rate card in US dollars, and a handwritten note. This is the workspace
> that turns those five into one comparison a buyer can defend — without ever
> inventing a number."

Gesture at the five pipeline tiles and the sidebar. Click **1 · RFx Co-pilot**.

---

## Section 1 — RFx drafting (~90s) · `/rfx`

**Type into the brief box:**

> We need corrugated packaging for our Pune plant — about ₹8 crore a year across
> roughly 12 SKUs: RSC outer shippers, inner packs, e-comm mailers, and two
> 7-ply heavy-duty export cases. Vendors must hold BRC Packaging or ISO 22000,
> and FSC chain-of-custody — both mandatory. Payment net 45. All quotes per box
> in INR.

Click **Draft RFx**.

**While it renders:**

> "The co-pilot drafts the line items, the questionnaire, and the commercial
> terms. But the point isn't drafting faster — it's drafting *comparably*."

**Point at the line-items table — the right-hand response-contract column:**

> "Every line carries a response contract: a locked unit of measure, the exact
> fields a valid quote has to fill, and — this one matters — 'same as last year'
> is not a submittable answer. That's the root cause of the whole problem:
> vendors answer the same RFx in five different currencies of thought. This makes
> that impossible."

**Point at the amber "What the co-pilot assumed / needs confirmed" box:**

> "And where the brief was vague on quantities, it didn't invent them. It flagged
> the assumption for the buyer to confirm."

**Type into "Refine":**

> Add a minimum 40% recycled-fibre content requirement, and set the delivery
> penalty at 2% of line value per failed lot.

Click **Apply revision** — the RFx updates in place.

> "Same loop — the buyer talks the RFx into shape, then sends it."

Click **Send to 5 vendors →**.

---

## Section 2 — Dispatch + Comparison grid (~150s)

### `/outbox` (~15s)

> "The email path is stubbed on purpose — no SMTP socket opens. But the flow is
> visible: the RFx goes out to five vendors, and their replies come back in five
> formats, none of them on our template."

Point at the inbound table: Excel, PDF, Word, photo, handwritten. Click
**4 · Comparison** in the sidebar.

### `/grid` — open on **List rate**

> "Five vendors, thirty lines — normalised to one unit and one currency. Every
> cell is colour-coded. Green: the vendor stated it. Amber: we converted it.
> Red: unresolved — and red never carries a number."

**Click a green (Extracted) cell** — Continental, line 1:

> "Extracted. The drawer shows the vendor's exact words. Provenance on every
> single cell."

**Click an amber (Derived) cell** — Global Fibre, line 1:

> "Derived. Global Fibre quoted US dollars per hundred pieces. Here's the
> working, inline: 222.42 dollars, times the reference FX rate of 88.40, divided
> by a hundred — ₹196.62 a box. And the buyer can edit that FX rate."

**Click a red (Unresolved) cell** — Ashoka, any line:

> "Ashoka sent a handwritten note that priced *grades* — 'five-ply boxes,
> forty-two rupees a kilo' — not line items. A system optimising for a full grid
> would fan that across twenty-six lines and produce twenty-six confident
> numbers from two handwritten figures. This one holds them all unresolved until
> a buyer confirms the mapping. An empty cell is a feature."

**Click the "Landed cost" toggle** — watch the numbers move:

> "List rate is not what you pay. Watch Global Fibre. On list it's the cheapest —
> by nearly five crore. Add ocean freight, ten percent customs duty, inland
> haulage, and letter-of-credit charges, and it lands at ₹23.3 crore — *more*
> expensive than Continental, while covering seven fewer lines."

**Click "Assumptions (6)":**

> "A hundred and fifty cells collapse to six decisions: the FX rate, the per-kilo
> conversion, the per-hundred-pieces divisor, one tier selection, and two grade
> expansions. The buyer reviews six things, not a hundred and fifty — and each
> one is editable and recomputes everything downstream."

Close the drawer. Click **5 · Award Analyst**.

---

## Section 3 — Award analyst (~150s) · `/analyst`

> "Now the buyer stops clicking and starts asking. The important part: the model
> never does arithmetic. It writes a query, deterministic code executes it, and
> the model only narrates the verified result."

Type each question — don't click the example chips; typing shows it's live.
After the first answer, expand **"How this was answered"** once to show the
generated QuerySpec, then collapse it.

| Type this | While it answers, say | Point at |
|---|---|---|
| **Who should we award this contract to?** | "It generated a QuerySpec — intent 'compare total', basis 'landed', qualified vendors only. Code executed it. The answer: Continental Corrugators, ₹22.81 crore." | the QuerySpec dropdown; the "✓ Every figure above was computed, not generated" line |
| **Global Fibre looks the cheapest — why aren't we picking them?** | "Because ₹17.79 crore is a list price. Landed, it's ₹23.29 — above Continental. And it only covers 23 of 30 lines, with a 46-day lead time." | the list-versus-landed contrast in the answer |
| **What's the best split award if we can use more than one supplier?** | "A split doesn't help. Among the vendors that clear both mandatory certifications, Continental is cheapest on every single line." | the allocation table |
| **Show me line 19 across all vendors.** | "Shakti wrote 'POA' — price on application. Ashoka declined: 'seven-ply, not doing now'. Global Fibre's number is derived from the photo at 73% confidence — below the review threshold. The system flags it; it doesn't resolve it." | the per-vendor status and confidence |
| **What couldn't the system resolve, and why?** | "Forty-five of a hundred and fifty cells — and not one was estimated. Ashoka: thirty, priced by grade. Global Fibre: seven — four not offered, three lost to glare on the photo. NovaPack: six, explicitly declined. Shakti: two." | the breakdown table |
| **What are the risks in this award?** | "Three of the five vendors fail both mandatory certifications — unawardable at any price. Coverage is uneven across the five. And Global Fibre's numbers came off an angled phone photo." | the risk rows |

**Closer** — click **Download CSV** on the first answer's table, and point at the
bar chart under it:

> "Tables, charts, CSV export — all built from the same computed numbers. Every
> figure in every answer was calculated by code and checked against the source,
> not produced by a language model. That's the whole product: when a buyer with
> four crore rupees on the line acts on what's on this screen, they can defend
> every number on it."

---

## If you're running long

Cut analyst questions 3 and 4 (split award, line 19). The award recommendation,
the unresolved report, and the risk scan carry the argument on their own.

## Reference — the numbers, straight from `data/grid.json`

| Vendor | List | Landed | Lines | Both mandatory certs |
|---|---|---|---|---|
| Global Fibre | ₹17.79 Cr | ₹23.29 Cr | 23 / 30 | Yes |
| NovaPack | ₹19.62 Cr | ₹19.78 Cr | 24 / 30 | **No** |
| Shakti | ₹21.76 Cr | ₹22.92 Cr | 28 / 30 | **No** |
| **Continental** | ₹22.65 Cr | **₹22.81 Cr** | **30 / 30** | **Yes** |
| Ashoka | — | — | 0 / 30 | **No** |

**Award: Continental Corrugators at ₹22.81 Cr landed** — the only vendor quoting
all 30 lines *and* clearing both mandatory certifications, and cheaper on landed
cost than the only other eligible bidder.
