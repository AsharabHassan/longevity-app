import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWebsiteLead, websiteLeadPayload, type WebsiteLeadEvent } from "./metaConversions";

const event: WebsiteLeadEvent = {
  eventId: "browser-shared-id", eventTime: 1790784844,
  emailHash: "a".repeat(64), phoneHash: "b".repeat(64), firstNameHash: "c".repeat(64),
  ip: "192.0.2.1", userAgent: "Synthetic test", fbc: "fb.1.1790784800000.test_click",
  fbp: "fb.1.1790784800000.12345",
};

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("website CAPI repair", () => {
  it("excludes assessment answers, qualification, lead_id and monetary values", () => {
    const payload = websiteLeadPayload({ ...event, concerns: "private health answer", location: "private clinic", value: 500 } as WebsiteLeadEvent);
    expect(payload.data[0]).toEqual({
      event_name: "Lead", event_time: event.eventTime, event_id: event.eventId,
      action_source: "website", event_source_url: "https://app.harleystreetmedicalwellness.clinic/quiz",
      custom_data: { currency: "GBP" },
      user_data: { em: [event.emailHash], ph: [event.phoneHash], fn: [event.firstNameHash],
        client_ip_address: event.ip, client_user_agent: event.userAgent, fbc: event.fbc, fbp: event.fbp },
    });
  });

  it("never transmits before activation and refuses incomplete configuration", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("META_WEBSITE_CAPI_ENABLED", "false");
    expect(await sendWebsiteLead(event)).toBe(false);
    vi.stubEnv("META_WEBSITE_CAPI_ENABLED", "true");
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "");
    expect(await sendWebsiteLead(event)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("omits malformed matching values rather than passing raw identifiers", () => {
    const data = websiteLeadPayload({ ...event, emailHash: "test@example.invalid", fbc: "invalid", fbp: "invalid" }).data[0].user_data;
    expect(data).not.toHaveProperty("em"); expect(data).not.toHaveProperty("fbc"); expect(data).not.toHaveProperty("fbp");
  });

  it("retries transient failure with the same browser event ID", async () => {
    vi.useFakeTimers();
    vi.stubEnv("META_WEBSITE_CAPI_ENABLED", "true");
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "synthetic-token");
    vi.stubEnv("META_CAPI_API_VERSION", "v25.0");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ error: { is_transient: true } }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ events_received: 1 }) });
    vi.stubGlobal("fetch", fetchMock);
    const delivery = sendWebsiteLead(event);
    await vi.runAllTimersAsync();
    expect(await delivery).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body));
    expect(bodies[0].data[0].event_id).toBe(event.eventId);
    expect(bodies[1]).toEqual(bodies[0]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://graph.facebook.com/v25.0/1613661453278984/events");
  });
});
