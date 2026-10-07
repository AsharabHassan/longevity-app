import { NextRequest, NextResponse } from "next/server";
import { buildReportPdf, type ReportPdfInput } from "@/lib/reportPdf";

export async function POST(req: NextRequest) {
  try {
    const buffer = buildReportPdf((await req.json()) as ReportPdfInput);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Biological-Age-Report.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
