"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "assistant";

  // Render <strong> tags in bot messages as gold text
  function renderContent(content: string) {
    if (!isBot) return content;

    const parts = content.split(/(<strong>.*?<\/strong>)/g);
    return parts.map((part, i) => {
      if (part.startsWith("<strong>")) {
        const text = part.replace(/<\/?strong>/g, "");
        return (
          <strong key={i} className="font-semibold text-gold">
            {text}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div
      className={`flex ${isBot ? "justify-start" : "justify-end"} animate-fade-in`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] border border-white/5 bg-[#111114] text-white/90"
            : "rounded-tl-[16px] rounded-tr-[4px] rounded-br-[16px] rounded-bl-[16px] border border-gold/15 bg-[rgba(212,168,83,0.08)] text-gold"
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}
