import { Check } from "lucide-react";
import { CLINIC } from "@/lib/clinic";

/** What the paid wellness consultation covers, with the price shown up front. */
export default function ConsultationIncludes({ className = "" }: { className?: string }) {
  const { price, includes } = CLINIC.wellnessConsultation;
  return (
    <section className={`glass-card-gold p-5 ${className}`}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[3px] text-gold">The full assessment</p>
      <h2 className="font-heading text-xl font-bold text-white">What the wellness consultation includes</h2>
      <ul className="mt-4 space-y-2.5">
        {includes.map((item) => (
          <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/85">
            <Check size={15} className="mt-0.5 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-white/5 pt-4 text-[13px] text-white/85">
        Wellness consultation: <span className="font-heading font-bold text-gold">{price}</span>
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted/60">
        Your free call with our team explains exactly what is included and what each test costs before you decide
        anything.
      </p>
    </section>
  );
}
