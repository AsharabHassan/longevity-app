"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Zap,
  Brain,
  Clock,
  Shield,
  Moon,
  Dumbbell,
  Activity,
  Target,
  Lock,
} from "lucide-react";
import { QUIZ_SEQUENCE, NONE_OF_THE_ABOVE, QUIZ_VERSION, isQualified } from "@/lib/questions";
import { CITATIONS } from "@/lib/evidence";
import { CLINIC } from "@/lib/clinic";
import { calculateLifestyleAge } from "@/lib/lifestyleAge";
import { matchProtocols } from "@/lib/protocols";
import type { QuizAnswer, LeadData, Citation } from "@/lib/types";
import { PixelEvents, getMetaCookies } from "@/lib/pixel";

// ── Sourced facts shown between questions ────────────────
// Each one restates a finding from a cited study. No mechanisms, no promises.
const MICRO_REVEALS: Record<string, { title: string; text: string; citation: Citation }> = {
  activity: {
    title: "From the research",
    text: "In a study of more than 700,000 adults, physical inactivity was one of the habits most strongly linked to earlier death. The biggest gains come from moving out of the least active group.",
    citation: CITATIONS.nguyen2024,
  },
  sleepQuality: {
    title: "From the research",
    text: "In a US study of 3,795 adults, sleeping under 6 hours was associated with a DNA-based age measure about 1.3 years older.",
    citation: CITATIONS.kusters2024,
  },
  social: {
    title: "From the research",
    text: "Across 148 studies, people with stronger social relationships had about 50% better odds of survival — one of the most overlooked factors in healthy ageing.",
    citation: CITATIONS.holtLunstad2010,
  },
};

const GOAL_ICONS = {
  zap: Zap,
  brain: Brain,
  clock: Clock,
  moon: Moon,
  activity: Activity,
  dumbbell: Dumbbell,
  shield: Shield,
  target: Target,
} as const;

type Phase = "quiz" | "lead_capture" | "processing";
type Units = "metric" | "imperial";

export default function ScanFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [pendingReveal, setPendingReveal] = useState<(typeof MICRO_REVEALS)[string] | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [numericValue, setNumericValue] = useState("");
  const [units, setUnits] = useState<Units>("metric");
  const [body, setBody] = useState({ cm: "", kg: "", ft: "", inches: "", st: "", lb: "" });
  const [leadData, setLeadData] = useState<LeadData>({ firstName: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const firedStart = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!firedStart.current) {
      PixelEvents.startQuiz();
      firedStart.current = true;
    }
  }, []);

  useEffect(() => {
    if (QUIZ_SEQUENCE[currentIndex]?.type === "numeric" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const totalQuestions = QUIZ_SEQUENCE.length;
  const progress = (currentIndex / totalQuestions) * 100;
  const question = QUIZ_SEQUENCE[currentIndex];

  const advanceToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedMulti([]);
      setNumericValue("");
    } else {
      PixelEvents.quizComplete();
      setPhase("lead_capture");
    }
  }, [currentIndex, totalQuestions]);

  const recordAndAdvance = useCallback(
    (questionId: string, value: QuizAnswer["value"], label: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, { questionId, value, label });
        return next;
      });

      const reveal = MICRO_REVEALS[questionId];
      if (reveal) {
        setPendingReveal(reveal);
        return;
      }
      advanceToNext();
    },
    [advanceToNext]
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedMulti([]);
      setNumericValue("");
    }
  }, [currentIndex]);

  const handleMultiToggle = useCallback((value: string) => {
    if (value === NONE_OF_THE_ABOVE) {
      setSelectedMulti([NONE_OF_THE_ABOVE]);
      return;
    }
    setSelectedMulti((prev) => {
      const filtered = prev.filter((v) => v !== NONE_OF_THE_ABOVE);
      return filtered.includes(value) ? filtered.filter((v) => v !== value) : [...filtered, value];
    });
  }, []);

  const handleNumericSubmit = useCallback(() => {
    if (!question || !numericValue) return;
    const v = parseInt(numericValue, 10);
    if (v >= (question.min ?? 0) && v <= (question.max ?? 999)) {
      recordAndAdvance(question.id, v, String(v));
    }
  }, [question, numericValue, recordAndAdvance]);

  // Height/weight in either unit system, normalised to cm/kg
  const bodyMetric = (() => {
    if (units === "metric") {
      return { heightCm: parseFloat(body.cm), weightKg: parseFloat(body.kg) };
    }
    const inches = (parseFloat(body.ft) || 0) * 12 + (parseFloat(body.inches) || 0);
    const pounds = (parseFloat(body.st) || 0) * 14 + (parseFloat(body.lb) || 0);
    return { heightCm: inches * 2.54, weightKg: pounds * 0.45359237 };
  })();
  const bodyValid =
    bodyMetric.heightCm >= 120 && bodyMetric.heightCm <= 230 && bodyMetric.weightKg >= 30 && bodyMetric.weightKg <= 300;

  const handleBodySubmit = useCallback(() => {
    if (!question || !bodyValid) return;
    const label =
      units === "metric"
        ? `${body.cm} cm, ${body.kg} kg`
        : `${body.ft} ft ${body.inches || 0} in, ${body.st} st ${body.lb || 0} lb`;
    recordAndAdvance(question.id, JSON.stringify(bodyMetric), label);
  }, [question, bodyValid, bodyMetric, units, body, recordAndAdvance]);

  const handleLeadSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadData.firstName || !leadData.email || !leadData.phone || !consent) return;
      setSubmissionError("");
      setPhase("processing");

      try {
        const answersArray = Array.from(answers.values());
        const qualified = isQualified(answersArray);
        const result = calculateLifestyleAge(answersArray);
        const location = answers.get("location")?.value === "Glasgow" ? "Glasgow" : "London";

        const questionsWithAnswers = answersArray.map((a) => ({
          questionId: a.questionId,
          questionText: QUIZ_SEQUENCE.find((q) => q.id === a.questionId)?.text ?? "",
          answer: a.label,
        }));

        const { fbc, fbp } = getMetaCookies();

        // Visitors who declined the consultation pathway still receive their
        // on-screen estimate. Count their completed form separately in Meta,
        // without entering the consultation email workflow or qualified Lead event.
        if (qualified) {
          const response = await fetch("/api/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead: leadData,
              consent: true,
              questionsWithAnswers,
              answers: answersArray,
              result,
              location,
              qualified,
              protocols: matchProtocols(answersArray, result).map((p) => `${p.name} (${p.concern})`),
              source: "scan-flow",
              ad_code: sessionStorage.getItem("adCode") ?? "",
              fbc,
              fbp,
              page_url: window.location.href,
            }),
          });
          const delivery = await response.json();
          if (!response.ok || !delivery.delivered) {
            throw new Error(delivery.error || "Unable to save your assessment. Please try again.");
          }
          // Count a qualified lead only after the CRM webhook has accepted it.
          if (delivery.event_id) PixelEvents.lead(delivery.event_id);
        } else {
          // Fire after the report has mounted, so navigation cannot interrupt
          // the browser pixel request. The report clears this one-time flag.
          sessionStorage.setItem("pendingUnqualifiedLead", "1");
        }

        sessionStorage.removeItem("reportSummary");
        sessionStorage.setItem(
          "quizResults",
          JSON.stringify({ version: QUIZ_VERSION, lead: leadData, answers: answersArray, result, location })
        );

        router.push("/report");
      } catch (err) {
        console.error("Submission error:", err);
        setSubmissionError("We could not save your assessment. Please try again.");
        setPhase("lead_capture");
      }
    },
    [answers, leadData, consent, router]
  );

  // ── MICRO-REVEAL ──────────────────────
  if (pendingReveal) {
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in text-center">
          <p className="text-[10px] font-bold tracking-[2px] text-gold uppercase mb-3">
            {pendingReveal.title}
          </p>
          <p className="text-sm leading-relaxed text-muted/80 mb-3">{pendingReveal.text}</p>
          <a
            href={pendingReveal.citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted/40 underline underline-offset-2 hover:text-gold/70"
          >
            {pendingReveal.citation.short}
          </a>
          <div className="mt-8">
            <button
              onClick={() => {
                setPendingReveal(null);
                advanceToNext();
              }}
              className="gold-gradient rounded-xl px-8 py-3.5 font-heading text-sm font-bold text-bg"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LEAD CAPTURE ──────────────────────
  if (phase === "lead_capture") {
    const inputClass =
      "w-full rounded-xl border border-white/10 bg-bg-card px-4 py-3.5 text-sm text-white placeholder-muted/40 outline-none focus:border-gold/30 transition-colors";
    return (
      <div className="flex min-h-[calc(100dvh-48px)] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <h2 className="font-heading text-2xl font-bold text-center mb-1">Your estimate is ready</h2>
          <p className="text-center text-sm text-muted/60 mb-6">
            Enter your details to view your{" "}
            <span className="text-gold font-medium">Biological Age Report</span>.
          </p>

          <form onSubmit={handleLeadSubmit} className="space-y-3">
            {submissionError && <p role="alert" className="text-sm text-red-300">{submissionError}</p>}
            <input
              type="text"
              placeholder="First name"
              value={leadData.firstName}
              onChange={(e) => setLeadData((p) => ({ ...p, firstName: e.target.value }))}
              required
              autoFocus
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email address"
              value={leadData.email}
              onChange={(e) => setLeadData((p) => ({ ...p, email: e.target.value }))}
              required
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={leadData.phone}
              onChange={(e) => setLeadData((p) => ({ ...p, phone: e.target.value }))}
              required
              className={inputClass}
            />
            <label className="flex items-start gap-3 pt-1 text-left text-[11px] leading-relaxed text-muted/60 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4A853]"
              />
              <span>
                I agree that {CLINIC.brand} may store my answers, which include health information,
                and contact me about my report and consultation.
                {CLINIC.privacyUrl && (
                  <>
                    {" "}
                    <a href={CLINIC.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold/80">
                      Privacy policy
                    </a>
                    .
                  </>
                )}
              </span>
            </label>
            <button
              type="submit"
              disabled={!leadData.firstName || !leadData.email || !leadData.phone || !consent}
              className="gold-gradient gold-glow w-full mt-2 rounded-xl px-6 py-4 font-heading text-sm font-bold tracking-[1.5px] text-bg uppercase disabled:opacity-30 transition-opacity"
            >
              See My Estimate →
            </button>
          </form>
          <p className="mt-4 text-center text-[12px] leading-relaxed text-muted/70">
            Our team will call you to explain the full wellness assessment.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted/40">
            <Lock size={10} strokeWidth={2} className="shrink-0" />
            Used only for your report and consultation. Never sold.
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
          <p className="font-heading text-sm font-bold text-gold">Working out your estimate...</p>
          <p className="mt-1 text-xs text-muted/50">Comparing your answers with the published research</p>
        </div>
      </div>
    );
  }

  // ── QUIZ QUESTIONS ────────────────────
  if (!question) return null;

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-bg-card px-4 py-4 font-heading text-xl font-bold text-white text-center outline-none focus:border-gold/30 transition-colors placeholder:text-muted/20 placeholder:text-sm placeholder:font-normal";

  return (
    <div className="flex min-h-[calc(100dvh-48px)] flex-col px-5 py-6">
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
      </div>

      <div className="flex flex-1 flex-col justify-center animate-fade-in" key={currentIndex}>
        <h2 className="font-heading text-2xl font-bold leading-tight mb-2">{question.text}</h2>
        {question.subtext ? (
          <p className="text-sm text-muted/50 mb-6">{question.subtext}</p>
        ) : (
          <div className="mb-6" />
        )}

        {/* ── NUMERIC ── */}
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

        {/* ── HEIGHT & WEIGHT ── */}
        {question.type === "body" && (
          <div className="space-y-4">
            <div className="flex rounded-xl border border-white/10 p-1 text-xs font-semibold">
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={`flex-1 rounded-lg py-2 transition-colors ${
                    units === u ? "bg-[rgba(212,168,83,0.12)] text-gold" : "text-muted/50"
                  }`}
                >
                  {u === "metric" ? "cm / kg" : "ft / st"}
                </button>
              ))}
            </div>
            {units === "metric" ? (
              <div className="grid grid-cols-2 gap-3">
                <input type="number" inputMode="decimal" placeholder="Height (cm)" value={body.cm} onChange={(e) => setBody((b) => ({ ...b, cm: e.target.value }))} className={fieldClass} />
                <input type="number" inputMode="decimal" placeholder="Weight (kg)" value={body.kg} onChange={(e) => setBody((b) => ({ ...b, kg: e.target.value }))} className={fieldClass} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input type="number" inputMode="numeric" placeholder="Height (ft)" value={body.ft} onChange={(e) => setBody((b) => ({ ...b, ft: e.target.value }))} className={fieldClass} />
                <input type="number" inputMode="numeric" placeholder="(in)" value={body.inches} onChange={(e) => setBody((b) => ({ ...b, inches: e.target.value }))} className={fieldClass} />
                <input type="number" inputMode="numeric" placeholder="Weight (st)" value={body.st} onChange={(e) => setBody((b) => ({ ...b, st: e.target.value }))} className={fieldClass} />
                <input type="number" inputMode="numeric" placeholder="(lb)" value={body.lb} onChange={(e) => setBody((b) => ({ ...b, lb: e.target.value }))} className={fieldClass} />
              </div>
            )}
            <button
              onClick={handleBodySubmit}
              disabled={!bodyValid}
              className="gold-gradient w-full rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg disabled:opacity-30 transition-opacity"
            >
              Continue →
            </button>
            <button
              onClick={() => recordAndAdvance(question.id, "skipped", "Preferred not to say")}
              className="w-full py-2 text-xs text-muted/50 underline underline-offset-2 hover:text-muted"
            >
              I&apos;d rather not say
            </button>
          </div>
        )}

        {/* ── SINGLE SELECT (auto-advance on tap) ── */}
        {(question.type === "single" || question.type === "scale") && (
          <div className="space-y-2.5">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => recordAndAdvance(question.id, opt.value, opt.label)}
                className="group w-full text-left rounded-xl border border-white/8 bg-bg-card px-5 py-4 transition-all duration-200 hover:border-gold/25 hover:bg-[rgba(212,168,83,0.04)] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[15px] font-medium text-white/90">{opt.label}</span>
                    {opt.description && (
                      <p className="text-[12px] text-muted/40 mt-0.5">{opt.description}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted/20 group-hover:text-gold/60 transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── MULTI SELECT ── */}
        {question.type === "multi" && (
          <div className="space-y-2.5">
            {question.options?.map((opt) => {
              const isSelected = selectedMulti.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleMultiToggle(opt.value)}
                  className={`w-full text-left rounded-xl border px-5 py-3.5 transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "border-gold/40 bg-[rgba(212,168,83,0.08)]"
                      : "border-white/8 bg-bg-card hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        isSelected ? "border-gold bg-gold" : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 6L5.5 8.5L9.5 4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[15px] font-medium text-white/90">{opt.label}</span>
                  </div>
                </button>
              );
            })}

            {selectedMulti.length > 0 && (
              <button
                onClick={() => recordAndAdvance(question.id, selectedMulti, selectedMulti.join(", "))}
                className="gold-gradient w-full mt-3 rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg animate-fade-in"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* ── IMAGE CARDS (goals grid) ── */}
        {question.type === "image-cards" && (
          <div className="grid grid-cols-2 gap-2.5">
            {question.options?.map((opt) => {
              const Icon = GOAL_ICONS[opt.icon as keyof typeof GOAL_ICONS] ?? Target;
              return (
                <button
                  key={opt.value}
                  onClick={() => recordAndAdvance(question.id, opt.value, opt.label)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-bg-card px-3 py-5 transition-all duration-200 hover:border-gold/25 hover:bg-[rgba(212,168,83,0.04)] active:scale-[0.97]"
                >
                  <Icon size={22} strokeWidth={1.5} className="text-gold" />
                  <span className="text-sm font-semibold text-white">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[11px] text-muted/40 text-center">{opt.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
