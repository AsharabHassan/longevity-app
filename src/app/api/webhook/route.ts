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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead, answers, questionsWithAnswers, ...rest } = body;

    // Generate unique event ID for deduplication between browser pixel & CAPI
    const eventId = randomUUID();
    const eventTime = Math.floor(Date.now() / 1000);

    // Extract client info for CAPI user_data
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const userAgent = req.headers.get("user-agent") || "";
    const fbc = body.fbc || ""; // _fbc cookie value from client
    const fbp = body.fbp || ""; // _fbp cookie value from client

    // Build enriched payload for GHL
    const enrichedPayload = {
      ...rest,
      lead,

      // Full Q&A with question text
      questionsWithAnswers: questionsWithAnswers || [],

      // Raw answers preserved for backward compat
      answers,

      // ── Meta Conversion API fields ──
      meta_capi: {
        pixel_id: FB_PIXEL_ID,
        event_name: "Lead",
        event_id: eventId,
        event_time: eventTime,
        event_source_url: body.page_url || "",
        action_source: "website",
        user_data: {
          em: lead?.email ? sha256(lead.email) : "",
          ph: lead?.phone ? sha256(lead.phone.replace(/\D/g, "")) : "",
          fn: lead?.firstName ? sha256(lead.firstName) : "",
          client_ip_address: ip,
          client_user_agent: userAgent,
          fbc,
          fbp,
        },
      },
    };

    // Fire and forget — don't block the response
    sendWebhook(enrichedPayload).catch((err) =>
      console.error("Webhook ultimately failed:", err)
    );

    return NextResponse.json({ queued: true, event_id: eventId });
  } catch (error) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ queued: false }, { status: 500 });
  }
}
