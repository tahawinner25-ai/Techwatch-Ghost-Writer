import React, { useState, useRef } from "react";
import {
  Monitor,
  Smartphone,
  Copy,
  Check,
  Download,
  Mail,
  Sparkles,
  HardDrive,
  FileDown,
  RefreshCw,
  CalendarClock,
  FileSpreadsheet,
  FileText,
  Share2,
  Activity,
  Columns,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { NewsletterResult, NewsDiagram, TrendChartData } from "../types";
import {
  exportNewsletterToPDF,
  exportNewsletterToCSV,
  exportNewsletterToDocx,
  openMailtoShare,
} from "../lib/exportHelpers";
import { DiagramRenderer } from "./DiagramRenderer";
import { TrendChartRenderer } from "./TrendChartRenderer";
import { AudioBriefingPlayer } from "./AudioBriefingPlayer";
import { VoiceButton } from "./VoiceButton";

interface EmailPreviewProps {
  result: NewsletterResult;
  onSaveToDrive?: () => void;
  onOpenScheduleModal?: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  result,
  onSaveToDrive,
  onOpenScheduleModal,
}) => {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [layoutMode, setLayoutMode] = useState<"alongside" | "newsletter" | "diagrams">("alongside");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [customTopic, setCustomTopic] = useState<string>("");
  const [customDiagType, setCustomDiagType] = useState<string>("flowchart");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [extraDiagrams, setExtraDiagrams] = useState<NewsDiagram[]>([]);
  const [extraCharts, setExtraCharts] = useState<TrendChartData[]>([]);
  const emailCanvasRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Copy rendered HTML as rich text so user can directly Paste (Ctrl+V) into Gmail/Outlook with full formatting
  const copyRichText = async () => {
    try {
      const blob = new Blob([result.html], { type: "text/html" });
      const textBlob = new Blob([result.html], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": blob,
        "text/plain": textBlob,
      });
      await navigator.clipboard.write([item]);
      setCopiedType("rich");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (_err) {
      copyToClipboard(result.html, "html");
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const target = emailCanvasRef.current || result.html;
      await exportNewsletterToPDF(target, {
        subject: result.subject,
        dateStr: result.dateStr,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportCSV = () => {
    exportNewsletterToCSV(result);
  };

  const handleExportWord = async () => {
    setIsExportingDocx(true);
    try {
      await exportNewsletterToDocx(result);
    } catch (error) {
      console.error("Failed to export docx:", error);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleMailtoShare = () => {
    openMailtoShare(result);
  };

  const downloadHtmlFile = () => {
    const blob = new Blob([result.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateCustomVisual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isGeneratingCustom) return;

    setIsGeneratingCustom(true);
    try {
      const res = await fetch("/api/generate-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic.trim(),
          diagramType: customDiagType,
        }),
      });
      const data = await res.json();
      if (data?.data?.diagram) {
        setExtraDiagrams((prev) => [data.data.diagram, ...prev]);
      }
      if (data?.data?.trendChart) {
        setExtraCharts((prev) => [data.data.trendChart, ...prev]);
      }
      setCustomTopic("");
    } catch (err) {
      console.error("Error generating custom diagram:", err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Collect all diagrams from global array, individual innovations, and extra user-generated diagrams
  const allDiagrams: NewsDiagram[] = [
    ...extraDiagrams,
    ...(result.diagrams || []),
    ...result.innovations
      .filter((item) => item.diagramCode)
      .map((item, idx) => ({
        id: `story-diagram-${idx}`,
        title: item.diagramTitle || `Schéma : ${item.title}`,
        type: (item.diagramType || "flowchart") as any,
        mermaidCode: item.diagramCode || "",
        description: `Visualisation vectorielle des flux : ${item.category}`,
        topicRef: item.title,
      })),
  ];

  // Collect all trend charts from result and innovations
  const allTrendCharts: TrendChartData[] = [
    ...extraCharts,
    ...(result.trendCharts || []),
    ...result.innovations
      .filter((item) => item.trendChart)
      .map((item) => item.trendChart!),
  ];

  // Render Visual Diagrams & Recharts Component Panel
  const renderVisualsPanel = (isCompact: boolean = false) => (
    <div className="space-y-6">
      {/* Header bar of visual diagrams pane */}
      <div className="p-4 bg-white border border-[#D1CEC7] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#c44d2d]" />
            <h3 className="font-serif italic font-bold text-base sm:text-lg text-[#1A1A1A]">
              Visualisations &amp; Tendances (Mermaid &amp; Recharts)
            </h3>
          </div>
          <p className="text-xs text-neutral-600 font-serif mt-0.5">
            Schémas d'architecture vectoriels et courbes de tendances extraits automatiquement des sources.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-[#F1EFE9] border border-[#D1CEC7] font-mono text-xs font-bold text-[#1A1A1A]">
            {allDiagrams.length} Mermaid
          </span>
          {allTrendCharts.length > 0 && (
            <span className="px-2.5 py-1 bg-[#FAF9F6] border border-[#D1CEC7] font-mono text-xs font-bold text-[#c44d2d]">
              {allTrendCharts.length} Recharts
            </span>
          )}
        </div>
      </div>

      {/* On-Demand Interactive Visual Generator Input */}
      <div className="p-4 bg-[#F9F8F6] border border-[#D1CEC7] shadow-xs">
        <form onSubmit={handleGenerateCustomVisual} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-bold flex items-center space-x-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>Générer un schéma ou graphique sur mesure</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              Extraction instantanée IA
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Ex: Pipeline vLLM KV-Cache, Comparatif latence TLS 1.3, Cycle mémoire Rust..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#D1CEC7] focus:outline-none focus:border-[#1A1A1A] font-sans"
            />
            <select
              value={customDiagType}
              onChange={(e) => setCustomDiagType(e.target.value)}
              className="px-2.5 py-2 text-xs bg-white border border-[#D1CEC7] focus:outline-none font-mono text-[#1A1A1A]"
            >
              <option value="flowchart">Flux (Flowchart)</option>
              <option value="architecture">Architecture</option>
              <option value="sequence">Séquence</option>
              <option value="timeline">Chronologie</option>
              <option value="mindmap">Mindmap</option>
            </select>
            <button
              type="submit"
              disabled={isGeneratingCustom || !customTopic.trim()}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              {isGeneratingCustom ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#c44d2d]" />
                  <span>Visualiser</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Render Recharts Trend & Benchmark Charts */}
      {allTrendCharts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-mono font-bold text-neutral-600">
            <TrendingUp className="w-3.5 h-3.5 text-[#c44d2d]" />
            <span>Métriques Quantifiées &amp; Tendances Chiffrées (Recharts)</span>
          </div>
          <div className={`grid grid-cols-1 ${!isCompact ? "lg:grid-cols-2" : ""} gap-6`}>
            {allTrendCharts.map((chart, cIdx) => (
              <TrendChartRenderer key={chart.id || cIdx} chart={chart} />
            ))}
          </div>
        </div>
      )}

      {/* Render Mermaid Diagrams */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-mono font-bold text-neutral-600">
          <Activity className="w-3.5 h-3.5 text-[#1A1A1A]" />
          <span>Architectures &amp; Schémas Explicatifs (Mermaid)</span>
        </div>
        {allDiagrams.length === 0 ? (
          <div className="p-8 bg-white border border-[#D1CEC7] text-center font-serif text-neutral-500 italic">
            Aucun schéma spécifique n'a été rattaché à cette édition. Utilisez le formulaire ci-dessus pour en générer un immédiatement.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allDiagrams.map((diag, index) => (
              <DiagramRenderer key={diag.id || index} diagram={diag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Audio Synthesis & Podcast Briefing Player (Text-to-Speech) */}
      <AudioBriefingPlayer result={result} />

      {/* Top Action & Export Toolbar */}
      <div className="bg-[#F1EFE9] p-3 border border-[#D1CEC7] flex flex-wrap items-center justify-between gap-3">
        {/* View mode & Layout switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3 Layout Modes: Alongside, Newsletter Solo, Diagrams Dedicated */}
          <div className="flex items-center space-x-1 bg-white p-1 border border-[#D1CEC7]">
            <button
              id="layout-alongside-btn"
              onClick={() => setLayoutMode("alongside")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                layoutMode === "alongside"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#1A1A1A]"
              }`}
              title="Afficher la newsletter et les schémas vectoriels côte-à-côte"
            >
              <Columns className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>Côte-à-Côte</span>
            </button>
            <button
              id="layout-newsletter-btn"
              onClick={() => setLayoutMode("newsletter")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                layoutMode === "newsletter"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#1A1A1A]"
              }`}
              title="Aperçu centré de l'e-mail uniquement"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Newsletter Seule</span>
            </button>
            <button
              id="layout-diagrams-btn"
              onClick={() => setLayoutMode("diagrams")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                layoutMode === "diagrams"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#1A1A1A]"
              }`}
              title="Hub dédié des schémas Mermaid et graphiques Recharts"
            >
              <Activity className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>Schémas &amp; Données ({allDiagrams.length + allTrendCharts.length})</span>
            </button>
          </div>

          {/* Desktop / Mobile Device switcher for newsletter view */}
          {layoutMode !== "diagrams" && (
            <div className="flex items-center space-x-1 bg-white p-1 border border-[#D1CEC7]">
              <button
                onClick={() => setDeviceView("desktop")}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  deviceView === "desktop"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#1A1A1A]"
                }`}
                title="Aperçu Bureau (600px standard email)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDeviceView("mobile")}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  deviceView === "mobile"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#1A1A1A]"
                }`}
                title="Aperçu Smartphone (375px mobile)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Export Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download as PDF Button */}
          <button
            id="download-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            title="Télécharger la newsletter en fichier PDF haute définition"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Export PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Télécharger en PDF</span>
              </>
            )}
          </button>

          {/* Mailto Share Button */}
          <button
            id="mailto-share-btn"
            onClick={handleMailtoShare}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#1A1A1A] shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Ouvrir votre client de messagerie par défaut pré-rempli avec l'e-mail de veille"
          >
            <Share2 className="w-3.5 h-3.5 text-[#c44d2d]" />
            <span>Partager Mailto</span>
          </button>

          {/* Export CSV Button */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Exporter les données structurées en CSV (compatible Excel & Google Sheets)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Export Word (.docx) Button */}
          <button
            id="export-word-btn"
            onClick={handleExportWord}
            disabled={isExportingDocx}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Exporter le document au format Word natif (.docx avec styles, tableaux et schémas)"
          >
            {isExportingDocx ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isExportingDocx ? "Export DOCX..." : "Export Word (.docx)"}</span>
          </button>

          {/* Direct Paste into Gmail button */}
          <button
            onClick={copyRichText}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Copie le rendu visuel pour le coller directement dans le composeur Gmail / Outlook"
          >
            {copiedType === "rich" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copié pour Gmail !</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Copier Gmail</span>
              </>
            )}
          </button>

          {/* Copy HTML Source */}
          <button
            onClick={() => copyToClipboard(result.html, "html")}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] transition-colors cursor-pointer"
            title="Copie le code HTML brut pour Mailchimp, Substack, Brevo"
          >
            {copiedType === "html" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>HTML Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>HTML</span>
              </>
            )}
          </button>

          {/* Google Drive Export */}
          {onSaveToDrive && (
            <button
              onClick={onSaveToDrive}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] transition-colors cursor-pointer"
              title="Enregistrer cette édition directement sur Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-700" />
              <span>Drive</span>
            </button>
          )}

          {/* Draft Scheduler Button */}
          {onOpenScheduleModal && (
            <button
              id="schedule-draft-btn"
              onClick={onOpenScheduleModal}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#c44d2d] hover:bg-[#a83f23] text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              title="Programmer la date et heure d'envoi et synchroniser avec Google Calendar"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Planifier</span>
            </button>
          )}

          {/* Download HTML */}
          <button
            onClick={downloadHtmlFile}
            className="flex items-center space-x-1 px-2.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] transition-colors cursor-pointer"
            title="Télécharger le fichier .html brut"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>.html</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {layoutMode === "diagrams" ? (
        // Full width diagrams dedicated hub
        renderVisualsPanel(false)
      ) : layoutMode === "alongside" ? (
        // Side-by-Side Dual Column View: Newsletter alongside Diagrams & Trends
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Email Client Frame */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white border border-[#D1CEC7] overflow-hidden shadow-xs">
              {/* Email Client Header Bar */}
              <div className="bg-[#F9F8F6] px-5 py-3.5 border-b border-[#D1CEC7] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#D1CEC7]">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>Aperçu Messagerie (Édition Finale)</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    {result.dateStr || "Aujourd'hui"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 w-16 shrink-0">
                      Objet :
                    </span>
                    <span className="text-[#1A1A1A] font-bold tracking-tight bg-white px-2 py-0.5 border border-[#D1CEC7] font-serif text-xs">
                      {result.subject}
                    </span>
                  </div>
                  {result.preheader && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 w-16 shrink-0">
                        Aperçu :
                      </span>
                      <span className="text-neutral-600 text-xs font-serif italic">
                        {result.preheader}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rendered Email Canvas */}
              <div className="p-4 sm:p-6 bg-[#F9F8F6] flex justify-center overflow-x-auto min-h-[500px]">
                <div
                  className={`transition-all duration-300 ${
                    deviceView === "mobile" ? "w-[375px]" : "w-full max-w-[620px]"
                  }`}
                >
                  <div
                    ref={emailCanvasRef}
                    className="bg-white shadow-xs border border-[#D1CEC7] overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: result.html }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Diagrams & Trends (Mermaid & Recharts) */}
          <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-4">
            {renderVisualsPanel(true)}
          </div>
        </div>
      ) : (
        /* Standard Centered Newsletter Frame */
        <div className="bg-white border border-[#D1CEC7] overflow-hidden shadow-xs">
          {/* Email Client Header Bar */}
          <div className="bg-[#F9F8F6] px-6 py-4 border-b border-[#D1CEC7] space-y-3">
            {/* Top Bar with window dots */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D1CEC7]">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1A1A1A]" />
                <span>Aperçu Réception Client Messagerie</span>
              </div>
              <div className="text-[11px] font-mono text-neutral-500">
                {result.dateStr || "Aujourd'hui"}
              </div>
            </div>

            {/* Meta Fields */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-baseline space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 w-20 shrink-0">
                  Objet :
                </span>
                <span className="text-[#1A1A1A] font-bold tracking-tight bg-white px-2.5 py-1 border border-[#D1CEC7] font-serif text-sm">
                  {result.subject}
                </span>
              </div>
              {result.preheader && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 w-20 shrink-0">
                    Preheader :
                  </span>
                  <span className="text-neutral-600 text-xs font-serif italic">
                    {result.preheader}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-xs text-neutral-600">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 w-20 shrink-0">
                  De :
                </span>
                <span className="font-mono text-[11px] text-neutral-800">
                  Veille Stratégique &amp; Fact-Checking &lt;intelligence@ghostwriter.news&gt;
                </span>
              </div>
            </div>
          </div>

          {/* Rendered Email Canvas */}
          <div className="p-4 sm:p-10 bg-[#F9F8F6] flex justify-center overflow-x-auto min-h-[500px]">
            <div
              className={`transition-all duration-300 ${
                deviceView === "mobile" ? "w-[375px]" : "w-full max-w-[620px]"
              }`}
            >
              <div
                ref={emailCanvasRef}
                className="bg-white shadow-xs border border-[#D1CEC7] overflow-hidden"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
