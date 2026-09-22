import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowRight } from "lucide-react";
import { CLINIC } from "@/lib/clinic";

/* ── Floating Particles (deterministic to avoid SSR hydration mismatch) ── */
const PARTICLES = [
  { w: 3, left: 15, bottom: 12, opacity: 0.2, dur: 14, delay: 0 },
  { w: 4, left: 35, bottom: 10, opacity: 0.3, dur: 18, delay: 2 },
  { w: 2, left: 55, bottom: 14, opacity: 0.25, dur: 15, delay: 5 },
  { w: 3, left: 75, bottom: 11, opacity: 0.35, dur: 20, delay: 1 },
  { w: 5, left: 25, bottom: 13, opacity: 0.18, dur: 16, delay: 7 },
  { w: 2, left: 85, bottom: 10, opacity: 0.28, dur: 22, delay: 3 },
];

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.w}px`,
            height: `${p.w}px`,
            left: `${p.left}%`,
            bottom: `-${p.bottom}%`,
            background: `rgba(212, 168, 83, ${p.opacity})`,
            animation: `particle-drift ${p.dur}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════ */
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pt-12 pb-6 sm:pt-20 sm:pb-10">
      <Particles />

      {/* Clinic branding */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Image
          src="/logo.png"
          alt={CLINIC.brand}
          width={140}
          height={140}
          className="mx-auto"
          priority
        />
      </div>

      <p className="mb-6 animate-fade-in text-[10px] font-semibold tracking-[3px] text-gold/70 uppercase">
        An evidence-based lifestyle age assessment
      </p>

      {/* Headline */}
      <h1
        className="font-heading text-center text-[32px] font-bold leading-[1.1] sm:text-5xl md:text-6xl animate-fade-in-up text-glow"
        style={{ animationDelay: "0.2s" }}
      >
        We Measure Before
        <br />
        <span className="gold-text">We Recommend Anything.</span>
      </h1>

      {/* Subtext */}
      <p
        className="mt-5 max-w-lg text-center text-[15px] leading-relaxed text-muted sm:text-lg animate-fade-in-up"
        style={{ animationDelay: "0.35s" }}
      >
        A short questionnaire. Three minutes. An honest estimate of how your habits compare with the research — and a free consultation to go through it.
      </p>

      {/* CTA Button */}
      <Link
        href="/quiz"
        className="gold-gradient animate-glow-breathe group relative mt-10 inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-10 py-4.5 font-heading text-[15px] font-bold tracking-[1.5px] text-bg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:text-base animate-fade-in-up"
        style={{ animationDelay: "0.5s" }}
      >
        <span className="relative z-10 flex items-center gap-2">
          START MY FREE ASSESSMENT
          <ArrowRight size={18} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        {/* Shimmer */}
        <span
          className="animate-shimmer pointer-events-none absolute inset-0 z-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          }}
        />
      </Link>

      {/* Trust line */}
      <div
        className="mt-5 flex items-center gap-2 text-[11px] text-muted/50 animate-fade-in"
        style={{ animationDelay: "0.6s" }}
      >
        <Lock size={12} strokeWidth={1.5} />
        <span>Free &middot; 3 minutes &middot; An estimate, not a medical test</span>
      </div>
    </section>
  );
}
