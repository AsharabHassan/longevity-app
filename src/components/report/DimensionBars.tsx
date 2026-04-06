"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Zap,
  Moon,
  Brain,
  Shield,
  Activity,
  Dumbbell,
  Heart,
  Sparkles,
  Target,
  ChevronDown,
  Loader2,
  Clock,
} from "lucide-react";
import type { DimensionScore, QuizAnswer } from "@/lib/types";
import DimensionDeepDive from "./DimensionDeepDive";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  zap: Zap,
  moon: Moon,
  brain: Brain,
  shield: Shield,
  activity: Activity,
  dumbbell: Dumbbell,
  heart: Heart,
  sparkles: Sparkles,
  target: Target,
};

function estimateYearsStolen(score: number): number {
  if (score >= 80) return 0;
  if (score >= 70) return 0.3;
  if (score >= 60) return 0.8;
  if (score >= 50) return 1.4;
  if (score >= 40) return 2.1;
  if (score >= 30) return 2.8;
  return 3.5;
}

function getSeverityColor(score: number): string {
  if (score < 40) return "text-danger";
  if (score < 70) return "text-gold";
  return "text-green-500";
}

function getSeverityBg(score: number): string {
  if (score < 40) return "bg-danger/10 border-danger/15";
  if (score < 70) return "bg-gold/5 border-gold/10";
  return "bg-green-500/5 border-green-500/10";
}

function getBarGradient(score: number): string {
  if (score >= 70) return "bg-gradient-to-r from-gold-dark to-gold-light";
  if (score >= 50) return "bg-gold-dark";
  return "bg-gradient-to-r from-danger to-[#ff6b7a]";
}

interface DeepDiveData {
  mechanism: string;
  agingImpact: string;
  treatmentConnection: string;
  timeline: string;
}

const DEEP_DIVE_STORAGE_KEY = "deepDives";

interface DimensionBarsProps {
  dimensions: DimensionScore[];
  answers?: QuizAnswer[];
  biologicalAge?: number;
  chronologicalAge?: number;
  recommendedTreatment?: string;
  prefetchedDeepDives?: Record<string, DeepDiveData>;
}

export default function DimensionBars({
  dimensions,
  answers,
  biologicalAge,
  chronologicalAge,
  recommendedTreatment,
  prefetchedDeepDives,
}: DimensionBarsProps) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [deepDives, setDeepDives] = useState<Record<string, DeepDiveData>>(() => {
    if (prefetchedDeepDives && Object.keys(prefetchedDeepDives).length > 0) {
      return prefetchedDeepDives;
    }
    try {
      const cached = sessionStorage.getItem(DEEP_DIVE_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return {};
  });
  const [loadingDim, setLoadingDim] = useState<string | null>(null);
  const [failedDims, setFailedDims] = useState<Set<string>>(new Set());

  // Ref to always have current deepDives available without stale closures
  const deepDivesRef = useRef(deepDives);
  useEffect(() => { deepDivesRef.current = deepDives; }, [deepDives]);

  // Track in-flight fetches to prevent duplicate requests
  const inFlightRef = useRef<Set<string>>(new Set());

  // Merge in prefetched data when it arrives (async from parent)
  useEffect(() => {
    if (prefetchedDeepDives && Object.keys(prefetchedDeepDives).length > 0) {
      setDeepDives((prev) => {
        const merged = { ...prev, ...prefetchedDeepDives };
        try {
          sessionStorage.setItem(DEEP_DIVE_STORAGE_KEY, JSON.stringify(merged));
        } catch { /* storage full — not critical */ }
        return merged;
      });
    }
  }, [prefetchedDeepDives]);

  const totalYearsStolen = dimensions.reduce(
    (sum, dim) => sum + estimateYearsStolen(dim.score),
    0
  );
  const totalRecoverable = Math.round(totalYearsStolen * 0.85 * 10) / 10;

  // On-demand fetch with retry logic
  const fetchDeepDive = useCallback(
    async (dimName: string, score: number) => {
      // Prevent duplicate in-flight requests
      if (inFlightRef.current.has(dimName)) return;
      inFlightRef.current.add(dimName);

      setLoadingDim(dimName);
      setFailedDims((prev) => {
        const next = new Set(prev);
        next.delete(dimName);
        return next;
      });

      const answersRecord: Record<string, string | string[] | number> = {};
      if (answers) {
        for (const a of answers) {
          if (a.questionId) answersRecord[a.questionId] = a.value;
        }
      }

      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const res = await fetch("/api/report/dimension", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dimensionName: dimName,
              score,
              answers: answersRecord,
              biologicalAge: biologicalAge ?? 35,
              recommendedTreatment: recommendedTreatment ?? "NAD+ IV Drip",
            }),
          });

          if (res.ok) {
            const data: DeepDiveData = await res.json();
            setDeepDives((prev) => {
              const updated = { ...prev, [dimName]: data };
              try {
                sessionStorage.setItem(DEEP_DIVE_STORAGE_KEY, JSON.stringify(updated));
              } catch { /* storage full */ }
              return updated;
            });
            inFlightRef.current.delete(dimName);
            setLoadingDim(null);
            return; // Success — exit
          }

          // On 429 (rate limit) or 5xx, retry after delay
          if (res.status === 429 || res.status >= 500) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }

          // Other error (4xx) — don't retry
          break;
        } catch (err) {
          console.error(`Deep dive fetch attempt ${attempt + 1} failed:`, err);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
        }
      }

      // All retries exhausted
      setFailedDims((prev) => new Set(prev).add(dimName));
      inFlightRef.current.delete(dimName);
      setLoadingDim(null);
    },
    [answers, biologicalAge, recommendedTreatment]
  );

  const handleDimensionClick = useCallback(
    (dimName: string, score: number) => {
      setExpandedDim((prev) => (prev === dimName ? null : dimName));

      // Use ref to check current state — avoids stale closure and side effects in setter
      if (!deepDivesRef.current[dimName]) {
        fetchDeepDive(dimName, score);
      }
    },
    [fetchDeepDive]
  );

  const isYounger = (biologicalAge ?? 0) < (chronologicalAge ?? 100);
  const absGap = Math.abs((biologicalAge ?? 0) - (chronologicalAge ?? 0));

  return (
    <div className="animate-fade-in space-y-4">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <h2 className="font-heading text-xl font-bold tracking-wide text-glow">
          {isYounger ? "Your Optimization Map" : "Your Time Thieves"}
        </h2>
        <p className="text-xs text-muted/50 mt-1">
          {isYounger
            ? "Where you're excelling and where you can push further"
            : "What\u0027s silently stealing years from your life"}
        </p>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isYounger ? "bg-green-500/10" : "bg-danger/10"}`}>
              <Clock size={18} className={isYounger ? "text-green-500" : "text-danger"} />
            </div>
            <span className="text-sm text-muted/80">{isYounger ? "Total Time Gained" : "Total Time Lost"}</span>
          </div>
          <span className={`font-heading text-xl font-bold ${isYounger ? "text-green-500" : "text-danger"}`}>
            {isYounger ? `+${absGap} years` : `-${Math.round(totalYearsStolen * 10) / 10} years`}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-green-500/5 px-4 py-2.5">
          <span className="text-xs text-muted/60">{isYounger ? "Further Optimization" : "Recovery Potential"}</span>
          <span className="text-sm font-semibold text-green-500">
            +{totalRecoverable} years with treatment
          </span>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-muted/30 mb-3">
        Tap any dimension to see how to recover that time
      </p>

      {/* Dimension Cards */}
      <div className="stagger-children space-y-3">
        {dimensions.map((dim, index) => {
          const Icon = ICON_MAP[dim.icon] || Zap;
          const isExpanded = expandedDim === dim.name;
          const isLoading = loadingDim === dim.name;
          const deepDive = deepDives[dim.name];
          const hasFailed = failedDims.has(dim.name);
          const yearsStolen = estimateYearsStolen(dim.score);

          return (
            <div
              key={dim.name}
              className={`glass-card overflow-hidden transition-all duration-400 animate-fade-in-up ${
                isExpanded
                  ? "border-gold/20 !bg-[rgba(212,168,83,0.03)]"
                  : "hover:border-white/8"
              }`}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              {/* Clickable Row */}
              <button
                type="button"
                onClick={() => handleDimensionClick(dim.name, dim.score)}
                className="w-full text-left px-4 py-4 cursor-pointer group"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${getSeverityBg(dim.score)} border transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(212,168,83,0.08)]`}>
                      <Icon size={16} className={getSeverityColor(dim.score)} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white/90">
                        {dim.name}
                      </span>
                      {yearsStolen > 0 && (
                        <span className="ml-2 text-[10px] font-semibold text-danger/80">
                          -{yearsStolen} yr
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-heading text-base font-bold ${getSeverityColor(dim.score)}`}
                    >
                      {dim.score}
                    </span>
                    {isLoading ? (
                      <Loader2 size={14} className="text-gold animate-spin" />
                    ) : (
                      <ChevronDown
                        size={14}
                        className={`text-muted/30 transition-transform duration-300 group-hover:text-muted/60 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={`h-full rounded-full ${getBarGradient(dim.score)} transition-all duration-1000 ease-out`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </button>

              {/* Deep Dive Expansion */}
              {isExpanded && deepDive && (
                <DimensionDeepDive
                  mechanism={deepDive.mechanism}
                  agingImpact={deepDive.agingImpact}
                  treatmentConnection={deepDive.treatmentConnection}
                  timeline={deepDive.timeline}
                  treatmentName={recommendedTreatment ?? "NAD+ IV Drip"}
                />
              )}

              {/* Loading skeleton */}
              {isExpanded && isLoading && (
                <div className="px-4 pb-4 pt-1">
                  <div className="space-y-2.5 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/[0.03] bg-white/[0.02] p-3 space-y-2"
                      >
                        <div className="h-2.5 w-24 rounded bg-white/5" />
                        <div className="h-2 w-full rounded bg-white/5" />
                        <div className="h-2 w-3/4 rounded bg-white/5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error state with retry */}
              {isExpanded && hasFailed && !isLoading && (
                <div className="px-4 pb-4 pt-1 text-center">
                  <p className="text-xs text-muted/50 mb-2">
                    Failed to load analysis.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchDeepDive(dim.name, dim.score);
                    }}
                    className="text-xs text-gold hover:text-gold-light underline cursor-pointer"
                  >
                    Tap to retry
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
