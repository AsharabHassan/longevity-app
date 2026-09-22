import type { FactorId } from "./types";

/**
 * Why a habit can be hard to change, in terms of things a clinic can actually
 * measure. These are possibilities to rule in or out, never a suggestion that
 * the reader has any of them, and never a reason to name a treatment.
 */
export const FACTOR_BARRIERS: Record<FactorId, { struggle: string; measurable: string[] }> = {
  activity: {
    struggle: "Getting more active is hard when you have nothing left in the tank",
    measurable: ["Iron stores and blood count", "Thyroid function", "Vitamin D and B12", "How well you're actually sleeping"],
  },
  bmi: {
    struggle: "Weight often resists willpower for reasons that show up in a blood test",
    measurable: ["Blood sugar and insulin resistance (HbA1c)", "Thyroid function", "Cholesterol and liver markers", "Medicines that promote weight gain"],
  },
  sleep: {
    struggle: "Poor sleep is rarely fixed by simply deciding to sleep more",
    measurable: ["Signs of sleep apnoea", "Iron stores, linked to restless legs", "Thyroid function", "Hormonal changes such as perimenopause"],
  },
  diet: {
    struggle: "Cravings and energy crashes make eating well harder than it sounds",
    measurable: ["Blood sugar control (HbA1c)", "Cholesterol profile", "B12, folate and iron", "Genetic tendencies in how you handle carbohydrate and fat"],
  },
  alcohol: {
    struggle: "Drinking is often doing a job — switching off, or getting to sleep",
    measurable: ["Liver function", "How alcohol is affecting your sleep", "Stress load and recovery"],
  },
  stress: {
    struggle: "High stress with no recovery wears down everything else on this list",
    measurable: ["Thyroid function", "Sleep quality", "Inflammation markers", "Mood, using standard questionnaires"],
  },
  social: {
    struggle: "Seeing people takes energy, and low energy or low mood gets in the way",
    measurable: ["Causes of persistent tiredness", "Mood, using standard questionnaires", "Sleep quality"],
  },
  smoking: {
    struggle: "Stopping smoking is one of the hardest changes there is, and willpower alone has the lowest success rate",
    measurable: ["Lung function and cardiovascular risk", "The NHS Stop Smoking Service, which is free and the best-evidenced support available"],
  },
};
