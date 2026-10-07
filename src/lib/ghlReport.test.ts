import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverReportToGhl } from "./ghlReport";

const fetchMock = vi.fn();
const input = {
  firstName: "Jane",
  email: "jane@example.com",
  phone: "07700900123",
  pdf: Buffer.from("%PDF-1.3\nreport"),
  fileName: "Biological-Age-Report-Jane.pdf",
  subject: "Your Biological Age Report",
  emailHtml: "<p>Your report</p>",
  noteBody: "Biological Age Report: {url}",
  source: "scan-flow",
};

beforeEach(() => {
  process.env.GHL_API_TOKEN = "test-token";
  process.env.GHL_LOCATION_ID = "test-location";
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GHL_API_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  delete process.env.GHL_REPORT_FIELD_KEY;
});

describe("deliverReportToGhl", () => {
  it("uploads the PDF, writes the link to the custom field, notes it and emails it as an attachment", async () => {
    process.env.GHL_REPORT_FIELD_KEY = "report_pdf";
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://cdn.example/report.pdf" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ contact: { id: "contact-1" } })))
      .mockResolvedValueOnce(new Response("{}"))
      .mockResolvedValueOnce(new Response("{}"));

    const result = await deliverReportToGhl(input);

    expect(result).toEqual({ ok: true, fileUrl: "https://cdn.example/report.pdf", contactId: "contact-1", emailed: true, noted: true });
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      "https://services.leadconnectorhq.com/medias/upload-file",
      "https://services.leadconnectorhq.com/contacts/upsert",
      "https://services.leadconnectorhq.com/contacts/contact-1/notes",
      "https://services.leadconnectorhq.com/conversations/messages",
    ]);
    const upsert = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(upsert.customFields).toEqual([{ key: "report_pdf", field_value: "https://cdn.example/report.pdf" }]);
    expect(upsert.email).toBe("jane@example.com");
    const note = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(note.body).toBe("Biological Age Report: https://cdn.example/report.pdf");
    const email = JSON.parse(fetchMock.mock.calls[3][1].body);
    expect(email).toMatchObject({ type: "Email", contactId: "contact-1", attachments: ["https://cdn.example/report.pdf"] });
  });

  it("skips without calling GHL when the credentials are missing", async () => {
    delete process.env.GHL_API_TOKEN;
    expect(await deliverReportToGhl(input)).toEqual({ ok: false, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops when the upload fails, without creating a contact or sending an email", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));
    expect(await deliverReportToGhl(input)).toEqual({ ok: false, error: "media-upload 401" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports emailed: false when GHL rejects the email, but keeps the link on the contact", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://cdn.example/report.pdf" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ contact: { id: "contact-1" } })))
      .mockResolvedValueOnce(new Response("{}"))
      .mockResolvedValueOnce(new Response("no sender", { status: 400 }));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deliverReportToGhl(input);
    expect(result).toMatchObject({ ok: true, emailed: false, noted: true });
  });
});
