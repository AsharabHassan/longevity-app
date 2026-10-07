// Delivers the Biological Age Report PDF into GoHighLevel via the Private
// Integration, the same way the clinic's other quiz apps do: uploads the file,
// upserts the contact (deduped by email) with the PDF link in a custom field,
// pins a note with the link, and emails the patient a copy with the PDF attached.
// No-ops when the GHL env isn't configured, and never throws: report delivery
// must never block the lead flow.

const BASE = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

function creds(): { token: string; locationId: string } | null {
  const token = process.env.GHL_API_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!token || !locationId) return null;
  return { token, locationId };
}

export interface DeliverInput {
  firstName: string;
  email: string;
  phone: string;
  pdf: Buffer;
  fileName: string;
  subject: string;
  emailHtml: string;
  /** May contain a "{url}" placeholder for the hosted PDF link. */
  noteBody: string;
  source: string;
}

export interface DeliverResult {
  ok: boolean;
  skipped?: boolean;
  fileUrl?: string;
  contactId?: string;
  emailed?: boolean;
  noted?: boolean;
  error?: string;
}

export async function deliverReportToGhl(input: DeliverInput): Promise<DeliverResult> {
  const c = creds();
  if (!c) return { ok: false, skipped: true };

  const auth = { Authorization: `Bearer ${c.token}`, Version: VERSION, Accept: "application/json" };

  try {
    // 1. Upload the PDF to the media library to get a hosted URL
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(input.pdf)], { type: "application/pdf" }), input.fileName);
    form.append("hosted", "false");
    form.append("name", input.fileName);
    form.append("locationId", c.locationId);
    // No Content-Type header: fetch adds the multipart boundary
    const up = await fetch(`${BASE}/medias/upload-file`, { method: "POST", headers: auth, body: form });
    const upj = (await up.json().catch(() => ({}))) as { url?: string };
    if (!up.ok || !upj.url) return { ok: false, error: `media-upload ${up.status}` };
    const fileUrl = upj.url;

    // 2. Upsert the contact and write the PDF link into the custom field, so
    // workflows can read it. The key is the bare GHL key, without "contact.".
    const fieldKey = (process.env.GHL_REPORT_FIELD_KEY || "biological_age_report_pdf").trim();
    const us = await fetch(`${BASE}/contacts/upsert`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: c.locationId,
        firstName: input.firstName,
        email: input.email,
        phone: input.phone,
        source: input.source,
        customFields: [{ key: fieldKey, field_value: fileUrl }],
      }),
    });
    const usj = (await us.json().catch(() => ({}))) as { contact?: { id?: string } };
    const contactId = usj.contact?.id;
    if (!contactId) return { ok: false, fileUrl, error: `contact-upsert ${us.status}` };

    // 3. Pin a note with the link on the contact
    let noted = false;
    try {
      const nt = await fetch(`${BASE}/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ body: input.noteBody.replace("{url}", fileUrl) }),
      });
      noted = nt.ok;
    } catch {
      // non-fatal
    }

    // 4. Email the patient their copy with the PDF attached (also logs on the contact)
    let emailed = false;
    try {
      const emailFrom = process.env.GHL_REPORT_EMAIL_FROM?.trim();
      const em = await fetch(`${BASE}/conversations/messages`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Email",
          contactId,
          subject: input.subject,
          html: input.emailHtml,
          attachments: [fileUrl],
          ...(emailFrom ? { emailFrom } : {}),
        }),
      });
      emailed = em.ok;
      if (!em.ok) console.error("[ghlReport] email send failed:", em.status, await em.text().catch(() => ""));
    } catch {
      // non-fatal: the report is still on the contact via the field and note
    }

    return { ok: true, fileUrl, contactId, emailed, noted };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ghl-error" };
  }
}
