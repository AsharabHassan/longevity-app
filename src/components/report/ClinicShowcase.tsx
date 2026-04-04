"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MapPin, Play, X } from "lucide-react";

/* ── Google Reviews Data ─── */
const GOOGLE_REVIEWS = [
  {
    name: "James R.",
    rating: 5,
    text: "Incredible experience. The NAD+ IV drip gave me energy I haven't felt in years. The clinic is spotless and the staff are extremely professional.",
    time: "2 weeks ago",
  },
  {
    name: "Sarah M.",
    rating: 5,
    text: "Had EBOO therapy and it was genuinely life-changing. The whole team made me feel so comfortable. Can't recommend enough!",
    time: "1 month ago",
  },
  {
    name: "David K.",
    rating: 5,
    text: "Top-notch clinic. Dr. was knowledgeable and took time to explain everything. Already booked my next session.",
    time: "3 weeks ago",
  },
  {
    name: "Emma L.",
    rating: 5,
    text: "Beautiful clinic, world-class treatments. The Glutathione IV made my skin glow within days. Five stars all the way.",
    time: "1 month ago",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}
        />
      ))}
    </div>
  );
}

export default function ClinicShowcase() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Section Header */}
      <div className="text-center mb-2">
        <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">
          Visit Our Clinic
        </p>
        <h2 className="font-heading text-xl font-bold text-white">
          See It For Yourself
        </h2>
      </div>

      {/* Hero Image */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <Image
          src="/clinic-hero.jpg"
          alt="Client receiving IV therapy at Harley Street Wellness clinic"
          width={640}
          height={360}
          className="w-full h-auto object-cover"
          priority={false}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <MapPin size={13} className="text-gold" />
          <span className="text-[11px] text-white/70 font-medium">
            1-5 Portpool Lane, London EC1N 7UU
          </span>
        </div>
      </div>

      {/* EBOO Video Preview */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <button
          onClick={() => setVideoOpen(true)}
          className="relative w-full group cursor-pointer"
        >
          {/* Video thumbnail — use first frame or a dark overlay */}
          <div className="aspect-[16/9] w-full bg-[#141414] flex items-center justify-center relative overflow-hidden">
            <video
              src="/eboo-therapy.mp4"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              muted
              playsInline
              preload="metadata"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 shadow-[0_0_30px_rgba(212,168,83,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Play size={28} className="text-[#0A0A0A] ml-1" fill="#0A0A0A" />
              </div>
              <span className="mt-3 text-xs font-semibold text-white/80 tracking-wide">
                Watch EBOO Therapy Experience
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <video
              src="/eboo-therapy.mp4"
              className="w-full aspect-[9/16] max-h-[80vh] object-contain bg-black"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      {/* Google Reviews */}
      <div className="space-y-3">
        {/* Google Reviews Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            {/* Google "G" icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80">Google Reviews</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold text-yellow-400">5.0</span>
                <StarRating rating={5} />
                <span className="text-[10px] text-muted/40">(200+)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Cards — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory scrollbar-hide">
          {GOOGLE_REVIEWS.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] snap-start rounded-xl border border-white/5 bg-[rgba(255,255,255,0.02)] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Avatar initial */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/80">{review.name}</p>
                    <p className="text-[9px] text-muted/40">{review.time}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-[11px] leading-relaxed text-muted/60">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
