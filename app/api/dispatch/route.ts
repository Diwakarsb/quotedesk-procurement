import { NextRequest, NextResponse } from "next/server";
import { sendMail, saveOutbound, readOutbox, readInbox, resetRuntime, clearRfx, VENDOR_BOOK } from "@/lib/mail";

export const runtime = "nodejs";

/** GET → current outbox + inbox, for the /outbox screen. */
export async function GET() {
  return NextResponse.json({ ok: true, outbox: await readOutbox(), inbox: await readInbox() });
}

/** DELETE → wipe ALL runtime state (outbox, saved RFx draft, analyst history)
 *  so a demo can start clean. */
export async function DELETE() {
  await resetRuntime();
  return NextResponse.json({ ok: true, outbox: [], inbox: await readInbox() });
}

/**
 * POST { rfx } → "email" the RFx to the five vendors. No socket is opened;
 * the batch is persisted in one write. Returns the outbox + inbox so the
 * screen can render the whole flow in one round-trip.
 */
export async function POST(req: NextRequest) {
  try {
    const { rfx } = await req.json();
    if (!rfx || !Array.isArray(rfx.lines)) {
      return NextResponse.json({ ok: false, error: "No RFx supplied" }, { status: 400 });
    }
    const rfxId: string = rfx.rfx_id || "RFX-DRAFT";
    const lineCount = rfx.lines.length;
    const qCount = Array.isArray(rfx.questionnaire) ? rfx.questionnaire.length : 0;
    const due: string = rfx.due_date || "14 days from receipt";

    await clearRfx(rfxId);
    const sent = VENDOR_BOOK.map((v) =>
      sendMail({
        to: v.email,
        vendor: v.vendor,
        rfx_id: rfxId,
        subject: `${rfxId} — Request for Quotation, ${rfx.category || "packaging"} (${lineCount} lines)`,
        body:
          `Dear ${v.vendor},\n\n` +
          `Please find attached ${rfxId} covering ${lineCount} line items and a ` +
          `${qCount}-question qualification questionnaire. Responses are due by ${due}.\n\n` +
          `Each line specifies a locked unit of measure and the response fields we require. ` +
          `Quotes that leave a required field blank, or answer "same as last year", cannot be ` +
          `loaded into the comparison and will be returned.\n\n` +
          `Regards,\nProcurement, Meridian Consumer Products`,
        attachments: [
          { filename: `${rfxId}.pdf`, note: `${lineCount} lines, ${qCount} questions` },
          { filename: `${rfxId}-response-template.xlsx`, note: "locked UoM per line" },
        ],
      }),
    );
    await saveOutbound(sent);

    return NextResponse.json({
      ok: true,
      dispatched: sent.length,
      outbox: await readOutbox(),
      inbox: await readInbox(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
