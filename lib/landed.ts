/**
 * Landed cost model.
 *
 * List rate is not what the buyer pays. Each vendor quotes on a different basis
 * (ex-works / FOR / FOB) and buries adjustments in fine print. Every adjustment
 * is an explicit, named, overridable line — never a silent tweak.
 */

export interface Adjustment {
  code: string; label: string; kind: string; basis: string;
  source_quote: string; per_box?: number | null; pct?: number | null;
  contested?: boolean;
}

export const ADJUSTMENTS: Record<string, Adjustment[]> = {
  "Continental Corrugators": [
    { code: "CCL-FRT", label: "Road freight to Bommasandra", kind: "freight",
      basis: "Vendor's own freight column, per box",
      source_quote: "Freight/Box column in rate table" },
    { code: "CCL-HOS", label: "Hosur delivery surcharge", kind: "freight",
      basis: "Not included anywhere in the vendor's table",
      source_quote: "deliveries to Hosur will attract an additional INR 0.28 per box which is not included above",
      per_box: 0.28 },
    { code: "CCL-REB", label: "Early settlement rebate", kind: "rebate",
      basis: "2.5% of invoice value if paid within 15 days",
      source_quote: "an early settlement rebate of 2.5% on invoice value is available where payment is received within 15 days",
      pct: -2.5 },
  ],
  "Global Fibre Solutions": [
    { code: "GFS-OCN", label: "Ocean freight, Jebel Ali to Chennai", kind: "freight",
      basis: "USD 1,850 per 40ft HC container, allocated per box by volume",
      source_quote: "Ocean freight to Chennai approx USD 1,850 per 40ft HC container" },
    { code: "GFS-DUT", label: "Basic customs duty on corrugated cartons", kind: "duty",
      basis: "10% of assessable value (CIF) — HSN 4819",
      source_quote: "Customs duty, IGST and inland haulage to be borne by buyer", pct: 10 },
    { code: "GFS-IGST", label: "IGST on imports", kind: "tax_credit",
      basis: "18% of (CIF + BCD). Creditable against output GST, so excluded by default",
      source_quote: "Customs duty, IGST and inland haulage to be borne by buyer",
      pct: 0, contested: true },
    { code: "GFS-INL", label: "Inland haulage, Chennai port to Bengaluru", kind: "freight",
      basis: "Road movement 350 km, allocated per box",
      source_quote: "inland haulage to be borne by buyer" },
    { code: "GFS-LC", label: "LC and banking charges", kind: "surcharge",
      basis: "0.6% of invoice value for LC at sight",
      source_quote: "Payment by irrevocable LC at sight", pct: 0.6 },
  ],
  "Shakti Packaging": [
    { code: "SPI-FRT", label: "Truck freight allocated per box", kind: "freight",
      basis: "Rs 18,500 per 32ft truck (~7.5 MT), allocated by line unit weight",
      source_quote: "FREIGHT: Rs. 18,500 per truck (32 ft container, approx 7.5 MT)" },
    { code: "SPI-DIS", label: "Early payment discount", kind: "rebate",
      basis: "1.5% if paid within 10 days — but vendor demands 30-day terms, not 60",
      source_quote: "We can offer 1.5% discount for payment within 10 days",
      pct: -1.5, contested: true },
  ],
  "NovaPack Industries": [
    { code: "NPI-HOS", label: "Hosur delivery surcharge", kind: "freight",
      basis: "Stated in vendor prose",
      source_quote: "For the Hosur facility we would need to add Rs. 0.22 per box",
      per_box: 0.22 },
  ],
  "Ashoka Boards": [
    { code: "ASH-FRT", label: "Freight", kind: "freight",
      basis: "Vendor wrote 'freight extra' without quantum — cannot be modelled",
      source_quote: "freight extra. gst extra as usual.", per_box: null },
  ],
};

const boxesPerContainer = (w: number, payload = 24000) => Math.max(1, payload / Math.max(w, 0.01));
const boxesPerTruck = (w: number, payload = 7500) => Math.max(1, payload / Math.max(w, 0.01));

export function landedRate(
  vendor: string, line: { unit_weight_kg: number }, listRate: number | null,
  fx = 88.4, includeContested = false,
): { landed: number | null; steps: any[] } {
  if (listRate == null) return { landed: null, steps: [] };
  const wt = line.unit_weight_kg;
  let total = listRate;
  const steps: any[] = [];

  for (const a of ADJUSTMENTS[vendor] || []) {
    if (a.contested && !includeContested) continue;
    let amt: number | null = null;
    if (a.code === "GFS-OCN") amt = (1850 * fx) / boxesPerContainer(wt);
    else if (a.code === "GFS-INL") amt = 42000 / boxesPerContainer(wt);
    else if (a.code === "SPI-FRT") amt = 18500 / boxesPerTruck(wt);
    else if (a.code === "CCL-FRT") amt = Math.max(0.35, wt * 0.62);
    else if (a.per_box != null) amt = a.per_box;
    else if (a.pct != null) amt = listRate * (a.pct / 100);
    if (amt == null || Math.abs(amt) < 1e-9) continue;
    total += amt;
    steps.push({ code: a.code, label: a.label, kind: a.kind,
                 amount: Math.round(amt * 1e4) / 1e4,
                 source_quote: a.source_quote, contested: !!a.contested });
  }
  return { landed: Math.round(total * 1e4) / 1e4, steps };
}
