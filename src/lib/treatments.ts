import { Treatment, TreatmentRecommendation, DimensionScore } from "./types";

export const TREATMENTS: Treatment[] = [
  {
    name: "NAD+ IV Drip",
    price: 295,
    originalPrice: 349,
    description:
      "Replenishes cellular energy, supports DNA repair and anti-aging at the molecular level.",
    tags: ["Energy", "Sleep", "Anti-aging"],
    icon: "zap",
  },
  {
    name: "IV Methylene Blue",
    price: 395,
    description:
      "Targets mitochondrial dysfunction to restore cognitive clarity and mental energy.",
    tags: ["Cognitive", "Focus", "Mitochondrial"],
    icon: "brain",
  },
  {
    name: "Immunity IV Drip",
    price: 295,
    originalPrice: 395,
    description:
      "High-dose immune support to strengthen your body's natural defences.",
    tags: ["Immunity", "Recovery", "Prevention"],
    icon: "shield",
  },
  {
    name: "Myers Cocktail",
    price: 295,
    originalPrice: 375,
    description:
      "Classic vitamin and mineral infusion for overall wellness and energy restoration.",
    tags: ["Wellness", "Vitamins", "Energy"],
    icon: "beaker",
  },
  {
    name: "Detox IV Drip",
    price: 399,
    description:
      "Supports liver function and toxin elimination for a complete internal reset.",
    tags: ["Detox", "Liver", "Cleanse"],
    icon: "droplets",
  },
  {
    name: "Skin Glow IV Drip",
    price: 299,
    description:
      "Glutathione and vitamin C infusion for radiant, youthful-looking skin.",
    tags: ["Skin", "Collagen", "Anti-aging"],
    icon: "sparkles",
  },
  {
    name: "EBOO Therapy",
    price: 1995,
    description:
      "Advanced ozone blood treatment for comprehensive cellular detoxification and regeneration.",
    tags: ["Advanced", "Detox", "Regeneration"],
    icon: "atom",
  },
  {
    name: "Phospholipid Exchange IV",
    price: 425,
    description:
      "Repairs cell membranes and supports neurological function at the cellular level.",
    tags: ["Neurological", "Cell Repair", "Advanced"],
    icon: "layers",
  },
  {
    name: "Metabolic Health Programme",
    price: 1500,
    description:
      "Comprehensive metabolic optimization programme for lasting health transformation.",
    tags: ["Metabolic", "Programme", "Comprehensive"],
    icon: "trending-up",
  },
];

/**
 * Each treatment has affinity scores for dimensions and symptoms.
 * Higher affinity = more relevant when that dimension is LOW.
 */
interface TreatmentAffinity {
  /** Which dimensions this treatment helps (key = dimension name, value = affinity weight) */
  dimensions: Record<string, number>;
  /** Which symptoms boost this treatment's relevance */
  symptoms: string[];
  /** Minimum number of low dimensions before this is considered */
  minLowDimensions?: number;
}

const TREATMENT_AFFINITIES: Record<string, TreatmentAffinity> = {
  "NAD+ IV Drip": {
    dimensions: {
      "Energy & Vitality": 3,
      "Sleep Quality": 2.5,
      "Cognitive Function": 1.5,
      "Cellular & Skin Health": 1.5,
    },
    symptoms: ["Chronic fatigue", "Slow recovery"],
  },
  "IV Methylene Blue": {
    dimensions: {
      "Cognitive Function": 3.5,
      "Energy & Vitality": 1.5,
      "Stress & Mental Wellness": 1.5,
      "Immune Resilience": 0.5,
    },
    symptoms: ["Brain fog", "Mood swings"],
  },
  "Immunity IV Drip": {
    dimensions: {
      "Immune Resilience": 3.5,
      "Stress & Mental Wellness": 1,
      "Physical Activity": 0.5,
    },
    symptoms: ["Frequent colds/illness", "Slow recovery"],
  },
  "Myers Cocktail": {
    dimensions: {
      "Energy & Vitality": 2,
      "Immune Resilience": 1.5,
      "Physical Activity": 1.5,
      "Metabolic Health": 1,
    },
    symptoms: ["Chronic fatigue", "Frequent colds/illness"],
  },
  "Detox IV Drip": {
    dimensions: {
      "Metabolic Health": 3,
      "Cellular & Skin Health": 1.5,
      "Immune Resilience": 1,
    },
    symptoms: ["Digestive issues", "Skin dullness", "Weight struggles"],
  },
  "Skin Glow IV Drip": {
    dimensions: {
      "Cellular & Skin Health": 4,
      "Metabolic Health": 0.5,
    },
    symptoms: ["Skin dullness"],
  },
  "EBOO Therapy": {
    dimensions: {
      "Energy & Vitality": 1.5,
      "Immune Resilience": 1.5,
      "Metabolic Health": 1.5,
      "Cellular & Skin Health": 1.5,
      "Cognitive Function": 1,
    },
    symptoms: ["Chronic fatigue", "Slow recovery", "Digestive issues"],
    minLowDimensions: 2,
  },
  "Phospholipid Exchange IV": {
    dimensions: {
      "Cognitive Function": 2.5,
      "Cellular & Skin Health": 2,
      "Stress & Mental Wellness": 1,
      "Sleep Quality": 1,
    },
    symptoms: ["Brain fog", "Mood swings"],
  },
  "Metabolic Health Programme": {
    dimensions: {
      "Metabolic Health": 3.5,
      "Physical Activity": 2,
      "Energy & Vitality": 1,
    },
    symptoms: ["Weight struggles", "Digestive issues"],
    minLowDimensions: 2,
  },
};

export function recommendTreatments(
  dimensions: DimensionScore[],
  symptoms: string[]
): TreatmentRecommendation {
  const dimMap = new Map(dimensions.map((d) => [d.name, d.score]));
  const symptomsSet = new Set(symptoms);
  const lowDimCount = dimensions.filter((d) => d.score < 60).length;

  // Score every treatment
  const scored = TREATMENTS.map((treatment) => {
    const affinity = TREATMENT_AFFINITIES[treatment.name];
    if (!affinity) return { treatment, score: 0 };

    // Skip treatments with minLowDimensions requirement not met
    if (affinity.minLowDimensions && lowDimCount < affinity.minLowDimensions) {
      return { treatment, score: 0 };
    }

    let score = 0;

    // Dimension scoring: lower dimension score = higher treatment relevance
    for (const [dimName, weight] of Object.entries(affinity.dimensions)) {
      const dimScore = dimMap.get(dimName);
      if (dimScore !== undefined) {
        // Invert: a dimension score of 30 (bad) gives high treatment relevance
        // Formula: (100 - dimScore) / 100 * weight
        const deficit = (100 - dimScore) / 100;
        score += deficit * weight;
      }
    }

    // Symptom match bonus
    for (const symptom of affinity.symptoms) {
      if (symptomsSet.has(symptom)) {
        score += 0.8;
      }
    }

    return { treatment, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Primary = highest scored treatment
  const primary = scored[0].treatment;

  // Supporting = next 2 highest that are DIFFERENT from primary
  const supporting = scored
    .slice(1)
    .filter((s) => s.score > 0)
    .slice(0, 2)
    .map((s) => s.treatment);

  // If we somehow got no supporting, add Myers Cocktail as safe default
  if (supporting.length === 0) {
    const myers = TREATMENTS.find((t) => t.name === "Myers Cocktail");
    if (myers && myers.name !== primary.name) {
      supporting.push(myers);
    }
  }

  return { primary, supporting, reasoning: "" };
}
