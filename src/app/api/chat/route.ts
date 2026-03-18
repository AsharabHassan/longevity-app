import { NextRequest, NextResponse } from "next/server";
import { chatResponse } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    const userMessageCount = messages.filter(
      (m: { role: string }) => m.role === "user"
    ).length;

    // No more hard cutoff — smart escalation handles everything
    // After 30 messages, gracefully suggest human handoff
    if (userMessageCount > 30) {
      return NextResponse.json({
        message:
          "I've loved chatting with you! I think the best next step is connecting you with our clinical team — they can pick up exactly where we left off and answer any remaining questions in person. Shall I help you book a free consultation?",
        limitReached: false,
        suggestBooking: true,
      });
    }

    const reply = await chatResponse(messages, context, userMessageCount);
    return NextResponse.json({
      message: reply,
      limitReached: false,
      suggestBooking: userMessageCount >= 16,
    });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({
      message:
        "I'm having trouble connecting right now. Please try again in a moment.",
      limitReached: false,
      suggestBooking: false,
    });
  }
}
