/**
 * Faked SMTP. The brief allows this explicitly: "stub the plumbing … Fake the
 * SMTP server if you like." Nothing here opens a socket — sendMail() appends to
 * a JSON outbox on disk and logs a line. The point is that stages 1→2 of the
 * flow (draft an RFx → it goes to vendors) are *visible* in a demo, not that
 * mail is really delivered.
 *
 * Runtime state lives in data/_runtime/ (git-ignored, see lib/store.ts) so a
 * demo can be reset with `rm -rf data/_runtime`.
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

export function readOutbox(): OutboundMail[] {
  return readJSON<OutboundMail[]>("outbox", []);
}

function writeOutbox(list: OutboundMail[]) {
  writeJSON("outbox", list);
}

let seq = 0;
function mailId() {
  seq += 1;
  return `msg-${Date.now().toString(36)}-${seq}`;
}

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
  const list = readOutbox();
  list.push(rec);
  writeOutbox(list);
  // eslint-disable-next-line no-console
  console.log(`[MAIL] → ${rec.to}  "${rec.subject}"  (${rec.attachments.length} attachment(s))`);
  return rec;
}

/** The faked inbound side: every vendor "replied" with the file in public/. */
export function readInbox() {
  const outbox = readOutbox();
  return VENDOR_BOOK.map((v) => {
    const sent = outbox.find((o) => o.vendor === v.vendor);
    return {
      vendor: v.vendor,
      from: v.email,
      reply_file: v.reply_file,
      reply_format: v.reply_format,
      received: Boolean(sent),
      // A reply only exists once the RFx has actually gone out.
      received_at: sent ? sent.sent_at : null,
      source_url: `/vendor-responses/${v.reply_file}`,
    };
  });
}

/** Drop any prior sends for an RFx so "re-send" replaces rather than stacks. */
export function clearRfx(rfxId: string) {
  const kept = readOutbox().filter((o) => o.rfx_id !== rfxId);
  writeOutbox(kept);
}
