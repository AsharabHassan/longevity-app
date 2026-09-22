import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/claude";
import type { LifestyleAgeResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { result, firstName, qualified } = (await req.json()) as {
      result: LifestyleAgeResult;
      firstName?: string;
      qualified?: boolean;
    };
    return NextResponse.json(await generateSummary(result, firstName ?? "", qualified !== false));
  } catch (error) {
    console.error("Summary route failed:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
