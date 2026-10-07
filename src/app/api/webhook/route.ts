import { after, NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { topDrivers } from "@/lib/lifestyleAge";
import type { LeadData, LifestyleAgeResult } from "@/lib/types";
import { sendWebsiteLead } from "@/lib/metaConversions";
import { cleanAdCode } from "@/lib/adHeadlines";
import { emailReport } from "@/lib/reportEmail";

const FB_PIXEL_ID = "1613661453278984";

/** SHA-256 hash helper for Meta CAPI user data */
function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

async function sendWebhook(
  payload: Record<string, unknown>,
  attempt = 1
): Promise<boolean> {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.warn("GHL_WEBHOOK_URL not configured — skipping webhook");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
    return true;
  } catch (error) {
    console.error(`Webhook attempt ${attempt} failed:`, error);
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      return sendWebhook(payload, attempt + 1);
    }
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead: Partial<LeadData> = body.lead ?? {};

    // "Email me my report" request from the report page: tag the existing contact
    if (body.type === "email_plan") {
      sendWebhook({
        firstName: lead.firstName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        source: "report-email-plan",
        report_email_requested: "yes",
        top_driver_1: body.topDriver || "",
        location: body.location || "",
      }).catch((err) => console.error("Webhook ultimately failed:", err));
      return NextResponse.json({ queued: true });
    }

    // Topics they tapped in the report's "what would you like to discuss" picker
    if (body.type === "interests") {
      sendWebhook({
        firstName: lead.firstName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        source: "report-discussion-topics",
        consultation_interests: Array.isArray(body.interests) ? body.interests.join(", ") : "",
        location: body.location || "",
      }).catch((err) => console.error("Webhook ultimately failed:", err));
      return NextResponse.json({ queued: true });
    }

    // Answers include health information, so nothing is sent without the consent tick
    if (body.consent !== true) {
      return NextResponse.json({ queued: false, error: "Consent required" }, { status: 400 });
    }

    const result: LifestyleAgeResult = body.result;
    const questionsWithAnswers: { questionId: string; questionText: string; answer: string }[] =
      body.questionsWithAnswers || [];

    // Generate unique event ID for deduplication between browser pixel & CAPI
    const eventId = randomUUID();
    const eventTime = Math.floor(Date.now() / 1000);

    // Extract client info for CAPI user_data
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const userAgent = req.headers.get("user-agent") || "";

    // ── Flatten factors: factor_sleep_years, factor_sleep_answer, ... ──
    const factorFields: Record<string, string | number> = {};
    for (const f of result?.factors || []) {
      factorFields[`factor_${f.id}_years`] = f.years;
      factorFields[`factor_${f.id}_answer`] = f.answerLabel;
    }
    const drivers = result ? topDrivers(result) : [];

    // ── Flatten Q&A: age_question, age_answer, smoking_question, ... ──
    const qaFields: Record<string, string> = {};
    for (const qa of questionsWithAnswers) {
      if (!qa.questionId) continue;
      qaFields[`${qa.questionId}_question`] = qa.questionText || "";
      qaFields[`${qa.questionId}_answer`] = String(qa.answer ?? "");
    }

    // ── Build fully flat payload — every field mappable in GHL ──
    const flatPayload: Record<string, string | number> = {
      // ── Contact Info ──
      firstName: lead.firstName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      consent_given: "yes",

      // "no" = said they would not invest £500; the report showed them no offer
      lead_qualified: body.qualified === false ? "no" : "yes",

      // ── Quiz Source ──
      source: body.source || "quiz",
      // Neutral ad code from the link (E1, E2...). Goes to the CRM only, never to Meta.
      ad_code: cleanAdCode(body.ad_code),

      // ── Lifestyle Age Estimate (a questionnaire estimate, not a measurement) ──
      lifestyle_age_estimate: result?.estimate ?? 0,
      lifestyle_age_low: result?.low ?? 0,
      lifestyle_age_high: result?.high ?? 0,
      lifestyle_offset_years: result?.offsetYears ?? 0,
      chronological_age: result?.chronologicalAge ?? 0,

      ...factorFields,

      // ── What to talk about on the call ──
      top_driver_1: drivers[0]?.name || "",
      top_driver_2: drivers[1]?.name || "",
      top_driver_3: drivers[2]?.name || "",
      concerns: (result?.concerns || []).join(", "),
      suggested_protocol_1: body.protocols?.[0] || "",
      suggested_protocol_2: body.protocols?.[1] || "",

      ...qaFields,

      // ── Preferred Location ──
      location: body.location || "",

      // ── Meta CAPI (flat) ──
      meta_pixel_id: FB_PIXEL_ID,
      meta_event_name: body.qualified === false ? "" : "Lead",
      meta_event_id: eventId,
      meta_event_time: eventTime,
      meta_event_source_url: body.page_url || "",
      meta_action_source: "website",
      meta_em: lead.email ? sha256(lead.email) : "",
      meta_ph: lead.phone ? sha256(lead.phone.replace(/\D/g, "")) : "",
      meta_fn: lead.firstName ? sha256(lead.firstName) : "",
      meta_client_ip: ip,
      meta_client_ua: userAgent,
      meta_fbc: body.fbc || "",
      meta_fbp: body.fbp || "",
    };

    const delivered = await sendWebhook(flatPayload);
    if (!delivered) {
      return NextResponse.json(
        { delivered: false, error: "Unable to save your assessment. Please try again." },
        { status: 502 }
      );
    }

    // Email the patient their report and put the PDF link on their GHL contact.
    // Runs after the response so the patient isn't kept waiting on the upload.
    after(async () => {
      const report = await emailReport({
        lead,
        result,
        location: body.location === "Glasgow" ? "Glasgow" : "London",
        qualified: body.qualified !== false,
        answers: Array.isArray(body.answers) ? body.answers : [],
      });
      if (report.skipped) console.warn("Report email skipped:", report.error ?? "GHL_API_TOKEN / GHL_LOCATION_ID not set");
      else if (!report.ok) console.error("Report delivery failed:", report.error);
      else if (!report.emailed) console.error("Report uploaded to GHL but the email was not sent");
    });

    // Only a saved, qualified assessment sends a website Lead. GHL remains the
    // contact/assessment destination; Meta receives a separate allowlisted payload.
    if (body.qualified !== false && process.env.META_WEBSITE_CAPI_ENABLED === "true") {
      after(() => sendWebsiteLead({
        eventId,
        eventTime,
        emailHash: String(flatPayload.meta_em),
        phoneHash: String(flatPayload.meta_ph),
        firstNameHash: String(flatPayload.meta_fn),
        ip,
        userAgent,
        fbc: typeof body.fbc === "string" ? body.fbc : "",
        fbp: typeof body.fbp === "string" ? body.fbp : "",
      }).then(() => undefined));
    }

    return NextResponse.json({ delivered: true, event_id: eventId });
  } catch (error) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ queued: false }, { status: 500 });
  }
}
