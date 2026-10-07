"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EstimateHero from "@/components/report/EstimateHero";
import PersonalSummary from "@/components/report/PersonalSummary";
import ProtocolMatch from "@/components/report/ProtocolMatch";
import DriverTiles from "@/components/report/DriverTiles";
import WhatIfSimulator from "@/components/report/WhatIfSimulator";
import MeasurementGap from "@/components/report/MeasurementGap";
import BarrierBridge from "@/components/report/BarrierBridge";
import BookCTA from "@/components/report/BookCTA";
import DirectorCard from "@/components/report/DirectorCard";
import StickyBookBar from "@/components/report/StickyBookBar";
import ClinicPathway from "@/components/report/ClinicPathway";
import ConcernBridge from "@/components/report/ConcernBridge";
import ConsultationCard from "@/components/report/ConsultationCard";
import ClinicShowcase from "@/components/report/ClinicShowcase";
import ConsultationIncludes from "@/components/shared/ConsultationIncludes";
import ReportActions from "@/components/report/ReportActions";
import { CLINIC, type ClinicLocation } from "@/lib/clinic";
import { DISCLAIMER } from "@/lib/evidence";
import { calculateLifestyleAge, topDrivers } from "@/lib/lifestyleAge";
import { matchProtocols, type Protocol } from "@/lib/protocols";
import { QUIZ_VERSION, isQualified } from "@/lib/questions";
import type { LeadData, LifestyleAgeResult, QuizAnswer } from "@/lib/types";
import { PixelEvents } from "@/lib/pixel";

function Divider() {
  return <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />;
}

export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<LifestyleAgeResult | null>(null);
  const [lead, setLead] = useState<LeadData>({ firstName: "", email: "", phone: "" });
  const [location, setLocation] = useState<ClinicLocation>("London");
  // False when they said they would not invest £500: the report then makes no offer at all
  const [qualified, setQualified] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("quizResults");
      if (!stored) throw new Error("No quiz results");
      const parsed = JSON.parse(stored) as { version?: number; answers?: QuizAnswer[]; lead?: LeadData; location?: ClinicLocation };
      if (parsed.version !== QUIZ_VERSION || !parsed.answers?.length) throw new Error("No usable answers");

      // Recompute from the answers so the report never shows a stale or tampered number
      const computed = calculateLifestyleAge(parsed.answers);
      setResult(computed);
      setProtocols(matchProtocols(parsed.answers, computed));
      setQualified(isQualified(parsed.answers));
      if (parsed.lead) setLead(parsed.lead);
      if (parsed.location === "Glasgow") setLocation("Glasgow");
      if (!isQualified(parsed.answers) && sessionStorage.getItem("pendingUnqualifiedLead") === "1") {
        sessionStorage.removeItem("pendingUnqualifiedLead");
        PixelEvents.unqualifiedLead();
      }
    } catch {
      sessionStorage.removeItem("quizResults");
      sessionStorage.removeItem("pendingUnqualifiedLead");
      router.replace("/quiz");
    }
  }, [router]);

  // One "report viewed" signal per visit, so retargeting can find people who saw it and did not book
  useEffect(() => {
    if (result) PixelEvents.reportViewed();
  }, [result]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-12 w-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg pb-24">
      <div className="gradient-mesh" aria-hidden="true" />

      <div id="report-content" className="relative z-10 mx-auto max-w-[640px] px-5 py-10">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt={CLINIC.brand} width={100} height={100} />
        </div>

        <EstimateHero result={result} firstName={lead.firstName} />
        <PersonalSummary result={result} firstName={lead.firstName} qualified={qualified} />

        {qualified && (
          <>
            <DirectorCard firstName={lead.firstName} />
            <BookCTA />
            <ConsultationIncludes className="mt-8" />
          </>
        )}

        <Divider />
        <DriverTiles result={result} />

        {result.factors.some((f) => f.improvement) && (
          <>
            <Divider />
            <WhatIfSimulator result={result} />
          </>
        )}

        {qualified && topDrivers(result).length > 0 && (
          <>
            <Divider />
            <BarrierBridge result={result} />
            <BookCTA lead="Finding the reason is what the consultation is for." />
          </>
        )}

        {result.concerns.length > 0 && (
          <>
            <Divider />
            <ConcernBridge concerns={result.concerns} />
          </>
        )}

        {qualified && protocols.length > 0 && (
          <>
            <Divider />
            <ProtocolMatch protocols={protocols} concerns={result.concerns} location={location} lead={lead} />
          </>
        )}

        {qualified && (
          <>
            <Divider />
            <MeasurementGap />

            <Divider />
            <ClinicPathway />

            <Divider />
            <ConsultationCard result={result} lead={lead} location={location} />

            <Divider />
            <ClinicShowcase location={location} />
          </>
        )}

        <Divider />
        <ReportActions result={result} lead={lead} location={location} qualified={qualified} protocols={protocols} />

        <p className="mt-10 text-[10.5px] leading-relaxed text-muted/40">{DISCLAIMER}</p>
      </div>

      {qualified && <StickyBookBar />}
    </main>
  );
}
