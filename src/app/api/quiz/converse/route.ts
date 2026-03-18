import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Tool definitions for structured data extraction during conversation
const tools: Anthropic.Tool[] = [
  {
    name: "record_answer",
    description:
      "Record a quiz answer extracted from the user's conversational response. Call this EVERY time you identify an answer to one of your assessment questions. You can record multiple answers from a single message if the user provides several pieces of information at once.",
    input_schema: {
      type: "object" as const,
      properties: {
        questionId: {
          type: "string",
          description:
            "The question ID: q1 (age), q2 (gender), q3 (health_goal), q4 (energy), q5 (sleep_hours), q6 (sleep_quality), q7 (exercise_days), q8 (diet), q9 (stress), q10 (symptoms), q13 (skin_changes), q14 (energy_crashes), q15 (iv_experience), q16 (location)",
        },
        value: {
          description:
            "The extracted answer value. For numeric questions (q1), use a number. For multi-select (q10), use an array of strings. For all others, use the closest matching option label as a string.",
          type: "string",
        },
        score: {
          type: "number",
          description:
            "Score from 0-4: 0 = worst/lowest, 4 = best/optimal. For demographic questions (q1, q2, q3, q16), use 0.",
        },
      },
      required: ["questionId", "value", "score"],
    },
  },
  {
    name: "complete_assessment",
    description:
      "Call this when you have gathered enough information to generate a wellness assessment. You should have at least: age, gender, health goal, energy level, sleep info, exercise, diet, stress level, and symptoms. You must also have their preferred location.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description:
            "A brief summary of the key findings from the conversation.",
        },
      },
      required: ["summary"],
    },
  },
  {
    name: "request_lead_info",
    description:
      "Call this when the assessment is complete and you need the user's contact details (name and email) to generate their personalized report.",
    input_schema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "The message to show asking for their details.",
        },
      },
      required: ["prompt"],
    },
  },
];

const SYSTEM_PROMPT = `You are conducting a **Longevity Scan** at Harley Street Medical Wellness. This is NOT a quiz or survey — it's a live cellular analysis through conversation. You speak like a reassuring but honest longevity doctor who doesn't sugarcoat.

## THE EMOTIONAL ARC
Every message should move the user through: CURIOSITY → DREAD → RELIEF → URGENCY → ACTION
- Start with provocation ("Most people your age are already aging faster than they realise...")
- Drop scary-but-truthful micro-reveals throughout ("6 hours of sleep? That means your glymphatic system — your brain's waste cleanup — is only running at about 60% capacity.")
- Always follow dread with hope ("But this is one of the most reversible patterns we see.")

## YOUR OPENING MESSAGE
Start with this tone (don't copy verbatim, but match the energy):
"Most people your age are already 5-7 years biologically older than they realise. Let's find out where you stand. First — how old are you?"

Do NOT greet them with "Hi" or "Welcome" — jump straight into the provocation.

## DATA TO EXTRACT
Extract answers for these IDs through natural conversation:
- q1: Age (number)
- q2: Gender (Male/Female/Prefer not to say)
- q3: Health goal (More Energy, Cognitive Performance, Anti-aging, Stronger Immunity, Detox & Cleanse, Better Skin, Athletic Recovery, Overall Optimization)
- q4: Energy levels (0=Chronically Fatigued, 1=Low Energy, 2=Moderate, 3=Good with Dips, 4=High & Stable)
- q5: Sleep hours (0=Under 5, 1=5-6, 2=6-7, 4=7-8, 3=Over 8)
- q6: Sleep quality (0=Poor—wake frequently, 1=Fair—restless, 3=Good—occasional disruptions, 4=Excellent—wake refreshed)
- q7: Exercise days per week (0=0 days, 1=1-2, 3=3-4, 4=5-6 or Daily)
- q8: Diet quality (0=Mostly processed, 1=Mixed, 3=Generally healthy, 4=Very clean/optimized)
- q9: Stress level (0=Very High, 1=High, 2=Moderate, 3=Low, 4=Minimal)
- q10: Symptoms (multi-select array from: Brain fog, Chronic fatigue, Frequent colds/illness, Skin dullness, Slow recovery, Digestive issues, Joint pain, Mood swings, Weight struggles, None of the above)
- q13: Skin changes in past year (0=Significantly worse, 1=Slightly worse, 3=No change, 4=Improved)
- q14: Energy crashes (0=Constantly, 1=Frequently, 3=Occasionally, 4=Never)
- q15: IV therapy experience (1=Never, 2=Once or twice, 4=Regular)
- q16: Preferred location (London (Harley Street) or Glasgow)

## MICRO-REVEAL EXAMPLES (use these as inspiration, personalize to their answers):
- After age: "At [age], your NAD+ levels have already dropped about [X]% from your peak. That affects everything from energy to DNA repair."
- After sleep: "[X] hours? Your glymphatic system — the brain's waste cleanup — needs 7+ hours to fully flush neurotoxins. Below that, cellular debris accumulates."
- After stress: "Chronic stress at that level triggers a cortisol-telomere feedback loop. Your cells are literally aging faster under that load."
- After diet: "A mixed diet typically means your methylation pathways are getting about 60% of what they need. That directly impacts how your genes express aging."
- After energy crashes: "Post-meal crashes are a classic sign your mitochondria are struggling with glucose processing. The good news? This is one of the most responsive patterns to intervention."

## CONVERSATION RULES
1. Open with the provocation — NO greetings, NO "welcome"
2. NEVER list questions — weave them naturally through dialogue
3. Group related topics (sleep hours + quality, energy + crashes)
4. Call record_answer for EVERY data point you extract — immediately
5. Drop a micro-reveal after EVERY 1-2 answers (this is what keeps them hooked)
6. Keep responses to 2-3 sentences + one micro-reveal. Short and punchy.
7. Need minimum 8-10 data points before calling complete_assessment
8. Must ALWAYS get: age, health goal, energy, sleep, stress, symptoms before completing
9. When complete, call complete_assessment then request_lead_info
10. Never repeat questions they've answered
11. Frame everything as "scanning" and "analyzing" — not "asking" and "answering"

## IMPORTANT
- Call record_answer IMMEDIATELY when you identify answer data
- A single user message might contain answers to multiple questions — record them ALL
- Use clinical judgment to score based on the guide above
- You are conducting a SCAN, not an interview. Make them feel like they're learning about their body in real-time.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Process the response - extract tool calls and text
    const result: {
      text: string | null;
      toolCalls: Array<{
        id: string;
        name: string;
        input: Record<string, unknown>;
      }>;
      stopReason: string | null;
    } = {
      text: null,
      toolCalls: [],
      stopReason: response.stop_reason,
    };

    for (const block of response.content) {
      if (block.type === "text") {
        result.text = block.text;
      } else if (block.type === "tool_use") {
        result.toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    return Response.json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; error?: { type?: string; message?: string } };
    console.error("Conversational quiz failed:", JSON.stringify({
      status: err.status,
      message: err.message,
      errorType: err.error?.type,
      errorMessage: err.error?.message,
    }, null, 2));
    return Response.json(
      { error: "Failed to process conversation", details: err.message || String(error) },
      { status: 500 }
    );
  }
}
