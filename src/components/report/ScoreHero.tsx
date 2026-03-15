"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreHeroProps {
  wellnessScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  verdict: string;
  scoreLabel: string;
}

export default function ScoreHero({
  wellnessScore,
  biologicalAge,
  chronologicalAge,
  verdict,
  scoreLabel,
}: ScoreHeroProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1600;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * wellnessScore));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [wellnessScore]);

  // SVG arc calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (displayScore / 100) * circumference;

  // Render verdict with .neg and .pos spans
  function renderVerdict(text: string) {
    // Split on <neg>...</neg> and <pos>...</pos> patterns or .neg/.pos class patterns
    // Support both HTML-style tags and plain markers
    const parts = text.split(/(\[neg\].*?\[\/neg\]|\[pos\].*?\[\/pos\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[neg]")) {
        return (
          <span key={i} className="text-danger font-semibold">
            {part.replace(/\[neg\]|\[\/neg\]/g, "")}
          </span>
        );
      }
      if (part.startsWith("[pos]")) {
        return (
          <span key={i} className="gold-text font-semibold">
            {part.replace(/\[pos\]|\[\/pos\]/g, "")}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="animate-fade-in flex flex-col items-center py-8">
      {/* Score Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="animate-ring-pulse"
          style={{ animationDelay: "0.8s" }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-dark)" />
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--gold-light)" />
            </linearGradient>
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Dark track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Gold arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 80 80)"
            filter="url(#scoreGlow)"
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>

        {/* Score number overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="gold-text font-heading text-[48px] font-bold leading-none">
            {displayScore}
          </span>
          <span className="mt-1 text-xs text-muted">/100</span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-4 text-[10px] font-semibold tracking-[3px] text-muted uppercase">
        Cellular Wellness Score
      </p>
      <p className="mt-1 text-xs text-gold">{scoreLabel}</p>

      {/* Biological Age Comparison */}
      <div className="mt-8 flex items-center gap-3">
        {/* Actual age box */}
        <div className="flex flex-col items-center rounded-xl border border-white/10 bg-bg-card px-5 py-3">
          <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
            Actual Age
          </span>
          <span className="font-heading mt-1 text-2xl font-bold text-white">
            {chronologicalAge}
          </span>
        </div>

        {/* Arrow */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="var(--danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Biological age box */}
        <div className="flex flex-col items-center rounded-xl border border-danger/20 bg-[rgba(220,53,69,0.08)] px-5 py-3">
          <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
            Biological Age
          </span>
          <span className="font-heading mt-1 text-2xl font-bold text-danger">
            {biologicalAge}
          </span>
        </div>
      </div>

      {/* AI Verdict */}
      {verdict && (
        <p className="mt-8 max-w-md px-4 text-center text-sm leading-relaxed text-muted/90 italic">
          &ldquo;{renderVerdict(verdict)}&rdquo;
        </p>
      )}
    </div>
  );
}
