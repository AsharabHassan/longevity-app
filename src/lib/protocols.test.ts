import { describe, expect, it } from "vitest";
import { NEVER_NAMED, findBlockedClaim } from "./compliance";
import { calculateLifestyleAge } from "./lifestyleAge";
import { PROTOCOLS, PROTOCOL_STAGES, discussionTopics, matchProtocols, protocolUrl, testsForConcerns } from "./protocols";
import type { QuizAnswer } from "./types";

function quiz(age: number, goal: string, concerns: string[], body?: { heightCm: number; weightKg: number }): QuizAnswer[] {
  const answers: QuizAnswer[] = [
    { questionId: "age", value: age, label: String(age) },
    { questionId: "goal", value: goal, label: goal },
    { questionId: "concerns", value: concerns, label: concerns.join(", ") },
  ];
  if (body) answers.push({ questionId: "body", value: JSON.stringify(body), label: "body" });
  return answers;
}

const match = (answers: QuizAnswer[]) => matchProtocols(answers, calculateLifestyleAge(answers)).map((p) => p.id);

describe("matchProtocols", () => {
  it("leads with concerns, and shows Clear Focus once for fog plus fatigue", () => {
    expect(match(quiz(46, "checkup", ["Brain fog", "Persistent tiredness"]))).toEqual(["brainFog"]);
  });

  it("adds the metabolic protocol when BMI is adding years", () => {
    expect(match(quiz(46, "energy", ["Brain fog"], { heightCm: 180, weightKg: 101 }))).toEqual(["brainFog", "metabolic"]);
  });

  it("falls back to healthy ageing for over-40s with nothing else, and nothing for under-40s", () => {
    expect(match(quiz(52, "checkup", []))).toEqual(["ageing"]);
    expect(match(quiz(31, "checkup", []))).toEqual([]);
  });

  it("never returns more than two", () => {
    expect(match(quiz(50, "ageing", ["Brain fog", "Weight changes", "Slow recovery"])).length).toBe(2);
  });
});

describe("protocol copy", () => {
  const allCopy = Object.values(PROTOCOLS).flatMap((p) => [
    p.name,
    p.concern,
    p.summary,
    p.review,
    ...p.components.flatMap((c) => [c.name, c.text]),
  ]);

  it("never names a prescription-only medicine, peptide or cell product", () => {
    for (const text of [...allCopy, ...discussionTopics(Object.values(PROTOCOLS))]) {
      expect(text).not.toMatch(NEVER_NAMED);
    }
  });

  it("makes no benefit claims about any component", () => {
    for (const text of allCopy) expect(findBlockedClaim(text)).toBeNull();
    for (const s of PROTOCOL_STAGES) expect(findBlockedClaim(s.text)).toBeNull();
  });

  it("lists the tests behind the concerns a person reported, without duplicates", () => {
    const tests = testsForConcerns(["Brain fog", "Persistent tiredness"]);
    expect(tests).toContain("Thyroid function");
    expect(new Set(tests).size).toBe(tests.length);
  });

  it("links to the right city", () => {
    expect(protocolUrl(PROTOCOLS.brainFog, "Glasgow")).toBe(
      "https://harleystreetmedicalwellness.co.uk/protocols/glasgow/brain-fog/"
    );
  });
});
