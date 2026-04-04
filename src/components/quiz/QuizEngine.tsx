"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Question, QuizAnswer, LeadData } from "@/lib/types";
import {
  FIXED_QUESTIONS,
  ADAPTIVE_BANK,
  FALLBACK_ADAPTIVE,
  INSIGHT_TRIGGERS,
} from "@/lib/questions";
import {
  calculateDimensionScores,
  calculateWellnessScore,
  calculateBiologicalAge,
} from "@/lib/scoring";
import { recommendTreatments } from "@/lib/treatments";
import { PixelEvents, getMetaCookies } from "@/lib/pixel";

import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import MicroInsight from "./MicroInsight";
import LeadCaptureForm from "./LeadCaptureForm";

/* ── Adaptive question selection ──────────────────── */
function getAdaptiveQuestions(symptoms: string[]): Question[] {
  const candidateQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const entry of ADAPTIVE_BANK) {
    const hasOverlap = entry.triggers.some((t) => symptoms.includes(t));
    if (hasOverlap) {
      for (const q of entry.questions) {
        if (!seenIds.has(q.id)) {
          candidateQuestions.push(q);
          seenIds.add(q.id);
        }
      }
    }
  }

  if (candidateQuestions.length === 0) {
    return FALLBACK_ADAPTIVE.slice(0, 2);
  }

  // Return up to 2 questions
  return candidateQuestions.slice(0, 2);
}

/* ── Build question sequence ──────────────────────── */
function buildSequence(adaptive: Question[]): Question[] {
  return [
    ...FIXED_QUESTIONS.slice(0, 10), // Q1 - Q10
    ...adaptive,                      // Q11, Q12 (adaptive)
    ...FIXED_QUESTIONS.slice(10),     // Q13 - Q16
  ];
}

/* ── Main QuizEngine ──────────────────────────────── */
export default function QuizEngine() {
  const router = useRouter();
  const firedStart = useRef(false);

  // Core state
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<Question[]>(
    FALLBACK_ADAPTIVE.slice(0, 2)
  );
  const [currentStep, setCurrentStep] = useState(0);

  // Micro-insight state
  const [showInsight, setShowInsight] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Lead capture state
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived
  const sequence = buildSequence(adaptiveQuestions);
  const totalSteps = sequence.length;
  const currentQuestion = sequence[currentStep];

  // Fire StartQuiz once
  useEffect(() => {
    if (!firedStart.current) {
      PixelEvents.startQuiz();
      firedStart.current = true;
    }
  }, []);

  /* ── Advance to next question ───────────────────── */
  const advanceStep = useCallback(() => {
    if (currentStep + 1 >= totalSteps) {
      PixelEvents.quizComplete();
      setShowLeadCapture(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  /* ── Fetch micro-insight ────────────────────────── */
  const fetchInsight = useCallback(
    async (questionId: string) => {
      setShowInsight(true);
      setInsightLoading(true);
      setInsightText(null);

      try {
        const answersPayload = Array.from(answers.values());
        const res = await fetch("/api/quiz/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, answers: answersPayload }),
        });

        if (res.ok) {
          const data = await res.json();
          setInsightText(data.insight ?? null);
          setInsightLoading(false);

          // Auto-advance after 3 seconds
          setTimeout(() => {
            setShowInsight(false);
            advanceStep();
          }, 3000);
        } else {
          // On error, skip insight
          setShowInsight(false);
          advanceStep();
        }
      } catch {
        setShowInsight(false);
        advanceStep();
      }
    },
    [answers, advanceStep]
  );

  /* ── Handle answer ──────────────────────────────── */
  const handleAnswer = useCallback(
    async (value: string | string[] | number, score: number) => {
      if (!currentQuestion) return;

      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        value,
        score,
      };

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion.id, answer);
        return next;
      });

      // After Q10 (symptoms multi-select), resolve adaptive questions
      if (currentQuestion.id === "q10") {
        const symptoms = Array.isArray(value) ? value : [];
        try {
          const res = await fetch("/api/quiz/adaptive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms }),
          });
          if (res.ok) {
            const data = await res.json();
            // data.questionIds is an array of adaptive question IDs
            const ids: string[] = data.questionIds ?? [];
            if (ids.length > 0) {
              const allBankQuestions = ADAPTIVE_BANK.flatMap((e) => e.questions);
              const matched = ids
                .map((id) => allBankQuestions.find((q) => q.id === id))
                .filter((q): q is Question => q !== undefined);
              if (matched.length >= 2) {
                setAdaptiveQuestions(matched.slice(0, 2));
              } else {
                setAdaptiveQuestions(getAdaptiveQuestions(symptoms));
              }
            } else {
              setAdaptiveQuestions(getAdaptiveQuestions(symptoms));
            }
          } else {
            setAdaptiveQuestions(getAdaptiveQuestions(symptoms));
          }
        } catch {
          setAdaptiveQuestions(getAdaptiveQuestions(symptoms));
        }
      }

      // Check if this question is an insight trigger
      const isInsightTrigger = (INSIGHT_TRIGGERS as readonly string[]).includes(
        currentQuestion.id
      );

      // For q12 we need to check the adaptive question at index 11 (0-based)
      // The insight triggers reference "q12" which maps to the second adaptive question
      const isAdaptiveQ12 =
        currentStep === 11 &&
        INSIGHT_TRIGGERS.includes("q12" as (typeof INSIGHT_TRIGGERS)[number]);

      if (isInsightTrigger || isAdaptiveQ12) {
        fetchInsight(currentQuestion.id);
      } else {
        // For non-numeric types, auto-advance. For numeric, need explicit "Next".
        if (currentQuestion.type !== "numeric") {
          // Small delay for visual feedback on selection
          setTimeout(() => advanceStep(), 300);
        }
      }
    },
    [currentQuestion, currentStep, fetchInsight, advanceStep]
  );

  /* ── Handle lead submit ─────────────────────────── */
  const handleLeadSubmit = async (data: LeadData) => {
    setIsSubmitting(true);
    PixelEvents.lead();

    try {
      const answersArray = Array.from(answers.values());
      const dimensions = calculateDimensionScores(answersArray);
      const wellnessScore = calculateWellnessScore(dimensions);

      const ageAnswer = answers.get("q1");
      const chronologicalAge = typeof ageAnswer?.value === "number" ? ageAnswer.value : 35;
      const biologicalAge = calculateBiologicalAge(chronologicalAge, wellnessScore);

      const symptomsAnswer = answers.get("q10");
      const symptoms = Array.isArray(symptomsAnswer?.value)
        ? symptomsAnswer.value
        : [];

      const treatments = recommendTreatments(dimensions, symptoms);

      // Build Q&A with full question text
      const questionsWithAnswers = answersArray.map((a) => {
        const q = sequence.find((sq) => sq.id === a.questionId);
        return {
          questionId: a.questionId,
          questionText: q?.text ?? "",
          answer: a.value,
          score: a.score,
        };
      });

      const { fbc, fbp } = getMetaCookies();

      // POST webhook
      await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: data,
          answers: answersArray,
          questionsWithAnswers,
          wellnessScore,
          biologicalAge,
          chronologicalAge,
          dimensions,
          treatments,
          fbc,
          fbp,
          page_url: window.location.href,
        }),
      }).catch(() => {
        /* webhook failure is non-blocking */
      });

      // Store in sessionStorage
      const reportPayload = {
        lead: data,
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
      };

      sessionStorage.setItem("quizResults", JSON.stringify(reportPayload));

      router.push("/report");
    } catch (err) {
      console.error("Lead submission error:", err);
      setIsSubmitting(false);
    }
  };

  /* ── Handle "Next" for numeric questions ────────── */
  const currentAnswer = currentQuestion
    ? answers.get(currentQuestion.id)
    : undefined;

  const handleNext = () => {
    if (!currentAnswer) return;
    const isInsightTrigger = (INSIGHT_TRIGGERS as readonly string[]).includes(
      currentQuestion.id
    );
    const isAdaptiveQ12 =
      currentStep === 11 &&
      INSIGHT_TRIGGERS.includes("q12" as (typeof INSIGHT_TRIGGERS)[number]);

    if (isInsightTrigger || isAdaptiveQ12) {
      fetchInsight(currentQuestion.id);
    } else {
      advanceStep();
    }
  };

  /* ── Click to dismiss insight ───────────────────── */
  const dismissInsight = () => {
    setShowInsight(false);
    advanceStep();
  };

  /* ── Render ─────────────────────────────────────── */
  if (showLeadCapture) {
    return (
      <div className="w-full px-4">
        <LeadCaptureForm onSubmit={handleLeadSubmit} isSubmitting={isSubmitting} />
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />

      {showInsight ? (
        <button
          type="button"
          onClick={dismissInsight}
          className="w-full text-left"
          aria-label="Continue to next question"
        >
          <MicroInsight insight={insightText} isLoading={insightLoading} />
          {!insightLoading && (
            <p className="text-center text-xs text-muted mt-2">
              Tap to continue
            </p>
          )}
        </button>
      ) : (
        <>
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              value={currentAnswer?.value ?? null}
              onChange={handleAnswer}
            />
          )}

          {/* Next button for numeric + multi-select */}
          {currentQuestion &&
            (currentQuestion.type === "numeric" ||
              currentQuestion.type === "multi") && (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentAnswer}
                className={`w-full mt-6 py-3.5 rounded-xl font-heading font-bold text-sm tracking-wider uppercase transition-all ${
                  currentAnswer
                    ? "gold-gradient text-bg hover:opacity-90"
                    : "bg-bg-hover text-muted cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            )}
        </>
      )}
    </div>
  );
}
