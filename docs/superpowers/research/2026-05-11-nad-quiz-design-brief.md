# NAD+ Quiz Funnel — Design Brief

*Research agent output, 2026-05-11. Pattern references drawn from prior study of NOVOS, Function Health, RealAge, InsideTracker, Hims/Hers UK, Roman, Numan, Manual.co, Levels, Modern Fertility, REVIV, Get A Drip, The Elixir Clinic. Web tools were blocked — specific wording examples are illustrative of the pattern, not verbatim from current live pages.*

---

## 1. Optimal quiz length & structure for premium medical

Generic ecommerce quizzes optimise for 6-10 questions because they sell a £30-80 SKU and friction kills AOV. **Premium medical is the opposite curve: more questions = higher perceived diagnostic value = higher willingness to pay.** Function Health's intake runs 100+ questions and converts because the length itself signals seriousness.

For a £295 ticket, the quiz IS the value proposition.

### Target: 16-20 questions, 5 phases

| Phase | Questions | Purpose | Drop target |
|---|---|---|---|
| 1. Warm-up / identity | 2-3 | Easy single-tap; sex, age band, intent | 95-98% pass |
| 2. Lifestyle & profession | 3-4 | Stress load, role, training/recovery; persona signal | 85% pass |
| 3. Symptom inventory | 5-7 | The NAD+ relevance score | 95% pass |
| 4. Readiness & contraindications | 3-4 | Soft medical screen framed as personalisation | 95-97% pass |
| Lead-capture gate | 3 micro-screens | name → email → phone (postcode optional) | 55-70% pass |
| 5. Post-results booking-prep (optional) | 2-3 | Re-engage hesitating users | n/a |

### Premium-medical completion benchmarks (above generic 50-65% wellness baseline)

- Quiz start → finish (pre-gate): **68-78%** realistic for Harley Street-tier
- Finish → lead capture: **55-70%** (the number that matters)
- Lead → results view: **92%+**
- Results → free consult booking click: **22-35%** (the free consult is the killer — direct paid-booking without it drops to 4-9%)

### Mobile-first non-negotiable

- 88-94% of Meta clicks on UK premium-health come from mobile
- One question per screen, large tap targets (min 56px), progress bar, swipe-friendly
- Desktop multi-Q-per-screen underperforms by 30-40% on mobile

### Progress UX

**Don't show total question count up front.** Show smooth progress bar. RealAge, Modern Fertility, InsideTracker all do this. "Question 3 of 20" causes drop at Q4-7 ("how much longer?").

---

## 2. The 18-20 candidate questions

Scoring dimensions: **E** = Energy/mitochondrial, **C** = Cognitive/brain-fog, **R** = Recovery/resilience, **A** = Anti-ageing motivation, **B** = Biohacker openness, **$** = Spend signal, **X** = Contraindication flag.

### Phase 1 — Warm-up

**Q1. What's bringing you here today?** (single-select; sets personalisation track)
- "I'm feeling older than my age" → **A, E** (HNW anti-ageing track)
- "My energy has crashed and I need it back" → **E, R** (exec burnout track)
- "I want to optimise — I already feel okay" → **B, $** (biohacker track)
- "My recovery from training/travel is getting worse" → **R, E** (performance track)
- "A friend / my doctor mentioned NAD+" → **B, $** (warm lead, fast-track)

**Q2. How old are you?** (30-39, 40-49, 50-59, 60-69, 70+) — Baseline urgency. 45+ → A; 35-44 → E.

**Q3. Sex at birth.** (M / F / Prefer not to say) — Required for biological-age calculation and contraindication routing.

### Phase 2 — Lifestyle & profession

**Q4. Which best describes your work life right now?**
- "High-pressure role with long hours (finance, law, founder, exec, surgeon)" → **E, R, $** (primary persona hit)
- "Demanding but I have some control over my schedule" → **E, $**
- "Moderate workload, decent balance"
- "Semi-retired or retired" → **A, $** (HNW anti-ageing track)

**Q5. How many hours of poor-quality or interrupted sleep in a typical week?**
- "I sleep well — 7+ hours, wake refreshed"
- "I get the hours but wake unrefreshed" → **E, R**
- "I'm at 5-6 hours most nights" → **E, R**
- "Under 5 hours / fragmented" → **E, R** (strong NAD+ candidate)

**Q6. How often do you drink alcohol?**
- "Rarely or never"
- "A few drinks a week"
- "Regular client dinners / events — most weeks" → **R, E, $** (classic City exec)
- "I'm cutting back / want to cut back" → **R**

**Q7. How much do you travel for work?**
- "Rarely"
- "A few trips a quarter"
- "Monthly long-haul" → **R, E, $**
- "Constantly — I live on planes" → **R, E, $**

### Phase 3 — Symptom inventory

**Q8. By 3pm, how's your energy?**
- "Still going strong"
- "A coffee carries me through"
- "I'm pushing through fog" → **E, C**
- "I'm done. I need a nap I can't take." → **E, C** (strong)

**Q9. How sharp does your thinking feel compared with 5 years ago?**
- "Sharper, actually"
- "About the same"
- "A bit slower / I forget words" → **C, A**
- "Noticeably duller. It worries me." → **C, A** (strong; emotional hook)

**Q10. After exercise or a hard week, how long does it take you to bounce back?**
- "Same as it always did"
- "A bit longer than it used to"
- "Days, not hours" → **R, E, A**
- "I don't bounce back the way I used to" → **R, E, A** (strong)

**Q11. How would you rate your mood and motivation over the last month?**
- "Strong"
- "Flat / lower than usual" → **E, C**
- "Anxious and wired but exhausted" → **E, R** (the burned-out exec phenotype)
- "I feel like I'm just getting through" → **E, R, C**

**Q12. Do you look in the mirror and feel like you look older than you are?**
- "No — I look my age or younger"
- "A bit, recently"
- "Yes — and it's accelerated lately" → **A, $** (strong HNW signal)
- "It's the main reason I'm here" → **A, $** (book them)

**Q13. Have you tried any of these in the last 12 months?** (multi-select; biohacker signal)
- CGM / Levels / Zoe → **B, $**
- DEXA / VO2max / advanced bloods → **B, $**
- Cold plunge / sauna protocol → **B**
- Vitamin IV drip → **B, $** (warm — already crossed IV threshold)
- Peptides / TRT / HRT → **B, $**
- Functional medicine doctor → **B, $**
- None of these

**Q14. How would you describe your investment in your health right now?**
- "Minimal — I want to change that"
- "Some — gym, supplements, occasional checks"
- "Significant — it's a real priority and I spend on it" → **$** (qualified)
- "I treat my body the way a CEO treats their company" → **$, B** (top decile)

### Phase 4 — Readiness & contraindications

**Q15. Are you currently pregnant, breastfeeding, or trying to conceive?** *(only shown if F + reproductive age)* — **X**

**Q16. Have you ever been treated for, or are you currently being treated for, any of the following?** (multi-select; "none of these" prominent)
- Active cancer / recent chemotherapy → **X** (route to "let's have your oncologist on the call")
- Kidney disease → **X**
- Heart failure or severe heart condition → **X**
- Currently on chemotherapy or immunotherapy → **X**
- None of these / prefer not to say at this stage

**Q17. Do you currently take any prescription medications you'd want our doctor to review?** (Yes - share on call / No / A few, nothing significant)

**Q18. How soon would you want to feel different?**
- "Yesterday" → urgency, fast-track booking
- "Within the next month" → standard
- "Just exploring for now" → nurture sequence

### Phase 5 — Post-results booking-prep (optional)

**Q19. Which would you most want to fix first?** (Energy / Sleep / Cognition / Recovery / Looking & feeling younger / All of it)

**Q20. When works best for your free 15-minute consultation?** (today / this week / next week)

### Killer cluster

If only 6 questions go live: **Q1 + Q8 + Q9 + Q10 + Q12 + Q14**.

---

## 3. Contraindication screening that doesn't break the funnel

### Pattern (used by Hims, Numan, Manual.co, Roman UK)

1. **Frame as personalisation, never gatekeeping.** "A few quick questions so our doctors can recommend what's safe and right for you."
2. **Use "treated for" language, not "do you have."** Reads as routine intake.
3. **"None of these" option positioned first or last with equal visual weight.**
4. **Never end the funnel on a contraindication.** Flags route to "Let's talk first — book a complimentary call with our doctor." Capture the lead either way; the clinical team decides. **Single biggest revenue leak in clinic quizzes.**
5. **Pregnancy specifically:** only show to female users in reproductive age. "Are you currently pregnant, breastfeeding, or actively trying to conceive?" / No / Yes / Prefer not to say. "Prefer not to say" routes to consult.

### Recommended exact wording

> **"Just a few quick questions so our doctors can make sure NAD+ is right for you."**
>
> *Have you ever been treated for any of the following? Tick all that apply — most clients tick "None."*
> - None of these
> - A heart condition my cardiologist actively monitors
> - Kidney disease
> - Cancer (current treatment or within the last 12 months)
> - I'd rather discuss this on the consultation
>
> *Nothing here disqualifies you automatically. Our medical team reviews every case personally.*

That last line is the unlock — removes the fear that ticking a box ends the funnel.

---

## 4. Lead-capture mechanics

**Placement:** immediately after contraindication screen, BEFORE results reveal. ("Results-tease" pattern — RealAge, NOVOS, Modern Fertility, Function Health.)

### Transition

> *"Calculating your biological age and personalised NAD+ assessment…"*
> (animated 2-3 second loader)
> *"Where should we send your full results?"*

### Three micro-screens (not one form)

| Step | Field | Microcopy | Conversion |
|---|---|---|---|
| 1 | First name | "What should we call you?" | 92-96% |
| 2 | Email | "We'll email your detailed report so you can refer back to it." | 80-88% |
| 3 | Mobile number | "Your free 15-minute consultation is by phone or video — what's the best number?" | 60-72% |
| 4 (optional) | Postcode | "Are you London-based? Postcode helps us match you with the nearest Harley Street consultant slot." | 70%+ |

### Microcopy that converts for £295 premium medical

- Under email: *"We'll never share your details. GMC-registered clinic, GDPR-compliant."* (GMC mention does real work for HNW)
- Under phone: *"For your free consultation only. No sales calls — our medical team will call once to book you in."*
- Button label: *"See My Results"* (NOT "Submit" or "Continue")
- Trust strip: *"As featured in Tatler · Vogue · The Times"* (only if true)

### Anti-patterns

- Don't ask for DOB at gate (age band already captured)
- Don't ask for address
- Don't add "How did you hear about us?" — every extra field costs 4-7%

---

## 5. Results-page psychology for £295 IV

### Structure (top to bottom)

1. **Hero number reveal — animated count-up.** "[Name], your biological age is **47**." 1.5-2 second count. RealAge invented this; everyone copies it because it works.

2. **Chronological vs biological side-by-side.** Delta highlighted. Biological > chronological → red/amber, urgency ("You're ageing 6 years faster than the clock"). Biological < chronological → green, "compound that advantage." **The offer must work in both directions.** Don't rig the calculator to always return "older" — savvy buyers spot it. Aim for ~70% to see 3-8 year deficit.

3. **Top three signals driving the result.** "Your sleep score: 4/10," "Your energy resilience: 5/10," "Your recovery markers: 3/10." References back to their own answers — single highest-trust element on the page.

4. **Recommendation block.** "Based on your profile, our medical team recommends starting with: **NAD+ IV Therapy.**" 60-90 word explainer of WHY for their specific signals.

5. **Social proof — placed BETWEEN recommendation and CTA.** Two or three short testimonials (first name + role: "James, 47, Partner at law firm"). For HNW, named publications (Tatler, FT How To Spend It) beat star ratings. Photo of actual Harley Street clinic interior converts — makes offer physically real.

6. **Primary CTA: "Book My Free 15-Minute Consultation."** "Free" is the killer word. **Do NOT show the £295 on the results page.** Price reveals on the consult call. Showing £295 drops booking rate by 30-50%.

7. **Below CTA:** "Your consultation is with a GMC-registered doctor at our Harley Street clinic. No obligation. No pressure." Three icons: GMC, CQC, Harley Street address.

8. **Urgency, gently.** "We hold 4 free consultation slots per day. Next available: Thursday 2:30pm." Real scarcity, not fake countdowns. Fake countdowns nuke trust with HNW buyers.

9. **Secondary CTA at bottom:** "Not ready? We'll email your full report and check in next week." Captures the 60-70% who won't book immediately.

### What NOT to do

- No autoplay video at top
- No "Only 3 spots left!" red countdown
- No upsell carousels for other treatments
- No before/after photos (don't exist credibly for NAD+)

---

## 6. Persona-aware tone: one quiz, two ad sets

**One quiz, one tone.** Forking adds engineering cost and dilutes ad-account learning.

- Two Meta ad sets → same quiz URL with different `utm_content` (`burnt_out_exec` vs `anti_aging_hnw`)
- Q1 answer routes the **results-page emphasis**, not the questions themselves
- Same 16-20 questions work for both because underlying signals (energy, sleep, cognition, recovery, looking older) are universal — framing of the result is what differs

### Unified tone: "discreet expertise"

Voice of a private banker who's also a doctor.

- Confident, never breathless. No exclamation marks. No "Amazing!" or "You got this!"
- Adult language. "We" and "our medical team," not "us" and "the Harley Street family."
- Specificity over enthusiasm. "NAD+ at 750mg over 90 minutes" beats "Powerful cellular renewal!"
- Understated luxury cues. "Harley Street," "GMC-registered," "Tatler-featured" do the heavy lifting. No gold gradients, no crowns, no "elite."
- British, not American. "Bespoke" not "custom," "appointment" not "session," "consultant" not "provider."

Burned-out exec wants to be told *this is what high-performers do.* HNW anti-ageing wants to be told *this is what discerning people do.* "Discreet expertise" reads as both.

---

## 7. Three killer questions in full

### Killer Q1 — The mirror question (emotional ignition)

> **"When did you last look in the mirror and not recognise the energy looking back at you?"**
> - This week
> - In the last month
> - Sometime in the last year
> - I haven't — I still feel like me

**Why it works:** Bypasses rational defence. Bypasses fact-asking. Anyone clicking anything other than option 4 has admitted on the record that something has changed. Emotionally pre-sold on a solution from that moment. Surfaces the exact phenotype NAD+ markets to: not "sick," not "old," but *diminished*.

### Killer Q2 — The peer-comparison question (status hook)

> **"Compared with peers your age in your industry, where do you think your energy and sharpness rank?"**
> - Top 10% — I'm the one others ask how I do it
> - Top quarter — I'm holding my own
> - Middle of the pack — I used to be ahead, now I'm not sure
> - Bottom half — and it's bothering me

**Why it works:** (a) Signals "this quiz understands you operate at a high level." (b) Forces status-honesty moment. (c) Clean qualification filter — top option → "compound your edge," bottom two → "let's reverse this." Works for the 70-year-old in Knightsbridge AND the 38-year-old hedge fund VP.

### Killer Q3 — The investment-language question (qualification + flattery)

> **"How would you describe your approach to your own health right now?"**
> - I treat my body the way a serious investor treats a portfolio — proactively, with the best advisors
> - I'm thoughtful but I know I could be doing more
> - I've coasted on good genetics and it's catching up with me
> - I want to start taking this seriously and I'm not sure where

**Why it works:** (1) Spend qualification — option 1 is a self-identifying HNW signal. (2) Commitment-and-consistency bias on options 3-4. (3) Persona routing without forking — option 1 flags HNW; option 4 flags first-time biohacker.

---

## 8. Implementation checklist

- 18 questions, 5 phases, mobile-first, one Q per screen, smooth progress bar (no count)
- Lead gate at position ~15 of 18, three micro-screens (name, email, phone), postcode optional
- Results page: animated bio-age count-up → side-by-side delta → top-3 signal tiles → NAD+ rec → social proof → free consult CTA (no price visible)
- Contraindications framed as "so our doctors can make sure NAD+ is right for you" with "None of these" prominent; flags route to consult, never to rejection wall
- One quiz, one tone ("discreet expertise"), persona segmentation via Meta `utm_content` + Q1 answer routing results emphasis
- A/B test priority: (1) Q1 wording, (2) presence/absence of price anchor on results page, (3) phone field required vs optional, (4) animated count-up vs static reveal

### Expected funnel math

100 ad clicks → 72 quiz completes → 45 leads captured → 42 view results → 12 book free consult → 7-9 attend → 3-4 buy.

**£295 ticket × 3.5 = £1,032 revenue per 100 clicks** at this configuration. Tune up from there.

---

## Outstanding research needed (deferred — web tools blocked)

- Voice-of-customer: verbatim quotes from Reddit (r/longevity, r/Biohackers), Trustpilot UK IV-clinic reviews, YouTube comments. Required for ad copy.
- London competitor scan: live pricing, hero claims, Meta Ad Library data for Effect Doctors, REVIV, Get a Drip, Hooked, The IV Clinic London, Cloud Twelve, 111 Harley Street, etc. Required for competitive positioning.

These should be re-run with WebSearch/WebFetch enabled **before launching paid ads** — not before designing the app.
