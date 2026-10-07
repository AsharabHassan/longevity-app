"use client";

import { useState, useRef, useCallback } from "react";
import { Share2, Download, X } from "lucide-react";
import { CLINIC } from "@/lib/clinic";
import { topDrivers } from "@/lib/lifestyleAge";
import type { LifestyleAgeResult } from "@/lib/types";

export default function LongevityCard({ result }: { result: LifestyleAgeResult }) {
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { chronologicalAge, low, high } = result;
  const topDriver = topDrivers(result, 1)[0]?.name;
  const topHelper = [...result.factors].sort((a, b) => a.years - b.years)[0];

  const shareText = `My biological age estimate is ${low}–${high} (I'm ${chronologicalAge}). It's an estimate from a 3-minute lifestyle questionnaire, based on published research. What's yours?`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My biological age estimate", text: shareText, url: window.location.origin + "/quiz" });
        return;
      } catch {
        // cancelled or unsupported — fall through to the card
      }
    }
    setShowCard(true);
  }, [shareText]);

  const handleDownloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0A0A0A", scale: 2 });
      const link = document.createElement("a");
      link.download = "my-biological-age-estimate.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card image:", err);
    }
  }, []);

  return (
    <>
      <button
        onClick={handleShare}
        className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-transparent px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-white transition-all hover:border-gold/30 hover:bg-[rgba(212,168,83,0.06)] active:scale-[0.98]"
      >
        <Share2 size={16} strokeWidth={2} />
        Share My Estimate
      </button>

      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative mx-4 w-full max-w-sm">
            <button onClick={() => setShowCard(false)} className="absolute -top-10 right-0 text-white/60 hover:text-white" aria-label="Close">
              <X size={24} />
            </button>

            <div ref={cardRef} className="overflow-hidden rounded-2xl border border-gold/20 bg-bg p-6" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
              <div className="flex h-full flex-col items-center justify-between py-4 text-center">
                <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">My biological age estimate</p>

                <div className="flex flex-col items-center gap-5">
                  <span className="font-heading text-6xl font-bold gold-text tabular-nums">{low}–{high}</span>
                  <p className="text-sm text-muted">
                    Calendar age <span className="font-semibold text-white">{chronologicalAge}</span>
                  </p>
                  {topDriver && (
                    <div>
                      <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">Biggest driver</span>
                      <p className="font-heading text-base font-bold text-white mt-0.5">{topDriver}</p>
                    </div>
                  )}
                  {topHelper && topHelper.years < 0 && (
                    <div>
                      <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">Working in my favour</span>
                      <p className="font-heading text-base font-bold text-white mt-0.5">{topHelper.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[9px] text-muted/50">An estimate from a questionnaire, not a lab test</p>
                  <p className="mt-1 text-[10px] text-muted/70">{CLINIC.brand}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleDownloadCard} className="gold-gradient flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-heading text-sm font-bold text-bg">
                <Download size={16} />
                Save Image
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(`${shareText}\n${window.location.origin}/quiz`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold/30 px-4 py-3 font-heading text-sm font-bold text-gold"
              >
                <Share2 size={16} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
