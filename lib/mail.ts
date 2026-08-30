/**
 * Faked SMTP. The brief allows this explicitly: "stub the plumbing … Fake the
 * SMTP server if you like." Nothing here opens a socket — sendMail() builds a
 * record and logs a line; the dispatch route persists the batch via lib/store.
 *
 * Runtime state lives in Redis (prod) or data/_runtime (dev). See lib/store.ts.
 */
import { readJSON, writeJSON, resetRuntime } from "./store";

export { resetRuntime };

export interface MailAttachment { filename: string; note?: string }
export interface OutboundMail {
  id: string;
  to: string;
  vendor: string;
  from: string;
  subject: string;
  body: string;
  attachments: MailAttachment[];
  rfx_id: string;
  sent_at: string;
  status: "delivered";
}

/** The five vendors the RFx goes to, and the file each one sent back. This is
 *  the faked "inbound" side — the real documents already sit in public/. */
export const VENDOR_BOOK = [
  { vendor: "Shakti Packaging",        email: "sales@shaktipackaging.co.in",     reply_file: "V1_Shakti_Packaging_Quotation.xlsx",        reply_format: "Excel (off-template)" },
  { vendor: "Continental Corrugators", email: "tenders@continental-corr.com",    reply_file: "V2_Continental_Corrugators_Quotation.pdf",   reply_format: "PDF on letterhead" },
  { vendor: "NovaPack Industries",     email: "bids@novapack.in",                reply_file: "V3_NovaPack_Industries_Offer.docx",         reply_format: "Word, commercials in prose" },
  { vendor: "Global Fibre Solutions",  email: "export@globalfibre.ae",           reply_file: "V4_Global_Fibre_ratecard_photo.jpg",        reply_format: "Photo of a USD rate card" },
  { vendor: "Ashoka Boards",           email: "ashokaboards.blr@gmail.com",      reply_file: "V5_Ashoka_Boards_handwritten_ratesheet.jpg", reply_format: "Handwritten note" },
];

export async function readOutbox(): Promise<OutboundMail[]> {
  return readJSON<OutboundMail[]>("outbox", []);
}

let seq = 0;
function mailId() {
  seq += 1;
  return `msg-${Date.now().toString(36)}-${seq}`;
}

/** Build one outbound record. Pure + synchronous — no I/O, no race. */
export function sendMail(m: {
  to: string; vendor: string; from?: string; subject: string; body: string;
  attachments?: MailAttachment[]; rfx_id: string;
}): OutboundMail {
  const rec: OutboundMail = {
    id: mailId(),
    to: m.to,
    vendor: m.vendor,
    from: m.from || "procurement@meridiancp.example",
    subject: m.subject,
    body: m.body,
    attachments: m.attachments || [],
    rfx_id: m.rfx_id,
    sent_at: new Date().toISOString(),
    status: "delivered",
  };
  // eslint-disable-next-line no-console
  console.log(`[MAIL] → ${rec.to}  "${rec.subject}"  (${rec.attachments.length} attachment(s))`);
  return rec;
}

/** Persist a batch of outbound records in one read-modify-write. */
export async function saveOutbound(records: OutboundMail[]): Promise<void> {
  const list = await readOutbox();
  list.push(...records);
  await writeJSON("outbox", list);
}

/** The faked inbound side: every vendor "replied" with the file in public/. */
export async function readInbox() {
  const outbox = await readOutbox();
  return VENDOR_BOOK.map((v) => {
    const sent = outbox.find((o) => o.vendor === v.vendor);
    return {
      vendor: v.vendor,
      from: v.email,
      reply_file: v.reply_file,
      reply_format: v.reply_format,
      received: Boolean(sent),
      received_at: sent ? sent.sent_at : null,
      source_url: `/vendor-responses/${v.reply_file}`,
    };
  });
}

/** Drop any prior sends for an RFx so "re-send" replaces rather than stacks. */
export async function clearRfx(rfxId: string): Promise<void> {
  const kept = (await readOutbox()).filter((o) => o.rfx_id !== rfxId);
  await writeJSON("outbox", kept);
}
