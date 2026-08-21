"use client";

import { useState } from "react";
import jsPDF from "jspdf";

type Audit = {
  overall_score: number | null;
  status: string;
  executive_summary: string | null;
  created_at: string;
  published_at: string | null;
};

type Section = {
  id: string;
  title: string;
  score: number | null;
};

type Finding = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  status: string | null;
  severity: string | null;
  what_was_checked: string | null;
  why_it_matters: string | null;
  recommendation: string | null;
};

type Props = {
  businessName: string;
  storeUrl: string;
  audit: Audit;
  sections: Section[];
  findings: Finding[];
};

async function imageToDataUrl(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Logo could not be downloaded.");
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () =>
      resolve(String(reader.result));

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function AuditPdfButton({
  businessName,
  storeUrl,
  audit,
  sections,
  findings,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    setLoading(true);

    try {
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;

      let y = 18;

      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, pageWidth, 6, "F");

      try {
        const logo = await imageToDataUrl(
          "https://www.degiftgrid.com/images/logo-horizontal.png"
        );

        pdf.addImage(
          logo,
          "PNG",
          margin,
          y,
          58,
          0
        );
      } catch {
        pdf.setTextColor(79, 70, 229);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("GiftGrid", margin, y + 8);
      }

      y += 24;

      pdf.setTextColor(17, 24, 39);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text(
        "GRID LEVEL AUDIT REPORT",
        margin,
        y
      );

      y += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);

      pdf.text(
        `Store: ${businessName || "Merchant Store"}`,
        margin,
        y
      );

      y += 5;

      pdf.text(
        `URL: ${storeUrl}`,
        margin,
        y
      );

      y += 5;

      pdf.text(
        `Audit Date: ${new Date(
          audit.created_at
        ).toLocaleDateString()}`,
        margin,
        y
      );

      y += 5;

      pdf.text(
        `Status: ${audit.status.replaceAll("_", " ")}`,
        margin,
        y
      );

      y += 12;

      pdf.setFillColor(238, 242, 255);
      pdf.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        28,
        4,
        4,
        "F"
      );

      pdf.setTextColor(79, 70, 229);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(
        "OVERALL GRID SCORE",
        margin + 7,
        y + 9
      );

      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(24);
      pdf.text(
        `${audit.overall_score ?? 0}/100`,
        margin + 7,
        y + 21
      );

      y += 38;

      pdf.setTextColor(17, 24, 39);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text("Audit Areas", margin, y);

      y += 8;

      for (const section of sections) {
        const score = section.score ?? 0;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(17, 24, 39);

        pdf.text(
          section.title,
          margin,
          y
        );

        pdf.text(
          String(score),
          pageWidth - margin - 10,
          y
        );

        y += 3;

        pdf.setFillColor(226, 232, 240);

        pdf.roundedRect(
          margin,
          y,
          pageWidth - margin * 2,
          4,
          2,
          2,
          "F"
        );

        pdf.setFillColor(79, 70, 229);

        pdf.roundedRect(
          margin,
          y,
          ((pageWidth - margin * 2) * score) /
            100,
          4,
          2,
          2,
          "F"
        );

        y += 10;
      }

      y += 4;

      const addWrapped = (
        heading: string,
        body: string,
        headingSize = 12
      ) => {
        if (
          y > pageHeight - 45
        ) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont(
          "helvetica",
          "bold"
        );
        pdf.setFontSize(headingSize);
        pdf.setTextColor(17, 24, 39);
        pdf.text(
          heading,
          margin,
          y
        );

        y += 7;

        pdf.setFont(
          "helvetica",
          "normal"
        );
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);

        const lines = pdf.splitTextToSize(
          body || "",
          pageWidth - margin * 2
        );

        for (const line of lines) {
          if (
            y > pageHeight - 20
          ) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(
            line,
            margin,
            y
          );

          y += 4.5;
        }

        y += 5;
      };

      addWrapped(
        "VERDICT",
        audit.executive_summary ||
          "GiftGrid audit completed."
      );

      for (const section of sections) {
        const sectionFindings =
          findings.filter(
            (finding) =>
              finding.section_id ===
              section.id
          );

        if (!sectionFindings.length) {
          continue;
        }

        if (
          y > pageHeight - 45
        ) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont(
          "helvetica",
          "bold"
        );
        pdf.setFontSize(13);
        pdf.setTextColor(
          79,
          70,
          229
        );

        pdf.text(
          `${section.title} — ${
            section.score ?? 0
          }`,
          margin,
          y
        );

        y += 8;

        for (const finding of sectionFindings) {
          addWrapped(
            finding.title,
            [
              finding.status
                ? `Status: ${finding.status.replaceAll("_", " ")}`
                : "",
              finding.severity
                ? `Severity: ${finding.severity}`
                : "",
              finding.description || "",
              finding.why_it_matters
                ? `Why it matters: ${finding.why_it_matters}`
                : "",
              finding.recommendation
                ? `Recommendation: ${finding.recommendation}`
                : "",
            ]
              .filter(Boolean)
              .join(" • "),
            10
          );
        }
      }

      const nextSteps = findings
        .filter(
          (finding) =>
            finding.status !==
              "passed" &&
            finding.recommendation
        )
        .slice(0, 5);

      if (nextSteps.length) {
        addWrapped(
          "NEXT STEPS",
          nextSteps
            .map(
              (finding, index) =>
                `${index + 1}. ${finding.recommendation}`
            )
            .join("\n")
        );
      }

      pdf.setFontSize(8);
      pdf.setTextColor(
        148,
        163,
        184
      );

      pdf.text(
        "GiftGrid • degiftgrid.com",
        margin,
        pageHeight - 10
      );

      pdf.save(
        `${(businessName || "GiftGrid")
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase()}-giftgrid-audit.pdf`
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      alert(
        "Could not create the PDF report."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Creating PDF…" : "Download PDF"}
    </button>
  );
}
