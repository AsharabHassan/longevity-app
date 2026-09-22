# Biological-age quiz: evidence review

Date: 2026-09-21
Scope: what a questionnaire can and cannot say about "biological age", what the real tests are, whether biological age can be reversed, and a defensible replacement for the current scoring model in `src/lib/scoring.ts`.

Verification note: every study below was located in this session via search results pointing to PubMed, PMC, the journal page or clinicaltrials.gov. PubMed abstract pages could not be fetched directly (cookie wall), so numbers come from journal/PMC pages or the search-result abstracts. Two items are flagged "not re-verified" where I could not confirm a specific number in-session. Nothing here is invented; where I could not confirm, I say so.

---

## 0. Executive summary

1. **No questionnaire has been validated as a measure of biological age.** Biological age is defined by biomarkers (DNA methylation, blood chemistry, glycans). Questionnaires can validly estimate *mortality-equivalent "effective age"* or *life-expectancy difference* from lifestyle, because large cohorts give hazard ratios for those behaviours. That is a risk estimate, not a measurement.
2. **The code comment "0.4 coefficient validated against 2025 CMEC healthy lifestyle index" is false.** The CMEC study is real (Zhang et al., eLife 2025) but it contains no such coefficient, used blood/clinical biomarkers (not a quiz) to compute biological age, and found a very small effect: an improved healthy-lifestyle index was associated with **-0.19 years** of biological-age acceleration (95% CI -0.34 to -0.03). The current algorithm outputs up to +/-15 years; the cited study supports well under 1 year. The claim must be removed.
3. **"NAD+ decline is the #1 driver of cellular aging" is not defensible.** The field's reference framework (Lopez-Otin et al., Cell 2013 and 2023) lists 9 then 12 interacting hallmarks with no ranking; NAD+ is not itself a hallmark (it sits under deregulated nutrient sensing / mitochondrial dysfunction). Human RCTs of NAD+ precursors raise blood NAD+ but have not consistently shown clinical benefit. IV NAD+ has essentially only pharmacokinetic/tolerability data.
4. **Biological-age *measures* can be moved in human trials, but effects are small, mostly in small or post-hoc studies, and no trial has shown that lowering a clock score causes longer life or less disease.** Best-quality evidence: CALERIE (2-3% slower DunedinPACE over 2 years, n=220 RCT) and DO-HEALTH (omega-3: ~3-4 months over 3 years, n=777). Headline "3 years younger in 8 weeks" results come from n=43 and n=6 studies with a noisy first-generation clock.
5. **Several current quiz inputs have no bio-age evidence base**: skin dullness, frequent colds, brain fog, mood swings, digestive issues, "goal", and self-rated energy. They are non-specific symptoms, not validated ageing markers. The highest-impact evidence-based inputs are **missing**: smoking, alcohol, BMI/waist, social connection.
6. **Recommended framing:** "Lifestyle Age Estimate" (a risk-based estimate from published cohort data), explicitly "not a measurement of biological age", range capped at about -6 to +12 years, with a methodology page and the biomarker test positioned as the actual measurement.

---

## 1. Can a questionnaire estimate biological age?

### 1.1 What exists

| Study | Design / n | What it measured | Key result |
|---|---|---|---|
| Li Y, Pan A, Wang DD, et al. 2018, *Circulation* 138:345-355. doi:10.1161/CIRCULATIONAHA.117.032047 | Prospective cohorts NHS + HPFS (n~123,000; up to 34 y follow-up) | Life expectancy at 50 by 5 low-risk factors (never smoking, BMI 18.5-24.9, >=30 min/d MVPA, moderate alcohol, top-40% diet score) | 5 vs 0 factors: **+14.0 y women (95% CI 11.8-16.2), +12.2 y men (10.1-14.2)** |
| Li Y, Schoufour J, Wang DD, et al. 2020, *BMJ* 368:l6669. doi:10.1136/bmj.l6669 | Same cohorts (n=73,196 + 38,366) | Life expectancy free of diabetes, CVD, cancer at 50 | 4-5 vs 0 factors: **+10.7 y women (34.4 vs 23.7), +7.6 y men (31.1 vs 23.5)** |
| Nguyen XT, Li Y, Wang DD, et al. 2024, *Am J Clin Nutr* 119:127-135 (PMID 38065710) | Million Veteran Program, 719,147 for mortality rates; 276,132 with all 8 factors | 8 factors: never smoking, physical activity, no binge drinking, restorative sleep, good diet, low stress, positive social relations, no opioid use disorder | 8 vs 0 factors at age 40: **+24.0 y men, +20.5 y women**. HR for 8 factors 0.13 (0.10-0.16). Per factor: inactivity, opioid use, smoking each ~30-45% higher mortality; binge drinking, poor diet, poor sleep ~20%; stress HR ~0.78 for low stress; poor social relations ~5% |
| Zhang H, et al. 2023, *J Transl Med* 21:622. doi:10.1186/s12967-023-04495-8 | Cross-sectional NHANES 2005-2010, n=11,729 | AHA Life's Essential 8 vs PhenoAge and KDM biological age (both blood-biomarker based) | High vs low cardiovascular health: **-5.27 y PhenoAge acceleration, -4.76 y KDM-BA**. Health factors (glucose, BP) drove more of the association than behaviours |
| AHA Scientific Sessions 2023 abstract (Makarem N, et al.; preliminary, press release) | NHANES, n>6,500 | LE8 vs PhenoAge acceleration | High vs low LE8: about **6 years** younger phenotypic age. Note half of LE8 (BP, lipids, glucose, BMI) is measured, not self-reported |
| **Zhang et al. 2025, *eLife* 13:RP99924. doi:10.7554/eLife.99924** (the "CMEC" study) | China Multi-Ethnic Cohort, n=8,396, two waves ~2 y apart | Healthy Lifestyle Index (smoking, alcohol, diet, exercise, sleep) vs *change* in Klemera-Doubal biological age from 15 clinical/lab measures | HLI improvement: **-0.19 y BA acceleration (95% CI -0.34, -0.03)**. Per factor: diet -0.15 (-0.29, -0.00); exercise -0.16 (-0.32, 0.00); alcohol -0.17 (ns); smoking -0.13 (ns); sleep -0.02 (ns). Diet contributed most (24%) to comprehensive BA; smoking 55% of metabolic BA |
| Kusters CDJ, Klopack ET, Crimmins EM, Seeman TE, Cole S, Carroll JE. 2024, *Psychosom Med* (HRS) | Cross-sectional, n=3,795, age 56-100 | Self-reported sleep vs GrimAge | Short sleep (<6 h) **+1.29 y**; insomnia **+0.49 y**; both **+0.97 y** GrimAge acceleration |
| Sleep Chart study, *Nature* 2026. doi:10.1038/s41586-026-10524-5 | UK Biobank, 23 imaging/proteomic/metabolomic clocks | Self-reported sleep duration vs organ age gaps | U-shaped; lowest age gaps at **6.4-7.8 h**; <6 h and >8 h associated with higher disease and mortality risk |
| Quach A, Levine ME, Tanaka T, et al. 2017, *Aging* 9:419-446. doi:10.18632/aging.101168 | WHI n=4,173 + InCHIANTI n=402 | Diet, exercise, education, BMI vs epigenetic age acceleration | Significant but **weak** associations: fish, vegetables/carotenoids, moderate alcohol, education, activity protective; BMI/metabolic syndrome adverse. Individual effects generally well under 1 year |
| NHANES 1999-2002 smoking and clocks (PMC12724157, 2025/26) | Cross-sectional, n~2,000+ | Smoking vs PhenoAge, GrimAge2, DunedinPoAm | Current smokers: **+2 to +9 y** (dose dependent); each year since quitting: **-0.14 y GrimAge2**, -0.06 y PhenoAge; >=20 y quit approaches never-smokers |
| Harvanek ZM, et al. 2021, *Transl Psychiatry* 11:601. doi:10.1038/s41398-021-01735-7 | Community sample, n=444 | Cumulative stress vs GrimAge acceleration | Significant (p=0.039) but **small** (eta-squared 0.01 adjusted); abolished in people with good emotion regulation. Later work suggests stress acts largely via sleep, diet and exercise |
| Holt-Lunstad J, Smith TB, Layton JB. 2010, *PLoS Med* 7:e1000316 | Meta-analysis, 148 studies, n~308,000 | Social relationships vs mortality | OR 1.50 for survival with stronger social relationships (observational, confounded) |
| Jha P, et al. 2013, *NEJM* 368:341-350. doi:10.1056/NEJMsa1211128 | NHIS, n=202,248 | Smoking vs mortality | Current smokers ~3x mortality; lose >=10 y; quitting at 25-34 / 35-44 / 45-54 / 55-64 regains ~10 / 9 / 6 / 4 y |
| Global BMI Mortality Collaboration 2016, *Lancet* 388:776-786. doi:10.1016/S0140-6736(16)30175-1 | IPD meta-analysis, 239 cohorts, 10.6 M adults | BMI vs all-cause mortality | J-shaped; nadir ~BMI 20-25. Category HRs (approx. 1.45 for BMI 30-35, ~1.9 for 35-40) are quoted from memory and were **not re-verified in this session** - check Table 2 of the paper before publishing |

### 1.2 The legitimate bridge: "effective age"

Spiegelhalter D. 2016, "How old are you, really? Communicating chronic risk through 'effective age' of your body and organs", *BMC Med Inform Decis Mak* 16:104 (doi:10.1186/s12911-016-0342-z) shows that because adult mortality hazard rises ~10% per year (doubling every ~7 years), a hazard ratio *r* corresponds to roughly **10 x ln(r) years** of effective ageing, independent of current age between ~50 and 95. This is the established, citable method behind "heart age"/"real age" tools, and it is the honest basis for a quiz: it converts published mortality hazard ratios into years.

Worked examples: inactivity HR 1.3-1.45 -> +2.6 to +3.7 y; poor sleep / poor diet / binge drinking HR ~1.2 -> +1.8 y; smoking HR ~2-3 -> +7 to +11 y.

Caveats: (a) single-factor HRs overlap and are confounded, so simply adding them overstates the total; (b) the biomarker literature shows much smaller per-factor differences (0.2-1.5 y) than mortality-equivalent years. A defensible model therefore uses **shrunken** values between the two, and caps the total.

### 1.3 Verdict on the current algorithm

- The 8 dimension weights (Sleep 17%, Energy 15%, ...) are not derived from any study.
- The 0.4 coefficient and +/-15-year cap have no source. CMEC found -0.19 y, not a slope of 0.4 y per score point.
- Sleep is weighted highest; in CMEC sleep was the *weakest* factor (-0.02, ns). Across cohorts the order of effect size is: smoking >> physical activity ~ BMI/obesity > diet ~ sleep ~ heavy alcohol > stress > social connection.
- `src/lib/claude.ts` lines 84 and 208 attribute an "exercise benefit curve" to "CMEC 2025". CMEC did not report a dose-response curve. The sedentary-to-moderate jump is well supported by WHO 2020 physical-activity guidelines and dose-response meta-analyses; cite those instead.

---

## 2. Accepted biomarker-based measures

| Measure | Reference | What it is | Notes |
|---|---|---|---|
| Horvath pan-tissue clock | Horvath S. 2013, *Genome Biol* 14:R115 | 353 CpGs trained on chronological age | First generation; weak link to outcomes; noisy |
| Hannum clock | Hannum G, et al. 2013, *Mol Cell* 49:359-367 | 71 CpGs, blood | First generation |
| PhenoAge (blood chemistry and DNAm versions) | Levine ME, et al. 2018, *Aging* 10:573-591. doi:10.18632/aging.101414 | Trained on mortality-linked composite of 9 routine bloods + age: albumin, creatinine, glucose, CRP, lymphocyte %, MCV, RDW, ALP, WBC | The blood-chemistry version can be computed from a standard NHS-style panel (FBC, U&E, LFT, glucose, hs-CRP). Cheap, transparent, published formula |
| GrimAge / GrimAge2 | Lu AT, et al. 2019, *Aging* 11:303-327. doi:10.18632/aging.101684 | DNAm surrogates of 7 plasma proteins + smoking pack-years | Best mortality prediction among clocks; heavily smoking-driven |
| DunedinPACE | Belsky DW, et al. 2022, *eLife* 11:e73420. doi:10.7554/eLife.73420 | Pace of ageing (years of physiological change per calendar year), trained on 20-year longitudinal change in 19 biomarkers | Test-retest ICC 0.96-0.97; the measure that moved in CALERIE. Reported as a rate (e.g. 0.92), not an age |
| PC clocks | Higgins-Chen AT, et al. 2022, *Nature Aging* 2:644-661. doi:10.1038/s43587-022-00248-2 | Principal-component retraining of 6 clocks | Showed technical noise gives **up to 9 years** difference between replicates of the same sample for standard clocks; PC versions agree within ~1.5 y |
| GlycanAge | Kristic J, et al. 2014, *J Gerontol A* 69:779-789 | IgG N-glycan inflammation index | Predicts chronological age with ~9.7 y error; explains up to 58% of age variance; responsive to weight loss, HRT, inflammation. Commercial, single company, less independent replication |
| Proteomic / organ clocks | e.g. Oh HS, et al. 2023, *Nature* 624:164-172 | Plasma proteomics | Research-grade; not routinely available |

### Known criticisms
- **Test-retest noise**: up to 9 y between technical replicates for first/second-generation clocks (Higgins-Chen 2022). A single before/after pair in one customer cannot distinguish a 2-year "reversal" from noise unless PC clocks or replicates are used.
- **Short-term fluctuation**: Poganik JR, et al. 2023, *Cell Metab* 35:807-820 (doi:10.1016/j.cmet.2023.03.015) - surgery, pregnancy and severe COVID transiently raise epigenetic age, which then recovers within days to weeks. Timing of the test matters.
- **Consumer inconsistency**: different vendors use different tissue (saliva vs blood), arrays and undisclosed algorithms; results differ materially (The Scientist; The Conversation 2025/2026 explainers by clock researchers, who argue the tests are population research tools not individual diagnostics).
- **Clocks disagree with each other**, are confounded by blood cell composition, and none is a validated surrogate endpoint (no regulator accepts them).

### What a UK clinic could realistically offer as "the real test"
1. **Blood-chemistry PhenoAge** from a standard venous panel (FBC with RDW/MCV/lymphocyte %, albumin, creatinine, ALP, fasting glucose, hs-CRP). Published open formula, cheap, same-week, clinically interpretable components. Best value and most defensible.
2. **DNAm panel reporting DunedinPACE + PC-GrimAge** via a lab using blood (not saliva) on Illumina EPIC arrays (e.g. TruDiagnostic-type service, available to UK clinics). Report pace of ageing plus confidence/noise statement; retest no sooner than 6-12 months.
3. **GlycanAge** (UK/Croatia based, finger-prick) as an inflammation-focused adjunct.
Always alongside the conventional measures that actually carry outcome evidence: BP, HbA1c, lipids, waist, VO2max/grip strength.

---

## 3. Human trials: can biological-age measures be reduced?

| Trial | Design, n | Intervention | Effect | How solid |
|---|---|---|---|---|
| **TRIIM** - Fahy GM, et al. 2019, *Aging Cell* 18:e13028. doi:10.1111/acel.13028 | Single-arm, **n=9** men 51-65, 1 year | rhGH + DHEA + metformin | Mean epigenetic age ~1.5 y below baseline (-2.5 y vs expected); thymic regeneration signals | Weak: no control, tiny, drugs with real risks. TRIIM-X ongoing |
| **Fitzgerald KN, et al. 2021**, *Aging* 13:9419-9432. doi:10.18632/aging.202913 (with published corrections) | Pilot RCT, **n=43** men 50-72, 8 weeks | Diet, sleep, exercise, relaxation, probiotics, phytonutrients | Horvath DNAmAge **-3.23 y vs control (p=0.018)**; within-group -1.96 y (p=0.066, ns) | Weak-moderate: small, first-gen noisy clock, between-group result partly driven by control group ageing, author commercial interest |
| **Fitzgerald KN, et al. 2023**, *Aging* 15:1833-1839. doi:10.18632/aging.204602 | Case series, **n=6** women, 8 weeks, no control | Same programme | Mean **-4.60 y** (p=0.039); range +? to -11.01 y; 5 of 6 decreased | Very weak: uncontrolled, n=6, effect within measurement noise |
| **CALERIE** - Waziry R, et al. 2023, *Nature Aging* 3:248-257. doi:10.1038/s43587-022-00357-y | RCT, **n=220**, 2 years | 25% caloric restriction target (~12% achieved) | DunedinPACE slowed **2-3%**; **no significant change in PhenoAge or GrimAge** | Strongest design. Effect small; authors equate it to ~10-15% lower mortality risk by extrapolation, not observation |
| **DO-HEALTH** - Bischoff-Ferrari HA, et al. 2025, *Nature Aging* 5:376-385. doi:10.1038/s43587-024-00793-y (NCT01745263) | Post-hoc analysis of RCT, **n=777**, age 70+, 3 years | Omega-3 1 g/d, vitamin D 2000 IU/d, home exercise (2x2x2 factorial) | Omega-3: **2.9-3.8 months** less ageing on PhenoAge, GrimAge2, DunedinPACE over 3 y; additive benefit of all three on PhenoAge | Moderate: large RCT but post-hoc, Swiss subsample, very small effect |
| **Poganik JR, et al. 2023**, *Cell Metab* 35:807-820 | Observational, humans and mice | Surgery, pregnancy, severe COVID | Bio-age rises sharply with stress and **returns to baseline on recovery** | Shows reversibility of *acute* increases; also shows clocks are volatile |
| **TwiNS** - Dwaraka VB, et al. 2024, *BMC Med* 22:301. doi:10.1186/s12916-024-03513-w (NCT05297825) | RCT in **21 identical twin pairs (n=42)**, 8 weeks | Healthy vegan vs healthy omnivore | Vegan arm: PC GrimAge **-0.30 y**, PC PhenoAge **-0.78 y**, DunedinPACE -0.031; omnivore ns | Weak-moderate: vegans ate ~200 kcal/d less and lost ~2 kg more - authors concede weight loss may explain it; 7 authors employed by TruDiagnostic |
| **Semaglutide** - Corley MJ, et al. medRxiv 2025 (doi:10.1101/2025.07.09.25331038); published *Nat Commun* 2026 (doi:10.1038/s41467-026-72861-3) | Post-hoc of phase 2b RCT, **n=84** (45 vs 39), adults with HIV-associated lipohypertrophy, 32 weeks | Semaglutide vs placebo | PCGrimAge **-3.1 y**, GrimAge2 -2.3 y, PhenoAge -4.9 y, DunedinPACE **-0.09 (~9% slower)** | Moderate: randomised, largest effect sizes to date, but special population, post-hoc, tracks fat loss; not generalisable to healthy adults yet |
| Exercise | 6-month cycling pilot, *GeroScience* 2025 (doi:10.1007/s11357-025-02076-9); multidomain RCT in frail elderly (PMC12895478); DO-HEALTH exercise arm | Endurance/strength training | VO2max +20%; GrimAge deceleration tracked fitness gain; effects modest and inconsistent across clocks | Weak-moderate. Exercise's mortality evidence is far stronger than its clock evidence |
| Smoking cessation | NHANES cross-sectional (PMC12724157); GeroScience 2026 (doi:10.1007/s11357-026-02535-x) | Years since quitting | -0.14 y GrimAge2 per year quit; ~never-smoker level after >=20 y | Observational, consistent, dose-responsive; mortality data (Jha 2013) robust |
| Sleep | No RCT showing clock reversal found. Observational only (Kusters 2024; Sleep Chart 2026) | - | - | Gap in evidence |
| NAD+ precursors | Systematic reviews/meta-analyses of NMN and NR RCTs (e.g. PMC11557618; PMC12022230) | Oral NMN / NR | Raise blood NAD+; **no consistent benefit** on glucose, lipids, muscle mass/function. One small NR study reported modest PhenoAge/GrimAge reduction | Weak. **IV NAD+**: Grant R, et al. 2019 (*Front Aging Neurosci*, PMC6751327) is a PK pilot (n=11; plasma NAD+ did not rise until after 2 h); a 2024 medRxiv pilot and a 2026 *Front Aging* retrospective study report tolerability only, with frequent infusion side-effects (nausea, headache, chest/muscle tightness). **No trial shows IV NAD+ lowers any biological-age measure** |

Honest bottom line for the owner: "Biological-age *test scores* have been lowered in human trials by calorie restriction, omega-3, diet/lifestyle programmes and weight-loss medication. The rigorous trials show small changes (a few months to a 2-3% slower pace over 2-3 years); the large headline numbers come from very small studies. No trial has yet shown that lowering a clock score makes people live longer." The word "reverse" is only defensible as "reduced a biological-age test score"; safer verbs are "slow", "improve" and "lower your estimated score".

---

## 4. Is "NAD+ decline is the #1 driver of cellular aging" defensible?

No.
- Lopez-Otin C, Blasco MA, Partridge L, Serrano M, Kroemer G. 2013, *Cell* 153:1194-1217 (9 hallmarks) and 2023, *Cell* 186:243-278, doi:10.1016/j.cell.2022.11.001 (12 hallmarks: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, disabled macroautophagy, deregulated nutrient sensing, mitochondrial dysfunction, cellular senescence, stem-cell exhaustion, altered intercellular communication, chronic inflammation, dysbiosis). The hallmarks are explicitly interconnected and **unranked**. NAD+ is not a hallmark; it is one metabolite discussed within nutrient sensing/mitochondrial function.
- Human evidence that NAD+ declines with age is limited and tissue-specific, and recent reviews caution against extrapolating rodent findings.
- Under the UK CAP Code, the ASA upheld complaints against IV drip providers in Dec 2023 (Get A Drip, The IV Clinic, REVIV) for unsubstantiated health claims, and CAP guidance states medicinal claims for IV nutrient therapy are not permitted unless the product is licensed for that purpose. An "anti-ageing"/"reverses biological age" claim for NAD+ IV is an enforcement risk.

Defensible wording:
> "NAD+ is a molecule every cell uses to produce energy and repair DNA. Studies suggest NAD+ levels fall with age in some tissues, and this is one of several interconnected processes researchers link to ageing. Whether raising NAD+ slows ageing in humans is still being studied; NAD+ therapy is not a treatment for ageing or any disease."

Also replace "cortisol-telomere feedback loop" (not an established mechanism) with "chronic stress is associated with slightly faster epigenetic ageing, largely through its effects on sleep, diet and activity".

---

## 5. Recommended framing and scoring model

### 5.1 Framing
- Name the result **"Lifestyle Age Estimate"** (or "Pace-of-Ageing Risk Score"). Do not call it "your biological age".
- Show a range, not a point: e.g. "Estimated lifestyle age: 44-48 (you are 42)".
- Position the clinic's blood/DNAm test as the *measurement*; the quiz is the *screening estimate*.

Suggested disclaimer (results page and footer):
> "This is an educational estimate, not a medical test. It converts your answers into years using published associations between lifestyle and mortality risk or biomarker-based biological age in large population studies. Those studies describe averages across thousands of people and cannot predict an individual's health. Biological age can only be measured from blood or DNA biomarkers, and even those tests carry measurement uncertainty. This tool does not diagnose, treat or prevent any condition. Speak to a GP about any symptoms."

Suggested methodology note:
> "Each factor's contribution is derived from hazard ratios in large prospective cohorts (Li 2018 Circulation; Nguyen 2024 AJCN; Jha 2013 NEJM; Global BMI Mortality Collaboration 2016 Lancet; Holt-Lunstad 2010 PLoS Med), converted to years using the 'effective age' method (Spiegelhalter 2016: years ~ 10 x ln HR), then reduced to account for overlap between factors and cross-checked against biomarker studies (Zhang 2023 J Transl Med; Kusters 2024; Zhang 2025 eLife). Total is capped at -6 to +12 years. Symptoms you report are shown as discussion points and do not change the estimate."

### 5.2 Proposed scoring model

Additive year offsets from a neutral "typical adult" reference. Positive = older. Sum, then apply caps.

| # | Factor (question) | Answer -> years | Evidence anchor | Confidence |
|---|---|---|---|---|
| 1 | **Smoking** (NEW) | Never 0; quit >=10 y +0.5; quit <10 y +2; current <10/day +4; current >=10/day +6 | Jha 2013 (3x mortality, >=10 y lost; effective-age +7 to +11, shrunk); NHANES clocks +2 to +9 y, recovery -0.14 y/yr | High |
| 2 | **Physical activity** (q7) | >=150 min/wk mod-vig plus strength -2; >=150 min -1.5; some but <150 0; sedentary +2.5 | MVP HR 1.3-1.45 (= +2.6 to +3.7 y); Li 2018; CMEC -0.16 y; WHO 2020 | High |
| 3 | **BMI / waist** (NEW: height+weight) | 18.5-24.9: -0.5; 25-29.9: 0; 30-34.9: +2; >=35: +4; <18.5: +1.5 | Global BMI Mortality Collab 2016 (verify HRs); Li 2018; Quach 2017; LE8 | High |
| 4 | **Diet quality** (q8) | Mostly whole-food/Mediterranean-style -1.5; mixed 0; mostly processed +1.5 | MVP ~20% (= +1.8 y); Li 2018; CMEC diet -0.15 y, top contributor | Moderate-high |
| 5 | **Sleep** (q5) | 7-8 h, good quality -0.5; 6-7 h or 8-9 h 0; <6 h +1.5; >9 h +1; add +0.5 if frequent insomnia/unrefreshed (max +2) | Kusters 2024 (+1.29 y short, +0.49 insomnia); Sleep Chart 2026 (optimum 6.4-7.8 h, U-shape); MVP ~20% | Moderate |
| 6 | **Alcohol** (NEW) | None / within 14 UK units 0; 15-35 units +1; >35 units or weekly binge +2 | MVP binge ~20%; FHS GrimAge (Aging 2023, doi:10.18632/aging.205153). Do **not** credit "moderate drinking" as protective - contested and against UK CMO guidance | Moderate |
| 7 | **Chronic stress** (q9) | Low -0.5; moderate 0; high +1; add +0.5 if poor recovery (max +1.5) | MVP HR 0.78 for low stress; Harvanek 2021 small effect, moderated by resilience | Low-moderate |
| 8 | **Social connection** (NEW) | Strong regular contact -0.5; some 0; isolated/lonely +1 | Holt-Lunstad 2010 OR 1.5; MVP ~5% | Low-moderate |

Caps and rules:
- Total range: **min -6, max +12** years. Rationale: the best-vs-worst gap in biomarker studies is ~5-6 y (LE8/PhenoAge), and in life-expectancy studies 12-14 y (Li 2018); asymmetric because harms (smoking, obesity) are larger than benefits beyond the reference.
- Non-smokers' model max is +8; only smoking can push beyond that.
- Display as a +/-2 year band. Round to whole years.
- Age guard: for users under 30 halve all offsets (cohort evidence is from ages 40+).
- Self-rated energy (q4), goal (q3), location (q16): **do not score**. Use for personalisation only.

TypeScript sketch:

```ts
type Offsets = Record<string, number>;
const CAP_MIN = -6, CAP_MAX = 12, NON_SMOKER_MAX = 8;

export function lifestyleAgeEstimate(age: number, o: Offsets) {
  const smoking = o.smoking ?? 0;
  const others = Object.entries(o).filter(([k]) => k !== "smoking")
    .reduce((s, [, v]) => s + v, 0);
  let total = Math.min(others, NON_SMOKER_MAX) + smoking;
  if (age < 30) total *= 0.5;
  total = Math.max(CAP_MIN, Math.min(CAP_MAX, total));
  const mid = Math.round(age + total);
  return { estimate: mid, low: mid - 2, high: mid + 2, offsetYears: total };
}
```

### 5.3 Current inputs with no evidence basis for biological age

| Current input | Verdict |
|---|---|
| "Skin dullness" -> "Cellular & Skin Health" 8% | No evidence. Perceived facial age has some research support (Christensen K, et al. 2009, *BMJ* 339:b5262, twin study) but that is observer-rated from photographs, not self-reported "dullness". Remove from scoring |
| "Frequent colds/illness", "Slow recovery" -> "Immune Resilience" 10% | No study links self-reported cold frequency to any ageing clock. Immunosenescence is measured by T-cell phenotyping. Remove from scoring |
| "Brain fog" -> "Cognitive Function" 12% | Non-specific symptom (sleep debt, perimenopause, depression, post-viral, thyroid, anaemia). No bio-age validation. Remove; flag "discuss with GP if persistent" |
| "Chronic fatigue", self-rated energy -> "Energy & Vitality" 15% | Same. Also the rationale ("mitochondrial energy output / NAD+ decline is #1 driver") is unsupported. Self-rated health does predict mortality in general, but there is no basis for a 15% weight or an NAD+ interpretation. Remove from scoring |
| "Mood swings", "Digestive issues", "Joint pain" | No bio-age evidence. Medical symptoms - signpost, don't score |
| "Weight struggles" | Replace with measured BMI/waist, which has strong evidence |
| Goal (q3), location (q16) | Not health inputs |

Symptoms can still be collected and displayed as "things worth discussing at your consultation", but must not move the age number, and must not be presented as signs of NAD+ deficiency (no validated symptom profile exists for that).

### 5.4 Required code/comment corrections
- `src/lib/scoring.ts:20-26` - delete "NAD+ decline is the #1 driver" and "cortisol-telomere feedback loop".
- `src/lib/scoring.ts:169-170` - delete "validated against 2025 CMEC healthy lifestyle index" and "research standard" anchor claim.
- `src/lib/claude.ts:84, 208` - replace "CMEC 2025" attribution for the exercise dose-response with WHO 2020 guidelines (Bull FC, et al. *Br J Sports Med* 2020;54:1451-1462).
- Any LLM-generated narrative must be prevented from asserting that the quiz "measured" biological age or that NAD+ therapy reverses it.

---

## References

1. Li Y, et al. Impact of healthy lifestyle factors on life expectancies in the US population. Circulation 2018;138:345-355. https://pubmed.ncbi.nlm.nih.gov/29712712/ - https://www.ahajournals.org/doi/full/10.1161/CIRCULATIONAHA.117.032047
2. Li Y, et al. Healthy lifestyle and life expectancy free of cancer, cardiovascular disease, and type 2 diabetes. BMJ 2020;368:l6669. https://pubmed.ncbi.nlm.nih.gov/31915124/
3. Nguyen XT, et al. Impact of 8 lifestyle factors on mortality and life expectancy among US veterans: the Million Veteran Program. Am J Clin Nutr 2024;119:127-135. https://pubmed.ncbi.nlm.nih.gov/38065710/ ; per-factor summary https://www.healio.com/news/primary-care/20230725/eight-lifestyle-factors-linked-to-decreased-risk-for-premature-mortality
4. Zhang et al. Association between Life's Essential 8 and biological ageing among US adults. J Transl Med 2023;21:622. https://pmc.ncbi.nlm.nih.gov/articles/PMC10503107/
5. AHA newsroom. Following "Life's Essential 8" checklist may slow biological aging by 6 years (Scientific Sessions 2023, preliminary). https://newsroom.heart.org/news/following-lifes-essential-8-checklist-may-slow-biological-aging-by-6-years
6. Zhang et al. Lifestyles and their relative contribution to biological aging across multiple-organ systems: change analysis from the China Multi-Ethnic Cohort study. eLife 2025;13:RP99924. https://elifesciences.org/articles/99924 ; https://pubmed.ncbi.nlm.nih.gov/40052974/
7. Kusters CDJ, et al. Short sleep and insomnia are associated with accelerated epigenetic age. Psychosom Med 2024. https://www.ovid.com/jnls/bsam/abstract/10.1097/psy.0000000000001243 ; abstract https://pmc.ncbi.nlm.nih.gov/articles/PMC9765820/
8. Sleep chart of biological ageing clocks in middle and late life. Nature 2026. https://www.nature.com/articles/s41586-026-10524-5 ; https://pubmed.ncbi.nlm.nih.gov/42129562/
9. Quach A, et al. Epigenetic clock analysis of diet, exercise, education, and lifestyle factors. Aging 2017;9:419-446. https://pmc.ncbi.nlm.nih.gov/articles/PMC5361673/
10. Association of smoking behavior, intensity, and time since cessation with epigenetic aging biomarkers: NHANES 1999-2002. https://pmc.ncbi.nlm.nih.gov/articles/PMC12724157/ ; see also GeroScience 2026 https://link.springer.com/article/10.1007/s11357-026-02535-x
11. Harvanek ZM, et al. Psychological and biological resilience modulates the effects of stress on epigenetic aging. Transl Psychiatry 2021;11:601. https://www.nature.com/articles/s41398-021-01735-7
12. Holt-Lunstad J, et al. Social relationships and mortality risk: a meta-analytic review. PLoS Med 2010;7:e1000316. https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316
13. Jha P, et al. 21st-century hazards of smoking and benefits of cessation in the United States. NEJM 2013;368:341-350. https://www.nejm.org/doi/full/10.1056/NEJMsa1211128
14. Global BMI Mortality Collaboration. Body-mass index and all-cause mortality: IPD meta-analysis of 239 prospective studies. Lancet 2016;388:776-786. https://www.thelancet.com/article/S0140-6736(16)30175-1/fulltext
15. Spiegelhalter D. How old are you, really? Communicating chronic risk through 'effective age'. BMC Med Inform Decis Mak 2016;16:104. https://pmc.ncbi.nlm.nih.gov/articles/PMC4974726/
16. Levine ME, et al. An epigenetic biomarker of aging for lifespan and healthspan. Aging 2018;10:573-591. https://www.aging-us.com/article/101414
17. Lu AT, et al. DNA methylation GrimAge strongly predicts lifespan and healthspan. Aging 2019;11:303-327. https://pubmed.ncbi.nlm.nih.gov/30669119/
18. Belsky DW, et al. DunedinPACE, a DNA methylation biomarker of the pace of aging. eLife 2022;11:e73420. https://elifesciences.org/articles/73420
19. Higgins-Chen AT, et al. A computational solution for bolstering reliability of epigenetic clocks. Nature Aging 2022;2:644-661. https://www.nature.com/articles/s43587-022-00248-2
20. Kristic J, et al. Glycans are a novel biomarker of chronological and biological ages. J Gerontol A 2014;69:779-789. (see also Heritability of the glycan clock, https://pmc.ncbi.nlm.nih.gov/articles/PMC9815111/)
21. Horvath S. DNA methylation age of human tissues and cell types. Genome Biol 2013;14:R115. Hannum G, et al. Mol Cell 2013;49:359-367. (Standard citations; not re-fetched this session.)
22. Fahy GM, et al. Reversal of epigenetic aging and immunosenescent trends in humans. Aging Cell 2019;18:e13028. https://onlinelibrary.wiley.com/doi/10.1111/acel.13028
23. Fitzgerald KN, et al. Potential reversal of epigenetic age using a diet and lifestyle intervention: a pilot RCT. Aging 2021;13:9419-9432. https://www.aging-us.com/full/202913 (corrections: https://pmc.ncbi.nlm.nih.gov/articles/PMC9365547/)
24. Fitzgerald KN, et al. Potential reversal of biological age in women following an 8-week methylation-supportive diet and lifestyle program: a case series. Aging 2023. https://doi.org/10.18632/aging.204602
25. Waziry R, et al. Effect of long-term caloric restriction on DNA methylation measures of biological aging in healthy adults from the CALERIE trial. Nature Aging 2023;3:248-257. https://www.nature.com/articles/s43587-022-00357-y
26. Bischoff-Ferrari HA, et al. Individual and additive effects of vitamin D, omega-3 and exercise on DNA methylation clocks of biological aging in older adults from the DO-HEALTH trial. Nature Aging 2025. https://www.nature.com/articles/s43587-024-00793-y ; https://clinicaltrials.gov/study/NCT01745263 ; expert reaction https://www.sciencemediacentre.org/expert-reaction-to-study-looking-at-omega-3-and-biological-ageing-in-humans/
27. Poganik JR, et al. Biological age is increased by stress and restored upon recovery. Cell Metab 2023;35:807-820. https://www.cell.com/cell-metabolism/fulltext/S1550-4131(23)00093-1
28. Dwaraka VB, et al. Unveiling the epigenetic impact of vegan vs. omnivorous diets on aging: TwiNS. BMC Med 2024;22:301. https://pmc.ncbi.nlm.nih.gov/articles/PMC11285457/ ; https://clinicaltrials.gov/study/NCT05297825
29. Corley MJ, et al. Semaglutide slows epigenetic aging in a randomized trial of HIV-associated lipohypertrophy. medRxiv 2025 https://www.medrxiv.org/content/10.1101/2025.07.09.25331038v1 ; Nat Commun 2026 https://www.nature.com/articles/s41467-026-72861-3
30. Epigenetic age deceleration reflects exercise-induced cardiorespiratory fitness improvements. GeroScience 2025. https://link.springer.com/article/10.1007/s11357-025-02076-9
31. Alcohol consumption and epigenetic age acceleration across human adulthood (Framingham). Aging 2023. https://doi.org/10.18632/aging.205153
32. Lopez-Otin C, et al. Hallmarks of aging: an expanding universe. Cell 2023;186:243-278. https://pubmed.ncbi.nlm.nih.gov/36599349/ ; original: Cell 2013;153:1194-1217.
33. NMN meta-analysis (glucose/lipids): https://pmc.ncbi.nlm.nih.gov/articles/PMC11557618/ ; NMN/NR and muscle: https://pmc.ncbi.nlm.nih.gov/articles/PMC12022230/
34. Grant R, et al. A pilot study investigating changes in the human plasma and urine NAD+ metabolome during a 6 hour intravenous infusion of NAD+. Front Aging Neurosci 2019. https://pmc.ncbi.nlm.nih.gov/articles/PMC6751327/ ; IV NAD+ vs NR tolerability, Front Aging 2026 https://pmc.ncbi.nlm.nih.gov/articles/PMC12907335/ ; medRxiv 2024 pilot https://www.medrxiv.org/content/10.1101/2024.06.06.24308565v1.full
35. ASA/CAP. Healthcare: Intravenous Nutritional Therapy. https://www.asa.org.uk/advice-online/healthcare-intravenous-nutritional-therapy.html ; Dec 2023 rulings summary https://www.asa.org.uk/news/advertising-vitamin-drips-injecting-regulatory-knowledge-with-a-quick-jab.html
36. Consumer test critiques: https://www.the-scientist.com/epigenetic-clocks-power-biological-age-data-but-why-do-results-differ-across-tests-74347 ; https://theconversation.com/biological-age-tests-reveal-what-slows-or-hastens-aging-but-theyre-useful-only-for-researchers-not-consumers-275974
37. Christensen K, et al. Perceived age as clinically useful biomarker of ageing: cohort study. BMJ 2009;339:b5262. (Standard citation; not re-fetched this session.)
38. Bull FC, et al. WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med 2020;54:1451-1462. (Standard citation; not re-fetched this session.)

Items not re-verified in this session (cited from established knowledge; confirm before public use): exact BMI-category hazard ratios in ref 14; refs 21, 37, 38; the Oh 2023 Nature organ-clock citation; page numbers for refs 25-26; n=11 for Grant 2019; the lower bound of the range in the Fitzgerald 2023 case series (one participant did not decrease).
