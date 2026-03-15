# Longevity Quiz Lead Gen Funnel — Design Spec

## Overview

Standalone web app (quiz.harleystreetmedicalwellness.co.uk) that drives Facebook Ad traffic through an AI-powered longevity assessment quiz, captures leads, and delivers a personalized wellness report with treatment recommendations. Integrates Claude API for adaptive questioning, personalized report generation, and post-report chatbot.

**Client:** Harley Street Medical Wellness (London & Glasgow)
**Tech Stack:** Next.js on Vercel
**Design:** Biohacker tech-forward, dark mode + gold accents

## Services & Pricing

| Treatment | Price |
|---|---|
| EBOO Therapy | £1,995 |
| EBOO Consultation | £450 |
| Metabolic Health Programme | £1,500 |
| NAD+ IV Drip | ~~£349~~ £295 |
| Detox IV Drip | £399 |
| Skin Glow IV Drip | £299 |
| Immunity IV Drip | ~~£395~~ £295 |
| Myers Cocktail | ~~£375~~ £295 |
| Phospholipid Exchange IV | £425 |
| IV Methylene Blue | £395 |
| 10-Session Skin Brightening Package | ~~£3,950~~ £2,950 |

## Target Audience

- High-net-worth health optimizers / biohackers
- Health-conscious professionals new to IV therapy
- People with specific health concerns (fatigue, brain fog, immune issues)

## System Architecture

```
[Facebook Ad] → [Landing Page (quiz.harleystreetmedicalwellness.co.uk)]
                        ↓
              [Quiz Engine (Next.js)]
                   ↓          ↓
        [Fixed Questions]  [Claude API]
        [Score Calculator]  → Micro-insights (Haiku 4.5)
                             → Adaptive branching (Haiku 4.5)
                        ↓
              [Lead Capture Gate]
              [Name, Email, Phone]
                        ↓
         ┌──────────────┼──────────────┐
         ↓              ↓              ↓
  [GoHighLevel]   [Claude API]   [Facebook Pixel]
  [via Webhook]   [Generate Report]  [Lead Event]
                  [Sonnet 4.6]
                        ↓
              [Results Page + Chatbot]
                        ↓
              [PDF Download (client-side)]
```

## Approach: Hybrid (Fixed Structure + AI Enhancements)

16 fixed core questions in a set order with Claude API powering:
- 3 micro-insights between questions (Haiku 4.5)
- 2-3 adaptive branching points in symptom deep dive (Haiku 4.5)
- Full personalized report generation (Sonnet 4.6)
- Post-report chatbot (Sonnet 4.6)

## Quiz Flow

### Phase 1: Warm-up (Q1-Q3) — Fixed

- **Q1:** What is your age? [Numeric input]
- **Q2:** What is your gender? [Male / Female / Prefer not to say]
- **Q3:** What is your #1 health goal right now? [Image cards — Energy, Cognitive Performance, Anti-aging, Immunity, Detox, Skin, Athletic Recovery, Overall Optimization]

> AI micro-insight after Q3 (based on age + goal)

### Phase 2: Lifestyle Assessment (Q4-Q9) — Fixed

- **Q4:** How would you rate your energy levels? [Visual scale 1-5]
- **Q5:** How many hours of sleep do you typically get? [Multiple choice]
- **Q6:** How would you rate your sleep quality? [Multiple choice]
- **Q7:** How many days per week do you exercise? [Multiple choice]
- **Q8:** How would you describe your diet? [Multiple choice with descriptions]
- **Q9:** How would you rate your daily stress level? [Visual scale 1-5]

> AI micro-insight after Q6 (sleep block) and Q9 (stress)

### Phase 3: Symptom Deep Dive (Q10-Q14) — Adaptive Branching

- **Q10:** Which of these do you experience regularly? [Multi-select checkboxes: Brain fog, Chronic fatigue, Frequent colds, Skin dullness, Slow recovery, Digestive issues, Joint pain, Mood swings, Weight struggles, None]
- **Q11:** ADAPTIVE — Claude picks based on Q10 selections
- **Q12:** ADAPTIVE — Second personalized follow-up
- **Q13:** Skin quality changes in past year [Fixed]
- **Q14:** Energy crashes during the day [Fixed]

> AI micro-insight after Q12

### Phase 4: Readiness (Q15-Q16) — Fixed

- **Q15:** Have you tried IV therapy before? [Never / Once or twice / Regular]
- **Q16:** Preferred location [London / Glasgow]

### Lead Capture Gate

"Your Personalized Longevity Report is Ready"
- First Name
- Email
- Phone
- [Unlock My Report] button
- Trust badges: 256-bit encrypted, GDPR compliant, 10,000+ assessed

## Wellness Score Engine

### 9 Dimensions, Weighted (Deterministic — No AI)

| Dimension | Weight | Source Questions |
|---|---|---|
| Energy & Vitality | 15% | Q4, Q14 |
| Sleep Quality | 15% | Q5, Q6 |
| Cognitive Function | 12% | Q10, Q11 (adaptive) |
| Immune Resilience | 10% | Q10, Q12 (adaptive) |
| Metabolic Health | 12% | Q8, Q14 |
| Physical Activity | 12% | Q7 |
| Stress & Mental Wellness | 12% | Q9 |
| Cellular & Skin Health | 7% | Q13 |
| Readiness & Awareness | 5% | Q3, Q15 |

### Scoring Methodology

1. Each answer scores 0-4 points
2. Average within dimension → normalize to 0-100
3. Apply weights → composite Wellness Score (0-100)

### Biological Age Formula

| Score | Biological Age Offset |
|---|---|
| 85-100 | 5-10 years younger |
| 70-84 | Roughly chronological age |
| 55-69 | 3-7 years older |
| Below 55 | 8-15 years older |

### Score Labels

| Score | Label |
|---|---|
| 90-100 | Optimal |
| 80-89 | Strong |
| 70-79 | Average |
| 60-69 | Below Average |
| Below 60 | Needs Attention |

### Treatment Mapping

| Lowest Dimensions | Recommended Treatments |
|---|---|
| Energy + Sleep | NAD+ IV (£295) |
| Cognitive + Energy | IV Methylene Blue (£395) + NAD+ IV |
| Immune + Stress | Immunity IV (£295) + Myers Cocktail (£295) |
| Metabolic + Energy | Metabolic Health Programme (£1,500) |
| Skin + Cellular | Skin Glow IV (£299) |
| Multiple low / chronic | EBOO Therapy (£1,995) + Phospholipid Exchange (£425) |
| Detox signals | Detox IV (£399) |

Always recommends 2-3 treatments. Upsell logic: if 3+ dimensions below 60, recommend EBOO or 10-Session Package.

## Personalized Report (Claude API — Sonnet 4.6)

### Structure

**Section A: Hero Score**
- Animated wellness score gauge (gold ring)
- Biological age vs chronological age comparison
- One-line AI-generated verdict

**Section B: Dimension Breakdown**
- Radar/spider chart (gold on dark)
- Score bars per dimension with category icons
- AI-generated 2-3 sentence narrative per dimension

**Section C: Key Risk Factors**
- Top 3 risk factors identified from answers
- Plain language biological mechanism explanation

**Section D: Personalized Treatment Plan**
- Primary recommendation with "Why this is right for you"
- 1-2 supporting treatments
- Treatment timeline: Month 1 → Month 2 → Month 3

**Section E: Next Steps**
- CTA: Book Free Consultation (London or Glasgow)
- CTA: Download Full Report as PDF
- CTA: Chat with AI Wellness Advisor

### Claude API Call

```
System: Harley Street longevity specialist persona
Input: All 16 quiz answers + calculated scores + dimension breakdown
Output: Structured JSON with all report sections
Model: Sonnet 4.6
```

Single API call generates entire report.

## Post-Report Chatbot (Claude API — Sonnet 4.6)

### Capabilities
- Answer questions about specific scores
- Explain treatments in detail (mechanism, duration, safety)
- Handle objections (pricing, safety, evidence)
- Compare treatments for their situation
- Soft booking nudges

### Guardrails
- No medical diagnoses
- No contradicting doctor's advice
- No claims beyond clinic scope
- No competitor discussion
- 20 message limit per session

### Context Passed
- Full quiz answers + scores
- Recommended treatments
- Clinic pricing and treatment info
- Conversation history

## GoHighLevel Integration

Webhook payload on lead capture:
- First name, email, phone
- All 16 quiz answers (raw)
- Wellness score (0-100)
- Biological age estimate
- All 9 dimension scores
- Recommended treatments (names + prices)
- Location preference (London / Glasgow)
- Quiz completion timestamp
- Facebook click ID (for attribution)

Email sequences built entirely in GoHighLevel — not in this app.

## Facebook Pixel Events

| Event | Trigger |
|---|---|
| PageView | Landing page load |
| StartQuiz | Q1 begins |
| QuizComplete | Q16 finished |
| Lead | Contact form submitted |
| DownloadReport | PDF downloaded |
| ChatStarted | Chatbot opened |
| BookingClick | Consultation CTA clicked |

## SEO Strategy

- Keywords: "biological age test UK", "longevity assessment London", "IV therapy quiz", "wellness score test"
- Schema markup: MedicalWebPage, Quiz, FAQPage
- Meta tags, Open Graph, Twitter cards
- Fast Core Web Vitals (Next.js + Vercel)
- Blog-ready `/resources` section for future content

## GEO Strategy (AI Search Visibility)

- Structured content for AI overview citation
- llms.txt file for AI crawler accessibility
- Passage-level citability on treatment explanations
- Brand mention signals linking to main domain

## Design System

### Colors
- Background: #0A0A0A, #141414
- Primary: #D4A853, #F5C842 (gold)
- Secondary: #C4942A (amber)
- Text: #FFFFFF, #A0A0A0
- Danger: #DC3545 (needs attention scores)
- Gradients: black-to-charcoal backgrounds, gold shimmer on CTAs

### Typography
- Headings: Space Grotesk (geometric, tech-forward)
- Body: Inter (clean, readable)
- Data/scores: Tabular figures

### UI Elements
- Gold-bordered cards on dark backgrounds
- Animated score counters
- Radar chart with gold lines
- Progress bar with gold fill + trailing glow dot
- Circuit-board background patterns (subtle)
- Micro-animations on all transitions
- Premium SVG icons throughout (Lucide-style)

### Mobile-First
- One question per screen
- Large tap targets
- Thumb-friendly button placement
- 60% of traffic expected from mobile

## API Cost Estimate

| Call | Model | Cost |
|---|---|---|
| 3 micro-insights | Haiku 4.5 | ~$0.003 |
| 2 adaptive questions | Haiku 4.5 | ~$0.002 |
| 1 report generation | Sonnet 4.6 | ~$0.03 |
| ~5 chatbot messages | Sonnet 4.6 | ~$0.05 |
| **Total per lead** | | **~$0.08-0.10** |

## Security & Compliance

- GDPR consent checkbox on lead form
- HTTPS encryption in transit
- Privacy policy link
- Cookie consent for Facebook Pixel
- No medical data stored beyond session
- Disclaimer: "Indicative wellness assessment, not a medical diagnosis"

## Out of Scope

- Email sequences (GoHighLevel)
- Booking system (links to existing)
- Admin dashboard (GoHighLevel CRM)
- User accounts / login
- Payment processing
