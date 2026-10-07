import { CLINIC, type ClinicLocation } from "@/lib/clinic";
import { deliverReportToGhl, type DeliverResult } from "@/lib/ghlReport";
import { matchProtocols } from "@/lib/protocols";
import { buildReportPdf } from "@/lib/reportPdf";
import type { LeadData, LifestyleAgeResult, QuizAnswer } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface ReportEmailInput {
  lead: Partial<LeadData>;
  result: LifestyleAgeResult;
  location: ClinicLocation;
  qualified: boolean;
  answers: QuizAnswer[];
}

/**
 * Builds the same PDF the report page downloads, puts it on the patient's GHL
 * contact (custom field + note) and emails it to them. Runs on every saved lead.
 */
export async function emailReport({ lead, result, location, qualified, answers }: ReportEmailInput): Promise<DeliverResult> {
  const email = (lead.email || "").trim();
  if (!EMAIL_RE.test(email) || !result?.factors) return { ok: false, skipped: true, error: "missing email or result" };

  const firstName = (lead.firstName || "").trim().slice(0, 80);
  const protocols = qualified ? matchProtocols(answers, result) : [];
  const pdf = buildReportPdf({
    result,
    lead: { firstName, email, phone: lead.phone || "" },
    location,
    qualified,
    protocols,
  });

  const safeName = firstName.replace(/[^\w-]/g, "") || "Report";
  const site = CLINIC.locations[location] ?? CLINIC.locations.London;
  const greeting = escapeHtml(firstName || "there");

  const emailHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px">
      <p>Hi ${greeting},</p>
      <p>Thank you for completing the biological age check with <strong>${CLINIC.brand}</strong>.
      Your personal Biological Age Report is attached as a PDF.</p>
      <p>Your estimate is a range of <strong>${result.low}–${result.high}</strong>, based on your lifestyle answers.
      It is an estimate, not a lab measurement. The blood and epigenetic tests in a wellness consultation give a lab-based picture.</p>
      ${qualified ? `<p>Our team will call you to go through your results. If you'd like to choose a time now,
      <a href="${escapeHtml(CLINIC.bookingUrl)}" style="color:#1a1a1a;font-weight:bold">book your free consultation</a>
      or call us on ${CLINIC.phone}.</p>` : ""}
      <p style="color:#5c5852;font-size:13px">${CLINIC.brand} · ${site.address}<br>
      ${CLINIC.phone} · ${CLINIC.email}</p>
    </div>`;

  return deliverReportToGhl({
    firstName,
    email,
    phone: lead.phone || "",
    pdf,
    fileName: `Biological-Age-Report-${safeName}.pdf`,
    subject: "Your Biological Age Report",
    emailHtml,
    noteBody: `Biological Age Report (estimate ${result.low}–${result.high}, calendar age ${result.chronologicalAge}): {url}`,
    source: "scan-flow",
  });
}
