import { Search } from "lucide-react";
import { FACTOR_BARRIERS } from "@/lib/barriers";
import { topDrivers } from "@/lib/lifestyleAge";
import type { LifestyleAgeResult } from "@/lib/types";

export default function BarrierBridge({ result }: { result: LifestyleAgeResult }) {
  const drivers = topDrivers(result, 2);
  if (drivers.length === 0) return null;

  const concerns = result.concerns.slice(0, 2).map((c) => c.toLowerCase());

  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">The honest part</p>
      <h2 className="font-heading text-xl font-bold text-white mb-2">If it were that easy, you&apos;d have done it</h2>
      <p className="text-[13.5px] leading-relaxed text-muted/75">
        Nobody needs a report to tell them to move more or sleep better. When a change hasn&apos;t stuck, there is often
        a reason underneath it
        {concerns.length > 0 ? (
          <>
            {" "}
            — and you&apos;ve told us about <span className="text-white/90">{concerns.join(" and ")}</span>, which can be
            exactly that kind of reason
          </>
        ) : null}
        . Many of those reasons can be measured. That is where we start.
      </p>

      <div className="mt-5 space-y-2.5">
        {drivers.map((f) => {
          const barrier = FACTOR_BARRIERS[f.id];
          return (
            <div key={f.id} className="glass-card px-4 py-4">
              <p className="text-[11px] font-semibold text-amber-400/80">{f.name}</p>
              <p className="mt-1 text-sm font-semibold text-white">{barrier.struggle}.</p>
              <div className="mt-3 flex gap-2.5">
                <Search size={14} className="mt-0.5 shrink-0 text-gold/70" />
                <div>
                  <p className="text-[11px] font-semibold text-gold/80">Worth measuring</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted/75">{barrier.measurable.join(" · ")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted/40">
        These are possibilities to rule in or out, not a suggestion that you have any of them.
      </p>
    </section>
  );
}
