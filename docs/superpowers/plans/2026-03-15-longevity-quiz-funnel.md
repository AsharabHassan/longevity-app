# Longevity Quiz Funnel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered longevity quiz funnel that captures leads via Facebook Ads and delivers personalized wellness reports.

**Architecture:** Next.js 14 App Router on Vercel. Client-side quiz state machine with API routes for Claude calls. GoHighLevel webhook for CRM. Facebook Pixel for tracking.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Anthropic SDK, html2pdf.js, React

**Spec:** `docs/superpowers/specs/2026-03-15-longevity-quiz-funnel-design.md`

---

## File Structure

```
src/
  app/
    layout.tsx                    # Root layout, fonts, metadata, FB Pixel
    page.tsx                      # Landing page
    quiz/page.tsx                 # Quiz page (client component)
    report/page.tsx               # Report results page
    api/
      quiz/insight/route.ts       # Claude micro-insight endpoint
      quiz/adaptive/route.ts      # Claude adaptive question selection
      report/generate/route.ts    # Claude report generation
      chat/route.ts               # Claude chatbot endpoint
      webhook/route.ts            # GoHighLevel webhook
  components/
    landing/Hero.tsx
    landing/Features.tsx
    landing/TrustBar.tsx
    quiz/QuizEngine.tsx           # Main quiz state machine
    quiz/QuestionCard.tsx         # Renders individual questions
    quiz/ProgressBar.tsx
    quiz/MicroInsight.tsx
    quiz/LeadCaptureForm.tsx
    report/ScoreHero.tsx          # Score ring + bio age
    report/DimensionBars.tsx
    report/TreatmentPlan.tsx
    report/ReportActions.tsx      # PDF + booking CTAs
    chatbot/ChatWidget.tsx
    chatbot/ChatMessage.tsx
  lib/
    questions.ts                  # All fixed questions + adaptive bank
    scoring.ts                    # Wellness score engine
    treatments.ts                 # Treatment data + mapping
    claude.ts                     # Claude API wrapper
    pixel.ts                      # Facebook Pixel helpers
    types.ts                      # TypeScript types
public/
  llms.txt
tailwind.config.ts
next.config.js
package.json
```

---

## Chunk 1: Project Setup + Data Layer

### Task 1: Initialize Next.js Project

**Files:** Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js app**

Run: `cd "C:/Longevity App idea" && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

- [ ] **Step 2: Install dependencies**

Run: `npm install @anthropic-ai/sdk html2pdf.js lucide-react`

- [ ] **Step 3: Configure Tailwind with design system colors**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0A0A0A", card: "#141414", hover: "#1a1a1e" },
        gold: { DEFAULT: "#D4A853", light: "#F5C842", dark: "#C4942A" },
        danger: "#DC3545",
        muted: "#A0A0A0",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Set up root layout with fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Discover Your Biological Age | Harley Street Medical Wellness",
  description: "AI-powered longevity assessment. Get your wellness score, biological age, and personalized treatment plan in 3 minutes.",
  openGraph: {
    title: "Discover Your Biological Age | Harley Street Medical Wellness",
    description: "AI-powered longevity assessment with personalized treatment recommendations.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-bg text-white font-body antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Set up global CSS**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-bg text-white; }
}

@layer components {
  .gold-gradient { @apply bg-gradient-to-r from-gold-dark via-gold to-gold-light; }
  .gold-text { @apply bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent; }
  .gold-border { @apply border border-gold/20; }
  .gold-glow { box-shadow: 0 0 20px rgba(212, 168, 83, 0.15); }
  .card-dark { @apply bg-bg-card border border-white/5 rounded-2xl; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-gold {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes count-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: initialize Next.js project with design system"
```

---

### Task 2: TypeScript Types

**Files:** Create: `src/lib/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/lib/types.ts

export type QuestionType = "numeric" | "single" | "multi" | "scale" | "image-cards";

export interface QuestionOption {
  label: string;
  description?: string;
  score: number;
  icon?: string;
}

export interface Question {
  id: string;
  phase: 1 | 2 | 3 | 4;
  text: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  isAdaptive?: boolean;
}

export interface AdaptiveBankEntry {
  triggers: string[];
  questions: Question[];
  dimension: string;
}

export interface QuizAnswer {
  questionId: string;
  value: string | string[] | number;
  score: number;
}

export interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  label: "Optimal" | "Strong" | "Average" | "Below Average" | "Needs Attention";
  icon: string;
}

export interface WellnessResult {
  wellnessScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  ageOffset: number;
  dimensions: DimensionScore[];
  scoreLabel: string;
}

export interface Treatment {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  tags: string[];
  icon: string;
}

export interface TreatmentRecommendation {
  primary: Treatment;
  supporting: Treatment[];
  reasoning: string;
}

export interface ReportData {
  verdict: string;
  dimensionNarratives: Record<string, string>;
  riskFactors: { title: string; explanation: string }[];
  treatmentPlan: {
    primary: { name: string; reasoning: string };
    supporting: { name: string; reasoning: string }[];
    timeline: string;
  };
}

export interface LeadData {
  firstName: string;
  email: string;
  phone: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts && git commit -m "feat: add TypeScript types"
```

---

### Task 3: Questions Data

**Files:** Create: `src/lib/questions.ts`

- [ ] **Step 1: Create questions file with all 16 fixed questions + adaptive bank**

```typescript
// src/lib/questions.ts
import { Question, AdaptiveBankEntry } from "./types";

export const FIXED_QUESTIONS: Question[] = [
  // Phase 1: Warm-up
  {
    id: "q1", phase: 1, text: "What is your age?", type: "numeric", min: 18, max: 100,
  },
  {
    id: "q2", phase: 1, text: "What is your gender?", type: "single",
    options: [
      { label: "Male", score: 0 },
      { label: "Female", score: 0 },
      { label: "Prefer not to say", score: 0 },
    ],
  },
  {
    id: "q3", phase: 1, text: "What is your #1 health goal right now?",
    subtext: "Select the one that matters most to you", type: "image-cards",
    options: [
      { label: "More Energy", description: "Fight fatigue and feel alive", score: 0, icon: "zap" },
      { label: "Cognitive Performance", description: "Sharper focus and clarity", score: 0, icon: "brain" },
      { label: "Anti-aging", description: "Turn back the biological clock", score: 0, icon: "clock" },
      { label: "Stronger Immunity", description: "Stop getting sick", score: 0, icon: "shield" },
      { label: "Detox & Cleanse", description: "Remove toxins, feel clean", score: 0, icon: "droplets" },
      { label: "Better Skin", description: "Glow from the inside out", score: 0, icon: "sparkles" },
      { label: "Athletic Recovery", description: "Recover faster, perform better", score: 0, icon: "activity" },
      { label: "Overall Optimization", description: "Upgrade everything", score: 0, icon: "target" },
    ],
  },
  // Phase 2: Lifestyle
  {
    id: "q4", phase: 2, text: "How would you rate your energy levels?",
    subtext: "Think about a typical day", type: "scale",
    options: [
      { label: "Chronically Fatigued", score: 0, icon: "battery" },
      { label: "Low Energy", score: 1, icon: "battery-low" },
      { label: "Moderate", score: 2, icon: "battery-medium" },
      { label: "Good with Dips", score: 3, icon: "battery-medium" },
      { label: "High & Stable", score: 4, icon: "battery-full" },
    ],
  },
  {
    id: "q5", phase: 2, text: "How many hours of sleep do you typically get?", type: "single",
    options: [
      { label: "Under 5 hours", score: 0 },
      { label: "5-6 hours", score: 1 },
      { label: "6-7 hours", score: 2 },
      { label: "7-8 hours", score: 4 },
      { label: "Over 8 hours", score: 3 },
    ],
  },
  {
    id: "q6", phase: 2, text: "How would you rate your sleep quality?", type: "single",
    options: [
      { label: "Poor — I wake frequently", score: 0 },
      { label: "Fair — restless nights", score: 1 },
      { label: "Good — occasional disruptions", score: 3 },
      { label: "Excellent — I wake refreshed", score: 4 },
    ],
  },
  {
    id: "q7", phase: 2, text: "How many days per week do you exercise for 30+ minutes?", type: "single",
    options: [
      { label: "0 days", score: 0 },
      { label: "1-2 days", score: 1 },
      { label: "3-4 days", score: 3 },
      { label: "5-6 days", score: 4 },
      { label: "Daily", score: 4 },
    ],
  },
  {
    id: "q8", phase: 2, text: "How would you describe your diet?", type: "single",
    options: [
      { label: "Mostly processed / fast food", description: "Convenience-driven eating", score: 0 },
      { label: "Mixed — some healthy, some not", description: "Inconsistent nutrition", score: 1 },
      { label: "Generally healthy", description: "Whole foods with occasional treats", score: 3 },
      { label: "Very clean / optimized", description: "Nutrient-dense, intentional eating", score: 4 },
    ],
  },
  {
    id: "q9", phase: 2, text: "How would you rate your daily stress level?",
    subtext: "Consider work, relationships, and life overall", type: "scale",
    options: [
      { label: "Very High", score: 0 },
      { label: "High", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Low", score: 3 },
      { label: "Minimal", score: 4 },
    ],
  },
  // Phase 3: Symptom Deep Dive
  {
    id: "q10", phase: 3, text: "Which of these do you experience regularly?",
    subtext: "Select all that apply", type: "multi",
    options: [
      { label: "Brain fog", score: 0, icon: "cloud" },
      { label: "Chronic fatigue", score: 0, icon: "battery-low" },
      { label: "Frequent colds/illness", score: 0, icon: "thermometer" },
      { label: "Skin dullness", score: 0, icon: "eye-off" },
      { label: "Slow recovery", score: 0, icon: "clock" },
      { label: "Digestive issues", score: 0, icon: "circle-dot" },
      { label: "Joint pain", score: 0, icon: "bone" },
      { label: "Mood swings", score: 0, icon: "frown" },
      { label: "Weight struggles", score: 0, icon: "scale" },
      { label: "None of the above", score: 4, icon: "check-circle" },
    ],
  },
  // Q11, Q12 are adaptive — handled by adaptive bank
  {
    id: "q13", phase: 3, text: "Have you noticed changes in your skin quality in the past year?", type: "single",
    options: [
      { label: "Yes, significantly worse", score: 0 },
      { label: "Slightly worse", score: 1 },
      { label: "No change", score: 3 },
      { label: "Improved", score: 4 },
    ],
  },
  {
    id: "q14", phase: 3, text: "How often do you experience energy crashes during the day?", type: "single",
    options: [
      { label: "Constantly", score: 0 },
      { label: "Frequently (most days)", score: 1 },
      { label: "Occasionally (1-2x/week)", score: 3 },
      { label: "Never", score: 4 },
    ],
  },
  // Phase 4: Readiness
  {
    id: "q15", phase: 4, text: "Have you tried IV therapy or wellness treatments before?", type: "single",
    options: [
      { label: "Never", score: 1 },
      { label: "Once or twice", score: 2 },
      { label: "Regular", score: 4 },
    ],
  },
  {
    id: "q16", phase: 4, text: "Which location is more convenient for you?", type: "single",
    options: [
      { label: "London (Harley Street)", score: 0 },
      { label: "Glasgow", score: 0 },
    ],
  },
];

export const ADAPTIVE_BANK: AdaptiveBankEntry[] = [
  {
    triggers: ["Brain fog", "Chronic fatigue"],
    dimension: "cognitive",
    questions: [
      {
        id: "q11-cognitive-clarity", phase: 3, text: "How would you describe your mental clarity throughout the day?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Sharp all day", score: 4 },
          { label: "Clear mornings, foggy afternoons", score: 2 },
          { label: "Foggy most of the day", score: 1 },
          { label: "Persistently cloudy, can't focus", score: 0 },
        ],
      },
      {
        id: "q11-cognitive-duration", phase: 3, text: "How long have you been experiencing cognitive difficulties?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Just recently, less than a month", score: 3 },
          { label: "A few months", score: 2 },
          { label: "6-12 months", score: 1 },
          { label: "Over a year", score: 0 },
        ],
      },
    ],
  },
  {
    triggers: ["Frequent colds/illness", "Slow recovery"],
    dimension: "immune",
    questions: [
      {
        id: "q11-immune-frequency", phase: 3, text: "How many times have you been ill in the past 12 months?",
        type: "single", isAdaptive: true,
        options: [
          { label: "0-1 times", score: 4 },
          { label: "2-3 times", score: 2 },
          { label: "4-5 times", score: 1 },
          { label: "6+ times", score: 0 },
        ],
      },
      {
        id: "q11-immune-recovery", phase: 3, text: "How long does it typically take you to recover from a cold or flu?",
        type: "single", isAdaptive: true,
        options: [
          { label: "A few days", score: 4 },
          { label: "About a week", score: 2 },
          { label: "1-2 weeks", score: 1 },
          { label: "More than 2 weeks", score: 0 },
        ],
      },
    ],
  },
  {
    triggers: ["Joint pain", "Digestive issues"],
    dimension: "energy",
    questions: [
      {
        id: "q11-inflam-severity", phase: 3, text: "How would you rate your inflammatory symptoms?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Rare/mild", score: 4 },
          { label: "Occasional flare-ups", score: 2 },
          { label: "Frequent, affects daily life", score: 1 },
          { label: "Chronic and severe", score: 0 },
        ],
      },
      {
        id: "q11-toxin-exposure", phase: 3, text: "Have you been exposed to environmental toxins (mold, chemicals, heavy metals)?",
        type: "single", isAdaptive: true,
        options: [
          { label: "No known exposure", score: 4 },
          { label: "Possible minor exposure", score: 2 },
          { label: "Known moderate exposure", score: 1 },
          { label: "Significant ongoing exposure", score: 0 },
        ],
      },
    ],
  },
  {
    triggers: ["Mood swings", "Weight struggles"],
    dimension: "metabolic",
    questions: [
      {
        id: "q11-metabolic-meals", phase: 3, text: "How stable is your energy after meals?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Stable, no crashes", score: 4 },
          { label: "Minor dip sometimes", score: 2 },
          { label: "Regular post-meal crashes", score: 1 },
          { label: "Severe crashes, need to nap", score: 0 },
        ],
      },
      {
        id: "q11-stress-recovery", phase: 3, text: "How would you describe your stress recovery?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Bounce back quickly", score: 4 },
          { label: "Takes a day or two", score: 2 },
          { label: "Takes a week+", score: 1 },
          { label: "Feel permanently stressed", score: 0 },
        ],
      },
    ],
  },
  {
    triggers: ["Skin dullness"],
    dimension: "skin",
    questions: [
      {
        id: "q11-skin-response", phase: 3, text: "How would you describe your skin's response to skincare products?",
        type: "single", isAdaptive: true,
        options: [
          { label: "Responds well", score: 4 },
          { label: "Some improvement", score: 2 },
          { label: "Minimal response", score: 1 },
          { label: "No improvement despite trying", score: 0 },
        ],
      },
    ],
  },
];

export const FALLBACK_ADAPTIVE: Question[] = [
  {
    id: "q11-fallback-vitality", phase: 3, text: "How would you rate your overall vitality compared to 5 years ago?",
    type: "single", isAdaptive: true,
    options: [
      { label: "Better than ever", score: 4 },
      { label: "About the same", score: 3 },
      { label: "Noticeably declined", score: 1 },
      { label: "Significantly worse", score: 0 },
    ],
  },
  {
    id: "q11-fallback-approach", phase: 3, text: "What best describes your current approach to health optimization?",
    type: "single", isAdaptive: true,
    options: [
      { label: "Active biohacker", score: 4 },
      { label: "Regular supplements + exercise", score: 3 },
      { label: "Trying to improve", score: 2 },
      { label: "Haven't started yet", score: 1 },
    ],
  },
];

// Micro-insight trigger points: after Q3, Q6, Q9, Q12
export const INSIGHT_TRIGGERS = ["q3", "q6", "q9", "q12"] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/questions.ts && git commit -m "feat: add quiz questions and adaptive bank data"
```

---

### Task 4: Scoring Engine

**Files:** Create: `src/lib/scoring.ts`

- [ ] **Step 1: Write scoring engine tests**

Create `src/lib/__tests__/scoring.test.ts`:

```typescript
import { calculateDimensionScores, calculateWellnessScore, calculateBiologicalAge, getScoreLabel } from "../scoring";
import { QuizAnswer } from "../types";

describe("scoring engine", () => {
  const mockAnswers: QuizAnswer[] = [
    { questionId: "q4", value: "Low Energy", score: 1 },
    { questionId: "q14", value: "Frequently (most days)", score: 1 },
    { questionId: "q5", value: "5-6 hours", score: 1 },
    { questionId: "q6", value: "Poor — I wake frequently", score: 0 },
    { questionId: "q7", value: "3-4 days", score: 3 },
    { questionId: "q8", value: "Generally healthy", score: 3 },
    { questionId: "q9", value: "High", score: 1 },
    { questionId: "q13", value: "Slightly worse", score: 1 },
    { questionId: "q3", value: "More Energy", score: 0 },
    { questionId: "q15", value: "Never", score: 1 },
    { questionId: "q10", value: ["Brain fog", "Chronic fatigue"], score: 0 },
    { questionId: "q11-cognitive-clarity", value: "Foggy most of the day", score: 1 },
    { questionId: "q11-cognitive-duration", value: "6-12 months", score: 1 },
  ];

  test("calculates dimension scores", () => {
    const dims = calculateDimensionScores(mockAnswers);
    expect(dims.length).toBe(9);
    dims.forEach(d => {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    });
  });

  test("calculates wellness score 0-100", () => {
    const dims = calculateDimensionScores(mockAnswers);
    const score = calculateWellnessScore(dims);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test("biological age uses continuous formula", () => {
    expect(calculateBiologicalAge(40, 90)).toBe(34); // 40 + round((70-90)*0.3) = 40-6 = 34
    expect(calculateBiologicalAge(40, 50)).toBe(46); // 40 + round((70-50)*0.3) = 40+6 = 46
  });

  test("biological age capped at ±15", () => {
    expect(calculateBiologicalAge(40, 100)).toBe(31); // would be 40-9, = 31
    expect(calculateBiologicalAge(40, 10)).toBe(55); // capped at +15
  });

  test("score labels", () => {
    expect(getScoreLabel(95)).toBe("Optimal");
    expect(getScoreLabel(85)).toBe("Strong");
    expect(getScoreLabel(75)).toBe("Average");
    expect(getScoreLabel(65)).toBe("Below Average");
    expect(getScoreLabel(55)).toBe("Needs Attention");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/scoring.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement scoring engine**

```typescript
// src/lib/scoring.ts
import { QuizAnswer, DimensionScore } from "./types";

interface DimensionConfig {
  name: string;
  weight: number;
  questionIds: string[];
  icon: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { name: "Energy & Vitality", weight: 0.15, questionIds: ["q4", "q14"], icon: "zap" },
  { name: "Sleep Quality", weight: 0.15, questionIds: ["q5", "q6"], icon: "moon" },
  { name: "Cognitive Function", weight: 0.12, questionIds: ["q11-cognitive-clarity", "q11-cognitive-duration", "q11-fallback-vitality"], icon: "brain" },
  { name: "Immune Resilience", weight: 0.10, questionIds: ["q11-immune-frequency", "q11-immune-recovery"], icon: "shield" },
  { name: "Metabolic Health", weight: 0.12, questionIds: ["q8", "q14", "q11-metabolic-meals"], icon: "activity" },
  { name: "Physical Activity", weight: 0.12, questionIds: ["q7"], icon: "dumbbell" },
  { name: "Stress & Mental Wellness", weight: 0.12, questionIds: ["q9", "q11-stress-recovery"], icon: "heart" },
  { name: "Cellular & Skin Health", weight: 0.07, questionIds: ["q13", "q11-skin-response"], icon: "sparkles" },
  { name: "Readiness & Awareness", weight: 0.05, questionIds: ["q3", "q15"], icon: "target" },
];

export function calculateDimensionScores(answers: QuizAnswer[]): DimensionScore[] {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));

  return DIMENSIONS.map(dim => {
    const relevantAnswers = dim.questionIds
      .map(id => answerMap.get(id))
      .filter((a): a is QuizAnswer => a !== undefined);

    let score: number;
    if (relevantAnswers.length === 0) {
      score = 50; // neutral default
    } else {
      const avg = relevantAnswers.reduce((sum, a) => sum + a.score, 0) / relevantAnswers.length;
      score = Math.round((avg / 4) * 100);
    }

    return {
      name: dim.name,
      score,
      weight: dim.weight,
      label: getScoreLabel(score),
      icon: dim.icon,
    };
  });
}

export function calculateWellnessScore(dimensions: DimensionScore[]): number {
  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  return Math.round(weighted);
}

export function calculateBiologicalAge(chronologicalAge: number, wellnessScore: number): number {
  const offset = Math.round((70 - wellnessScore) * 0.3);
  const capped = Math.max(-15, Math.min(15, offset));
  return chronologicalAge + capped;
}

export function getScoreLabel(score: number): DimensionScore["label"] {
  if (score >= 90) return "Optimal";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Average";
  if (score >= 60) return "Below Average";
  return "Needs Attention";
}
```

- [ ] **Step 4: Run tests**

Run: `npx jest src/lib/__tests__/scoring.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts src/lib/__tests__/scoring.test.ts && git commit -m "feat: add wellness scoring engine with tests"
```

---

### Task 5: Treatment Data + Mapping

**Files:** Create: `src/lib/treatments.ts`

- [ ] **Step 1: Create treatment data and mapping logic**

```typescript
// src/lib/treatments.ts
import { Treatment, TreatmentRecommendation, DimensionScore } from "./types";

export const TREATMENTS: Treatment[] = [
  {
    name: "NAD+ IV Drip", price: 295, originalPrice: 349,
    description: "Replenishes cellular energy, supports DNA repair and anti-aging at the molecular level.",
    tags: ["Energy", "Sleep", "Anti-aging"], icon: "zap",
  },
  {
    name: "IV Methylene Blue", price: 395,
    description: "Targets mitochondrial dysfunction to restore cognitive clarity and mental energy.",
    tags: ["Cognitive", "Focus", "Mitochondrial"], icon: "brain",
  },
  {
    name: "Immunity IV Drip", price: 295, originalPrice: 395,
    description: "High-dose immune support to strengthen your body's natural defenses.",
    tags: ["Immunity", "Recovery", "Prevention"], icon: "shield",
  },
  {
    name: "Myers Cocktail", price: 295, originalPrice: 375,
    description: "Classic vitamin and mineral infusion for overall wellness and energy restoration.",
    tags: ["Wellness", "Vitamins", "Energy"], icon: "beaker",
  },
  {
    name: "Detox IV Drip", price: 399,
    description: "Supports liver function and toxin elimination for a complete internal reset.",
    tags: ["Detox", "Liver", "Cleanse"], icon: "droplets",
  },
  {
    name: "Skin Glow IV Drip", price: 299,
    description: "Glutathione and vitamin C infusion for radiant, youthful-looking skin.",
    tags: ["Skin", "Collagen", "Anti-aging"], icon: "sparkles",
  },
  {
    name: "EBOO Therapy", price: 1995,
    description: "Advanced ozone blood treatment for comprehensive cellular detoxification and regeneration.",
    tags: ["Advanced", "Detox", "Regeneration"], icon: "atom",
  },
  {
    name: "Phospholipid Exchange IV", price: 425,
    description: "Repairs cell membranes and supports neurological function at the cellular level.",
    tags: ["Neurological", "Cell Repair", "Advanced"], icon: "layers",
  },
  {
    name: "Metabolic Health Programme", price: 1500,
    description: "Comprehensive metabolic optimization programme for lasting health transformation.",
    tags: ["Metabolic", "Programme", "Comprehensive"], icon: "trending-up",
  },
];

export function recommendTreatments(dimensions: DimensionScore[], symptoms: string[]): TreatmentRecommendation {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const lowest = sorted.slice(0, 3);
  const lowestNames = new Set(lowest.map(d => d.name));
  const lowCount = dimensions.filter(d => d.score < 60).length;

  let primaryName: string;
  const supportingNames: string[] = [];

  // Upsell: 3+ dimensions below 60 → EBOO
  if (lowCount >= 3) {
    primaryName = "EBOO Therapy";
    supportingNames.push("NAD+ IV Drip", "Phospholipid Exchange IV");
  }
  // Detox signals
  else if (
    dimensions.find(d => d.name === "Metabolic Health")!.score < 50 &&
    symptoms.some(s => ["Digestive issues", "Joint pain"].includes(s))
  ) {
    primaryName = "Detox IV Drip";
    supportingNames.push("NAD+ IV Drip");
  }
  // Energy + Sleep low
  else if (lowestNames.has("Energy & Vitality") && lowestNames.has("Sleep Quality")) {
    primaryName = "NAD+ IV Drip";
    supportingNames.push("Myers Cocktail");
  }
  // Cognitive + Energy
  else if (lowestNames.has("Cognitive Function") && lowestNames.has("Energy & Vitality")) {
    primaryName = "IV Methylene Blue";
    supportingNames.push("NAD+ IV Drip");
  }
  // Immune + Stress
  else if (lowestNames.has("Immune Resilience") && lowestNames.has("Stress & Mental Wellness")) {
    primaryName = "Immunity IV Drip";
    supportingNames.push("Myers Cocktail");
  }
  // Metabolic
  else if (lowestNames.has("Metabolic Health")) {
    primaryName = "Metabolic Health Programme";
    supportingNames.push("NAD+ IV Drip");
  }
  // Skin
  else if (lowestNames.has("Cellular & Skin Health")) {
    primaryName = "Skin Glow IV Drip";
    supportingNames.push("NAD+ IV Drip");
  }
  // Default
  else {
    primaryName = "NAD+ IV Drip";
    supportingNames.push("Myers Cocktail");
  }

  const primary = TREATMENTS.find(t => t.name === primaryName)!;
  const supporting = supportingNames
    .map(n => TREATMENTS.find(t => t.name === n)!)
    .filter(Boolean);

  return { primary, supporting, reasoning: "" };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/treatments.ts && git commit -m "feat: add treatment data and recommendation mapping"
```

---

## Chunk 2: Claude API + Landing Page

### Task 6: Claude API Wrapper

**Files:** Create: `src/lib/claude.ts`

- [ ] **Step 1: Create Claude API helper**

```typescript
// src/lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function generateMicroInsight(
  age: number,
  answers: Record<string, string | string[] | number>,
  triggerQuestion: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `You are a longevity science expert at Harley Street Medical Wellness. Generate a single fascinating, personalized health insight based on the user's quiz answers. Keep it to 2-3 sentences. Reference a real scientific mechanism. Be specific to their age and answers. Use a warm but authoritative tone. Do NOT recommend treatments yet.`,
    messages: [{
      role: "user",
      content: `User age: ${age}. Answers so far: ${JSON.stringify(answers)}. Just answered question: ${triggerQuestion}. Generate a personalized micro-insight.`,
    }],
  });

  return (response.content[0] as { text: string }).text;
}

export async function selectAdaptiveQuestions(
  symptoms: string[],
  availableQuestionIds: string[]
): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: `You select the 2 most relevant follow-up questions for a longevity quiz based on user symptoms. Return ONLY a JSON array of exactly 2 question IDs from the available list. No explanation.`,
    messages: [{
      role: "user",
      content: `User symptoms: ${JSON.stringify(symptoms)}. Available question IDs: ${JSON.stringify(availableQuestionIds)}. Return the 2 most relevant as a JSON array.`,
    }],
  });

  const text = (response.content[0] as { text: string }).text;
  return JSON.parse(text);
}

export async function generateReport(
  answers: Record<string, string | string[] | number>,
  dimensions: Array<{ name: string; score: number }>,
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number,
  primaryTreatment: string,
  supportingTreatments: string[]
): Promise<{
  verdict: string;
  dimensionNarratives: Record<string, string>;
  riskFactors: Array<{ title: string; explanation: string }>;
  treatmentPlan: {
    primary: { name: string; reasoning: string };
    supporting: Array<{ name: string; reasoning: string }>;
    timeline: string;
  };
}> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2000,
    system: `You are a Harley Street longevity specialist writing a personalized wellness report. Write in a warm, authoritative tone — professional but accessible. Reference biological mechanisms in plain language. Every recommendation must be tied to the user's specific answers and scores. Do NOT use generic text. Return valid JSON only.`,
    messages: [{
      role: "user",
      content: `Generate a personalized longevity report as JSON.

User data:
- Age: ${answers.q1}, Gender: ${answers.q2}
- All answers: ${JSON.stringify(answers)}
- Dimension scores: ${JSON.stringify(dimensions)}
- Wellness Score: ${wellnessScore}/100
- Biological Age: ${biologicalAge} (actual: ${chronologicalAge})
- Primary treatment: ${primaryTreatment}
- Supporting treatments: ${JSON.stringify(supportingTreatments)}

Return this exact JSON structure:
{
  "verdict": "One compelling sentence about their biological age and what it means",
  "dimensionNarratives": { "Dimension Name": "2-3 sentence personalized narrative" },
  "riskFactors": [{ "title": "Risk factor name", "explanation": "Plain language explanation tied to their answers" }],
  "treatmentPlan": {
    "primary": { "name": "Treatment name", "reasoning": "Why this is right for them specifically" },
    "supporting": [{ "name": "Treatment name", "reasoning": "Why this complements the primary" }],
    "timeline": "Month 1: ... → Month 2: ... → Month 3: ..."
  }
}`,
    }],
  });

  const text = (response.content[0] as { text: string }).text;
  return JSON.parse(text);
}

export async function chatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context: {
    answers: Record<string, string | string[] | number>;
    wellnessScore: number;
    biologicalAge: number;
    treatments: string[];
  }
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 500,
    system: `You are the AI Longevity Advisor at Harley Street Medical Wellness (London & Glasgow). You have the user's complete quiz results and are helping them understand their report.

Context: Wellness Score ${context.wellnessScore}/100, Biological Age ${context.biologicalAge}, Recommended treatments: ${context.treatments.join(", ")}.
Full quiz answers: ${JSON.stringify(context.answers)}

Rules:
- Answer questions about their scores and what they mean
- Explain treatments (mechanism, duration, safety, what to expect)
- Handle pricing objections honestly and confidently
- Compare treatments for their specific situation
- Guide toward booking a free consultation naturally
- NEVER give medical diagnoses
- NEVER contradict their doctor's advice
- NEVER discuss competitors
- Keep responses concise (2-4 sentences)`,
    messages,
  });

  return (response.content[0] as { text: string }).text;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/claude.ts && git commit -m "feat: add Claude API wrapper for insights, report, and chat"
```

---

### Task 7: Facebook Pixel Helper

**Files:** Create: `src/lib/pixel.ts`

- [ ] **Step 1: Create pixel helper**

```typescript
// src/lib/pixel.ts

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
  }
}

export function trackCustomEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", event, data);
  }
}

export const PixelEvents = {
  startQuiz: () => trackCustomEvent("StartQuiz"),
  quizComplete: () => trackCustomEvent("QuizComplete"),
  lead: (value?: number) => trackEvent("Lead", value ? { value, currency: "GBP" } : undefined),
  downloadReport: () => trackCustomEvent("DownloadReport"),
  chatStarted: () => trackCustomEvent("ChatStarted"),
  bookingClick: (location: string) => trackCustomEvent("BookingClick", { location }),
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pixel.ts && git commit -m "feat: add Facebook Pixel event helpers"
```

---

### Task 8: API Routes

**Files:** Create: `src/app/api/quiz/insight/route.ts`, `src/app/api/quiz/adaptive/route.ts`, `src/app/api/report/generate/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/webhook/route.ts`

- [ ] **Step 1: Create insight API route**

```typescript
// src/app/api/quiz/insight/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateMicroInsight } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { age, answers, triggerQuestion } = await req.json();
    const insight = await generateMicroInsight(age, answers, triggerQuestion);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return NextResponse.json({ insight: null }, { status: 200 }); // graceful degradation
  }
}
```

- [ ] **Step 2: Create adaptive question API route**

```typescript
// src/app/api/quiz/adaptive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { selectAdaptiveQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { symptoms, availableQuestionIds } = await req.json();
    const selected = await selectAdaptiveQuestions(symptoms, availableQuestionIds);
    return NextResponse.json({ questionIds: selected });
  } catch (error) {
    console.error("Adaptive selection failed:", error);
    // fallback: return first 2 available
    const { availableQuestionIds } = await req.json().catch(() => ({ availableQuestionIds: [] }));
    return NextResponse.json({ questionIds: availableQuestionIds.slice(0, 2) });
  }
}
```

- [ ] **Step 3: Create report generation API route**

```typescript
// src/app/api/report/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = await generateReport(
      body.answers,
      body.dimensions,
      body.wellnessScore,
      body.biologicalAge,
      body.chronologicalAge,
      body.primaryTreatment,
      body.supportingTreatments
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create chat API route**

```typescript
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chatResponse } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    if (messages.filter((m: { role: string }) => m.role === "user").length > 20) {
      return NextResponse.json({ message: null, limitReached: true });
    }
    const reply = await chatResponse(messages, context);
    return NextResponse.json({ message: reply, limitReached: false });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({ message: "I'm having trouble connecting right now. Please try again.", limitReached: false });
  }
}
```

- [ ] **Step 5: Create webhook API route**

```typescript
// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

async function sendWebhook(payload: Record<string, unknown>, attempt = 1): Promise<boolean> {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.warn("GHL_WEBHOOK_URL not configured");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
    return true;
  } catch (error) {
    console.error(`Webhook attempt ${attempt} failed:`, error);
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return sendWebhook(payload, attempt + 1);
    }
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    // Fire and forget — don't block the response
    sendWebhook(payload).catch(err => console.error("Webhook ultimately failed:", err));
    return NextResponse.json({ queued: true });
  } catch (error) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ queued: false }, { status: 500 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/ && git commit -m "feat: add API routes for quiz, report, chat, and webhook"
```

---

## Chunk 3: Landing Page + Quiz UI

### Task 9: Landing Page

**Files:** Create: `src/app/page.tsx`, `src/components/landing/Hero.tsx`, `src/components/landing/Features.tsx`, `src/components/landing/TrustBar.tsx`

- [ ] **Step 1: Create landing page components**

Build the landing page matching the approved design mockup:
- Hero with "Discover Your Biological Age" headline, gold gradient text
- 3 feature icons (10,000+ Assessed, 94% Accuracy, 3 min)
- Gold CTA button with shimmer animation
- Trust bar at bottom
- Schema.org MedicalWebPage markup in layout

Reference: `.superpowers/brainstorm/1856-1773533824/design-mockup-v2.html` for exact styling

- [ ] **Step 2: Wire up landing page**

`src/app/page.tsx` imports Hero, Features, TrustBar. Links CTA to `/quiz`.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Check: Landing page renders correctly at http://localhost:3000

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/landing/ && git commit -m "feat: add landing page with hero, features, and trust bar"
```

---

### Task 10: Quiz Engine Core

**Files:** Create: `src/components/quiz/QuizEngine.tsx`, `src/components/quiz/ProgressBar.tsx`, `src/components/quiz/QuestionCard.tsx`, `src/components/quiz/MicroInsight.tsx`, `src/components/quiz/LeadCaptureForm.tsx`, `src/app/quiz/page.tsx`

- [ ] **Step 1: Create ProgressBar component**

Gold progress bar with glow dot, step counter, percentage.

- [ ] **Step 2: Create QuestionCard component**

Renders different question types: numeric, single, multi, scale, image-cards. Gold selected state. SVG icons from lucide-react.

- [ ] **Step 3: Create MicroInsight component**

Animated insight card with pulsing dots, citation, fade-in transition. Calls `/api/quiz/insight` and displays response.

- [ ] **Step 4: Create LeadCaptureForm component**

Name, email, phone fields with gold input icons. Trust badges. GDPR checkbox. Calls `/api/webhook` on submit.

- [ ] **Step 5: Create QuizEngine state machine**

Main component managing:
- Current question index
- Answer storage
- Adaptive question selection (calls `/api/quiz/adaptive` after Q10)
- Micro-insight display (after Q3, Q6, Q9, Q12)
- Phase transitions
- Lead capture gate after Q16
- Navigation to `/report` with data in sessionStorage

- [ ] **Step 6: Create quiz page**

`src/app/quiz/page.tsx` — client component wrapping QuizEngine.

- [ ] **Step 7: Test full quiz flow in browser**

Run: `npm run dev`
Walk through all 16 questions, verify adaptive branching, micro-insights, lead capture.

- [ ] **Step 8: Commit**

```bash
git add src/components/quiz/ src/app/quiz/ && git commit -m "feat: add quiz engine with adaptive branching and micro-insights"
```

---

## Chunk 4: Report Page + Chatbot

### Task 11: Report Page Components

**Files:** Create: `src/components/report/ScoreHero.tsx`, `src/components/report/DimensionBars.tsx`, `src/components/report/TreatmentPlan.tsx`, `src/components/report/ReportActions.tsx`, `src/app/report/page.tsx`

- [ ] **Step 1: Create ScoreHero**

SVG score ring with gold gradient, animated count-up, biological age vs chronological age boxes, AI verdict text.

- [ ] **Step 2: Create DimensionBars**

9 dimension bars with lucide icons, score values, color coding (gold/amber/red based on score).

- [ ] **Step 3: Create TreatmentPlan**

Primary treatment card (gold border) with AI-written reasoning. Supporting treatment cards. Price display with strikethrough for promos. Tags. Booking CTA.

- [ ] **Step 4: Create ReportActions**

PDF download button (using html2pdf.js to capture report section). Book consultation CTA (links to clinic booking, passes location). Chat widget trigger.

- [ ] **Step 5: Create report page**

`src/app/report/page.tsx`:
- Reads quiz data from sessionStorage
- Calculates scores using scoring engine
- Calls `/api/report/generate` for AI narratives
- Renders all report components
- Shows loading state while AI generates

- [ ] **Step 6: Test report generation**

Complete quiz → verify report renders with AI content, scores, treatments.

- [ ] **Step 7: Commit**

```bash
git add src/components/report/ src/app/report/ && git commit -m "feat: add report page with AI-generated personalized content"
```

---

### Task 12: Chatbot Widget

**Files:** Create: `src/components/chatbot/ChatWidget.tsx`, `src/components/chatbot/ChatMessage.tsx`

- [ ] **Step 1: Create ChatMessage**

Bot messages (dark bg, left-aligned) and user messages (gold tint, right-aligned). Typing indicator animation.

- [ ] **Step 2: Create ChatWidget**

Floating gold chat bubble (bottom-right). Expandable chat window. Message history. Input field. Calls `/api/chat`. 20-message limit with booking CTA on limit. Auto-generated opening message referencing their lowest dimension.

- [ ] **Step 3: Integrate into report page**

Add ChatWidget to report page, pass quiz context.

- [ ] **Step 4: Test chatbot**

Open report → click chat → ask questions → verify context-aware responses → verify 20-message limit.

- [ ] **Step 5: Commit**

```bash
git add src/components/chatbot/ && git commit -m "feat: add AI chatbot widget with context-aware responses"
```

---

## Chunk 5: SEO, GEO, PDF, Polish

### Task 13: SEO + GEO

**Files:** Modify: `src/app/layout.tsx`. Create: `public/llms.txt`

- [ ] **Step 1: Add schema markup to layout**

Add JSON-LD for MedicalWebPage, Quiz schema, FAQPage schema, Organization.

- [ ] **Step 2: Add meta tags**

Open Graph, Twitter cards, canonical URL, viewport.

- [ ] **Step 3: Create llms.txt**

```
# Harley Street Medical Wellness
> AI-powered longevity assessments and IV therapy treatments in London and Glasgow.

## Treatments
- EBOO Therapy: Advanced ozone blood treatment (£1,995)
- NAD+ IV Drip: Cellular energy and anti-aging (£295)
- Immunity IV Drip: Immune system support (£295)
- Detox IV Drip: Toxin elimination (£399)
- Skin Glow IV Drip: Skin rejuvenation (£299)

## Locations
- London: Harley Street
- Glasgow

## Contact
https://harleystreetmedicalwellness.co.uk
```

- [ ] **Step 4: Add Facebook Pixel script to layout**

Inject FB Pixel base code via `<Script>` component in layout, using `NEXT_PUBLIC_FB_PIXEL_ID` env var.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx public/llms.txt && git commit -m "feat: add SEO schema markup, meta tags, GEO llms.txt, and FB Pixel"
```

---

### Task 14: PDF Download

**Files:** Modify: `src/components/report/ReportActions.tsx`

- [ ] **Step 1: Implement PDF download**

Use html2pdf.js to capture the report container. Add clinic branding header, disclaimer footer, booking CTA. Gold-on-white color scheme for print readability.

- [ ] **Step 2: Test PDF generation**

Click download → verify PDF renders with all sections, readable formatting.

- [ ] **Step 3: Commit**

```bash
git add src/components/report/ReportActions.tsx && git commit -m "feat: add PDF report download"
```

---

### Task 15: Final Polish + Mobile

- [ ] **Step 1: Mobile responsive pass**

Test all pages at 375px width. Fix any layout issues. Ensure tap targets are 44px+.

- [ ] **Step 2: Add loading states and transitions**

Skeleton loaders for AI-generated content. Fade transitions between quiz questions. Score ring animation on report load.

- [ ] **Step 3: Add cookie consent banner**

Simple banner for Facebook Pixel consent (GDPR).

- [ ] **Step 4: Add privacy policy page**

`src/app/privacy/page.tsx` — basic privacy policy referencing data handling.

- [ ] **Step 5: End-to-end test**

Full flow: Landing → Quiz (all 16 questions) → Lead capture → Report → PDF download → Chatbot → Booking CTA.

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "feat: mobile polish, loading states, cookie consent, privacy policy"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-15-longevity-quiz-funnel.md`. Ready to execute?**
