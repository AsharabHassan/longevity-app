import { Droplet, Dna, Stethoscope, Lock } from "lucide-react";

const ITEMS = [
  {
    icon: Droplet,
    title: "Your blood markers",
    text: "Blood sugar (HbA1c), iron stores, thyroid, vitamin D, cholesterol and inflammation. These explain a lot that habits alone can't — and they can be normal or abnormal whatever your score.",
  },
  {
    icon: Dna,
    title: "An epigenetic age estimate",
    text: "A saliva test that estimates age from DNA-methylation patterns. It is a wellness test, not a diagnosis, and typically lands within about five years of calendar age — so we read it alongside your bloods, never on its own.",
  },
  {
    icon: Stethoscope,
    title: "Your history and medications",
    text: "Family history, past illness and current medicines change what's worth testing and what isn't. That takes a conversation, not a questionnaire.",
  },
];

export default function MeasurementGap() {
  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">The other half of the picture</p>
      <h2 className="font-heading text-xl font-bold text-white mb-1">What a questionnaire can&apos;t see</h2>
      <p className="text-[13px] text-muted/60 mb-5">
        Your answers suggest where to look. Only measurement confirms it.
      </p>

      <div className="space-y-2.5">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass-card flex gap-3.5 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
              <Icon size={18} strokeWidth={1.5} className="text-muted/60" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{title}</p>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[9px] tracking-[1px] text-muted/50 uppercase">
                  <Lock size={9} /> Not measured yet
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted/70">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
