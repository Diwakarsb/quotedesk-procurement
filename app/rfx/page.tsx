"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postJSON, getJSON, del } from "@/lib/api";

const EXAMPLE =
  "30 lines of corrugated packaging for our Bengaluru and Hosur plants, about " +
  "₹22 crore a year. Mix of RSC shippers, e-comm mailers, die-cut trays, a few " +
  "heavy-duty export boxes, partition sets and layer pads. Vendors must hold " +
  "BRC or ISO 22000 and FSC chain-of-custody. Net 60 payment. Quote per box in INR.";

export default function RfxCopilot() {
  const router = useRouter();
  const [brief,setBrief]   = useState("");
  const [rfx,setRfx]       = useState<any>(null);
  const [refine,setRefine] = useState("");
  const [busy,setBusy]     = useState<""|"draft"|"revise"|"send">("");
  const [err,setErr]       = useState<string|null>(null);
  const [prov,setProv]     = useState<string>("");
  const [restored,setRestored] = useState<string|null>(null);

  // Restore a draft saved on the server so a refresh mid-demo doesn't lose it.
  useEffect(() => {
    getJSON("/api/rfx").then(d => {
      if (d.ok && d.draft?.rfx) {
        setRfx(d.draft.rfx);
        setProv(d.draft.provider || "");
        setRestored(d.draft.saved_at || "");
      }
    }).catch(() => {});
  }, []);

  async function discard() {
    await del("/api/rfx").catch(() => {});
    setRfx(null); setRestored(null); setProv("");
  }

  async function call(body: any, mode: "draft"|"revise") {
    setBusy(mode); setErr(null);
    try {
      const d = await postJSON("/api/rfx", body);
      if (!d.ok) setErr(d.error || "The co-pilot could not draft that.");
      else { setRfx(d.rfx); setProv(d.provider || ""); setRefine(""); setRestored(null); }
    } catch (e:any) { setErr(e.message); }
    setBusy("");
  }

  async function send() {
    setBusy("send"); setErr(null);
    try {
      const d = await postJSON("/api/dispatch", { rfx });
      if (!d.ok) { setErr(d.error || "Dispatch failed"); setBusy(""); return; }
      router.push("/outbox");
    } catch (e:any) { setErr(e.message); setBusy(""); }
  }

  const lines = rfx?.lines || [];
  const specText = (sp:any) => {
    if (!sp) return "—";
    const bits = [sp.ply && `${sp.ply}ply`, sp.flute, sp.dims_mm, sp.gsm && `${sp.gsm}gsm`,
      sp.unit_weight_kg && `${sp.unit_weight_kg}kg`, ...(sp.other||[])].filter(Boolean);
    return bits.length ? bits.join(" · ") : "—";
  };

  return (
    <div className="page">
      <div className="eyebrow">Stage 1 · RFx co-pilot</div>
      <h1 className="h1">Talk an RFx into existence</h1>
      <p className="lede">
        Describe what you need in plain language. The model drafts the line items,
        the questionnaire and the commercial terms — and attaches a <strong>response
        contract</strong> to every line: a locked unit of measure, the fields a valid
        quote must fill, and no “same as last year”. Not drafting faster — drafting
        <em> comparably</em>.
      </p>

      <textarea className="field" value={brief} onChange={(e)=>setBrief(e.target.value)}
        placeholder="e.g. 30 lines of corrugated packaging, ~₹22 Cr/year, BRC + FSC mandatory, net 60, quote per box in INR…" />
      <div className="row" style={{ margin: "12px 0 6px" }}>
        <button className="btn" onClick={()=>call({ brief }, "draft")}
          disabled={!!busy || !brief.trim()}>
          {busy==="draft" ? "Drafting…" : "Draft RFx"}
        </button>
        <button className="btn-ghost btn-sm" type="button" onClick={()=>setBrief(EXAMPLE)}>
          use the sample brief
        </button>
      </div>

      {err && <div className="err" style={{ marginTop: 14 }}><strong>Failed.</strong> {err}</div>}

      {restored && (
        <div className="note" style={{ marginTop: 14 }}>
          Restored from a saved draft{restored ? ` (${new Date(restored).toLocaleString()})` : ""}.
          Draft again to replace it, or discard it below.
        </div>
      )}

      {rfx && (
        <>
          <div className="section">
            <div className="section-h">
              Drafted RFx {prov && <span className="muted">· {prov}</span>}
            </div>
            <div className="section-b">
              <dl className="kv">
                <dt>RFx ID</dt><dd className="mono">{rfx.rfx_id}</dd>
                <dt>Buyer</dt><dd>{rfx.buyer || "—"}</dd>
                <dt>Category</dt><dd>{rfx.category || "—"}</dd>
                <dt>Canonical unit</dt>
                <dd className="mono">{rfx.canonical_uom} · {rfx.canonical_currency}</dd>
                <dt>Due date</dt><dd className="mono">{rfx.due_date || "—"}</dd>
                <dt>Lines</dt><dd>{lines.length}</dd>
              </dl>
            </div>
          </div>

          {(rfx.copilot_notes||[]).length > 0 && (
            <div className="section">
              <div className="section-h">What the co-pilot assumed / needs confirmed</div>
              <div className="section-b" style={{ display: "grid", gap: 6 }}>
                {rfx.copilot_notes.map((n:string,i:number)=>(
                  <div key={i} className="note">{n}</div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <div className="section-h">Line items &amp; response contract</div>
            <div className="section-b" style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead><tr>
                  <th>#</th><th>SKU</th><th>Description</th><th>Spec</th>
                  <th>Annual qty</th><th>Locked UoM</th><th>Required in response</th>
                </tr></thead>
                <tbody>
                  {lines.map((l:any)=>(
                    <tr key={l.line_no}>
                      <td className="mono">{l.line_no}</td>
                      <td className="mono">{l.sku}</td>
                      <td>{l.description}</td>
                      <td style={{ fontSize: 11, color: "var(--ink-3)" }}>{specText(l.spec)}</td>
                      <td className="mono tnum">{l.annual_qty?.toLocaleString?.() ?? l.annual_qty}</td>
                      <td><span className="pill pill-accent">{l.response_contract?.locked_uom}</span></td>
                      <td style={{ lineHeight: 1.9 }}>
                        {(l.response_contract?.required_fields||[]).map((f:string)=>(
                          <span key={f} className="pill" style={{ marginRight: 4 }}>{f}</span>
                        ))}
                        <span className="pill pill-bad">no “same as last year”</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <div className="section-h">Questionnaire
              <span className="muted">{(rfx.questionnaire||[]).length} questions</span></div>
            <div className="section-b">
              {(rfx.questionnaire||[]).map((q:any,i:number)=>(
                <div key={i} style={{ padding: "7px 0",
                  borderTop: i ? "1px solid var(--rule)" : "none", fontSize: 13 }}>
                  <span className="mono" style={{ color: "var(--ink-3)" }}>{q.ref}</span>{" "}
                  {q.question}{" "}
                  {q.mandatory && <span className="pill pill-bad">mandatory</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-h">Commercial terms</div>
            <div className="section-b">
              <dl className="kv">
                <dt>Payment</dt><dd>{rfx.commercial_terms?.payment_terms || "—"}</dd>
                <dt>Validity</dt>
                <dd>{rfx.commercial_terms?.validity_days ? `${rfx.commercial_terms.validity_days} days` : "—"}</dd>
                <dt>Freight basis</dt><dd>{rfx.commercial_terms?.freight_basis || "—"}</dd>
                <dt>Penalty</dt><dd>{rfx.commercial_terms?.penalty_clause || "—"}</dd>
              </dl>
              {(rfx.commercial_terms?.other||[]).map((o:string,i:number)=>(
                <div key={i} style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6 }}>• {o}</div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-h">Refine</div>
            <div className="section-b">
              <textarea className="field" style={{ minHeight: 64 }} value={refine}
                onChange={(e)=>setRefine(e.target.value)}
                placeholder="e.g. add 4 more E-flute mailer lines · make payment net 45 · add a recycled-content minimum" />
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn-ghost" onClick={()=>call({ brief: refine, current: rfx }, "revise")}
                  disabled={!!busy || !refine.trim()}>
                  {busy==="revise" ? "Revising…" : "Apply revision"}
                </button>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn" onClick={send} disabled={!!busy}>
              {busy==="send" ? "Sending…" : "Send to 5 vendors →"}
            </button>
            <button className="btn-ghost" onClick={discard} disabled={!!busy}>Discard draft</button>
            <span className="hint">SMTP is faked — this writes the outbox and takes you to stage 2.</span>
          </div>
        </>
      )}
    </div>
  );
}
