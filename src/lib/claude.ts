import Anthropic from "@anthropic-ai/sdk";
import {
  getEscalationTier,
  OBJECTION_PATTERNS,
  TREATMENT_DEEP_KNOWLEDGE,
  BOOKING_PROMPTS,
} from "./salesPlaybook";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

/* ── Micro-insight (unchanged) ────────────────────────── */
export async function generateMicroInsight(
  age: number,
  answers: Record<string, string | string[] | number>,
  triggerQuestion: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system:
      "You are a longevity science expert at Harley Street Medical Wellness. Generate a single fascinating, personalized health insight based on the user's quiz answers. Keep it to 2-3 sentences. Reference a real scientific mechanism. Be specific to their age and answers. Use a warm but authoritative tone. Do NOT recommend treatments yet.",
    messages: [
      {
        role: "user",
        content: `User age: ${age}. Answers so far: ${JSON.stringify(answers)}. Just answered question: ${triggerQuestion}. Generate a personalized micro-insight.`,
      },
    ],
  });

  return (response.content[0] as Anthropic.TextBlock).text;
}

/* ── Adaptive question selection (unchanged) ──────────── */
export async function selectAdaptiveQuestions(
  symptoms: string[],
  availableQuestionIds: string[]
): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system:
      "You select the 2 most relevant follow-up questions for a longevity quiz based on user symptoms. Return ONLY a JSON array of exactly 2 question IDs from the available list. No explanation, no markdown, just the JSON array.",
    messages: [
      {
        role: "user",
        content: `User symptoms: ${JSON.stringify(symptoms)}. Available question IDs: ${JSON.stringify(availableQuestionIds)}. Return the 2 most relevant as a JSON array.`,
      },
    ],
  });

  const text = (response.content[0] as Anthropic.TextBlock).text;
  return JSON.parse(text);
}

/* ── Report generation (unchanged) ────────────────────── */
export async function generateReport(
  answers: Record<string, string | string[] | number>,
  dimensions: Array<{ name: string; score: number }>,
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number,
  primaryTreatment: string,
  supportingTreatments: string[]
): Promise<{
  verdict: string;
  dimensionNarratives: Record<string, string>;
  riskFactors: Array<{ title: string; explanation: string }>;
  treatmentPlan: {
    primary: { name: string; reasoning: string };
    supporting: Array<{ name: string; reasoning: string }>;
    timeline: string;
  };
}> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system:
      `You are a Harley Street longevity specialist writing a personalized wellness report based on current longevity science.

Key research to reference when relevant:
- NAD+ levels decline ~50% per decade after age 30 (Imai & Guarente, Cell Metabolism 2014)
- Sleep <6 hours or >9 hours correlates with accelerated biological aging (MDPI Biological Age Study, 2018)
- Chronic stress shortens telomeres via cortisol-telomere feedback loop (multiple 2024 reviews)
- The biggest exercise benefit jump is from sedentary to moderate activity (WHO 2024, CMEC 2025)
- Glutathione IV shows visible skin improvement within 4-6 weeks (clinical trials)
- Low-dose methylene blue improved memory by 7% with enhanced prefrontal cortex activity (fMRI study, 2016)

Write in a warm, authoritative tone — professional but accessible. Reference biological mechanisms in plain language. Every recommendation must be tied to the user's specific answers and scores. Do NOT use generic text.

For dimension narratives:
- Reference the SPECIFIC biological mechanism (e.g., mitochondrial ATP production, glymphatic clearance, HPA axis)
- Tie the mechanism to their specific answer (e.g., "Your reported 5-6 hours of sleep means your glymphatic system has ~40% less time to clear neurotoxins")
- Explain the aging impact in concrete terms

Return valid JSON only — no markdown fences, no explanation.`,
    messages: [
      {
        role: "user",
        content: `Generate a personalized longevity report as JSON.

User data:
- Age: ${answers.q1}, Gender: ${answers.q2}
- Health goal: ${answers.q3}
- All answers: ${JSON.stringify(answers)}
- Dimension scores: ${JSON.stringify(dimensions)}
- Wellness Score: ${wellnessScore}/100
- Biological Age: ${biologicalAge} (actual: ${chronologicalAge})
- Primary treatment: ${primaryTreatment}
- Supporting treatments: ${JSON.stringify(supportingTreatments)}

Return this exact JSON structure:
{
  "verdict": "One compelling sentence about their biological age and what it means",
  "dimensionNarratives": { "Dimension Name": "2-3 sentence personalized narrative for each dimension" },
  "riskFactors": [{ "title": "Risk factor name", "explanation": "Plain language explanation tied to their specific answers" }],
  "treatmentPlan": {
    "primary": { "name": "Treatment name", "reasoning": "2-3 sentences explaining why this is specifically right for them" },
    "supporting": [{ "name": "Treatment name", "reasoning": "1-2 sentences explaining why this complements the primary" }],
    "timeline": "Month 1: ... → Month 2: ... → Month 3: ..."
  }
}`,
      },
    ],
  });

  const text = (response.content[0] as Anthropic.TextBlock).text;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

/* ── Sales-Trained Chat (UPGRADED) ────────────────────── */
export async function chatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context: {
    answers: Record<string, string | string[] | number>;
    wellnessScore: number;
    biologicalAge: number;
    treatments: string[];
  },
  messageCount: number = 0
): Promise<string> {
  const tier = getEscalationTier(messageCount);
  const randomBookingPrompt =
    BOOKING_PROMPTS[Math.floor(Math.random() * BOOKING_PROMPTS.length)];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    system: `You are the AI Longevity Advisor at Harley Street Medical Wellness (London & Glasgow). You have the user's complete quiz results and are a trained clinical sales consultant.

## USER CONTEXT
- Wellness Score: ${context.wellnessScore}/100
- Biological Age: ${context.biologicalAge}
- Full quiz answers: ${JSON.stringify(context.answers)}

## TREATMENT ALIGNMENT — CRITICAL
The user's report has already recommended these SPECIFIC treatments based on their scores:
→ PRIMARY: ${context.treatments[0] ?? "N/A"}
→ SUPPORTING: ${context.treatments.slice(1).join(", ") || "N/A"}

**YOU MUST ONLY RECOMMEND THESE EXACT TREATMENTS.** Never suggest alternatives or different treatments. When the user asks about treatments, always talk about "${context.treatments[0]}" as the #1 recommendation. If they ask "what treatment do you recommend?" or similar, always answer with the exact treatments above. This is critical for trust — the report and chat must say the same thing.

## CURRENT ESCALATION TIER: ${tier.label.toUpperCase()} (message ${messageCount} of conversation)
${tier.instructions}

${OBJECTION_PATTERNS}

${TREATMENT_DEEP_KNOWLEDGE}

## RESPONSE RULES
- ALWAYS tie responses to the user's SPECIFIC quiz answers and dimension scores
- ALWAYS recommend ONLY the treatments listed above — never deviate
- Use a warm, confident, professional tone — you are a Harley Street clinician, not a sales rep
- Keep responses concise: 2-5 sentences unless explaining a treatment mechanism
- NEVER give medical diagnoses or contradict their doctor
- NEVER sound desperate or pushy — you are an expert sharing knowledge
- When mentioning booking, use: "${randomBookingPrompt}" and include the link: https://calendly.com/harleystreet-wellness/free-consultation
- Frame it as a FREE online consultation — zero cost, zero obligation
- When the user asks about price, use the cost-comparison frameworks from the playbook
- Format key terms with <strong> tags for emphasis
- If the conversation has reached 20+ messages, naturally guide toward booking or a human handoff — do NOT abruptly cut off`,
    messages,
  });

  return (response.content[0] as Anthropic.TextBlock).text;
}

/* ── Streaming Analysis Show (NEW) ────────────────────── */
export async function streamAnalysis(
  answers: Record<string, string | string[] | number>,
  dimensions: Array<{ name: string; score: number }>,
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number,
  primaryTreatment: string,
  supportingTreatments: string[]
): Promise<AsyncIterable<Anthropic.MessageStreamEvent>> {
  const stream = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    stream: true,
    system: `You are a Harley Street longevity specialist performing a live cellular health analysis. You are analyzing each wellness dimension one by one, creating anticipation and educating the user.

Key research to cite naturally when relevant:
- NAD+ decline: ~50% per decade after age 30, drives mitochondrial dysfunction
- Sleep and biological age: <6 hrs = accelerated telomere shortening (MDPI 2018)
- Cortisol-telomere feedback: chronic stress literally shortens DNA protective caps
- Exercise benefit curve: biggest jump from sedentary → moderate (WHO/CMEC 2025)
- Glymphatic clearance: deep sleep flushes neurotoxins at 10× daytime rate

For EACH dimension, write a focused 2-3 sentence analysis that:
1. Names the specific biological mechanism affected
2. References the user's specific answer
3. Explains the aging impact in concrete terms

Use this exact format for each dimension:

---DIMENSION: [Exact Dimension Name]---
[Your 2-3 sentence analysis]

After all dimensions, write:

---VERDICT---
[One compelling sentence about their overall biological age and what it means for them]

---REPORT---
Then output the full report as a JSON object with this structure (no markdown fences):
{"verdict":"...","dimensionNarratives":{"Dimension Name":"..."},"riskFactors":[{"title":"...","explanation":"..."}],"treatmentPlan":{"primary":{"name":"...","reasoning":"..."},"supporting":[{"name":"...","reasoning":"..."}],"timeline":"Month 1: ... → Month 2: ... → Month 3: ..."}}

IMPORTANT:
- Analyze dimensions in this order: Sleep Quality, Energy & Vitality, Stress & Mental Wellness, Cognitive Function, Metabolic Health, Physical Activity, Immune Resilience, Cellular & Skin Health
- Reference the user's SPECIFIC answers, not generic advice
- Be warm but authoritative — you are a clinician, not a wellness influencer`,
    messages: [
      {
        role: "user",
        content: `Analyze my cellular health results:
- Age: ${answers.q1}, Gender: ${answers.q2}
- Health goal: ${answers.q3}
- All answers: ${JSON.stringify(answers)}
- Dimension scores: ${JSON.stringify(dimensions)}
- Wellness Score: ${wellnessScore}/100
- Biological Age: ${biologicalAge} (actual: ${chronologicalAge})
- Primary treatment: ${primaryTreatment}
- Supporting treatments: ${JSON.stringify(supportingTreatments)}

Perform a dimension-by-dimension analysis.`,
      },
    ],
  });

  return stream;
}

/* ── Dimension Deep-Dive (NEW) ────────────────────────── */
export async function generateDimensionDeepDive(
  dimensionName: string,
  score: number,
  answers: Record<string, string | string[] | number>,
  biologicalAge: number,
  recommendedTreatment: string
): Promise<{
  mechanism: string;
  agingImpact: string;
  treatmentConnection: string;
  timeline: string;
}> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `You are a Harley Street longevity specialist providing a detailed explanation of a single wellness dimension. Return valid JSON only — no markdown fences, no explanation. Be specific to the user's answers and scores.`,
    messages: [
      {
        role: "user",
        content: `Generate a deep-dive for this wellness dimension as JSON.

Dimension: ${dimensionName}
Score: ${score}/100
User answers: ${JSON.stringify(answers)}
Biological age: ${biologicalAge}
Recommended treatment: ${recommendedTreatment}

Return this exact JSON structure:
{
  "mechanism": "2-3 sentences explaining what's happening in their body at the cellular/molecular level for this specific dimension. Reference their specific answers.",
  "agingImpact": "2-3 sentences explaining how this dimension score specifically affects their biological aging rate. Reference real aging research.",
  "treatmentConnection": "2-3 sentences explaining how ${recommendedTreatment} specifically addresses this dimension. Reference the treatment's mechanism of action.",
  "timeline": "2-3 sentences describing the expected improvement timeline for this dimension with treatment. Be specific about weeks/months."
}`,
      },
    ],
  });

  const text = (response.content[0] as Anthropic.TextBlock).text;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
