/**
 * Analyst engine — deterministic executors.
 *
 *   question → [LLM] → QuerySpec → [this file] → Result → [LLM] → prose
 *
 * The LLM never does arithmetic. Numbers in an answer were computed here.
 */

export const MANDATORY = ["Q1", "Q2"];

export interface QuerySpec {
  intent: string; basis?: "list" | "landed";
  vendors?: string[] | null; lines?: number[] | null;
  filters?: { qualified_only?: boolean; min_coverage?: number | null; exclude_unresolved?: boolean };
  metric?: string | null; sort?: string | null; limit?: number | null;
  needs_clarification?: string | null;
}

export class AnalystEngine {
  private lines = new Map<number, any>();
  private cells = new Map<string, any>();
  vendors: string[];

  constructor(grid: any, private qual: Record<string, any>) {
    for (const l of grid.lines) this.lines.set(l.n, l);
    for (const c of grid.cells) this.cells.set(`${c.v}|${c.n}`, c);
    this.vendors = grid.vendors;
  }

  private rate(v: string, n: number, basis: string) {
    const c = this.cells.get(`${v}|${n}`);
    if (!c) return null;
    return basis === "list" ? c.val : c.lv;
  }

  coverage(v: string) {
    let k = 0;
    for (const n of this.lines.keys()) if (this.rate(v, n, "list") != null) k++;
    return k;
  }

  qualified(v: string) {
    const q = this.qual[v] || {};
    return MANDATORY.every((m) => q[m]?.pass);
  }

  annualised(v: string, basis = "landed", lines?: number[] | null) {
    let tot = 0; const missing: number[] = [];
    for (const [n, L] of this.lines) {
      if (lines && !lines.includes(n)) continue;
      const r = this.rate(v, n, basis);
      if (r == null) { missing.push(n); continue; }
      tot += r * L.q;
    }
    return { tot, missing };
  }

  execute(spec: QuerySpec): any {
    const basis = spec.basis || "landed";
    let vends = spec.vendors?.length ? spec.vendors : this.vendors;
    const lines = spec.lines || null;
    const f = spec.filters || {};
    if (f.qualified_only) vends = vends.filter((v) => this.qualified(v));

    if (["compare_total", "qualification", "coverage"].includes(spec.intent)) {
      const rows = vends.map((v) => {
        const { tot } = this.annualised(v, basis, lines);
        const cov = this.coverage(v);
        return { vendor: v, annualised_inr: Math.round(tot * 100) / 100,
          annualised_cr: Math.round((tot / 1e7) * 100) / 100,
          lines_quoted: cov, lines_missing: 30 - cov,
          qualified: this.qualified(v),
          failed_mandatory: MANDATORY.filter((m) => !this.qual[v]?.[m]?.pass) };
      }).filter((r) => r.lines_quoted > 0)
        .sort((a, b) => a.annualised_inr - b.annualised_inr);
      return { kind: "vendor_table", basis, rows,
        note: "Totals cover only the lines each vendor actually quoted; they are NOT like-for-like where coverage differs." };
    }

    if (spec.intent === "scenario_split") {
      const elig = vends.filter((v) => this.qualified(v));
      const alloc: Record<string, number[]> = {};
      let tot = 0; const unaward: number[] = [];
      for (const [n, L] of this.lines) {
        let best: [string, number] | null = null;
        for (const v of elig) {
          const r = this.rate(v, n, basis);
          if (r == null) continue;
          if (!best || r < best[1]) best = [v, r];
        }
        if (!best) { unaward.push(n); continue; }
        (alloc[best[0]] ||= []).push(n);
        tot += best[1] * L.q;
      }
      return { kind: "split_award", basis, eligible_vendors: elig,
        allocation: alloc,
        lines_per_vendor: Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, v.length])),
        total_inr: Math.round(tot * 100) / 100,
        total_cr: Math.round((tot / 1e7) * 100) / 100,
        unawardable_lines: unaward,
        note: "Only vendors clearing both mandatory certifications are eligible." };
    }

    if (spec.intent === "unresolved_report") {
      const rows: any[] = [];
      for (const v of vends) for (const n of this.lines.keys()) {
        const c = this.cells.get(`${v}|${n}`);
        if (c?.s === "unresolved") rows.push({ vendor: v, line: n, reason: c.rs, vendor_words: c.ev });
      }
      return { kind: "unresolved", rows, count: rows.length };
    }

    if (spec.intent === "line_detail") {
      const rows: any[] = [];
      for (const n of (lines || Array.from(this.lines.keys()))) {
        const L = this.lines.get(n);
        for (const v of vends) {
          const c = this.cells.get(`${v}|${n}`);
          if (!c) continue;
          rows.push({ line: n, desc: L.d, vendor: v, state: c.s, list: c.val,
            landed: c.lv, confidence: c.cf, evidence: c.ev, reason: c.rs,
            working: c.wk, adjustments: c.adj || [] });
        }
      }
      return { kind: "line_detail", rows };
    }

    if (spec.intent === "rank_lines") {
      const rows: any[] = [];
      for (const [n, L] of this.lines) {
        if (lines && !lines.includes(n)) continue;
        let best: [string, number] | null = null;
        let bidders = 0;
        for (const v of vends) {
          const r = this.rate(v, n, basis);
          if (r == null) continue;
          bidders++;
          if (!best || r < best[1]) best = [v, r];
        }
        rows.push({ line: n, sku: L.sku, desc: L.d,
          best_vendor: best?.[0] ?? null,
          best_rate: best ? Math.round(best[1] * 100) / 100 : null,
          annual_qty: L.q, bidders });
      }
      return { kind: "line_table", basis, rows };
    }

    if (spec.intent === "risk_scan") {
      const rows: any[] = [];
      for (const v of vends) {
        const cov = this.coverage(v);
        if (cov < 30) rows.push({ vendor: v, risk: "incomplete_coverage", detail: `Quoted ${cov} of 30 lines` });
        if (!this.qualified(v)) {
          const fm = MANDATORY.filter((m) => !this.qual[v]?.[m]?.pass);
          rows.push({ vendor: v, risk: "failed_mandatory", detail: `Fails ${fm.join(", ")}` });
        }
        const low = Array.from(this.lines.keys())
          .filter((n) => { const c = this.cells.get(`${v}|${n}`); return c?.cf != null && c.cf < 0.8; });
        if (low.length) rows.push({ vendor: v, risk: "low_extraction_confidence",
          detail: `${low.length} lines below 80% confidence` });
      }
      return { kind: "risk", rows };
    }

    return { kind: "unknown",
      message: spec.needs_clarification || "That question cannot be answered from the quote data alone." };
  }
}
