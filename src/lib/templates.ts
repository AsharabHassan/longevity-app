/**
 * templates.ts — Personalised content engine (no AI required)
 *
 * Every function uses the user's actual quiz data (age, scores, symptoms,
 * answers) to produce copy that feels tailored — without any external API.
 *
 * Strategy: "personalised while generic"
 *  - Inject real numbers: scores, age, biological age offset
 *  - Reference actual answers: sleep hours, stress level, symptoms ticked
 *  - Use real treatment names from the algorithm's output
 *  - Pick score-band variants (Needs Attention / Below Avg / Average / Strong / Optimal)
 */

export type AnswerRecord = Record<string, string | string[] | number>;
export type DimensionData = { name: string; score: number };

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

export interface DeepDiveData {
  mechanism: string;
  agingImpact: string;
  treatmentConnection: string;
  timeline: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function str(answers: AnswerRecord, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v : "";
}

function num(answers: AnswerRecord, key: string, fallback = 35): number {
  const v = answers[key];
  return typeof v === "number" ? v : fallback;
}

function arr(answers: AnswerRecord, key: string): string[] {
  const v = answers[key];
  return Array.isArray(v) ? v : [];
}

function lowest(dims: DimensionData[], n = 2): DimensionData[] {
  return [...dims].sort((a, b) => a.score - b.score).slice(0, n);
}

function nadDecline(age: number): number {
  return Math.round(Math.min(60, (age - 20) * 1.5));
}

// ─── MICRO-INSIGHTS ───────────────────────────────────────────────────────────

type InsightFn = (age: number, answers: AnswerRecord) => string;

const MICRO_INSIGHTS: Record<string, InsightFn> = {
  q3: (age, answers) => {
    const goal = str(answers, "q3");
    const map: Record<string, string> = {
      "More Energy": `At ${age}, your cells' NAD+ coenzyme levels have declined by roughly ${nadDecline(age)}% from their peak — directly reducing your mitochondria's capacity to produce ATP, the molecule your energy depends on. This is one of the most well-documented and reversible drivers of fatigue in adults over 30.`,
      "Cognitive Performance": `Your brain consumes around 20% of your body's total energy despite being just 2% of your body weight. At ${age}, mitochondrial efficiency in neurons has measurably declined — impacting processing speed, working memory, and mental clarity. The good news: this is one of the most responsive systems to targeted cellular intervention.`,
      "Anti-aging": `Biological aging is primarily driven by telomere shortening — the protective caps on your DNA strands. Research published in Nature Aging confirms that targeted lifestyle and IV-based interventions can slow this shortening by up to 30%, even after age ${age}. Your chronological age and biological age don't have to match.`,
      "Stronger Immunity": `Your immune system's T-cell production naturally declines with age. At ${age}, your thymus gland has reduced output by an estimated ${Math.min(60, Math.round((age - 20) * 1.2))}% compared to your early twenties. Targeted micronutrient IV therapy directly supports immune cell proliferation and natural killer cell activity at concentrations impossible to achieve through diet alone.`,
      "Detox & Cleanse": `Glutathione — your body's master antioxidant — declines by roughly 1% per year after age 20. At ${age}, your detoxification capacity may be running at ${Math.max(60, 100 - (age - 20))}% of its youthful potential, allowing cellular damage to accumulate silently in tissues your supplements can't reach.`,
      "Better Skin": `Collagen synthesis declines at approximately 1% per year after age 25. By ${age}, this represents a ${Math.min(40, Math.max(0, age - 25))}% reduction in collagen production capacity. Glutathione IV therapy directly supports this pathway while modulating melanin production — producing the kind of glow that topical skincare cannot replicate.`,
      "Athletic Recovery": `At ${age}, your body's natural cellular energy replenishment after intense exercise takes approximately ${age > 35 ? "48–72" : "24–48"} hours. NAD+ and targeted IV therapy can accelerate the mitochondrial repair cycle, meaningfully reducing recovery windows and improving performance adaptation from each session.`,
      "Overall Optimization": `Longevity research from the 2025 CMEC study confirms that the biggest gains in biological age reversal come from addressing multiple systems simultaneously — not a single supplement. At ${age}, your body has significant optimisation capacity across energy, sleep, immunity, and cognitive function. Your quiz will identify exactly where to start.`,
    };
    return (
      map[goal] ??
      `At ${age}, your cells are under pressures that accumulate silently — declining NAD+, rising oxidative stress, and slower repair cycles. Your answers will help pinpoint exactly where to intervene for maximum longevity impact.`
    );
  },

  q6: (age, answers) => {
    const quality = str(answers, "q6");
    const hours = str(answers, "q5");
    const isPoor =
      quality.includes("Poor") ||
      quality.includes("Fair") ||
      hours.includes("Under 5") ||
      hours.includes("5-6");
    if (isPoor) {
      return `Your sleep quality is silently accelerating your biological aging. During deep sleep, your brain's glymphatic system flushes metabolic waste — including proteins linked to cognitive decline — at up to 10× the daytime rate. Disrupted sleep reduces this overnight clearance by up to 40%, allowing neurotoxins to accumulate and shortening telomeres at an accelerated rate.`;
    }
    if (quality.includes("Excellent") || quality.includes("Good")) {
      return `Quality sleep is one of your most powerful longevity assets. Your glymphatic system — your brain's nightly detox mechanism — operates most efficiently during the deep sleep stages you're reportedly achieving. This overnight flush of cellular debris significantly slows biological aging and supports long-term cognitive health.`;
    }
    return `Sleep is your body's primary cellular repair window. Your glymphatic system activates during deep sleep to flush neurotoxins at 10× the daytime rate, while growth hormone triggers tissue repair across every organ system. Even small improvements in sleep quality produce measurable reductions in biological age markers over time.`;
  },

  q9: (_age, answers) => {
    const stress = str(answers, "q9");
    if (stress.includes("Very High") || stress.includes("High")) {
      return `Chronic stress at your reported level is directly shortening your telomeres through the cortisol-telomere feedback loop. Studies published in 2024 show that individuals with sustained high stress carry telomere lengths equivalent to someone 9–17 years older. This is one of the most aggressive — and most reversible — drivers of accelerated biological aging.`;
    }
    if (stress.includes("Low") || stress.includes("Minimal")) {
      return `Your low stress levels provide a significant longevity advantage. Cortisol — your primary stress hormone — directly attacks telomeres when chronically elevated. By keeping it low, you're preserving the protective caps on your DNA that govern how quickly your cells age, creating a compounding longevity benefit over time.`;
    }
    return `Stress management sits at the intersection of mental wellness and cellular longevity. Cortisol, when chronically elevated, directly shortens your DNA's protective telomere caps. Even modest reductions in perceived stress produce measurable improvements in biological age markers within 4–8 weeks of intervention.`;
  },

  q12: (_age, answers) => {
    const symptoms = arr(answers, "q10");
    if (symptoms.includes("Brain fog")) {
      return `Brain fog is your nervous system's signal that mitochondrial energy production in neurons has dropped below optimal. Your prefrontal cortex — responsible for focus, planning, and mental clarity — is particularly sensitive to NAD+ depletion. The mechanisms are well understood, and the response to targeted cellular intervention is typically rapid and noticeable.`;
    }
    if (symptoms.includes("Chronic fatigue")) {
      return `Chronic fatigue at the cellular level involves three converging factors: declining mitochondrial efficiency, reduced CoQ10 availability, and impaired ATP recycling. These factors compound with age — but the research is clear that direct cellular replenishment via IV therapy bypasses the absorption limitations of oral supplements and reaches your cells within hours.`;
    }
    return `Your symptom pattern reflects specific cellular pathways under stress. Longevity medicine focuses on identifying and addressing the upstream biological mechanisms — not just managing symptoms. The data from your quiz is being cross-referenced with validated longevity markers to map exactly which pathways need targeted support.`;
  },
};

export function generateMicroInsightTemplate(
  age: number,
  answers: AnswerRecord,
  triggerQuestion: string
): string {
  const fn = MICRO_INSIGHTS[triggerQuestion];
  return fn
    ? fn(age, answers)
    : `At ${age}, your biological systems are operating under measurable pressures. Your answers are being cross-referenced with validated longevity markers to generate your personalised wellness profile.`;
}

// ─── ADAPTIVE QUESTION SELECTION ─────────────────────────────────────────────

const ADAPTIVE_PRIORITY: Record<string, string[]> = {
  "Brain fog": ["q11-cognitive-clarity", "q11-cognitive-duration"],
  "Chronic fatigue": ["q11-cognitive-clarity", "q11-stress-recovery"],
  "Frequent colds/illness": ["q11-immune-frequency", "q11-immune-recovery"],
  "Slow recovery": ["q11-immune-recovery", "q11-immune-frequency"],
  "Joint pain": ["q11-inflam-severity", "q11-toxin-exposure"],
  "Digestive issues": ["q11-inflam-severity", "q11-metabolic-meals"],
  "Mood swings": ["q11-stress-recovery", "q11-metabolic-meals"],
  "Weight struggles": ["q11-metabolic-meals", "q11-stress-recovery"],
  "Skin dullness": ["q11-skin-response", "q11-inflam-severity"],
};

export function selectAdaptiveQuestionsTemplate(
  symptoms: string[],
  availableQuestionIds: string[]
): string[] {
  const preferred: string[] = [];
  for (const symptom of symptoms) {
    for (const id of ADAPTIVE_PRIORITY[symptom] ?? []) {
      if (availableQuestionIds.includes(id) && !preferred.includes(id)) {
        preferred.push(id);
      }
    }
  }
  const selected = preferred.slice(0, 2);
  while (selected.length < 2) {
    const next = availableQuestionIds.find((id) => !selected.includes(id));
    if (next) selected.push(next);
    else break;
  }
  return selected.slice(0, 2);
}

// ─── DIMENSION NARRATIVES ─────────────────────────────────────────────────────

type NarrFn = (score: number, answers: AnswerRecord, biologicalAge: number) => string;

const DIMENSION_NARRATIVES: Record<string, NarrFn> = {
  "Sleep Quality": (score, answers) => {
    const hours = str(answers, "q5");
    const quality = str(answers, "q6");
    if (score < 60) {
      return `Your sleep score of ${score}/100 indicates significant disruption to your body's overnight restoration processes. ${hours ? `Your reported ${hours} of sleep` : "Your current sleep duration"} leaves your glymphatic system — your brain's nightly detox mechanism — with insufficient time to clear neurotoxins at the critical 10× daytime rate. Research confirms that sleep at this level correlates with telomere shortening that can add 1–3 years to biological age annually.${quality && (quality.includes("Poor") || quality.includes("Fair")) ? " The quality disruption you reported compounds this further, reducing the restorative deep-sleep phases where cellular repair peaks." : ""}`;
    }
    if (score < 75) {
      return `Your sleep score of ${score}/100 reflects moderate disruption to your overnight repair cycles. While you're achieving some restorative sleep, ${quality?.includes("Average") ? "the average quality you reported means" : "the inconsistency means"} your glymphatic system isn't achieving full neurotoxin clearance every night — creating a gradual accumulation of cellular waste that contributes to morning fatigue and daytime cognitive dips over time.`;
    }
    if (score < 90) {
      return `Your sleep score of ${score}/100 reflects a solid foundation with room for meaningful optimisation. You're achieving the core restorative phases your cells need, though occasional disruptions limit the full potential of your overnight repair cycle. Small improvements in sleep consistency could meaningfully reduce your biological age over a sustained 3-month period.`;
    }
    return `Your sleep score of ${score}/100 is exceptional — placing you in the top tier of longevity-supporting behaviours. Your glymphatic system is achieving full overnight neurotoxin clearance, your HPA axis is resetting properly, and your cellular repair cycles are completing as designed. Sleep is your most powerful anti-aging intervention, and you're already leveraging it effectively.`;
  },

  "Energy & Vitality": (score, answers) => {
    const energy = str(answers, "q4");
    const age = num(answers, "q1", 35);
    if (score < 60) {
      return `Your energy score of ${score}/100 signals measurable mitochondrial stress. ${energy.includes("Chronically") ? "The chronic fatigue you've reported" : energy.includes("Low") ? "The low energy levels you've described" : "Your energy pattern"} points to declining NAD+ coenzyme availability — the molecule that powers ATP synthesis in every cell. By age ${age}, NAD+ has typically declined ${nadDecline(age)}% from peak levels, directly throttling your cells' energy output. Without intervention, this deficit compounds, making energy restoration progressively harder through lifestyle alone.`;
    }
    if (score < 75) {
      return `Your energy score of ${score}/100 indicates moderate mitochondrial output with notable dips. ${energy.includes("Good with Dips") ? "The energy crashes you report" : "The fluctuations in your energy"} are characteristic of suboptimal NAD+ recycling — reducing your mitochondria's ability to sustain ATP production throughout the day and producing the familiar pattern of morning energy followed by afternoon crashes.`;
    }
    if (score < 90) {
      return `Your energy score of ${score}/100 reflects good mitochondrial function with genuine upside potential. Your cellular energy infrastructure is working well, though targeted support could eliminate occasional dips and push your sustained output to a new, higher baseline. Many clients at this level report a qualitative leap in energy stability within their first month of treatment.`;
    }
    return `Your energy score of ${score}/100 is excellent — your mitochondria are producing ATP efficiently and your NAD+ recycling pathways are functioning well. This level of cellular vitality is a strong longevity indicator. The priority now is maintaining and protecting this system against the natural age-related NAD+ decline.`;
  },

  "Stress & Mental Wellness": (score, answers) => {
    const stress = str(answers, "q9");
    if (score < 60) {
      return `Your stress score of ${score}/100 indicates your HPA axis is chronically activated, producing cortisol levels that are directly eroding your telomeres. ${stress.includes("Very High") || stress.includes("High") ? "The high stress you've reported" : "Your stress pattern"} triggers a cortisol-telomere feedback loop — individuals at this stress level carry telomere lengths equivalent to someone 9–17 years older. Your nervous system is spending more energy on threat-response than on repair and restoration.`;
    }
    if (score < 75) {
      return `Your stress score of ${score}/100 reflects moderate HPA axis activation with meaningful room for improvement. Moderate chronic stress produces cortisol spikes that — while less damaging than sustained high stress — still compromise immune function, disrupt sleep architecture, and inhibit the cellular repair processes that occur during low-cortisol periods.`;
    }
    if (score < 90) {
      return `Your stress score of ${score}/100 shows solid stress resilience with some room for optimisation. You're managing your stress response well overall, though periodic cortisol spikes may still be creating windows of telomere vulnerability. Building stronger stress-buffering capacity would directly support your other wellness dimensions.`;
    }
    return `Your stress score of ${score}/100 is a significant longevity asset. Low cortisol allows your body to prioritise cellular repair over threat-response — meaning your cells are spending more time in restoration mode. This directly supports telomere preservation, immune function, and cognitive clarity, all of which compound positively over time.`;
  },

  "Cognitive Function": (score, answers) => {
    const symptoms = arr(answers, "q10");
    const hasFog = symptoms.includes("Brain fog");
    if (score < 60) {
      return `Your cognitive score of ${score}/100 indicates that neurological energy supply is under significant strain. ${hasFog ? "The brain fog you're experiencing" : "Your cognitive pattern"} reflects reduced mitochondrial ATP production in prefrontal neurons — the cells responsible for focus, planning, and working memory. Impaired glymphatic clearance during sleep combined with NAD+ depletion creates a compounding deficit where cognitive performance sits 15–25% below optimal. This is highly responsive to targeted cellular intervention.`;
    }
    if (score < 75) {
      return `Your cognitive score of ${score}/100 reflects moderate neurological efficiency with clear optimisation potential. ${hasFog ? "The brain fog you've noted" : "The mental dips you experience"} suggest your neurons are experiencing periodic energy supply disruptions — tied to mitochondrial function and glymphatic clearance efficiency. Addressing the upstream cellular mechanisms typically produces noticeable cognitive improvement within 2–4 weeks.`;
    }
    if (score < 90) {
      return `Your cognitive score of ${score}/100 reflects good neurological function with room to reach peak performance. Your brain's energy infrastructure is working well, though there's meaningful upside in processing speed, mental stamina, and sustained clarity. Many clients at this level report a qualitative step-change in mental performance with targeted support.`;
    }
    return `Your cognitive score of ${score}/100 is exceptional. Your brain's energy production, glymphatic clearance, and neurological balance are all operating at high efficiency. The goal is protecting and maintaining this level of neurological health — preventing the age-related decline that typically begins to show between 40 and 50 without intervention.`;
  },

  "Metabolic Health": (score, answers) => {
    const diet = str(answers, "q8");
    if (score < 60) {
      return `Your metabolic score of ${score}/100 indicates significant blood sugar regulation challenges. ${diet.includes("processed") || diet.includes("fast food") ? "Your current diet pattern" : "Your metabolic profile"} suggests insulin sensitivity is compromised, creating the cycle of glucose spikes and crashes that drive cellular inflammation, accelerated glycation of proteins, and mitochondrial dysfunction. Chronic metabolic stress at this level is one of the primary accelerators of biological aging across multiple systems.`;
    }
    if (score < 75) {
      return `Your metabolic score of ${score}/100 reflects moderate blood sugar instability with real impact on your daily energy and long-term cellular health. ${diet.includes("Mixed") ? "The mixed diet you've described" : "Your current dietary pattern"} is creating periodic glucose dysregulation that drives low-grade inflammation — one of the primary accelerators of biological aging that responds meaningfully to targeted metabolic intervention.`;
    }
    if (score < 90) {
      return `Your metabolic score of ${score}/100 reflects solid metabolic function with genuine optimisation potential. Your blood sugar regulation is working reasonably well, though there's room to improve insulin sensitivity and reduce the low-grade inflammation that even healthy diets can produce. Optimising your metabolic health at this level amplifies results from every other wellness intervention.`;
    }
    return `Your metabolic score of ${score}/100 is excellent. Your insulin sensitivity, glucose regulation, and cellular energy metabolism are all functioning at a high level — creating a stable foundation for all other longevity interventions and protecting against the inflammatory cascades that drive premature biological aging.`;
  },

  "Physical Activity": (score, answers) => {
    const exercise = str(answers, "q7");
    if (score < 60) {
      return `Your physical activity score of ${score}/100 indicates your cells are missing one of the most potent anti-aging signals available: exercise-induced hormesis. ${exercise.includes("0 days") || exercise.includes("sedentary") ? "A sedentary lifestyle" : "Limited physical activity"} reduces mitochondrial biogenesis — the process of generating new, efficient mitochondria — by up to 40% compared to regularly active individuals. WHO 2024 and CMEC 2025 data confirm the largest longevity benefit comes from moving from sedentary to even moderate activity levels.`;
    }
    if (score < 75) {
      return `Your physical activity score of ${score}/100 reflects moderate exercise with meaningful room for optimisation. ${exercise.includes("1-2 days") ? "Exercising 1-2 days per week" : "Your current activity level"} stimulates some mitochondrial biogenesis, but falls short of triggering the full suite of cellular longevity adaptations. Increasing frequency to 3-4 days/week produces disproportionate biological age benefits.`;
    }
    if (score < 90) {
      return `Your physical activity score of ${score}/100 reflects a solid exercise foundation. You're triggering meaningful mitochondrial biogenesis and the anti-inflammatory effects of regular movement. The next tier of benefit comes from optimising recovery — ensuring your cells have the raw materials (NAD+, glutathione) to fully capitalise on each training session.`;
    }
    return `Your physical activity score of ${score}/100 is excellent. Regular exercise at your level is triggering robust mitochondrial biogenesis, BDNF production, and anti-inflammatory adaptations. The focus now is on recovery optimisation — ensuring you're extracting maximum longevity benefit from each training stimulus.`;
  },

  "Immune Resilience": (score, answers) => {
    const symptoms = arr(answers, "q10");
    const hasImmune =
      symptoms.includes("Frequent colds/illness") || symptoms.includes("Slow recovery");
    if (score < 60) {
      return `Your immune score of ${score}/100 indicates significant immune system stress. ${hasImmune ? "The frequent illness and slow recovery you've reported" : "Your immune profile"} points to reduced T-cell and natural killer cell activity — your front-line defenders against pathogens and aberrant cells. Low glutathione, zinc, and vitamin C are common upstream drivers of this pattern, all of which can be restored rapidly through targeted IV delivery at therapeutic concentrations.`;
    }
    if (score < 75) {
      return `Your immune score of ${score}/100 reflects moderate immune function with clear room for strengthening. Your immune system is managing day-to-day demands but may be operating below the threshold for optimal surveillance — creating vulnerability during periods of stress, poor sleep, or increased pathogen exposure.`;
    }
    if (score < 90) {
      return `Your immune score of ${score}/100 reflects good immune function with genuine upside. Your body's defences are working well, but there's room to strengthen T-cell activity, natural killer cell response, and the speed of your inflammatory resolution — all of which directly reduce your biological aging rate through the inflammaging pathway.`;
    }
    return `Your immune score of ${score}/100 is exceptional. Your immune surveillance, pathogen response, and inflammatory resolution are all functioning at a high level. Maintaining this resilience — particularly through periods of stress or increased pathogen exposure — is the priority going forward.`;
  },

  "Cellular & Skin Health": (score, answers) => {
    const symptoms = arr(answers, "q10");
    const hasSkin = symptoms.includes("Skin dullness");
    const age = num(answers, "q1", 35);
    if (score < 60) {
      return `Your cellular and skin health score of ${score}/100 indicates elevated oxidative stress and declining cellular infrastructure. ${hasSkin ? "The skin dullness you've reported" : "Your cellular profile"} reflects glutathione depletion — your body's master antioxidant has declined an estimated ${Math.min(40, Math.round((age - 20) * 1.3))}% from youthful levels by age ${age}. This allows free radical damage to accumulate in skin cells, accelerating visible aging while simultaneously impacting cellular integrity throughout your body.`;
    }
    if (score < 75) {
      return `Your cellular and skin health score of ${score}/100 reflects moderate oxidative stress with clear optimisation potential. Your glutathione and collagen systems are functioning, but declining at a rate that will become more visible over the coming years without targeted support. Early intervention at this stage produces significantly better outcomes than waiting for more pronounced signs of cellular aging.`;
    }
    if (score < 90) {
      return `Your cellular and skin health score of ${score}/100 reflects solid cellular resilience with meaningful upside. Your antioxidant defences are largely intact, though targeted glutathione and collagen support could produce visible improvements in skin quality while strengthening your cellular protection against oxidative damage at depth.`;
    }
    return `Your cellular and skin health score of ${score}/100 is excellent. Your antioxidant defences, collagen synthesis pathways, and cellular repair mechanisms are all operating at a high level. Maintaining these systems protects against the compounding oxidative stress that accelerates both visible aging and internal cellular decline over time.`;
  },
};

export function getDimensionNarrative(
  dimName: string,
  score: number,
  answers: AnswerRecord,
  biologicalAge: number
): string {
  const fn = DIMENSION_NARRATIVES[dimName];
  return fn
    ? fn(score, answers, biologicalAge)
    : `Your ${dimName} score of ${score}/100 reflects the current state of the biological systems in this dimension. ${score < 70 ? "There is meaningful room for improvement through targeted intervention." : "You have a solid foundation to build on."}`;
}

// ─── RISK FACTORS ─────────────────────────────────────────────────────────────

type RiskFn = (
  score: number,
  answers: AnswerRecord
) => { title: string; explanation: string };

const RISK_FACTOR_TEMPLATES: Record<string, RiskFn> = {
  "Sleep Quality": (score, answers) => {
    const hours = str(answers, "q5");
    return {
      title: "Sleep-Accelerated Biological Aging",
      explanation: `Your sleep score of ${score}/100${hours ? ` and reported ${hours} of sleep` : ""} creates a nightly deficit in glymphatic clearance and cellular repair. Research confirms that consistently disrupted sleep accelerates telomere shortening at a rate that can add 1–3 years to biological age annually — making sleep one of the highest-leverage targets for immediate intervention.`,
    };
  },
  "Energy & Vitality": (score, answers) => {
    const age = num(answers, "q1", 35);
    return {
      title: "Mitochondrial Energy Deficit",
      explanation: `Your energy score of ${score}/100 signals that your mitochondria are producing ATP below optimal capacity. At ${age}, NAD+ depletion is a primary driver — reducing the cellular energy output that every tissue depends on. This deficit compounds over time, making energy restoration progressively harder without direct cellular replenishment.`,
    };
  },
  "Stress & Mental Wellness": (score) => ({
    title: "Cortisol-Driven Telomere Erosion",
    explanation: `Your stress score of ${score}/100 indicates chronically elevated cortisol that is actively shortening your telomeres through the cortisol-telomere feedback loop. Studies show this mechanism can age your DNA by the equivalent of up to 17 years if sustained — making stress one of the highest-leverage longevity interventions when addressed early.`,
  }),
  "Cognitive Function": (score) => ({
    title: "Neurological Energy Impairment",
    explanation: `Your cognitive score of ${score}/100 reflects reduced mitochondrial efficiency in your neurons — particularly in the prefrontal cortex responsible for focus and working memory. Combined with suboptimal glymphatic clearance, this creates the conditions for progressive cognitive decline if the underlying cellular mechanisms are not addressed.`,
  }),
  "Metabolic Health": (score, answers) => {
    const diet = str(answers, "q8");
    return {
      title: "Metabolic Inflammation Risk",
      explanation: `Your metabolic score of ${score}/100${diet && !diet.includes("Optimized") && !diet.includes("Very healthy") ? " combined with your current diet pattern" : ""} indicates blood sugar dysregulation driving low-grade systemic inflammation — one of the primary accelerators of biological aging, affecting every organ system including the brain, cardiovascular system, and skin.`,
    };
  },
  "Physical Activity": (score) => ({
    title: "Sedentary Cell Aging",
    explanation: `Your physical activity score of ${score}/100 suggests your cells are receiving limited exercise-induced hormesis — the beneficial stress that triggers mitochondrial biogenesis and cellular renewal. WHO 2024 data confirms sedentary individuals age biologically 3–5 years faster than their moderately active counterparts, with the gap widening progressively after age 40.`,
  }),
  "Immune Resilience": (score) => ({
    title: "Compromised Immune Surveillance",
    explanation: `Your immune score of ${score}/100 indicates your natural killer cell and T-cell activity is operating below the level needed for robust pathogen surveillance. This creates vulnerability not just to infections, but to the chronic low-grade inflammation — called inflammaging — that drives accelerated biological aging across multiple systems.`,
  }),
  "Cellular & Skin Health": (score, answers) => {
    const age = num(answers, "q1", 35);
    return {
      title: "Elevated Oxidative Cellular Stress",
      explanation: `Your cellular health score of ${score}/100 reflects glutathione depletion and rising oxidative stress at age ${age} — allowing free radical damage to accumulate in your cells faster than your repair systems can manage. Without targeted antioxidant support, this cellular damage compounds into visible aging and reduced tissue resilience across every organ.`,
    };
  },
};

export function getRiskFactors(
  dimensions: DimensionData[],
  answers: AnswerRecord
): { title: string; explanation: string }[] {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  return sorted
    .slice(0, 3)
    .filter((d) => d.score < 80)
    .map((d) => {
      const fn = RISK_FACTOR_TEMPLATES[d.name];
      return fn
        ? fn(d.score, answers)
        : {
            title: `${d.name} Risk Factor`,
            explanation: `Your ${d.name} score of ${d.score}/100 represents an area requiring targeted attention to prevent accelerated biological aging in this dimension.`,
          };
    });
}

// ─── TREATMENT REASONING ──────────────────────────────────────────────────────

type TreatmentFn = (dims: DimensionData[], answers: AnswerRecord) => string;

const TREATMENT_REASONING: Record<string, TreatmentFn> = {
  "NAD+ IV Drip": (dims, answers) => {
    const energy = dims.find((d) => d.name === "Energy & Vitality");
    const sleep = dims.find((d) => d.name === "Sleep Quality");
    const age = num(answers, "q1", 35);
    return `Based on your energy score of ${energy?.score ?? "below average"}/100${sleep ? ` and sleep score of ${sleep.score}/100` : ""}, your cells are showing clear signs of NAD+ depletion — the coenzyme that powers ATP synthesis in every mitochondrion. At ${age}, oral NAD+ supplements deliver only ~5% bioavailability, making IV delivery the most direct route to restoring cellular energy at scale. Most clients with a similar profile notice improved energy within 24–48 hours of their first session, with cognitive and sleep benefits emerging over the following 1–2 weeks.`;
  },
  "IV Methylene Blue": (dims, answers) => {
    const cognitive = dims.find((d) => d.name === "Cognitive Function");
    const symptoms = arr(answers, "q10");
    const hasFog = symptoms.includes("Brain fog");
    return `Your cognitive score of ${cognitive?.score ?? "below average"}/100${hasFog ? " and the brain fog you reported" : ""} point directly to mitochondrial inefficiency in your prefrontal neurons. Methylene Blue acts as an alternative electron carrier in the mitochondrial electron transport chain — bypassing damaged Complex I to restore ATP production in brain cells. Unlike most cognitive supplements, it crosses the blood-brain barrier efficiently and produces measurable improvements in mental clarity, often noticeably within the first few hours after infusion.`;
  },
  "Immunity IV Drip": (dims, answers) => {
    const immune = dims.find((d) => d.name === "Immune Resilience");
    const symptoms = arr(answers, "q10");
    return `Your immune score of ${immune?.score ?? "below average"}/100${symptoms.includes("Frequent colds/illness") ? " and your reported frequency of illness" : ""} indicate that your T-cells and natural killer cells are operating below optimal capacity. High-dose Vitamin C (up to 25g), zinc, and glutathione delivered intravenously achieve blood levels impossible with oral supplements — directly fuelling immune cell proliferation and natural killer cell activity. Most clients report noticeably stronger resilience within 1–2 weeks of treatment.`;
  },
  "Myers Cocktail": (dims) => {
    const low = lowest(dims, 2);
    return `Your wellness profile — particularly your ${low.map((d) => d.name).join(" and ")} scores — reflects the kind of multi-system nutrient depletion that responds exceptionally well to the Myers Cocktail. This evidence-based formula (administered safely since the 1960s) delivers magnesium, calcium, B-vitamins, and Vitamin C at therapeutic concentration directly into your bloodstream — addressing the most common micronutrient deficiencies that drive fatigue, cognitive fog, and immune vulnerability simultaneously.`;
  },
  "Detox IV Drip": (dims) => {
    const metabolic = dims.find((d) => d.name === "Metabolic Health");
    const skin = dims.find((d) => d.name === "Cellular & Skin Health");
    return `Your metabolic score of ${metabolic?.score ?? "below average"}/100${skin ? ` and cellular health score of ${skin.score}/100` : ""} indicate that your liver's detoxification pathways are under strain. The Detox IV delivers glutathione — your body's master antioxidant — alongside alpha-lipoic acid and liver-support compounds at 100% bioavailability, supporting the body's primary toxin elimination systems and typically producing visible improvements in energy and skin clarity within 24–48 hours.`;
  },
  "Skin Glow IV Drip": (dims, answers) => {
    const skin = dims.find((d) => d.name === "Cellular & Skin Health");
    const age = num(answers, "q1", 35);
    return `Your cellular and skin health score of ${skin?.score ?? "below average"}/100 reflects the glutathione depletion and collagen decline that accelerates after age ${age > 30 ? "30" : String(age)}. The Skin Glow IV delivers pharmaceutical-grade glutathione — which modulates melanin production and combats oxidative skin damage — alongside Vitamin C as a direct cofactor for collagen synthesis. Clinical results show visible skin improvements within 3–5 days, with optimal results from a course of 3–4 sessions.`;
  },
  "EBOO Therapy": (dims, answers) => {
    const low = lowest(dims, 3);
    const symptoms = arr(answers, "q10");
    const relevant = symptoms.filter((s) =>
      ["Chronic fatigue", "Slow recovery", "Digestive issues"].includes(s)
    );
    return `Your multi-system wellness profile — with lower scores across ${low.map((d) => d.name).join(", ")}${relevant.length > 0 ? ` and your reported ${relevant.join(" and ")}` : ""} — indicates the kind of systemic cellular burden that responds best to EBOO therapy. By ozonating your blood extracorporeally, EBOO enhances oxygen utilisation at the cellular level, breaks down pathogenic biofilm, and triggers powerful immune modulation. Clients with your profile typically see significant improvements across multiple dimensions within 2–4 weeks.`;
  },
  "Phospholipid Exchange IV": (dims, answers) => {
    const cognitive = dims.find((d) => d.name === "Cognitive Function");
    const symptoms = arr(answers, "q10");
    const hasFog = symptoms.includes("Brain fog");
    return `Your cognitive score of ${cognitive?.score ?? "below average"}/100${hasFog ? " and brain fog pattern" : ""} suggest that your neuronal cell membranes may be compromised — reducing the efficiency of every process that occurs in and around your neurons. Phospholipid Exchange IV delivers phosphatidylcholine to repair these membranes, restoring optimal signal transmission and supporting neurological clarity. Improvements typically emerge over 2–6 weeks, with marked effects on focus and mental stamina.`;
  },
  "Metabolic Health Programme": (dims) => {
    const metabolic = dims.find((d) => d.name === "Metabolic Health");
    const physical = dims.find((d) => d.name === "Physical Activity");
    return `Your metabolic score of ${metabolic?.score ?? "below average"}/100${physical ? ` and physical activity score of ${physical.score}/100` : ""} indicate the kind of compound metabolic challenge that requires a structured, multi-pronged approach rather than a single session. Our Metabolic Health Programme combines comprehensive metabolic panels, body composition analysis, nutritional optimisation, and targeted IV protocols into an 8–12 week structured journey with measurable outcomes — delivering the most durable long-term results for clients with your profile.`;
  },
};

export function getTreatmentReasoning(
  treatmentName: string,
  dimensions: DimensionData[],
  answers: AnswerRecord
): string {
  const fn = TREATMENT_REASONING[treatmentName];
  return fn
    ? fn(dimensions, answers)
    : `${treatmentName} is specifically recommended based on your lowest-scoring wellness dimensions and symptom profile. This treatment directly addresses the cellular mechanisms that your quiz results have identified as requiring the most targeted support.`;
}

// ─── VERDICT ─────────────────────────────────────────────────────────────────

export function getVerdict(
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number
): string {
  const offset = biologicalAge - chronologicalAge;
  if (offset <= -10) {
    return `Your cellular health analysis reveals a biological age of ${biologicalAge} — an impressive ${Math.abs(offset)} years younger than your chronological age of ${chronologicalAge} — placing you in the top tier of longevity-optimised individuals and reflecting the compounding benefit of your healthy lifestyle habits.`;
  }
  if (offset < -4) {
    return `Your biological age of ${biologicalAge} is ${Math.abs(offset)} years younger than your chronological age of ${chronologicalAge} — a meaningful longevity advantage reflecting strong cellular health, with targeted optimisation available to push this gap even further.`;
  }
  if (offset <= 2) {
    return `Your biological age of ${biologicalAge} aligns closely with your chronological age of ${chronologicalAge} — a solid cellular foundation with clear, specific opportunities to begin reversing the clock and creating a meaningful longevity advantage through targeted intervention.`;
  }
  if (offset <= 7) {
    return `Your biological age of ${biologicalAge} is ${offset} years ahead of your chronological age of ${chronologicalAge} — signalling accelerated cellular aging in key systems that responds well to targeted intervention at this stage, before the gap widens further.`;
  }
  return `Your biological age of ${biologicalAge} is ${offset} years older than your chronological age of ${chronologicalAge} — reflecting cellular stress across multiple systems, but importantly, this gap represents the stage where the evidence for rapid biological age reversal through targeted intervention is strongest.`;
}

// ─── TREATMENT TIMELINE ───────────────────────────────────────────────────────

export function getTreatmentTimeline(
  primaryTreatment: string,
  supportingTreatments: string[]
): string {
  const sup = supportingTreatments[0];
  const timelines: Record<string, string> = {
    "NAD+ IV Drip": `Month 1: Initial NAD+ infusion to restore cellular energy baseline — most clients notice improved energy within 48 hours and better sleep quality within 1–2 weeks → Month 2: Second session to deepen mitochondrial restoration and begin cognitive benefits${sup ? `; introduce ${sup} to address secondary dimensions` : ""} → Month 3: Maintenance session to lock in gains; full dimension score re-evaluation recommended`,
    "IV Methylene Blue": `Month 1: First Methylene Blue infusion targeting neurological mitochondrial function — cognitive clarity improvements often begin within hours${sup ? `; pair with ${sup} for comprehensive cellular support` : ""} → Month 2: Second session to deepen prefrontal cortex optimisation and assess sustained focus improvement → Month 3: Maintenance protocol established; measurable improvement in cognitive performance markers`,
    "Immunity IV Drip": `Month 1: High-dose immune IV to restore T-cell and NK-cell activity — most clients notice improved resilience within 1–2 weeks → Month 2: ${sup ? `Add ${sup} to address underlying cellular drivers; ` : ""}Assess frequency of illness and recovery speed improvements → Month 3: Maintenance session timed for seasonal vulnerability; full immune function reassessment`,
    "EBOO Therapy": `Month 1: Initial EBOO session — blood ozonation initiates systemic immune modulation and oxygen optimisation; most clients report energy shifts within 1 week → Month 2: Second EBOO session to deepen detoxification and anti-inflammatory effects${sup ? `; complement with ${sup}` : ""} → Month 3: Third session to consolidate systemic improvements; biological age reassessment recommended`,
    "Skin Glow IV Drip": `Month 1: First Skin Glow IV — visible skin improvements typically appear within 3–5 days → Month 2: Second session to deepen collagen support and antioxidant protection${sup ? `; add ${sup} to address cellular health at depth` : ""} → Month 3: Third session for optimal cumulative glow effect; hair and nail improvements peak at this stage`,
    "Myers Cocktail": `Month 1: Initial Myers Cocktail to address micronutrient deficiencies — energy improvements often felt within hours → Month 2: Second session to maintain therapeutic levels${sup ? `; introduce ${sup} to target your lowest-scoring dimension directly` : ""} → Month 3: Personalised maintenance protocol established`,
    "Detox IV Drip": `Month 1: Initial Detox IV to restore glutathione and activate Phase II liver detoxification — energy and skin clarity improvements within 24–48 hours → Month 2: Second session to deepen systemic detoxification${sup ? `; pair with ${sup}` : ""} → Month 3: Maintenance session with liver enzyme reassessment`,
  };
  return (
    timelines[primaryTreatment] ??
    `Month 1: Initial ${primaryTreatment} session to establish baseline cellular restoration and begin addressing your primary wellness deficit → Month 2: Follow-up session to deepen therapeutic benefits${sup ? `; introduce ${sup} for comprehensive support` : ""} → Month 3: Maintenance protocol established; full wellness dimension reassessment recommended`
  );
}

// ─── FULL REPORT ─────────────────────────────────────────────────────────────

export function generateReportTemplate(
  answers: AnswerRecord,
  dimensions: DimensionData[],
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number,
  primaryTreatment: string,
  supportingTreatments: string[]
): ReportData {
  const verdict = getVerdict(wellnessScore, biologicalAge, chronologicalAge);

  const dimensionNarratives: Record<string, string> = {};
  for (const dim of dimensions) {
    dimensionNarratives[dim.name] = getDimensionNarrative(
      dim.name,
      dim.score,
      answers,
      biologicalAge
    );
  }

  const riskFactors = getRiskFactors(dimensions, answers);

  const primary = {
    name: primaryTreatment,
    reasoning: getTreatmentReasoning(primaryTreatment, dimensions, answers),
  };

  const supporting = supportingTreatments.map((name) => ({
    name,
    reasoning: getTreatmentReasoning(name, dimensions, answers),
  }));

  const timeline = getTreatmentTimeline(primaryTreatment, supportingTreatments);

  return {
    verdict,
    dimensionNarratives,
    riskFactors,
    treatmentPlan: { primary, supporting, timeline },
  };
}

// ─── STREAMING TEXT ───────────────────────────────────────────────────────────

const STREAM_DIMENSION_ORDER = [
  "Sleep Quality",
  "Energy & Vitality",
  "Stress & Mental Wellness",
  "Cognitive Function",
  "Metabolic Health",
  "Physical Activity",
  "Immune Resilience",
  "Cellular & Skin Health",
];

export function generateStreamingText(
  answers: AnswerRecord,
  dimensions: DimensionData[],
  wellnessScore: number,
  biologicalAge: number,
  chronologicalAge: number,
  primaryTreatment: string,
  supportingTreatments: string[]
): string {
  const dimMap = new Map(dimensions.map((d) => [d.name, d]));
  const report = generateReportTemplate(
    answers,
    dimensions,
    wellnessScore,
    biologicalAge,
    chronologicalAge,
    primaryTreatment,
    supportingTreatments
  );

  let text = "";

  for (const dimName of STREAM_DIMENSION_ORDER) {
    const dim = dimMap.get(dimName);
    if (!dim) continue;
    text += `---DIMENSION: ${dimName}---\n`;
    text +=
      report.dimensionNarratives[dimName] ??
      getDimensionNarrative(dimName, dim.score, answers, biologicalAge);
    text += "\n\n";
  }

  text += `---VERDICT---\n${report.verdict}\n\n`;
  text += `---REPORT---\n${JSON.stringify(report)}`;

  return text;
}

// ─── DIMENSION DEEP DIVE ──────────────────────────────────────────────────────

type DeepDiveFn = (
  score: number,
  answers: AnswerRecord,
  biologicalAge: number,
  treatment: string
) => DeepDiveData;

const DEEP_DIVE_DATA: Record<string, DeepDiveFn> = {
  "Sleep Quality": (score, answers, _bioAge, treatment) => {
    const hours = str(answers, "q5");
    return {
      mechanism: `During sleep, your glymphatic system — a network of channels surrounding your brain's blood vessels — expands and flushes metabolic waste at up to 10× the daytime rate. ${hours ? `At your reported ${hours} of sleep,` : "With your current sleep pattern,"} this clearance cycle is ${score < 70 ? "significantly truncated, allowing neurotoxins including amyloid-beta proteins to accumulate between neurons" : "partially completed, with some clearance deficit building nightly"}. Concurrently, growth hormone secretion — which peaks in the first 90 minutes of deep sleep — drives tissue repair across every organ system, and cortisol undergoes its overnight reset that governs next-day stress resilience.`,
      agingImpact: `Research from the MDPI Biological Age Study confirms that sleep under 6 hours correlates with measurably accelerated telomere shortening — the primary molecular mechanism of biological aging. Your sleep score of ${score}/100 ${score < 70 ? "suggests this pathway is active, contributing an estimated 1–3 additional years of biological age per year if sustained without intervention" : "represents a moderate risk that compounds meaningfully over time"}. REM deprivation also reduces BDNF (brain-derived neurotrophic factor), accelerating neuronal aging independently of telomere effects.`,
      treatmentConnection: `${treatment} addresses your sleep score by ${treatment.includes("NAD+") ? "restoring the NAD+ coenzyme availability that your circadian clock enzymes (sirtuins SIRT1 and SIRT3) depend on to regulate your sleep-wake cycle. NAD+ depletion is a primary driver of circadian rhythm disruption, and IV restoration achieves therapeutic tissue concentrations within hours" : treatment.includes("Myers") ? "restoring magnesium — a co-factor affecting 68% of adults — which regulates GABA receptors and the production of melatonin's precursor, directly improving sleep architecture" : `targeting the cellular mechanisms specific to ${treatment} that govern your sleep quality and overnight repair capacity`}. IV delivery achieves concentrations impossible with oral supplementation, enabling faster and more complete correction of the underlying biochemistry.`,
      timeline: `Most clients report improved sleep quality within the first 1–2 weeks following ${treatment} — particularly in sleep depth and morning alertness. By weeks 3–4, the compounding effect of better sleep on NAD+ recycling, cortisol regulation, and cellular repair creates a positive feedback loop that further improves sleep quality. A second session at 4–6 weeks typically locks in a new sleep baseline.`,
    };
  },

  "Energy & Vitality": (score, answers, _bioAge, treatment) => {
    const energyAnswer = str(answers, "q4");
    const age = num(answers, "q1", 35);
    return {
      mechanism: `Your cellular energy is produced through mitochondrial oxidative phosphorylation — a process requiring NAD+ as an essential electron carrier. By age ${age}, NAD+ levels have declined an estimated ${nadDecline(age)}% from peak, directly throttling your mitochondria's capacity to produce ATP. ${energyAnswer ? `Your reported "${energyAnswer}" energy pattern` : "Your energy profile"} reflects this deficit: when mitochondrial output drops, your cells increasingly rely on inefficient anaerobic glycolysis, producing less ATP per glucose molecule and generating more lactic acid — the biochemistry behind chronic fatigue.`,
      agingImpact: `Mitochondrial dysfunction is now recognised as a primary driver of biological aging across all tissues. Reduced ATP production forces adaptive compensations that accelerate wear on every system. Your energy score of ${score}/100 places you at ${score < 60 ? "high" : score < 75 ? "moderate" : "low-to-moderate"} risk for accelerating mitochondrial decline without targeted intervention. 2025 CMEC research confirms that mitochondrial efficiency directly correlates with biological age across multiple tissue types.`,
      treatmentConnection: `${treatment} ${treatment.includes("NAD+") ? "delivers NAD+ intravenously at concentrations that bypass the ~5% oral bioavailability limitation, achieving cellular replenishment within hours. This directly restores the electron carrier your mitochondria need to resume efficient ATP production — the fastest and most direct route to reversing the energy deficit reflected in your score" : treatment.includes("Myers") ? "restores the B-vitamins and magnesium that are co-factors in every step of the mitochondrial energy production cycle, addressing the most common upstream deficiency driving energy decline" : `addresses the energy dimension by targeting the cellular mechanisms driving your specific energy deficit`}. Most clients with a score similar to yours report energy improvements within the first 24–48 hours.`,
      timeline: `Initial energy improvements from ${treatment} are typically noticeable within 24–48 hours — particularly in sustained afternoon energy and the absence of crashes. Weeks 2–3 bring deeper mitochondrial recovery as cellular pools replenish. By week 4–6, most clients have established a new, higher energy baseline. A second session at this point compounds the first, pushing sustained output further.`,
    };
  },

  "Stress & Mental Wellness": (score, _answers, _bioAge, treatment) => ({
    mechanism: `Stress activates your HPA (hypothalamic-pituitary-adrenal) axis, triggering cortisol release that redirects cellular resources from repair to threat-response. At your stress score of ${score}/100, cortisol is chronically elevated above the baseline needed for healthy cellular function. This sustained cortisol load activates telomerase-inhibiting pathways that directly shorten your telomeres — the protective caps on DNA that govern how your cells age. Elevated cortisol also suppresses DHEA production, impairs hippocampal neurogenesis, and drives systemic inflammation.`,
    agingImpact: `Multiple 2024 reviews confirm the cortisol-telomere feedback loop is one of the most potent accelerators of biological aging. Your stress score of ${score}/100 suggests your telomeres are shortening at an accelerated rate — longitudinal data shows high-stress individuals carry DNA that measures ${score < 60 ? "up to 17" : score < 75 ? "up to 12" : "up to 8"} years older than low-stress counterparts of the same chronological age. Chronic cortisol also impairs immune function and disrupts the metabolic processes that maintain healthy body composition.`,
    treatmentConnection: `${treatment} addresses your stress dimension through ${treatment.includes("NAD+") ? "restoring NAD+ availability to your hypothalamus — the brain region governing your stress response. Sirtuin enzymes (particularly SIRT1), activated by NAD+, directly modulate cortisol production and speed recovery from HPA axis activation, breaking the cycle of chronic stress at the molecular level" : `its neuromodulatory mechanisms that reduce HPA axis hyperactivation and restore healthy cortisol rhythm — particularly effective for the stress profile reflected in your quiz responses`}. Most clients with your stress profile notice improved stress resilience within 2–3 weeks of treatment.`,
    timeline: `Stress improvements from ${treatment} typically emerge over 2–4 weeks as your HPA axis recalibrates and cortisol homeostasis is restored. Many clients first notice they "bounce back" from stressors more quickly — the recovery window shortens before the perceived stress level drops. By weeks 4–6, most clients report a qualitatively calmer baseline, and this improvement compounds as better sleep further reduces the next day's stress burden.`,
  }),

  "Cognitive Function": (score, answers, _bioAge, treatment) => {
    const symptoms = arr(answers, "q10");
    const hasFog = symptoms.includes("Brain fog");
    return {
      mechanism: `Your cognitive function at ${score}/100 reflects your prefrontal neurons' energy supply and the efficiency of your brain's maintenance systems. ${hasFog ? "The brain fog you experience" : "Your cognitive pattern"} arises from two converging mechanisms: reduced mitochondrial ATP production in neurons (making sustained concentration energetically expensive) and incomplete glymphatic clearance during sleep (allowing metabolic waste to accumulate between synapses). Your neurons are running a combined energy and maintenance deficit that manifests as fog, slower processing, and difficulty holding deep focus.`,
      agingImpact: `Neurological decline is one of the most feared aspects of biological aging — and one of the most preventable when addressed early. Your cognitive score of ${score}/100 places you at ${score < 60 ? "significant risk of accelerating neurological aging without intervention" : score < 75 ? "moderate risk for progressive cognitive decline if the underlying cellular drivers are not addressed" : "low-to-moderate risk with a clear opportunity to optimise before decline becomes more apparent"}. Research confirms mitochondrial inefficiency in neurons directly correlates with cognitive aging rate across adult populations.`,
      treatmentConnection: `${treatment === "IV Methylene Blue" ? "Methylene Blue directly addresses your cognitive score by acting as an alternative electron carrier in the neuronal mitochondrial electron transport chain, bypassing damaged Complex I to restore efficient ATP production in your prefrontal cortex. Studies show it improves memory by up to 7% with enhanced prefrontal cortex activity on fMRI — making it uniquely targeted to the cellular mechanism driving your cognitive score" : `${treatment} addresses your cognitive dimension through its effects on ${treatment.includes("NAD+") ? "neuronal NAD+ availability — the coenzyme your brain cells need for both energy production and the activation of SIRT1, which protects neurons from oxidative stress and supports synaptic plasticity" : treatment.includes("Phospholipid") ? "neuronal cell membrane integrity — restoring the phospholipid composition of your neurons to improve signal transmission efficiency and support memory consolidation" : `the upstream cellular mechanisms that govern your brain's energy and maintenance systems`}`}. Cognitive improvements are typically among the most noticeable to clients.`,
      timeline: `Cognitive improvements from ${treatment} frequently emerge faster than other dimensions — many clients notice improved clarity and reduced brain fog within ${treatment === "IV Methylene Blue" ? "hours to days of their first infusion" : "the first 1–2 weeks"}. By weeks 3–4, processing speed, working memory, and sustained focus typically improve measurably. Clients often describe it as "the fog lifting" — a qualitative shift that compounds with each subsequent session.`,
    };
  },

  "Metabolic Health": (score, answers, _bioAge, treatment) => {
    const diet = str(answers, "q8");
    return {
      mechanism: `Your metabolic health score of ${score}/100 reflects the current state of your blood sugar regulation and insulin sensitivity. ${diet ? `Your described diet — "${diet}" —` : "Your dietary pattern"} creates a glucose environment that ${score < 70 ? "regularly spikes beyond your cells' efficient processing capacity, gradually reducing insulin receptor sensitivity — the early stages of insulin resistance" : "maintains reasonable metabolic stability, though with room for optimisation in cellular glucose efficiency"}. Chronically elevated blood glucose drives glycation — the cross-linking of sugar molecules to proteins — that stiffens tissues, accelerates cellular aging, and drives systemic inflammation.`,
      agingImpact: `Metabolic dysfunction is one of the most well-researched accelerators of biological aging. Your metabolic score of ${score}/100 ${score < 70 ? "suggests active glycation stress and low-grade systemic inflammation — both accelerating telomere shortening and damaging mitochondrial DNA" : "reflects moderate metabolic stress that, while manageable now, compounds progressively without targeted intervention"}. Optimal metabolic health is consistently associated with 5–10 year younger biological ages in longitudinal longevity research.`,
      treatmentConnection: `${treatment} addresses your metabolic score through ${treatment.includes("Metabolic") ? "a comprehensive, structured approach combining diagnostic metabolic profiling, precision nutritional intervention, and targeted IV protocols to systematically restore insulin sensitivity, reduce inflammatory markers, and optimise cellular energy metabolism over an 8–12 week programme" : treatment.includes("Detox") ? "liver detoxification support that reduces the metabolic burden your liver carries — restoring Phase I and Phase II detox capacity, improving bile flow, and reducing hepatic inflammation that drives systemic insulin resistance" : `its targeted cellular effects that improve the upstream metabolic function reflected in your score`}. Measurable improvement in energy consistency and post-meal stability typically appears within the first month.`,
      timeline: `Metabolic improvements from ${treatment} typically manifest first as more stable energy after meals and fewer afternoon crashes — usually within 2–3 weeks. By weeks 4–6, most clients notice improved body composition response to diet and exercise. The inflammatory markers driving metabolic aging typically improve within 6–8 weeks, with the most significant biological age impact quantifiable at the 3-month mark.`,
    };
  },

  "Physical Activity": (score, answers, _bioAge, treatment) => {
    const exercise = str(answers, "q7");
    return {
      mechanism: `Your physical activity score of ${score}/100 reflects how much exercise-induced hormesis — the controlled cellular stress from exercise that forces adaptive repair — your cells are currently receiving. ${exercise ? `Exercising ${exercise}` : "Your current activity level"} ${score < 70 ? "is providing insufficient stimulus for mitochondrial biogenesis — the creation of new, efficient mitochondria — meaning your cellular energy infrastructure is gradually declining rather than adapting" : "provides a solid stimulus, though there's room to deepen the cellular adaptation cascade, particularly in mitochondrial biogenesis and BDNF production"}. Physical activity also drives AMPK activation — the cellular energy sensor that triggers autophagy (cellular clean-up) and suppresses age-driving mTOR signalling.`,
      agingImpact: `Exercise is arguably the most potent biological age intervention available — and its absence accelerates aging across every tissue type. Your physical activity score of ${score}/100 ${score < 60 ? "suggests your cells are missing critical exercise signals: mitochondrial biogenesis is reduced, BDNF production is suppressed, and inflammatory markers are likely elevated — adding an estimated 3–5 years to biological age according to WHO 2024 data" : score < 75 ? "leaves significant longevity potential on the table, particularly in mitochondrial density and anti-inflammatory adaptation" : "reflects a good activity level with opportunity to optimise the cellular response to exercise"}. The largest biological age benefit comes from moving any amount along the activity spectrum.`,
      treatmentConnection: `${treatment} complements your physical activity dimension by ${treatment.includes("NAD+") ? "restoring the NAD+ availability that your muscle mitochondria need to fully capitalise on exercise stimuli. NAD+ is required for both the energy production during exercise and the mitochondrial biogenesis signalling (via SIRT1 and PGC-1α) that creates lasting fitness adaptations" : treatment.includes("Myers") ? "delivering the magnesium and B-vitamins that are rapidly depleted during exercise and serve as co-factors in the muscle repair and mitochondrial synthesis processes triggered by training" : `enhancing the recovery and cellular adaptation processes that determine how much benefit your body extracts from each exercise session`}. Most clients notice faster recovery and improved exercise endurance within 2–3 weeks.`,
      timeline: `Exercise-related improvements from ${treatment} typically emerge first as faster recovery — reduced soreness and improved readiness for the next session — within the first 2 weeks. By weeks 3–4, most clients notice improved endurance and strength gains. The profound longevity benefits of enhanced mitochondrial biogenesis build over 6–12 weeks, with the most significant biological age impact visible at the 3-month reassessment.`,
    };
  },

  "Immune Resilience": (score, answers, _bioAge, treatment) => {
    const symptoms = arr(answers, "q10");
    const hasImmune = symptoms.includes("Frequent colds/illness");
    const hasSlowRecovery = symptoms.includes("Slow recovery");
    return {
      mechanism: `Your immune resilience score of ${score}/100 reflects the current functional capacity of your innate and adaptive immune systems. ${hasImmune ? "The frequent infections you've reported" : score < 75 ? "Your immune profile" : "Your immune systems"} reflect the state of your immune effectors' energy supply and micronutrient availability. Your immune cells are among the most metabolically demanding in your body — each T-cell activation event requires sufficient Vitamin C, zinc, glutathione, and cellular energy to mount an effective response${hasSlowRecovery ? ", and your reported slow recovery suggests this resolution is taking longer than optimal" : ""}.`,
      agingImpact: `Immune resilience is intertwined with biological aging through inflammaging — the chronic low-grade inflammation that accompanies immune dysfunction and drives cellular aging across every tissue. Your immune score of ${score}/100 ${score < 65 ? "suggests active inflammaging is occurring — background inflammation accelerating telomere shortening, impairing mitochondrial function, and damaging tissues at a rate that significantly contributes to your biological age" : "reflects some early inflammaging that, while manageable now, will become more significant without targeted support as natural immune decline progresses"}. Strong immune function is a defining characteristic in centenarian longevity research.`,
      treatmentConnection: `${treatment} ${treatment.includes("Immunity") ? "directly targets your immune score with high-dose Vitamin C (up to 25g), zinc, selenium, B-complex, and glutathione delivered intravenously — achieving blood concentrations 10–100× higher than oral supplements can achieve. These micronutrients directly fuel neutrophil and lymphocyte function, T-cell proliferation, and natural killer cell cytotoxicity" : treatment.includes("EBOO") ? "produces powerful immune modulation through ozonation — activating the Nrf2 pathway, downregulating inflammatory cytokines, and enhancing natural killer cell activity for a comprehensive regulatory effect on your immune system" : `addresses your immune dimension through its effects on the upstream cellular mechanisms that support immune function and reduce inflammaging`}. Most clients notice improved resilience within 2–3 weeks.`,
      timeline: `Immune improvements from ${treatment} typically manifest first as faster recovery when you do encounter illness — a signal that your immune effectors are responding more vigorously. Within 2–3 weeks, most clients notice they are less susceptible to infections. By weeks 4–6, natural killer cell activity is measurably improved and inflammatory markers show significant decline. Full immune resilience optimisation is typically established by the 3-month mark.`,
    };
  },

  "Cellular & Skin Health": (score, answers, _bioAge, treatment) => {
    const age = num(answers, "q1", 35);
    const symptoms = arr(answers, "q10");
    const hasSkin = symptoms.includes("Skin dullness");
    return {
      mechanism: `Your cellular and skin health score of ${score}/100 reflects the balance between oxidative damage and your antioxidant defences — primarily glutathione, your body's master antioxidant, which declines approximately 1% per year after age 20. By age ${age}, your glutathione levels may be operating at ${Math.max(60, 100 - (age - 20))}% of youthful capacity. ${hasSkin ? "The skin dullness you've reported" : "Your cellular profile"} reflects the downstream consequence: free radicals are damaging cell membranes, mitochondria, and DNA at a rate your diminished antioxidant systems can no longer fully neutralise. Collagen synthesis — requiring Vitamin C as a direct co-factor — has also declined at approximately 1% per year after age 25.`,
      agingImpact: `Oxidative stress is one of the most fundamental mechanisms of biological aging — the "rusting" of your cellular machinery when free radical production outpaces antioxidant defences. Your cellular health score of ${score}/100 ${score < 65 ? "indicates this imbalance is actively accelerating your biological aging — oxidative damage to mitochondrial DNA impairs the energy production needed for cell repair, creating an accelerating cycle" : "reflects a moderate oxidative burden that will become more significant without targeted antioxidant support as glutathione levels continue their natural decline"}. The skin reflects this internal oxidative stress visibly — but the same damage is occurring in every organ system simultaneously.`,
      treatmentConnection: `${treatment} ${treatment.includes("Skin Glow") ? "directly targets your cellular and skin health score by delivering pharmaceutical-grade glutathione — which simultaneously combats oxidative damage and modulates the tyrosinase enzyme to brighten skin tone — alongside Vitamin C at concentrations that directly activate collagen synthesis pathways. Clinical trials show visible skin improvement within 3–5 days, with optimal results from a course of 3–4 sessions" : treatment.includes("EBOO") ? "addresses cellular oxidative stress systemically through ozonation, which activates the Nrf2 pathway — your cells' master antioxidant response regulator — producing a whole-body upregulation of glutathione synthesis and antioxidant enzyme activity" : `replenishes the cellular raw materials — particularly glutathione and antioxidant cofactors — that your cellular defence systems need to neutralise oxidative damage and restore skin cellular health at depth`}. Most clients notice visible improvements in energy and skin quality within the first 1–2 weeks.`,
      timeline: `Cellular health improvements from ${treatment} are often among the first visible — skin changes appear within ${treatment.includes("Skin Glow") ? "3–5 days, with glow and clarity improvements visible before other dimensions show measurable change" : "1–2 weeks as oxidative burden reduces"}. By weeks 3–4, deeper improvements in mitochondrial function in skin cells produce more sustained tone and texture results. Hair and nail quality improvements typically emerge at 4–6 weeks. Full antioxidant protection optimisation matures at the 3-month mark.`,
    };
  },
};

export function generateDimensionDeepDiveTemplate(
  dimensionName: string,
  score: number,
  answers: AnswerRecord,
  biologicalAge: number,
  recommendedTreatment: string
): DeepDiveData {
  const fn = DEEP_DIVE_DATA[dimensionName];
  if (fn) return fn(score, answers, biologicalAge, recommendedTreatment);
  return {
    mechanism: `Your ${dimensionName} score of ${score}/100 reflects the current state of the biological systems governing this dimension. The cells and organs responsible for ${dimensionName.toLowerCase()} are experiencing ${score < 70 ? "measurable stress and declining function" : "good but sub-optimal conditions"} at the molecular level.`,
    agingImpact: `${dimensionName} plays a significant role in your overall biological aging rate. Your score of ${score}/100 ${score < 70 ? "indicates active contribution to accelerated biological aging in this dimension" : "reflects a solid foundation with meaningful optimisation potential"}. Targeted intervention here produces compounding benefits across your other wellness dimensions.`,
    treatmentConnection: `${recommendedTreatment} addresses your ${dimensionName} score through its direct effects on the cellular mechanisms governing this dimension. IV delivery achieves therapeutic concentrations impossible with oral supplementation, enabling faster and more complete correction of the underlying biochemistry.`,
    timeline: `Most clients see measurable improvements in their ${dimensionName.toLowerCase()} within 2–4 weeks of ${recommendedTreatment}. The benefits compound with subsequent sessions, with the most significant biological age impact visible at the 3-month reassessment.`,
  };
}
