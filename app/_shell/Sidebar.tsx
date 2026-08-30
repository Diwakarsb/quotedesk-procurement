"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { STAGES } from "./nav";
import { pipelineStatus, type PipelineStatus } from "@/lib/status";

export default function Sidebar() {
  const pathname = usePathname();
  const [st, setSt] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    let live = true;
    pipelineStatus().then((s) => { if (live) setSt(s); });
    return () => { live = false; };
  }, [pathname]); // re-check when the user moves between stages

  const statusFor = (href: string): { text: string; dot: string } => {
    if (!st) return { text: "", dot: "" };
    switch (href) {
      case "/rfx":
        return st.rfxDrafted ? { text: "draft saved", dot: "done" } : { text: "not started", dot: "" };
      case "/outbox":
        return st.dispatched
          ? { text: `sent · ${st.received}/${st.total} received`, dot: "done" }
          : { text: "not sent", dot: "" };
      case "/upload":  return { text: "live extraction", dot: "done" };
      case "/grid":    return { text: "30 lines × 5 vendors", dot: "done" };
      case "/analyst": return { text: "ask in plain English", dot: "done" };
      default:         return { text: "", dot: "" };
    }
  };

  const isOn = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar">
      <div className="sb-org">
        <b>Meridian Consumer Products</b>
        <small>Procurement workspace</small>
      </div>
      <nav className="sb-nav">
        {STAGES.map((s) => {
          const on = isOn(s.href);
          const info = statusFor(s.href);
          return (
            <Link key={s.href} href={s.href} className={`nav-item${on ? " on" : ""}`}>
              {s.idx
                ? <span className={`dot${info.dot ? " " + info.dot : ""}`} />
                : <span className="idx">☰</span>}
              <span className="lab">
                {s.idx ? `${s.idx}. ${s.label}` : s.label}
                {info.text && <span className="st">{info.text}</span>}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="sb-foot">RFX-2026-0417 · Corrugated Packaging · ₹22.8 Cr</div>
    </aside>
  );
}
