/**
 * Normalization engine.
 *
 * CORE PRINCIPLE: every transformation produces an Assumption the buyer can
 * see, audit, and override. Nothing is silently converted. Nothing is imputed.
 */

export const EXTRACTED = "extracted";
export const DERIVED = "derived";
export const UNRESOLVED = "unresolved";

export interface Assumption {
  id: string; kind: string; vendor: string; scope: string;
  statement: string; basis: string; value: any;
  editable: boolean; source_quote?: string; affects_lines: number[];
}

export interface Cell {
  vendor: string; line_no: number; state: string;
  value: number | null; confidence: number | null;
  native_value?: number | null; native_uom?: string | null; native_currency?: string | null;
  working?: string | null; evidence?: string | null; reason?: string | null;
  assumption_ids: string[]; source_file?: string | null;
}

export interface RfxLine {
  line_no: number; sku: string; description: string; ply: number;
  flute: string; dims_mm: string; gsm: number; annual_qty: number;
  unit_weight_kg: number;
}

export class Normalizer {
  assumptions = new Map<string, Assumption>();
  private index = new Map<string, string>();
  private n = 0;
  private lines = new Map<number, RfxLine>();

  constructor(private rfx: any, private fx: Record<string, number>) {
    for (const l of rfx.lines) this.lines.set(l.line_no, l);
  }

  private aid(p: string) { return `${p}-${String(++this.n).padStart(3, "0")}`; }

  /** Collapse identical assumptions so the ledger stays human-sized. */
  private add(a: Assumption): string {
    const key = [a.vendor, a.kind, String(a.value),
                 a.statement.split(" using ")[0].split(" at ")[0]].join("|");
    const seen = this.index.get(key);
    if (seen) {
      const ex = this.assumptions.get(seen)!;
      for (const ln of a.affects_lines) if (!ex.affects_lines.includes(ln)) ex.affects_lines.push(ln);
      return ex.id;
    }
    this.index.set(key, a.id);
    this.assumptions.set(a.id, a);
    return a.id;
  }

  unresolved(vendor: string, line_no: number, reason: string,
             evidence?: string, source_file?: string, confidence: number | null = null): Cell {
    return { vendor, line_no, state: UNRESOLVED, value: null, confidence,
             reason, evidence, source_file, assumption_ids: [] };
  }

  convert(vendor: string, line_no: number, value: number, uom: string,
          currency: string, evidence: string, confidence: number,
          source_file: string): Cell {
    const line = this.lines.get(line_no)!;
    const steps: string[] = [];
    const aids: string[] = [];
    let v = value;

    // 1 — currency to INR
    if (currency && currency !== "INR") {
      const rate = this.fx[currency];
      if (rate == null) {
        return this.unresolved(vendor, line_no,
          `No FX rate available for ${currency}`, evidence, source_file, confidence);
      }
      const id = this.add({
        id: this.aid("FX"), kind: "fx", vendor, scope: "all lines",
        statement: `${currency} converted to INR at ${rate.toFixed(2)}`,
        basis: `RBI reference rate on RFx due date ${this.rfx.fx_reference_date}`,
        value: rate, editable: true, source_quote: evidence, affects_lines: [],
      });
      steps.push(`${v.toFixed(2)} ${currency} × ${rate.toFixed(2)} = ${(v * rate).toFixed(2)} INR`);
      v *= rate; aids.push(id);
    }

    // 2 — UoM to per box
    if (uom === "per_kg") {
      const wt = line.unit_weight_kg;
      const id = this.add({
        id: this.aid("UOM"), kind: "uom_conversion", vendor, scope: "all quoted lines",
        statement: "₹/kg converted to ₹/box using the unit weight in the buyer's own RFx spec",
        basis: "Vendor quoted per kilogram; RFx specifies kg/box for every line",
        value: "RFx unit weights", editable: true, source_quote: evidence,
        affects_lines: [line_no],
      });
      steps.push(`${v.toFixed(2)} INR/kg × ${wt} kg/box = ${(v * wt).toFixed(2)} INR/box`);
      v *= wt; aids.push(id);
    } else if (uom === "per_100_pieces") {
      const id = this.add({
        id: this.aid("UOM"), kind: "uom_conversion", vendor, scope: "all lines",
        statement: "Priced per 100 pieces; divided by 100 to reach per-box",
        basis: "Vendor header states 'ALL PRICES IN USD PER 100 PIECES'",
        value: 100, editable: true, source_quote: evidence, affects_lines: [line_no],
      });
      steps.push(`${v.toFixed(2)} per 100 pcs ÷ 100 = ${(v / 100).toFixed(4)} INR/box`);
      v /= 100; aids.push(id);
    } else if (uom !== "per_box" && uom !== "per_piece") {
      return this.unresolved(vendor, line_no,
        `Unit of measure not determinable ('${uom}')`, evidence, source_file, confidence);
    }

    return {
      vendor, line_no, state: steps.length ? DERIVED : EXTRACTED,
      value: Math.round(v * 1e4) / 1e4, confidence,
      native_value: value, native_uom: uom, native_currency: currency,
      working: steps.length ? steps.join(" → ") : null,
      evidence, assumption_ids: aids, source_file,
    };
  }

  /**
   * A grade-level rate (e.g. "5 ply = 42/kg") mapped to many lines.
   * Held UNRESOLVED until a human confirms — fanning two handwritten figures
   * across 26 lines would manufacture false confidence.
   */
  gradeExpansion(vendor: string, grade: string, rate: number, uom: string,
                 evidence: string, lineNos: number[], source_file: string,
                 confirmed = false): Cell[] {
    const id = this.add({
      id: this.aid("GRADE"), kind: "grade_expansion", vendor, scope: `${grade} lines`,
      statement: `Vendor priced by grade '${grade}' at ${rate} ${uom}, not line by line. ` +
                 `Applying it to ${lineNos.length} lines requires buyer confirmation.`,
      basis: "Vendor document prices by board grade, not against RFx line numbers",
      value: rate, editable: true, source_quote: evidence, affects_lines: lineNos,
    });
    return lineNos.map((ln) => {
      if (!confirmed) {
        const c = this.unresolved(vendor, ln,
          `Vendor quoted grade '${grade}' only, not this line. ` +
          `Needs buyer confirmation before it can be compared.`, evidence, source_file);
        c.assumption_ids = [id];
        c.native_value = rate; c.native_uom = uom; c.native_currency = "INR";
        return c;
      }
      const c = this.convert(vendor, ln, rate, uom, "INR", evidence, 0.55, source_file);
      c.assumption_ids.push(id);
      return c;
    });
  }

  allAssumptions() { return Array.from(this.assumptions.values()); }
}
