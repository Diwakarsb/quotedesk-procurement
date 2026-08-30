# Decision note

**RFX-2026-0417 · Corrugated packaging · ₹22.8 Cr annual contract**

---

## The bet

The brief says it plainly: *"Everyone can build the happy path. We care about
the rest."* So extraction accuracy is table stakes. What the system does **when
it isn't sure** is the product.

One idea drives every screen: **the system never silently guesses.**

## What that means concretely

Every cell is Extracted, Derived, or Unresolved. A derived number shows its
working inline — *"₹42/kg × 2.40 kg/box = ₹100.80"* — and links to the vendor's
verbatim words. An unresolved cell carries **no number at all** and says why.

45 of 150 cells are unresolved. None were estimated.

The sharpest case is Ashoka Boards, who sent a handwritten note pricing **grades**
— "5 ply boxes (all sizes) 42/kg" — not line items. A system optimising for a
full-looking grid multiplies that by each line's weight and produces 26
confident numbers from two handwritten figures. This one holds all 26 unresolved
until a buyer confirms the mapping. **An empty cell is a feature.**

## Three things I'd defend in a review

**1. The assumption ledger is the trust surface, not the grid.**
150 cells collapse to **6 assumptions** — the FX rate, the per-kg conversion,
the per-100-pieces divisor, a tier selection, and two grade expansions. A buyer
reviews six decisions, not a hundred and fifty cells. Each is editable and
recomputes downstream.

**2. Landed cost, not list rate.**
Global Fibre appears **₹4.86 Cr cheaper**. It quotes FOB Jebel Ali. Once ocean
freight, 10% basic customs duty, inland haulage and LC charges apply, it is
**₹0.48 Cr more expensive** than Continental — and covers 7 fewer lines. A
₹5.35 Cr swing invisible on a list-rate spreadsheet.

*Judgment call:* IGST is **excluded** by default because it is creditable against
output GST; including it would overstate true cost. It is modelled as
`contested: true` and can be toggled.

**3. The analyst never does arithmetic.**
```
question → [LLM] → QuerySpec → [code] → Result → [LLM] → prose
```
The model writes a query; deterministic code executes it; the model narrates a
verified result. Numbers in an answer were computed, not generated.

This caught a real error during the build. I hand-wrote an answer about line 19
before running the executor and got the rates wrong and a vendor's status wrong.
The computed result contradicted me. In the shipped app that is structural.

## What the analysis concluded

| Vendor | List | Landed | Lines | Both mandatory certs |
|---|---|---|---|---|
| Global Fibre | ₹17.79 Cr | ₹23.29 Cr | 23 | Yes |
| NovaPack | ₹19.62 Cr | ₹19.78 Cr | 24 | **No** |
| Shakti | ₹21.76 Cr | ₹22.92 Cr | 28 | **No** |
| **Continental** | ₹22.65 Cr | **₹22.81 Cr** | **30** | **Yes** |
| Ashoka | — | — | 0 | **No** |

**Award Continental at ₹22.81 Cr.** Three of five vendors fail both mandatory
certifications and are unawardable at any price. Among the two eligible,
Continental is cheaper on landed cost *and* the only vendor quoting all 30
lines. A split award doesn't help — Continental is cheapest on every line among
qualified vendors.

## What I deliberately did not build

**The RFx co-pilot and email dispatch are stubbed.** The brief allows stubbed
plumbing and grades the ugly edges, trust, and judgment. Drafting an RFx faster
is a real feature, but it is not what this assignment is testing, and the hours
were better spent on the extraction and trust surface.

**No authentication, no multi-tenancy, no persistence.** Demo state is a JSON
file. Adding Postgres would prove nothing the brief asks about.

**IGST, tooling amortisation and the contested Shakti discount** are modelled but
off by default. Each is a defensible commercial judgment rather than a fact, so
each is visible and toggleable rather than silently applied.

---

## The better problem

The brief invites us to find one. Here it is.

**Extraction is a symptom. The disease is that RFx documents are written in a way
that makes responses structurally incomparable.** Free-text units, no required
response fields, no locked UoM. Five vendors answered the same RFx in five
currencies-of-thought: per kg, per box, per 100 pieces, per set, per grade.

The co-pilot's real job is not drafting faster — it is drafting **comparably**.
Lock the UoM per line. Require a response field per line. Make "same as last
year" impossible to submit.

And the second-order product: the system should **learn each vendor's quirks**.
*Shakti always quotes ₹/kg. Continental always buries a rebate in a footnote.
Ashoka always writes by hand.* Extraction difficulty should decay with
relationship age. The moat isn't the parser — it's the accumulated
vendor-behaviour model, which no competitor can copy because it's earned one
RFx at a time.
