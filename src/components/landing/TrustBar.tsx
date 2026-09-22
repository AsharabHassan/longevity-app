"use client";

import { Lock, Shield, BookOpen, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrustItemProps {
  icon: LucideIcon;
  text: string;
}

function TrustItem({ icon: Icon, text }: TrustItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-4 py-1.5 transition-colors duration-300 hover:border-gold/10">
      <Icon size={13} strokeWidth={1.5} className="text-gold/40" />
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}

const items: TrustItemProps[] = [
  { icon: Award, text: "GMC-registered doctors" },
  { icon: Shield, text: "CQC (London) · HIS (Glasgow)" },
  { icon: BookOpen, text: "Every figure sourced" },
  { icon: Lock, text: "Your answers stay private" },
];

export default function TrustBar() {
  return (
    <section className="animate-fade-in flex flex-wrap items-center justify-center gap-3 px-4 py-8 text-[10px] text-muted/50" style={{ animationDelay: "1s" }}>
      {items.map((item) => (
        <TrustItem key={item.text} {...item} />
      ))}
    </section>
  );
}
