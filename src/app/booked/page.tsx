"use client";

import { useEffect } from "react";
import { CLINIC } from "@/lib/clinic";
import { PixelEvents } from "@/lib/pixel";

/**
 * Confirmation shown after the calendar booking. In the booking calendar's settings, set the
 * "redirect after booking" URL to this page: it is the dependable signal that a consultation
 * was booked, and it fires the Meta "Schedule" event once.
 */
export default function BookedPage() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("scheduleFired") === "1") return;
      sessionStorage.setItem("scheduleFired", "1");
    } catch {
      // storage blocked inside the embedded calendar: fire anyway, the page loads once per booking
    }
    // The pixel script loads after the page, so wait a moment for it to be ready
    const timer = window.setTimeout(() => PixelEvents.schedule(), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-10 text-center">
      <div className="max-w-sm animate-fade-in">
        <h1 className="font-heading text-2xl font-bold text-white">Your consultation is booked</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted/70">
          Thank you. Our team will be in touch to confirm the details. If you need to change anything, call us on{" "}
          {CLINIC.phone}.
        </p>
      </div>
    </main>
  );
}
