import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2000,
    system:
      "You are a Harley Street longevity specialist writing a personalized wellness report. Write in a warm, authoritative tone — professional but accessible. Reference biological mechanisms in plain language. Every recommendation must be tied to the user's specific answers and scores. Do NOT use generic text. Return valid JSON only — no markdown fences, no explanation.",
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
  // Handle potential markdown code fences
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function chatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context: {
    answers: Record<string, string | string[] | number>;
    wellnessScore: number;
    biologicalAge: number;
    treatments: string[];
  }
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 500,
    system: `You are the AI Longevity Advisor at Harley Street Medical Wellness (London & Glasgow). You have the user's complete quiz results and are helping them understand their report.

Context: Wellness Score ${context.wellnessScore}/100, Biological Age ${context.biologicalAge}, Recommended treatments: ${context.treatments.join(", ")}.
Full quiz answers: ${JSON.stringify(context.answers)}

Rules:
- Answer questions about their scores and what they mean
- Explain treatments in detail (mechanism, duration, safety, what to expect)
- Handle pricing objections honestly and confidently
- Compare treatments for their specific situation
- Guide toward booking a free consultation naturally
- NEVER give medical diagnoses
- NEVER contradict their doctor's advice
- NEVER discuss competitors
- Keep responses concise (2-4 sentences)
- Use a warm, professional tone`,
    messages,
  });

  return (response.content[0] as Anthropic.TextBlock).text;
}
