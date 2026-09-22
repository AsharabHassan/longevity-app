export type QuestionType = "numeric" | "single" | "multi" | "scale" | "image-cards" | "body";

export interface QuestionOption {
  label: string;
  description?: string;
  /** Stable machine value used by the scoring model (labels are free to change). */
  value: string;
  icon?: string;
}

export interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
}

export interface QuizAnswer {
  questionId: string;
  /** Machine value(s): option `value`, a number, or a BodyMeasurements JSON string for "body". */
  value: string | string[] | number;
  /** Human-readable label(s) shown back to the user and sent to the CRM. */
  label: string;
}

export interface BodyMeasurements {
  heightCm: number;
  weightKg: number;
}

export type FactorId =
  | "smoking"
  | "activity"
  | "bmi"
  | "diet"
  | "sleep"
  | "alcohol"
  | "stress"
  | "social";

export interface Citation {
  id: string;
  short: string;
  full: string;
  url: string;
}

export interface FactorResult {
  id: FactorId;
  name: string;
  icon: string;
  /** Years this factor adds (+) or removes (-) from the estimate, before caps. */
  years: number;
  /** Years this factor would contribute at its best answer. */
  bestYears: number;
  /** What the user told us, in their words. */
  answerLabel: string;
  status: "helping" | "neutral" | "adding";
  /** How solid the underlying evidence is for this factor. */
  confidence: "high" | "moderate" | "low";
  /** One-sentence, sourced explanation of the association. */
  evidence: string;
  citations: Citation[];
  /** Concrete target used by the what-if simulator. */
  improvement?: { label: string; years: number };
}

export interface LifestyleAgeResult {
  chronologicalAge: number;
  estimate: number;
  low: number;
  high: number;
  /** Total offset in years after caps and the under-30 adjustment. */
  offsetYears: number;
  factors: FactorResult[];
  /** Self-reported concerns. Discussion points only: they never move the estimate. */
  concerns: string[];
  /** 0-100 convenience score for the CRM (100 = best possible offset). */
  lifestyleScore: number;
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
