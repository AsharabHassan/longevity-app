import { NextRequest } from "next/server";
import { streamAnalysis } from "@/lib/claude";

type StreamEvent = {
  type: string;
  delta?: { type: string; text: string };
  index?: number;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const stream = await streamAnalysis(
      body.answers,
      body.dimensions,
      body.wellnessScore,
      body.biologicalAge,
      body.chronologicalAge,
      body.primaryTreatment,
      body.supportingTreatments
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        try {
          for await (const event of stream as AsyncIterable<StreamEvent>) {
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta"
            ) {
              const chunk = event.delta!.text;
              fullText += chunk;

              // Check if we just completed a dimension marker
              const dimMatch = fullText.match(
                /---DIMENSION:\s*(.+?)---\n/g
              );
              const verdictMatch = fullText.includes("---VERDICT---");
              const reportMatch = fullText.includes("---REPORT---");

              // Send the raw text chunk
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "text",
                    content: chunk,
                  })}\n\n`
                )
              );

              // If we just hit a dimension marker, send a dimension event
              if (dimMatch) {
                const lastMatch = dimMatch[dimMatch.length - 1];
                const dimName = lastMatch
                  .replace(/---DIMENSION:\s*/, "")
                  .replace(/---\n?/, "")
                  .trim();

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "dimension_start",
                      dimension: dimName,
                    })}\n\n`
                  )
                );
              }

              if (verdictMatch && chunk.includes("---VERDICT---")) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "verdict_start",
                    })}\n\n`
                  )
                );
              }

              if (reportMatch && chunk.includes("---REPORT---")) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "report_start",
                    })}\n\n`
                  )
                );
              }
            }
          }

          // Extract the JSON report from after ---REPORT---
          const reportIdx = fullText.indexOf("---REPORT---");
          if (reportIdx !== -1) {
            const jsonStr = fullText
              .slice(reportIdx + "---REPORT---".length)
              .trim()
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();
            try {
              const reportData = JSON.parse(jsonStr);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "report_complete",
                    report: reportData,
                  })}\n\n`
                )
              );
            } catch {
              // If JSON parsing fails, signal completion without report data
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "report_error",
                    error: "Failed to parse report JSON",
                  })}\n\n`
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: String(err),
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream analysis failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start analysis stream" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
