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
