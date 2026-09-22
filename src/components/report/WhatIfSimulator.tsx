"use client";

import { useState } from "react";
import { whatIf } from "@/lib/lifestyleAge";
import type { FactorId, LifestyleAgeResult } from "@/lib/types";

export default function WhatIfSimulator({ result }: { result: LifestyleAgeResult }) {
  const [applied, setApplied] = useState<FactorId[]>([]);
  const options = result.factors.filter((f) => f.improvement);
  if (options.length === 0) return null;

  const projected = whatIf(result, applied);
  const change = result.estimate - projected.estimate;

  const toggle = (id: FactorId) =>
    setApplied((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">What would change your number</p>
      <h2 className="font-heading text-xl font-bold text-white mb-1">Try it</h2>
      <p className="text-[13px] text-muted/60 mb-5">Switch on a change to see how the estimate moves.</p>

      <div className="glass-card-gold mb-4 flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[10px] tracking-[2px] text-muted/50 uppercase">Estimate with these changes</p>
          <p className="font-heading text-3xl font-bold tabular-nums text-white">
            {projected.low}–{projected.high}
          </p>
        </div>
        <p className={`font-heading text-sm font-bold ${change > 0 ? "text-green-500" : "text-muted/40"}`}>
          {change > 0 ? `${change} ${change === 1 ? "year" : "years"} lower` : "No change yet"}
        </p>
      </div>

      <div className="space-y-2">
        {options.map((f) => {
          const on = applied.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              role="switch"
              aria-checked={on}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                on ? "border-gold/40 bg-[rgba(212,168,83,0.08)]" : "border-white/8 bg-bg-card hover:border-white/15"
              }`}
            >
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-gold" : "bg-white/10"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
              </span>
              <span className="text-[14px] text-white/90">{f.improvement!.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted/40">
        These are population averages from observational studies. They show what tends to be true across many people,
        not a promise about what will happen for you.
      </p>
    </section>
  );
}
