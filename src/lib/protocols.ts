import type { ClinicLocation } from "./clinic";
import { CONCERN_GUIDES } from "./concerns";
import type { LifestyleAgeResult, QuizAnswer } from "./types";

/**
 * The clinic's published protocols (harleystreetmedicalwellness.co.uk/protocols).
 *
 * Components are named the way the website names them, framed as options for
 * individual review, with no benefit claims. Two things never appear here:
 * prescription-only medicines and unlicensed cell or peptide products. Promoting
 * those to the public is barred by the Human Medicines Regulations 2012 (regs 279
 * and 284), so they sit under "Further specialist options".
 */
export type ComponentTier = "foundation" | "optional" | "specialist";

export interface ProtocolComponent {
  name: string;
  tier: ComponentTier;
  text: string;
}

export interface Protocol {
  id: string;
  /** The website's name for the pathway, e.g. "Clear Focus". */
  name: string;
  concern: string;
  summary: string;
  slug: string;
  components: ProtocolComponent[];
  /** How progress is checked, in the website's terms. */
  review: string;
  /**
   * Optional explainer video: a file under /public (e.g. "/videos/clear-focus.mp4")
   * or a full .mp4 URL. Leave empty and the report shows no player. Scripts need
   * the same care as the copy: no outcome claims, no prescription-only medicines.
   */
  video: string;
  /** Optional still shown before the video plays, e.g. "/videos/clear-focus.jpg". */
  videoPoster: string;
}

const SITE = "https://harleystreetmedicalwellness.co.uk/protocols";

const BLOOD_TESTING: ProtocolComponent = {
  name: "Selected blood testing",
  tier: "foundation",
  text: "Tests chosen around your history, which may include metabolic, thyroid, hormone or nutritional markers.",
};

const METABOLIC_REVIEW: ProtocolComponent = {
  name: "Metabolic review and care",
  tier: "foundation",
  text: "Your findings considered alongside sleep, nutrition, medicines and routine, then turned into medical care, lifestyle support or a referral.",
};

const NAD_IV: ProtocolComponent = {
  name: "NAD+ IV",
  tier: "optional",
  text: "An optional infusion, with dose, timing and monitoring discussed before any treatment. Clinical trial evidence for it is limited, and your clinician will tell you so.",
};

const PHOSPHOLIPID: ProtocolComponent = {
  name: "Phospholipid exchange",
  tier: "specialist",
  text: "A specialist phosphatidylcholine infusion. You discuss its proposed role, the evidence for your concern and the full plan before deciding.",
};

const EBOO: ProtocolComponent = {
  name: "EBOO suitability review",
  tier: "specialist",
  text: "EBOO processes blood outside the body with oxygen and ozone. It is an emerging procedure, considered in a separate consultation covering alternatives and risks.",
};

const FURTHER_OPTIONS: ProtocolComponent = {
  name: "Further specialist options",
  tier: "specialist",
  text: "Some options can only be discussed one to one with your clinician, after a review of your medicines and screening results.",
};

export const PROTOCOLS = {
  fatigue: {
    id: "fatigue",
    name: "Clear Focus",
    concern: "Persistent fatigue and low energy",
    summary:
      "A fatigue protocol combining clinical assessment, selected testing, a personalised plan and follow-up, with access to the clinic's therapy portfolio when appropriate.",
    slug: "fatigue",
    components: [BLOOD_TESTING, METABOLIC_REVIEW, NAD_IV, PHOSPHOLIPID, EBOO, FURTHER_OPTIONS],
    review: "At an agreed follow-up you compare energy and daily function with your starting point, and review any repeat results.",
    video: "/videos/clear-focus.mp4",
    videoPoster: "/videos/clear-focus.jpg",
  },
  brainFog: {
    id: "brainFog",
    name: "Clear Focus",
    concern: "Brain fog, concentration and mental clarity",
    summary:
      "A medical pathway for persistent brain fog. Brain fog is not a diagnosis on its own, so it starts with your symptoms and history, adds relevant testing, and ends with an agreed review of concentration and daily function.",
    slug: "brain-fog",
    components: [BLOOD_TESTING, METABOLIC_REVIEW, NAD_IV, PHOSPHOLIPID, EBOO, FURTHER_OPTIONS],
    review: "At an agreed follow-up you review concentration in real life: the tasks and situations that matter to you, compared with your starting point.",
    video: "/videos/clear-focus.mp4",
    videoPoster: "/videos/clear-focus.jpg",
  },
  metabolic: {
    id: "metabolic",
    name: "Metabolic Momentum",
    concern: "Weight change and metabolic health",
    summary:
      "A personalised metabolic programme with selected testing, medical and nutrition support, and a monthly review of agreed measures.",
    slug: "weight-metabolic",
    components: [
      BLOOD_TESTING,
      { name: "Medical and nutrition support", tier: "foundation", text: "A way of eating and moving you can sustain, built around your results and your week." },
      { name: "Monthly review", tier: "foundation", text: "Agreed measures such as weight, waist, blood pressure and blood markers, checked every month." },
    ],
    review: "A monthly review of the measures you agreed at the start.",
    video: "/videos/metabolic-momentum.mp4",
    videoPoster: "/videos/metabolic-momentum.jpg",
  },
  ageing: {
    id: "ageing",
    name: "Active Years",
    concern: "Healthy ageing for active adults 40+",
    summary:
      "A healthspan protocol connecting selected testing and a personalised care plan with a quarterly or annual comparison against your own baseline.",
    slug: "healthy-ageing",
    components: [
      { name: "Baseline testing", tier: "foundation", text: "Blood markers, plus DNA and epigenetic testing from a saliva sample if you choose, to set your own baseline." },
      METABOLIC_REVIEW,
      NAD_IV,
      PHOSPHOLIPID,
      EBOO,
      { name: "Continuing care", tier: "foundation", text: "A standing plan, revisited as your results and priorities change." },
    ],
    review: "A quarterly or annual comparison with your own baseline.",
    video: "",
    videoPoster: "",
  },
  recovery: {
    id: "recovery",
    name: "Athlete Advantage",
    concern: "Training fatigue and slower recovery",
    summary:
      "A medically informed recovery protocol connecting selected testing with a training and nutrition review, individually selected options and an agreed follow-up.",
    slug: "sports-recovery",
    components: [
      BLOOD_TESTING,
      { name: "Training and nutrition review", tier: "foundation", text: "Your training load, sleep, protein and total energy intake, looked at together." },
      { name: "Recovery IVs", tier: "optional", text: "Vitamin and mineral infusions, selected individually after assessment." },
      NAD_IV,
      FURTHER_OPTIONS,
    ],
    review: "An agreed follow-up on training, recovery and any repeat results.",
    video: "",
    videoPoster: "",
  },
} satisfies Record<string, Protocol>;

export const TIER_LABEL: Record<ComponentTier, string> = {
  foundation: "Foundation",
  optional: "Optional",
  specialist: "Specialist review",
};

export const PROTOCOL_STAGES = [
  { id: "assess", title: "Assess", text: "Your symptoms, history, sleep and medicines, with tests chosen around the clinical picture." },
  { id: "personalise", title: "Personalise", text: "The findings are explained first. Only then are options, and alternatives, chosen." },
  { id: "treat", title: "Treat", text: "The agreed components begin, with suitability, monitoring and aftercare confirmed in advance." },
  { id: "review", title: "Review", text: "An agreed follow-up compares how you are doing with where you started." },
] as const;

export type StageId = (typeof PROTOCOL_STAGES)[number]["id"];

export function protocolUrl(protocol: Protocol, location: ClinicLocation): string {
  return `${SITE}/${location.toLowerCase()}/${protocol.slug}/`;
}

/** The tests a clinician would usually consider for the concerns this person reported. */
export function testsForConcerns(concerns: string[], limit = 7): string[] {
  const tests = concerns.flatMap((c) => CONCERN_GUIDES[c]?.tests ?? []);
  return [...new Set(tests)].slice(0, limit);
}

/** Things a person can ask to discuss: the named components of their protocols, plus the epigenetic test. */
export function discussionTopics(protocols: Protocol[]): string[] {
  const names = protocols.flatMap((p) => p.components.map((c) => c.name)).filter((n) => n !== FURTHER_OPTIONS.name);
  return [...new Set([...names, "Epigenetic age test", "Something else"])];
}

/**
 * Picks up to two protocols from what the person told us: concerns first, then
 * their goal, then weight and age. It points to a pathway that begins with an
 * assessment — it never selects a treatment.
 */
export function matchProtocols(answers: QuizAnswer[], result: LifestyleAgeResult): Protocol[] {
  const goal = answers.find((a) => a.questionId === "goal")?.value;
  const has = (concern: string) => result.concerns.includes(concern);
  const bmiAddsYears = (result.factors.find((f) => f.id === "bmi")?.years ?? 0) > 0;

  const picks: Protocol[] = [];
  const add = (p: Protocol) => {
    // Fatigue and brain fog are two doors into the same pathway: show it once
    if (!picks.some((x) => x.name === p.name)) picks.push(p);
  };

  if (has("Brain fog")) add(PROTOCOLS.brainFog);
  if (has("Persistent tiredness")) add(PROTOCOLS.fatigue);
  if (has("Weight changes")) add(PROTOCOLS.metabolic);
  if (has("Slow recovery")) add(PROTOCOLS.recovery);

  if (goal === "focus") add(PROTOCOLS.brainFog);
  if (goal === "energy") add(PROTOCOLS.fatigue);
  if (goal === "metabolic") add(PROTOCOLS.metabolic);
  if (goal === "recovery") add(PROTOCOLS.recovery);
  if (goal === "ageing" && result.chronologicalAge >= 40) add(PROTOCOLS.ageing);

  if (bmiAddsYears) add(PROTOCOLS.metabolic);
  if (picks.length === 0 && result.chronologicalAge >= 40) add(PROTOCOLS.ageing);

  return picks.slice(0, 2);
}

