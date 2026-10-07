import { jsPDF } from "jspdf";
import { CLINIC, consultationHost, type ClinicLocation } from "@/lib/clinic";
import { CONCERN_GUIDES } from "@/lib/concerns";
import { DISCLAIMER, METHODOLOGY_NOTE } from "@/lib/evidence";
import { PROTOCOL_STAGES, protocolUrl, type Protocol } from "@/lib/protocols";
import { templateSummary } from "@/lib/summary";
import type { FactorResult, LeadData, LifestyleAgeResult } from "@/lib/types";

/* ─── Colour Palette ─── */
const BG = "#0A0A0A";
const BG_CARD = "#141414";
const BORDER = "#1A1A1A";
const GOLD = "#D4A853";
const WHITE = "#FFFFFF";
const MUTED = "#A0A0A0";
const AMBER = "#FBBF24";
const GREEN = "#22C55E";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

function rgb(color: string): [number, number, number] {
  return [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
}

function yearsLabel(years: number): string {
  if (years === 0) return "No effect";
  const abs = Math.abs(years);
  return `${years > 0 ? "+" : "-"}${abs} ${abs === 1 ? "year" : "years"}`;
}

/** Small layout helper that tracks the cursor and breaks pages. */
class Doc {
  pdf = new jsPDF({ unit: "mm", format: "a4" });
  y = 0;

  constructor() {
    this.paintPage();
  }

  private paintPage() {
    this.pdf.setFillColor(...rgb(BG));
    this.pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
    this.y = MARGIN;
  }

  ensure(height: number) {
    if (this.y + height > PAGE_H - MARGIN) {
      this.pdf.addPage();
      this.paintPage();
    }
  }

  text(content: string, opts: { size?: number; color?: string; bold?: boolean; gap?: number; align?: "left" | "center" } = {}) {
    const { size = 10, color = WHITE, bold = false, gap = 2, align = "left" } = opts;
    this.pdf.setFont("helvetica", bold ? "bold" : "normal");
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(...rgb(color));
    const lines: string[] = this.pdf.splitTextToSize(content, CONTENT_W);
    const lineHeight = size * 0.45;
    for (const line of lines) {
      this.ensure(lineHeight);
      this.pdf.text(line, align === "center" ? PAGE_W / 2 : MARGIN, this.y + lineHeight * 0.8, { align });
      this.y += lineHeight;
    }
    this.y += gap;
  }

  heading(label: string, title: string) {
    this.ensure(20);
    this.y += 4;
    this.text(label.toUpperCase(), { size: 7.5, color: GOLD, bold: true, gap: 1 });
    this.text(title, { size: 14, bold: true, gap: 4 });
  }

  factorRow(f: FactorResult) {
    this.ensure(13);
    this.pdf.setFillColor(...rgb(BG_CARD));
    this.pdf.setDrawColor(...rgb(BORDER));
    this.pdf.roundedRect(MARGIN, this.y, CONTENT_W, 11, 2, 2, "FD");
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(9.5);
    this.pdf.setTextColor(...rgb(WHITE));
    this.pdf.text(f.name, MARGIN + 4, this.y + 4.8);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...rgb(MUTED));
    this.pdf.text(this.pdf.splitTextToSize(`You said: ${f.answerLabel}`, CONTENT_W - 40)[0], MARGIN + 4, this.y + 8.8);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(9.5);
    this.pdf.setTextColor(...rgb(f.years > 0 ? AMBER : f.years < 0 ? GREEN : MUTED));
    this.pdf.text(yearsLabel(f.years), PAGE_W - MARGIN - 4, this.y + 6.8, { align: "right" });
    this.y += 13;
  }
}

export interface ReportPdfInput {
  result: LifestyleAgeResult;
  lead: LeadData;
  location: ClinicLocation;
  qualified?: boolean;
  protocols?: Protocol[];
}

/** Builds the patient's Biological Age Report. Shared by the download route and the emailed copy. */
export function buildReportPdf({ result, lead, location, qualified = true, protocols = [] }: ReportPdfInput): Buffer {
  const site = CLINIC.locations[location] ?? CLINIC.locations.London;
  const doc = new Doc();

  // ── Header ──
  doc.text(CLINIC.brand.toUpperCase(), { size: 8, color: GOLD, bold: true, gap: 1 });
  doc.text("Biological Age Report", { size: 20, bold: true, gap: 1 });
  doc.text(
    `${lead?.firstName ? `Prepared for ${lead.firstName} · ` : ""}${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    { size: 9, color: MUTED, gap: 8 }
  );

  // ── Estimate ──
  doc.text("YOUR BIOLOGICAL AGE ESTIMATE", { size: 7.5, color: MUTED, bold: true, gap: 3, align: "center" });
  doc.text(`${result.low}–${result.high}`, { size: 44, color: GOLD, bold: true, gap: 3, align: "center" });
  doc.text(`Calendar age ${result.chronologicalAge}`, { size: 10, color: MUTED, gap: 6, align: "center" });
  doc.text(templateSummary(result, lead?.firstName ?? "", qualified), { size: 10, gap: 3 });
  doc.text("An estimate based on your lifestyle answers, shown as a range. It is not a lab measurement. The blood and epigenetic tests in a wellness consultation give a lab-based estimate.", { size: 8.5, color: MUTED, gap: 4 });

  // ── Factors ──
  doc.heading("What's behind your number", "Your answers, against the research");
  const ordered = [...result.factors].sort((a, b) => b.years - a.years);
  for (const f of ordered) doc.factorRow(f);
  doc.text("The factors overlap, so your total is capped and may be less than the sum of the rows.", { size: 8, color: MUTED, gap: 4 });

  // ── What would change it ──
  const improvements = result.factors.filter((f) => f.improvement);
  if (improvements.length > 0) {
    doc.heading("What would change your number", "Where the research points");
    for (const f of improvements) {
      const change = f.years - f.improvement!.years;
      doc.text(`•  ${f.improvement!.label}: about ${change} ${change === 1 ? "year" : "years"} lower, on average`, { size: 9.5, gap: 1.5 });
    }
    doc.text("Population averages from observational studies, not a promise about what will happen for you.", { size: 8, color: MUTED, gap: 4 });
  }

  // ── Concerns ──
  const concerns = result.concerns.filter((c) => CONCERN_GUIDES[c]);
  if (concerns.length > 0) {
    doc.heading("What you told us", "Worth checking properly");
    doc.text("These did not change your estimate. Each has ordinary causes that are simple to check.", { size: 9, color: MUTED, gap: 3 });
    for (const c of concerns) {
      const g = CONCERN_GUIDES[c];
      doc.ensure(24);
      doc.text(c, { size: 10.5, bold: true, gap: 1.5 });
      doc.text(`Common causes: ${g.causes.join(", ")}.`, { size: 9, gap: 1 });
      doc.text(`Usually checked: ${g.tests.join(", ")}.`, { size: 9, gap: 1 });
      doc.text(g.redFlags, { size: 8.5, color: AMBER, gap: 4 });
    }
  }

  // People who said they would not invest get the estimate and the research, with no offer
  if (qualified) {
    // ── Protocols ──
    if (protocols.length > 0) {
      doc.heading("Where you'd start with us", "The protocol that fits what you told us");
      for (const p of protocols) {
        doc.ensure(22);
        doc.text(`${p.name} — ${p.concern}`, { size: 10.5, bold: true, gap: 1.5 });
        doc.text(p.summary, { size: 9.5, gap: 1 });
        doc.text(`May include, after assessment: ${p.components.map((c) => c.name).join(", ")}.`, { size: 9, color: MUTED, gap: 1 });
        doc.text(protocolUrl(p, location), { size: 8.5, color: GOLD, gap: 3 });
      }
      doc.text(PROTOCOL_STAGES.map((s, i) => `${i + 1}. ${s.title}`).join("   "), { size: 9.5, bold: true, gap: 1.5 });
      doc.text("A protocol is a pathway, not a prescription. A listed component is an option for individual review, and the evidence for each differs. Which, if any, are right for you is confirmed by your clinician after assessment.", { size: 8.5, color: MUTED, gap: 4 });
    }

    // ── What a questionnaire can't see ──
    doc.heading("The other half of the picture", "What a questionnaire can't see");
    doc.text("•  Your blood markers: blood sugar, iron stores, thyroid, vitamin D, cholesterol and inflammation.", { size: 9.5, gap: 1.5 });
    doc.text("•  An epigenetic age estimate from a saliva sample. A wellness test, not a diagnosis, typically within about five years of calendar age.", { size: 9.5, gap: 1.5 });
    doc.text("•  Your history and medications, which change what is worth testing.", { size: 9.5, gap: 4 });

    // ── Next step ──
    doc.heading("Your next step", `A free ${CLINIC.consultation.minutes}-minute consultation`);
    doc.text(`With ${consultationHost()}, by phone or video. We'll walk through your results, tell you which tests are worth doing, and outline what a plan could look like. No obligation.`, { size: 10, gap: 3 });
    doc.text(`Book: ${CLINIC.bookingUrl}`, { size: 9.5, color: GOLD, gap: 1.5 });
    doc.text(`${CLINIC.phone} · ${CLINIC.email}`, { size: 9.5, gap: 1.5 });
    doc.text(`${site.address} · Regulated by the ${site.regulator}`, { size: 8.5, color: MUTED, gap: 6 });
  }

  // ── Method & disclaimer ──
  doc.heading("How we work it out", "Methodology");
  doc.text(METHODOLOGY_NOTE, { size: 8.5, color: MUTED, gap: 3 });
  doc.text(DISCLAIMER, { size: 8.5, color: MUTED, gap: 3 });
  const sources = [...new Map(result.factors.flatMap((f) => f.citations).map((c) => [c.id, c])).values()];
  doc.text("Sources", { size: 9, bold: true, gap: 1.5 });
  for (const c of sources) doc.text(c.full, { size: 7.5, color: MUTED, gap: 1 });

  return Buffer.from(doc.pdf.output("arraybuffer"));
}
