declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
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
  lead: (value?: number) =>
    trackEvent("Lead", value ? { value, currency: "GBP" } : undefined),
  downloadReport: () => trackCustomEvent("DownloadReport"),
  chatStarted: () => trackCustomEvent("ChatStarted"),
  bookingClick: (location: string) =>
    trackCustomEvent("BookingClick", { location }),
} as const;
