import type { Metadata } from "next";
import Link from "next/link";
import { CLINIC } from "@/lib/clinic";
import { CITATIONS, DISCLAIMER, METHODOLOGY_NOTE } from "@/lib/evidence";

export const metadata: Metadata = {
  title: `How the Lifestyle Age Estimate works | ${CLINIC.brand}`,
  description: "The method, the studies and the limits behind the lifestyle age estimate.",
};

const FACTORS = [
  { name: "Smoking", range: "0 to +6 years", evidence: "Strong" },
  { name: "Physical activity", range: "−2 to +2.5 years", evidence: "Strong" },
  { name: "Body weight (BMI)", range: "−0.5 to +4 years", evidence: "Strong" },
  { name: "Diet", range: "−1.5 to +1.5 years", evidence: "Moderate" },
  { name: "Sleep", range: "−0.5 to +2 years", evidence: "Moderate" },
  { name: "Alcohol", range: "0 to +2 years", evidence: "Moderate" },
  { name: "Stress", range: "−0.5 to +1.5 years", evidence: "Early" },
  { name: "Social connection", range: "−0.5 to +1 year", evidence: "Early" },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="mx-auto max-w-[640px] px-5 py-12 text-[14px] leading-relaxed text-muted/80">
        <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-2">Methodology</p>
        <h1 className="font-heading text-3xl font-bold text-white mb-6">How the lifestyle age estimate works</h1>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">What it is</h2>
        <p>
          An estimate, from a questionnaire, of how your day-to-day habits compare with those of people your age in
          large population studies. It is shown as a range of plus or minus two years because no questionnaire can be exact.
        </p>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">What it is not</h2>
        <p>
          It is not a measurement of biological age, and it is not a medical test. Biological age can only be measured
          from blood or DNA markers, and even those tests carry real uncertainty. Nothing in your result diagnoses,
          treats or prevents any condition.
        </p>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">How the years are worked out</h2>
        <p>{METHODOLOGY_NOTE}</p>
        <p className="mt-3">
          For anyone under 30 the effects are halved, because most of the research was done in people over 40. Smoking is
          the only factor that can push an estimate more than eight years above calendar age.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[1.5px] text-muted/50">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Factor</th>
                <th className="px-4 py-2.5 font-semibold">Range</th>
                <th className="px-4 py-2.5 font-semibold">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {FACTORS.map((f) => (
                <tr key={f.name} className="border-t border-white/5">
                  <td className="px-4 py-2.5 text-white/85">{f.name}</td>
                  <td className="px-4 py-2.5 tabular-nums">{f.range}</td>
                  <td className="px-4 py-2.5">{f.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">What doesn&apos;t count</h2>
        <p>
          Symptoms such as tiredness, brain fog or skin changes do not move your estimate. No study links them to
          biological age, and each has several ordinary medical causes that deserve a proper check. We show them in your
          report as things to discuss, with the tests a clinician would usually consider.
        </p>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">The limits</h2>
        <p>
          The studies are observational: they show what tends to be true across many thousands of people, not what will
          happen to you. Answers are self-reported. BMI cannot tell muscle from fat. And a questionnaire cannot see your
          blood pressure, blood sugar, cholesterol or family history, which matter at least as much.
        </p>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">Can the number be changed?</h2>
        <p>
          Randomised trials show that lifestyle changes produce small, measurable shifts in DNA-based ageing markers: about
          2–3% slower pace of ageing after two years of calorie restriction, and a few months&apos; difference over three
          years with omega-3, vitamin D and exercise. Those are real but modest effects, and no trial has shown that
          changing such a marker makes people live longer. We don&apos;t promise to change yours.
        </p>

        <h2 className="font-heading text-lg font-bold text-white mt-8 mb-2">Sources</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[12.5px]">
          {Object.values(CITATIONS).map((c) => (
            <li key={c.id}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold/80">
                {c.full}
              </a>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-[11.5px] text-muted/50">{DISCLAIMER}</p>

        <Link href="/quiz" className="gold-gradient mt-8 inline-flex rounded-xl px-6 py-3.5 font-heading text-sm font-bold text-bg">
          Take the questionnaire →
        </Link>
      </article>
    </main>
  );
}
