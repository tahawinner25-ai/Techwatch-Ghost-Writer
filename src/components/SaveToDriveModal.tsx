import React, { useState } from "react";
import {
  X,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FileCode,
  FileText,
  Upload,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { NewsletterResult, DriveFile } from "../types";
import { createDriveFile } from "../lib/driveService";
import { requestWorkspaceToken } from "../lib/firebase";
import { User } from "firebase/auth";

interface SaveToDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsletter: NewsletterResult;
  accessToken: string | null;
  currentUser: User | null;
  onLogin: () => Promise<void>;
}

export const SaveToDriveModal: React.FC<SaveToDriveModalProps> = ({
  isOpen,
  onClose,
  newsletter,
  accessToken: initialToken,
  currentUser,
}) => {
  const defaultBaseName = `TechWatch-${newsletter.dateStr || "Edition"}`.replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );

  const [activeTab, setActiveTab] = useState<"direct" | "cloud">("direct");
  const [format, setFormat] = useState<"html" | "markdown">("html");
  const [fileName, setFileName] = useState(`${defaultBaseName}.html`);
  const [token, setToken] = useState<string | null>(initialToken);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdFile, setCreatedFile] = useState<DriveFile | null>(null);

  if (!isOpen) return null;

  const handleFormatChange = (newFormat: "html" | "markdown") => {
    setFormat(newFormat);
    setFileName(`${defaultBaseName}.${newFormat === "html" ? "html" : "md"}`);
  };

  const getMarkdownContent = () => {
    return `# ${newsletter.subject || "TechWatch Ghostwriter"}
*${newsletter.dateStr || ""} - Cible : CTO & Ingénieurs Seniors*

## Éditorial
${newsletter.editorialIntro || ""}

---

## Les 3 Innovations Majeures

${(newsletter.innovations || [])
  .map(
    (item, idx) => `### ${idx + 1}. [${item.category}] ${item.title}
${item.summary}

**Impact Opérationnel & Architecture :**
${item.impact}
${item.keyMetricOrFact ? `\n*Fait clé / Métrique :* ${item.keyMetricOrFact}` : ""}
${item.sourceRef ? `\n*Source :* ${item.sourceRef}` : ""}
`
  )
  .join("\n\n---\n\n")}

---

## Synthèse Décisionnelle & Recommandation
> ${newsletter.takeaway || ""}
`;
  };

  const handleDirectDownload = () => {
    const content = format === "html" ? newsletter.html : getMarkdownContent();
    const mimeType = format === "html" ? "text/html;charset=utf-8" : "text/markdown;charset=utf-8";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenDocsWithCopy = () => {
    const content = getMarkdownContent();
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
      window.open("https://docs.google.com/document/create", "_blank", "noopener,noreferrer");
    });
  };

  const handleAuthorizeDrive = async () => {
    setIsAuthorizing(true);
    setError(null);
    try {
      const newToken = await requestWorkspaceToken();
      if (newToken) {
        setToken(newToken);
      } else {
        setError("L'autorisation Google Drive a été annulée ou refusée.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec d'autorisation Google Workspace");
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!token) {
      await handleAuthorizeDrive();
      return;
    }

    setIsSaving(true);
    setError(null);
    setCreatedFile(null);

    try {
      const content = format === "html" ? newsletter.html : getMarkdownContent();
      const mimeType = format === "html" ? "text/html" : "text/markdown";

      const file = await createDriveFile(
        token,
        fileName,
        content,
        mimeType,
        `Newsletter TechWatch - ${newsletter.subject}`
      );

      setCreatedFile(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement sur Google Drive"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#D1CEC7] w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-[#1A1A1A]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Export Google Workspace &amp; Drive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#E5E2DA] text-neutral-600 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#D1CEC7] bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex-1 py-3 px-4 text-xs font-mono uppercase tracking-wider font-bold transition-all ${
              activeTab === "direct"
                ? "bg-white text-[#1A1A1A] border-b-2 border-[#1A1A1A]"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            📄 Export Docs &amp; Téléchargement
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={`flex-1 py-3 px-4 text-xs font-mono uppercase tracking-wider font-bold transition-all ${
              activeTab === "cloud"
                ? "bg-white text-[#1A1A1A] border-b-2 border-[#1A1A1A]"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            ☁️ Synchronisation Drive Cloud
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-[#F9F8F6]">
          {activeTab === "direct" ? (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#D1CEC7] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A]">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Option 1 : Ouvrir directement dans Google Docs</span>
                </div>
                <p className="text-xs text-neutral-600 font-serif leading-relaxed">
                  Copie le compte-rendu formaté dans votre presse-papier et ouvre un nouveau Google Doc vierge prêt à coller.
                </p>
                <button
                  type="button"
                  onClick={handleOpenDocsWithCopy}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Texte Copié ! Ouverture de Google Docs...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Copier &amp; Ouvrir dans Google Docs</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-white border border-[#D1CEC7] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A]">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Option 2 : Télécharger le fichier compatible Drive</span>
                </div>
                
                {/* Format selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFormatChange("html")}
                    className={`p-2.5 border text-left flex items-center space-x-2 transition-all ${
                      format === "html"
                        ? "bg-[#F1EFE9] border-[#1A1A1A] font-bold"
                        : "bg-white border-[#D1CEC7] text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    <FileCode className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-mono">Format HTML Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange("markdown")}
                    className={`p-2.5 border text-left flex items-center space-x-2 transition-all ${
                      format === "markdown"
                        ? "bg-[#F1EFE9] border-[#1A1A1A] font-bold"
                        : "bg-white border-[#D1CEC7] text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-mono">Format Markdown</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDirectDownload}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#F1EFE9] hover:bg-[#E5E2DA] border border-[#D1CEC7] text-[#1A1A1A] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-neutral-700" />
                  <span>Télécharger ({fileName})</span>
                </button>
              </div>
            </div>
          ) : (
            /* Cloud Drive Sync Tab */
            <div className="space-y-4">
              {createdFile ? (
                <div className="bg-white border border-[#D1CEC7] p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif italic text-xl text-[#1A1A1A] mb-1">
                      Fichier Enregistré sur Google Drive !
                    </h3>
                    <p className="text-xs font-mono text-neutral-600">
                      {createdFile.name}
                    </p>
                  </div>

                  {createdFile.webViewLink && (
                    <div className="pt-2">
                      <a
                        href={createdFile.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-colors"
                      >
                        <span>Ouvrir dans Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F1EFE9] border-y border-[#1A1A1A] text-xs text-[#1A1A1A] leading-relaxed font-serif">
                    <strong className="block font-sans uppercase tracking-widest text-[10px] mb-1 font-bold">
                      Synchronisation API Google Drive
                    </strong>
                    Permet d'envoyer directement ce rapport dans votre Google Drive sans téléchargement intermédiaire.
                  </div>

                  {/* Format selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Format du fichier
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleFormatChange("html")}
                        className={`p-3 border text-left flex items-start space-x-2.5 transition-all ${
                          format === "html"
                            ? "bg-white border-[#1A1A1A] shadow-xs"
                            : "bg-[#F1EFE9] border-[#D1CEC7] text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        <FileCode className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                            HTML Email
                          </div>
                          <div className="text-[10px] text-neutral-500 font-serif">
                            Format complet prêt à expédier
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFormatChange("markdown")}
                        className={`p-3 border text-left flex items-start space-x-2.5 transition-all ${
                          format === "markdown"
                            ? "bg-white border-[#1A1A1A] shadow-xs"
                            : "bg-[#F1EFE9] border-[#D1CEC7] text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                            Markdown
                          </div>
                          <div className="text-[10px] text-neutral-500 font-serif">
                            Compte-rendu technique brut
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* File Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Nom du fichier
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full bg-white border border-[#D1CEC7] px-3.5 py-2 text-xs font-mono text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
                    />
                  </div>

                  {/* Cloud upload button */}
                  <button
                    onClick={handleConfirmSave}
                    disabled={isSaving || isAuthorizing}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving || isAuthorizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#c44d2d]" />
                        <span>Envoi vers Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>
                          {token ? "Enregistrer sur Google Drive" : "Autoriser & Enregistrer sur Google Drive"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-white border-l-4 border-rose-600 text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#E5E2DA] border border-[#D1CEC7] text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
