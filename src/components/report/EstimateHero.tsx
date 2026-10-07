"use client";

import { useEffect, useRef, useState } from "react";
import type { LifestyleAgeResult } from "@/lib/types";

interface EstimateHeroProps {
  result: LifestyleAgeResult;
  firstName: string;
}

export default function EstimateHero({ result, firstName }: EstimateHeroProps) {
  const { chronologicalAge, estimate, low, high } = result;
  const [display, setDisplay] = useState(chronologicalAge);
  const frameRef = useRef<number>(0);

  // Count from calendar age to the estimate
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(chronologicalAge + (estimate - chronologicalAge) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [chronologicalAge, estimate]);

  const gap = estimate - chronologicalAge;
  const settled = display === estimate;
  const tone = gap < 0 ? "text-green-500" : gap > 0 ? "text-amber-400" : "gold-text";

  let summary: string;
  if (gap <= -1) summary = `Your habits point to someone about ${Math.abs(gap)} ${Math.abs(gap) === 1 ? "year" : "years"} younger than your calendar age.`;
  else if (gap >= 1) summary = `Your habits point to someone about ${gap} ${gap === 1 ? "year" : "years"} older than your calendar age.`;
  else summary = "Your habits point to someone right around your calendar age.";

  return (
    <div className="animate-fade-in flex flex-col items-center py-8 text-center">
      <p className="mb-6 text-[10px] font-semibold tracking-[4px] text-muted/50 uppercase">
        {firstName ? `${firstName}, your biological age estimate` : "Your biological age estimate"}
      </p>

      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full animate-pulse-gold"
          style={{ width: "260px", height: "260px", background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <span className={`relative font-heading text-[84px] font-bold leading-none tabular-nums ${tone}`}>
          {settled ? `${low}–${high}` : display}
        </span>
      </div>

      <p className="mt-4 text-sm text-muted/70">
        Calendar age <span className="font-semibold text-white">{chronologicalAge}</span>
      </p>

      <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85">{summary}</p>

      <p className="mt-4 max-w-sm text-[12px] leading-relaxed text-muted/50">
        Based on your lifestyle answers and shown as a range, because no questionnaire can be exact.
        It is not a lab measurement. The blood and epigenetic tests in a wellness consultation give a lab-based estimate.{" "}
        <a href="/methodology" className="underline underline-offset-2 hover:text-gold/80">
          How we work it out
        </a>
      </p>
    </div>
  );
}
