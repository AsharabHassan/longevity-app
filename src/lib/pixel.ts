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
