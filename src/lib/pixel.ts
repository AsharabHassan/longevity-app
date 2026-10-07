declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, data?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data ?? {}, ...(eventId ? [{ eventID: eventId }] : []));
  }
}

export function trackCustomEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", event, data);
  }
}

/** Read Meta _fbc / _fbp cookies for Conversion API deduplication */
export function getMetaCookies(): { fbc: string; fbp: string } {
  if (typeof document === "undefined") return { fbc: "", fbp: "" };
  const cookies = document.cookie.split("; ");
  const get = (name: string) =>
    cookies.find((c) => c.startsWith(`${name}=`))?.split("=")[1] ?? "";
  return { fbc: get("_fbc"), fbp: get("_fbp") };
}

export const PixelEvents = {
  startQuiz: () => trackCustomEvent("StartQuiz"),
  quizComplete: () => trackCustomEvent("QuizComplete"),
  lead: (eventId: string) => trackEvent("Lead", { currency: "GBP" }, eventId),
  // A separate standard event keeps the qualified Lead optimization clean.
  unqualifiedLead: () => trackEvent("CompleteRegistration"),
  downloadReport: () => trackCustomEvent("DownloadReport"),
  chatStarted: () => trackCustomEvent("ChatStarted"),
  bookingClick: (location: string) =>
    trackCustomEvent("BookingClick", { location }),
  // The report was shown. Gives retargeting an audience of "saw the report, did not book".
  // No answers, scores or concerns are sent: only the fact that the page loaded.
  reportViewed: () => trackEvent("ViewContent", { content_name: "report" }),
  // A consultation was actually booked in the calendar.
  schedule: () => trackEvent("Schedule", {}),
} as const;
