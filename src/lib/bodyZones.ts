import type { Question } from "./types";

export interface BodyZone {
  id: string;
  name: string;
  subtitle: string;
  /** Hotspot position on the body silhouette (percentage-based) */
  position: { x: number; y: number };
  /** Questions associated with this zone */
  questionIds: string[];
  /** Micro-reveal shown after completing this zone */
  microReveal: string;
  /** Color accent for the zone */
  color: string;
}

export const BODY_ZONES: BodyZone[] = [
  {
    id: "brain",
    name: "Brain & Mind",
    subtitle: "Cognitive function & stress response",
    position: { x: 50, y: 8 },
    questionIds: ["q9", "q14"],
    microReveal:
      "Your brain consumes 20% of your body's energy but only weighs 2%. Chronic stress elevates cortisol, which shrinks the hippocampus — the brain region critical for memory and learning. This damage begins years before symptoms appear.",
    color: "#8B5CF6",
  },
  {
    id: "sleep",
    name: "Sleep & Recovery",
    subtitle: "Regeneration & cellular repair cycles",
    position: { x: 25, y: 14 },
    questionIds: ["q5", "q6"],
    microReveal:
      "During deep sleep, your glymphatic system flushes neurotoxins at 10x the daytime rate. Below 7 hours, beta-amyloid plaques — the same proteins linked to Alzheimer's — start accumulating. Your cells literally can't clean house.",
    color: "#6366F1",
  },
  {
    id: "energy",
    name: "Energy & Vitality",
    subtitle: "Mitochondrial output & NAD+ levels",
    position: { x: 50, y: 32 },
    questionIds: ["q4"],
    microReveal:
      "Your mitochondria produce 90% of your body's energy. By age 40, mitochondrial efficiency drops 50% from its peak. This isn't just fatigue — it's reduced capacity for DNA repair, immune function, and cellular regeneration.",
    color: "#F59E0B",
  },
  {
    id: "immunity",
    name: "Immunity & Defence",
    subtitle: "Immune surveillance & inflammation",
    position: { x: 50, y: 48 },
    questionIds: ["q10", "q15"],
    microReveal:
      "Your immune system produces 100 billion new cells daily. Chronic inflammation — often invisible — redirects this machinery from defence to damage. We call it 'inflammaging': the single biggest driver of biological age acceleration.",
    color: "#10B981",
  },
  {
    id: "physical",
    name: "Physical Performance",
    subtitle: "Muscle integrity & metabolic rate",
    position: { x: 50, y: 68 },
    questionIds: ["q7", "q8"],
    microReveal:
      "After 30, you lose 3-5% of muscle mass per decade — a process called sarcopenia. But here's the critical part: muscle is your largest metabolic organ. Less muscle means less calorie burn, less insulin sensitivity, and faster cellular aging.",
    color: "#EF4444",
  },
  {
    id: "skin",
    name: "Skin & Cellular",
    subtitle: "Collagen synthesis & oxidative damage",
    position: { x: 75, y: 14 },
    questionIds: ["q13"],
    microReveal:
      "Your skin loses 1% of its collagen every year after age 20. But visible aging is just the surface — it reflects deeper oxidative stress damaging your DNA. NAD+ directly fuels the sirtuins (SIRT1-7) that repair this damage.",
    color: "#EC4899",
  },
];

/** Demographics questions shown on the intro screen */
export const INTRO_QUESTIONS: Question[] = [
  {
    id: "q1",
    phase: 1,
    text: "How old are you?",
    type: "numeric",
    min: 18,
    max: 100,
  },
  {
    id: "q2",
    phase: 1,
    text: "Your gender",
    type: "single",
    options: [
      { label: "Male", score: 0 },
      { label: "Female", score: 0 },
      { label: "Prefer not to say", score: 0 },
    ],
  },
  {
    id: "q3",
    phase: 1,
    text: "Your #1 health priority",
    subtext: "What matters most right now?",
    type: "image-cards",
    options: [
      { label: "More Energy", description: "Fight fatigue", score: 0, icon: "zap" },
      { label: "Brain Power", description: "Sharper focus", score: 0, icon: "brain" },
      { label: "Anti-aging", description: "Reverse the clock", score: 0, icon: "clock" },
      { label: "Immunity", description: "Stop getting sick", score: 0, icon: "shield" },
      { label: "Detox", description: "Remove toxins", score: 0, icon: "droplets" },
      { label: "Better Skin", description: "Glow from within", score: 0, icon: "sparkles" },
      { label: "Recovery", description: "Perform better", score: 0, icon: "activity" },
      { label: "Optimize All", description: "Upgrade everything", score: 0, icon: "target" },
    ],
  },
];
