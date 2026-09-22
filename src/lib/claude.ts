import Anthropic from "@anthropic-ai/sdk";
import { CLINIC, consultationHost } from "./clinic";
import { findBlockedTerm, hasOnlyAllowedNumbers } from "./compliance";
import { DISCLAIMER } from "./evidence";
import { summaryFacts, templateSummary } from "./summary";
import type { ChatMessage, LifestyleAgeResult } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MODEL = "claude-haiku-4-5-20251001";

/**
 * AI is used for wording only. The estimate, the drivers and every figure come
 * from lifestyleAge.ts; the model is given those facts and asked to phrase them.
 * Its output is rejected — and a fixed template used instead — if it contains a
 * blocked term or any number it was not given.
 */

const SUMMARY_SYSTEM = `You write a short personal summary of a lifestyle questionnaire result for a UK private clinic.

Use ONLY the facts in the user message. Write 3-4 sentences, at most 90 words, in warm, plain British English, addressed to the reader as "you".

Rules:
- Call the result a "lifestyle age estimate". It is an estimate from a questionnaire, never a measurement or a test result.
- Use no numbers other than the ones you are given.
- Never name or hint at any treatment, medicine, supplement, drip, injection, test brand or product.
- Do not explain biological mechanisms. Do not diagnose or suggest a cause for any concern.
- Make no promises and no claims that anything can be undone, fixed or improved by a set amount.
- Do not use alarmist language. If the estimate is older than the calendar age, be matter-of-fact and encouraging.
- CLOSING_RULE

Return the summary as plain text with no heading, quotes or formatting.`;

const CLOSING_QUALIFIED = `End by saying the free consultation with ${consultationHost()} is where they can go through it properly. Use that name and role exactly as written.`;
const CLOSING_UNQUALIFIED =
  "Do not mention a consultation, booking, the clinic's services or any next step with the clinic. End by pointing them to the research shown below.";

export async function generateSummary(
  result: LifestyleAgeResult,
  firstName: string,
  qualified = true
): Promise<{ text: string; source: "ai" | "template" }> {
  const fallback = { text: templateSummary(result, firstName, qualified), source: "template" as const };
  const facts = summaryFacts(result);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SUMMARY_SYSTEM.replace("CLOSING_RULE", qualified ? CLOSING_QUALIFIED : CLOSING_UNQUALIFIED),
      messages: [{ role: "user", content: JSON.stringify({ firstName, ...facts }) }],
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text.trim() : "";
    const allowedNumbers = [facts.calendarAge, facts.estimateLow, facts.estimateHigh];

    const offersWhenItShouldNot = !qualified && /consultation|book|appointment/i.test(text);
    if (!text || offersWhenItShouldNot || findBlockedTerm(text) || !hasOnlyAllowedNumbers(text, allowedNumbers)) {
      return fallback;
    }
    return { text, source: "ai" };
  } catch (error) {
    console.error("Summary generation failed:", error);
    return fallback;
  }
}

function chatSystem(result: LifestyleAgeResult): string {
  return `You are the AI assistant on the website of ${CLINIC.brand}, a private clinic in London and Glasgow. You are an automated assistant, not a clinician, and you say so if asked.

The visitor has just completed a lifestyle questionnaire. Their result, which is an ESTIMATE and not a measurement:
${JSON.stringify(summaryFacts(result))}

How the estimate works: eight lifestyle factors (smoking, activity, body weight, diet, sleep, alcohol, stress, social connection) are each converted to years using published population studies, then capped. Concerns the visitor reported do not change it. ${DISCLAIMER}

What you can do:
- Explain how the estimate was worked out and what each factor means, in plain British English.
- Give general, widely accepted lifestyle information (for example UK guidance of 150 minutes of activity a week, or 14 units of alcohol).
- Explain what happens in the free ${CLINIC.consultation.minutes}-minute consultation with ${consultationHost()}: a walk through their results, which tests are worth doing, and what a plan could look like.
- Say that the clinic offers blood tests and a saliva-based epigenetic age estimate, which is a wellness test and not a diagnosis.
- Help them book: ${CLINIC.bookingUrl}

What you must never do:
- Never name, describe, price, recommend or confirm the availability of any medicine, injection, drip, infusion, peptide, cell-based or ozone treatment, or supplement. If asked, say you can't discuss specific treatments in chat and that a clinician can cover any option in a consultation.
- Never diagnose, interpret symptoms, suggest a cause for a symptom, or advise on medication.
- Never say or imply that anything will reverse, undo or reduce their age, or promise any outcome or timeframe.
- Never explain biological mechanisms or quote statistics that are not in this prompt.
- For anything urgent or worrying, tell them to contact their GP, NHS 111, or 999 in an emergency.

Keep replies to 2-4 sentences. Do not push. Mention booking only when it is relevant or asked about.`;
}

export async function chatResponse(messages: ChatMessage[], result: LifestyleAgeResult): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: chatSystem(result),
    messages,
  });
  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}
