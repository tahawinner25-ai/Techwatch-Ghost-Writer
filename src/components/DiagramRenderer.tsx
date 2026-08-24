import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Copy, Check, Download, Code, Eye, Sparkles, Activity } from "lucide-react";
import { NewsDiagram } from "../types";

interface DiagramRendererProps {
  diagram: NewsDiagram;
  className?: string;
  theme?: "light" | "dark" | "editorial";
}

// Initialize mermaid once safely
function initMermaid(theme: string = "editorial") {
  if (typeof window === "undefined") return;
  try {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: theme === "dark" ? "dark" : "neutral",
      themeVariables: {
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "13px",
        primaryColor: "#F1EFE9",
        primaryTextColor: "#1A1A1A",
        primaryBorderColor: "#1A1A1A",
        lineColor: "#1A1A1A",
        secondaryColor: "#FFFFFF",
        tertiaryColor: "#FAF9F6",
      },
    });
  } catch (e) {
    console.warn("Mermaid init notice:", e);
  }
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  diagram,
  className = "",
  theme = "editorial",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    initMermaid(theme);
    let isMounted = true;

    const renderDiagram = async () => {
      if (!diagram.mermaidCode) {
        setRenderError("Aucun code de diagramme fourni.");
        return;
      }

      setRenderError(null);
      const uniqueId = `mermaid-${diagram.id || Math.random().toString(36).substring(2, 9)}`;

      try {
        // Clean up common AI generation artifacts from markdown blocks
        let cleanCode = diagram.mermaidCode.trim();
        if (cleanCode.startsWith("```mermaid")) {
          cleanCode = cleanCode.replace(/^```mermaid\n?/, "").replace(/```$/, "");
        } else if (cleanCode.startsWith("```")) {
          cleanCode = cleanCode.replace(/^```\w*\n?/, "").replace(/```$/, "");
        }
        cleanCode = cleanCode.trim();

        // Render via mermaid API
        const { svg } = await mermaid.render(uniqueId, cleanCode);
        if (isMounted) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        console.warn("Mermaid render warning:", err);
        if (isMounted) {
          setRenderError(
            err?.message || "Le diagramme est affiché sous format textuel structuré."
          );
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [diagram.mermaidCode, diagram.id, theme]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(diagram.mermaidCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_e) {
      // ignore
    }
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${diagram.id || "news"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`border border-[#D1CEC7] bg-white overflow-hidden shadow-xs transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="bg-[#F9F8F6] px-4 py-2.5 border-b border-[#D1CEC7] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-[#c44d2d]" />
          <span className="font-serif italic font-bold text-sm text-[#1A1A1A]">
            {diagram.title || "Schéma Explicatif & Architecture"}
          </span>
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#EAE8E3] text-neutral-700 font-bold">
            {diagram.type || "FLOWCHART"}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "diagram" ? "code" : "diagram")}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F1EFE9] border border-[#D1CEC7] text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] transition-colors cursor-pointer"
            title="Basculer entre vue schéma et code Mermaid"
          >
            {viewMode === "diagram" ? (
              <>
                <Code className="w-3 h-3 text-neutral-600" />
                <span>Code</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-neutral-600" />
                <span>Schéma</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F1EFE9] border border-[#D1CEC7] text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] transition-colors cursor-pointer"
            title="Copier le code Mermaid"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-600" />
                <span>Copier</span>
              </>
            )}
          </button>

          {svgHtml && viewMode === "diagram" && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F1EFE9] border border-[#D1CEC7] text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] transition-colors cursor-pointer"
              title="Télécharger en SVG"
            >
              <Download className="w-3 h-3 text-neutral-600" />
              <span>SVG</span>
            </button>
          )}
        </div>
      </div>

      {/* Description caption */}
      {diagram.description && (
        <div className="px-4 py-2 bg-[#FAF9F6] border-b border-[#EAE8E3] text-xs font-serif text-neutral-600 italic">
          💡 {diagram.description}
        </div>
      )}

      {/* Main viewport */}
      <div className="p-4 sm:p-6 overflow-x-auto flex justify-center items-center bg-white min-h-[160px]">
        {viewMode === "code" ? (
          <div className="w-full">
            <pre className="p-4 bg-[#1A1A1A] text-emerald-400 font-mono text-xs overflow-x-auto rounded-none border border-neutral-800 leading-relaxed">
              <code>{diagram.mermaidCode}</code>
            </pre>
          </div>
        ) : renderError ? (
          <div className="w-full space-y-2">
            <div className="text-xs text-amber-800 bg-amber-50 p-3 border border-amber-200 font-sans">
              ⚠️ <strong>Rendu textuel du schéma :</strong>
            </div>
            <pre className="p-3 bg-[#FAF9F6] border border-[#D1CEC7] text-[#1A1A1A] font-mono text-xs overflow-x-auto">
              <code>{diagram.mermaidCode}</code>
            </pre>
          </div>
        ) : svgHtml ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#c44d2d]" />
            <span>Génération vectorielle du schéma...</span>
          </div>
        )}
      </div>
    </div>
  );
};
