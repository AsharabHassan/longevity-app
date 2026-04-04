"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, X, ChevronRight, Zap, Brain, Clock, Shield, Droplets, Sparkles, Activity, Target, Lock } from "lucide-react";
import { BODY_ZONES, INTRO_QUESTIONS } from "@/lib/bodyZones";
import { FIXED_QUESTIONS } from "@/lib/questions";
import type { QuizAnswer, LeadData } from "@/lib/types";
import {
  calculateDimensionScores,
  calculateWellnessScore,
  calculateBiologicalAge,
} from "@/lib/scoring";
import { recommendTreatments } from "@/lib/treatments";
import { PixelEvents, getMetaCookies } from "@/lib/pixel";

// ── Premium SVG Icons for each zone ──────────────────────
function BrainIcon({ size = 32, color = "#8B5CF6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4C12 4 9 6.5 9 10C9 11.5 9.5 12.8 10.3 13.8C8.9 14.8 8 16.5 8 18.5C8 21.5 10 24 13 24.5V28H19V24.5C22 24 24 21.5 24 18.5C24 16.5 23.1 14.8 21.7 13.8C22.5 12.8 23 11.5 23 10C23 6.5 20 4 16 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4V12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M12 9C12 9 14 11 16 11C18 11 20 9 20 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M11 17C11 17 13 19 16 19C19 19 21 17 21 17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <circle cx="12.5" cy="13.5" r="1" fill={color} opacity="0.4" />
      <circle cx="19.5" cy="13.5" r="1" fill={color} opacity="0.4" />
    </svg>
  );
}

function SleepIcon({ size = 32, color = "#6366F1" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16C8 11.6 11.6 8 16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 4C17 4 14.5 6.5 14.5 9.5C14.5 12.5 17 15 20 15C23 15 25.5 12.5 25.5 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 6L24 4L26 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M26 10L28 8L26 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <line x1="12" y1="20" x2="14" y2="18" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="17" y1="21" x2="19" y2="19" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function EnergyIcon({ size = 32, color = "#F59E0B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M18 4L10 18H16L14 28L24 14H18L18 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 4L10 18H16L14 28L24 14H18L18 4Z" fill={color} opacity="0.1" />
      <circle cx="7" cy="10" r="1.5" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <circle cx="25" cy="22" r="1.5" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="5" y1="16" x2="8" y2="16" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="24" y1="8" x2="27" y2="8" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

function ImmunityIcon({ size = 32, color = "#10B981" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3L4 9V16C4 23 9 28.5 16 30C23 28.5 28 23 28 16V9L16 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3L4 9V16C4 23 9 28.5 16 30C23 28.5 28 23 28 16V9L16 3Z" fill={color} opacity="0.08" />
      <path d="M16 10V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 16H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function PhysicalIcon({ size = 32, color = "#EF4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="6" r="3" stroke={color} strokeWidth="1.5" />
      <path d="M12 12L8 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12L24 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 12V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20L12 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20L20 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 14L8 16L6 18" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <path d="M26 14L24 16L26 18" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

function SkinIcon({ size = 32, color = "#EC4899" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="16" r="12" fill={color} opacity="0.06" />
      <path d="M16 4C16 4 20 10 20 16C20 22 16 28 16 28" stroke={color} strokeWidth="1" opacity="0.3" />
      <path d="M16 4C16 4 12 10 12 16C12 22 16 28 16 28" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx="16" cy="12" r="1.5" fill={color} opacity="0.2" />
      <circle cx="12" cy="17" r="1" fill={color} opacity="0.2" />
      <circle cx="20" cy="17" r="1" fill={color} opacity="0.2" />
      <circle cx="16" cy="22" r="1.5" fill={color} opacity="0.2" />
      <path d="M10 10L12 8" stroke={color} strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
      <path d="M22 10L20 8" stroke={color} strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

const ZONE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  brain: BrainIcon,
  sleep: SleepIcon,
  energy: EnergyIcon,
  immunity: ImmunityIcon,
  physical: PhysicalIcon,
  skin: SkinIcon,
};

// ── Body Silhouette SVG ──────────────────────────────────
function BodySilhouette({
  scannedZones,
  activeZone,
  onZoneClick,
}: {
  scannedZones: Set<string>;
  activeZone: string | null;
  onZoneClick: (zoneId: string) => void;
}) {
  return (
    <div className="relative mx-auto" style={{ width: "280px", height: "420px" }}>
      {/* Body outline */}
      <svg
        viewBox="0 0 280 420"
        width="280"
        height="420"
        fill="none"
        className="absolute inset-0"
      >
        {/* Head */}
        <ellipse cx="140" cy="42" rx="28" ry="32" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Neck */}
        <path d="M128 72V90 M152 72V90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {/* Torso */}
        <path d="M100 90 Q90 120 92 160 Q94 200 100 240 L140 260 L180 240 Q186 200 188 160 Q190 120 180 90 Z" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {/* Left arm */}
        <path d="M100 95 Q70 110 55 150 Q48 170 45 190" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Right arm */}
        <path d="M180 95 Q210 110 225 150 Q232 170 235 190" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Left leg */}
        <path d="M120 255 Q115 300 110 340 Q108 370 105 400" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Right leg */}
        <path d="M160 255 Q165 300 170 340 Q172 370 175 400" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Spine hint */}
        <line x1="140" y1="75" x2="140" y2="250" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
      </svg>

      {/* Hotspots */}
      {BODY_ZONES.map((zone) => {
        const Icon = ZONE_ICONS[zone.id];
        const isScanned = scannedZones.has(zone.id);
        const isActive = activeZone === zone.id;

        return (
          <button
            key={zone.id}
            onClick={() => onZoneClick(zone.id)}
            disabled={isScanned}
            className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
            }}
          >
            {/* Glow ring */}
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                isScanned
                  ? "border-green-500/40 bg-[rgba(34,197,94,0.1)]"
                  : isActive
                  ? "border-gold/60 bg-[rgba(212,168,83,0.15)] scale-110"
                  : "border-white/15 bg-[rgba(255,255,255,0.04)] hover:border-white/30 hover:bg-[rgba(255,255,255,0.08)] hover:scale-105"
              }`}
            >
              {/* Pulse animation for unscanned */}
              {!isScanned && !isActive && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: zone.color }}
                />
              )}

              {isScanned ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Icon size={24} color={isActive ? "#D4A853" : zone.color} />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[9px] font-bold tracking-[1px] uppercase whitespace-nowrap transition-colors ${
                isScanned
                  ? "text-green-500/60"
                  : isActive
                  ? "text-gold"
                  : "text-white/40 group-hover:text-white/70"
              }`}
            >
              {zone.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Question Card (slides up from bottom) ────────────────
function QuestionPanel({
  zone,
  questions,
  onAnswer,
  onClose,
  currentIndex,
  totalQuestions,
}: {
  zone: (typeof BODY_ZONES)[0];
  questions: typeof FIXED_QUESTIONS;
  onAnswer: (questionId: string, value: string | string[] | number, score: number) => void;
  onClose: () => void;
  currentIndex: number;
  totalQuestions: number;
}) {
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const question = questions[currentIndex];
  if (!question) return null;

  const Icon = ZONE_ICONS[zone.id];

  const handleSelect = (label: string, score: number) => {
    if (question.type === "multi") {
      if (label === "None of the above") {
        onAnswer(question.id, ["None of the above"], 4);
        return;
      }
      const next = selectedMulti.includes(label)
        ? selectedMulti.filter((l) => l !== label)
        : [...selectedMulti, label];
      setSelectedMulti(next);
      return;
    }
    onAnswer(question.id, label, score);
  };

  const handleMultiSubmit = () => {
    if (selectedMulti.length === 0) return;
    const avgScore = Math.max(0, 4 - selectedMulti.length);
    onAnswer(question.id, selectedMulti, avgScore);
    setSelectedMulti([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-t-3xl border-t border-white/10 bg-bg p-6 pb-8"
        style={{ animation: "slide-up 0.3s ease-out" }}
      >
        {/* Zone header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${zone.color}15` }}
            >
              <Icon size={20} color={zone.color} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: zone.color }}>
                {zone.name}
              </p>
              <p className="text-[10px] text-muted/50">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Question */}
        <h3 className="font-heading text-lg font-bold text-white mb-1">
          {question.text}
        </h3>
        {question.subtext && (
          <p className="text-xs text-muted/60 mb-5">{question.subtext}</p>
        )}
        {!question.subtext && <div className="mb-5" />}

        {/* Options */}
        <div className="space-y-2.5 max-h-[45vh] overflow-y-auto">
          {question.options?.map((opt) => {
            const isSelected =
              question.type === "multi"
                ? selectedMulti.includes(opt.label)
                : false;

            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label, opt.score)}
                className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                  isSelected
                    ? "border-gold/40 bg-[rgba(212,168,83,0.1)]"
                    : "border-white/8 bg-bg-card hover:border-white/15 hover:bg-bg-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white/90">{opt.label}</span>
                    {opt.description && (
                      <p className="text-[11px] text-muted/50 mt-0.5">{opt.description}</p>
                    )}
                  </div>
                  {isSelected && <Check size={16} className="text-gold shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Multi-select submit */}
        {question.type === "multi" && selectedMulti.length > 0 && (
          <button
            onClick={handleMultiSubmit}
            className="gold-gradient w-full mt-4 rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg"
          >
            Continue with {selectedMulti.length} selected →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Micro-Reveal Card ────────────────────────────────────
function MicroReveal({
  zone,
  onContinue,
}: {
  zone: (typeof BODY_ZONES)[0];
  onContinue: () => void;
}) {
  const Icon = ZONE_ICONS[zone.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-bg-card p-6"
        style={{ animation: "scale-in 0.3s ease-out" }}
      >
        {/* Zone icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${zone.color}15` }}
          >
            <Icon size={20} color={zone.color} />
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[2px] uppercase text-gold">
              Scan Finding
            </p>
            <p className="text-sm font-semibold text-white">{zone.name}</p>
          </div>
        </div>

        {/* Insight */}
        <p className="text-sm leading-relaxed text-muted/80 mb-6">
          {zone.microReveal}
        </p>

        {/* Continue */}
        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-[rgba(212,168,83,0.06)] px-6 py-3 font-heading text-sm font-bold text-gold transition-all hover:bg-[rgba(212,168,83,0.12)]"
        >
          Continue Scan
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
type Phase = "intro" | "body_map" | "zone_questions" | "micro_reveal" | "lead_capture" | "processing";

export default function BodyScanQuiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());

  // Intro state
  const [introStep, setIntroStep] = useState(0);
  const [age, setAge] = useState("");

  // Body map state
  const [scannedZones, setScannedZones] = useState<Set<string>>(new Set());
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [currentZoneQuestionIndex, setCurrentZoneQuestionIndex] = useState(0);

  // Micro-reveal state
  const [revealZone, setRevealZone] = useState<(typeof BODY_ZONES)[0] | null>(null);

  // Lead capture state
  const [leadData, setLeadData] = useState<LeadData>({ firstName: "", email: "", phone: "" });

  const firedStart = useRef(false);

  useEffect(() => {
    if (!firedStart.current) {
      PixelEvents.startQuiz();
      firedStart.current = true;
    }
  }, []);

  // Record an answer
  const recordAnswer = useCallback(
    (questionId: string, value: string | string[] | number, score: number) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, { questionId, value, score });
        return next;
      });
    },
    []
  );

  // Get the fixed questions for a zone
  const getZoneQuestions = useCallback((zoneId: string) => {
    const zone = BODY_ZONES.find((z) => z.id === zoneId);
    if (!zone) return [];
    return zone.questionIds
      .map((id) => FIXED_QUESTIONS.find((q) => q.id === id))
      .filter((q): q is (typeof FIXED_QUESTIONS)[0] => q !== undefined);
  }, []);

  // Handle intro answers
  const handleIntroAnswer = useCallback(
    (questionId: string, value: string | string[] | number, score: number) => {
      recordAnswer(questionId, value, score);
      if (introStep < INTRO_QUESTIONS.length - 1) {
        setIntroStep((prev) => prev + 1);
      } else {
        setPhase("body_map");
      }
    },
    [introStep, recordAnswer]
  );

  // Handle zone click on body map
  const handleZoneClick = useCallback((zoneId: string) => {
    if (scannedZones.has(zoneId)) return;
    setActiveZone(zoneId);
    setCurrentZoneQuestionIndex(0);
    setPhase("zone_questions");
  }, [scannedZones]);

  // Handle zone question answer
  const handleZoneAnswer = useCallback(
    (questionId: string, value: string | string[] | number, score: number) => {
      recordAnswer(questionId, value, score);
      const zoneQuestions = activeZone ? getZoneQuestions(activeZone) : [];
      const nextIndex = currentZoneQuestionIndex + 1;

      if (nextIndex < zoneQuestions.length) {
        setCurrentZoneQuestionIndex(nextIndex);
      } else {
        // Zone complete → show micro-reveal
        const completedZone = BODY_ZONES.find((z) => z.id === activeZone);
        setScannedZones((prev) => {
          const next = new Set(prev);
          if (activeZone) next.add(activeZone);
          return next;
        });

        if (completedZone) {
          setRevealZone(completedZone);
          setPhase("micro_reveal");
        }
      }
    },
    [activeZone, currentZoneQuestionIndex, getZoneQuestions, recordAnswer]
  );

  // After micro-reveal, check if all zones done
  const handleRevealContinue = useCallback(() => {
    setRevealZone(null);
    setActiveZone(null);

    const newScannedCount = scannedZones.size;
    if (newScannedCount >= BODY_ZONES.length) {
      // All zones done → lead capture
      PixelEvents.quizComplete();
      setPhase("lead_capture");
    } else {
      setPhase("body_map");
    }
  }, [scannedZones]);

  // Handle lead submission
  const handleLeadSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadData.firstName || !leadData.email) return;
      setPhase("processing");
      PixelEvents.lead();

      try {
        const answersArray = Array.from(answers.values());
        const dimensions = calculateDimensionScores(answersArray);
        const wellnessScore = calculateWellnessScore(dimensions);
        const ageAnswer = answers.get("q1");
        const chronologicalAge = typeof ageAnswer?.value === "number" ? Number(ageAnswer.value) : parseInt(String(ageAnswer?.value ?? "35"));
        const biologicalAge = calculateBiologicalAge(chronologicalAge, wellnessScore);
        const symptomsAnswer = answers.get("q10");
        const symptoms = Array.isArray(symptomsAnswer?.value) ? symptomsAnswer.value : [];
        const treatments = recommendTreatments(dimensions, symptoms as string[]);

        // Build Q&A with full question text
        const questionsWithAnswers = answersArray.map((a) => {
          const q = FIXED_QUESTIONS.find((fq) => fq.id === a.questionId);
          return {
            questionId: a.questionId,
            questionText: q?.text ?? "",
            answer: a.value,
            score: a.score,
          };
        });

        const { fbc, fbp } = getMetaCookies();

        // Webhook
        await fetch("/api/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead: leadData,
            answers: answersArray,
            questionsWithAnswers,
            wellnessScore,
            biologicalAge,
            chronologicalAge,
            dimensions,
            treatments,
            source: "body-scan",
            fbc,
            fbp,
            page_url: window.location.href,
          }),
        }).catch(() => {});

        // Store in session
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
              wellnessScore >= 90 ? "Optimal"
                : wellnessScore >= 80 ? "Strong"
                : wellnessScore >= 70 ? "Average"
                : wellnessScore >= 60 ? "Below Average"
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

  // ── RENDER ─────────────────────────────

  // INTRO PHASE
  if (phase === "intro") {
    const q = INTRO_QUESTIONS[introStep];

    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-5 py-8">
        {/* Progress dots */}
        <div className="mb-8 flex gap-2">
          {INTRO_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < introStep
                  ? "w-6 bg-gold"
                  : i === introStep
                  ? "w-6 bg-gold/60"
                  : "w-1.5 bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md animate-fade-in" key={introStep}>
          {/* Question */}
          <h2 className="font-heading text-2xl font-bold text-center mb-2">
            {q.text}
          </h2>
          {q.subtext && (
            <p className="text-center text-sm text-muted/60 mb-6">{q.subtext}</p>
          )}
          {!q.subtext && <div className="mb-6" />}

          {/* Numeric (Age) */}
          {q.type === "numeric" && (
            <div className="flex flex-col items-center gap-4">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                min={q.min}
                max={q.max}
                className="w-32 rounded-xl border border-white/10 bg-bg-card px-4 py-4 text-center font-heading text-3xl font-bold text-white outline-none focus:border-gold/40"
                autoFocus
              />
              <button
                onClick={() => {
                  const v = parseInt(age);
                  if (v >= (q.min ?? 18) && v <= (q.max ?? 100)) {
                    handleIntroAnswer(q.id, v, 0);
                  }
                }}
                disabled={!age || parseInt(age) < (q.min ?? 18)}
                className="gold-gradient rounded-xl px-8 py-3 font-heading text-sm font-bold text-bg disabled:opacity-30"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Single select */}
          {(q.type === "single" || q.type === "scale") && (
            <div className="space-y-2.5">
              {q.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleIntroAnswer(q.id, opt.label, opt.score)}
                  className="w-full text-left rounded-xl border border-white/8 bg-bg-card px-4 py-3.5 text-sm font-medium text-white/90 transition-all hover:border-white/20 hover:bg-bg-hover"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Image cards (goals) */}
          {q.type === "image-cards" && (
            <div className="grid grid-cols-2 gap-2.5">
              {q.options?.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleIntroAnswer(q.id, opt.label, opt.score)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-bg-card px-3 py-4 transition-all hover:border-gold/30 hover:bg-[rgba(212,168,83,0.06)]"
                >
                  <span className="text-lg flex items-center justify-center">
                    {opt.icon === "zap" && <Zap size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "brain" && <Brain size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "clock" && <Clock size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "shield" && <Shield size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "droplets" && <Droplets size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "sparkles" && <Sparkles size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "activity" && <Activity size={20} strokeWidth={1.5} className="text-gold" />}
                    {opt.icon === "target" && <Target size={20} strokeWidth={1.5} className="text-gold" />}
                  </span>
                  <span className="text-xs font-semibold text-white">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[10px] text-muted/50">{opt.description}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // BODY MAP PHASE
  if (phase === "body_map" || phase === "zone_questions" || phase === "micro_reveal") {
    const currentZone = activeZone ? BODY_ZONES.find((z) => z.id === activeZone) : null;
    const zoneQuestions = activeZone ? getZoneQuestions(activeZone) : [];

    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center px-5 py-6">
        {/* Header */}
        <div className="mb-2 text-center">
          <h2 className="font-heading text-xl font-bold gold-text">
            Cellular Body Scan
          </h2>
          <p className="mt-1 text-xs text-muted/60">
            Tap each system to scan it
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
              style={{
                width: `${(scannedZones.size / BODY_ZONES.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-muted/50">
            {scannedZones.size}/{BODY_ZONES.length} systems scanned
          </span>
        </div>

        {/* Body Silhouette */}
        <BodySilhouette
          scannedZones={scannedZones}
          activeZone={activeZone}
          onZoneClick={handleZoneClick}
        />

        {/* "All done" prompt */}
        {scannedZones.size >= BODY_ZONES.length && (
          <div className="mt-6 animate-fade-in text-center">
            <p className="text-sm text-green-500 font-medium mb-3 flex items-center justify-center gap-1.5">
              <Check size={14} strokeWidth={2.5} />
              All systems scanned
            </p>
          </div>
        )}

        {/* Zone Question Panel (slide-up) */}
        {phase === "zone_questions" && currentZone && zoneQuestions.length > 0 && (
          <QuestionPanel
            zone={currentZone}
            questions={zoneQuestions}
            onAnswer={handleZoneAnswer}
            onClose={() => {
              setActiveZone(null);
              setPhase("body_map");
            }}
            currentIndex={currentZoneQuestionIndex}
            totalQuestions={zoneQuestions.length}
          />
        )}

        {/* Micro-Reveal Overlay */}
        {phase === "micro_reveal" && revealZone && (
          <MicroReveal zone={revealZone} onContinue={handleRevealContinue} />
        )}
      </div>
    );
  }

  // LEAD CAPTURE PHASE
  if (phase === "lead_capture") {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(212,168,83,0.1)] border border-gold/20">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8V16C4 23 9 28.5 16 30C23 28.5 28 23 28 16V8L16 2Z" stroke="#D4A853" strokeWidth="1.5" />
              <path d="M12 16L15 19L21 13" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-heading text-2xl font-bold text-center mb-1">
            Scan Complete
          </h2>
          <p className="text-center text-sm text-muted/70 mb-6">
            Your cellular analysis is ready. Enter your details to unlock your{" "}
            <span className="text-gold font-medium">Time Thief Report</span>.
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="First name"
              value={leadData.firstName}
              onChange={(e) => setLeadData((p) => ({ ...p, firstName: e.target.value }))}
              required
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30"
            />
            <input
              type="email"
              placeholder="Email address"
              value={leadData.email}
              onChange={(e) => setLeadData((p) => ({ ...p, email: e.target.value }))}
              required
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={leadData.phone}
              onChange={(e) => setLeadData((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30"
            />

            {/* Location */}
            <div className="flex gap-2 pt-1">
              {["London (Portpool Lane)", "Glasgow"].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => recordAnswer("q16", loc, 0)}
                  className={`flex-1 rounded-xl border px-3 py-3 text-xs font-medium transition-all ${
                    answers.get("q16")?.value === loc
                      ? "border-gold/40 bg-[rgba(212,168,83,0.1)] text-gold"
                      : "border-white/8 bg-bg-card text-muted/70 hover:border-white/20"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!leadData.firstName || !leadData.email}
              className="gold-gradient gold-glow w-full mt-2 rounded-xl px-6 py-4 font-heading text-sm font-bold tracking-[1.5px] text-bg uppercase disabled:opacity-30"
            >
              Reveal My Longevity Gap →
            </button>
          </form>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted/40">
            <Lock size={10} strokeWidth={2} className="shrink-0" />
            Your data is encrypted and never shared
          </p>
        </div>
      </div>
    );
  }

  // PROCESSING PHASE
  return (
    <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-5">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
        <p className="font-heading text-sm font-bold text-gold">
          Generating Your Time Thief Report...
        </p>
        <p className="mt-1 text-xs text-muted/50">
          Analyzing your cellular data
        </p>
      </div>
    </div>
  );
}
