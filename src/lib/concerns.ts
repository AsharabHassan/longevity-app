/**
 * What the report says about each self-reported concern. Nothing here names or
 * implies a clinic treatment: the honest first step for every one of these is
 * finding the cause. Content follows UK guidance (NICE) as summarised in
 * docs/superpowers/research/2026-09-21-treatment-protocol-evidence.md §3.
 */
export interface ConcernGuide {
  /** Common, checkable causes a clinician would want to rule in or out. */
  causes: string[];
  /** Tests typically used to look for those causes. */
  tests: string[];
  /** Best-evidenced things that help, of any kind. */
  helps: string[];
  /** Symptoms that need a GP or urgent care rather than a wellness consultation. */
  redFlags: string;
}

export const CONCERN_GUIDES: Record<string, ConcernGuide> = {
  "Brain fog": {
    causes: ["Underactive thyroid", "Low B12, folate or iron", "Poor or disrupted sleep", "Perimenopause", "Low mood or anxiety", "Medication side effects"],
    tests: ["Thyroid function", "B12 and folate", "Full blood count and ferritin", "HbA1c"],
    helps: ["Regular sleep timing", "Aerobic exercise", "Cutting back on alcohol", "A medication review"],
    redFlags: "See your GP promptly about progressive memory loss, confusion, a new severe headache, weakness or numbness, or a change in personality.",
  },
  "Persistent tiredness": {
    causes: ["Iron deficiency or anaemia", "Thyroid problems", "Low B12 or vitamin D", "Diabetes", "Sleep apnoea", "Low mood", "Perimenopause"],
    tests: ["Full blood count and ferritin", "Thyroid function", "B12 and folate", "Vitamin D", "HbA1c", "Kidney and liver function"],
    helps: ["Correcting a deficiency if one is found", "Better sleep", "Cutting back on alcohol", "Treating low mood"],
    redFlags: "See your GP promptly about unexplained weight loss, night sweats, swollen glands, breathlessness, chest pain or any unexplained bleeding.",
  },
  "Poor sleep": {
    causes: ["Insomnia", "Sleep apnoea (snoring, pauses in breathing)", "Restless legs, often linked to low iron", "Perimenopause", "Anxiety or low mood", "Caffeine or alcohol"],
    tests: ["Ferritin", "Thyroid function", "A sleep apnoea screening questionnaire"],
    helps: ["CBT for insomnia — the first-line treatment in UK guidance", "A fixed wake-up time", "An early caffeine cut-off", "Less alcohol"],
    redFlags: "See your GP if someone has noticed you stop breathing in your sleep, or you are sleepy while driving.",
  },
  "Getting ill often": {
    causes: ["Short sleep", "Smoking", "Low vitamin D", "Diabetes", "Asthma or allergies mistaken for colds", "Medicines that affect immunity"],
    tests: ["Full blood count with differential", "Vitamin D", "HbA1c", "Ferritin"],
    helps: ["Staying up to date with vaccinations", "Seven or more hours of sleep", "Regular moderate exercise", "Stopping smoking"],
    redFlags: "See your GP about repeated chest, sinus or ear infections needing antibiotics, a persistent fever, weight loss or swollen glands.",
  },
  "Slow recovery": {
    causes: ["Low iron or vitamin D", "Not eating enough for your training load", "Too little sleep", "Overtraining", "Thyroid problems"],
    tests: ["Full blood count and ferritin", "Vitamin D", "Thyroid function", "HbA1c"],
    helps: ["Seven to nine hours of sleep", "Enough protein and total energy", "Planned rest within your training", "Less alcohol"],
    redFlags: "Seek urgent advice for chest pain, fainting or palpitations during exercise, unusual breathlessness, or dark urine after training.",
  },
  "Digestive issues": {
    causes: ["Irritable bowel syndrome", "Coeliac disease", "Reflux", "Food intolerances", "Medication side effects"],
    tests: ["Coeliac blood test", "Full blood count and ferritin", "Inflammation markers", "A stool test for gut inflammation"],
    helps: ["A low-FODMAP diet guided by a dietitian", "Soluble fibre", "Peppermint oil", "Cutting back on alcohol"],
    redFlags: "See your GP promptly about blood in your stool, unexplained weight loss, difficulty swallowing, persistent vomiting, or a change in bowel habit lasting more than six weeks.",
  },
  "Joint pain": {
    causes: ["Osteoarthritis", "Inflammatory arthritis", "Gout", "Low vitamin D", "Perimenopause"],
    tests: ["Inflammation markers", "Rheumatoid factor and anti-CCP", "Urate", "Vitamin D"],
    helps: ["Therapeutic exercise and physiotherapy", "Weight management", "Anti-inflammatory gels"],
    redFlags: "See your GP urgently about swollen small joints with morning stiffness lasting over 30 minutes. Go to A&E for a single hot, swollen joint with a fever.",
  },
  "Low or changeable mood": {
    causes: ["Depression or anxiety", "Perimenopause or PMDD", "Thyroid problems", "Poor sleep", "Alcohol", "Medication side effects"],
    tests: ["Thyroid function", "B12 and folate", "Vitamin D", "Standard mood questionnaires with a clinician"],
    helps: ["Talking therapy such as CBT", "Regular exercise", "Cutting back on alcohol", "Treatment from your GP where appropriate"],
    redFlags: "If you have thoughts of harming yourself, call 999, NHS 111 (option 2) or Samaritans on 116 123 now.",
  },
  "Weight changes": {
    causes: ["Thyroid problems", "Insulin resistance or diabetes", "PCOS", "Medicines that promote weight gain", "Poor sleep", "Perimenopause"],
    tests: ["HbA1c", "Cholesterol", "Liver function", "Thyroid function", "Blood pressure and waist measurement"],
    helps: ["A structured lifestyle programme", "A way of eating you can sustain", "Strength and aerobic training", "Better sleep"],
    redFlags: "See your GP about unexplained weight loss, or rapid weight gain with swelling or breathlessness.",
  },
  "Skin changes": {
    causes: ["Sun damage", "Thyroid problems", "Low iron or B12", "Perimenopause", "Eczema or psoriasis"],
    tests: ["Ferritin", "Thyroid function", "B12"],
    helps: ["Daily broad-spectrum SPF", "A prescription retinoid", "Stopping smoking", "Better sleep"],
    redFlags: "See your GP about a mole that is changing, a sore that won't heal, yellowing of the skin, or a new widespread rash.",
  },
};
