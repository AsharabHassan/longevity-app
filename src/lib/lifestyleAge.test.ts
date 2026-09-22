import { describe, expect, it } from "vitest";
import {
  BAND,
  CAP_MAX,
  NON_SMOKER_MAX,
  bmiYears,
  calculateLifestyleAge,
  combineOffsets,
  sleepYears,
  topDrivers,
  whatIf,
} from "./lifestyleAge";
import type { QuizAnswer } from "./types";

function answers(age: number, values: Record<string, string | string[]>, body?: { heightCm: number; weightKg: number }): QuizAnswer[] {
  const list: QuizAnswer[] = [{ questionId: "age", value: age, label: String(age) }];
  for (const [questionId, value] of Object.entries(values)) {
    list.push({ questionId, value, label: Array.isArray(value) ? value.join(", ") : value });
  }
  if (body) list.push({ questionId: "body", value: JSON.stringify(body), label: "body" });
  return list;
}

const BEST = {
  smoking: "never",
  activity: "strength",
  diet: "wholefood",
  sleepHours: "7to8",
  sleepQuality: "good",
  alcohol: "none",
  stress: "low",
  social: "strong",
};

const WORST = {
  smoking: "currentHeavy",
  activity: "sedentary",
  diet: "processed",
  sleepHours: "under6",
  sleepQuality: "poor",
  alcohol: "over35",
  stress: "highNoRecovery",
  social: "isolated",
};

describe("calculateLifestyleAge", () => {
  it("can come out younger: best answers land well below calendar age", () => {
    const r = calculateLifestyleAge(answers(45, BEST, { heightCm: 178, weightKg: 72 }));
    expect(r.offsetYears).toBe(-5.5);
    expect(r.estimate).toBe(40);
    expect(r.low).toBe(40 - BAND);
    expect(r.high).toBe(40 + BAND);
  });

  it("caps the worst case at the upper limit", () => {
    const r = calculateLifestyleAge(answers(50, WORST, { heightCm: 170, weightKg: 110 }));
    expect(r.offsetYears).toBe(CAP_MAX);
    expect(r.estimate).toBe(62);
  });

  it("is neutral for typical answers", () => {
    const r = calculateLifestyleAge(
      answers(40, {
        smoking: "never",
        activity: "some",
        diet: "mixed",
        sleepHours: "6to7",
        sleepQuality: "okay",
        alcohol: "within14",
        stress: "moderate",
        social: "some",
      }, { heightCm: 175, weightKg: 82 })
    );
    expect(r.offsetYears).toBe(0);
    expect(r.estimate).toBe(40);
  });

  it("halves offsets for under-30s", () => {
    const r = calculateLifestyleAge(answers(25, { ...BEST, activity: "sedentary", smoking: "currentLight" }));
    // sedentary +2.5, diet -1.5, sleep -0.5, stress -0.5, social -0.5 = -0.5; + smoking 4 = 3.5; halved
    expect(r.offsetYears).toBe(1.75);
  });

  it("ignores concerns and goal entirely", () => {
    const base = calculateLifestyleAge(answers(45, BEST));
    const withConcerns = calculateLifestyleAge(
      answers(45, { ...BEST, goal: "energy", concerns: ["Brain fog", "Persistent tiredness", "Skin changes"] })
    );
    expect(withConcerns.estimate).toBe(base.estimate);
    expect(withConcerns.concerns).toEqual(["Brain fog", "Persistent tiredness", "Skin changes"]);
  });

  it("drops 'None of the above' from concerns", () => {
    const r = calculateLifestyleAge(answers(45, { ...BEST, concerns: ["None of the above"] }));
    expect(r.concerns).toEqual([]);
  });

  it("treats a skipped body question as neutral", () => {
    const r = calculateLifestyleAge(answers(45, BEST));
    const bmi = r.factors.find((f) => f.id === "bmi")!;
    expect(bmi.years).toBe(0);
    expect(bmi.answerLabel).toBe("Not provided");
  });

  it("never returns NaN for an empty quiz", () => {
    const r = calculateLifestyleAge([]);
    expect(Number.isFinite(r.estimate)).toBe(true);
    expect(r.offsetYears).toBe(0);
  });
});

describe("combineOffsets", () => {
  it("only lets smoking push past the non-smoker maximum", () => {
    const nonSmoker = combineOffsets(50, { activity: 2.5, bmi: 4, diet: 1.5, sleep: 2, alcohol: 2, stress: 1.5, social: 1 });
    expect(nonSmoker.offsetYears).toBe(NON_SMOKER_MAX);
    const smoker = combineOffsets(50, { smoking: 4, activity: 2.5, bmi: 4, diet: 1.5, sleep: 2, alcohol: 2, stress: 1.5, social: 1 });
    expect(smoker.offsetYears).toBe(CAP_MAX);
  });
});

describe("factor rules", () => {
  it("scores BMI bands", () => {
    expect(bmiYears(17)).toBe(1.5);
    expect(bmiYears(22)).toBe(-0.5);
    expect(bmiYears(27)).toBe(0);
    expect(bmiYears(32)).toBe(2);
    expect(bmiYears(38)).toBe(4);
  });

  it("caps sleep at +2 and only rewards 7-8h of good sleep", () => {
    expect(sleepYears("under6", "poor")).toBe(2);
    expect(sleepYears("7to8", "good")).toBe(-0.5);
    expect(sleepYears("7to8", "okay")).toBe(0);
    expect(sleepYears("7to8", "poor")).toBe(0.5);
    expect(sleepYears("over9", "good")).toBe(1);
  });
});

describe("report helpers", () => {
  const r = calculateLifestyleAge(answers(48, { ...BEST, activity: "sedentary", sleepHours: "under6", sleepQuality: "poor", alcohol: "15to35" }));

  it("ranks the biggest drivers first and excludes helping factors", () => {
    expect(topDrivers(r).map((f) => f.id)).toEqual(["activity", "sleep", "alcohol"]);
  });

  it("what-if lowers the estimate by the change in that factor", () => {
    const after = whatIf(r, ["activity"]);
    expect(after.offsetYears).toBe(r.offsetYears - 4); // +2.5 -> -1.5
    expect(whatIf(r, []).estimate).toBe(r.estimate);
  });
});
