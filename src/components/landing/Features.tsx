"use client";

import { Star, CheckCircle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

function FeatureCard({ icon: Icon, value, label }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Icon circle */}
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-[rgba(212,168,83,0.06)]">
        <Icon size={20} strokeWidth={1.5} className="text-gold" />
      </div>
      {/* Value */}
      <span className="font-heading text-base font-bold text-gold sm:text-lg">
        {value}
      </span>
      {/* Label */}
      <span className="text-[9px] uppercase tracking-[1px] text-muted">
        {label}
      </span>
    </div>
  );
}

const features: FeatureCardProps[] = [
  { icon: Star, value: "10,000+", label: "Assessed" },
  { icon: CheckCircle, value: "94%", label: "Accuracy" },
  { icon: Clock, value: "3 min", label: "To Complete" },
];

export default function Features() {
  return (
    <section className="flex justify-center gap-10 px-6 py-6 sm:gap-16">
      {features.map((feature) => (
        <FeatureCard key={feature.label} {...feature} />
      ))}
    </section>
  );
}
