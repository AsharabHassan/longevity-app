import { Question, AdaptiveBankEntry } from "./types";

export const FIXED_QUESTIONS: Question[] = [
  // Phase 1: Warm-up
  {
    id: "q1",
    phase: 1,
    text: "What is your age?",
    type: "numeric",
    min: 18,
    max: 100,
  },
  {
    id: "q2",
    phase: 1,
    text: "What is your gender?",
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
    text: "What is your #1 health goal right now?",
    subtext: "Select the one that matters most to you",
    type: "image-cards",
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

  // Phase 2: Lifestyle Assessment
  {
    id: "q4",
    phase: 2,
    text: "How would you rate your energy levels?",
    subtext: "Think about a typical day",
    type: "scale",
    options: [
      { label: "Chronically Fatigued", score: 0, icon: "battery" },
      { label: "Low Energy", score: 1, icon: "battery-low" },
      { label: "Moderate", score: 2, icon: "battery-medium" },
      { label: "Good with Dips", score: 3, icon: "battery-medium" },
      { label: "High & Stable", score: 4, icon: "battery-full" },
    ],
  },
  {
    id: "q5",
    phase: 2,
    text: "How many hours of sleep do you typically get?",
    type: "single",
    options: [
      { label: "Under 5 hours", score: 0 },
      { label: "5-6 hours", score: 1 },
      { label: "6-7 hours", score: 2 },
      { label: "7-8 hours", score: 4 },
      { label: "Over 8 hours", score: 3 },
    ],
  },
  {
    id: "q6",
    phase: 2,
    text: "How would you rate your sleep quality?",
    type: "single",
    options: [
      { label: "Poor — I wake frequently", score: 0 },
      { label: "Fair — restless nights", score: 1 },
      { label: "Average — some disruptions", score: 2 },
      { label: "Good — mostly refreshing", score: 3 },
      { label: "Excellent — I wake refreshed", score: 4 },
    ],
  },
  {
    id: "q7",
    phase: 2,
    text: "How many days per week do you exercise for 30+ minutes?",
    type: "single",
    options: [
      { label: "0 days — completely sedentary", score: 0 },
      { label: "1-2 days", score: 2 },
      { label: "3-4 days", score: 3 },
      { label: "5+ days", score: 4 },
    ],
  },
  {
    id: "q8",
    phase: 2,
    text: "How would you describe your diet?",
    type: "single",
    options: [
      { label: "Mostly processed / fast food", description: "Convenience-driven eating", score: 0 },
      { label: "Mixed — some healthy, some not", description: "Inconsistent nutrition", score: 1 },
      { label: "Generally healthy", description: "Whole foods with occasional treats", score: 2 },
      { label: "Very healthy", description: "Mostly whole foods, balanced macros", score: 3 },
      { label: "Optimized", description: "Nutrient-dense, intentional eating", score: 4 },
    ],
  },
  {
    id: "q9",
    phase: 2,
    text: "How would you rate your daily stress level?",
    subtext: "Consider work, relationships, and life overall",
    type: "scale",
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
    id: "q10",
    phase: 3,
    text: "Which of these do you experience regularly?",
    subtext: "Select all that apply",
    type: "multi",
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
  // Q11, Q12 are adaptive — inserted dynamically from the bank
  {
    id: "q13",
    phase: 3,
    text: "Have you noticed changes in your skin quality in the past year?",
    type: "single",
    options: [
      { label: "Yes, significantly worse", score: 0 },
      { label: "Slightly worse", score: 1 },
      { label: "No change", score: 2 },
      { label: "Slightly improved", score: 3 },
      { label: "Significantly improved", score: 4 },
    ],
  },
  {
    id: "q14",
    phase: 3,
    text: "How often do you experience energy crashes during the day?",
    type: "single",
    options: [
      { label: "Constantly", score: 0 },
      { label: "Frequently (most days)", score: 1 },
      { label: "Occasionally (1-2x/week)", score: 3 },
      { label: "Never", score: 4 },
    ],
  },

  // Phase 4: Readiness
  {
    id: "q15",
    phase: 4,
    text: "Have you tried IV therapy or wellness treatments before?",
    type: "single",
    options: [
      { label: "Never", score: 1 },
      { label: "Once or twice", score: 2 },
      { label: "Regular", score: 4 },
    ],
  },
  {
    id: "q16",
    phase: 4,
    text: "Which location is more convenient for you?",
    type: "single",
    options: [
      { label: "London (Portpool Lane)", score: 0 },
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
        id: "q11-cognitive-clarity",
        phase: 3,
        text: "How would you describe your mental clarity throughout the day?",
        type: "single",
        isAdaptive: true,
        options: [
          { label: "Sharp all day", score: 4 },
          { label: "Clear mornings, foggy afternoons", score: 2 },
          { label: "Foggy most of the day", score: 1 },
          { label: "Persistently cloudy, can't focus", score: 0 },
        ],
      },
      {
        id: "q11-cognitive-duration",
        phase: 3,
        text: "How long have you been experiencing cognitive difficulties?",
        type: "single",
        isAdaptive: true,
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
        id: "q11-immune-frequency",
        phase: 3,
        text: "How many times have you been ill in the past 12 months?",
        type: "single",
        isAdaptive: true,
        options: [
          { label: "0-1 times", score: 4 },
          { label: "2-3 times", score: 2 },
          { label: "4-5 times", score: 1 },
          { label: "6+ times", score: 0 },
        ],
      },
      {
        id: "q11-immune-recovery",
        phase: 3,
        text: "How long does it typically take you to recover from a cold or flu?",
        type: "single",
        isAdaptive: true,
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
        id: "q11-inflam-severity",
        phase: 3,
        text: "How would you rate your inflammatory symptoms?",
        type: "single",
        isAdaptive: true,
        options: [
          { label: "Rare/mild", score: 4 },
          { label: "Occasional flare-ups", score: 2 },
          { label: "Frequent, affects daily life", score: 1 },
          { label: "Chronic and severe", score: 0 },
        ],
      },
      {
        id: "q11-toxin-exposure",
        phase: 3,
        text: "Have you been exposed to environmental toxins (mold, chemicals, heavy metals)?",
        type: "single",
        isAdaptive: true,
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
        id: "q11-metabolic-meals",
        phase: 3,
        text: "How stable is your energy after meals?",
        type: "single",
        isAdaptive: true,
        options: [
          { label: "Stable, no crashes", score: 4 },
          { label: "Minor dip sometimes", score: 2 },
          { label: "Regular post-meal crashes", score: 1 },
          { label: "Severe crashes, need to nap", score: 0 },
        ],
      },
      {
        id: "q11-stress-recovery",
        phase: 3,
        text: "How would you describe your stress recovery?",
        type: "single",
        isAdaptive: true,
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
        id: "q11-skin-response",
        phase: 3,
        text: "How would you describe your skin's response to skincare products?",
        type: "single",
        isAdaptive: true,
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
    id: "q11-fallback-vitality",
    phase: 3,
    text: "How would you rate your overall vitality compared to 5 years ago?",
    type: "single",
    isAdaptive: true,
    options: [
      { label: "Better than ever", score: 4 },
      { label: "About the same", score: 3 },
      { label: "Noticeably declined", score: 1 },
      { label: "Significantly worse", score: 0 },
    ],
  },
  {
    id: "q11-fallback-approach",
    phase: 3,
    text: "What best describes your current approach to health optimization?",
    type: "single",
    isAdaptive: true,
    options: [
      { label: "Active biohacker", score: 4 },
      { label: "Regular supplements + exercise", score: 3 },
      { label: "Trying to improve", score: 2 },
      { label: "Haven't started yet", score: 1 },
    ],
  },
];

// Micro-insight trigger points
export const INSIGHT_TRIGGERS = ["q3", "q6", "q9", "q12"] as const;
