/**
 * Document readers.
 *
 * Images and PDFs go NATIVELY to the multimodal model — no OCR preprocessing,
 * because the model reads an angled photograph better than a pipeline does.
 * Excel and Word are flattened to text locally: cheaper, and more accurate than
 * sending a binary the model has to guess at.
 */
import type { Part } from "./providers";

export function isNative(name: string) {
  return /\.(jpe?g|png|webp|gif|pdf)$/i.test(name);
}

export function mimeFor(name: string) {
  const e = name.toLowerCase().split(".").pop();
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            webp: "image/webp", gif: "image/gif", pdf: "application/pdf" } as any)[e!]
         || "application/octet-stream";
}

/** Excel → a text rendering that preserves merged headers and stray rows. */
export async function xlsxToText(buf: Buffer): Promise<string> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "buffer" });
  const out: string[] = [];
  for (const name of wb.SheetNames) {
    out.push(`=== SHEET: ${name} ===`);
    const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: "" });
    rows.forEach((r, i) => {
      const line = r.map((c: any) => String(c ?? "").trim()).join(" | ").replace(/(\s*\|\s*)+$/, "");
      if (line.trim()) out.push(`R${i + 1}: ${line}`);
    });
  }
  return out.join("\n");
}

/** Word → plain text, paragraph structure preserved. */
export async function docxToText(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const r = await mammoth.extractRawText({ buffer: buf });
  return r.value;
}

export async function toParts(filename: string, buf: Buffer): Promise<Part[]> {
  if (isNative(filename)) {
    return [
      { text: `\nVendor document (${filename}). Read it exactly as it appears. ` +
              `If any region is obscured by glare, shadow, or blur, mark those lines ` +
              `illegible — do NOT guess the digits.` },
      { inline_data: { mime_type: mimeFor(filename), data: buf.toString("base64") } },
    ];
  }
  let text: string;
  if (/\.xlsx?$/i.test(filename)) text = await xlsxToText(buf);
  else if (/\.docx?$/i.test(filename)) text = await docxToText(buf);
  else text = buf.toString("utf8");
  return [{ text: `\nVendor document (${filename}), text form:\n\n${text.slice(0, 60000)}` }];
}
