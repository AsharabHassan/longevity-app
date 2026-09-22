import { ClipboardList, BookOpen, Stethoscope } from "lucide-react";
import { CLINIC, consultationHost } from "@/lib/clinic";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Answer a few questions",
    text: "Sleep, activity, diet, alcohol, smoking, stress — the habits the research says matter most.",
  },
  {
    icon: BookOpen,
    title: "See your estimate",
    text: "A lifestyle age range, what's driving it, and the published study behind every figure.",
  },
  {
    icon: Stethoscope,
    title: "Talk it through, free",
    text: `${CLINIC.consultation.minutes} minutes with ${consultationHost()}, on which tests are worth considering for you and which aren't.`,
  },
];

export default function Features() {
  return (
    <section className="grid gap-3 px-4 py-6 sm:grid-cols-3 sm:gap-4 sm:px-6">
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <div
          key={title}
          className="glass-card flex flex-col gap-3 px-5 py-6 animate-fade-in-up"
          style={{ animationDelay: `${0.6 + i * 0.1}s` }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/15 bg-[rgba(212,168,83,0.06)]">
            <Icon size={22} strokeWidth={1.5} className="text-gold" />
          </div>
          <p className="font-heading text-base font-bold text-white">{title}</p>
          <p className="text-[12.5px] leading-relaxed text-muted/70">{text}</p>
        </div>
      ))}
    </section>
  );
}
