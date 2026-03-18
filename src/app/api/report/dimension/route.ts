import { NextRequest, NextResponse } from "next/server";
import { generateDimensionDeepDive } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dimensionName, score, answers, biologicalAge, recommendedTreatment } = body;

    if (!dimensionName || score === undefined) {
      return NextResponse.json(
        { error: "Missing dimensionName or score" },
        { status: 400 }
      );
    }

    const deepDive = await generateDimensionDeepDive(
      dimensionName,
      score,
      answers ?? {},
      biologicalAge ?? 35,
      recommendedTreatment ?? "NAD+ IV Drip"
    );

    return NextResponse.json(deepDive);
  } catch (error) {
    console.error("Dimension deep-dive failed:", error);
    return NextResponse.json(
      { error: "Failed to generate deep-dive" },
      { status: 500 }
    );
  }
}
