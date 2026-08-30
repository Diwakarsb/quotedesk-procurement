"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The screen's markup, styles and logic are static assets under /public/screens
 * so there is one source of truth. React mounts them and unmounts the stylesheet
 * on navigation so its global selectors don't bleed into the rest of the shell.
 */
export default function Page() {
  const [html, setHtml] = useState("");
  const started = useRef(false);

  useEffect(() => {
    document.title = "Award Analyst · QuoteDesk";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/screens/analyst.css";
    link.dataset.screen = "analyst";
    document.head.appendChild(link);
    fetch("/screens/analyst.html").then((r) => r.text()).then(setHtml);
    return () => {
      document.querySelectorAll('[data-screen="analyst"]').forEach((n) => n.remove());
    };
  }, []);

  useEffect(() => {
    if (!html || started.current) return;
    started.current = true;
    const s = document.createElement("script");
    s.src = "/screens/analyst.js";
    s.dataset.screen = "analyst";
    document.body.appendChild(s);
  }, [html]);

  return <div className="screen-embed" dangerouslySetInnerHTML={{ __html: html }} />;
}
