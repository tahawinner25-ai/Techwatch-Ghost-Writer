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
} from "lucide-react";
import { NewsletterResult, DriveFile } from "../types";
import { createDriveFile } from "../lib/driveService";
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
  accessToken,
  currentUser,
  onLogin,
}) => {
  const defaultBaseName = `TechWatch-${newsletter.dateStr || "Edition"}`.replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );

  const [format, setFormat] = useState<"html" | "markdown">("html");
  const [fileName, setFileName] = useState(
    `${defaultBaseName}.html`
  );
  const [isSaving, setIsSaving] = useState(false);
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

  const handleConfirmSave = async () => {
    if (!accessToken) return;
    setIsSaving(true);
    setError(null);
    setCreatedFile(null);

    try {
      const content =
        format === "html" ? newsletter.html : getMarkdownContent();
      const mimeType = format === "html" ? "text/html" : "text/markdown";

      const file = await createDriveFile(
        accessToken,
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
              Enregistrer dans Google Drive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#E5E2DA] text-neutral-600 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-[#F9F8F6]">
          {!accessToken || !currentUser ? (
            <div className="text-center py-8 space-y-4 bg-white border border-[#D1CEC7] p-6">
              <HardDrive className="w-10 h-10 mx-auto text-neutral-400" />
              <div>
                <h3 className="font-serif italic text-lg text-[#1A1A1A] mb-1">
                  Connexion Google Drive Requise
                </h3>
                <p className="text-xs text-neutral-600 font-serif leading-relaxed mb-4">
                  Connectez votre compte Google pour autoriser l'enregistrement
                  sécurisé de cette édition dans votre Drive.
                </p>
                <button
                  onClick={onLogin}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-colors"
                >
                  Se connecter avec Google
                </button>
              </div>
            </div>
          ) : createdFile ? (
            <div className="bg-white border border-[#D1CEC7] p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-[#1A1A1A] mb-1">
                  Fichier Enregistré avec Succès !
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
              {/* Mandatory Confirmation Notice */}
              <div className="p-4 bg-[#F1EFE9] border-y border-[#1A1A1A] text-xs text-[#1A1A1A] leading-relaxed font-serif">
                <strong className="block font-sans uppercase tracking-widest text-[10px] mb-1 font-bold">
                  Confirmation d'écriture Google Drive
                </strong>
                Vous êtes sur le point de créer un nouveau fichier dans votre
                espace Google Drive sous le compte{" "}
                <strong>{currentUser.email}</strong>.
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

              {/* Error Notice */}
              {error && (
                <div className="p-3 bg-white border-l-4 border-rose-600 text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#E5E2DA] border border-[#D1CEC7] text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] transition-colors"
          >
            {createdFile ? "Fermer" : "Annuler"}
          </button>

          {!createdFile && accessToken && currentUser && (
            <button
              onClick={handleConfirmSave}
              disabled={isSaving || !fileName.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Confirmer et Enregistrer</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
