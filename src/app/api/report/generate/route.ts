import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = await generateReport(
      body.answers,
      body.dimensions,
      body.wellnessScore,
      body.biologicalAge,
      body.chronologicalAge,
      body.primaryTreatment,
      body.supportingTreatments
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
