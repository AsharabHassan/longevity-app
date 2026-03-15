"use client";

import { Lock, Shield, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrustItemProps {
  icon: LucideIcon;
  text: string;
}

function TrustItem({ icon: Icon, text }: TrustItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} strokeWidth={1.5} className="text-muted/50" />
      <span>{text}</span>
    </div>
  );
}

const items: TrustItemProps[] = [
  { icon: Lock, text: "256-bit encrypted" },
  { icon: Shield, text: "GDPR compliant" },
  { icon: Award, text: "Harley Street certified" },
];

export default function TrustBar() {
  return (
    <section className="flex flex-wrap items-center justify-center gap-5 px-6 py-8 text-[10px] text-muted/50 sm:gap-8">
      {items.map((item) => (
        <TrustItem key={item.text} {...item} />
      ))}
    </section>
  );
}
