import type { Citation } from "./types";

/**
 * The only studies the app is allowed to cite. Report copy, the methodology page
 * and the AI wording prompt all draw from this list, so every claim a user sees
 * can be traced to a source. See docs/superpowers/research/2026-09-21-biological-age-evidence.md.
 */
export const CITATIONS = {
  li2018: {
    id: "li2018",
    short: "Li et al., Circulation 2018",
    full: "Li Y, et al. Impact of healthy lifestyle factors on life expectancies in the US population. Circulation 2018;138:345-355.",
    url: "https://pubmed.ncbi.nlm.nih.gov/29712712/",
  },
  nguyen2024: {
    id: "nguyen2024",
    short: "Nguyen et al., Am J Clin Nutr 2024",
    full: "Nguyen XT, et al. Impact of 8 lifestyle factors on mortality and life expectancy among US veterans: the Million Veteran Program. Am J Clin Nutr 2024;119:127-135.",
    url: "https://pubmed.ncbi.nlm.nih.gov/38065710/",
  },
  jha2013: {
    id: "jha2013",
    short: "Jha et al., NEJM 2013",
    full: "Jha P, et al. 21st-century hazards of smoking and benefits of cessation in the United States. N Engl J Med 2013;368:341-350.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMsa1211128",
  },
  bmi2016: {
    id: "bmi2016",
    short: "Global BMI Mortality Collaboration, Lancet 2016",
    full: "Global BMI Mortality Collaboration. Body-mass index and all-cause mortality: individual-participant-data meta-analysis of 239 prospective studies. Lancet 2016;388:776-786.",
    url: "https://www.thelancet.com/article/S0140-6736(16)30175-1/fulltext",
  },
  kusters2024: {
    id: "kusters2024",
    short: "Kusters et al., Psychosom Med 2024",
    full: "Kusters CDJ, et al. Short sleep and insomnia are associated with accelerated epigenetic age. Psychosom Med 2024.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9765820/",
  },
  alcohol2023: {
    id: "alcohol2023",
    short: "Framingham Heart Study, Aging 2023",
    full: "Alcohol consumption and epigenetic age acceleration across human adulthood (Framingham Heart Study). Aging 2023.",
    url: "https://doi.org/10.18632/aging.205153",
  },
  harvanek2021: {
    id: "harvanek2021",
    short: "Harvanek et al., Transl Psychiatry 2021",
    full: "Harvanek ZM, et al. Psychological and biological resilience modulates the effects of stress on epigenetic aging. Transl Psychiatry 2021;11:601.",
    url: "https://www.nature.com/articles/s41398-021-01735-7",
  },
  holtLunstad2010: {
    id: "holtLunstad2010",
    short: "Holt-Lunstad et al., PLoS Med 2010",
    full: "Holt-Lunstad J, Smith TB, Layton JB. Social relationships and mortality risk: a meta-analytic review. PLoS Med 2010;7:e1000316.",
    url: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316",
  },
  spiegelhalter2016: {
    id: "spiegelhalter2016",
    short: "Spiegelhalter, BMC Med Inform Decis Mak 2016",
    full: "Spiegelhalter D. How old are you, really? Communicating chronic risk through 'effective age' of your body and organs. BMC Med Inform Decis Mak 2016;16:104.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4974726/",
  },
  zhang2023: {
    id: "zhang2023",
    short: "Zhang et al., J Transl Med 2023",
    full: "Zhang H, et al. Association between Life's Essential 8 and biological ageing among US adults. J Transl Med 2023;21:622.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10503107/",
  },
  zhang2025: {
    id: "zhang2025",
    short: "Zhang et al., eLife 2025",
    full: "Zhang et al. Lifestyles and their relative contribution to biological aging across multiple-organ systems: the China Multi-Ethnic Cohort study. eLife 2025;13:RP99924.",
    url: "https://elifesciences.org/articles/99924",
  },
  waziry2023: {
    id: "waziry2023",
    short: "Waziry et al., Nature Aging 2023",
    full: "Waziry R, et al. Effect of long-term caloric restriction on DNA methylation measures of biological aging in healthy adults from the CALERIE trial. Nature Aging 2023;3:248-257.",
    url: "https://www.nature.com/articles/s43587-022-00357-y",
  },
  bischoff2025: {
    id: "bischoff2025",
    short: "Bischoff-Ferrari et al., Nature Aging 2025",
    full: "Bischoff-Ferrari HA, et al. Individual and additive effects of vitamin D, omega-3 and exercise on DNA methylation clocks of biological aging in older adults from the DO-HEALTH trial. Nature Aging 2025.",
    url: "https://www.nature.com/articles/s43587-024-00793-y",
  },
} satisfies Record<string, Citation>;

export const METHODOLOGY_NOTE =
  "Each factor's contribution is derived from hazard ratios in large prospective cohort studies, converted to years using the 'effective age' method (years ≈ 10 × ln of the hazard ratio), then reduced to allow for overlap between factors and cross-checked against studies that used blood or DNA-based measures of biological age. The total is capped at 6 years younger to 12 years older. Concerns you report are shown as discussion points and do not change the estimate.";

export const DISCLAIMER =
  "This is an educational estimate, not a medical test. It converts your answers into years using published associations between lifestyle and health outcomes in large population studies. Those studies describe averages across thousands of people and cannot predict an individual's health. Biological age can only be measured from blood or DNA biomarkers, and even those tests carry measurement uncertainty. This tool does not diagnose, treat or prevent any condition. Speak to a GP about any symptoms.";
