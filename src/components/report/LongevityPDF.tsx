import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { ReportData, DimensionScore, TreatmentRecommendation } from "@/lib/types";

// Removed custom Font.register to fix 'Unknown font format' parsing errors.
// Using standard built-in PDF fonts (Helvetica / Helvetica-Bold).

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0A0A0A",
    color: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderBottom: "1px solid #1A1A1A",
    paddingBottom: 20,
  },
  brandName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: "#D4A853",
  },
  headerRight: {
    fontSize: 10,
    color: "#A0A0A0",
    textAlign: "right",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 32,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 30,
    lineHeight: 1.5,
  },

  // Score Hero
  scoreHero: {
    backgroundColor: "#141414",
    padding: 30,
    borderRadius: 8,
    marginBottom: 30,
    border: "1px solid #1A1A1A",
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 20,
  },
  scoreCol: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 10,
    color: "#A0A0A0",
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  scoreValueGold: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#D4A853",
  },
  verdict: {
    fontSize: 14,
    color: "#D4A853",
    marginTop: 20,
    borderTop: "1px solid #222222",
    paddingTop: 15,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },

  // Section Headers
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    marginTop: 30,
    marginBottom: 15,
    color: "#D4A853",
  },

  // Dimension Bars
  dimensionItem: {
    marginBottom: 15,
  },
  dimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  dimName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  dimScore: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#D4A853",
  },
  barTrack: {
    height: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 3,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#D4A853",
    borderRadius: 3,
  },

  // Narratives
  narrativeBox: {
    backgroundColor: "#141414",
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    border: "1px solid #1A1A1A",
  },
  narrativeTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#D4A853",
  },
  narrativeText: {
    fontSize: 11,
    color: "#A0A0A0",
    lineHeight: 1.5,
  },

  // Treatment Plan
  treatmentCard: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    border: "1px solid #D4A853", // Gold border for primary
  },
  treatmentCardSupporting: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    border: "1px solid #1A1A1A",
  },
  treatmentRole: {
    fontSize: 10,
    color: "#D4A853",
    textTransform: "uppercase",
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  treatmentName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  treatmentReasoning: {
    fontSize: 12,
    color: "#A0A0A0",
    lineHeight: 1.5,
  },
  
  timelineBox: {
    backgroundColor: "#141414",
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  timelineText: {
    fontSize: 11,
    color: "#FFFFFF",
    lineHeight: 1.6,
  },

  // Auto page break protection
  pageBreakPrevent: {
    minHeight: 100, // Roughly ensure sections don't chop terribly
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #1A1A1A",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: "#666666",
  }
});


interface Props {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  location: string;
  chronologicalAge: number;
  biologicalAge: number;
  wellnessScore: number;
  dimensions: DimensionScore[];
  treatments: TreatmentRecommendation | null;
  reportData: ReportData | null;
  lowestDimension: string;
}

export default function LongevityPDF({
  leadName,
  leadEmail,
  leadPhone,
  location,
  chronologicalAge,
  biologicalAge,
  wellnessScore,
  dimensions,
  treatments,
  reportData,
  lowestDimension,
}: Props) {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      {/* PAGE 1: Overview & Scores */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>HARLEY STREET WELLNESS</Text>
          <View>
            <Text style={styles.headerRight}>{currentDate}</Text>
            <Text style={styles.headerRight}>London &middot; Glasgow</Text>
          </View>
        </View>

        <Text style={styles.title}>Your Longevity Scan</Text>
        <Text style={styles.subtitle}>
          Prepared exclusively for {leadName || "you"}. This report analyzes your cellular health
          markers to reveal your true biological age and provides a personalized protocol to optimize it.
        </Text>

        {/* Score Hero */}
        <View style={styles.scoreHero}>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Biological Age</Text>
              <Text style={styles.scoreValueGold}>{biologicalAge}</Text>
              <Text style={{ fontSize: 10, color: "#666666", marginTop: 4 }}>
                Chronological: {chronologicalAge}
              </Text>
            </View>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Wellness Score</Text>
              <Text style={styles.scoreValue}>{wellnessScore}/100</Text>
              <Text style={{ fontSize: 10, color: "#666666", marginTop: 4 }}>
                Target: 90+
              </Text>
            </View>
          </View>
          {reportData?.verdict && (
            <Text style={styles.verdict}>{reportData.verdict}</Text>
          )}
        </View>

        {/* Dimension Breakdown */}
        <Text style={styles.sectionTitle}>System Analysis</Text>
        <View style={{ marginBottom: 30 }}>
          {dimensions.map((dim) => (
            <View key={dim.name} style={styles.dimensionItem}>
              <View style={styles.dimHeader}>
                <Text style={styles.dimName}>{dim.name}</Text>
                <Text style={styles.dimScore}>{dim.score}/100</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${dim.score}%`,
                      backgroundColor:
                        dim.score >= 80 ? "#22c55e" : dim.score >= 60 ? "#D4A853" : "#ef4444",
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Harley Street Medical Wellness</Text>
          <Text style={styles.footerText}>Page 1 of 3</Text>
        </View>
      </Page>

      {/* PAGE 2: Clinical Deep Dive */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>CLINICAL INSIGHTS</Text>
          <Text style={styles.headerRight}>System-by-System Analysis</Text>
        </View>

        <View>
          {reportData?.dimensionNarratives &&
            Object.entries(reportData.dimensionNarratives).map(([key, text]) => (
              <View key={key} style={styles.narrativeBox} wrap={false}>
                <Text style={styles.narrativeTitle}>{key}</Text>
                <Text style={styles.narrativeText}>{text}</Text>
              </View>
            ))}
        </View>

        {reportData?.riskFactors && reportData.riskFactors.length > 0 && (
          <View style={{ marginTop: 20 }} wrap={false}>
            <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>Primary Time Thieves</Text>
            {reportData.riskFactors.map((risk, i) => (
              <View key={i} style={{ marginBottom: 15 }}>
                <Text style={[styles.narrativeTitle, { color: "#ef4444" }]}>▲ {risk.title}</Text>
                <Text style={styles.narrativeText}>{risk.explanation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Patient: {leadName}</Text>
          <Text style={styles.footerText}>Page 2 of 3</Text>
        </View>
      </Page>

      {/* PAGE 3: Treatment Protocol */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>TREATMENT PROTOCOL</Text>
          <Text style={styles.headerRight}>Recommended by Cellular AI</Text>
        </View>

        {treatments && reportData?.treatmentPlan && (
          <View>
            {/* Primary Treatment */}
            <View style={styles.treatmentCard}>
              <Text style={styles.treatmentRole}>PRIMARY INTERVENTION</Text>
              <Text style={styles.treatmentName}>{treatments.primary.name}</Text>
              <Text style={styles.treatmentReasoning}>
                {reportData.treatmentPlan.primary.reasoning}
              </Text>
            </View>

            {/* Supporting Treatments */}
            <View wrap={false}>
              <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 10 }]}>
                Supporting Synergies
              </Text>
              {treatments.supporting.map((supp, i) => {
                const reasoningObj = reportData.treatmentPlan.supporting.find(
                  (r) => r.name === supp.name
                );
                return (
                  <View key={supp.name} style={styles.treatmentCardSupporting} wrap={false}>
                    <Text style={styles.treatmentRole}>SUPPORTING · {i + 1}</Text>
                    <Text style={styles.treatmentName}>{supp.name}</Text>
                    <Text style={styles.treatmentReasoning}>
                      {reasoningObj?.reasoning || supp.description}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.timelineBox} wrap={false}>
              <Text style={styles.treatmentRole}>PROJECTED TIMELINE</Text>
              <Text style={styles.timelineText}>{reportData.treatmentPlan.timeline}</Text>
            </View>
          </View>
        )}

        <View style={{ marginTop: 40, borderTop: "1px solid #1A1A1A", paddingTop: 20 }}>
          <Text style={{ fontSize: 14, fontFamily: "SpaceGrotesk", fontWeight: 700, marginBottom: 5 }}>
            Ready to start your recovery?
          </Text>
          <Text style={styles.narrativeText}>
            Book your free online consultation at calendly.com/harleystreet-wellness/free-consultation
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Not medical advice.</Text>
          <Text style={styles.footerText}>Page 3 of 3</Text>
        </View>
      </Page>
    </Document>
  );
}
