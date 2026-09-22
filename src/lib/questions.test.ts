import { describe, expect, it } from "vitest";
import { QUIZ_SEQUENCE, isQualified } from "./questions";

describe("isQualified", () => {
  it("is false only when they say they would not invest", () => {
    expect(isQualified([{ questionId: "investment", value: "no" }])).toBe(false);
    expect(isQualified([{ questionId: "investment", value: "yes" }])).toBe(true);
    expect(isQualified([{ questionId: "investment", value: "yesIfValue" }])).toBe(true);
    expect(isQualified([])).toBe(true);
  });

  it("asks the investment question before location", () => {
    const ids = QUIZ_SEQUENCE.map((q) => q.id);
    expect(ids.indexOf("investment")).toBe(ids.indexOf("location") - 1);
  });
});
