"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, X, Calendar, MessageCircle } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { PixelEvents } from "@/lib/pixel";
import { CLINIC } from "@/lib/clinic";
import { topDrivers } from "@/lib/lifestyleAge";
import type { ChatMessage as ChatMessageType, LifestyleAgeResult } from "@/lib/types";

interface ChatWidgetProps {
  result: LifestyleAgeResult;
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

export default function ChatWidget({ result }: ChatWidgetProps) {
  const topDriver = topDrivers(result, 1)[0]?.name.toLowerCase();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Show tooltip prompt after 3 seconds on report page
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Auto-hide tooltip after 8 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Initialize opening message on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setShowTooltip(false);
      setShowNotificationBadge(false);
      PixelEvents.chatStarted();
      setMessages([
        {
          role: "assistant",
          content: topDriver
            ? `Hi, I'm an AI assistant, not a clinician. I can explain how your lifestyle age estimate was worked out — for example why <strong>${topDriver}</strong> is your biggest driver — or help you book your free consultation.`
            : "Hi, I'm an AI assistant, not a clinician. I can explain how your lifestyle age estimate was worked out, or help you book your free consultation.",
        },
      ]);
    }
  }, [isOpen, hasOpened, topDriver]);

  const suggestedQuestions = [
    topDriver ? `Why does ${topDriver} matter so much?` : "How was my estimate worked out?",
    "Is this a real biological age test?",
    "What happens in the free consultation?",
    "What tests do you offer?",
  ];

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          result,
        }),
      });
      const data = await res.json();

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }

      // Show inline booking prompt when suggested by API
      if (data.suggestBooking) {
        setShowBookingPrompt(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating Chat Button with Tooltip & Notification */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Tooltip Popup */}
          {showTooltip && (
            <div
              className="animate-fade-in flex items-center gap-2 rounded-xl border border-gold/20 bg-bg-card px-4 py-3 shadow-xl"
              style={{ maxWidth: "280px" }}
            >
              <MessageCircle size={16} className="shrink-0 text-gold" />
              <p className="text-xs leading-relaxed text-white/80">
                <strong className="text-gold">Questions about your score?</strong>{" "}
                Ask our AI assistant how your estimate was worked out
              </p>
              <button
                onClick={() => setShowTooltip(false)}
                className="shrink-0 text-muted hover:text-white"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="gold-gradient gold-glow relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Open chat"
          >
            <DnaIcon size={24} className="text-bg" />

            {/* Notification Badge */}
            {showNotificationBadge && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-md">
                1
              </span>
            )}

            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping" style={{ animationDuration: "2s" }} />
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[min(600px,100dvh)] w-full flex-col border-t-2 border-gold/40 bg-bg shadow-2xl sm:bottom-6 sm:right-6 sm:h-[540px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-white/5 sm:border-t-2 sm:border-t-gold/40 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-[rgba(212,168,83,0.02)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,83,0.12)] gold-border">
                <DnaIcon size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-white">AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted">Automated · Not medical advice</span>
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

          {/* Suggested Questions */}
          {messages.length <= 1 && !isLoading && (
            <div className="border-b border-white/5 px-4 py-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted/60">Ask about your results</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-lg border border-white/5 bg-bg-card px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-gold/20 hover:text-gold"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}

            {/* Inline Booking Prompt (soft escalation) */}
            {showBookingPrompt && !isLoading && (
              <div className="animate-fade-in mt-2 rounded-xl border border-gold/15 bg-[rgba(212,168,83,0.06)] p-4 text-center">
                <p className="text-xs leading-relaxed text-muted">
                  A free consultation is the best place for questions about your own health.
                </p>
                <a
                  href={CLINIC.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => PixelEvents.bookingClick("chat")}
                  className="gold-gradient mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-bg"
                >
                  <Calendar size={14} />
                  Book Free Online Consultation
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
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
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="gold-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
                aria-label="Send message"
              >
                <ArrowUp size={18} className="text-bg" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
