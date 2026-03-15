import { NextRequest, NextResponse } from "next/server";
import { chatResponse } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    const userMessageCount = messages.filter(
      (m: { role: string }) => m.role === "user"
    ).length;

    if (userMessageCount > 20) {
      return NextResponse.json({ message: null, limitReached: true });
    }

    const reply = await chatResponse(messages, context);
    return NextResponse.json({ message: reply, limitReached: false });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({
      message:
        "I'm having trouble connecting right now. Please try again in a moment.",
      limitReached: false,
    });
  }
}
