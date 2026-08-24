import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  fileName?: string;
  subject?: string;
  dateStr?: string;
}

/**
 * Exports an HTML email or DOM container directly to a styled, high-quality PDF document.
 * Preserves all inline CSS, background colors, typography, and layout.
 */
export async function exportNewsletterToPDF(
  elementOrHtml: HTMLElement | string,
  options?: PDFExportOptions
): Promise<void> {
  const fileName = options?.fileName || `newsletter-${new Date().toISOString().slice(0, 10)}.pdf`;

  // Create temporary offscreen container if HTML string is provided or clone element for clean rendering
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
    container.style.fontFamily = "system-ui, -apple-system, sans-serif";
    container.innerHTML = elementOrHtml;
    document.body.appendChild(container);
    shouldRemoveContainer = true;
  } else {
    // Clone element to ensure standard width during rasterization
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
    // Ensure all images are loaded
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

    // Rasterize with html2canvas at 2x scale for crisp, professional print quality
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 640,
    });

    // Create jsPDF instance in A4 format (portrait)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // 10mm margins on left/right
    const contentWidth = pageWidth - margin * 2; // 190mm
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png");

    let heightLeft = contentHeight;
    let position = margin; // Top margin for first page
    const pageContentMaxHeight = pageHeight - margin * 2; // 277mm usable per page

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      contentWidth,
      contentHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageContentMaxHeight;

    // Additional pages if newsletter spans multiple pages
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        contentWidth,
        contentHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageContentMaxHeight;
    }

    // Save the PDF
    pdf.save(fileName);
  } finally {
    if (shouldRemoveContainer && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
