/**
 * fetch wrappers that never throw "Unexpected token … is not valid JSON".
 * A Vercel function timeout or platform error returns a plain-text page, not
 * JSON — these turn that into a readable Error the UI can show.
 */
function friendly(status: number, text: string): string {
  if (status === 504 || /timed out|timeout|FUNCTION_INVOCATION_TIMEOUT/i.test(text))
    return "The request timed out — the model took longer than 60s. Try again, or switch to a faster model (see DEPLOY.md).";
  if (status === 413) return "That file is too large for the serverless function.";
  const snippet = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  return `Server error (HTTP ${status || "?"}).${snippet ? " " + snippet : ""}`;
}

async function parse(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(friendly(res.status, text));
  }
}

export async function postJSON(url: string, body?: unknown): Promise<any> {
  const res = await fetch(url,
    body === undefined
      ? { method: "POST" }
      : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return parse(res);
}

export async function postForm(url: string, form: FormData): Promise<any> {
  return parse(await fetch(url, { method: "POST", body: form }));
}

export async function getJSON(url: string): Promise<any> {
  return parse(await fetch(url));
}

export async function del(url: string): Promise<any> {
  return parse(await fetch(url, { method: "DELETE" }));
}
