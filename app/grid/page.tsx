"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The screen's markup, styles and logic are static assets under /public/screens
 * so there is one source of truth. React mounts them and, crucially, unmounts
 * the stylesheet when you navigate away so its global selectors don't bleed into
 * the rest of the dashboard.
 */
export default function Page() {
  const [html, setHtml] = useState("");
  const started = useRef(false);

  useEffect(() => {
    document.title = "Comparison · QuoteDesk";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/screens/grid.css";
    link.dataset.screen = "grid";
    document.head.appendChild(link);
    fetch("/screens/grid.html").then((r) => r.text()).then(setHtml);
    return () => {
      document.querySelectorAll('[data-screen="grid"]').forEach((n) => n.remove());
    };
  }, []);

  useEffect(() => {
    if (!html || started.current) return;
    started.current = true;
    const s = document.createElement("script");
    s.src = "/screens/grid.js";
    s.dataset.screen = "grid";
    document.body.appendChild(s);
  }, [html]);

  return <div className="screen-embed" dangerouslySetInnerHTML={{ __html: html }} />;
}
