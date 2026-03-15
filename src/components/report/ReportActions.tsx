"use client";

import { Download, Calendar } from "lucide-react";
import { PixelEvents } from "@/lib/pixel";

interface ReportActionsProps {
  onDownloadPDF: () => void;
  location: string;
}

export default function ReportActions({
  onDownloadPDF,
  location,
}: ReportActionsProps) {
  return (
    <div className="animate-fade-in flex flex-col gap-3 sm:flex-row">
      {/* Download PDF — outlined */}
      <button
        onClick={() => {
          PixelEvents.downloadReport();
          onDownloadPDF();
        }}
        className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-gold/30 bg-transparent px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-gold transition-all hover:border-gold/50 hover:bg-[rgba(212,168,83,0.06)] active:scale-[0.98]"
      >
        <Download size={16} strokeWidth={2} />
        Download Full Report
      </button>

      {/* Book Consultation — solid gold */}
      <a
        href="#book"
        onClick={() => PixelEvents.bookingClick(location)}
        className="gold-gradient gold-glow flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-bg transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <Calendar size={16} strokeWidth={2} />
        Book Free Consultation
      </a>
    </div>
  );
}
