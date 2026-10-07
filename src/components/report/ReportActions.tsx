"use client";

import { useState } from "react";
import { Download, Loader2, Mail, Check } from "lucide-react";
import { PixelEvents } from "@/lib/pixel";
import { topDrivers } from "@/lib/lifestyleAge";
import LongevityCard from "./LongevityCard";
import type { Protocol } from "@/lib/protocols";
import type { LeadData, LifestyleAgeResult } from "@/lib/types";

interface ReportActionsProps {
  result: LifestyleAgeResult;
  lead: LeadData;
  location: string;
  /** When false the report makes no offer, so the email-plan follow-up is hidden too. */
  qualified: boolean;
  protocols: Protocol[];
}

export default function ReportActions({ result, lead, location, qualified, protocols }: ReportActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent">("idle");

  const handleDownload = async () => {
    setDownloading(true);
    PixelEvents.downloadReport();
    try {
      const res = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, lead, location, qualified, protocols }),
      });
      if (!res.ok) throw new Error("PDF generation failed");

      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `Biological-Age-Report-${lead.firstName || "Report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // For people not ready to book: flags the contact in the CRM so the follow-up sequence can send the plan
  const handleEmailPlan = async () => {
    setEmailState("sending");
    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email_plan",
        lead,
        location,
        topDriver: topDrivers(result, 1)[0]?.id ?? "none",
      }),
    }).catch(() => {});
    setEmailState("sent");
  };

  const topDriver = topDrivers(result, 1)[0]?.name.toLowerCase();

  return (
    <section className="animate-fade-in space-y-3">
      {qualified && (
        <div className="glass-card px-5 py-4 text-center">
          <p className="text-sm font-semibold text-white">Not ready to book?</p>
          <p className="mt-1 text-[12.5px] text-muted/60">
            We&apos;ll email your report{topDriver ? ` with a simple 7-day plan for ${topDriver}` : " with a simple 7-day plan"}.
          </p>
          <button
            onClick={handleEmailPlan}
            disabled={emailState !== "idle"}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 px-5 py-2.5 font-heading text-sm font-bold text-gold transition-all hover:bg-[rgba(212,168,83,0.06)] disabled:opacity-60"
          >
            {emailState === "sent" ? <Check size={15} /> : emailState === "sending" ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {emailState === "sent" ? `Requested for ${lead.email}` : "Email it to me"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-transparent px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-white transition-all hover:border-gold/30 hover:bg-[rgba(212,168,83,0.06)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 size={16} strokeWidth={2} className="animate-spin" /> : <Download size={16} strokeWidth={2} />}
          {downloading ? "Generating PDF..." : "Download Report"}
        </button>
        <LongevityCard result={result} />
      </div>
    </section>
  );
}
