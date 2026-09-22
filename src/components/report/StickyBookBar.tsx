"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { CLINIC, bookingLabel } from "@/lib/clinic";

/** Keeps booking one tap away on mobile; steps aside at the top of the page and once the calendar is on screen. */
export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const book = document.getElementById("book")?.getBoundingClientRect();
      const calendarInView = book ? book.top < window.innerHeight && book.bottom > 0 : false;
      setVisible(window.scrollY > 600 && !calendarInView);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-bg/95 px-4 py-3 backdrop-blur-md animate-fade-in">
      <div className="mx-auto flex max-w-[640px] items-center gap-3">
        <p className="min-w-0 flex-1 text-[11.5px] leading-snug text-muted/70">
          Free {CLINIC.consultation.minutes}-minute consultation
          <br />
          <span className="text-muted/40">No obligation</span>
        </p>
        <a
          href="#book"
          className="gold-gradient flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 font-heading text-[13px] font-bold text-bg active:scale-[0.98]"
        >
          <Calendar size={15} strokeWidth={2} />
          {bookingLabel()}
        </a>
      </div>
    </div>
  );
}
