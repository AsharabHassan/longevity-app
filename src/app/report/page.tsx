"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Star, Stethoscope, Phone } from "lucide-react";
import AnalysisShow from "@/components/report/AnalysisShow";
import ScoreHero from "@/components/report/ScoreHero";
import DimensionBars from "@/components/report/DimensionBars";
import TreatmentPlan from "@/components/report/TreatmentPlan";
import ReportActions from "@/components/report/ReportActions";
import ClinicShowcase from "@/components/report/ClinicShowcase";
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

interface DeepDiveData {
  mechanism: string;
  agingImpact: string;
  treatmentConnection: string;
  timeline: string;
}

type ReportPhase = "analyzing" | "complete";

const DEEP_DIVE_STORAGE_KEY = "deepDives";

export default function ReportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<ReportPhase>("analyzing");
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Computed quiz data
  const [dimensions, setDimensions] = useState<DimensionScore[]>([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [biologicalAge, setBiologicalAge] = useState(0);
  const [chronologicalAge, setChronologicalAge] = useState(0);
  const [treatments, setTreatments] = useState<TreatmentRecommendation | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [location, setLocation] = useState("London");
  const [lowestDimension, setLowestDimension] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [deepDives, setDeepDives] = useState<Record<string, DeepDiveData>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  // Answers as record for streaming endpoint
  const [answersRecord, setAnswersRecord] = useState<
    Record<string, string | string[] | number>
  >({});

  // Pre-fetch dimension deep dives in batches to avoid API rate limits
  const prefetchDeepDives = useCallback(
    async (dims: DimensionScore[], quizAnswers: QuizAnswer[], bioAge: number, treatment: string) => {
      // Check sessionStorage cache first
      try {
        const cached = sessionStorage.getItem(DEEP_DIVE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as Record<string, DeepDiveData>;
          if (dims.every((d) => parsed[d.name])) {
            setDeepDives(parsed);
            return;
          }
        }
      } catch { /* ignore corrupt cache */ }

      const answersRec: Record<string, string | string[] | number> = {};
      for (const a of quizAnswers) {
        if (a.questionId) answersRec[a.questionId] = a.value;
      }

      // Start with any partially cached results from a previous visit
      let results: Record<string, DeepDiveData> = {};
      try {
        const cached = sessionStorage.getItem(DEEP_DIVE_STORAGE_KEY);
        if (cached) results = JSON.parse(cached);
      } catch { /* ignore */ }

      // Only fetch dimensions we don't already have cached
      const missing = dims.filter((d) => !results[d.name]);
      if (missing.length === 0) {
        setDeepDives(results);
        return;
      }

      const fetchOne = async (dim: DimensionScore): Promise<void> => {
        const MAX_RETRIES = 3;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const res = await fetch("/api/report/dimension", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dimensionName: dim.name,
                score: dim.score,
                answers: answersRec,
                biologicalAge: bioAge,
                recommendedTreatment: treatment,
              }),
            });
            if (res.ok) {
              results[dim.name] = await res.json();
              return;
            }
            if (res.status === 429 || res.status >= 500) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }
            return; // 4xx — don't retry
          } catch {
            if (attempt < MAX_RETRIES - 1) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
          }
        }
      };

      // Fetch one at a time to avoid rate limits
      for (const dim of missing) {
        await fetchOne(dim);
        // Save to cache + update state after EACH successful fetch
        try {
          sessionStorage.setItem(DEEP_DIVE_STORAGE_KEY, JSON.stringify(results));
        } catch { /* storage full */ }
        setDeepDives((prev) => ({ ...prev, ...results }));
      }
    },
    []
  );

  // Handle streaming analysis completion
  const handleAnalysisComplete = useCallback(
    (streamedReport: ReportData | null) => {
      if (streamedReport) {
        setReportData(streamedReport);
      }
      setPhase("complete");

      // If streaming didn't produce a report, fallback to the non-streaming endpoint
      if (!streamedReport) {
        fetchReportFallback();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Fallback: fetch report from non-streaming endpoint
  const fetchReportFallback = useCallback(async () => {
    try {
      const stored = sessionStorage.getItem("quizResults");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const answersRec: Record<string, string | string[] | number> = {};
      for (const a of (parsed.answers ?? [])) {
        if (a.questionId) answersRec[a.questionId] = a.value;
      }

      const rec = parsed.treatments ?? { primary: null, supporting: [] };

      const res = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRec,
          dimensions: (parsed.dimensions ?? []).map(
            (d: DimensionScore) => ({ name: d.name, score: d.score })
          ),
          wellnessScore: parsed.wellnessScore ?? 0,
          biologicalAge: parsed.biologicalAge ?? 0,
          chronologicalAge: parsed.chronologicalAge ?? 35,
          primaryTreatment: rec.primary?.name ?? "NAD+ IV Drip",
          supportingTreatments: (rec.supporting ?? []).map(
            (t: { name: string }) => t.name
          ),
        }),
      });
      const data: ReportData = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Fallback report generation failed:", err);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResults");
    if (!stored) {
      router.replace("/quiz");
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      const quizAnswers: QuizAnswer[] = parsed.answers ?? [];
      const dims: DimensionScore[] = parsed.dimensions ?? [];
      const ws: number = parsed.wellnessScore ?? 0;
      const ba: number = parsed.biologicalAge ?? 0;
      const ca: number = parsed.chronologicalAge ?? 35;
      const rec: TreatmentRecommendation = parsed.treatments ?? {
        primary: null,
        supporting: [],
      };

      setAnswers(quizAnswers);
      setChronologicalAge(ca);
      setDimensions(dims);
      setWellnessScore(ws);
      setBiologicalAge(ba);

      // Build answers record
      const record: Record<string, string | string[] | number> = {};
      for (const a of quizAnswers) {
        if (a.questionId) record[a.questionId] = a.value;
      }
      setAnswersRecord(record);

      // Parse lead data
      if (parsed.lead) {
        setLeadName(parsed.lead.firstName ?? "");
        setLeadEmail(parsed.lead.email ?? "");
        setLeadPhone(parsed.lead.phone ?? "");
      }

      // Determine location from answers
      const locAnswer = quizAnswers.find((a) => a.questionId === "q16");
      const loc =
        typeof locAnswer?.value === "string" &&
        locAnswer.value.includes("Glasgow")
          ? "Glasgow"
          : "London";
      setLocation(loc);

      // Find lowest dimension
      const sorted = [...dims].sort((a, b) => a.score - b.score);
      setLowestDimension(sorted[0]?.name ?? "Energy & Vitality");

      // Use pre-calculated treatments, or recalculate if missing
      let finalTreatment: TreatmentRecommendation;
      if (rec.primary) {
        finalTreatment = rec;
        setTreatments(rec);
      } else {
        const symptoms = quizAnswers.find((a) => a.questionId === "q10");
        const symptomList = Array.isArray(symptoms?.value)
          ? symptoms.value
          : [];
        finalTreatment = recommendTreatments(dims, symptomList as string[]);
        setTreatments(finalTreatment);
      }

      // Start pre-fetching all dimension deep dives in parallel
      // Runs during the analysis animation so they're ready when user sees the report
      prefetchDeepDives(dims, quizAnswers, ba, finalTreatment.primary?.name ?? "NAD+ IV Drip");

      setReady(true);
    } catch (err) {
      console.error("Failed to parse quiz data:", err);
      router.replace("/quiz");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted">Preparing your analysis...</p>
        </div>
      </div>
    );
  }

  /* ── Phase 1: Streaming Analysis Show ──────────────── */
  if (phase === "analyzing") {
    return (
      <main className="min-h-screen bg-bg">
        <AnalysisShow
          dimensions={dimensions}
          answers={answersRecord}
          wellnessScore={wellnessScore}
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          primaryTreatment={treatments?.primary?.name ?? "NAD+ IV Drip"}
          supportingTreatments={
            treatments?.supporting?.map((t) => t.name) ?? []
          }
          onComplete={handleAnalysisComplete}
        />
      </main>
    );
  }

  /* ── Phase 2: Full Report ──────────────────────────── */
  const scoreLabel = getScoreLabel(wellnessScore);
  const verdict = reportData?.verdict ?? "";

  return (
    <main className="relative min-h-screen bg-bg pb-24">
      {/* Ambient gradient mesh */}
      <div className="gradient-mesh" aria-hidden="true" />

      <div
        id="report-content"
        ref={reportRef}
        className="relative z-10 mx-auto max-w-[640px] px-5 py-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Harley Street Wellness"
            width={100}
            height={100}
          />
        </div>

        {/* Score Hero */}
        <ScoreHero
          wellnessScore={wellnessScore}
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          verdict={verdict}
          scoreLabel={scoreLabel}
        />

        {/* Patient Info Bar */}
        {leadName && (
          <div className="glass-card mt-6 p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted/60">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" /><path d="M2 12.5C2 10.5 4.2 9 7 9C9.8 9 12 10.5 12 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                <span className="text-white/80 font-medium">{leadName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" /><path d="M1.5 5L7 8.5L12.5 5" stroke="currentColor" strokeWidth="1.1" /></svg>
                <span>{leadEmail}</span>
              </div>
              {leadPhone && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2H5.5L6.5 5L5 6C5.6 7.5 6.5 8.5 8 9L9 7.5L12 8.5V11C12 11.6 11.6 12 11 12C6 12 2 8 2 3C2 2.4 2.4 2 3 2Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{leadPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clinic Trust Signals */}
        <div className="glass-card-gold mt-6 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 4V8C2 12 4.7 15.3 8 16C11.3 15.3 14 12 14 8V4L8 1Z" stroke="#D4A853" strokeWidth="1.2" />
              <path d="M6 8L7.5 9.5L10.5 6.5" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-bold tracking-[2px] text-gold uppercase">Verified Clinic</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Building2 size={16} strokeWidth={1.5} className="text-gold/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-white/80">1-5 Portpool Lane, London</p>
                <p className="text-[9px] text-muted/40">EC1N 7UU</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Star size={16} strokeWidth={1.5} className="text-gold/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-white/80">5.0 Rating</p>
                <p className="text-[9px] text-muted/40">200+ verified reviews</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Stethoscope size={16} strokeWidth={1.5} className="text-gold/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-white/80">GMC Registered Doctors</p>
                <p className="text-[9px] text-muted/40">Fully qualified clinicians</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone size={16} strokeWidth={1.5} className="text-gold/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-white/80">020 4628 3137</p>
                <p className="text-[9px] text-muted/40">hello@harleystreetwellness.co.uk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Interactive Dimension Bars */}
        <DimensionBars
          dimensions={dimensions}
          answers={answers}
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          recommendedTreatment={treatments?.primary?.name}
          prefetchedDeepDives={deepDives}
        />

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Treatment Plan */}
        {treatments && (
          <TreatmentPlan
            primary={treatments.primary}
            supporting={treatments.supporting}
            reportData={reportData}
          />
        )}

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Clinic Showcase: Hero, Video, Reviews */}
        <ClinicShowcase />

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Report Actions */}
        <ReportActions
          leadName={leadName}
          leadEmail={leadEmail}
          leadPhone={leadPhone}
          location={location}
          chronologicalAge={chronologicalAge}
          biologicalAge={biologicalAge}
          wellnessScore={wellnessScore}
          dimensions={dimensions}
          treatments={treatments}
          reportData={reportData}
          lowestDimension={lowestDimension}
        />
      </div>

    </main>
  );
}
