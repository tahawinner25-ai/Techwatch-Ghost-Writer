import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import { NewsletterResult } from "../types";

export interface PDFExportOptions {
  fileName?: string;
  subject?: string;
  dateStr?: string;
}

/**
 * Cleanly exports an HTML email or DOM container directly to a high-definition PDF document.
 * Preserves all typography, colors, badges, tables, and diagrams.
 */
export async function exportNewsletterToPDF(
  elementOrHtml: HTMLElement | string,
  options?: PDFExportOptions
): Promise<void> {
  const sanitizedSubject = (options?.subject || "newsletter")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const fileName =
    options?.fileName ||
    `newsletter-${sanitizedSubject}-${new Date().toISOString().slice(0, 10)}.pdf`;

  let container: HTMLDivElement;
  let shouldRemoveContainer = false;

  if (typeof elementOrHtml === "string") {
    container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "640px";
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#1a1a1a";
    container.style.fontFamily = "Georgia, serif, -apple-system, sans-serif";
    container.innerHTML = elementOrHtml;
    document.body.appendChild(container);
    shouldRemoveContainer = true;
  } else {
    container = elementOrHtml.cloneNode(true) as HTMLDivElement;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "640px";
    container.style.backgroundColor = "#ffffff";
    document.body.appendChild(container);
    shouldRemoveContainer = true;
  }

  try {
    // Wait for all images & svgs to settle
    const images = container.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 640,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 190mm
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png");

    let heightLeft = contentHeight;
    let position = margin;
    const pageContentMaxHeight = pageHeight - margin * 2;

    // First page
    pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight, undefined, "FAST");
    heightLeft -= pageContentMaxHeight;

    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight, undefined, "FAST");
      heightLeft -= pageContentMaxHeight;
    }

    pdf.save(fileName);
  } finally {
    if (shouldRemoveContainer && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Escapes a string for standard RFC-4180 CSV cell output.
 */
function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""').replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return `"${str}"`;
}

/**
 * Generates and downloads a clean CSV spreadsheet with all newsletter data, metrics,
 * filtered items, diagrams metadata, and search grounding sources.
 */
export function exportNewsletterToCSV(result: NewsletterResult): void {
  const lines: string[] = [];

  // UTF-8 BOM for Microsoft Excel compatibility
  const BOM = "\uFEFF";

  // Document Metadata Section
  lines.push("=== METADONNÉES DE L'ÉDITION ===");
  lines.push(`"Titre / Objet",${escapeCsv(result.subject)}`);
  lines.push(`"Date d'édition",${escapeCsv(result.dateStr)}`);
  lines.push(`"Preheader",${escapeCsv(result.preheader)}`);
  lines.push(`"Introduction Éditoriale",${escapeCsv(result.editorialIntro)}`);
  lines.push(`"Synthèse Décisionnelle",${escapeCsv(result.takeaway)}`);
  if (result.tags && result.tags.length > 0) {
    lines.push(`"Tags & Mots-Clés",${escapeCsv(result.tags.join(", "))}`);
  }
  lines.push("");

  // Innovations Table
  lines.push("=== LES 3 SUJETS MAJEURS RETENUS (GROUNDING & VÉRIFICATION) ===");
  lines.push(
    [
      escapeCsv("Rang"),
      escapeCsv("Catégorie"),
      escapeCsv("Titre"),
      escapeCsv("Résumé Factuel (3 phrases max)"),
      escapeCsv("Impact Opérationnel / Stratégique"),
      escapeCsv("Métrique ou Fait Clé Vérifiable"),
      escapeCsv("Source de Référence"),
      escapeCsv("Diagramme / Schéma Explicatif"),
    ].join(",")
  );

  result.innovations.forEach((item, idx) => {
    lines.push(
      [
        escapeCsv(`0${idx + 1}`),
        escapeCsv(item.category),
        escapeCsv(item.title),
        escapeCsv(item.summary),
        escapeCsv(item.impact),
        escapeCsv(item.keyMetricOrFact || "N/A"),
        escapeCsv(item.sourceRef || "N/A"),
        escapeCsv(item.diagramCode ? `${item.diagramTitle || "Schéma"} (${item.diagramType || "flowchart"})` : "N/A"),
      ].join(",")
    );
  });
  lines.push("");

  // Filtering Report Table
  if (result.filteringReport?.rejectionReasons && result.filteringReport.rejectionReasons.length > 0) {
    lines.push("=== JOURNAL DE FILTRAGE ANTI-BRUIT & REJETS ===");
    lines.push([escapeCsv("Sujet Candidat Rejeté"), escapeCsv("Motif d'Élimination")].join(","));
    result.filteringReport.rejectionReasons.forEach((rej) => {
      lines.push([escapeCsv(rej.topic), escapeCsv(rej.reason)].join(","));
    });
    lines.push("");
  }

  // Grounding Web Sources Table
  if (result.sources && result.sources.length > 0) {
    lines.push("=== SOURCES WEB & GROUNDING GOOGLE SEARCH ===");
    lines.push([escapeCsv("Titre de la Source"), escapeCsv("URL Exacte")].join(","));
    result.sources.forEach((src) => {
      lines.push([escapeCsv(src.title), escapeCsv(src.url)].join(","));
    });
    lines.push("");
  }

  const csvContent = BOM + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const sanitizedSubject = (result.subject || "newsletter")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const fileName = `newsletter-data-${sanitizedSubject}-${new Date().toISOString().slice(0, 10)}.csv`;

  triggerFileDownload(blob, fileName);
}

/**
 * Generates and downloads a native, fully styled Microsoft Word (.docx) file using the 'docx' library.
 * Compatible with Microsoft Word, Microsoft 365, Google Docs, Apple Pages, and LibreOffice.
 */
export async function exportNewsletterToDocx(result: NewsletterResult): Promise<void> {
  const sanitizedSubject = (result.subject || "newsletter")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const fileName = `newsletter-${sanitizedSubject}-${new Date().toISOString().slice(0, 10)}.docx`;

  const children: (Paragraph | Table)[] = [];

  // Top Kicker Paragraph
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: "ÉDITION SPÉCIALE • VEILLE STRATÉGIQUE & FACT-CHECKING MULTI-DOMAINES",
          font: "Georgia",
          bold: true,
          size: 18, // 9pt
          color: "C44D2D",
          allCaps: true,
        }),
      ],
    })
  );

  // Main Subject Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 60, after: 120 },
      children: [
        new TextRun({
          text: result.subject || "Veille Stratégique Multi-Domaines",
          font: "Georgia",
          bold: true,
          size: 36, // 18pt
          color: "1A1A1A",
        }),
      ],
    })
  );

  // Preheader Subtitle
  if (result.preheader) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 100 },
        children: [
          new TextRun({
            text: result.preheader,
            font: "Georgia",
            italics: true,
            size: 22, // 11pt
            color: "555555",
          }),
        ],
      })
    );
  }

  // Date & Grounding Meta Line
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: `Date d'édition : ${result.dateStr || new Date().toLocaleDateString("fr-FR")} | Validation Fact-Checking & Grounding Google Search`,
          font: "Consolas",
          size: 18, // 9pt
          color: "777777",
        }),
      ],
    })
  );

  // Editorial Intro Callout Box
  if (result.editorialIntro) {
    const introTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.SINGLE, size: 24, color: "C44D2D" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F9F8F6", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 140, bottom: 140, left: 200, right: 200 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: "NOTE ÉDITORIALE :",
                      font: "Georgia",
                      bold: true,
                      size: 20, // 10pt
                      color: "1A1A1A",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: result.editorialIntro,
                      font: "Georgia",
                      italics: true,
                      size: 22, // 11pt
                      color: "2A2A2A",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    children.push(introTable);
    children.push(new Paragraph({ spacing: { before: 180, after: 0 }, children: [] }));
  }

  // Section: The 3 Selected Key Stories
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 160 },
      children: [
        new TextRun({
          text: "LES 3 FAITS MAJEURS RETENUS",
          font: "Georgia",
          bold: true,
          size: 28, // 14pt
          color: "1A1A1A",
        }),
      ],
    })
  );

  result.innovations.forEach((item, idx) => {
    // Innovation Item Container Box Table
    const itemCells: Paragraph[] = [];

    // Category Kicker
    itemCells.push(
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: `0${idx + 1} • ${(item.category || "INNOVATION").toUpperCase()}`,
            font: "Consolas",
            bold: true,
            size: 18, // 9pt
            color: "C44D2D",
          }),
        ],
      })
    );

    // Item Title
    itemCells.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 0, after: 100 },
        children: [
          new TextRun({
            text: item.title,
            font: "Georgia",
            bold: true,
            size: 24, // 12pt
            color: "1A1A1A",
          }),
        ],
      })
    );

    // Summary Text
    itemCells.push(
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: item.summary,
            font: "Georgia",
            size: 22, // 11pt
            color: "222222",
          }),
        ],
      })
    );

    // Impact Callout Sub-block
    itemCells.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: "IMPACT OPÉRATIONNEL & STRATÉGIQUE : ",
            font: "Arial",
            bold: true,
            size: 19, // 9.5pt
            color: "C44D2D",
          }),
          new TextRun({
            text: item.impact,
            font: "Arial",
            size: 19, // 9.5pt
            color: "1A1A1A",
          }),
        ],
      })
    );

    // Key Metric / Fact
    if (item.keyMetricOrFact) {
      itemCells.push(
        new Paragraph({
          spacing: { before: 40, after: 60 },
          children: [
            new TextRun({
              text: `✓ FAIT / MÉTRIQUE CLÉ : `,
              font: "Consolas",
              bold: true,
              size: 18, // 9pt
              color: "1A1A1A",
            }),
            new TextRun({
              text: item.keyMetricOrFact,
              font: "Consolas",
              size: 18,
              color: "333333",
            }),
          ],
        })
      );
    }

    // Source Reference
    if (item.sourceRef) {
      itemCells.push(
        new Paragraph({
          spacing: { before: 40, after: 60 },
          children: [
            new TextRun({
              text: `Source officielle : ${item.sourceRef}`,
              font: "Georgia",
              italics: true,
              size: 18, // 9pt
              color: "666666",
            }),
          ],
        })
      );
    }

    // Diagram Box if present
    if (item.diagramCode) {
      itemCells.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: `📊 SCHÉMA ASSOCIÉ : ${item.diagramTitle || "Diagramme Explicatif"} (${item.diagramType || "flowchart"})`,
              font: "Consolas",
              bold: true,
              size: 18,
              color: "1A1A1A",
            }),
          ],
        })
      );

      itemCells.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: item.diagramCode,
              font: "Consolas",
              size: 16, // 8pt
              color: "0F5132",
            }),
          ],
        })
      );
    }

    const storyTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: "D1CEC7" },
        right: { style: BorderStyle.SINGLE, size: 8, color: "D1CEC7" },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: "D1CEC7" },
        left: { style: BorderStyle.SINGLE, size: 8, color: "D1CEC7" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 160, bottom: 160, left: 180, right: 180 },
              children: itemCells,
            }),
          ],
        }),
      ],
    });

    children.push(storyTable);
    children.push(new Paragraph({ spacing: { before: 140, after: 0 }, children: [] }));
  });

  // Executive Takeaway Callout Box
  if (result.takeaway) {
    const takeawayTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 12, color: "1A1A1A" },
        right: { style: BorderStyle.SINGLE, size: 12, color: "1A1A1A" },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: "1A1A1A" },
        left: { style: BorderStyle.SINGLE, size: 24, color: "C44D2D" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F1EFE9", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 160, bottom: 160, left: 200, right: 200 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: "SYNTHÈSE DÉCISIONNELLE & RECOMMANDATION :",
                      font: "Georgia",
                      bold: true,
                      size: 20, // 10pt
                      color: "C44D2D",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: `« ${result.takeaway} »`,
                      font: "Georgia",
                      bold: true,
                      size: 22, // 11pt
                      color: "1A1A1A",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    children.push(takeawayTable);
    children.push(new Paragraph({ spacing: { before: 180, after: 0 }, children: [] }));
  }

  // Filtering Report Table
  if (result.filteringReport?.rejectionReasons && result.filteringReport.rejectionReasons.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: "RAPPORT DE FILTRAGE ANTI-BRUIT & FACT-CHECKING",
            font: "Georgia",
            bold: true,
            size: 24, // 12pt
            color: "1A1A1A",
          }),
        ],
      })
    );

    const filterRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: "1A1A1A", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Sujet Candidat Rejeté",
                    font: "Arial",
                    bold: true,
                    size: 18,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            shading: { fill: "1A1A1A", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Motif d'Élimination (Marketing / Spéculation / Absence de Preuve)",
                    font: "Arial",
                    bold: true,
                    size: 18,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];

    result.filteringReport.rejectionReasons.forEach((rej, index) => {
      filterRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: index % 2 === 0 ? "FFFFFF" : "F9F8F6", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: rej.topic,
                      font: "Georgia",
                      bold: true,
                      size: 18,
                      color: "1A1A1A",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: { fill: index % 2 === 0 ? "FFFFFF" : "F9F8F6", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: rej.reason,
                      font: "Georgia",
                      size: 18,
                      color: "333333",
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    });

    const filterTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
      },
      rows: filterRows,
    });

    children.push(filterTable);
    children.push(new Paragraph({ spacing: { before: 180, after: 0 }, children: [] }));
  }

  // Sources Table
  if (result.sources && result.sources.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: "SOURCES VÉRIFIÉES (GOOGLE SEARCH GROUNDING)",
            font: "Georgia",
            bold: true,
            size: 24, // 12pt
            color: "1A1A1A",
          }),
        ],
      })
    );

    const sourceRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: "1A1A1A", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Publication / Source Officielle",
                    font: "Arial",
                    bold: true,
                    size: 18,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: "1A1A1A", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "URL Vérifiée",
                    font: "Arial",
                    bold: true,
                    size: 18,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];

    result.sources.forEach((src, index) => {
      sourceRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { fill: index % 2 === 0 ? "FFFFFF" : "F9F8F6", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: src.title,
                      font: "Georgia",
                      bold: true,
                      size: 18,
                      color: "1A1A1A",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              shading: { fill: index % 2 === 0 ? "FFFFFF" : "F9F8F6", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: src.url,
                      font: "Consolas",
                      size: 16,
                      color: "0055AA",
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    });

    const sourceTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "D1CEC7" },
      },
      rows: sourceRows,
    });

    children.push(sourceTable);
    children.push(new Paragraph({ spacing: { before: 180, after: 0 }, children: [] }));
  }

  // Footer Note
  children.push(
    new Paragraph({
      spacing: { before: 240, after: 0 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Document généré le ${new Date().toLocaleDateString("fr-FR")} par Ghostwriter Autonomous Intelligence. Fact-checking et vérification temps réel multi-domaines.`,
          font: "Georgia",
          italics: true,
          size: 18, // 9pt
          color: "777777",
        }),
      ],
    })
  );

  const doc = new Document({
    creator: "Ghostwriter Autonomous Intelligence",
    title: result.subject || "Veille Stratégique Multi-Domaines",
    description: "Export officiel Word (.docx) structuré de la newsletter",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerFileDownload(blob, fileName);
}

/**
 * Builds a comprehensive, clean plain-text body and generates the mailto: URL.
 */
export function generateMailtoUrl(result: NewsletterResult): string {
  const subject = result.subject || "Veille Stratégique & Fact-Checking";

  const lines: string[] = [];
  lines.push(`ÉDITION DU ${result.dateStr || new Date().toLocaleDateString("fr-FR")}`);
  lines.push(`OBJET : ${result.subject}`);
  if (result.preheader) {
    lines.push(`APERÇU : ${result.preheader}`);
  }
  lines.push("--------------------------------------------------");
  lines.push("");

  if (result.editorialIntro) {
    lines.push("NOTE ÉDITORIALE :");
    lines.push(result.editorialIntro);
    lines.push("");
    lines.push("--------------------------------------------------");
    lines.push("");
  }

  lines.push("LES 3 FAITS MAJEURS RETENUS :");
  lines.push("");

  result.innovations.forEach((item, idx) => {
    lines.push(`[0${idx + 1}] ${(item.title || "Innovation").toUpperCase()}`);
    lines.push(`Catégorie : ${item.category}`);
    lines.push(`Résumé : ${item.summary}`);
    lines.push(`Impact : ${item.impact}`);
    if (item.keyMetricOrFact) {
      lines.push(`Fait/Métrique clé : ${item.keyMetricOrFact}`);
    }
    if (item.sourceRef) {
      lines.push(`Source : ${item.sourceRef}`);
    }
    lines.push("");
  });

  if (result.takeaway) {
    lines.push("--------------------------------------------------");
    lines.push("SYNTHÈSE DÉCISIONNELLE :");
    lines.push(`« ${result.takeaway} »`);
    lines.push("");
  }

  if (result.sources && result.sources.length > 0) {
    lines.push("--------------------------------------------------");
    lines.push("SOURCES OFFICIELLES VÉRIFIÉES :");
    result.sources.forEach((src) => {
      lines.push(`• ${src.title}: ${src.url}`);
    });
    lines.push("");
  }

  lines.push("--------------------------------------------------");
  lines.push("Transmis via Ghostwriter Intelligence (Veille Autonome & Fact-Checking)");

  const plainTextBody = lines.join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
}

/**
 * Triggers mailto share link directly in browser or fallback window.
 */
export function openMailtoShare(result: NewsletterResult): void {
  const mailtoUri = generateMailtoUrl(result);
  
  // Safe execution inside iframe
  try {
    const link = document.createElement("a");
    link.href = mailtoUri;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (_e) {
    window.location.href = mailtoUri;
  }
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
