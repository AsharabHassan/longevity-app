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
  const gap = biologicalAge - chronologicalAge;

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * wellnessScore));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [wellnessScore]);

  // SVG arc
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (displayScore / 100) * circumference;

  // Render verdict with neg/pos spans
  function renderVerdict(text: string) {
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
    <div className="animate-fade-in flex flex-col items-center py-10">
      {/* Section Label */}
      <p className="mb-8 text-[10px] font-semibold tracking-[4px] text-muted/50 uppercase">
        Your Longevity Gap
      </p>

      {/* Score Ring — larger, with stronger glow */}
      <div className="relative flex items-center justify-center">
        {/* Ambient glow behind ring */}
        <div
          className="absolute rounded-full animate-pulse-gold"
          style={{
            width: "250px",
            height: "250px",
            background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="animate-ring-pulse relative z-10"
          style={{ animationDelay: "0.8s" }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-dark)" />
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--gold-light)" />
            </linearGradient>
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          {/* Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 100 100)"
            filter="url(#scoreGlow)"
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>

        {/* Score overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <span className="gold-text text-glow font-heading text-[56px] font-bold leading-none">
            {displayScore}
          </span>
          <span className="mt-1 text-[13px] text-muted/60">/100</span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-5 text-[10px] font-semibold tracking-[3px] text-muted/60 uppercase">
        Cellular Wellness Score
      </p>
      <p className="mt-1 text-xs text-gold/80">{scoreLabel}</p>

      {/* Biological Age Comparison */}
      <div className="mt-10 flex items-center gap-4">
        {/* Real age */}
        <div className="glass-card flex flex-col items-center px-7 py-4">
          <span className="text-[9px] font-semibold tracking-[2px] text-muted/60 uppercase">
            Real Age
          </span>
          <span className="font-heading mt-1 text-3xl font-bold text-white">
            {chronologicalAge}
          </span>
        </div>

        {/* Arrow */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-60">
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="var(--danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Body age */}
        <div className="flex flex-col items-center rounded-2xl border border-danger/15 bg-[rgba(220,53,69,0.06)] backdrop-blur-md px-7 py-4">
          <span className="text-[9px] font-semibold tracking-[2px] text-muted/60 uppercase">
            Body Age
          </span>
          <span className="font-heading mt-1 text-3xl font-bold text-danger">
            {biologicalAge}
          </span>
        </div>
      </div>

      {/* Gap Badge */}
      {gap > 0 && (
        <div className="mt-5 animate-scale-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/15 bg-[rgba(220,53,69,0.04)] backdrop-blur-sm px-5 py-2">
            <span className="text-[11px] text-muted/70">Gap:</span>
            <span className="font-heading text-base font-bold text-danger">
              -{gap} years
            </span>
          </div>
          <p className="mt-2 text-center text-[12px] text-muted/60">
            Your body is aging{" "}
            <span className="font-semibold text-danger">{gap} years</span> ahead of schedule
          </p>
        </div>
      )}

      {/* AI Verdict */}
      {verdict && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="glass-card-gold mx-auto max-w-md px-6 py-5">
            <p className="text-center text-[14px] leading-relaxed text-muted/90 italic">
              &ldquo;{renderVerdict(verdict)}&rdquo;
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-green-500/70">
            The good news — at your stage, this gap is fully reversible.
          </p>
        </div>
      )}
    </div>
  );
}
