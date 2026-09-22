import { consultationHost } from "./clinic";
import { topDrivers } from "./lifestyleAge";
import type { LifestyleAgeResult } from "./types";

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The facts the summary may use — shared by the AI prompt and the fallback template. */
export function summaryFacts(result: LifestyleAgeResult) {
  return {
    calendarAge: result.chronologicalAge,
    estimateLow: result.low,
    estimateHigh: result.high,
    addingYears: topDrivers(result).map((f) => ({ factor: f.name.toLowerCase(), answer: f.answerLabel })),
    helping: result.factors.filter((f) => f.years < 0).map((f) => f.name.toLowerCase()),
    concerns: result.concerns.map((c) => c.toLowerCase()),
  };
}

/** Deterministic summary, used when the AI wording is unavailable or fails its checks. */
export function templateSummary(result: LifestyleAgeResult, firstName: string, qualified = true): string {
  const facts = summaryFacts(result);
  const opener = `${firstName ? `${firstName}, your` : "Your"} answers put your lifestyle age estimate at ${facts.estimateLow}–${facts.estimateHigh}, against a calendar age of ${facts.calendarAge}.`;

  const drivers = facts.addingYears.map((d) => d.factor);
  const middle =
    drivers.length > 0
      ? `The biggest contributors are ${list(drivers)}${facts.helping.length > 0 ? `, while ${list(facts.helping.slice(0, 3))} ${facts.helping.length === 1 ? "is" : "are"} working in your favour` : ""}.`
      : facts.helping.length > 0
        ? `Nothing in your answers is adding years, and ${list(facts.helping.slice(0, 3))} ${facts.helping.length === 1 ? "is" : "are"} working in your favour.`
        : "Your answers are close to average across the board.";

  const concerns =
    facts.concerns.length > 0
      ? ` You also mentioned ${list(facts.concerns.slice(0, 3))}, which didn't change the estimate but ${facts.concerns.length === 1 ? "is" : "are"} worth looking into properly.`
      : "";

  const close = qualified
    ? ` The free consultation with ${consultationHost()} is where you can go through this properly.`
    : " The sections below show the research behind each figure.";

  return `${opener} ${middle}${concerns}${close}`;
}
