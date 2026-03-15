"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="font-heading text-xs tracking-widest text-muted uppercase">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="font-heading text-xs tracking-widest text-muted">
          {percentage}%
        </span>
      </div>
      <div className="relative w-full h-[3px] bg-bg-hover rounded-full overflow-visible">
        <div
          className="absolute top-0 left-0 h-full gold-gradient rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-gold-light"
            style={{
              boxShadow:
                "0 0 8px rgba(245, 200, 66, 0.6), 0 0 16px rgba(212, 168, 83, 0.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
