"use client";

import {
  Bookmark,
  Star,
  Zap,
  Brain,
  Shield,
  Sparkles,
  Droplets,
  Atom,
  Layers,
  TrendingUp,
  Calendar,
  FlaskConical,
} from "lucide-react";
import type { Treatment, ReportData } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  zap: Zap,
  brain: Brain,
  shield: Shield,
  sparkles: Sparkles,
  droplets: Droplets,
  atom: Atom,
  layers: Layers,
  "trending-up": TrendingUp,
  beaker: FlaskConical,
};

interface TreatmentPlanProps {
  primary: Treatment;
  supporting: Treatment[];
  reportData: ReportData | null;
}

export default function TreatmentPlan({
  primary,
  supporting,
  reportData,
}: TreatmentPlanProps) {
  const PrimaryIcon = ICON_MAP[primary.icon] || Zap;

  const primaryReasoning =
    reportData?.treatmentPlan?.primary?.reasoning ??
    primary.description;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Bookmark size={18} className="text-gold" />
        <div>
          <h2 className="font-heading text-lg font-bold">Your Treatment Plan</h2>
          <p className="text-xs text-muted">
            AI-recommended based on your unique profile
          </p>
        </div>
      </div>

      {/* Primary Treatment Card */}
      <div className="rounded-2xl border border-gold/20 bg-[rgba(212,168,83,0.06)] p-5 gold-glow">
        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(212,168,83,0.12)] px-3 py-1 border border-gold/20">
          <Star size={12} className="text-gold-light" fill="var(--gold-light)" />
          <span className="text-[10px] font-bold tracking-[2px] text-gold-light uppercase">
            Primary Recommendation
          </span>
        </div>

        {/* Name + Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,83,0.1)]">
              <PrimaryIcon size={20} className="text-gold" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">
              {primary.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            {primary.originalPrice && (
              <span className="text-xs text-muted line-through mr-1.5">
                &pound;{primary.originalPrice}
              </span>
            )}
            <span className="font-heading text-lg font-bold text-gold">
              &pound;{primary.price}
            </span>
          </div>
        </div>

        {/* AI Reasoning */}
        <p className="mt-3 text-sm leading-relaxed text-muted/90">
          {primaryReasoning}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {primary.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gold/15 bg-[rgba(212,168,83,0.08)] px-3 py-1 text-[11px] font-medium text-gold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Supporting Treatment Cards */}
      {supporting.map((treatment) => {
        const Icon = ICON_MAP[treatment.icon] || Zap;
        const reasoning =
          reportData?.treatmentPlan?.supporting?.find(
            (s) => s.name === treatment.name
          )?.reasoning ?? treatment.description;

        return (
          <div
            key={treatment.name}
            className="rounded-2xl border border-white/5 bg-bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(212,168,83,0.06)]">
                  <Icon size={16} className="text-gold/70" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-white">
                    {treatment.name}
                  </h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted/80">
                    {reasoning}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {treatment.originalPrice && (
                  <span className="text-[10px] text-muted line-through mr-1">
                    &pound;{treatment.originalPrice}
                  </span>
                )}
                <span className="font-heading text-sm font-bold text-gold">
                  &pound;{treatment.price}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* CTA Button */}
      <a
        href="#book"
        className="gold-gradient gold-glow group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl px-6 py-4 font-heading text-sm font-bold tracking-[1.5px] text-bg"
      >
        <span className="relative z-10">BOOK FREE CONSULTATION &rarr;</span>
        <span
          className="animate-shimmer pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          }}
        />
      </a>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted/60">
        <Calendar size={12} strokeWidth={1.5} />
        <span>Available in London &amp; Glasgow &middot; No obligation</span>
      </p>
    </div>
  );
}
