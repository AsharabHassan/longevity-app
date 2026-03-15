"use client";

interface MicroInsightProps {
  insight: string | null;
  isLoading: boolean;
}

export default function MicroInsight({ insight, isLoading }: MicroInsightProps) {
  if (!insight && !isLoading) return null;

  return (
    <div className="w-full animate-fade-in flex flex-col items-center text-center py-8">
      {/* Pulsing icon with ring */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.1)] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gold"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="none"
            />
            <path
              d="M9.5 2a6.5 6.5 0 0 0 0 13h.5a4 4 0 0 0 4-4V6.5A4.5 4.5 0 0 0 9.5 2ZM14.5 11a6.5 6.5 0 0 0 0-9H14a4 4 0 0 0-4 4v4.5a4.5 4.5 0 0 0 4.5 4.5Z"
              fill="currentColor"
              opacity="0.9"
              transform="translate(2 5.5) scale(0.85)"
            />
          </svg>
        </div>
        <div
          className="absolute inset-0 w-16 h-16 rounded-full border border-gold/30 animate-ring-pulse"
        />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(212,168,83,0.1)] border border-gold/20 mb-4">
        <span className="text-[10px] font-heading font-bold tracking-[0.2em] text-gold uppercase">
          AI Insight
        </span>
      </div>

      {isLoading ? (
        <>
          {/* Pulsing dots */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full bg-gold animate-pulse-gold"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-gold animate-pulse-gold"
              style={{ animationDelay: "300ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-gold animate-pulse-gold"
              style={{ animationDelay: "600ms" }}
            />
          </div>
          <p className="text-muted text-sm">Preparing your next question...</p>
        </>
      ) : (
        <>
          {/* Insight text — bold numbers */}
          <p
            className="text-white text-lg leading-relaxed max-w-sm mb-3"
            dangerouslySetInnerHTML={{
              __html: insight
                ? insight.replace(
                    /(\d+[\d,.%x]*)/g,
                    '<strong class="text-gold font-semibold">$1</strong>'
                  )
                : "",
            }}
          />
          <p className="text-muted text-xs italic">
            Based on peer-reviewed longevity research
          </p>
        </>
      )}
    </div>
  );
}
