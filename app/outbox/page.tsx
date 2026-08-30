"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import rfx from "@/data/rfx.json";

type Mail = { id:string; to:string; vendor:string; subject:string;
  attachments:{filename:string;note?:string}[]; sent_at:string; status:string };
type In = { vendor:string; from:string; reply_file:string; reply_format:string;
  received:boolean; received_at:string|null; source_url:string };

export default function Outbox() {
  const [outbox,setOutbox] = useState<Mail[]>([]);
  const [inbox,setInbox]   = useState<In[]>([]);
  const [busy,setBusy]     = useState(false);
  const [err,setErr]       = useState<string|null>(null);

  async function load() {
    const r = await fetch("/api/dispatch");
    const d = await r.json();
    if (d.ok) { setOutbox(d.outbox); setInbox(d.inbox); }
  }
  useEffect(() => { load(); }, []);

  async function dispatch() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/dispatch", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ rfx }),
      });
      const d = await r.json();
      if (!d.ok) setErr(d.error || "Dispatch failed");
      else { setOutbox(d.outbox); setInbox(d.inbox); }
    } catch (e:any) { setErr(e.message); }
    setBusy(false);
  }

  async function reset() {
    setBusy(true);
    await fetch("/api/dispatch", { method:"DELETE" });
    await load();
    setBusy(false);
  }

  const sent = outbox.length > 0;
  const fmt = (s:string|null) => s ? new Date(s).toLocaleString() : "—";

  return (
    <div className="page">
      <div className="eyebrow">Stage 2 · {rfx.rfx_id} · Dispatch &amp; responses</div>
      <h1 className="h1">The RFx goes out. The replies come back.</h1>
      <p className="lede">
        Stubbed on purpose — no SMTP socket is opened. <code>sendMail()</code> writes
        to a JSON outbox and logs a line. The five inbound documents already exist in
        <code> public/vendor-responses/</code>; they show as “received” once the RFx
        has been sent.
      </p>

      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn" onClick={dispatch} disabled={busy}>
          {sent ? "Re-send to 5 vendors" : "Dispatch RFx to 5 vendors"}
        </button>
        {sent && <button className="btn-ghost" onClick={reset} disabled={busy}>Reset</button>}
        <Link href="/rfx" className="btn-ghost btn-sm">← Back to RFx co-pilot</Link>
      </div>

      {err && <div className="err" style={{ marginBottom: 16 }}><strong>Failed.</strong> {err}</div>}

      <div className="section">
        <div className="section-h">
          <span>Outbound — {rfx.rfx_id}</span>
          <span className="muted">{sent ? `${outbox.length} delivered` : "not sent yet"}</span>
        </div>
        <div className="section-b" style={{ overflowX: "auto" }}>
          {!sent ? (
            <p className="hint">Nothing sent. Hit “Dispatch” above.</p>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Vendor</th><th>To</th><th>Subject</th><th>Attachments</th><th>Sent</th><th>Status</th>
              </tr></thead>
              <tbody>
                {outbox.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.vendor}</strong></td>
                    <td className="mono">{m.to}</td>
                    <td>{m.subject}</td>
                    <td>
                      {m.attachments.map((a,i) => (
                        <div key={i} className="mono" style={{ fontSize: 11 }}>
                          {a.filename}{a.note ? ` — ${a.note}` : ""}
                        </div>
                      ))}
                    </td>
                    <td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(m.sent_at)}</td>
                    <td><span className="pill pill-ok">{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-h">
          <span>Inbound — vendor responses</span>
          <span className="muted">{inbox.filter(i=>i.received).length} of {inbox.length} received</span>
        </div>
        <div className="section-b" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr>
              <th>Vendor</th><th>From</th><th>Format</th><th>Received</th><th>File</th><th></th>
            </tr></thead>
            <tbody>
              {inbox.map((i) => (
                <tr key={i.vendor}>
                  <td><strong>{i.vendor}</strong></td>
                  <td className="mono">{i.from}</td>
                  <td>{i.reply_format}</td>
                  <td>
                    {i.received
                      ? <span className="pill pill-ok">received</span>
                      : <span className="pill">waiting</span>}
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {fmt(i.received_at)}
                    </div>
                  </td>
                  <td>
                    <a href={i.source_url} target="_blank" rel="noreferrer" className="mono"
                      style={{ fontSize: 11, color: "var(--navy)" }}>{i.reply_file}</a>
                  </td>
                  <td>
                    {i.received && (
                      <Link href="/upload" style={{ fontSize: 12, color: "var(--navy)", fontWeight: 600 }}>
                        Extract →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 18 }}>
        Next: <Link href="/grid" style={{ color: "var(--navy)" }}>the comparison grid</Link> —
        all five responses on one set of lines, units and currency.
      </p>
    </div>
  );
}
