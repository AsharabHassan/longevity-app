"use client";

import { Activity, Star, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  value: string;
  numericValue?: number;
  label: string;
  delay: number;
}

function FeatureCard({ icon: Icon, value, numericValue, label, delay }: FeatureCardProps) {
  const [displayVal, setDisplayVal] = useState(numericValue ? 0 : -1);

  useEffect(() => {
    if (!numericValue) return;
    const duration = 1800;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(eased * numericValue!));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [numericValue, delay]);

  return (
    <div
      className="glass-card group flex flex-1 flex-col items-center gap-3 px-5 py-6 transition-all duration-300 hover:border-gold/20 hover:bg-[rgba(212,168,83,0.03)] animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Icon circle with glow */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/15 bg-[rgba(212,168,83,0.06)] transition-all duration-300 group-hover:border-gold/30 group-hover:shadow-[0_0_20px_rgba(212,168,83,0.12)]">
        <Icon size={24} strokeWidth={1.5} className="text-gold" />
      </div>

      {/* Value */}
      <span className="font-heading text-xl font-bold text-gold sm:text-2xl">
        {displayVal >= 0 ? displayVal.toLocaleString() : value}
      </span>

      {/* Label */}
      <span className="text-[10px] uppercase tracking-[1.5px] text-muted/70">
        {label}
      </span>
    </div>
  );
}

const features: FeatureCardProps[] = [
  { icon: Activity, value: "2,847", numericValue: 2847, label: "Scans This Month", delay: 0.6 },
  { icon: Star, value: "4.9", label: "Client Rating", delay: 0.7 },
  { icon: Clock, value: "3 min", label: "Free Scan", delay: 0.8 },
];

export default function Features() {
  return (
    <section className="flex gap-3 px-4 py-6 sm:gap-4 sm:px-6">
      {features.map((feature) => (
        <FeatureCard key={feature.label} {...feature} />
      ))}
    </section>
  );
}
