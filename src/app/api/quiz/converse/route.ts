import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This route is unused — the ConversationalQuiz component is not active in the app.
// Anthropic dependency has been removed. Route preserved as a stub.

export async function POST(_req: NextRequest) {
  return Response.json(
    { error: "Conversational quiz is not available." },
    { status: 503 }
  );
}
