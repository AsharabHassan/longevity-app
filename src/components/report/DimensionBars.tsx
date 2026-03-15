"use client";

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
} from "lucide-react";
import type { DimensionScore } from "@/lib/types";

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

function getScoreColor(score: number): string {
  if (score >= 70) return "text-gold";
  if (score >= 50) return "text-gold-dark";
  return "text-danger";
}

function getBarGradient(score: number): string {
  if (score >= 70) return "bg-gradient-to-r from-gold-dark to-gold-light";
  if (score >= 50) return "bg-gold-dark";
  return "bg-gradient-to-r from-danger to-[#ff6b7a]";
}

interface DimensionBarsProps {
  dimensions: DimensionScore[];
}

export default function DimensionBars({ dimensions }: DimensionBarsProps) {
  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="font-heading mb-6 text-center text-lg font-bold tracking-wide">
        Wellness Dimensions
      </h2>
      {dimensions.map((dim, index) => {
        const Icon = ICON_MAP[dim.icon] || Zap;
        return (
          <div
            key={dim.name}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(212,168,83,0.08)]">
                  <Icon size={14} className="text-gold" />
                </div>
                <span className="text-sm font-medium text-white/90">
                  {dim.name}
                </span>
              </div>
              <span className={`font-heading text-sm font-bold ${getScoreColor(dim.score)}`}>
                {dim.score}
              </span>
            </div>
            {/* Bar track */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${getBarGradient(dim.score)} transition-all duration-1000 ease-out`}
                style={{ width: `${dim.score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
