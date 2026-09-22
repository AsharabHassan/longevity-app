"use client";

import { useState } from "react";
import { Cigarette, Dumbbell, Scale, Apple, Moon, Wine, Heart, Users, ChevronDown } from "lucide-react";
import type { FactorResult, LifestyleAgeResult } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  cigarette: Cigarette,
  dumbbell: Dumbbell,
  scale: Scale,
  apple: Apple,
  moon: Moon,
  wine: Wine,
  heart: Heart,
  users: Users,
};

const CONFIDENCE_LABEL: Record<FactorResult["confidence"], string> = {
  high: "Strong evidence",
  moderate: "Moderate evidence",
  low: "Early evidence",
};

export function formatYears(years: number): string {
  if (years === 0) return "No effect";
  const abs = Math.abs(years);
  return `${years > 0 ? "+" : "−"}${abs} ${abs === 1 ? "year" : "years"}`;
}

function FactorTile({ factor, defaultOpen }: { factor: FactorResult; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = ICONS[factor.icon] ?? Heart;
  const tone =
    factor.status === "adding" ? "text-amber-400" : factor.status === "helping" ? "text-green-500" : "text-muted/60";

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3.5 px-4 py-4 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/15 bg-[rgba(212,168,83,0.06)]">
          <Icon size={18} strokeWidth={1.5} className="text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{factor.name}</p>
          <p className="truncate text-[12px] text-muted/50">You said: {factor.answerLabel}</p>
        </div>
        <span className={`shrink-0 font-heading text-sm font-bold tabular-nums ${tone}`}>
          {formatYears(factor.years)}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-muted/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-expand-down border-t border-white/5 px-4 py-4">
          <p className="text-[13px] leading-relaxed text-muted/80">{factor.evidence}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted/40">
            <span className="rounded-full border border-white/10 px-2 py-0.5">{CONFIDENCE_LABEL[factor.confidence]}</span>
            {factor.citations.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold/70">
                {c.short}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriverTiles({ result }: { result: LifestyleAgeResult }) {
  const adding = result.factors.filter((f) => f.years > 0).sort((a, b) => b.years - a.years);
  const helping = result.factors.filter((f) => f.years < 0).sort((a, b) => a.years - b.years);
  const neutral = result.factors.filter((f) => f.years === 0);

  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">What&apos;s behind your number</p>
      <h2 className="font-heading text-xl font-bold text-white mb-1">Your answers, against the research</h2>
      <p className="text-[13px] text-muted/60 mb-5">
        Each figure is the average difference seen in large studies of people who gave a similar answer. Tap any row for the source.
      </p>

      {adding.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-amber-400/80">Adding years</p>
          {adding.map((f, i) => (
            <FactorTile key={f.id} factor={f} defaultOpen={i === 0} />
          ))}
        </div>
      )}

      {helping.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-[11px] font-semibold text-green-500/80">Working in your favour</p>
          {helping.map((f) => (
            <FactorTile key={f.id} factor={f} defaultOpen={adding.length === 0 && f === helping[0]} />
          ))}
        </div>
      )}

      {neutral.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-[11px] font-semibold text-muted/50">About average</p>
          {neutral.map((f) => (
            <FactorTile key={f.id} factor={f} defaultOpen={false} />
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted/40">
        The factors overlap, so your total is capped and may be less than the sum of the rows
        {result.chronologicalAge < 30 ? ", and effects are halved under 30 because the research is mostly in people over 40" : ""}.
      </p>
    </section>
  );
}
