import { QuizAnswer, DimensionScore } from "./types";

interface DimensionConfig {
  name: string;
  weight: number;
  questionIds: string[];
  icon: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { name: "Energy & Vitality", weight: 0.15, questionIds: ["q4", "q14"], icon: "zap" },
  { name: "Sleep Quality", weight: 0.15, questionIds: ["q5", "q6"], icon: "moon" },
  {
    name: "Cognitive Function",
    weight: 0.12,
    questionIds: ["q11-cognitive-clarity", "q11-cognitive-duration", "q11-fallback-vitality"],
    icon: "brain",
  },
  {
    name: "Immune Resilience",
    weight: 0.10,
    questionIds: ["q11-immune-frequency", "q11-immune-recovery"],
    icon: "shield",
  },
  {
    name: "Metabolic Health",
    weight: 0.12,
    questionIds: ["q8", "q14", "q11-metabolic-meals"],
    icon: "activity",
  },
  { name: "Physical Activity", weight: 0.12, questionIds: ["q7"], icon: "dumbbell" },
  {
    name: "Stress & Mental Wellness",
    weight: 0.12,
    questionIds: ["q9", "q11-stress-recovery"],
    icon: "heart",
  },
  {
    name: "Cellular & Skin Health",
    weight: 0.07,
    questionIds: ["q13", "q11-skin-response"],
    icon: "sparkles",
  },
  { name: "Readiness & Awareness", weight: 0.05, questionIds: ["q15"], icon: "target" },
];

export function calculateDimensionScores(answers: QuizAnswer[]): DimensionScore[] {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  return DIMENSIONS.map((dim) => {
    const relevantAnswers = dim.questionIds
      .map((id) => answerMap.get(id))
      .filter((a): a is QuizAnswer => a !== undefined);

    let score: number;
    if (relevantAnswers.length === 0) {
      score = 50; // neutral default if no answers match this dimension
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

export function calculateBiologicalAge(chronologicalAge: number, wellnessScore: number): number {
  const offset = Math.round((70 - wellnessScore) * 0.3);
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
