"use client";

import {
  FlaskConical,
  Clock,
  Stethoscope,
  CalendarRange,
} from "lucide-react";

interface DimensionDeepDiveProps {
  mechanism: string;
  agingImpact: string;
  treatmentConnection: string;
  timeline: string;
  treatmentName: string;
}

export default function DimensionDeepDive({
  mechanism,
  agingImpact,
  treatmentConnection,
  timeline,
  treatmentName,
}: DimensionDeepDiveProps) {
  const sections = [
    {
      icon: Stethoscope,
      title: "What\u2019s Happening",
      content: mechanism,
      accentColor: "text-blue-400",
      bgColor: "bg-blue-400/8",
      borderColor: "border-blue-400/15",
    },
    {
      icon: Clock,
      title: "Why It Matters for Aging",
      content: agingImpact,
      accentColor: "text-amber-400",
      bgColor: "bg-amber-400/8",
      borderColor: "border-amber-400/15",
    },
    {
      icon: FlaskConical,
      title: `How ${treatmentName} Helps`,
      content: treatmentConnection,
      accentColor: "text-gold",
      bgColor: "bg-[rgba(212,168,83,0.08)]",
      borderColor: "border-gold/15",
    },
    {
      icon: CalendarRange,
      title: "Expected Timeline",
      content: timeline,
      accentColor: "text-green-400",
      bgColor: "bg-green-400/8",
      borderColor: "border-green-400/15",
    },
  ];

  return (
    <div className="animate-expand-down space-y-2.5 px-4 pb-4 pt-1">
      {sections.map(
        ({ icon: Icon, title, content, accentColor, bgColor, borderColor }) => (
          <div
            key={title}
            className={`rounded-lg border ${borderColor} ${bgColor} p-3`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={13} className={accentColor} />
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${accentColor}`}
              >
                {title}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted/80">{content}</p>
          </div>
        )
      )}

      {/* Mini CTA */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-[11px] text-muted/50">
          This is why we recommend{" "}
          <strong className="text-gold/70">{treatmentName}</strong> →
        </span>
      </div>
    </div>
  );
}
