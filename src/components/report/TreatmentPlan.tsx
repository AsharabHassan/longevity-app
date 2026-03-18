"use client";

import {
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
  Clock,
  ArrowRight,
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

function estimateYearsRecovered(treatment: Treatment): number {
  if (treatment.price >= 400) return 2.8;
  if (treatment.price >= 250) return 2.1;
  if (treatment.price >= 150) return 1.4;
  return 0.8;
}

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
    reportData?.treatmentPlan?.primary?.reasoning ?? primary.description;

  const primaryYears = estimateYearsRecovered(primary);
  const totalRecovery = supporting.reduce(
    (sum, t) => sum + estimateYearsRecovered(t),
    primaryYears
  );

  return (
    <div className="animate-fade-in space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
          <Clock size={20} className="text-gold" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-glow">Your Time Recovery Plan</h2>
          <p className="text-xs text-muted/50">
            How to reverse your Longevity Gap
          </p>
        </div>
      </div>

      {/* Recovery Summary */}
      <div className="glass-card-gold p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted/80">Total Recovery Potential</span>
          <span className="font-heading text-xl font-bold text-green-500">
            +{Math.round(totalRecovery * 10) / 10} years
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted/40">
          Based on clinical outcomes for your specific profile
        </p>
      </div>

      {/* ═══ Primary Treatment ═══ */}
      <div className="glass-card-gold animate-glow-breathe p-6 relative overflow-hidden">
        {/* Ambient glow behind */}
        <div
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.2), transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="relative z-10 mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-4 py-1.5 border border-gold/15">
          <Star size={12} className="text-gold-light" fill="var(--gold-light)" />
          <span className="text-[10px] font-bold tracking-[2px] text-gold-light uppercase">
            Top Recovery
          </span>
        </div>

        {/* Recovery */}
        <div className="relative z-10 mb-3 flex items-center gap-2">
          <span className="text-sm text-green-500 font-bold">
            Recover {primaryYears} years
          </span>
          <ArrowRight size={14} className="text-muted/30" />
        </div>

        {/* Name + Price + Icon */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/15">
              <PrimaryIcon size={24} className="text-gold" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              {primary.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            {primary.originalPrice && (
              <span className="text-xs text-muted/60 line-through mr-1.5">
                &pound;{primary.originalPrice}
              </span>
            )}
            <span className="font-heading text-xl font-bold text-gold">
              &pound;{primary.price}
            </span>
          </div>
        </div>

        {/* AI Reasoning */}
        <p className="relative z-10 mt-4 text-[14px] leading-relaxed text-muted/80">
          {primaryReasoning}
        </p>

        {/* Tags */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {primary.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gold/10 bg-gold/5 px-3 py-1 text-[11px] font-medium text-gold/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ Supporting Treatments ═══ */}
      <div className="space-y-3">
        {supporting.map((treatment, i) => {
          const Icon = ICON_MAP[treatment.icon] || Zap;
          const reasoning =
            reportData?.treatmentPlan?.supporting?.find(
              (s) => s.name === treatment.name
            )?.reasoning ?? treatment.description;
          const yearsRecovered = estimateYearsRecovered(treatment);

          return (
            <div
              key={treatment.name}
              className="glass-card p-5 transition-all duration-300 hover:border-white/10 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/10 bg-gold/5">
                    <Icon size={18} className="text-gold/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-green-500">
                        Recover {yearsRecovered} yr
                      </span>
                    </div>
                    <h4 className="font-heading text-base font-bold text-white">
                      {treatment.name}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted/70 max-w-[280px]">
                      {reasoning}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {treatment.originalPrice && (
                    <span className="text-[10px] text-muted/50 line-through mr-1">
                      &pound;{treatment.originalPrice}
                    </span>
                  )}
                  <span className="font-heading text-base font-bold text-gold">
                    &pound;{treatment.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ CTA Button ═══ */}
      <a
        href="https://calendly.com/harleystreet-wellness/free-consultation"
        target="_blank"
        rel="noopener noreferrer"
        className="gold-gradient animate-glow-breathe group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4.5 font-heading text-[15px] font-bold tracking-[1.5px] text-bg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="relative z-10 flex items-center gap-2">
          BOOK FREE ONLINE CONSULTATION
          <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
        </span>
        <span
          className="animate-shimmer pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          }}
        />
      </a>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted/40">
        <Calendar size={12} strokeWidth={1.5} />
        <span>Free consultation &middot; Available in London &amp; Glasgow</span>
      </p>
    </div>
  );
}
