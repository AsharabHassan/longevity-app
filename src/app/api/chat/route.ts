import { NextRequest, NextResponse } from "next/server";
import { chatResponse } from "@/lib/claude";
import {
  REVERSAL_PATTERN,
  REVERSAL_REPLY,
  SAFE_FALLBACK_REPLY,
  SELF_HARM_PATTERN,
  SELF_HARM_REPLY,
  TREATMENT_DEFLECTION,
  URGENT_PATTERN,
  URGENT_REPLY,
  findBlockedTerm,
  mentionsBlockedTreatment,
} from "@/lib/compliance";
import type { ChatMessage } from "@/lib/types";

const MAX_USER_MESSAGES = 20;

export async function POST(req: NextRequest) {
  try {
    const { messages, result } = (await req.json()) as { messages: ChatMessage[]; result: unknown };
    const userMessages = messages.filter((m) => m.role === "user");
    const latest = userMessages[userMessages.length - 1]?.content ?? "";

    // Fixed replies for anything the assistant must not handle itself
    if (SELF_HARM_PATTERN.test(latest)) {
      return NextResponse.json({ message: SELF_HARM_REPLY, suggestBooking: false });
    }
    if (URGENT_PATTERN.test(latest)) {
      return NextResponse.json({ message: URGENT_REPLY, suggestBooking: false });
    }
    if (mentionsBlockedTreatment(latest)) {
      return NextResponse.json({ message: TREATMENT_DEFLECTION, suggestBooking: true });
    }
    if (REVERSAL_PATTERN.test(latest)) {
      return NextResponse.json({ message: REVERSAL_REPLY, suggestBooking: true });
    }
    if (userMessages.length > MAX_USER_MESSAGES) {
      return NextResponse.json({
        message:
          "We've covered a lot. The best next step is a free consultation, where we can pick up your questions properly.",
        suggestBooking: true,
      });
    }

    const reply = await chatResponse(messages, result as Parameters<typeof chatResponse>[1]);

    // Never show a reply that names a treatment or makes a claim we can't support
    if (!reply || findBlockedTerm(reply)) {
      return NextResponse.json({ message: SAFE_FALLBACK_REPLY, suggestBooking: true });
    }
    return NextResponse.json({ message: reply, suggestBooking: userMessages.length >= 6 });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestBooking: false,
    });
  }
}
