import { Microscope, ClipboardCheck, Syringe, Activity, MessagesSquare } from "lucide-react";

const STEPS = [
  { n: "1", title: "Measure", text: "Bloods, DNA and epigenetic testing, and a proper history — so we know what is actually going on." },
  { n: "2", title: "Understand", text: "A clinician goes through the results with you: what matters, what doesn't, and what is holding you back." },
  { n: "3", title: "Then decide", text: "Only after that do we talk about a plan — which may be a programme, a therapy, or simply a referral back to your GP." },
];

/**
 * The clinic's portfolio, shown identically to every qualified reader. It is
 * deliberately not matched to their answers: a questionnaire can't choose a
 * therapy, and UK advertising rules bar efficacy claims for these services.
 * Prescription-only and unlicensed medicines are never named here.
 */
const PORTFOLIO = [
  {
    icon: Microscope,
    title: "Testing",
    text: "Blood panels, plus DNA and epigenetic testing from a saliva sample.",
  },
  {
    icon: ClipboardCheck,
    title: "Lifestyle and metabolic programmes",
    text: "Structured support for weight, blood sugar, sleep and activity, built around your results.",
  },
  {
    icon: Syringe,
    title: "IV vitamin and mineral infusions",
    text: "Given in clinic, only after a clinical assessment.",
  },
  {
    icon: Activity,
    title: "EBOO",
    text: "An ozone-based blood procedure carried out in clinic. It is an emerging therapy: large clinical trials have not been done, and suitability is assessed individually.",
  },
  {
    icon: MessagesSquare,
    title: "Further therapies",
    text: "Discussed only in consultation, where clinically appropriate.",
  },
];

export default function ClinicPathway() {
  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">How we work</p>
      <h2 className="font-heading text-xl font-bold text-white mb-5">We measure before we recommend anything</h2>

      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 font-heading text-xs font-bold text-gold">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted/70">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-7 mb-3 text-[11px] font-semibold text-gold/80">What the clinic offers</p>
      <div className="space-y-2">
        {PORTFOLIO.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass-card flex gap-3.5 px-4 py-3.5">
            <Icon size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold/80" />
            <div>
              <p className="text-[13.5px] font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted/70">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-muted/50">
        Which of these, if any, is right for you is a clinical decision made after assessment, not by a questionnaire.
        We don&apos;t claim that any therapy changes your lifestyle age estimate.
      </p>
    </section>
  );
}
