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

      {/* ═══ Metabolic Health Program ═══ */}
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 border border-gold/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" stroke="#D4A853" strokeWidth="1.5" fill="rgba(212,168,83,0.1)" />
                <path d="M9 12L11 14L15 10" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Metabolic Health Program
              </h3>
              <p className="text-[11px] text-muted/50">
                Your complete longevity protocol — personalised to your results
              </p>
            </div>
          </div>
        </div>

        {/* Program Items */}
        <div className="divide-y divide-white/[0.04]">
          {[
            {
              title: "Diagnostic Testing",
              desc: "Comprehensive blood panels, hormone profiles, and metabolic markers to establish your baseline",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="3" stroke="#D4A853" strokeWidth="1.4" />
                  <line x1="12" y1="8" x2="12" y2="16" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="8" y1="12" x2="16" y2="12" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M7 16H17" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M9 16V20C9 20.55 9.45 21 10 21H14C14.55 21 15 20.55 15 20V16" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="5" r="1" fill="#D4A853" opacity="0.3" />
                </svg>
              ),
            },
            {
              title: "Nutritional Counselling",
              desc: "Personalised dietary strategies aligned with your metabolic profile and longevity goals",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" stroke="#D4A853" strokeWidth="1.4" fill="rgba(212,168,83,0.08)" strokeLinejoin="round" />
                  <line x1="12" y1="14" x2="12" y2="22" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M9 19H15" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M12 6V10" stroke="#D4A853" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                </svg>
              ),
            },
            {
              title: "Supplement Protocols",
              desc: "Evidence-based supplement stacks targeting your specific deficiencies and cellular needs",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="7" y="3" width="10" height="18" rx="5" stroke="#D4A853" strokeWidth="1.4" />
                  <line x1="7" y1="12" x2="17" y2="12" stroke="#D4A853" strokeWidth="1.4" />
                  <rect x="7" y="12" width="10" height="9" rx="5" fill="rgba(212,168,83,0.12)" />
                  <circle cx="12" cy="8" r="1" fill="#D4A853" opacity="0.4" />
                  <circle cx="10.5" cy="16" r="0.8" fill="#D4A853" opacity="0.3" />
                  <circle cx="13.5" cy="17" r="0.8" fill="#D4A853" opacity="0.3" />
                </svg>
              ),
            },
            {
              title: "Peptide Therapy",
              desc: "Targeted peptide protocols for tissue repair, immune modulation, and cellular regeneration",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3C6 3 8 7 8 12C8 17 6 21 6 21" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M12 3C12 3 10 7 10 12C10 17 12 21 12 21" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M12 3C12 3 14 7 14 12C14 17 12 21 12 21" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M18 3C18 3 16 7 16 12C16 17 18 21 18 21" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="5" y1="8" x2="19" y2="8" stroke="#D4A853" strokeWidth="1" opacity="0.3" />
                  <line x1="5" y1="16" x2="19" y2="16" stroke="#D4A853" strokeWidth="1" opacity="0.3" />
                  <circle cx="12" cy="12" r="1.5" fill="#D4A853" opacity="0.2" />
                </svg>
              ),
            },
            {
              title: "IV Therapies",
              desc: "Clinical-grade IV infusions including NAD+, Glutathione, and custom vitamin cocktails",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="8" y="1" width="8" height="12" rx="2" stroke="#D4A853" strokeWidth="1.4" />
                  <rect x="8" y="6" width="8" height="7" rx="0" fill="rgba(212,168,83,0.12)" />
                  <line x1="12" y1="13" x2="12" y2="17" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M10 17L12 17L14 17" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M12 17V21" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 2" />
                  <circle cx="12" cy="22" r="1" fill="#D4A853" opacity="0.4" />
                  <line x1="10" y1="4" x2="14" y2="4" stroke="#D4A853" strokeWidth="1" opacity="0.3" />
                </svg>
              ),
            },
            {
              title: "Advanced Treatments",
              desc: "EBOO (Extracorporeal Blood Oxygenation & Ozonation), ozone therapy, and cutting-edge longevity interventions",
              svg: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#D4A853" strokeWidth="1.4" />
                  <circle cx="12" cy="12" r="4" stroke="#D4A853" strokeWidth="1.2" fill="rgba(212,168,83,0.08)" />
                  <circle cx="12" cy="12" r="1.5" fill="#D4A853" opacity="0.4" />
                  <line x1="12" y1="3" x2="12" y2="6" stroke="#D4A853" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="21" stroke="#D4A853" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="6" y2="12" stroke="#D4A853" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="18" y1="12" x2="21" y2="12" stroke="#D4A853" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" stroke="#D4A853" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                  <line x1="16.2" y1="16.2" x2="18.4" y2="18.4" stroke="#D4A853" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                  <line x1="18.4" y1="5.6" x2="16.2" y2="7.8" stroke="#D4A853" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                  <line x1="7.8" y1="16.2" x2="5.6" y2="18.4" stroke="#D4A853" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] animate-fade-in"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/10 shrink-0 mt-0.5">
                {item.svg}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white/90">{item.title}</h4>
                <p className="text-[11px] leading-relaxed text-muted/50 mt-0.5">
                  {item.desc}
                </p>
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 shrink-0 mt-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.04]">
          <p className="text-[11px] text-center text-muted/40">
            All protocols are administered by GMC-registered doctors at our Portpool Lane clinic
          </p>
        </div>
      </div>

      {/* ═══ CTA Button ═══ */}
      <a
        href="https://link.harleystreetmedicalwellness.co.uk/widget/bookings/wellness-consultant-1"
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
