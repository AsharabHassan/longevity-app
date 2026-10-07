/**
 * Landing-page headline per ad. The ad's link carries a neutral code in
 * utm_content (E1, E2, E3), so the page repeats what the ad promised.
 * Codes are neutral on purpose: no health words in URLs or event names.
 */
export interface LandingHeadline {
  line: string;
  gold: string;
  sub: string;
}

const FULL_SUB =
  "Take the free 3-minute check for your biological age estimate. Our team will then call to explain the full wellness assessment: blood, DNA and epigenetic testing, explained by a doctor.";

export const DEFAULT_HEADLINE: LandingHeadline = {
  line: "Find your biological age",
  gold: "estimate in 3 minutes.",
  sub: "A short questionnaire. Three minutes. An honest estimate of how your habits compare with the research — and a free call with our team to go through it.",
};

const BY_CODE: Record<string, LandingHeadline> = {
  E1: { line: "Tired, foggy, run down", gold: "even though your bloods came back normal?", sub: FULL_SUB },
  E2: { line: "Been exhausted for months?", gold: "Get a proper wellness assessment.", sub: FULL_SUB },
  E3: { line: "Told it's just stress?", gold: "Find out what's behind it.", sub: FULL_SUB },
};

/** Only a short alphanumeric code is accepted, so a link can never inject text into the page. */
export function cleanAdCode(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,20}$/.test(value) ? value : "";
}

export function headlineFor(code: unknown): LandingHeadline {
  return BY_CODE[cleanAdCode(code).toUpperCase()] ?? DEFAULT_HEADLINE;
}
