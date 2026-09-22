/**
 * Guardrails for any AI-written text shown to users.
 *
 * UK law and the CAP Code bar advertising prescription-only and unlicensed
 * medicines (HMR 2012 regs 279/284, CAP 12.12), and the ASA has ruled against
 * efficacy claims for IV drips. The website, quiz result and chatbot all count
 * as advertising, so AI output is checked against this list before display.
 * Source: docs/superpowers/research/2026-09-21-stemcell-peptide-epigenetic-brief.md §D2
 */

/** Medicines, cell products and treatment names that must never appear. */
const BLOCKED_TREATMENTS = [
  "nad+", "nad iv", "nad drip", "nmn", "nicotinamide",
  "methylene blue", "glutathione", "myers", "phosphatidylcholine", "phospholipid", "pk protocol",
  "iv drip", "iv therapy", "infusion", "vitamin drip",
  "eboo", "ozone",
  "stem cell", "exosome", "mesenchymal", "msc", "wharton", "secretome", "young plasma",
  "peptide", "bpc-157", "bpc 157", "tb-500", "thymosin", "cjc-1295", "ipamorelin", "sermorelin",
  "tesamorelin", "epitalon", "epithalon", "mots-c", "ghk-cu", "mk-677", "hgh", "growth hormone",
  "semaglutide", "ozempic", "wegovy", "tirzepatide", "mounjaro", "liraglutide", "saxenda", "glp-1", "glp1",
  "skinny jab", "weight loss injection", "weight loss pen",
  "rapamycin", "metformin", "testosterone", "trt",
];

/** Claims the clinic cannot substantiate. */
const BLOCKED_CLAIMS = [
  "revers", "turn back", "years younger", "true age",
  "anti-aging", "anti-ageing", "detox", "toxin", "cleanse", "boost your immun", "immune boost",
  "clinically proven", "scientifically proven", "guarantee", "cure", "heal",
  "mitochondri", "telomere", "cellular", "glymphatic", "cortisol",
];

// Terms match from a word start ("cure" must not match "secure"); stems like
// "mitochondri" still match their longer forms.
const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const STEMS = new Set(["mitochondri", "boost your immun", "revers", "detox"]);
const toPattern = (term: string) =>
  new RegExp(`(?<![a-z0-9])${escape(term)}${STEMS.has(term) ? "" : "s?(?![a-z0-9])"}`, "i");

const TREATMENT_PATTERNS = BLOCKED_TREATMENTS.map((term) => ({ term, pattern: toPattern(term) }));
const CLAIM_PATTERNS = BLOCKED_CLAIMS.map((term) => ({ term, pattern: toPattern(term) }));

export function findBlockedTerm(text: string): string | null {
  return [...TREATMENT_PATTERNS, ...CLAIM_PATTERNS].find(({ pattern }) => pattern.test(text))?.term ?? null;
}

/** Claims only. For copy that may name a clinic service but must not promise anything about it. */
export function findBlockedClaim(text: string): string | null {
  return CLAIM_PATTERNS.find(({ pattern }) => pattern.test(text))?.term ?? null;
}

/**
 * Prescription-only medicines and unlicensed cell or peptide products. These
 * may not be named in any public copy, however carefully it is framed.
 */
export const NEVER_NAMED =
  /methylene blue|peptide|bpc|stem cell|exosome|semaglutide|ozempic|wegovy|tirzepatide|mounjaro|glp-?1|weight loss (injection|pen)/i;

/** True if the text names a medicine or treatment the chatbot may not discuss. */
export function mentionsBlockedTreatment(text: string): boolean {
  return TREATMENT_PATTERNS.some(({ pattern }) => pattern.test(text));
}

/** Every number in `text` must be one the caller supplied — stops invented statistics. */
export function hasOnlyAllowedNumbers(text: string, allowed: number[]): boolean {
  const allowedSet = new Set(allowed.map((n) => String(Math.abs(n))));
  const found = text.match(/\d+(?:\.\d+)?/g) ?? [];
  return found.every((n) => allowedSet.has(n));
}

export const SELF_HARM_PATTERN = /suicid|kill myself|self[- ]harm|end my life|overdose/i;

export const SELF_HARM_REPLY =
  "I'm an automated assistant and can't help with this, but people can, right now. If you're in danger call 999. You can call Samaritans free on 116 123 at any time, or NHS 111 and choose the mental health option.";

export const URGENT_PATTERN =
  /chest pain|can'?t breathe|short(ness)? of breath|stroke|faint|collapsed|severe bleeding|blood in/i;

export const URGENT_REPLY =
  "I can't help with this in chat, and it may need prompt medical attention. If it's an emergency call 999. For urgent advice call NHS 111, or contact your GP.";

export const REVERSAL_PATTERN = /revers|turn back|younger|undo|slow (down )?(my )?age?ing/i;

export const REVERSAL_REPLY =
  "No one can promise that. Your result is an estimate based on lifestyle and health factors; a lab test gives a measured baseline. Trials show that changes like activity, diet, sleep and not smoking shift ageing markers modestly over months to years. We can go through your results with you in a free consultation.";

export const SAFE_FALLBACK_REPLY =
  "That's one I'd rather not get wrong in chat. We can answer it properly in your free consultation — would you like the booking link?";

export const TREATMENT_DEFLECTION =
  "I'm not able to discuss specific medicines or treatments here. UK rules don't allow clinics to promote them, and whether any treatment is right for you can only be decided by a clinician who has assessed you. I can help you book a free consultation, where you can ask about any option.";
