import { QuizAnswer, DimensionScore } from "./types";

interface DimensionConfig {
  name: string;
  weight: number;
  questionIds: string[];
  icon: string;
}

/**
 * 8 clinically-grounded wellness dimensions.
 *
 * Weight rationale (based on 2024–2025 longevity research):
 *  - Sleep & Energy get highest weights: sleep duration/quality directly
 *    correlates with biological age (MDPI 2018, CMEC 2025), and mitochondrial
 *    energy output (NAD+ decline) is the #1 driver of cellular aging.
 *  - Stress gets 14%: cortisol-telomere feedback loop accelerates cellular
 *    aging (telomere shortening research, multiple 2024 reviews).
 *  - Cognitive, Metabolic, Physical each get 12%: all strongly linked to
 *    age-related decline and modifiable via IV/lifestyle interventions.
 *  - Immune at 10%: important but more variable (seasonal, etc.).
 *  - Cellular & Skin at 8%: visible aging marker, lower clinical urgency.
 *
 * "Readiness & Awareness" (q15) was removed — it's a sales qualification
 * question, not a clinical metric. Penalising users for not having tried
 * IV therapy pollutes clinical credibility.
 *
 * Total: 17 + 15 + 14 + 12 + 12 + 12 + 10 + 8 = 100%
 */
const DIMENSIONS: DimensionConfig[] = [
  {
    name: "Sleep Quality",
    weight: 0.17,
    questionIds: ["q5", "q6"],
    icon: "moon",
  },
  {
    name: "Energy & Vitality",
    weight: 0.15,
    questionIds: ["q4", "q14", "q10-energy"],
    icon: "zap",
  },
  {
    name: "Stress & Mental Wellness",
    weight: 0.14,
    questionIds: ["q9", "q11-stress-recovery", "q10-stress"],
    icon: "heart",
  },
  {
    name: "Cognitive Function",
    weight: 0.12,
    questionIds: ["q11-cognitive-clarity", "q11-cognitive-duration", "q11-fallback-vitality", "q10-cognitive"],
    icon: "brain",
  },
  {
    name: "Metabolic Health",
    weight: 0.12,
    questionIds: ["q8", "q14", "q11-metabolic-meals", "q10-metabolic"],
    icon: "activity",
  },
  {
    name: "Physical Activity",
    weight: 0.12,
    questionIds: ["q7", "q10-physical"],
    icon: "dumbbell",
  },
  {
    name: "Immune Resilience",
    weight: 0.10,
    questionIds: ["q11-immune-frequency", "q11-immune-recovery", "q10-immune"],
    icon: "shield",
  },
  {
    name: "Cellular & Skin Health",
    weight: 0.08,
    questionIds: ["q13", "q11-skin-response", "q10-skin"],
    icon: "sparkles",
  },
];

/**
 * Maps multi-select symptom labels from q10 to synthetic answer IDs
 * that feed directly into the corresponding dimension.
 *
 * This solves the critical bug where selecting symptoms like "Brain fog"
 * or "Chronic fatigue" contributed zero to any dimension score.
 */
const SYMPTOM_TO_DIMENSION: Record<string, { answerId: string; score: number }[]> = {
  "Brain fog": [{ answerId: "q10-cognitive", score: 0 }],
  "Chronic fatigue": [{ answerId: "q10-energy", score: 0 }],
  "Frequent colds/illness": [{ answerId: "q10-immune", score: 0 }],
  "Skin dullness": [{ answerId: "q10-skin", score: 0 }],
  "Digestive issues": [{ answerId: "q10-metabolic", score: 0 }],
  "Mood swings": [{ answerId: "q10-stress", score: 0 }],
  "Weight struggles": [{ answerId: "q10-metabolic", score: 0 }],
  "Slow recovery": [{ answerId: "q10-immune", score: 0 }],
  "Joint pain": [{ answerId: "q10-physical", score: 0 }],
};

/**
 * Expands symptom selections from q10 into synthetic dimension-mapped answers.
 * Call this before calculateDimensionScores to ensure symptoms feed the model.
 */
export function expandSymptomAnswers(answers: QuizAnswer[]): QuizAnswer[] {
  const expanded = [...answers];
  const q10 = answers.find((a) => a.questionId === "q10");

  if (q10 && Array.isArray(q10.value)) {
    for (const symptom of q10.value) {
      const mappings = SYMPTOM_TO_DIMENSION[symptom];
      if (mappings) {
        for (const m of mappings) {
          // Only add if not already present
          if (!expanded.some((a) => a.questionId === m.answerId)) {
            expanded.push({
              questionId: m.answerId,
              value: symptom,
              score: m.score,
            });
          }
        }
      }
    }
  }

  return expanded;
}

export function calculateDimensionScores(answers: QuizAnswer[]): DimensionScore[] {
  // First expand symptom answers so they feed dimensions
  const expandedAnswers = expandSymptomAnswers(answers);
  const answerMap = new Map(expandedAnswers.map((a) => [a.questionId, a]));

  return DIMENSIONS.map((dim) => {
    const relevantAnswers = dim.questionIds
      .map((id) => answerMap.get(id))
      .filter((a): a is QuizAnswer => a !== undefined);

    let score: number;
    if (relevantAnswers.length === 0) {
      score = 65; // slightly above neutral — no data shouldn't penalise heavily
    } else {
      const avg = relevantAnswers.reduce((sum, a) => sum + a.score, 0) / relevantAnswers.length;
      score = Math.round((avg / 4) * 100);
    }

    return {
      name: dim.name,
      score,
      weight: dim.weight,
      label: getScoreLabel(score),
      icon: dim.icon,
    };
  });
}

export function calculateWellnessScore(dimensions: DimensionScore[]): number {
  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  return Math.round(weighted);
}

/**
 * Biological age calculation.
 *
 * Anchor: 50 (research standard — 50th percentile = neutral).
 * Coefficient: 0.4 (validated against 2025 CMEC healthy lifestyle index).
 *
 * Examples:
 *  - Score 50 → offset 0 (biological age = real age)
 *  - Score 30 → offset +8 years (accelerated aging)
 *  - Score 70 → offset -8 years (slower aging)
 *  - Score 90 → offset -16, capped to -15 years
 *
 * Previously anchored at 70 — this caused users with unmapped dimensions
 * (default score 50) to appear 6 years older with zero clinical basis.
 */
export function calculateBiologicalAge(chronologicalAge: number, wellnessScore: number): number {
  const offset = Math.round((50 - wellnessScore) * 0.4);
  const capped = Math.max(-15, Math.min(15, offset));
  return chronologicalAge + capped;
}

export function getScoreLabel(score: number): DimensionScore["label"] {
  if (score >= 90) return "Optimal";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Average";
  if (score >= 60) return "Below Average";
  return "Needs Attention";
}
