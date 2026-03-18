"use client";

import { useState } from "react";
import { Download, Calendar, Loader2 } from "lucide-react";
import { PixelEvents } from "@/lib/pixel";
import LongevityCard from "./LongevityCard";
import type { DimensionScore, TreatmentRecommendation, ReportData } from "@/lib/types";

interface ReportActionsProps {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  location: string;
  chronologicalAge: number;
  biologicalAge: number;
  wellnessScore: number;
  dimensions: DimensionScore[];
  treatments: TreatmentRecommendation | null;
  reportData: ReportData | null;
  lowestDimension: string;
}

export default function ReportActions(props: ReportActionsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    PixelEvents.downloadReport();

    try {
      const res = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: props.leadName,
          leadEmail: props.leadEmail,
          leadPhone: props.leadPhone,
          wellnessScore: props.wellnessScore,
          biologicalAge: props.biologicalAge,
          chronologicalAge: props.chronologicalAge,
          dimensions: props.dimensions.map((d) => ({
            name: d.name,
            score: d.score,
          })),
          treatments: props.treatments
            ? {
                primary: {
                  name: props.treatments.primary.name,
                  description: props.treatments.primary.description,
                },
                supporting: props.treatments.supporting.map((s) => ({
                  name: s.name,
                  description: s.description,
                })),
              }
            : null,
          reportData: props.reportData,
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Longevity-Scan-${props.leadName || "Report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not generate your PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Download PDF */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-gold/30 bg-transparent px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-gold transition-all hover:border-gold/50 hover:bg-[rgba(212,168,83,0.06)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 size={16} strokeWidth={2} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} strokeWidth={2} />
              Download Report
            </>
          )}
        </button>

        {/* Book Free Consultation */}
        <a
          href="https://calendly.com/harleystreet-wellness/free-consultation"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => PixelEvents.bookingClick(props.location)}
          className="gold-gradient gold-glow flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-bg transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Calendar size={16} strokeWidth={2} />
          Book Free Online Consultation
        </a>
      </div>

      {/* Longevity Card Share */}
      <LongevityCard
        chronologicalAge={props.chronologicalAge}
        biologicalAge={props.biologicalAge}
        topTimeThief={props.lowestDimension}
        wellnessScore={props.wellnessScore}
      />
    </div>
  );
}
