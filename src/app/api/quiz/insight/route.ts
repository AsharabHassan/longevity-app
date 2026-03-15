import { NextRequest, NextResponse } from "next/server";
import { generateMicroInsight } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { age, answers, triggerQuestion } = await req.json();
    const insight = await generateMicroInsight(age, answers, triggerQuestion);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return NextResponse.json({ insight: null }, { status: 200 });
  }
}
