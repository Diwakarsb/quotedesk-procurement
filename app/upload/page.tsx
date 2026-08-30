"use client";
import { useState, useRef } from "react";

const STATE_PILL: Record<string, string> = {
  quoted: "pill-ok",
  not_quoted: "pill-bad",
  illegible: "pill-bad",
  conditional: "pill-warn",
  reference_to_prior: "pill-warn",
};

export default function Upload() {
  const [busy,setBusy] = useState(false);
  const [over,setOver] = useState(false);
  const [res,setRes] = useState<any>(null);
  const [err,setErr] = useState<string|null>(null);
  const [elapsed,setElapsed] = useState<number|null>(null);
  const inp = useRef<HTMLInputElement>(null);

  async function send(file: File) {
    setBusy(true); setErr(null); setRes(null); setElapsed(null);
    const t0 = Date.now();
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/extract", { method:"POST", body:fd });
      const d = await r.json();
      setElapsed((Date.now() - t0) / 1000);
      if (!d.ok) setErr(d.error || "Extraction failed"); else setRes(d.result);
    } catch (e:any) { setErr(e.message); }
    setBusy(false);
  }

  const lines = res?.lines || [];
  const grades = res?.grade_level_rates || [];

  return (
    <div className="page">
      <div className="eyebrow">Stage 3 · RFX-2026-0417 · Live extraction</div>
      <h1 className="h1">Add a vendor response</h1>
      <p className="lede">
        Drop in any quotation — Excel, PDF, Word, a photo, a handwritten note.
        Extraction runs against the live model right now. Nothing here is
        pre-computed; hand it a document it has never seen.
      </p>

      <div
        onDragOver={(e)=>{e.preventDefault();setOver(true);}}
        onDragLeave={()=>setOver(false)}
        onDrop={(e)=>{e.preventDefault();setOver(false);
          const f=e.dataTransfer.files?.[0]; if(f && !busy) send(f);}}
        onClick={()=>{ if(!busy) inp.current?.click(); }}
        style={{
          border: `2px dashed ${over ? "var(--navy)" : "var(--rule-2)"}`,
          borderRadius: 8, padding: "46px 26px", textAlign: "center",
          background: over ? "var(--navy-soft)" : "var(--surface)",
          cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 500 }}>
          {busy ? "Reading the document…" : "Drop a file here, or click to choose"}
        </div>
        <div className="hint" style={{ marginTop: 9 }}>
          {busy ? "The model is reading it now — 5–40 seconds."
                : ".xlsx · .pdf · .docx · .jpg · .png · .txt"}
        </div>
        <input ref={inp} type="file" hidden
          onChange={(e)=>{const f=e.target.files?.[0]; if(f) send(f);}} />
      </div>

      {err && (
        <div className="err" style={{ marginTop: 20 }}>
          <strong>Extraction failed.</strong> {err}
          <div className="hint" style={{ marginTop: 7 }}>Check that a key is set in .env.local — see README.</div>
        </div>
      )}

      {res && (
        <>
          <div className="section">
            <div className="section-h">
              <span>What the model read</span>
              <span className="muted">{res._provider} · {elapsed?.toFixed(1)}s</span>
            </div>
            <div className="section-b">
              <dl className="kv">
                <dt>Vendor</dt><dd><strong>{res.vendor_name || "—"}</strong></dd>
                <dt>Quote ref</dt><dd className="mono">{res.quote_ref || "—"}</dd>
                <dt>Stated currency</dt><dd className="mono">{res.stated_currency || "—"}</dd>
                <dt>Stated unit</dt>
                <dd>
                  <span className="mono">{res.stated_uom}</span>
                  {res.uom_evidence && (
                    <div className="hint" style={{ marginTop: 3 }}>“{res.uom_evidence}”</div>
                  )}
                </dd>
              </dl>
            </div>
          </div>

          {grades.length > 0 && (
            <div className="section">
              <div className="section-h">Priced by grade, not by line</div>
              <div className="section-b">
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink-2)" }}>
                  This vendor priced board grades rather than your line items. These rates are
                  <strong> not</strong> applied to any line until you confirm the mapping.
                </p>
                {grades.map((g:any,i:number)=>(
                  <div key={i} style={{ padding: "8px 0", borderTop: "1px solid var(--rule)" }}>
                    <strong>{g.grade}</strong> — <span className="mono">{g.rate_value} {g.rate_uom}</span>
                    <div className="hint" style={{ marginTop: 3 }}>“{g.evidence}”</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lines.length > 0 && (
            <div className="section">
              <div className="section-h">
                <span>Line items</span>
                <span className="muted">
                  {lines.filter((l:any)=>l.rate_value!=null).length} with a rate ·{" "}
                  {lines.filter((l:any)=>l.rate_value==null).length} without
                </span>
              </div>
              <div className="section-b" style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead><tr>
                    <th>Ln</th><th>Vendor text</th><th>Rate</th><th>Status</th><th>Conf</th><th>Evidence</th>
                  </tr></thead>
                  <tbody>
                    {lines.slice(0,40).map((l:any,i:number)=>(
                      <tr key={i}>
                        <td className="mono">{l.rfx_line_no ?? "—"}</td>
                        <td>{(l.vendor_item_text||"").slice(0,44)}</td>
                        <td className="mono tnum" style={{ whiteSpace: "nowrap" }}>
                          {l.rate_value!=null ? `${l.rate_value} ${l.rate_uom||""}` : "—"}
                        </td>
                        <td><span className={`pill ${STATE_PILL[l.status] || ""}`}>{l.status}</span></td>
                        <td className="mono">
                          {l.confidence!=null ? `${Math.round(l.confidence*100)}%` : "—"}
                        </td>
                        <td style={{ fontSize: 11, color: "var(--ink-3)" }}>
                          {(l.evidence||"").slice(0,52)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(res.unresolved_items||[]).length > 0 && (
            <div className="section">
              <div className="section-h">What it refused to guess</div>
              <div className="section-b">
                {res.unresolved_items.map((u:any,i:number)=>(
                  <div key={i} style={{ padding: "9px 0", borderTop: i ? "1px solid var(--rule)" : "none" }}>
                    <strong style={{ fontSize: 13 }}>{u.what}</strong>
                    <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2 }}>{u.why}</div>
                    {u.vendor_words && (
                      <div className="mono hint" style={{ marginTop: 3 }}>“{u.vendor_words}”</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <div className="section-h">Raw model output</div>
            <div className="section-b">
              <pre className="mono" style={{ margin: 0, background: "var(--sunk)",
                border: "1px solid var(--rule)", borderRadius: 6, padding: "12px 14px",
                fontSize: 11, lineHeight: 1.6, overflowX: "auto", maxHeight: 420, color: "var(--ink-2)" }}>
                {JSON.stringify(res,null,1)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
