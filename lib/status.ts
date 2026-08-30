/**
 * Pipeline status for the dashboard shell — read by the sidebar and the
 * Overview so the "where am I in the flow" logic lives in one place.
 * Client-safe: only fetches the existing API routes, no node imports.
 */
export interface PipelineStatus {
  rfxDrafted: boolean;
  dispatched: boolean;
  received: number;
  total: number;
}

export async function pipelineStatus(): Promise<PipelineStatus> {
  const [d, r] = await Promise.all([
    fetch("/api/dispatch").then((x) => x.json()).catch(() => ({} as any)),
    fetch("/api/rfx").then((x) => x.json()).catch(() => ({} as any)),
  ]);
  const inbox: any[] = d.inbox || [];
  return {
    rfxDrafted: Boolean(r?.draft?.rfx),
    dispatched: (d.outbox || []).length > 0,
    received: inbox.filter((i) => i.received).length,
    total: inbox.length || 5,
  };
}
