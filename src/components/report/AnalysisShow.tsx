"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Check,
  Loader2,
} from "lucide-react";
import type { DimensionScore, ReportData } from "@/lib/types";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
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

const DIMENSION_ORDER = [
  "Sleep Quality",
  "Energy & Vitality",
  "Stress & Mental Wellness",
  "Cognitive Function",
  "Metabolic Health",
  "Physical Activity",
  "Immune Resilience",
  "Cellular & Skin Health",
];

type DimensionStatus = "pending" | "analyzing" | "complete";

interface AnalysisShowProps {
  dimensions: DimensionScore[];
  answers: Record<string, string | string[] | number>;
  wellnessScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  primaryTreatment: string;
  supportingTreatments: string[];
  onComplete: (reportData: ReportData | null) => void;
}

export default function AnalysisShow({
  dimensions,
  answers,
  wellnessScore,
  biologicalAge,
  chronologicalAge,
  primaryTreatment,
  supportingTreatments,
  onComplete,
}: AnalysisShowProps) {
  const [dimStatuses, setDimStatuses] = useState<
    Record<string, DimensionStatus>
  >(() => {
    const initial: Record<string, DimensionStatus> = {};
    for (const name of DIMENSION_ORDER) {
      initial[name] = "pending";
    }
    return initial;
  });

  const [dimNarratives, setDimNarratives] = useState<Record<string, string>>(
    {}
  );
  const [currentText, setCurrentText] = useState("");
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [verdictText, setVerdictText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    if (activeDimension || showVerdict) {
      scrollToBottom();
    }
  }, [activeDimension, currentText, showVerdict, scrollToBottom]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let fullText = "";
    let currentDim: string | null = null;
    let inVerdict = false;
    let inReport = false;
    let narrativeBuffer = "";
    let verdictBuffer = "";

    async function runStream() {
      try {
        const res = await fetch("/api/report/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            dimensions: dimensions.map((d) => ({
              name: d.name,
              score: d.score,
            })),
            wellnessScore,
            biologicalAge,
            chronologicalAge,
            primaryTreatment,
            supportingTreatments,
          }),
        });

        if (!res.ok || !res.body) {
          onComplete(null);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "text") {
                fullText += event.content;

                // Check for dimension markers
                const dimRegex = /---DIMENSION:\s*(.+?)---/;
                const verdictMarker = "---VERDICT---";
                const reportMarker = "---REPORT---";

                // Check if this chunk contains a dimension marker
                if (fullText.includes(verdictMarker) && !inVerdict && !inReport) {
                  // Finish current dimension
                  if (currentDim) {
                    setDimStatuses((prev) => ({
                      ...prev,
                      [currentDim!]: "complete",
                    }));
                    setDimNarratives((prev) => ({
                      ...prev,
                      [currentDim!]: narrativeBuffer.trim(),
                    }));
                    narrativeBuffer = "";
                  }
                  inVerdict = true;
                  currentDim = null;
                  setActiveDimension(null);
                  setShowVerdict(true);
                  setCurrentText("");
                  continue;
                }

                if (fullText.includes(reportMarker) && !inReport) {
                  inReport = true;
                  inVerdict = false;
                  setVerdictText(verdictBuffer.trim());
                  continue;
                }

                if (inReport) {
                  // Don't display report JSON to user
                  continue;
                }

                if (inVerdict) {
                  const cleaned = event.content
                    .replace(/---VERDICT---/g, "")
                    .replace(/\n/g, "");
                  verdictBuffer += cleaned;
                  setVerdictText(verdictBuffer.trim());
                  continue;
                }

                // Check for new dimension in the accumulated text
                const recentText = fullText.slice(-200);
                const match = recentText.match(dimRegex);
                if (match) {
                  const newDim = match[1].trim();

                  // Complete previous dimension
                  if (currentDim && currentDim !== newDim) {
                    setDimStatuses((prev) => ({
                      ...prev,
                      [currentDim!]: "complete",
                    }));
                    setDimNarratives((prev) => ({
                      ...prev,
                      [currentDim!]: narrativeBuffer.trim(),
                    }));
                    narrativeBuffer = "";
                  }

                  if (newDim !== currentDim) {
                    currentDim = newDim;
                    setActiveDimension(newDim);
                    setDimStatuses((prev) => ({
                      ...prev,
                      [newDim]: "analyzing",
                    }));
                    setCurrentText("");
                    narrativeBuffer = "";
                  }
                }

                // Stream text for current dimension
                if (currentDim && !inVerdict && !inReport) {
                  const cleaned = event.content
                    .replace(/---DIMENSION:.*?---/g, "")
                    .replace(/\n---/g, "");
                  if (cleaned) {
                    narrativeBuffer += cleaned;
                    setCurrentText((prev) => prev + cleaned);
                  }
                }
              }

              if (event.type === "report_complete") {
                // Complete any remaining dimensions
                if (currentDim) {
                  setDimStatuses((prev) => ({
                    ...prev,
                    [currentDim!]: "complete",
                  }));
                }

                // Mark all remaining as complete
                setDimStatuses((prev) => {
                  const updated = { ...prev };
                  for (const name of DIMENSION_ORDER) {
                    if (updated[name] !== "complete") {
                      updated[name] = "complete";
                    }
                  }
                  return updated;
                });

                setIsComplete(true);

                // Delay transition to let user absorb the analysis
                setTimeout(() => {
                  onComplete(event.report);
                }, 2000);
              }

              if (event.type === "done" && !isComplete) {
                setIsComplete(true);
                setTimeout(() => {
                  onComplete(null);
                }, 1500);
              }

              if (event.type === "error" || event.type === "report_error") {
                setIsComplete(true);
                setTimeout(() => {
                  onComplete(null);
                }, 500);
              }
            } catch {
              // Ignore JSON parse errors from partial chunks
            }
          }
        }
      } catch (err) {
        console.error("Stream analysis error:", err);
        onComplete(null);
      }
    }

    runStream();
  }, [
    answers,
    dimensions,
    wellnessScore,
    biologicalAge,
    chronologicalAge,
    primaryTreatment,
    supportingTreatments,
    onComplete,
    isComplete,
  ]);

  return (
    <div className="mx-auto max-w-[640px] px-5 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="font-heading text-xl font-bold gold-text">
          Performing Cellular Scan...
        </h2>
        <p className="mt-2 text-sm text-muted">
          Analyzing 9 biological systems for signs of accelerated aging
        </p>
      </div>

      {/* Dimension List */}
      <div className="space-y-3">
        {DIMENSION_ORDER.map((name) => {
          const dim = dimensions.find((d) => d.name === name);
          if (!dim) return null;

          const status = dimStatuses[name] || "pending";
          const Icon = ICON_MAP[dim.icon] || Zap;
          const isActive = activeDimension === name;
          const narrative = dimNarratives[name];

          return (
            <div
              key={name}
              className={`rounded-xl border transition-all duration-500 ${
                status === "analyzing"
                  ? "border-gold/30 bg-[rgba(212,168,83,0.06)]"
                  : status === "complete"
                  ? "border-white/5 bg-bg-card"
                  : "border-white/[0.03] bg-bg-card/50 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Status Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                    status === "complete"
                      ? "bg-[rgba(34,197,94,0.12)]"
                      : status === "analyzing"
                      ? "bg-[rgba(212,168,83,0.12)]"
                      : "bg-white/5"
                  }`}
                >
                  {status === "complete" ? (
                    <Check
                      size={16}
                      className="text-green-500 animate-check-pop"
                    />
                  ) : status === "analyzing" ? (
                    <Loader2
                      size={16}
                      className="text-gold animate-spin"
                    />
                  ) : (
                    <Icon size={14} className="text-muted/40" />
                  )}
                </div>

                {/* Dimension Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        status === "analyzing"
                          ? "text-gold"
                          : status === "complete"
                          ? "text-white/90"
                          : "text-muted/50"
                      }`}
                    >
                      {name}
                    </span>
                    {status === "complete" && (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <span className="font-heading text-sm font-bold text-gold">
                          {dim.score}
                        </span>
                        <span className={`text-[10px] font-semibold ${
                          dim.score < 40 ? 'text-danger' : dim.score < 60 ? 'text-gold-dark' : 'text-green-500'
                        }`}>
                          {dim.score < 40 ? '— Critical' : dim.score < 60 ? '— Below threshold' : dim.score < 75 ? '— Adequate' : '— Optimal'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score bar (only when complete) */}
                  {status === "complete" && (
                    <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          dim.score >= 70
                            ? "bg-gradient-to-r from-gold-dark to-gold-light"
                            : dim.score >= 50
                            ? "bg-gold-dark"
                            : "bg-gradient-to-r from-danger to-[#ff6b7a]"
                        }`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Streaming Text */}
              {isActive && currentText && (
                <div className="border-t border-white/5 px-4 py-3 animate-fade-in">
                  <p className="text-sm leading-relaxed text-muted/80 animate-stream-in">
                    {currentText}
                  </p>
                </div>
              )}

              {/* Completed Narrative (collapsed) */}
              {status === "complete" && narrative && !isActive && (
                <div className="border-t border-white/5 px-4 py-3">
                  <p className="text-xs leading-relaxed text-muted/60 line-clamp-2">
                    {narrative}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      {showVerdict && verdictText && (
        <div className="mt-8 animate-fade-in text-center">
          <p className="font-heading text-lg font-bold gold-text">
            Scan Complete
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted/80 italic">
            &ldquo;{verdictText}&rdquo;
          </p>
          <p className="mt-2 text-xs text-green-500/80">
            But here&apos;s the good news — at your stage, this gap is fully reversible.
          </p>
        </div>
      )}

      {/* Completion */}
      {isComplete && (
        <div className="mt-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(34,197,94,0.08)] border border-green-500/20 px-4 py-2">
            <Check size={14} className="text-green-500" />
            <span className="text-xs font-medium text-green-400">
              Scan Complete — Loading Your Time Thief Report
            </span>
          </div>
        </div>
      )}

      <div ref={scrollRef} />
    </div>
  );
}
