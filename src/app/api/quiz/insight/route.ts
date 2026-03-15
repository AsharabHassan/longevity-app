import { NextRequest, NextResponse } from "next/server";
import { generateMicroInsight } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // QuizEngine sends { questionId, answers } where answers is QuizAnswer[]
    const questionId: string = body.questionId ?? body.triggerQuestion ?? "";
    const rawAnswers = body.answers ?? [];

    // Extract age from answers array
    let age = 35;
    const answersRecord: Record<string, string | string[] | number> = {};
    for (const a of rawAnswers) {
      if (a.questionId) {
        answersRecord[a.questionId] = a.value;
        if (a.questionId === "q1" && typeof a.value === "number") {
          age = a.value;
        }
      }
    }

    // If age was passed directly, use that
    if (body.age && typeof body.age === "number") {
      age = body.age;
    }

    const insight = await generateMicroInsight(age, answersRecord, questionId);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return NextResponse.json({ insight: null }, { status: 200 });
  }
}
