"use client";

import { useState, useRef, useCallback } from "react";
import { Share2, Download, X, Dna } from "lucide-react";

interface LongevityCardProps {
  chronologicalAge: number;
  biologicalAge: number;
  topTimeThief: string;
  wellnessScore: number;
}

export default function LongevityCard({
  chronologicalAge,
  biologicalAge,
  topTimeThief,
  wellnessScore,
}: LongevityCardProps) {
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const gap = biologicalAge - chronologicalAge;

  const handleShare = useCallback(async () => {
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Longevity Gap",
          text: `I just discovered my Longevity Gap: my body thinks I'm ${biologicalAge} (I'm actually ${chronologicalAge}). That's a ${gap}-year gap. What's yours?`,
          url: window.location.origin + "/quiz",
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to card display
      }
    }
    setShowCard(true);
  }, [biologicalAge, chronologicalAge, gap]);

  const handleDownloadCard = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0A0A0A",
        scale: 2,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "my-longevity-gap.png";
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to generate card image:", err);
    }
  }, []);

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-transparent px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-white transition-all hover:border-gold/30 hover:bg-[rgba(212,168,83,0.06)] active:scale-[0.98]"
      >
        <Share2 size={16} strokeWidth={2} />
        Share My Longevity Card
      </button>

      {/* Card Modal */}
      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative mx-4 w-full max-w-sm">
            {/* Close */}
            <button
              onClick={() => setShowCard(false)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Card */}
            <div
              ref={cardRef}
              className="overflow-hidden rounded-2xl border border-gold/20 bg-bg p-6"
              style={{ aspectRatio: "9/16", maxHeight: "70vh" }}
            >
              <div className="flex h-full flex-col items-center justify-between py-4">
                {/* Top */}
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[3px] text-gold uppercase">
                    <Dna size={12} strokeWidth={1.5} className="text-gold" />
                    My Longevity Gap
                  </p>
                </div>

                {/* Center Stats */}
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
                        Real Age
                      </span>
                      <span className="font-heading text-4xl font-bold text-white">
                        {chronologicalAge}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
                        Body Age
                      </span>
                      <span className="font-heading text-4xl font-bold text-danger">
                        {biologicalAge}
                      </span>
                    </div>
                  </div>

                  {/* Gap */}
                  <div className="rounded-xl border border-danger/20 bg-[rgba(220,53,69,0.08)] px-6 py-3 text-center">
                    <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
                      Gap
                    </span>
                    <p className="font-heading text-3xl font-bold text-danger">
                      -{gap} years
                    </p>
                  </div>

                  {/* Top Time Thief */}
                  <div className="text-center">
                    <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
                      Top Time Thief
                    </span>
                    <p className="font-heading text-base font-bold text-gold mt-0.5">
                      {topTimeThief}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <span className="text-[9px] font-semibold tracking-[2px] text-muted uppercase">
                      Wellness Score
                    </span>
                    <p className="font-heading text-2xl font-bold gold-text mt-0.5">
                      {wellnessScore}/100
                    </p>
                  </div>
                </div>

                {/* Bottom */}
                <div className="text-center">
                  <p className="text-[10px] text-muted/60">
                    harleystreetmedicalwellness.co.uk/scan
                  </p>
                </div>
              </div>
            </div>

            {/* Actions below card */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownloadCard}
                className="gold-gradient flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-heading text-sm font-bold text-bg"
              >
                <Download size={16} />
                Save Image
              </button>
              <button
                onClick={() => {
                  const text = `I just discovered my Longevity Gap: my body thinks I'm ${biologicalAge} (I'm actually ${chronologicalAge}). That's a ${gap}-year gap. What's yours?`;
                  navigator.clipboard.writeText(
                    text + "\n" + window.location.origin + "/quiz"
                  );
                }}
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
