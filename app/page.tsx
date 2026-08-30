"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pipelineStatus, type PipelineStatus } from "@/lib/status";

export default function Overview() {
  const [st, setSt] = useState<PipelineStatus | null>(null);
  useEffect(() => { pipelineStatus().then(setSt).catch(() => {}); }, []);

  const s = (text: string, ok = false) => (
    <span className="ts" style={{ color: ok ? "var(--ok)" : "var(--ink-3)" }}>{text}</span>
  );

  const tiles = [
    { href: "/rfx", n: "1", t: "RFx Co-pilot",
      d: "Talk an RFx into existence. The model drafts lines, questionnaire and terms — with a locked response contract per line.",
      status: !st ? " " : st.rfxDrafted ? s("Draft saved", true) : s("Not started") },
    { href: "/outbox", n: "2", t: "Vendors & Responses",
      d: "The RFx goes to five vendors (SMTP faked); their replies land back in five formats, none on the template.",
      status: !st ? " " : st.dispatched ? s(`Sent · ${st.received}/${st.total} received`, true) : s("Not dispatched") },
    { href: "/upload", n: "3", t: "Extraction",
      d: "Drop in any document — Excel, PDF, Word, a photo, a handwritten note. Extraction runs live against the model.",
      status: s("Live — nothing hardcoded", true) },
    { href: "/grid", n: "4", t: "Comparison",
      d: "30 lines × 5 vendors, normalised to ₹/box. Provenance on every cell, an editable assumption ledger, a landed-cost toggle.",
      status: s("6 assumptions · 45 unresolved", true) },
    { href: "/analyst", n: "5", t: "Award Analyst",
      d: "Ask in plain language. The model writes a query, code executes it, the model narrates a verified result — charts and CSV included.",
      status: s("Question → spec → code → prose", true) },
  ];

  return (
    <div className="page">
      <div className="eyebrow">RFX-2026-0417 · Corrugated packaging · ₹22.8 Cr annual</div>
      <h1 className="h1">Award workspace</h1>
      <p className="lede">
        One pipeline, end to end: draft the RFx, collect whatever the vendors send back,
        normalise it to a single comparison, and interrogate it in plain language — without
        ever inventing a number.
      </p>

      <div className="tiles">
        {tiles.map((x) => (
          <Link key={x.href} href={x.href} className="tile">
            <div className="tt"><span className="pill pill-accent">{x.n}</span>{x.t}</div>
            <div className="td">{x.d}</div>
            {x.status}
          </Link>
        ))}
      </div>

      <div className="section">
        <div className="section-h">Award recommendation
          <span className="muted">from the analyst, on landed cost</span></div>
        <div className="section-b">
          <p style={{ margin: "0 0 10px", fontSize: 14 }}>
            <strong>Continental Corrugators — ₹22.81 Cr landed.</strong> The only vendor quoting
            all 30 lines and clearing both mandatory certifications, and cheaper on landed cost
            than Global Fibre once duty and freight are applied.
          </p>
          <table className="data-table" style={{ maxWidth: 520 }}>
            <thead><tr><th>Vendor</th><th>Landed</th><th>Lines</th><th>Both certs</th></tr></thead>
            <tbody>
              <tr><td>Continental</td><td className="mono">₹22.81 Cr</td><td>30</td><td><span className="pill pill-ok">yes</span></td></tr>
              <tr><td>Global Fibre</td><td className="mono">₹23.29 Cr</td><td>23</td><td><span className="pill pill-ok">yes</span></td></tr>
              <tr><td>NovaPack</td><td className="mono">₹19.78 Cr</td><td>24</td><td><span className="pill pill-bad">no</span></td></tr>
              <tr><td>Shakti</td><td className="mono">₹22.92 Cr</td><td>28</td><td><span className="pill pill-bad">no</span></td></tr>
              <tr><td>Ashoka</td><td className="mono">—</td><td>0</td><td><span className="pill pill-bad">no</span></td></tr>
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: 10 }}>
            Open <Link href="/analyst" style={{ color: "var(--navy)" }}>Award Analyst</Link> to
            re-run any of this against live data.
          </p>
        </div>
      </div>
    </div>
  );
}
