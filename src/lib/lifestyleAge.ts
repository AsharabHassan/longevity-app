import { CITATIONS } from "./evidence";
import { NONE_OF_THE_ABOVE } from "./questions";
import type {
  BodyMeasurements,
  Citation,
  FactorId,
  FactorResult,
  LifestyleAgeResult,
  QuizAnswer,
} from "./types";

/**
 * Lifestyle Age Estimate.
 *
 * Additive year offsets from a "typical adult" reference (positive = older),
 * anchored to published cohort studies and converted to years with the
 * effective-age method (Spiegelhalter 2016), then shrunk for overlap between
 * factors. Full derivation and sources:
 * docs/superpowers/research/2026-09-21-biological-age-evidence.md §5.2
 *
 * This is an estimate from a questionnaire, never a measurement. Symptoms and
 * goals are deliberately not inputs.
 */

export const CAP_MIN = -6;
export const CAP_MAX = 12;
/** Only smoking can push the total beyond this. */
export const NON_SMOKER_MAX = 8;
/** Displayed uncertainty band either side of the estimate. */
export const BAND = 2;
/** Cohort evidence comes from ages 40+, so offsets are halved below this age. */
export const YOUNG_ADULT_AGE = 30;

export type Offsets = Partial<Record<FactorId, number>>;

const SMOKING_YEARS: Record<string, number> = {
  never: 0,
  quit10plus: 0.5,
  quitRecent: 2,
  currentLight: 4,
  currentHeavy: 6,
};

const ACTIVITY_YEARS: Record<string, number> = {
  strength: -2,
  active: -1.5,
  some: 0,
  sedentary: 2.5,
};

const DIET_YEARS: Record<string, number> = {
  wholefood: -1.5,
  mixed: 0,
  processed: 1.5,
};

const SLEEP_HOURS_YEARS: Record<string, number> = {
  under6: 1.5,
  "6to7": 0,
  "7to8": 0,
  "8to9": 0,
  over9: 1,
};

const ALCOHOL_YEARS: Record<string, number> = {
  none: 0,
  within14: 0,
  "15to35": 1,
  over35: 2,
};

const STRESS_YEARS: Record<string, number> = {
  low: -0.5,
  moderate: 0,
  high: 1,
  highNoRecovery: 1.5,
};

const SOCIAL_YEARS: Record<string, number> = {
  strong: -0.5,
  some: 0,
  isolated: 1,
};

export function bmiFrom(body: BodyMeasurements): number {
  const m = body.heightCm / 100;
  return body.weightKg / (m * m);
}

export function bmiYears(bmi: number): number {
  if (bmi < 18.5) return 1.5;
  if (bmi < 25) return -0.5;
  if (bmi < 30) return 0;
  if (bmi < 35) return 2;
  return 4;
}

export function sleepYears(hours: string | undefined, quality: string | undefined): number {
  const base = SLEEP_HOURS_YEARS[hours ?? ""] ?? 0;
  if (quality === "poor") return Math.min(2, base + 0.5);
  if (hours === "7to8" && quality === "good") return -0.5;
  return base;
}

/** Applies the smoking rule, the under-30 adjustment and the overall caps. */
export function combineOffsets(age: number, offsets: Offsets) {
  const smoking = offsets.smoking ?? 0;
  const others = Object.entries(offsets)
    .filter(([id]) => id !== "smoking")
    .reduce((sum, [, years]) => sum + (years ?? 0), 0);

  let total = Math.min(others, NON_SMOKER_MAX) + smoking;
  if (age < YOUNG_ADULT_AGE) total *= 0.5;
  total = Math.max(CAP_MIN, Math.min(CAP_MAX, total));

  const estimate = Math.round(age + total);
  return { estimate, low: estimate - BAND, high: estimate + BAND, offsetYears: total };
}

function parseBody(value: QuizAnswer["value"] | undefined): BodyMeasurements | null {
  if (typeof value !== "string") return null;
  try {
    const body = JSON.parse(value) as BodyMeasurements;
    if (body.heightCm > 0 && body.weightKg > 0) return body;
  } catch {
    /* skipped or malformed — treated as not provided */
  }
  return null;
}

function status(years: number): FactorResult["status"] {
  if (years < 0) return "helping";
  if (years > 0) return "adding";
  return "neutral";
}

interface FactorSpec {
  id: FactorId;
  name: string;
  icon: string;
  confidence: FactorResult["confidence"];
  evidence: string;
  citations: Citation[];
  bestYears: number;
}

const FACTOR_SPECS: Record<FactorId, FactorSpec> = {
  smoking: {
    id: "smoking",
    name: "Smoking",
    icon: "cigarette",
    confidence: "high",
    evidence:
      "In a study of over 200,000 US adults, current smokers had around three times the death rate of people who had never smoked, and those who quit before 45 regained most of the years lost.",
    citations: [CITATIONS.jha2013],
    bestYears: 0,
  },
  activity: {
    id: "activity",
    name: "Physical activity",
    icon: "dumbbell",
    confidence: "high",
    evidence:
      "In the Million Veteran Program, a study of more than 700,000 adults, physical inactivity was one of the habits most strongly linked to earlier death — roughly 30–45% higher mortality.",
    citations: [CITATIONS.nguyen2024, CITATIONS.li2018],
    bestYears: -2,
  },
  bmi: {
    id: "bmi",
    name: "Body weight",
    icon: "scale",
    confidence: "high",
    evidence:
      "A pooled analysis of 239 studies and 10.6 million adults found mortality was lowest at a BMI of about 20–25 and rose steadily above 30. BMI is a rough guide: it can't tell muscle from fat.",
    citations: [CITATIONS.bmi2016],
    bestYears: -0.5,
  },
  diet: {
    id: "diet",
    name: "Diet",
    icon: "apple",
    confidence: "moderate",
    evidence:
      "A poor diet was linked to about 20% higher mortality in the Million Veteran Program, and diet was the largest lifestyle contributor to measured biological ageing in a 2025 cohort study.",
    citations: [CITATIONS.nguyen2024, CITATIONS.zhang2025],
    bestYears: -1.5,
  },
  sleep: {
    id: "sleep",
    name: "Sleep",
    icon: "moon",
    confidence: "moderate",
    evidence:
      "In a US study of 3,795 adults, sleeping under 6 hours was associated with a DNA-based age measure about 1.3 years older, and insomnia symptoms with about half a year.",
    citations: [CITATIONS.kusters2024],
    bestYears: -0.5,
  },
  alcohol: {
    id: "alcohol",
    name: "Alcohol",
    icon: "wine",
    confidence: "moderate",
    evidence:
      "Binge drinking was linked to about 20% higher mortality in the Million Veteran Program, and heavier drinking tracked with faster DNA-based ageing in the Framingham Heart Study.",
    citations: [CITATIONS.nguyen2024, CITATIONS.alcohol2023],
    bestYears: 0,
  },
  stress: {
    id: "stress",
    name: "Stress",
    icon: "heart",
    confidence: "low",
    evidence:
      "The evidence here is weaker. Cumulative stress shows a small association with DNA-based ageing, and it largely disappears in people who recover well between stressful periods.",
    citations: [CITATIONS.harvanek2021],
    bestYears: -0.5,
  },
  social: {
    id: "social",
    name: "Social connection",
    icon: "users",
    confidence: "low",
    evidence:
      "Across 148 studies, people with stronger social relationships had about 50% better odds of survival — though this kind of evidence can't prove cause and effect.",
    citations: [CITATIONS.holtLunstad2010],
    bestYears: -0.5,
  },
};

/** The realistic next step for each answer, used by the what-if simulator. */
function improvementFor(
  id: FactorId,
  value: string | undefined,
  years: number,
  bmi: number | null
): FactorResult["improvement"] {
  switch (id) {
    case "smoking":
      if (value === "currentLight" || value === "currentHeavy")
        return { label: "If you stopped smoking", years: SMOKING_YEARS.quitRecent };
      return undefined;
    case "activity":
      if (value === "sedentary" || value === "some")
        return { label: "If you reached 150 minutes of activity a week", years: ACTIVITY_YEARS.active };
      if (value === "active")
        return { label: "If you added strength training", years: ACTIVITY_YEARS.strength };
      return undefined;
    case "bmi":
      if (bmi === null) return undefined;
      if (bmi >= 35) return { label: "If your BMI came down below 35", years: 2 };
      if (bmi >= 30) return { label: "If your BMI came down below 30", years: 0 };
      if (bmi >= 25) return { label: "If your BMI came down below 25", years: -0.5 };
      if (bmi < 18.5) return { label: "If your BMI came up to 18.5 or more", years: -0.5 };
      return undefined;
    case "diet":
      if (value === "processed") return { label: "If about half your meals were whole foods", years: DIET_YEARS.mixed };
      if (value === "mixed") return { label: "If you ate mostly whole foods", years: DIET_YEARS.wholefood };
      return undefined;
    case "sleep":
      if (years > -0.5) return { label: "If you slept 7–8 hours and woke refreshed", years: -0.5 };
      return undefined;
    case "alcohol":
      if (years > 0) return { label: "If you kept to 14 units a week", years: 0 };
      return undefined;
    case "stress":
      if (years > 0) return { label: "If stress came down to a manageable level", years: 0 };
      return undefined;
    case "social":
      if (value === "isolated") return { label: "If you saw friends or family a little more often", years: 0 };
      if (value === "some") return { label: "If you saw friends or family most weeks", years: SOCIAL_YEARS.strong };
      return undefined;
  }
}

export function calculateLifestyleAge(answers: QuizAnswer[]): LifestyleAgeResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  const val = (id: string) => {
    const v = byId.get(id)?.value;
    return typeof v === "string" ? v : undefined;
  };
  const label = (id: string) => byId.get(id)?.label ?? "Not answered";

  const ageValue = byId.get("age")?.value;
  const chronologicalAge = typeof ageValue === "number" ? ageValue : parseInt(String(ageValue ?? "40"), 10) || 40;

  const body = parseBody(byId.get("body")?.value);
  const bmi = body ? bmiFrom(body) : null;

  const years: Record<FactorId, number> = {
    smoking: SMOKING_YEARS[val("smoking") ?? ""] ?? 0,
    activity: ACTIVITY_YEARS[val("activity") ?? ""] ?? 0,
    bmi: bmi === null ? 0 : bmiYears(bmi),
    diet: DIET_YEARS[val("diet") ?? ""] ?? 0,
    sleep: sleepYears(val("sleepHours"), val("sleepQuality")),
    alcohol: ALCOHOL_YEARS[val("alcohol") ?? ""] ?? 0,
    stress: STRESS_YEARS[val("stress") ?? ""] ?? 0,
    social: SOCIAL_YEARS[val("social") ?? ""] ?? 0,
  };

  const answerLabels: Record<FactorId, string> = {
    smoking: label("smoking"),
    activity: label("activity"),
    bmi: bmi === null ? "Not provided" : `BMI ${bmi.toFixed(1)}`,
    diet: label("diet"),
    sleep: `${label("sleepHours")} · ${label("sleepQuality")}`,
    alcohol: label("alcohol"),
    stress: label("stress"),
    social: label("social"),
  };

  const factorValue: Record<FactorId, string | undefined> = {
    smoking: val("smoking"),
    activity: val("activity"),
    bmi: undefined,
    diet: val("diet"),
    sleep: val("sleepHours"),
    alcohol: val("alcohol"),
    stress: val("stress"),
    social: val("social"),
  };

  const factors: FactorResult[] = (Object.keys(FACTOR_SPECS) as FactorId[]).map((id) => {
    const spec = FACTOR_SPECS[id];
    return {
      id,
      name: spec.name,
      icon: spec.icon,
      years: years[id],
      bestYears: spec.bestYears,
      answerLabel: answerLabels[id],
      status: status(years[id]),
      confidence: spec.confidence,
      evidence: spec.evidence,
      citations: spec.citations,
      improvement: improvementFor(id, factorValue[id], years[id], bmi),
    };
  });

  const combined = combineOffsets(chronologicalAge, years);

  const concernsValue = byId.get("concerns")?.value;
  const concerns = Array.isArray(concernsValue)
    ? concernsValue.filter((c) => c !== NONE_OF_THE_ABOVE)
    : [];

  return {
    chronologicalAge,
    ...combined,
    factors,
    concerns,
    lifestyleScore: Math.round(((CAP_MAX - combined.offsetYears) / (CAP_MAX - CAP_MIN)) * 100),
  };
}

/** Factors adding years, largest first — the report's "what's driving this" tiles. */
export function topDrivers(result: LifestyleAgeResult, count = 3): FactorResult[] {
  return result.factors
    .filter((f) => f.years > 0)
    .sort((a, b) => b.years - a.years)
    .slice(0, count);
}

/** Recomputes the estimate with some factors moved to their improvement target. */
export function whatIf(result: LifestyleAgeResult, applied: FactorId[]) {
  const offsets: Offsets = {};
  for (const f of result.factors) {
    offsets[f.id] = applied.includes(f.id) && f.improvement ? f.improvement.years : f.years;
  }
  return combineOffsets(result.chronologicalAge, offsets);
}
