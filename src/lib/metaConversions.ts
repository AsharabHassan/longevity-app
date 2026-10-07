/** Website CAPI payload. Deliberately never forwards the CRM assessment payload. */
export const WELLNESS_PIXEL_ID = "1613661453278984";

export interface WebsiteLeadEvent {
  eventId: string;
  eventTime: number;
  emailHash: string;
  phoneHash: string;
  firstNameHash: string;
  ip: string;
  userAgent: string;
  fbc: string;
  fbp: string;
}

export function websiteLeadPayload(event: WebsiteLeadEvent) {
  const userData: Record<string, string | string[]> = {};
  for (const [key, value] of [
    ["em", event.emailHash], ["ph", event.phoneHash], ["fn", event.firstNameHash],
  ]) {
    if (/^[a-f0-9]{64}$/.test(value)) userData[key] = [value];
  }
  if (event.ip) userData.client_ip_address = event.ip;
  if (event.userAgent) userData.client_user_agent = event.userAgent;
  if (/^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(event.fbc)) userData.fbc = event.fbc;
  if (/^fb\.\d+\.\d+\.\d+$/.test(event.fbp)) userData.fbp = event.fbp;
  return {
    data: [{
      event_name: "Lead",
      event_time: event.eventTime,
      event_id: event.eventId,
      action_source: "website",
      // Fixed route excludes query strings, quiz answers and report information.
      event_source_url: "https://app.harleystreetmedicalwellness.clinic/quiz",
      custom_data: { currency: "GBP" },
      user_data: userData,
    }],
  };
}

/** Disabled until the old GHL CAPI action is retired and activation is approved. */
export async function sendWebsiteLead(event: WebsiteLeadEvent, testEventCode?: string): Promise<boolean> {
  if (process.env.META_WEBSITE_CAPI_ENABLED !== "true") return false;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const version = process.env.META_CAPI_API_VERSION;
  if (!token || !version || !/^v\d+\.\d+$/.test(version)) {
    console.error("Website CAPI configuration missing");
    return false;
  }
  const payload = websiteLeadPayload(event);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${version}/${WELLNESS_PIXEL_ID}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload, access_token: token,
            ...(testEventCode ? { test_event_code: testEventCode } : {}),
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const result = await response.json();
      if (response.ok && result.events_received === 1) return true;
      // Do not log payloads, access tokens, user data or Meta error messages.
      const transient = response.status === 429 || response.status >= 500 || result.error?.is_transient;
      if (!transient) {
        console.error("Website CAPI rejected", { status: response.status, code: result.error?.code });
        return false;
      }
    } catch {
      // Retry network failures with the same event ID to avoid extra conversions.
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
  }
  console.error("Website CAPI delivery failed after retries");
  return false;
}
