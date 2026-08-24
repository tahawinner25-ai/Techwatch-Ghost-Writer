import React, { useState } from "react";
import { Copy, Check, Download, FileCode, FileText, HardDrive } from "lucide-react";
import { NewsletterResult } from "../types";

interface CodeViewProps {
  result: NewsletterResult;
  onSaveToDrive?: () => void;
}

export const CodeView: React.FC<CodeViewProps> = ({ result, onSaveToDrive }) => {
  const [activeFormat, setActiveFormat] = useState<"html" | "markdown">("html");
  const [copied, setCopied] = useState(false);

  // Generate Markdown representation
  const generateMarkdown = () => {
    return `# ${result.subject}
*Édition du ${result.dateStr} • Veille Technique Autonome*

> ${result.editorialIntro}

---

## ⚡ Top 3 Innovations Majeures Retenues

${result.innovations
  .map(
    (item, idx) => `### ${idx + 1}. [${item.category}] ${item.title}
${item.sourceRef ? `*Source : ${item.sourceRef}*\n` : ""}
**Résumé Technique :**
${item.summary}

**🎯 Impact Opérationnel & Architecture :**
${item.impact}
${item.keyMetricOrFact ? `\n*Donnée clé :* ${item.keyMetricOrFact}` : ""}
`
  )
  .join("\n---\n\n")}

---

## 💡 Synthèse & Décision Ingénierie
${result.takeaway}

---
*Généré par TechWatch Ghostwriter • Zéro publicité • Zéro hallucination*
`;
  };

  const currentContent = activeFormat === "html" ? result.html : generateMarkdown();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `newsletter-${new Date().toISOString().slice(0, 10)}.${
      activeFormat === "html" ? "html" : "md"
    }`;
    const mime = activeFormat === "html" ? "text/html" : "text/markdown";
    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Format Switcher and Toolbar */}
      <div className="bg-[#F1EFE9] p-3 border border-[#D1CEC7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-white p-1 border border-[#D1CEC7]">
          <button
            onClick={() => setActiveFormat("html")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold transition-all ${
              activeFormat === "html"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "text-neutral-600 hover:text-[#1A1A1A]"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code HTML (Emailing)</span>
          </button>
          <button
            onClick={() => setActiveFormat("markdown")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold transition-all ${
              activeFormat === "markdown"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "text-neutral-600 hover:text-[#1A1A1A]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (Notion / GitHub)</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onSaveToDrive && (
            <button
              onClick={onSaveToDrive}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#1A1A1A] transition-colors shadow-xs"
              title="Enregistrer ce fichier sur Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-700" />
              <span>Sauvegarder sur Drive</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copier</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] text-xs uppercase tracking-widest font-bold border border-[#D1CEC7] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-white border border-[#D1CEC7] p-5 shadow-xs">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 font-mono mb-3 flex items-center justify-between pb-2 border-b border-[#D1CEC7]">
          <span>{activeFormat === "html" ? "Format HTML Email Responsive" : "Format Markdown GFM"}</span>
          <span>{currentContent.length} caractères</span>
        </div>
        <pre className="text-xs font-mono text-[#1A1A1A] bg-[#F9F8F6] p-4 border border-[#D1CEC7] overflow-x-auto max-h-[550px] overflow-y-auto leading-relaxed">
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
};
