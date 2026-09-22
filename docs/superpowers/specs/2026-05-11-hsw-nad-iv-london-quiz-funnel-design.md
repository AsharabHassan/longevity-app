# HSW NAD+ London — Quiz Funnel App

**Design spec · 2026-05-11**
**Brand:** Harley Street Medical & Wellness (HSW)
**Clinic address:** 1-5 Portpool Lane, London EC1N 7UU
**Scope:** Subsystem 1 of 3 — the quiz funnel app itself (not AI follow-up agents, not marketing research agents)

---

## 1 · Project overview

A new Next.js application that takes a London visitor from a paid Meta ad to a booked free 15-minute consultation about NAD+ IV therapy. The user answers an 8-question quiz, submits contact details, sees a personalised biological-age report, and books a consultation via embedded calendar. Every lead is pushed to HSW's existing GoHighLevel (GHL) CRM with full quiz answers, dimension scores, persona tag, and contraindication routing so the clinical team and (later) AI follow-up agents can personalise.

This is a **fresh codebase** (option A in brainstorm). The pre-existing biological-age app in the same parent directory is being archived; this spec does not extend it. Proven plumbing (Meta Pixel ID, GHL webhook contract) is reused conceptually but reimplemented cleanly.

### Goals

1. Convert paid Meta traffic to booked free consultations at a healthy unit-economics ratio (target: cost per booked consultation ≤ £75 in the first month).
2. Hand the clinical team a fully-segmented lead — quiz answers, biological age, persona tag, contraindication flags — so the call is informed before it happens.
3. Stay defensible under UK ASA / MHRA rules for an unlicensed prescription-only intervention.
4. Keep the codebase small and well-bounded so a follow-on session can ship Subsystem 2 (AI follow-up agents) without refactoring this app.

### Non-goals

- Multiple treatments. NAD+ is the only recommendation; contraindicated paths route to consultation, never to alternative IVs.
- A database or user accounts. GHL is the system of record.
- Multi-region or multi-language.
- Admin dashboards (Meta Events Manager + GHL + Vercel Analytics already cover this).
- AI follow-up automation (Subsystem 2, separate spec).
- Marketing-research automation (Subsystem 3, separate spec).
- Meta campaign strategy + ad creative (deferred — separate workstream when app is built).

### Target users

Two London personas, both served by the same site with persona-aware copy emphasis.

- **Persona A — Burned-Out Exec, 35-55.** Finance / law / tech / surgery. £150k+ income. Mayfair, City, Canary Wharf, Holborn. Long hours, alcohol load, jetlag, brain fog. Buys for energy, focus, recovery.
- **Persona C — HNW Anti-Ageing Buyer, 45-65.** Business owner, retired exec, HNW spouse. Kensington, Knightsbridge, Belgravia, Mayfair. Existing private GP and functional-medicine practitioner. Buys for healthy ageing and cellular vitality.

Persona is inferred from a combination of: Meta `utm_content` parameter (`exec` | `hnw`), Q1 answer, and Q6 (investment-in-health) answer. Stored as `primary_persona` on the GHL contact.

### Research informing this design

Two prior research briefs sit alongside this spec and must be read together:

- `docs/superpowers/research/2026-05-11-nad-iv-clinical-brief.md` — clinical mechanism, evidence-grades, contraindications, **UK ASA/MHRA safe-copy mapping**, UK pricing/protocol reality.
- `docs/superpowers/research/2026-05-11-nad-quiz-design-brief.md` — quiz-funnel structure for premium-medical, scoring dimensions, contraindication-screening patterns, lead-capture mechanics, results-page psychology, "discreet expertise" tone.

Two further research areas (audience voice-of-customer and London competitor scan) were attempted but blocked because WebSearch/WebFetch were disabled. They must be run before launching paid ads — not before building the app.

---

## 2 · Architecture

### Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript strict | Same family as existing app, well-supported by Vercel hosting |
| Styling | Tailwind CSS v4 + shadcn/ui | Dark Luxury visual direction needs design control; shadcn primitives are headless so they don't fight the aesthetic |
| State | URL params + sessionStorage + localStorage (7-day resume) | No global state library needed; quiz is linear |
| Validation | Zod | API route inputs, env vars, quiz-answer shape |
| Phone validation | libphonenumber-js | UK + international submissions |
| Hashing | Node `crypto` SHA-256 | Meta CAPI PII hashing |
| Deployment | Vercel | Pixel/CAPI low-latency, KV available for fallback |
| Ephemeral storage | Vercel KV | Failed-webhook fallback, 24h TTL |
| AI personalisation | Anthropic SDK (Claude Haiku 4.5) | Optional: per-user "what your signals mean" microcopy on report |

### Folder structure (new codebase)

```
hsw-nad-london/                        ← new repo, location TBC
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← landing
│   │   ├── quiz/page.tsx               ← linear quiz, 8 Qs + 4 gate screens
│   │   ├── report/page.tsx             ← bio-age + recommendation
│   │   ├── consult-first/page.tsx      ← variant report for cancer-flag route
│   │   ├── book/page.tsx               ← calendar embed
│   │   ├── thank-you/page.tsx          ← post-booking confirmation
│   │   ├── privacy/page.tsx            ← privacy policy (HSW text)
│   │   ├── cookies/page.tsx            ← cookie policy
│   │   ├── api/
│   │   │   ├── lead/route.ts                       ← orchestrator
│   │   │   ├── lead/replay/[eventId]/route.ts      ← admin KV replay
│   │   │   ├── booking-confirmed/route.ts          ← calendar webhook receiver
│   │   │   ├── score/route.ts                      ← scoring endpoint (used by /report)
│   │   │   └── insight/route.ts                    ← optional Anthropic microcopy
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── landing/  (Hero, WhatIsNAD, HowItWorks, Testimonial, Press, FAQ, Disclaimer)
│   │   ├── quiz/     (QuizShell, QuestionCard, ProgressBar, GateStep)
│   │   ├── report/   (BioAgeReveal, SignalTile, RecommendationCard, ConsultCTA)
│   │   ├── booking/  (CalendarEmbed)
│   │   ├── shared/   (ConsentBanner, Wordmark, TrustStrip)
│   │   └── ui/       (shadcn primitives)
│   └── lib/
│       ├── questions.ts       ← 8 questions + options + scoring dims
│       ├── scoring.ts         ← pure: answers → {bioAge, dimensions, candidacyScore}
│       ├── persona.ts         ← pure: (utm, q1, q6) → 'exec' | 'hnw' | 'biohacker' | 'unknown'
│       ├── contraind.ts       ← pure: q7/q8 answers → {route, flags}
│       ├── copy.ts            ← every public-facing string (ASA/MHRA-audited)
│       ├── pixel.ts           ← fbq() helpers, fbc/fbp capture, dedup IDs
│       ├── capi.ts            ← server-side Meta CAPI client + SHA-256 PII hashing
│       ├── ghl.ts             ← GHL payload builder + retry + KV-fallback
│       ├── consent.ts         ← consent state, cookie banner integration
│       ├── kv.ts              ← Vercel KV thin wrapper
│       └── types.ts
├── public/
│   ├── images/ (clinic interior, doctor headshots — provided by HSW)
│   └── logos/  (press logos: Tatler etc., subject to permission)
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

### Key design boundaries

- **`copy.ts`** — single source of public-facing strings. ASA/MHRA audit happens against this one file. No copy hardcoded in components.
- **`scoring.ts`, `persona.ts`, `contraind.ts`** — pure functions, fully unit-testable. Component code receives the outputs; never recomputes.
- **`ghl.ts`** — payload builder mirrors the proven flat-field schema from the prior app's `/api/webhook/route.ts` so HSW's existing GHL workflows continue to fire.
- **API routes** — orchestration only; all logic lives in `lib/`.

### Out-of-scope reminders (already covered above but repeated for clarity)

- AI follow-up agents (voice + SMS) — Subsystem 2, separate spec.
- Marketing research agents — Subsystem 3, separate spec.
- Audience voice-of-customer research + competitor scan — blocked, must run before paid launch.
- Meta campaign strategy / ad creative — deferred.

---

## 3 · The 8-question quiz

### Flow

```
LANDING → "Begin My Assessment"
   ↓
QUIZ — 8 questions, one per mobile screen, smooth progress bar (no "8 of 8")
   ↓
LEAD GATE — 4 micro-screens
   1) First name
   2) Email
   3) Phone (UK + international, libphonenumber)
   4) Age band + Sex (one screen, two compact inputs)
   ↓
LOADER ("Calculating your biological age and personalised NAD+ assessment...")
   ↓
RESULTS — /report  OR  /consult-first  (based on contraindication route)
```

### Scoring dimensions

| Code | Meaning |
|---|---|
| **E** | Energy / mitochondrial deficit signal |
| **C** | Cognitive / brain-fog signal |
| **R** | Recovery / resilience signal |
| **A** | Anti-ageing motivation (not biology) |
| **$** | Spend signal |
| **B** | Biohacker openness |
| **X** | Contraindication flag |

### The 8 questions (final wording)

**Q1. What brings you here today?** *(single-select; sets personalisation track)*
- "I'm feeling older than my age" → **A, E** (HNW track)
- "My energy has crashed and I need it back" → **E, R** (exec track)
- "I want to optimise — I already feel okay" → **B, $** (biohacker, fast-track)
- "My recovery from training or travel is getting worse" → **R, E**
- "A friend or my doctor mentioned NAD+" → **B, $** (warm lead)

**Q2. By 3pm, how's your energy?**
- "Still going strong" — score 0
- "A coffee carries me through" — score 2
- "I'm pushing through fog" → **E, C** — score 4
- "I'm done. I need a nap I can't take." → **E, C** — score 6

**Q3. Compared with 5 years ago, how sharp does your thinking feel?**
- "Sharper, actually" — score 0
- "About the same" — score 1
- "A bit slower — I forget words sometimes" → **C, A** — score 3
- "Noticeably duller. It worries me." → **C, A** — score 5

**Q4. After exercise or a hard week, how long does it take you to bounce back?**
- "Same as it always did" — score 0
- "A bit longer than it used to" — score 2
- "Days, not hours" → **R, E, A** — score 4
- "I don't bounce back the way I used to" → **R, E, A** — score 6

**Q5. Do you look in the mirror and feel like you look older than you are?**
- "No — I look my age or younger" — score 0
- "A bit, recently" — score 2
- "Yes — and it's accelerated lately" → **A, $** — score 4
- "It's the main reason I'm here" → **A, $** — score 6

**Q6. How would you describe your approach to your own health right now?** *(spend qualification + persona signal)*
- "I treat my body the way a serious investor treats a portfolio — proactively, with the best advisors" → **$, B**
- "I'm thoughtful but I know I could be doing more"
- "I've coasted on good genetics and it's catching up with me" → **A**
- "I want to start taking this seriously and I'm not sure where"

**Q7. Medical screen 1.** *(framed as care: "Just so our doctors can make sure NAD+ is right for you." Multi-select. "None of these" is the first option.)*

Microcopy below the question: *"Nothing here disqualifies you automatically. Our medical team reviews every case personally."*

- ☐ **None of these**
- ☐ Pregnant, breastfeeding, or actively trying to conceive → **X-pregnancy**
- ☐ Active cancer treatment, or chemotherapy in the last 5 years → **X-cancer**
- ☐ A heart condition my cardiologist actively monitors → **X-cardiac**
- ☐ Kidney disease → **X-renal**
- ☐ I'd rather discuss this on the consultation → **X-deferred**

**Q8. Prescription medications.**
- "No prescription meds right now"
- "A few, nothing significant — I'll share details on the call" → `meds_review_flag = 'review'`
- "Yes — I'd want our doctor to review them on the consultation" → `meds_review_flag = 'review-priority'`

### Lead gate — 4 micro-screens after Q8

| Step | Field | Validation | Microcopy |
|---|---|---|---|
| 1 | First name | required, ≤50 chars | "What should we call you?" |
| 2 | Email | required, RFC-5322 | "We'll email your detailed report." |
| 3 | Phone | required, libphonenumber-js valid for any region | "For your free consultation only. No sales calls." |
| 4 | Age band + Sex | required (age band: 30-39 / 40-49 / 50-59 / 60-69 / 70+; sex: M / F / Prefer not to say) | "Your age and sex help us calculate your biological age accurately." |

On Step 4 submit: `POST /api/lead` → returns `{ route, eventId }` → client redirects to `/report?eventId=...` or `/consult-first?eventId=...`.

### Scoring (`scoring.ts`)

Pure function: `scoreQuiz(answers, ageBand, sex) → ScoringResult`.

```ts
interface ScoringResult {
  biologicalAge: number;          // computed, capped to plausible range
  chronologicalAge: number;       // midpoint of ageBand
  ageDelta: number;               // positive = older bio, negative = younger
  dimensions: {
    energy:     { score: number, label: 'Strong'|'Average'|'Low'|'Very Low' };
    cognitive:  { score: number, label: ... };
    recovery:   { score: number, label: ... };
  };
  candidacyScore: number;         // E+C+R; drives recommendation tone
  recommendationTone: 'strong-primary' | 'standard-primary' | 'optimisation';
}
```

Bio-age formula:

```
chronologicalAge = midpoint(ageBand)
  where midpoints: 30-39 → 34.5, 40-49 → 44.5, 50-59 → 54.5, 60-69 → 64.5, 70+ → 75

For each dimension d in [Energy, Cognitive, Recovery, AntiAgeing]:
  dimScore_d = sum(score of answers tagged d, across Q2..Q5)   // raw 0..N
  dimMax_d   = max possible raw score if every answer hit d at max  // fixed at compile time per dimension
  dimNorm_d  = dimScore_d / dimMax_d                            // 0..1
  dimPenalty_d = dimNorm_d × cap_d

  where caps:
    Energy        cap +4 years
    Cognitive     cap +3 years
    Recovery      cap +3 years
    AntiAgeing    cap +2 years (motivation, not biology)

totalPenalty = sum(dimPenalty_d) for all dimensions
sexAdjustment = -2 if sex='F' else 0

biologicalAge = round(chronologicalAge + totalPenalty + sexAdjustment)
              clamped to [chronologicalAge - 5, chronologicalAge + 12]
```

Maximum possible upward delta is +12 years (sum of caps) and minimum is -7 years (caps off + female adjustment + clamp), so the calculator can produce both "younger" and "older" outcomes honestly. Calibration: spot-check 10+ synthetic profiles before launch and confirm ~70% land in 3-8y-older bucket; if distribution is skewed, tune caps within the bands above.

**Distribution target:** ~70% of completers land 3-8 years older than chronological. ~20% roughly equal. ~10% younger. Calibrated, not rigged — savvy buyers spot rigged calculators. Verified by spot-checking 10+ synthetic profiles before launch.

### Persona classifier (`persona.ts`)

Pure function: `classifyPersona({ utm_content, q1, q6 }) → PersonaTag`.

```
exec    if utm_content='exec' OR q1='energy_crashed' OR q1='recovery_worse'
hnw     if utm_content='hnw'  OR q1='feeling_older'  OR q6='investor_approach'
biohacker if q1='want_to_optimise' OR q1='friend_mentioned'
unknown otherwise
```

Returns the **first match** in order: `exec` > `hnw` > `biohacker` > `unknown`. Stored on the GHL contact for downstream personalisation.

### Contraindication router (`contraind.ts`)

Pure function: `routeFromContraind(q7Flags) → ContraindRoute`.

```ts
interface ContraindRoute {
  route: 'book' | 'consult-first' | 'medical-review';
  flags: string[];   // e.g. ['pregnancy','cardiac']
  ghlTag: string;    // e.g. 'needs-oncologist-review'
}
```

Routing rules:

| Flag combination | route | reason |
|---|---|---|
| `none` only | `book` | clean path → `/report` |
| `cancer` (any combination) | `consult-first` | `/consult-first` — clinical review required first |
| `pregnancy` or `cardiac` or `renal` (no cancer) | `medical-review` | `/report` with extra "Your consultation will include a medical review" line |
| `deferred` only | `book` | `/report` with `medical-deferred` GHL tag |

**Critical rule:** the funnel never ends on a rejection wall. Every path captures the lead and routes to a consultation. Clinicians decide on the call.

---

## 4 · Pages

### `/` — Landing

Visual direction: **Dark Luxury** (palette + type — see §6).

Sections, top to bottom (mobile-first):

1. **Header bar.** HSW wordmark (brand-gold) left; "CENTRAL LONDON · EC1N" small-caps right. No "Harley Street" used as a location anywhere on the site (Decision §10).
2. **Hero.**
   - Eyebrow: `NAD+ IV THERAPY · BY MEDICAL CONSULTATION`
   - Headline (serif display): `What's your biological age?` — "biological age" treated as italic / accented.
   - Subhead (persona-aware via `?utm_content=`):
     - `exec`: "Eight questions. Two minutes. Discover whether NAD+ IV therapy is appropriate for your energy, focus and recovery under heavy professional load."
     - `hnw`: "Eight questions. Two minutes. Discover whether NAD+ IV therapy is appropriate for your energy, sharpness and how well you're ageing at the cellular level."
     - default: "Eight questions. Two minutes. Discover whether NAD+ IV therapy is appropriate for your cellular energy, recovery and cognitive resilience — reviewed by our medical team."
   - Primary CTA (gold-bordered): "Begin My Assessment →"
   - Microcopy: "Free 15-minute consultation included. No payment. No commitment."
3. **Trust strip.** GMC Registered · CQC Regulated · EC1N Central London. Small caps, minimal.
4. **What is NAD+ IV?** ~70 words, ASA-safe. "NAD+ is a coenzyme that supports cellular energy production, DNA repair and metabolic function. Levels decline with age, work stress and alcohol load. Our doctor-administered NAD+ IV protocol delivers a precursor load designed to support these natural processes. Administered following private consultation with our prescribing clinicians."
5. **How it works.** 3-step (Answer 8 questions → Receive your report → Free 15-min consultation).
6. **Single testimonial pull-quote** (named: "James, 47, Partner at law firm"). Persona-matched if `utm_content` set (rotating set per persona).
7. **Press strip** — Tatler · The Times · FT How To Spend It. Only ones HSW actually has documented permission for; the spec assumes this is provided.
8. **FAQ accordion** — 8-10 questions including: "What is NAD+?", "Is it safe?", "What does the consultation cover?", "How much is the treatment?" (answer: "Treatment plans start from £295. Your consultant will discuss what's right for you on the call." — never lead with the number).
9. **Final CTA strip.** "Begin My Assessment →"
10. **Footer disclaimer.** "Clinic: 1-5 Portpool Lane, London EC1N 7UU. NAD+ is an unlicensed product, administered following private medical consultation by our GMC-registered prescribing clinicians."

### `/quiz` — Quiz

- Linear, one question per mobile screen. Smooth progress bar (no "8 of 8" count — research showed this measurably increases drop-off).
- Smooth slide transition forward and back.
- All copy from `copy.ts`.
- Quiz state in `sessionStorage`, promoted to `localStorage` (7-day) on Q1 answer so users can resume after browser close.
- Lead-gate screens are part of `/quiz` (steps 9-12), submitting to `/api/lead`.

### `/report` — Standard results

Page composition (top to bottom):

1. **Header.** HSW wordmark, "YOUR REPORT · CONFIDENTIAL".
2. **Bio-age reveal.** Eyebrow "JAMES, YOUR BIOLOGICAL AGE", then huge serif display number, animated count-up over ~1.5s from chronological → biological. Below it, delta caption ("↑ 5 years older than your calendar age" or "↓ 2 years younger" — works in both directions).
3. **Chronological vs Biological side-by-side card.** Two big numbers, biological in brand-gold accent.
4. **What's driving this — three signal tiles.** Each tile references the user's *own answer text* (not a generic descriptor). Tile copy is mapped server-side in `scoring.ts` from the user's actual Q2/Q3/Q4 selections. Examples:
   - Q2 = "I'm pushing through fog" → tile: "Afternoon energy 3/10 — You're pushing through fog by 3pm, a classic mitochondrial-load pattern."
   - Q3 = "Noticeably duller" → "Cognitive sharpness 4/10 — 'Noticeably duller than 5 years ago' — your most concerning signal."
   - Q4 = "Days, not hours" → "Recovery resilience 3/10 — Days, not hours — your body is recovering slower than it should."
5. **Recommendation block** — gold-bordered dark card. Title: "OUR RECOMMENDATION — NAD+ Infusion Therapy". 60-90 word body, persona-aware (Exec vs HNW variants in `copy.ts`). ASA-safe phrasing only: "supports the body's natural processes for mitochondrial function and cellular repair", "used by clients focused on healthy ageing". Never: "reverses biological age", "anti-aging", "cures", "detox", "clinically proven", "boosts NAD+ by X%".
6. **Social proof.** One italic-serif pull-quote, named, role-tagged. Persona-matched. Rotating set of 2-3 per persona.
7. **Primary CTA** — gold-bordered button: "Book My Free 15-Minute Consultation". **No price visible.**
8. **Below CTA.** "With a GMC-registered consultant. No obligation. No pressure. 4 slots available this week." Real scarcity. No fake countdowns.
9. **Trust icons.** GMC · CQC · EC1N.
10. **Secondary CTA** (low weight, near footer). "Not ready? We'll email your full report and check in next week." Captures the ~60-70% who won't book immediately.

If `contraindication_route === 'medical-review'`: insert one extra sentence in the recommendation block — *"Your consultation will include a medical review to confirm NAD+ is right for you."* GHL contact tagged `needs-medical-review`.

### `/consult-first` — Cancer-flag route

Same header + bio-age reveal + three signal tiles as `/report` (the reveal is earned and worth keeping). Differences:

- **Recommendation block replaced:** "Given your medical history, NAD+ may or may not be appropriate — your oncologist must be part of the conversation. Our medical director would like to talk with you before recommending anything."
- **Primary CTA changes:** "Book a Complimentary Doctor Call".
- **GHL tag:** `needs-oncologist-review`. Routed to a different sales pipeline stage in GHL.
- Lead is still captured; clinician triages on the call.

### `/book` — Consultation calendar

- Header + minimal layout. Lead's name/email/phone pre-filled in calendar embed from sessionStorage.
- Embed depends on chosen calendar platform (still TBC — Cal.com / Calendly / GHL Calendars).
- On successful booking, calendar provider webhooks `POST /api/booking-confirmed`.

### `/thank-you` — Post-booking

Confirmation copy: "James, your consultation is booked. Thursday 2:30pm with [doctor name]. We'll text you a reminder. Watch your email for a calendar invite."

If user landed here with consent for pixel: fire Meta `Schedule` event browser-side. CAPI mirror fires server-side from `/api/booking-confirmed` regardless.

### `/privacy` and `/cookies`

HSW provides the legal text. Standard structure: data controller, what we collect, lawful basis, retention, GDPR rights, contact for ICO complaints. Cookie policy lists each cookie + provider + purpose.

---

## 5 · Visual direction — Dark Luxury

**References:** Equinox / Soho House / Aman / Mr Porter / The Maybourne / The Connaught.

### Palette

| Role | Hex | Notes |
|---|---|---|
| Background | `#0e0c08` | Warm-leaning near-black, not blue-black |
| Primary text | `#f5f1e8` | Warm off-white |
| Brand accent (gold) | `#c9a96e` | Aged brass / champagne. **One accent.** Not bright yellow. |
| Secondary contrast (used sparingly) | `#8b3a2f` | Deep oxblood — for severe-flag warnings only |
| Divider neutral | `rgba(245,241,232,0.08)` | warm-grey at low opacity |

### Typography

- **Headlines.** Editorial serif — Tiempos Headline / Canela / Saol Display preferred. System fallback: `Georgia, 'Times New Roman', serif`. Display weight, generous line-height (1.1-1.2), letter-spacing -0.5px on large display.
- **Body.** Refined sans — Söhne / Suisse International / GT America. System fallback: `'Helvetica Neue', Arial, sans-serif`. 14-15px on mobile, 16-17px on desktop.
- **Eyebrows / labels.** Small-caps body sans, letter-spacing 2-3px, brand-gold or low-opacity off-white.
- **Numbers.** Serif display for bio-age reveal (treated like a Mayfair hotel room number). Tabular figures elsewhere.

### Layout philosophy

- Concierge / members'-club feel. Deliberate spacing. Restrained drama.
- Buttons: rectangular, thin gold border (`1px solid #c9a96e`), off-white text on near-black, subtle hover-state (border thickens to 2px, gold fill at 8% opacity).
- Imagery: single editorial hero shot per page maximum. Clinic interior photography preferred (HSW provides). No stock medical-handshake imagery, ever.
- Subtle film-grain texture allowed at very low opacity.

### Anti-patterns to avoid

- Bright/yellow gold (crypto vibe)
- Gradient backgrounds
- Drop shadows
- Multiple accent colours
- Rounded-pill buttons with thick borders
- "Premium" stamped on anything
- Casino / watch-ad aesthetic

A full HTML mockup of `/` and `/report` in this direction is stored at `.superpowers/brainstorm/953-1778457689/content/direction-3-dark-luxury.html` and serves as the reference implementation.

---

## 6 · Data flow & integrations

### End-to-end happy path

```
User clicks Meta ad → / (utm captured)
   ↓
Fire Pixel PageView (browser, if consented)
Fire CAPI PageView (server, if consented)
   ↓
"Begin My Assessment" → /quiz
   ↓
Q1 answered → Pixel InitiateCheckout
   ↓
Q1-Q8 answered, state in sessionStorage
   ↓
Gate Step 1-4 submitted → POST /api/lead { answers, lead, utm, fbc, fbp }
   ↓
/api/lead:
   • generate eventId = UUID v4
   • score(answers, ageBand, sex) → { bioAge, dims, candidacy, recommendationTone }
   • classifyPersona(utm, q1, q6) → primary_persona
   • routeFromContraind(q7Flags) → { route, flags, ghlTag }
   • fire CAPI "Lead" with eventId, hashed em/ph/fn, IP+UA, fbc/fbp
   • build GHL flat payload (full schema below)
   • POST to GHL_WEBHOOK_URL with retry (exp backoff, 3 attempts)
   • on failure: stash in Vercel KV, email admin alert
   • return { route, eventId, recommendationTone, scoring }
   ↓
Client fires browser Pixel "Lead" event with shared eventId (dedup)
   ↓
Client redirects to /report?eventId=...  (or /consult-first)
   ↓
Report page reads scoring from response or refetches via /api/score (POST eventId)
   ↓
User clicks "Book My Free Consultation" → /book
   ↓
Calendar widget loads (pre-filled name/email/phone)
   ↓
User selects slot → calendar provider confirms → webhook POST /api/booking-confirmed
   ↓
/api/booking-confirmed:
   • update GHL contact: booking_at, lifecycle_stage='consultation_booked'
   • fire CAPI "Schedule" with eventId
   ↓
Redirect to /thank-you → browser Pixel "Schedule" event (shared eventId)
```

### GHL webhook payload (the contract)

Reuses the existing app's flat-field pattern so HSW's existing GHL workflows continue to work, with new fields appended:

```ts
// Existing fields, retained from prior app's webhook:
firstName, email, phone,
source,                          // 'quiz'
wellness_score, biological_age, chronological_age,
dim_<name>_score, dim_<name>_label, ...
primary_treatment, primary_treatment_price,
supporting_treatment_1, supporting_treatment_1_price,  // empty in this app
supporting_treatment_2, supporting_treatment_2_price,  // empty in this app
q1_question, q1_answer, ..., q8_question, q8_answer,
meta_pixel_id, meta_event_name, meta_event_id, meta_event_time,
meta_event_source_url, meta_action_source,
meta_em, meta_ph, meta_fn, meta_client_ip, meta_client_ua,
meta_fbc, meta_fbp,

// New fields added for this app:
primary_persona,                 // 'exec' | 'hnw' | 'biohacker' | 'unknown'
contraindication_route,          // 'book' | 'consult-first' | 'medical-review'
contraindication_flags,          // comma-joined: 'pregnancy,cardiac' | ''
landing_variant,                 // 'exec' | 'hnw' | 'default' (utm_content)
age_band,                        // '30-39'..'70+'
sex,                             // 'M' | 'F' | 'undisclosed'
meds_review_flag,                // 'none' | 'review' | 'review-priority'
recommendation_tone,             // 'strong-primary' | 'standard-primary' | 'optimisation'
```

### Meta Pixel + CAPI event map

| Event | Browser | CAPI | When | Custom data |
|---|---|---|---|---|
| `PageView` | ✓ | optional | every page | utm_content, utm_source |
| `ViewContent` | ✓ | — | landing hero IntersectionObserver | content_name='landing' |
| `InitiateCheckout` | ✓ | — | Q1 answered | content_category='quiz_started' |
| `Lead` | ✓ | ✓ (dedup) | gate Step 4 submit success | persona, biological_age, value=0, currency=GBP |
| `Schedule` | ✓ | ✓ (dedup) | booking confirmed | persona, value=0 |
| `Purchase` | — | future | (Subsystem 2 — GHL→CAPI when deal-won) | value=actual_price, currency=GBP |

**Deduplication.** `eventId = UUID v4` is generated server-side in `/api/lead`, returned to client, and passed to both the browser `fbq('track', ..., { eventID })` call and the CAPI `event_id` field. Meta deduplicates within 7 days when both arrive.

**Hashed PII for CAPI.** All of `em`, `ph`, `fn` are trimmed-lowercased-then-SHA-256-hashed before sending to CAPI, per Meta's spec. Phone is digits-only first. Client IP and User-Agent are forwarded from request headers as `client_ip_address` and `client_user_agent`.

### Consent & UK GDPR

Default position: **marketing requires explicit Accept** (UK ICO conservative path).

- Cookie banner on first visit: "Accept all" / "Essential only" / "Customise"
- Until consent: no browser Pixel firing, no CAPI firing.
- Quiz still functions (answers in sessionStorage, no PII transmitted).
- At gate Step 4, an explicit consent checkbox: "I agree to be contacted by HSW about my consultation. View our [privacy policy](#)." Required.
- Email + phone go to GHL only after the consent checkbox is ticked (post-gate-submit).
- DPA in place with GHL (already exists, they are a UK GDPR processor).

### Error handling

| Failure | Response |
|---|---|
| GHL returns non-200 | 3 retries with exp backoff (1s, 2s, 4s) |
| GHL still failing after retries | Stash payload in Vercel KV (`leads:failed:${eventId}`, 24h TTL), email admin, return success to user (don't break UX) |
| Replay endpoint | `POST /api/lead/replay/:eventId` (admin-bearer-auth) reads KV, re-attempts GHL |
| CAPI failure | Log only; Meta CAPI errors are silent and Meta retries internally |
| Calendar webhook lost | `/api/booking-sync` polling job runs every 10 min, queries calendar provider for the last 30 min of bookings and reconciles against GHL |
| Anthropic API timeout (insight microcopy) | Skip the AI insight; rest of report renders without it |
| User abandons mid-gate | Lead not yet created (no email); quiz answers in sessionStorage + 7-day localStorage allow resume on same browser |

---

## 7 · ASA / MHRA compliance

All public-facing copy lives in `lib/copy.ts` so HSW's medical director can audit a single file before launch.

### Forbidden language (per clinical research brief, must not appear anywhere)

- "Reverses biological age"
- "Anti-aging" (unqualified)
- "Cures / treats / heals" any condition
- "Boosts NAD+ levels by X%"
- "Detoxifies" / "detox"
- "Proven to" / "clinically proven"
- "Treats long COVID / CFS / Parkinson's / depression / addiction"
- Before/after testimonials describing symptom or condition resolution

### Required language patterns

- "Supports the body's natural processes for cellular energy and repair"
- "A wellness protocol used by clients focused on healthy ageing"
- "May support energy levels and mental clarity during periods of high demand"
- "Supported by emerging research into NAD+ biology"
- Every testimonial is experiential only ("I felt clearer") — no named conditions.

### Required visible elements

- GMC registration cue on landing + report + book pages (text or badge)
- CQC registration cue (same locations)
- Clinic address in footer disclaimer of every page
- MHRA unlicensed-product line in landing + book footer disclaimer
- Medical-director name + GMC number on `/about` (page not in this spec but folder reserved) and on `/privacy`

### Pre-launch audit checklist

1. HSW medical director reads `copy.ts` end-to-end, signs off on every string.
2. Held-evidence file exists for any claim more specific than "supports" / "during periods of high demand".
3. Testimonials reviewed and approved (real people, consent in writing, no condition-references).
4. Press logos used only with documented permission.
5. Cookie banner verified to block Pixel/CAPI until consent.

---

## 8 · Testing

### Unit (Vitest)

- `scoring.ts` — 30+ synthetic profile cases, assert bio-age distribution lands ~70% in 3-8y-older bucket, assert no profile produces NaN or out-of-range output.
- `persona.ts` — every combination of (utm, q1, q6) covered.
- `contraind.ts` — every flag combination covered, assert no path returns `route: 'reject'`.
- `ghl.ts` — payload-builder snapshot test against canonical fixture.
- `capi.ts` — PII hashing matches Meta-spec test vectors.

### Integration

- `/api/lead` end-to-end test with mocked GHL webhook URL + mocked Pixel/CAPI: full quiz fixture → assert correct payload, correct route, correct eventId, correct response shape.
- Failed-webhook fallback: mocked-failing GHL → assert KV write happens, admin email queued.
- Replay endpoint: assert replays succeed when GHL recovers.

### E2E (Playwright)

- 4 happy-path traversals: exec / hnw / biohacker / unknown utm_content.
- 3 contraindication paths: none / cardiac / cancer.
- Mobile breakpoints: 375px, 390px, 414px.
- Lead-gate validation: invalid email / phone / under-18 age handled correctly.
- Calendar booking: lands on /thank-you, GHL contact updated.

### Pre-launch QA checklist (manual)

- [ ] All 5 Q1 paths render correct quiz flow
- [ ] All 8 quiz screens render at 375 / 390 / 414px mobile
- [ ] Contraindication routing verified on real GHL test contact
- [ ] Bio-age math spot-checked on 10 synthetic profiles
- [ ] Lead gate: phone validates UK + international
- [ ] Pixel: Meta Events Manager Test Events shows Lead + Schedule with shared eventId
- [ ] CAPI: dedup verified (single event in Events Manager, not double)
- [ ] Cookie banner: Pixel doesn't fire until consent
- [ ] Calendar embed: booking creates GHL contact update + posts to `/api/booking-confirmed`
- [ ] Failed-webhook fallback: kill GHL env var, submit a lead, verify KV stash + admin email
- [ ] ASA/MHRA copy audit: medical director signs off on `copy.ts`

---

## 9 · Environment & configuration

`.env.example`:

```bash
# Meta
NEXT_PUBLIC_META_PIXEL_ID=             # provided by HSW
META_CAPI_ACCESS_TOKEN=                # generated in Events Manager → Settings
META_CAPI_TEST_EVENT_CODE=             # only set during QA, blank in production

# GHL
GHL_WEBHOOK_URL=                       # the inbound webhook on the HSW GHL workflow
GHL_API_KEY=                           # for booking sync polling, optional Phase 2

# Vercel KV
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Anthropic (optional micro-insight)
ANTHROPIC_API_KEY=

# Admin alerts
ADMIN_ALERT_EMAIL=                     # where failed-webhook notifications go
RESEND_API_KEY=                        # or whatever email provider HSW uses

# Calendar embed (depends on platform choice)
NEXT_PUBLIC_CAL_URL=                   # if Cal.com
NEXT_PUBLIC_CALENDLY_URL=              # if Calendly
NEXT_PUBLIC_GHL_CALENDAR_ID=           # if GHL Calendars

# App
NEXT_PUBLIC_SITE_URL=https://...       # for canonical URLs + CAPI event_source_url
```

---

## 10 · Decisions deferred

These do not block the spec; they get filled before / during implementation:

1. **New folder location for the codebase.** Suggested: `D:\Games\MoleScan Steps Illustration\HSW NAD+ London\` as sibling. To be confirmed.
2. **New domain.** Suggested: `nad.harleystreetmw.com` or `hsw-nad.com` or similar. Needed before paid launch only.
3. **Consultation calendar platform.** Cal.com / Calendly / GHL Calendars / other. Affects `/book` embed code and `/api/booking-confirmed` parser. **Resolved that one exists; specific platform TBC.**
4. **Admin alert email address** for failed-webhook notifications.
5. **Privacy + cookie policy text** — HSW supplies.
6. **Brand assets** — clinic interior photos, doctor headshots, GMC numbers, press permissions for logos. Required before paid launch, not before code build (the design uses placeholders).
7. **Location-language stance.** **Confirmed 2026-05-11: option (iii) — brand-only, never location claim.** All copy references "our medical team", "our consultant", "our clinic" — never "our Harley Street clinic". Brand name HSW retained as parent identity.

---

## 11 · Out of scope / future workstreams

### Subsystem 2 — AI follow-up agents (separate spec, separate session)

- Voice agent (Vapi / Bland / Retell / GHL Conversation AI) calls the lead within minutes of capture.
- Reads quiz answers + persona + dimension scores to script the call.
- SMS / WhatsApp / email follow-up sequence for non-responders.
- Triggered from GHL workflows on `lifecycle_stage='lead_captured'`.
- Updates GHL contact with call outcome + transcript.
- Build only after this app is producing 20+ leads/week and HSW has manually called enough to know what closes.

### Subsystem 3 — Marketing research agents (separate spec, separate session)

- Claude-powered agents that mine Reddit, Trustpilot, YouTube, Meta Ad Library for: London NAD+ voice-of-customer, competitor pricing + positioning, top-performing ad angles.
- Output feeds the Meta campaign workstream below.
- Can run in parallel with this app's build once web tools are unblocked.

### Meta campaign / ad creative (separate workstream)

- Ad sets, creative angles, budget guidance, optimization sequence, KPIs, A/B priorities, phased launch.
- Drafted during brainstorm and held back from this spec on user direction (2026-05-11).
- To be specced separately once the app is built and the deferred audience + competitor research is unblocked.

---

## 12 · Acceptance criteria

The app is ready for launch when:

1. All five pages render correctly at mobile breakpoints 375 / 390 / 414px and tablet/desktop.
2. All 8 quiz questions advance/return correctly; sessionStorage + localStorage resume verified.
3. All 5 contraindication routes deliver the right page (`/report` vs `/consult-first` vs `/report` with medical-review line).
4. Lead-gate submit fires browser Pixel `Lead` + server CAPI `Lead` with shared `event_id`; Meta Events Manager Test Events shows one (not two) Lead events per submission.
5. GHL contact is created with the full flat-field payload; HSW confirms their GHL workflow fires correctly off this payload.
6. Failed-webhook fallback verified: a forced failure stashes the lead in KV and emails the admin.
7. `/book` embed loads and a test booking writes back to `/api/booking-confirmed`, updates GHL, and fires Pixel `Schedule` + CAPI `Schedule`.
8. Cookie consent banner gates all Pixel/CAPI firing until consent.
9. ASA/MHRA copy audit completed and signed off by HSW medical director on `lib/copy.ts`.
10. Unit + integration tests pass; manual QA checklist (§8) completed.
