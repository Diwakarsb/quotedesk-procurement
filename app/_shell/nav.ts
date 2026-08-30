/** The five pipeline stages, shared by the sidebar and the topbar. */
export const STAGES = [
  { href: "/",        label: "Overview",             idx: "" },
  { href: "/rfx",     label: "RFx Co-pilot",         idx: "1" },
  { href: "/outbox",  label: "Vendors & Responses",  idx: "2" },
  { href: "/upload",  label: "Extraction",           idx: "3" },
  { href: "/grid",    label: "Comparison",           idx: "4" },
  { href: "/analyst", label: "Award Analyst",        idx: "5" },
];

export function stageFor(pathname: string) {
  return STAGES.find((s) => s.href === pathname)
      || STAGES.find((s) => s.href !== "/" && pathname.startsWith(s.href))
      || STAGES[0];
}
