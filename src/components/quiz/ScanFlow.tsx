"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Zap, Brain, Clock, Shield, Droplets, Sparkles, Activity, Target, Lock } from "lucide-react";
import { FIXED_QUESTIONS } from "@/lib/questions";
import { findCaseStudy, type CaseStudy } from "@/lib/caseStudies";
import type { QuizAnswer, LeadData, Question } from "@/lib/types";
import {
  calculateDimensionScores,
  calculateWellnessScore,
  calculateBiologicalAge,
} from "@/lib/scoring";
import { recommendTreatments } from "@/lib/treatments";
import { PixelEvents } from "@/lib/pixel";

// ── Micro-reveals injected after specific questions ──────
const MICRO_REVEALS: Record<string, { title: string; text: string }> = {
  q1: {
    title: "Did you know?",
    text: "After age 30, your NAD+ levels — the molecule that powers every cell — drop roughly 50% per decade. This single decline accelerates aging across your entire body.",
  },
  q6: {
    title: "Scan Finding",
    text: "Deep sleep is when your glymphatic system flushes neurotoxins at 10× the daytime rate. Poor sleep quality means cellular debris accumulates — accelerating brain aging by years.",
  },
  q9: {
    title: "Scan Finding",
    text: "Chronic stress triggers a cortisol-telomere feedback loop. Your telomeres — the protective caps on your DNA — literally shorten faster under sustained stress, aging your cells from the inside.",
  },
  q10: {
    title: "Your Profile",
    text: "The symptoms you selected form a pattern. Our AI will map these to specific biological systems to identify the root drivers — not just the surface complaints.",
  },
};

// ── Curated 9-question sequence ──────────────────────────
// Covers all critical dimensions for accurate scoring + treatment matching.
// Keeps it under 3 minutes. No redundancy. Each question feeds scored dimensions.
const QUIZ_SEQUENCE: Question[] = [
  // 1. Age (needed for biological age calculation)
  FIXED_QUESTIONS.find((q) => q.id === "q1")!,
  // 2. Health goal (drives treatment recommendation context)
  FIXED_QUESTIONS.find((q) => q.id === "q3")!,
  // 3. Energy levels (Energy & Vitality dimension — 15% weight)
  FIXED_QUESTIONS.find((q) => q.id === "q4")!,
  // 4. Sleep quality (Sleep Quality dimension — 17% weight, highest)
  {
    id: "q5",
    phase: 2,
    text: "How would you describe your sleep?",
    subtext: "Think about a typical week",
    type: "single" as const,
    options: [
      { label: "Terrible — under 6 hours, wake frequently", score: 0 },
      { label: "Poor — light, restless, not refreshing", score: 1 },
      { label: "Okay — 6-7 hours, some disruptions", score: 2 },
      { label: "Good — 7-8 hours, mostly solid", score: 3 },
      { label: "Great — wake refreshed and energised", score: 4 },
    ],
  },
  // 5. Exercise (Physical Activity dimension — 12% weight)
  FIXED_QUESTIONS.find((q) => q.id === "q7")!,
  // 6. Diet (Metabolic Health dimension — 12% weight)
  FIXED_QUESTIONS.find((q) => q.id === "q8")!,
  // 7. Stress (Stress & Mental Wellness dimension — 14% weight)
  FIXED_QUESTIONS.find((q) => q.id === "q9")!,
  // 8. Symptoms (most valuable — drives adaptive scoring + symptom→dimension mapping)
  FIXED_QUESTIONS.find((q) => q.id === "q10")!,
  // 9. Location (needed for booking)
  FIXED_QUESTIONS.find((q) => q.id === "q16")!,
];

type Phase = "quiz" | "lead_capture" | "processing";

export default function ScanFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [showReveal, setShowReveal] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<{ title: string; text: string } | null>(null);
  const [pendingCaseStudy, setPendingCaseStudy] = useState<CaseStudy | null>(null);
  const [shownCaseStudyIds] = useState<Set<string>>(new Set());
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [numericValue, setNumericValue] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [leadData, setLeadData] = useState<LeadData>({ firstName: "", email: "", phone: "" });
  const containerRef = useRef<HTMLDivElement>(null);
  const firedStart = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!firedStart.current) {
      PixelEvents.startQuiz();
      firedStart.current = true;
    }
  }, []);

  // Focus numeric input when on a numeric question
  useEffect(() => {
    const q = QUIZ_SEQUENCE[currentIndex];
    if (q?.type === "numeric" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const totalQuestions = QUIZ_SEQUENCE.length;
  const progress = ((currentIndex) / totalQuestions) * 100;
  const question = QUIZ_SEQUENCE[currentIndex];

  // Record answer and advance
  const recordAndAdvance = useCallback(
    (questionId: string, value: string | string[] | number, score: number) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, { questionId, value, score });
        return next;
      });

      // Check for case study first (takes priority over micro-reveals)
      const caseStudy = findCaseStudy(questionId, value, shownCaseStudyIds);
      if (caseStudy) {
        shownCaseStudyIds.add(`${caseStudy.name}-${caseStudy.treatment}`);
        setPendingCaseStudy(caseStudy);
        return;
      }

      // Check for micro-reveal
      const reveal = MICRO_REVEALS[questionId];
      if (reveal) {
        setPendingReveal(reveal);
        setShowReveal(true);
        return;
      }

      advanceToNext();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex]
  );

  const advanceToNext = useCallback(() => {
    setDirection("forward");
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedMulti([]);
      setNumericValue("");
    } else {
      PixelEvents.quizComplete();
      setPhase("lead_capture");
    }
  }, [currentIndex, totalQuestions]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("back");
      setCurrentIndex((prev) => prev - 1);
      setSelectedMulti([]);
      setNumericValue("");
    }
  }, [currentIndex]);

  // Handle single-select tap (auto-advance)
  const handleSingleSelect = useCallback(
    (label: string, score: number) => {
      if (!question) return;
      recordAndAdvance(question.id, label, score);
    },
    [question, recordAndAdvance]
  );

  // Handle multi-select toggle
  const handleMultiToggle = useCallback(
    (label: string) => {
      if (label === "None of the above") {
        setSelectedMulti(["None of the above"]);
        return;
      }
      setSelectedMulti((prev) => {
        const filtered = prev.filter((l) => l !== "None of the above");
        return filtered.includes(label)
          ? filtered.filter((l) => l !== label)
          : [...filtered, label];
      });
    },
    []
  );

  // Submit multi-select
  const handleMultiSubmit = useCallback(() => {
    if (!question || selectedMulti.length === 0) return;
    const score = selectedMulti.includes("None of the above")
      ? 4
      : Math.max(0, 4 - selectedMulti.length);
    recordAndAdvance(question.id, selectedMulti, score);
  }, [question, selectedMulti, recordAndAdvance]);

  // Submit numeric
  const handleNumericSubmit = useCallback(() => {
    if (!question || !numericValue) return;
    const v = parseInt(numericValue);
    if (v >= (question.min ?? 0) && v <= (question.max ?? 999)) {
      recordAndAdvance(question.id, v, 0);
    }
  }, [question, numericValue, recordAndAdvance]);

  // Dismiss micro-reveal or case study
  const dismissReveal = useCallback(() => {
    setShowReveal(false);
    setPendingReveal(null);
    setPendingCaseStudy(null);
    advanceToNext();
  }, [advanceToNext]);

  // Lead submit
  const handleLeadSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadData.firstName || !leadData.email || !leadData.phone) return;
      setPhase("processing");
      PixelEvents.lead();

      try {
        const answersArray = Array.from(answers.values());
        const dimensions = calculateDimensionScores(answersArray);
        const wellnessScore = calculateWellnessScore(dimensions);
        const ageAnswer = answers.get("q1");
        const chronologicalAge =
          typeof ageAnswer?.value === "number"
            ? ageAnswer.value
            : parseInt(String(ageAnswer?.value ?? "35"));
        const biologicalAge = calculateBiologicalAge(chronologicalAge, wellnessScore);
        const symptomsAnswer = answers.get("q10");
        const symptoms = Array.isArray(symptomsAnswer?.value) ? symptomsAnswer.value : [];
        const treatments = recommendTreatments(dimensions, symptoms as string[]);

        await fetch("/api/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead: leadData,
            answers: answersArray,
            wellnessScore,
            biologicalAge,
            chronologicalAge,
            dimensions,
            treatments,
            source: "scan-flow",
          }),
        }).catch(() => {});

        sessionStorage.setItem(
          "quizResults",
          JSON.stringify({
            lead: leadData,
            answers: answersArray,
            wellnessScore,
            biologicalAge,
            chronologicalAge,
            ageOffset: biologicalAge - chronologicalAge,
            dimensions,
            treatments,
            scoreLabel:
              wellnessScore >= 90
                ? "Optimal"
                : wellnessScore >= 80
                ? "Strong"
                : wellnessScore >= 70
                ? "Average"
                : wellnessScore >= 60
                ? "Below Average"
                : "Needs Attention",
          })
        );

        router.push("/report");
      } catch (err) {
        console.error("Submission error:", err);
        setPhase("lead_capture");
      }
    },
    [answers, leadData, router]
  );

  // ── CASE STUDY CARD ───────────────────
  if (pendingCaseStudy) {
    const cs = pendingCaseStudy;
    const progressWidth = Math.round((cs.metric.after / 100) * 100);

    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Label */}
          <p className="text-[9px] font-bold tracking-[2px] text-gold/60 uppercase text-center mb-5">
            Real Client Result
          </p>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
            {/* Patient info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(212,168,83,0.1)] border border-gold/20 text-lg">
                {cs.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{cs.name}, {cs.age}</p>
                <p className="text-[11px] text-muted/50">{cs.context}</p>
              </div>
            </div>

            {/* Quote */}
            <p className="text-[14px] leading-relaxed text-muted/80 italic mb-5">
              &ldquo;{cs.quote}&rdquo;
            </p>

            {/* Before → After bar */}
            <div className="rounded-xl bg-bg p-3.5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted/50 uppercase tracking-[1px]">
                  {cs.metric.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-danger font-semibold">
                    {cs.metric.before}
                  </span>
                  <span className="text-[10px] text-muted/30">→</span>
                  <span className="text-[11px] text-green-500 font-semibold">
                    {cs.metric.after}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-green-500 transition-all duration-1000"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            {/* Treatment tag */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] rounded-full border border-gold/15 bg-[rgba(212,168,83,0.06)] px-3 py-1 text-gold font-medium">
                {cs.treatment}
              </span>
            </div>
          </div>

          {/* Citation */}
          <p className="mt-3 text-center text-[9px] text-muted/30 leading-relaxed">
            Based on: {cs.citation}
          </p>

          {/* Continue */}
          <button
            onClick={dismissReveal}
            className="gold-gradient w-full mt-5 rounded-xl px-8 py-3.5 font-heading text-sm font-bold text-bg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── MICRO-REVEAL OVERLAY ──────────────
  if (showReveal && pendingReveal) {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(212,168,83,0.1)] border border-gold/20">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L4 6V10C4 14.4 6.6 18.3 10 19.5C13.4 18.3 16 14.4 16 10V6L10 2Z" stroke="#D4A853" strokeWidth="1.5" />
              <path d="M10 7V11" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="14" r="0.8" fill="#D4A853" />
            </svg>
          </div>

          <p className="text-[10px] font-bold tracking-[2px] text-gold uppercase mb-2">
            {pendingReveal.title}
          </p>
          <p className="text-sm leading-relaxed text-muted/80 mb-8">
            {pendingReveal.text}
          </p>

          <button
            onClick={dismissReveal}
            className="gold-gradient rounded-xl px-8 py-3.5 font-heading text-sm font-bold text-bg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── LEAD CAPTURE ──────────────────────
  if (phase === "lead_capture") {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(212,168,83,0.1)] border border-gold/20">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L4 7V14C4 21 8.5 26.5 14 28C19.5 26.5 24 21 24 14V7L14 2Z" stroke="#D4A853" strokeWidth="1.5" />
              <path d="M10 14L13 17L19 11" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-heading text-2xl font-bold text-center mb-1">
            Your scan is complete
          </h2>
          <p className="text-center text-sm text-muted/60 mb-6">
            Enter your details to unlock your personalized{" "}
            <span className="text-gold font-medium">Longevity Report</span>
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="First name"
              value={leadData.firstName}
              onChange={(e) => setLeadData((p) => ({ ...p, firstName: e.target.value }))}
              required
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30 transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={leadData.email}
              onChange={(e) => setLeadData((p) => ({ ...p, email: e.target.value }))}
              required
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30 transition-colors"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={leadData.phone}
              onChange={(e) => setLeadData((p) => ({ ...p, phone: e.target.value }))}
              required
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!leadData.firstName || !leadData.email || !leadData.phone}
              className="gold-gradient gold-glow w-full mt-2 rounded-xl px-6 py-4 font-heading text-sm font-bold tracking-[1.5px] text-bg uppercase disabled:opacity-30 transition-opacity"
            >
              Reveal My Longevity Gap →
            </button>
          </form>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted/40">
            <Lock size={10} strokeWidth={2} className="shrink-0" />
            Encrypted &middot; Never shared &middot; GDPR compliant
          </p>
        </div>
      </div>
    );
  }

  // ── PROCESSING ────────────────────────
  if (phase === "processing") {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <p className="font-heading text-sm font-bold text-gold">
            Analyzing your cellular data...
          </p>
          <p className="mt-1 text-xs text-muted/50">
            Generating your Time Thief Report
          </p>
        </div>
      </div>
    );
  }

  // ── QUIZ QUESTIONS ────────────────────
  if (!question) return null;

  return (
    <div
      ref={containerRef}
      className="flex min-h-[calc(100dvh-48px)] flex-col px-5 py-6"
    >
      {/* Top bar: back + progress */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted/50 transition-all hover:border-white/20 hover:text-white disabled:opacity-0"
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <span className="text-[10px] text-muted/40 tabular-nums shrink-0">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Question content — centered vertically */}
      <div
        className="flex flex-1 flex-col justify-center"
        key={currentIndex}
        style={{
          animation: `${direction === "forward" ? "fade-in" : "fade-in"} 0.25s ease-out`,
        }}
      >
        {/* Question text */}
        <h2 className="font-heading text-2xl font-bold leading-tight mb-2">
          {question.text}
        </h2>
        {question.subtext && (
          <p className="text-sm text-muted/50 mb-6">{question.subtext}</p>
        )}
        {!question.subtext && <div className="mb-6" />}

        {/* ── NUMERIC INPUT ── */}
        {question.type === "numeric" && (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="number"
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNumericSubmit()}
              placeholder="Enter a number"
              min={question.min}
              max={question.max}
              className="w-full rounded-xl border border-white/10 bg-bg-card px-5 py-4 font-heading text-2xl font-bold text-white text-center outline-none focus:border-gold/30 transition-colors placeholder:text-muted/20"
            />
            <button
              onClick={handleNumericSubmit}
              disabled={!numericValue}
              className="gold-gradient w-full rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg disabled:opacity-30 transition-opacity"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── SINGLE SELECT (auto-advance on tap) ── */}
        {(question.type === "single" || question.type === "scale") && (
          <div className="space-y-2.5">
            {question.options?.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSingleSelect(opt.label, opt.score)}
                className="group w-full text-left rounded-xl border border-white/8 bg-bg-card px-5 py-4 transition-all duration-200 hover:border-gold/25 hover:bg-[rgba(212,168,83,0.04)] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[15px] font-medium text-white/90">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <p className="text-[12px] text-muted/40 mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted/20 group-hover:text-gold/60 transition-colors shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── MULTI SELECT ── */}
        {question.type === "multi" && (
          <div className="space-y-2.5">
            {question.options?.map((opt) => {
              const isSelected = selectedMulti.includes(opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => handleMultiToggle(opt.label)}
                  className={`w-full text-left rounded-xl border px-5 py-4 transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "border-gold/40 bg-[rgba(212,168,83,0.08)]"
                      : "border-white/8 bg-bg-card hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        isSelected
                          ? "border-gold bg-gold"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3 6L5.5 8.5L9.5 4"
                            stroke="#0A0A0A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-[15px] font-medium text-white/90">
                      {opt.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Submit button for multi */}
            {selectedMulti.length > 0 && (
              <button
                onClick={handleMultiSubmit}
                className="gold-gradient w-full mt-3 rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg animate-fade-in"
              >
                Continue with {selectedMulti.length} selected →
              </button>
            )}
          </div>
        )}

        {/* ── IMAGE CARDS (goals grid) ── */}
        {question.type === "image-cards" && (
          <div className="grid grid-cols-2 gap-2.5">
            {question.options?.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSingleSelect(opt.label, opt.score)}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-bg-card px-3 py-5 transition-all duration-200 hover:border-gold/25 hover:bg-[rgba(212,168,83,0.04)] active:scale-[0.97]"
              >
                <span className="text-xl flex items-center justify-center">
                  {opt.icon === "zap" && <Zap size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "brain" && <Brain size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "clock" && <Clock size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "shield" && <Shield size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "droplets" && <Droplets size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "sparkles" && <Sparkles size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "activity" && <Activity size={22} strokeWidth={1.5} className="text-gold" />}
                  {opt.icon === "target" && <Target size={22} strokeWidth={1.5} className="text-gold" />}
                </span>
                <span className="text-sm font-semibold text-white">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-[11px] text-muted/40 text-center">
                    {opt.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
