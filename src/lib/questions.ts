import type { Question } from "./types";

/**
 * The quiz, in order. Only the eight lifestyle factors (smoking, activity, body,
 * diet, sleep, alcohol, stress, social) feed the estimate — see lifestyleAge.ts.
 * Goal, concerns and location personalise the report and never move the number.
 * "investment" decides whether the report shows the clinic's offer at all.
 */
export const QUIZ_SEQUENCE: Question[] = [
  {
    id: "age",
    text: "What is your age?",
    type: "numeric",
    min: 18,
    max: 100,
  },
  {
    id: "goal",
    text: "What matters most to you right now?",
    subtext: "We'll use this to focus your report",
    type: "image-cards",
    options: [
      { label: "More Energy", description: "Feel less drained day to day", value: "energy", icon: "zap" },
      { label: "Sharper Focus", description: "Think clearly under load", value: "focus", icon: "brain" },
      { label: "Healthy Ageing", description: "Stay well for longer", value: "ageing", icon: "clock" },
      { label: "Better Sleep", description: "Wake up properly rested", value: "sleep", icon: "moon" },
      { label: "Weight & Metabolism", description: "Understand what's going on", value: "metabolic", icon: "activity" },
      { label: "Fitness & Recovery", description: "Train and bounce back well", value: "recovery", icon: "dumbbell" },
      { label: "Stress & Resilience", description: "Cope better with pressure", value: "stress", icon: "shield" },
      { label: "A Full Check-up", description: "Know where I stand", value: "checkup", icon: "target" },
    ],
  },
  {
    id: "smoking",
    text: "Do you smoke?",
    subtext: "Cigarettes, cigars or roll-ups",
    type: "single",
    options: [
      { label: "Never smoked", value: "never" },
      { label: "Quit more than 10 years ago", value: "quit10plus" },
      { label: "Quit in the last 10 years", value: "quitRecent" },
      { label: "Yes — fewer than 10 a day", value: "currentLight" },
      { label: "Yes — 10 or more a day", value: "currentHeavy" },
    ],
  },
  {
    id: "activity",
    text: "How active are you in a typical week?",
    subtext: "Brisk walking, cycling, sport, gym — anything that raises your heart rate",
    type: "single",
    options: [
      { label: "150+ minutes, plus strength training", value: "strength" },
      { label: "150+ minutes", description: "About 30 minutes, 5 days a week", value: "active" },
      { label: "Some, but less than 150 minutes", value: "some" },
      { label: "Very little — mostly sitting", value: "sedentary" },
    ],
  },
  {
    id: "body",
    text: "What are your height and weight?",
    subtext: "Used to work out your BMI. It stays on your report.",
    type: "body",
  },
  {
    id: "diet",
    text: "Which best describes how you eat?",
    type: "single",
    options: [
      { label: "Mostly whole foods", description: "Vegetables, fruit, fish, pulses, whole grains most days", value: "wholefood" },
      { label: "A mix", description: "Some healthy meals, some convenience food", value: "mixed" },
      { label: "Mostly processed or takeaway", description: "Convenience-driven most days", value: "processed" },
    ],
  },
  {
    id: "sleepHours",
    text: "How many hours do you usually sleep?",
    subtext: "On a typical night",
    type: "single",
    options: [
      { label: "Under 6 hours", value: "under6" },
      { label: "6–7 hours", value: "6to7" },
      { label: "7–8 hours", value: "7to8" },
      { label: "8–9 hours", value: "8to9" },
      { label: "More than 9 hours", value: "over9" },
    ],
  },
  {
    id: "sleepQuality",
    text: "How well do you sleep?",
    type: "single",
    options: [
      { label: "Well — I usually wake refreshed", value: "good" },
      { label: "Okay — some restless nights", value: "okay" },
      { label: "Poorly — I often struggle to sleep or wake unrefreshed", value: "poor" },
    ],
  },
  {
    id: "alcohol",
    text: "How much alcohol do you drink in a typical week?",
    subtext: "14 units is about 6 pints of beer or 6 medium glasses of wine",
    type: "single",
    options: [
      { label: "None", value: "none" },
      { label: "Up to 14 units", value: "within14" },
      { label: "15–35 units", value: "15to35" },
      { label: "More than 35 units, or a heavy session most weeks", value: "over35" },
    ],
  },
  {
    id: "stress",
    text: "How would you describe your stress levels?",
    subtext: "Work, relationships and life overall",
    type: "single",
    options: [
      { label: "Low", value: "low" },
      { label: "Moderate", value: "moderate" },
      { label: "High, but I recover at weekends or on holiday", value: "high" },
      { label: "High, and I rarely switch off", value: "highNoRecovery" },
    ],
  },
  {
    id: "social",
    text: "How connected do you feel to other people?",
    type: "single",
    options: [
      { label: "Well connected — I see friends or family most weeks", value: "strong" },
      { label: "Somewhat — less than I'd like", value: "some" },
      { label: "Often isolated or lonely", value: "isolated" },
    ],
  },
  {
    id: "concerns",
    text: "Is anything bothering you at the moment?",
    subtext: "Select all that apply. These don't change your estimate — they help us prepare for your consultation.",
    type: "multi",
    options: [
      { label: "Brain fog", value: "Brain fog", icon: "cloud" },
      { label: "Persistent tiredness", value: "Persistent tiredness", icon: "battery-low" },
      { label: "Poor sleep", value: "Poor sleep", icon: "moon" },
      { label: "Getting ill often", value: "Getting ill often", icon: "thermometer" },
      { label: "Slow recovery", value: "Slow recovery", icon: "clock" },
      { label: "Digestive issues", value: "Digestive issues", icon: "circle-dot" },
      { label: "Joint pain", value: "Joint pain", icon: "bone" },
      { label: "Low or changeable mood", value: "Low or changeable mood", icon: "frown" },
      { label: "Weight changes", value: "Weight changes", icon: "scale" },
      { label: "Skin changes", value: "Skin changes", icon: "sparkles" },
      { label: "None of the above", value: "None of the above", icon: "check-circle" },
    ],
  },
  {
    id: "investment",
    text: "If testing or a programme looked right for you, would you be comfortable investing £500 or more in your health?",
    subtext: "There's no wrong answer. It tells us whether to show you what the clinic offers.",
    type: "single",
    options: [
      { label: "Yes, comfortably", value: "yes" },
      { label: "Yes, if I can see the value", value: "yesIfValue" },
      { label: "Not right now", value: "no" },
    ],
  },
  {
    id: "location",
    text: "Which clinic is more convenient for you?",
    type: "single",
    options: [
      { label: "London (Portpool Lane, EC1N)", value: "London" },
      { label: "Glasgow (Ingram Street, G1)", value: "Glasgow" },
    ],
  },
];

export const NONE_OF_THE_ABOVE = "None of the above";

/** Bump when the questions change, so a report never tries to read answers saved by an older quiz. */
export const QUIZ_VERSION = 2;

/**
 * People who say they wouldn't invest £500 get their estimate and the research,
 * but no consultation offer, portfolio or calendar. Unanswered counts as qualified
 * so an older saved session is never locked out.
 */
export function isQualified(answers: { questionId: string; value: unknown }[]): boolean {
  return answers.find((a) => a.questionId === "investment")?.value !== "no";
}
