"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { CONCERN_GUIDES } from "@/lib/concerns";

function ConcernCard({ name, defaultOpen }: { name: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const guide = CONCERN_GUIDES[name];
  if (!guide) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-4 text-left">
        <span className="text-sm font-semibold text-white">{name}</span>
        <ChevronDown size={16} className={`text-muted/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="animate-expand-down space-y-4 border-t border-white/5 px-4 py-4 text-[13px] leading-relaxed">
          <div>
            <p className="mb-1 text-[11px] font-semibold text-gold/80">Common, checkable causes</p>
            <p className="text-muted/80">{guide.causes.join(" · ")}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold text-gold/80">What a clinician would usually check</p>
            <p className="text-muted/80">{guide.tests.join(" · ")}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold text-gold/80">What the evidence says helps</p>
            <p className="text-muted/80">{guide.helps.join(" · ")}</p>
          </div>
          <div className="flex gap-2.5 rounded-lg border border-amber-400/15 bg-[rgba(251,191,36,0.04)] px-3 py-2.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400/80" />
            <p className="text-[12px] text-muted/80">{guide.redFlags}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConcernBridge({ concerns }: { concerns: string[] }) {
  const known = concerns.filter((c) => CONCERN_GUIDES[c]);
  if (known.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">What you told us</p>
      <h2 className="font-heading text-xl font-bold text-white mb-1">The things bothering you</h2>
      <p className="text-[13px] text-muted/60 mb-5">
        These didn&apos;t change your estimate. Each has several ordinary causes that are simple to check, and the right
        first step is to rule them in or out — not to guess.
      </p>
      <div className="space-y-2.5">
        {known.map((c, i) => (
          <ConcernCard key={c} name={c} defaultOpen={i === 0} />
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted/40">
        General information, not a diagnosis. If a symptom is severe, new or worrying you, speak to your GP or call NHS 111.
      </p>
    </section>
  );
}
