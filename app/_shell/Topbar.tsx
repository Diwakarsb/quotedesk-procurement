"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { stageFor } from "./nav";

const SUBTITLE: Record<string, string> = {
  "/": "Pipeline status across the RFX-2026-0417 award",
  "/rfx": "Draft the RFx with the co-pilot — locked response contract per line",
  "/outbox": "Dispatch to vendors (SMTP faked) and track responses",
  "/upload": "Run extraction on any vendor document, live",
  "/grid": "30 lines × 5 vendors, normalised to ₹/box with provenance",
  "/analyst": "Ask in plain English — the model never does the arithmetic",
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const stage = stageFor(pathname);

  async function reset() {
    if (!window.confirm("Reset the demo? This clears the outbox, any saved RFx draft, and the analyst history.")) return;
    setBusy(true);
    try { await fetch("/api/dispatch", { method: "DELETE" }); } catch {}
    setBusy(false);
    router.refresh();
  }

  return (
    <header className="topbar">
      <div>
        <div className="tb-title">{stage.idx ? `${stage.idx}. ${stage.label}` : stage.label}</div>
        <div className="tb-sub">{SUBTITLE[pathname] || SUBTITLE[stage.href] || ""}</div>
      </div>
      <div className="tb-spacer" />
      <button className="btn-ghost btn-sm" onClick={reset} disabled={busy}>
        {busy ? "Resetting…" : "Reset demo"}
      </button>
    </header>
  );
}
