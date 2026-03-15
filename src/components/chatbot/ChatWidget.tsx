"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, X, Calendar } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { PixelEvents } from "@/lib/pixel";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatWidgetProps {
  context: {
    answers: unknown;
    wellnessScore: number;
    biologicalAge: number;
    treatments: string[];
  };
  lowestDimension: string;
}

function DnaIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M7 4C7 4 7.5 6.5 12 8.5C16.5 10.5 17 13 17 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 4C17 4 16.5 6.5 12 8.5C7.5 10.5 7 13 7 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 11C7 11 7.5 13.5 12 15.5C16.5 17.5 17 20 17 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 11C17 11 16.5 13.5 12 15.5C7.5 17.5 7 20 7 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-center gap-1.5 rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] border border-white/5 bg-[#111114] px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: "0.15s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}

export default function ChatWidget({ context, lowestDimension }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Initialize opening message on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      PixelEvents.chatStarted();
      setMessages([
        {
          role: "assistant",
          content: `Hi! I've reviewed your longevity report. Your <strong>${lowestDimension}</strong> is your biggest opportunity for improvement. Want me to explain what's happening and how we can help?`,
        },
      ]);
    }
  }, [isOpen, hasOpened, lowestDimension]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading || limitReached) return;

    const userMessage: ChatMessageType = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setMessageCount((c) => c + 1);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, context }),
      });
      const data = await res.json();

      if (data.limitReached) {
        setLimitReached(true);
      } else if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="gold-gradient gold-glow fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open chat"
        >
          <DnaIcon size={24} className="text-bg" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[min(600px,100dvh)] w-full flex-col border-t-2 border-gold/40 bg-bg shadow-2xl sm:bottom-6 sm:right-6 sm:h-[540px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-white/5 sm:border-t-2 sm:border-t-gold/40 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(212,168,83,0.12)]">
                <DnaIcon size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-white">
                  Longevity Advisor
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg-hover hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}

            {/* Limit reached message */}
            {limitReached && (
              <div className="animate-fade-in mt-2 rounded-xl border border-gold/15 bg-[rgba(212,168,83,0.06)] p-4 text-center">
                <p className="text-xs leading-relaxed text-muted">
                  You&apos;ve reached the chat limit. Book a free consultation
                  to continue the conversation with our team.
                </p>
                <a
                  href="#book"
                  className="gold-gradient mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-bg"
                >
                  <Calendar size={14} />
                  Book Free Consultation
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!limitReached && (
            <div className="border-t border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your results..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-white/5 bg-bg-card px-4 py-2.5 text-sm text-white placeholder-muted/50 outline-none transition-colors focus:border-gold/30 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="gold-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
                  aria-label="Send message"
                >
                  <ArrowUp size={18} className="text-bg" />
                </button>
              </div>
              {messageCount > 0 && (
                <p className="mt-1.5 text-center text-[10px] text-muted/40">
                  {20 - messageCount} messages remaining
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
