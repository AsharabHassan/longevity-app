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
      "High-dose immune support to strengthen your body's natural defenses.",
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

export function recommendTreatments(
  dimensions: DimensionScore[],
  symptoms: string[]
): TreatmentRecommendation {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const lowest = sorted.slice(0, 3);
  const lowestNames = new Set(lowest.map((d) => d.name));
  const lowCount = dimensions.filter((d) => d.score < 60).length;

  let primaryName: string;
  const supportingNames: string[] = [];

  // Upsell: 3+ dimensions below 60 → EBOO
  if (lowCount >= 3) {
    primaryName = "EBOO Therapy";
    supportingNames.push("NAD+ IV Drip", "Phospholipid Exchange IV");
  }
  // Detox signals: Metabolic < 50 AND digestive/joint symptoms
  else if (
    (dimensions.find((d) => d.name === "Metabolic Health")?.score ?? 100) < 50 &&
    symptoms.some((s) => ["Digestive issues", "Joint pain"].includes(s))
  ) {
    primaryName = "Detox IV Drip";
    supportingNames.push("NAD+ IV Drip");
  }
  // Energy + Sleep low
  else if (lowestNames.has("Energy & Vitality") && lowestNames.has("Sleep Quality")) {
    primaryName = "NAD+ IV Drip";
    supportingNames.push("Myers Cocktail");
  }
  // Cognitive + Energy
  else if (lowestNames.has("Cognitive Function") && lowestNames.has("Energy & Vitality")) {
    primaryName = "IV Methylene Blue";
    supportingNames.push("NAD+ IV Drip");
  }
  // Immune + Stress
  else if (
    lowestNames.has("Immune Resilience") &&
    lowestNames.has("Stress & Mental Wellness")
  ) {
    primaryName = "Immunity IV Drip";
    supportingNames.push("Myers Cocktail");
  }
  // Metabolic
  else if (lowestNames.has("Metabolic Health")) {
    primaryName = "Metabolic Health Programme";
    supportingNames.push("NAD+ IV Drip");
  }
  // Skin
  else if (lowestNames.has("Cellular & Skin Health")) {
    primaryName = "Skin Glow IV Drip";
    supportingNames.push("NAD+ IV Drip");
  }
  // Default
  else {
    primaryName = "NAD+ IV Drip";
    supportingNames.push("Myers Cocktail");
  }

  const primary = TREATMENTS.find((t) => t.name === primaryName)!;
  const supporting = supportingNames
    .map((n) => TREATMENTS.find((t) => t.name === n)!)
    .filter(Boolean);

  return { primary, supporting, reasoning: "" };
}
