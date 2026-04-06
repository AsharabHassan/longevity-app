import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

const FB_PIXEL_ID = "779250835012098";

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

/**
 * Converts a dimension name to a GHL-friendly snake_case key.
 * e.g. "Sleep Quality" → "dim_sleep_quality"
 */
function dimKey(name: string): string {
  return "dim_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead, questionsWithAnswers } = body;

    // Generate unique event ID for deduplication between browser pixel & CAPI
    const eventId = randomUUID();
    const eventTime = Math.floor(Date.now() / 1000);

    // Extract client info for CAPI user_data
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const userAgent = req.headers.get("user-agent") || "";

    // ── Flatten dimensions into individual fields ──
    const dimensionFields: Record<string, string | number> = {};
    for (const d of body.dimensions || []) {
      const key = dimKey(d.name);
      dimensionFields[`${key}_score`] = d.score;
      dimensionFields[`${key}_label`] = d.label;
    }

    // ── Flatten treatments ──
    const primaryTreatment = body.treatments?.primary;
    const supportingTreatments = body.treatments?.supporting || [];

    // ── Flatten Q&A into individual fields ──
    const qaFields: Record<string, string | number> = {};
    for (const qa of questionsWithAnswers || []) {
      const qId = qa.questionId || "";
      const answer = Array.isArray(qa.answer)
        ? qa.answer.join(", ")
        : String(qa.answer ?? "");
      // e.g. q1_answer, q2_answer, q3_answer
      if (qId) {
        qaFields[`${qId}_question`] = qa.questionText || "";
        qaFields[`${qId}_answer`] = answer;
      }
    }

    // ── Preferred Location (from q16) ──
    const location =
      (questionsWithAnswers || []).find(
        (qa: { questionId: string }) => qa.questionId === "q16"
      )?.answer || "";

    // ── Build fully flat payload — every field mappable in GHL ──
    const flatPayload: Record<string, string | number> = {
      // ── Contact Info ──
      firstName: lead?.firstName || "",
      email: lead?.email || "",
      phone: lead?.phone || "",

      // ── Quiz Source ──
      source: body.source || "quiz",

      // ── Health Assessment Results ──
      wellness_score: body.wellnessScore ?? 0,
      biological_age: body.biologicalAge ?? 0,
      chronological_age: body.chronologicalAge ?? 0,

      // ── Flattened Dimensions ──
      // dim_sleep_quality_score, dim_sleep_quality_label,
      // dim_energy_vitality_score, dim_energy_vitality_label,
      // dim_stress_mental_wellness_score, dim_stress_mental_wellness_label,
      // dim_cognitive_function_score, dim_cognitive_function_label,
      // dim_metabolic_health_score, dim_metabolic_health_label,
      // dim_physical_activity_score, dim_physical_activity_label,
      // dim_immune_resilience_score, dim_immune_resilience_label,
      // dim_cellular_skin_health_score, dim_cellular_skin_health_label,
      ...dimensionFields,

      // ── Treatment Recommendations (flat) ──
      primary_treatment: primaryTreatment?.name || "",
      primary_treatment_price: primaryTreatment?.price || 0,
      supporting_treatment_1: supportingTreatments[0]?.name || "",
      supporting_treatment_1_price: supportingTreatments[0]?.price || 0,
      supporting_treatment_2: supportingTreatments[1]?.name || "",
      supporting_treatment_2_price: supportingTreatments[1]?.price || 0,

      // ── Flattened Quiz Q&A ──
      // q1_question, q1_answer, q2_question, q2_answer, etc.
      ...qaFields,

      // ── Preferred Location ──
      location: typeof location === "string" ? location : String(location),

      // ── Meta CAPI (flat) ──
      meta_pixel_id: FB_PIXEL_ID,
      meta_event_name: "Lead",
      meta_event_id: eventId,
      meta_event_time: eventTime,
      meta_event_source_url: body.page_url || "",
      meta_action_source: "website",
      meta_em: lead?.email ? sha256(lead.email) : "",
      meta_ph: lead?.phone ? sha256(lead.phone.replace(/\D/g, "")) : "",
      meta_fn: lead?.firstName ? sha256(lead.firstName) : "",
      meta_client_ip: ip,
      meta_client_ua: userAgent,
      meta_fbc: body.fbc || "",
      meta_fbp: body.fbp || "",
    };

    // Fire and forget — don't block the response
    sendWebhook(flatPayload).catch((err) =>
      console.error("Webhook ultimately failed:", err)
    );

    return NextResponse.json({ queued: true, event_id: eventId });
  } catch (error) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ queued: false }, { status: 500 });
  }
}
