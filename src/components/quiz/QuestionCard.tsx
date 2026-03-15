"use client";

import { Question, QuestionOption } from "@/lib/types";
import {
  Zap,
  Brain,
  Clock,
  Shield,
  Droplets,
  Sparkles,
  Activity,
  Target,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Cloud,
  Thermometer,
  EyeOff,
  CircleDot,
  Bone,
  Frown,
  Scale,
  CheckCircle,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  brain: Brain,
  clock: Clock,
  shield: Shield,
  droplets: Droplets,
  sparkles: Sparkles,
  activity: Activity,
  target: Target,
  battery: Battery,
  "battery-low": BatteryLow,
  "battery-medium": BatteryMedium,
  "battery-full": BatteryFull,
  cloud: Cloud,
  thermometer: Thermometer,
  "eye-off": EyeOff,
  "circle-dot": CircleDot,
  bone: Bone,
  frown: Frown,
  scale: Scale,
  "check-circle": CheckCircle,
};

function getIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}

interface QuestionCardProps {
  question: Question;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number, score: number) => void;
}

export default function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [question.id]);

  return (
    <div className={`w-full transition-opacity duration-400 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <h2 className="font-heading text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
        {question.text}
      </h2>
      {question.subtext && (
        <p className="text-muted text-sm mb-6">{question.subtext}</p>
      )}
      {!question.subtext && <div className="mb-6" />}

      {question.type === "numeric" && (
        <NumericInput
          value={typeof value === "number" ? value : null}
          min={question.min ?? 0}
          max={question.max ?? 100}
          onChange={onChange}
        />
      )}
      {question.type === "single" && (
        <SingleSelect
          options={question.options ?? []}
          value={typeof value === "string" ? value : null}
          onChange={onChange}
        />
      )}
      {question.type === "multi" && (
        <MultiSelect
          options={question.options ?? []}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      )}
      {question.type === "scale" && (
        <ScaleInput
          options={question.options ?? []}
          value={typeof value === "string" ? value : null}
          onChange={onChange}
        />
      )}
      {question.type === "image-cards" && (
        <ImageCards
          options={question.options ?? []}
          value={typeof value === "string" ? value : null}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ── Numeric Input ────────────────────────────────── */
function NumericInput({
  value,
  min,
  max,
  onChange,
}: {
  value: number | null;
  min: number;
  max: number;
  onChange: (v: number, s: number) => void;
}) {
  const current = value ?? min;

  const update = (n: number) => {
    const clamped = Math.max(min, Math.min(max, n));
    onChange(clamped, 0);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => update(current - 1)}
        className="w-12 h-12 rounded-xl border border-[#1a1a1e] bg-bg-card text-muted flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
      >
        <Minus size={20} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n)) update(n);
        }}
        className="w-24 h-14 text-center text-2xl font-heading font-bold text-white bg-bg-card border border-[#1a1a1e] rounded-xl outline-none focus:border-gold transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => update(current + 1)}
        className="w-12 h-12 rounded-xl border border-[#1a1a1e] bg-bg-card text-muted flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

/* ── Single Select ────────────────────────────────── */
function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: QuestionOption[];
  value: string | null;
  onChange: (v: string, s: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = value === opt.label;
        const Icon = getIcon(opt.icon);
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.label, opt.score)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
              selected
                ? "border-gold bg-[rgba(212,168,83,0.08)] text-gold"
                : "border-[#1a1a1e] bg-bg-card text-white hover:border-[#2a2a2e]"
            }`}
          >
            {Icon && (
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  selected ? "bg-[rgba(212,168,83,0.15)]" : "bg-bg-hover"
                }`}
              >
                <Icon size={18} className={selected ? "text-gold" : "text-muted"} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-muted mt-0.5">{opt.description}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Multi Select ─────────────────────────────────── */
function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: QuestionOption[];
  value: string[];
  onChange: (v: string[], s: number) => void;
}) {
  const toggle = (label: string, score: number) => {
    // "None of the above" is exclusive
    if (label === "None of the above") {
      onChange([label], score);
      return;
    }
    const without = value.filter((v) => v !== "None of the above");
    const next = without.includes(label)
      ? without.filter((v) => v !== label)
      : [...without, label];
    // Score for multi is 0 unless "None of the above" is selected
    const totalScore = next.length === 0 ? 0 : 0;
    onChange(next, totalScore);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = value.includes(opt.label);
        const Icon = getIcon(opt.icon);
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => toggle(opt.label, opt.score)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
              selected
                ? "border-gold bg-[rgba(212,168,83,0.08)] text-gold"
                : "border-[#1a1a1e] bg-bg-card text-white hover:border-[#2a2a2e]"
            }`}
          >
            {Icon && (
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  selected ? "bg-[rgba(212,168,83,0.15)]" : "bg-bg-hover"
                }`}
              >
                <Icon size={18} className={selected ? "text-gold" : "text-muted"} />
              </div>
            )}
            <span className="text-sm font-medium flex-1">{opt.label}</span>
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                selected
                  ? "bg-gold border-gold"
                  : "border-[#1a1a1e] bg-transparent"
              }`}
            >
              {selected && <Check size={14} className="text-bg" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Scale Input ──────────────────────────────────── */
function ScaleInput({
  options,
  value,
  onChange,
}: {
  options: QuestionOption[];
  value: string | null;
  onChange: (v: string, s: number) => void;
}) {
  const selectedIdx = options.findIndex((o) => o.label === value);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-3">
        {options.map((opt, idx) => {
          const selected = idx === selectedIdx;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label, opt.score)}
              className={`flex-1 h-12 rounded-xl border text-sm font-heading font-semibold transition-all duration-200 ${
                selected
                  ? "border-gold bg-[rgba(212,168,83,0.12)] text-gold gold-glow"
                  : idx <= selectedIdx && selectedIdx >= 0
                  ? "border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.04)] text-gold-dark"
                  : "border-[#1a1a1e] bg-bg-card text-muted hover:border-[#2a2a2e]"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted">{options[0]?.label}</span>
        <span className="text-xs text-muted">{options[options.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/* ── Image Cards ──────────────────────────────────── */
function ImageCards({
  options,
  value,
  onChange,
}: {
  options: QuestionOption[];
  value: string | null;
  onChange: (v: string, s: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map((opt) => {
        const selected = value === opt.label;
        const Icon = getIcon(opt.icon);
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.label, opt.score)}
            className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-200 ${
              selected
                ? "border-gold bg-[rgba(212,168,83,0.08)] gold-glow"
                : "border-[#1a1a1e] bg-bg-card hover:border-[#2a2a2e]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${
                selected ? "bg-[rgba(212,168,83,0.15)]" : "bg-bg-hover"
              }`}
            >
              {Icon && (
                <Icon size={22} className={selected ? "text-gold" : "text-muted"} />
              )}
            </div>
            <span
              className={`text-sm font-medium leading-tight ${
                selected ? "text-gold" : "text-white"
              }`}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span className="text-[11px] text-muted mt-1 leading-snug">
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
