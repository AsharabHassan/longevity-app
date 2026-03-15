import { NextRequest, NextResponse } from "next/server";
import { selectAdaptiveQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { symptoms, availableQuestionIds } = await req.json();
    const selected = await selectAdaptiveQuestions(symptoms, availableQuestionIds);
    return NextResponse.json({ questionIds: selected });
  } catch (error) {
    console.error("Adaptive selection failed:", error);
    // Fallback: return first 2 available
    try {
      const body = await req.clone().json();
      return NextResponse.json({
        questionIds: body.availableQuestionIds?.slice(0, 2) ?? [],
      });
    } catch {
      return NextResponse.json({ questionIds: [] });
    }
  }
}
