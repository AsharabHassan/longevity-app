"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ScoreHero from "@/components/report/ScoreHero";
import DimensionBars from "@/components/report/DimensionBars";
import TreatmentPlan from "@/components/report/TreatmentPlan";
import ReportActions from "@/components/report/ReportActions";
import ChatWidget from "@/components/chatbot/ChatWidget";
import {
  calculateDimensionScores,
  calculateWellnessScore,
  calculateBiologicalAge,
  getScoreLabel,
} from "@/lib/scoring";
import { recommendTreatments } from "@/lib/treatments";
import type {
  QuizAnswer,
  DimensionScore,
  TreatmentRecommendation,
  ReportData,
} from "@/lib/types";

/* ---------- Loading Skeleton ---------- */
function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-[640px] space-y-10 px-5 py-12 animate-pulse">
      {/* Score ring placeholder */}
      <div className="flex flex-col items-center gap-4">
        <div className="h-40 w-40 rounded-full border-4 border-white/5" />
        <div className="h-3 w-48 rounded bg-white/5" />
      </div>
      {/* Dimension bars placeholder */}
      <div className="space-y-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="h-3 w-8 rounded bg-white/5" />
            </div>
            <div className="h-1 w-full rounded bg-white/5" />
          </div>
        ))}
      </div>
      {/* Treatment placeholder */}
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-white/5" />
        <div className="h-32 w-full rounded-2xl bg-white/5" />
        <div className="h-20 w-full rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);

  // Computed quiz data
  const [dimensions, setDimensions] = useState<DimensionScore[]>([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [biologicalAge, setBiologicalAge] = useState(0);
  const [chronologicalAge, setChronologicalAge] = useState(0);
  const [treatments, setTreatments] = useState<TreatmentRecommendation | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [location, setLocation] = useState("London");
  const [lowestDimension, setLowestDimension] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(
    async (
      ans: QuizAnswer[],
      dims: DimensionScore[],
      ws: number,
      ba: number,
      ca: number,
      rec: TreatmentRecommendation
    ) => {
      try {
        const res = await fetch("/api/report/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: ans,
            dimensions: dims,
            wellnessScore: ws,
            biologicalAge: ba,
            chronologicalAge: ca,
            primaryTreatment: rec.primary.name,
            supportingTreatments: rec.supporting.map((t) => t.name),
          }),
        });
        const data: ReportData = await res.json();
        setReportData(data);
      } catch (err) {
        console.error("Failed to generate AI report:", err);
      } finally {
        setLoadingReport(false);
      }
    },
    []
  );

  useEffect(() => {
    // Read quiz data from sessionStorage
    const stored = sessionStorage.getItem("quizData");
    if (!stored) {
      router.replace("/quiz");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const quizAnswers: QuizAnswer[] = parsed.answers ?? [];
      const age: number = parsed.age ?? 35;
      const loc: string = parsed.location ?? "London";

      setAnswers(quizAnswers);
      setChronologicalAge(age);
      setLocation(loc);

      // Calculate scores
      const dims = calculateDimensionScores(quizAnswers);
      const ws = calculateWellnessScore(dims);
      const ba = calculateBiologicalAge(age, ws);

      setDimensions(dims);
      setWellnessScore(ws);
      setBiologicalAge(ba);

      // Find lowest dimension
      const sorted = [...dims].sort((a, b) => a.score - b.score);
      setLowestDimension(sorted[0]?.name ?? "Energy & Vitality");

      // Recommend treatments
      const symptoms: string[] = parsed.symptoms ?? [];
      const rec = recommendTreatments(dims, symptoms);
      setTreatments(rec);

      setReady(true);

      // Fetch AI narratives
      fetchReport(quizAnswers, dims, ws, ba, age, rec);
    } catch (err) {
      console.error("Failed to parse quiz data:", err);
      router.replace("/quiz");
    }
  }, [router, fetchReport]);

  const handleDownloadPDF = useCallback(async () => {
    const element = reportRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: "longevity-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#0A0A0A",
          useCORS: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  }, []);

  if (!ready) {
    return <ReportSkeleton />;
  }

  const scoreLabel = getScoreLabel(wellnessScore);
  const verdict = reportData?.verdict ?? "";

  return (
    <main className="min-h-screen bg-bg pb-24">
      <div
        id="report-content"
        ref={reportRef}
        className="mx-auto max-w-[640px] px-5 py-10"
      >
        {/* Score Hero */}
        <ScoreHero
          wellnessScore={wellnessScore}
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          verdict={verdict}
          scoreLabel={scoreLabel}
        />

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Dimension Bars */}
        <DimensionBars dimensions={dimensions} />

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Treatment Plan */}
        {treatments && (
          <>
            {loadingReport ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-40 rounded bg-white/5" />
                <div className="h-40 w-full rounded-2xl bg-white/5" />
              </div>
            ) : (
              <TreatmentPlan
                primary={treatments.primary}
                supporting={treatments.supporting}
                reportData={reportData}
              />
            )}
          </>
        )}

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Report Actions */}
        <ReportActions onDownloadPDF={handleDownloadPDF} location={location} />
      </div>

      {/* Chat Widget */}
      <ChatWidget
        context={{
          answers,
          wellnessScore,
          biologicalAge,
          treatments: treatments
            ? [
                treatments.primary.name,
                ...treatments.supporting.map((t) => t.name),
              ]
            : [],
        }}
        lowestDimension={lowestDimension}
      />
    </main>
  );
}
