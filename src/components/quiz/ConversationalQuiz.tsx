"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { QuizAnswer, LeadData } from "@/lib/types";
import {
  calculateDimensionScores,
  calculateWellnessScore,
  calculateBiologicalAge,
} from "@/lib/scoring";
import { recommendTreatments } from "@/lib/treatments";
import { PixelEvents } from "@/lib/pixel";

interface ConvoMessage {
  role: "user" | "assistant";
  content: string;
}

// The API message format that Claude expects (includes tool results)
type ApiMessage =
  | { role: "user" | "assistant"; content: string }
  | {
      role: "assistant";
      content: Array<
        | { type: "text"; text: string }
        | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
      >;
    }
  | {
      role: "user";
      content: Array<{
        type: "tool_result";
        tool_use_id: string;
        content: string;
      }>;
    };

function DnaIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 4C7 4 7.5 6.5 12 8.5C16.5 10.5 17 13 17 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 4C17 4 16.5 6.5 12 8.5C7.5 10.5 7 13 7 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 11C7 11 7.5 13.5 12 15.5C16.5 17.5 17 20 17 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 11C17 11 16.5 13.5 12 15.5C7.5 17.5 7 20 7 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/5 bg-[#111114] px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: "0.15s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ConvoMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(212,168,83,0.12)]">
          <DnaIcon size={14} className="text-gold" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm gold-gradient text-bg font-medium"
            : "rounded-tl-sm border border-white/5 bg-[#111114] text-white/90"
        }`}
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    </div>
  );
}

export default function ConversationalQuiz() {
  const router = useRouter();
  const [messages, setMessages] = useState<ConvoMessage[]>([]);
  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [phase, setPhase] = useState<"chatting" | "lead_capture" | "processing">("chatting");
  const [leadData, setLeadData] = useState<LeadData>({ firstName: "", email: "", phone: "" });
  const [dataPointCount, setDataPointCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firedStart = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (!firedStart.current) {
      PixelEvents.startQuiz();
      firedStart.current = true;
      // Trigger initial greeting from Claude
      sendToApi([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "chatting" && !isLoading) {
      inputRef.current?.focus();
    }
  }, [phase, isLoading, messages]);

  async function sendToApi(msgHistory: ApiMessage[]) {
    setIsLoading(true);

    try {
      // For the initial greeting, send a single user message to trigger Claude
      const messagesToSend =
        msgHistory.length === 0
          ? [{ role: "user" as const, content: "I want to find out my biological age." }]
          : msgHistory;

      const res = await fetch("/api/quiz/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      // Process tool calls
      let hasText = false;
      let assistantText = "";
      let hasCompleteAssessment = false;
      let hasLeadRequest = false;

      // Build the assistant content block for API history
      const contentBlocks: Array<
        | { type: "text"; text: string }
        | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
      > = [];

      if (data.text) {
        hasText = true;
        assistantText = data.text;
        contentBlocks.push({ type: "text", text: data.text });
      }

      const toolResults: Array<{
        type: "tool_result";
        tool_use_id: string;
        content: string;
      }> = [];

      if (data.toolCalls && data.toolCalls.length > 0) {
        for (const tc of data.toolCalls) {
          contentBlocks.push({
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: tc.input,
          });

          if (tc.name === "record_answer") {
            const { questionId, value, score } = tc.input as {
              questionId: string;
              value: string | string[] | number;
              score: number;
            };

            setAnswers((prev) => {
              const next = new Map(prev);
              next.set(questionId, { questionId, value, score });
              return next;
            });
            setDataPointCount((prev) => prev + 1);

            toolResults.push({
              type: "tool_result",
              tool_use_id: tc.id,
              content: JSON.stringify({ recorded: true, questionId }),
            });
          } else if (tc.name === "complete_assessment") {
            hasCompleteAssessment = true;
            PixelEvents.quizComplete();

            toolResults.push({
              type: "tool_result",
              tool_use_id: tc.id,
              content: JSON.stringify({
                completed: true,
                message: "Assessment complete. Please ask for the user's name and email to generate their report.",
              }),
            });
          } else if (tc.name === "request_lead_info") {
            hasLeadRequest = true;

            toolResults.push({
              type: "tool_result",
              tool_use_id: tc.id,
              content: JSON.stringify({
                showing_form: true,
                message: "Lead capture form is now displayed to the user.",
              }),
            });
          }
        }
      }

      // Update API message history
      const newApiHistory = [...messagesToSend];
      if (contentBlocks.length > 0) {
        newApiHistory.push({ role: "assistant", content: contentBlocks });
      }
      if (toolResults.length > 0) {
        newApiHistory.push({ role: "user", content: toolResults });
      }

      // Update display messages
      if (hasText) {
        setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      }

      // If Claude called tools but also needs to respond again (tool_use stop reason)
      if (data.stopReason === "tool_use" && !hasLeadRequest) {
        // Continue the conversation to get Claude's next response
        setApiMessages(newApiHistory);
        setIsLoading(false);
        // Recursively call to get the follow-up
        await sendToApi(newApiHistory);
        return;
      }

      if (hasLeadRequest) {
        setPhase("lead_capture");
      }

      setApiMessages(newApiHistory);
    } catch (err) {
      console.error("Conversation error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having a moment — could you try that again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    // Add user message to display
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    // Add to API history and send
    const newApiHistory: ApiMessage[] = [
      ...apiMessages,
      { role: "user" as const, content: text },
    ];
    setApiMessages(newApiHistory);

    await sendToApi(newApiHistory);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadData.firstName || !leadData.email) return;

    setPhase("processing");
    PixelEvents.lead();

    try {
      const answersArray = Array.from(answers.values());
      const dimensions = calculateDimensionScores(answersArray);
      const wellnessScore = calculateWellnessScore(dimensions);

      const ageAnswer = answers.get("q1");
      const chronologicalAge = typeof ageAnswer?.value === "number" ? ageAnswer.value : 35;
      const biologicalAge = calculateBiologicalAge(chronologicalAge, wellnessScore);

      const symptomsAnswer = answers.get("q10");
      const symptoms = Array.isArray(symptomsAnswer?.value) ? symptomsAnswer.value : [];

      const treatments = recommendTreatments(dimensions, symptoms as string[]);

      // Webhook
      await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: leadData,
          answers: answersArray,
          wellnessScore,
          biologicalAge,
          chronologicalAge,
          dimensions,
          treatments,
          source: "conversational",
        }),
      }).catch(() => {});

      // Store in sessionStorage
      const reportPayload = {
        lead: leadData,
        answers: answersArray,
        wellnessScore,
        biologicalAge,
        chronologicalAge,
        ageOffset: biologicalAge - chronologicalAge,
        dimensions,
        treatments,
        scoreLabel:
          wellnessScore >= 90
            ? "Optimal"
            : wellnessScore >= 80
            ? "Strong"
            : wellnessScore >= 70
            ? "Average"
            : wellnessScore >= 60
            ? "Below Average"
            : "Needs Attention",
      };

      sessionStorage.setItem("quizResults", JSON.stringify(reportPayload));
      router.push("/report");
    } catch (err) {
      console.error("Lead submission error:", err);
      setPhase("lead_capture");
    }
  }

  return (
    <div className="flex h-[calc(100dvh-48px)] max-h-[800px] w-full flex-col rounded-2xl border border-white/5 bg-bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-[rgba(212,168,83,0.02)] px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,83,0.12)] gold-border">
          <DnaIcon size={18} className="text-gold" />
        </div>
        <div className="flex-1">
          <p className="font-heading text-sm font-bold text-white">
            Longevity Scan
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted">
              AI-powered · Live cellular analysis
            </span>
          </div>
        </div>
        {/* Progress indicator */}
        {dataPointCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light transition-all duration-500"
                style={{
                  width: `${Math.min(100, (dataPointCount / 12) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted/50">
              {Math.min(100, Math.round((dataPointCount / 12) * 100))}% scanned
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && <TypingDots />}

        {/* Lead Capture Form (inline in chat) */}
        {phase === "lead_capture" && (
          <div className="animate-fade-in">
            <div className="rounded-2xl rounded-tl-sm border border-gold/20 bg-[rgba(212,168,83,0.06)] p-5">
              <p className="mb-4 text-sm font-medium text-white">
                Almost there! Enter your details to unlock your personalized
                longevity report:
              </p>
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={leadData.firstName}
                  onChange={(e) =>
                    setLeadData((p) => ({ ...p, firstName: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-muted/50 outline-none focus:border-gold/30"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={leadData.email}
                  onChange={(e) =>
                    setLeadData((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-muted/50 outline-none focus:border-gold/30"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={leadData.phone}
                  onChange={(e) =>
                    setLeadData((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm text-white placeholder-muted/50 outline-none focus:border-gold/30"
                />
                <button
                  type="submit"
                  className="gold-gradient gold-glow w-full rounded-xl px-6 py-3.5 font-heading text-sm font-bold tracking-wider text-bg uppercase"
                >
                  Get My Results →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Processing state */}
        {phase === "processing" && (
          <div className="animate-fade-in flex flex-col items-center gap-3 py-6">
            <div className="h-10 w-10 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
            <p className="text-sm text-muted">
              Preparing your analysis...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {phase === "chatting" && (
        <div className="border-t border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-white/5 bg-bg px-4 py-3 text-sm text-white placeholder-muted/50 outline-none transition-colors focus:border-gold/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gold-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-110 disabled:opacity-30"
              aria-label="Send"
            >
              {isLoading ? (
                <Loader2 size={18} className="text-bg animate-spin" />
              ) : (
                <ArrowUp size={18} className="text-bg" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
