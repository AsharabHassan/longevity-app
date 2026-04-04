import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

/* ─── Colour Palette ─── */
const BG       = "#0A0A0A";
const BG_CARD  = "#141414";
const BORDER   = "#1A1A1A";
const GOLD     = "#D4A853";
const WHITE    = "#FFFFFF";
const MUTED    = "#A0A0A0";
const RED      = "#EF4444";
const GREEN    = "#22C55E";

/* ─── Helpers ─── */
function hex(pdf: jsPDF, hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function setColor(pdf: jsPDF, color: string) {
  const { r, g, b } = hex(pdf, color);
  pdf.setTextColor(r, g, b);
}

function setFill(pdf: jsPDF, color: string) {
  const { r, g, b } = hex(pdf, color);
  pdf.setFillColor(r, g, b);
}

function setDraw(pdf: jsPDF, color: string) {
  const { r, g, b } = hex(pdf, color);
  pdf.setDrawColor(r, g, b);
}

function drawRect(pdf: jsPDF, x: number, y: number, w: number, h: number, fill: string, stroke?: string) {
  setFill(pdf, fill);
  if (stroke) {
    setDraw(pdf, stroke);
    pdf.roundedRect(x, y, w, h, 2, 2, "FD");
  } else {
    pdf.roundedRect(x, y, w, h, 2, 2, "F");
  }
}

/** Wrap text into lines that fit within maxWidth */
function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  return pdf.splitTextToSize(text, maxWidth);
}

/* ─── Main PDF Builder ─── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadName = "",
      leadEmail = "",
      leadPhone = "",
      wellnessScore = 0,
      biologicalAge = 0,
      chronologicalAge = 35,
      dimensions = [],
      treatments = null,
      reportData = null,
    } = body;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();   // 210
    const pageH = pdf.internal.pageSize.getHeight();  // 297
    const margin = 15;
    const contentW = pageW - margin * 2;

    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });

    /* ═══════════════════════ PAGE 1: Overview ═══════════════════════ */

    // Full page background
    setFill(pdf, BG);
    pdf.rect(0, 0, pageW, pageH, "F");

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    setColor(pdf, GOLD);
    pdf.text("HARLEY STREET WELLNESS", margin, 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setColor(pdf, MUTED);
    pdf.text(currentDate, pageW - margin, 18, { align: "right" });
    pdf.text("1-5 Portpool Lane, London EC1N 7UU", pageW - margin, 23, { align: "right" });

    // Divider
    setDraw(pdf, BORDER);
    pdf.line(margin, 28, pageW - margin, 28);

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    setColor(pdf, WHITE);
    pdf.text("Your Longevity Scan", margin, 42);

    // Subtitle
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    setColor(pdf, MUTED);
    const subtitleLines = wrapText(
      pdf,
      `Prepared exclusively for ${leadName || "you"}. This report analyzes your cellular health markers to reveal your true biological age and provides a personalized protocol to optimize it.`,
      contentW
    );
    pdf.text(subtitleLines, margin, 52);

    let y = 52 + subtitleLines.length * 5 + 8;

    // Patient Info
    if (leadName) {
      drawRect(pdf, margin, y, contentW, 14, BG_CARD, BORDER);
      pdf.setFontSize(9);
      setColor(pdf, MUTED);
      pdf.text(`Patient: `, margin + 4, y + 9);
      setColor(pdf, WHITE);
      pdf.text(leadName, margin + 22, y + 9);
      if (leadEmail) {
        setColor(pdf, MUTED);
        pdf.text(`Email: ${leadEmail}`, margin + 70, y + 9);
      }
      if (leadPhone) {
        setColor(pdf, MUTED);
        pdf.text(`Phone: ${leadPhone}`, margin + 130, y + 9);
      }
      y += 20;
    }

    // ── Score Hero Card ──
    drawRect(pdf, margin, y, contentW, 55, BG_CARD, BORDER);

    // Biological Age
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setColor(pdf, MUTED);
    pdf.text("BIOLOGICAL AGE", margin + 8, y + 12);
    pdf.setFontSize(32);
    setColor(pdf, GOLD);
    pdf.text(String(biologicalAge), margin + 8, y + 35);
    pdf.setFontSize(9);
    setColor(pdf, MUTED);
    pdf.text(`Chronological: ${chronologicalAge}`, margin + 8, y + 43);

    // Wellness Score
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setColor(pdf, MUTED);
    pdf.text("WELLNESS SCORE", margin + contentW / 2 + 5, y + 12);
    pdf.setFontSize(32);
    setColor(pdf, WHITE);
    pdf.text(`${wellnessScore}/100`, margin + contentW / 2 + 5, y + 35);
    pdf.setFontSize(9);
    setColor(pdf, MUTED);
    pdf.text("Target: 90+", margin + contentW / 2 + 5, y + 43);

    y += 60;

    // Verdict
    if (reportData?.verdict) {
      drawRect(pdf, margin, y, contentW, 25, BG_CARD, BORDER);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      setColor(pdf, GOLD);
      const verdictLines = wrapText(pdf, reportData.verdict, contentW - 12);
      pdf.text(verdictLines.slice(0, 3), margin + 6, y + 8);
      y += Math.max(25, verdictLines.length * 4 + 12);
    }

    y += 5;

    // ── System Analysis: Dimension Bars ──
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    setColor(pdf, GOLD);
    pdf.text("System Analysis", margin, y + 5);
    y += 12;

    for (const dim of dimensions) {
      if (y > pageH - 25) {
        pdf.addPage();
        setFill(pdf, BG);
        pdf.rect(0, 0, pageW, pageH, "F");
        y = margin;
      }

      // Dimension name and score
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      setColor(pdf, WHITE);
      pdf.text(dim.name, margin, y + 4);
      setColor(pdf, GOLD);
      pdf.text(`${dim.score}/100`, pageW - margin, y + 4, { align: "right" });

      // Bar track
      const barY = y + 7;
      const barH = 4;
      drawRect(pdf, margin, barY, contentW, barH, BORDER);

      // Bar fill
      const fillW = (dim.score / 100) * contentW;
      const barColor = dim.score >= 80 ? GREEN : dim.score >= 60 ? GOLD : RED;
      drawRect(pdf, margin, barY, fillW, barH, barColor);

      y += 16;
    }

    // ── Footer Page 1 ──
    setDraw(pdf, BORDER);
    pdf.line(margin, pageH - 15, pageW - margin, pageH - 15);
    pdf.setFontSize(8);
    setColor(pdf, "#666666");
    pdf.text("Harley Street Medical Wellness", margin, pageH - 10);
    pdf.text("Page 1", pageW - margin, pageH - 10, { align: "right" });

    /* ═══════════════════════ PAGE 2: Clinical Insights ═══════════════════════ */
    pdf.addPage();
    setFill(pdf, BG);
    pdf.rect(0, 0, pageW, pageH, "F");

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    setColor(pdf, GOLD);
    pdf.text("CLINICAL INSIGHTS", margin, 20);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setColor(pdf, MUTED);
    pdf.text("System-by-System Analysis", pageW - margin, 20, { align: "right" });
    setDraw(pdf, BORDER);
    pdf.line(margin, 25, pageW - margin, 25);

    y = 35;

    // Dimension Narratives
    if (reportData?.dimensionNarratives) {
      for (const [key, text] of Object.entries(reportData.dimensionNarratives)) {
        const narr = String(text);
        const lines = wrapText(pdf, narr, contentW - 12);
        const boxH = 10 + lines.length * 4.5;

        if (y + boxH > pageH - 20) {
          // Footer before page break
          setDraw(pdf, BORDER);
          pdf.line(margin, pageH - 15, pageW - margin, pageH - 15);
          pdf.setFontSize(8);
          setColor(pdf, "#666666");
          pdf.text(`Patient: ${leadName}`, margin, pageH - 10);
          pdf.text("Page 2", pageW - margin, pageH - 10, { align: "right" });

          pdf.addPage();
          setFill(pdf, BG);
          pdf.rect(0, 0, pageW, pageH, "F");
          y = margin;
        }

        drawRect(pdf, margin, y, contentW, boxH, BG_CARD, BORDER);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        setColor(pdf, GOLD);
        pdf.text(key, margin + 6, y + 8);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        setColor(pdf, MUTED);
        pdf.text(lines, margin + 6, y + 14);

        y += boxH + 4;
      }
    }

    // Risk Factors
    if (reportData?.riskFactors && reportData.riskFactors.length > 0) {
      if (y + 20 > pageH - 20) {
        pdf.addPage();
        setFill(pdf, BG);
        pdf.rect(0, 0, pageW, pageH, "F");
        y = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      setColor(pdf, RED);
      pdf.text("Primary Time Thieves", margin, y + 5);
      y += 12;

      for (const risk of reportData.riskFactors) {
        const lines = wrapText(pdf, risk.explanation, contentW - 12);
        const boxH = 14 + lines.length * 4.5;

        if (y + boxH > pageH - 20) {
          pdf.addPage();
          setFill(pdf, BG);
          pdf.rect(0, 0, pageW, pageH, "F");
          y = margin;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        setColor(pdf, RED);
        pdf.text(`! ${risk.title}`, margin + 4, y + 8);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        setColor(pdf, MUTED);
        pdf.text(lines, margin + 4, y + 15);

        y += boxH + 4;
      }
    }

    // Footer Page 2
    setDraw(pdf, BORDER);
    pdf.line(margin, pageH - 15, pageW - margin, pageH - 15);
    pdf.setFontSize(8);
    setColor(pdf, "#666666");
    pdf.text(`Patient: ${leadName}`, margin, pageH - 10);
    pdf.text("Page 2", pageW - margin, pageH - 10, { align: "right" });

    /* ═══════════════════════ PAGE 3: Treatment Protocol ═══════════════════════ */
    pdf.addPage();
    setFill(pdf, BG);
    pdf.rect(0, 0, pageW, pageH, "F");

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    setColor(pdf, GOLD);
    pdf.text("TREATMENT PROTOCOL", margin, 20);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setColor(pdf, MUTED);
    pdf.text("Recommended by Cellular AI", pageW - margin, 20, { align: "right" });
    setDraw(pdf, BORDER);
    pdf.line(margin, 25, pageW - margin, 25);

    y = 35;

    if (treatments && reportData?.treatmentPlan) {
      // Primary Treatment
      const primaryReasoning = reportData.treatmentPlan.primary?.reasoning || "";
      const primaryLines = wrapText(pdf, primaryReasoning, contentW - 14);
      const primaryH = 28 + primaryLines.length * 4.5;

      drawRect(pdf, margin, y, contentW, primaryH, BG_CARD, GOLD);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      setColor(pdf, GOLD);
      pdf.text("PRIMARY INTERVENTION", margin + 7, y + 10);

      pdf.setFontSize(16);
      setColor(pdf, WHITE);
      pdf.text(treatments.primary?.name || "Treatment", margin + 7, y + 22);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      setColor(pdf, MUTED);
      pdf.text(primaryLines, margin + 7, y + 30);

      y += primaryH + 8;

      // Supporting Treatments
      if (treatments.supporting && treatments.supporting.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        setColor(pdf, GOLD);
        pdf.text("Supporting Synergies", margin, y + 4);
        y += 12;

        treatments.supporting.forEach((supp: { name: string; description: string }, i: number) => {
          const reasoningObj = reportData.treatmentPlan.supporting?.find(
            (r: { name: string; reasoning: string }) => r.name === supp.name
          );
          const reasoning = reasoningObj?.reasoning || supp.description || "";
          const lines = wrapText(pdf, reasoning, contentW - 14);
          const boxH = 28 + lines.length * 4.5;

          if (y + boxH > pageH - 30) {
            pdf.addPage();
            setFill(pdf, BG);
            pdf.rect(0, 0, pageW, pageH, "F");
            y = margin;
          }

          drawRect(pdf, margin, y, contentW, boxH, BG_CARD, BORDER);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          setColor(pdf, GOLD);
          pdf.text(`SUPPORTING · ${i + 1}`, margin + 7, y + 10);

          pdf.setFontSize(14);
          setColor(pdf, WHITE);
          pdf.text(supp.name, margin + 7, y + 22);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          setColor(pdf, MUTED);
          pdf.text(lines, margin + 7, y + 30);

          y += boxH + 6;
        });
      }

      // Timeline — formatted with phased milestones
      if (reportData.treatmentPlan.timeline) {
        if (y + 40 > pageH - 35) {
          pdf.addPage();
          setFill(pdf, BG);
          pdf.rect(0, 0, pageW, pageH, "F");
          y = margin;
        }

        // Section header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        setColor(pdf, GOLD);
        pdf.text("Clinical Timeline", margin, y + 5);
        y += 14;

        // Parse timeline text into phases
        // The AI returns: "Month 1: ... → Month 2: ... → Month 3: ..."
        // Split on → first, then try newlines, then "Month/Week/Phase N:" patterns
        const rawTimeline = reportData.treatmentPlan.timeline;
        let phases: string[];

        if (rawTimeline.includes("→")) {
          phases = rawTimeline.split("→").map((s: string) => s.trim()).filter((s: string) => s.length > 3);
        } else if (rawTimeline.includes("\n")) {
          phases = rawTimeline.split("\n").map((s: string) => s.trim()).filter((s: string) => s.length > 3);
        } else {
          // Try splitting on "Month N:" or "Week N:" or "Phase N:" patterns
          const monthSplit = rawTimeline.split(/(?=(?:[Mm]onth|[Ww]eek|[Pp]hase)\s+\d+\s*:)/).map((s: string) => s.trim()).filter((s: string) => s.length > 3);
          phases = monthSplit.length > 1 ? monthSplit : [rawTimeline];
        }

        const timelinePhases = phases.length > 0 ? phases : [rawTimeline];

        // Extract phase label from content, or generate one
        const extractLabel = (text: string, idx: number): { label: string; body: string } => {
          // Try matching "Month 1:", "Week 2:", "Phase 3:", etc. at the start
          const match = text.match(/^((?:[Mm]onth|[Ww]eek|[Pp]hase)\s+\d+)\s*:\s*([\s\S]*)/);
          if (match) {
            return { label: match[1].toUpperCase(), body: match[2].trim() };
          }
          return { label: `PHASE ${idx + 1}`, body: text };
        };

        const dotX = margin + 8;
        const textX = margin + 22;
        const maxTextW = contentW - 28;
        const phaseGap = 6;
        const phasePadTop = 5;
        const phasePadBottom = 5;
        const labelToTextGap = 5;

        // Pre-measure all phases
        const phaseMeasurements: { label: string; body: string; lines: string[]; phaseH: number }[] = [];
        for (let i = 0; i < timelinePhases.length; i++) {
          const { label, body } = extractLabel(timelinePhases[i], i);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          const lines = wrapText(pdf, body, maxTextW);
          const phaseH = phasePadTop + 4 + labelToTextGap + lines.length * 4.2 + phasePadBottom;
          phaseMeasurements.push({ label, body, lines, phaseH });
        }

        // Calculate total card height
        const cardPadding = 10;
        let totalH = cardPadding * 2;
        for (let i = 0; i < phaseMeasurements.length; i++) {
          totalH += phaseMeasurements[i].phaseH;
          if (i < phaseMeasurements.length - 1) totalH += phaseGap;
        }

        // Check if entire timeline fits on current page, if not start new page
        if (y + totalH > pageH - 25) {
          pdf.addPage();
          setFill(pdf, BG);
          pdf.rect(0, 0, pageW, pageH, "F");
          y = margin;

          // Re-draw section header on new page
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          setColor(pdf, GOLD);
          pdf.text("Clinical Timeline", margin, y + 5);
          y += 14;
        }

        // Background card
        drawRect(pdf, margin, y, contentW, totalH, BG_CARD, BORDER);

        let ty = y + cardPadding;

        for (let idx = 0; idx < phaseMeasurements.length; idx++) {
          const { label, lines, phaseH } = phaseMeasurements[idx];
          const dotCenterY = ty + phasePadTop + 2;

          // Gold dot (milestone marker)
          setFill(pdf, GOLD);
          pdf.circle(dotX, dotCenterY, 2.5, "F");

          // Connecting line to next phase
          if (idx < phaseMeasurements.length - 1) {
            const lineStartY = dotCenterY + 3;
            const lineEndY = ty + phaseH + phaseGap - 2;
            setDraw(pdf, "#333333");
            pdf.setLineWidth(0.5);
            pdf.line(dotX, lineStartY, dotX, lineEndY);
          }

          // Phase label (e.g. "MONTH 1", "PHASE 2")
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          setColor(pdf, GOLD);
          pdf.text(label, textX, ty + phasePadTop + 3);

          // Phase body text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          setColor(pdf, WHITE);
          pdf.text(lines, textX, ty + phasePadTop + 3 + labelToTextGap);

          ty += phaseH + phaseGap;
        }

        y += totalH + 10;
      }
    }

    /* ═══════════════════ CTA BUTTON ═══════════════════ */
    if (y + 55 > pageH - 20) {
      pdf.addPage();
      setFill(pdf, BG);
      pdf.rect(0, 0, pageW, pageH, "F");
      y = margin;
    }

    // Divider
    setDraw(pdf, BORDER);
    pdf.line(margin, y, pageW - margin, y);
    y += 10;

    // "Ready to start your recovery?" heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    setColor(pdf, WHITE);
    pdf.text("Ready to start your recovery?", margin, y + 4);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    setColor(pdf, MUTED);
    pdf.text("Book a free 15-minute consultation to discuss your personalised protocol.", margin, y + 4);
    y += 14;

    // Gold CTA Button
    const btnW = 120;
    const btnH = 14;
    const btnX = margin + (contentW - btnW) / 2; // centered
    const btnY = y;

    // Gold gradient fill
    setFill(pdf, GOLD);
    pdf.roundedRect(btnX, btnY, btnW, btnH, 3, 3, "F");

    // Button text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    setColor(pdf, BG);
    const btnText = "BOOK FREE CONSULTATION";
    const btnTextW = pdf.getTextWidth(btnText);
    pdf.text(btnText, btnX + (btnW - btnTextW) / 2, btnY + 9.5);

    // Clickable link annotation over the button area
    const bookingUrl = "https://link.harleystreetmedicalwellness.co.uk/widget/bookings/wellness-consultant-1";
    pdf.link(btnX, btnY, btnW, btnH, { url: bookingUrl });

    y += btnH + 8;

    // Trust signals below CTA
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    setColor(pdf, "#666666");
    const trustText = "1-5 Portpool Lane, London EC1N 7UU  ·  GMC Registered  ·  5.0 Rating (200+ reviews)";
    const trustW = pdf.getTextWidth(trustText);
    pdf.text(trustText, margin + (contentW - trustW) / 2, y + 3);

    // Footer Page 3
    setDraw(pdf, BORDER);
    pdf.line(margin, pageH - 15, pageW - margin, pageH - 15);
    pdf.setFontSize(8);
    setColor(pdf, "#666666");
    pdf.text("Not medical advice.", margin, pageH - 10);
    pdf.text("Page 3", pageW - margin, pageH - 10, { align: "right" });

    /* ═══════════════════════ Output ═══════════════════════ */
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Longevity-Scan-${leadName || "Report"}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
