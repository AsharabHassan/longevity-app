"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

/* ── Clinic Logo (SVG) ── */
function ClinicLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12" stroke="#D4A853" strokeWidth="1" />
      <path
        d="M14 6C14 6 8 10.5 8 15C8 18.3137 10.6863 21 14 21C17.3137 21 20 18.3137 20 15C20 10.5 14 6 14 6Z"
        stroke="#D4A853"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="14" cy="14.5" r="2.5" fill="#D4A853" opacity="0.25" />
      <path
        d="M14 2V5M14 23V26M2 14H5M23 14H26"
        stroke="#D4A853"
        strokeWidth="0.6"
        opacity="0.3"
      />
    </svg>
  );
}

/* ── Animated counter ── */
function LiveCounter() {
  const [count, setCount] = useState(0);
  const target = 2847;

  useEffect(() => {
    const duration = 2200;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="glass-card animate-fade-in mb-8 inline-flex items-center gap-2.5 px-5 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="text-[12px] text-muted">
        <span className="font-semibold text-gold tabular-nums">{count.toLocaleString()}</span>{" "}
        Londoners scanned this month
      </span>
    </div>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  { quote: "I was 34. My body was 41. Three months later, I'm back to 33.", author: "Sarah M.", role: "Marketing Director" },
  { quote: "The fog lifted after my second session. I shipped a feature the same afternoon.", author: "Tom H.", role: "Software Architect" },
  { quote: "My aesthetician noticed before I did. Skin was clearer than my 20s.", author: "Olivia R.", role: "Fashion Buyer" },
];

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <div className="glass-card-gold animate-fade-in mt-8 w-full max-w-md px-6 py-4 text-center">
      <p className="text-[13px] italic leading-relaxed text-muted/90">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className="text-[11px] font-semibold text-gold">{t.author}</span>
        <span className="text-[10px] text-muted/50">&middot; {t.role}</span>
      </div>
      {/* Dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-5 bg-gold" : "w-1.5 bg-white/10"
            }`}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

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
          alt="Harley Street Wellness"
          width={140}
          height={140}
          className="mx-auto"
          priority
        />
      </div>

      {/* Live scan counter */}
      <LiveCounter />

      {/* Headline */}
      <h1
        className="font-heading text-center text-[32px] font-bold leading-[1.1] sm:text-5xl md:text-6xl animate-fade-in-up text-glow"
        style={{ animationDelay: "0.2s" }}
      >
        Your Body Thinks You&apos;re
        <br />
        <span className="gold-text">Older Than You Are.</span>
      </h1>

      {/* Subtext */}
      <p
        className="mt-5 max-w-lg text-center text-[15px] leading-relaxed text-muted sm:text-lg animate-fade-in-up"
        style={{ animationDelay: "0.35s" }}
      >
        In 3 minutes, find out how much time you&apos;re losing — and how to get it back.
      </p>

      {/* Testimonial */}
      <TestimonialCarousel />

      {/* CTA Button */}
      <Link
        href="/quiz"
        className="gold-gradient animate-glow-breathe group relative mt-10 inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-10 py-4.5 font-heading text-[15px] font-bold tracking-[1.5px] text-bg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:text-base animate-fade-in-up"
        style={{ animationDelay: "0.5s" }}
      >
        <span className="relative z-10 flex items-center gap-2">
          START MY FREE SCAN
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
        <span>Free &middot; 3 Minutes &middot; No credit card required</span>
      </div>
    </section>
  );
}
