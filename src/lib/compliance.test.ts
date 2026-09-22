import { describe, expect, it } from "vitest";
import { findBlockedTerm, hasOnlyAllowedNumbers, mentionsBlockedTreatment } from "./compliance";

describe("findBlockedTerm", () => {
  it("catches treatments, plurals and claim stems", () => {
    expect(findBlockedTerm("Have you considered stem cells?")).toBe("stem cell");
    expect(findBlockedTerm("An NAD+ drip could help")).toBe("nad+");
    expect(findBlockedTerm("We can start reversing this")).toBe("revers");
    expect(findBlockedTerm("a full detoxification")).toBe("detox");
    expect(findBlockedTerm("Your mitochondria are struggling")).toBe("mitochondri");
  });

  it("does not match inside ordinary words", () => {
    expect(findBlockedTerm("Your data is kept secure and we will procure a kit.")).toBeNull();
    expect(findBlockedTerm("Healthy habits add up. This is not a diagnosis.")).toBeNull();
  });
});

describe("mentionsBlockedTreatment", () => {
  it("flags medicines but not lifestyle talk", () => {
    expect(mentionsBlockedTreatment("do you do BPC-157 or peptides?")).toBe(true);
    expect(mentionsBlockedTreatment("how much does Ozempic cost")).toBe(true);
    expect(mentionsBlockedTreatment("how can I sleep better?")).toBe(false);
  });
});

describe("hasOnlyAllowedNumbers", () => {
  it("rejects invented statistics", () => {
    expect(hasOnlyAllowedNumbers("Your estimate is 47-51 at age 45.", [47, 51, 45])).toBe(true);
    expect(hasOnlyAllowedNumbers("Sleep improves by 35% in a month.", [47, 51, 45])).toBe(false);
  });
});
