"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

function ClinicLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="12" stroke="#D4A853" strokeWidth="1.5" />
      <path
        d="M14 6C14 6 8 10.5 8 15C8 18.3137 10.6863 21 14 21C17.3137 21 20 18.3137 20 15C20 10.5 14 6 14 6Z"
        stroke="#D4A853"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="14" cy="14.5" r="2.5" fill="#D4A853" opacity="0.3" />
      <path
        d="M14 2V5M14 23V26M2 14H5M23 14H26"
        stroke="#D4A853"
        strokeWidth="0.8"
        opacity="0.4"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
      {/* Clinic branding */}
      <div className="mb-10 flex items-center gap-3">
        <ClinicLogo />
        <span className="font-heading text-[11px] font-medium tracking-[2.5px] text-gold">
          HARLEY STREET WELLNESS
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-heading text-center text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
        Discover Your
        <br />
        <span className="gold-text">Biological Age</span>
      </h1>

      {/* Subtext */}
      <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-muted sm:text-base">
        AI-powered longevity assessment. Get your wellness score, biological
        age, and personalized treatment plan in 3 minutes.
      </p>

      {/* CTA Button */}
      <Link
        href="/quiz"
        className="gold-gradient gold-glow group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-xl px-8 py-4 font-heading text-sm font-bold tracking-[1.5px] text-bg sm:text-base"
      >
        <span className="relative z-10">DISCOVER YOUR BIOLOGICAL AGE &rarr;</span>
        {/* Shimmer overlay */}
        <span
          className="animate-shimmer pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
          }}
        />
      </Link>

      {/* Trust line */}
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted/60">
        <Lock size={12} strokeWidth={1.5} />
        <span>Free &middot; Secure &middot; No credit card required</span>
      </div>
    </section>
  );
}
