import { NextRequest, NextResponse } from "next/server";
import { selectAdaptiveQuestions } from "@/lib/claude";
import { ADAPTIVE_BANK, FALLBACK_ADAPTIVE } from "@/lib/questions";

function getAvailableIds(symptoms: string[]): string[] {
  const ids: string[] = [];
  for (const entry of ADAPTIVE_BANK) {
    if (entry.triggers.some((t) => symptoms.includes(t))) {
      for (const q of entry.questions) {
        ids.push(q.id);
      }
    }
  }
  if (ids.length === 0) {
    return FALLBACK_ADAPTIVE.map((q) => q.id);
  }
  return ids;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptoms: string[] = body.symptoms ?? [];
    const availableIds = body.availableQuestionIds ?? getAvailableIds(symptoms);

    if (availableIds.length === 0) {
      return NextResponse.json({
        questionIds: FALLBACK_ADAPTIVE.slice(0, 2).map((q) => q.id),
      });
    }

    const selected = await selectAdaptiveQuestions(symptoms, availableIds);
    return NextResponse.json({ questionIds: selected });
  } catch (error) {
    console.error("Adaptive selection failed:", error);
    // Fallback: return first 2 available from bank based on symptoms
    try {
      const body = await req.clone().json();
      const symptoms: string[] = body.symptoms ?? [];
      const ids = getAvailableIds(symptoms);
      return NextResponse.json({ questionIds: ids.slice(0, 2) });
    } catch {
      return NextResponse.json({
        questionIds: FALLBACK_ADAPTIVE.slice(0, 2).map((q) => q.id),
      });
    }
  }
}
