import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  FileText,
  RefreshCw,
  HardDrive,
  Download,
  AlertCircle,
  Upload,
  FileUp,
} from "lucide-react";
import { DriveFile } from "../types";
import { listDriveFiles, getDriveFileContent } from "../lib/driveService";
import { requestWorkspaceToken } from "../lib/firebase";
import { User } from "firebase/auth";

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (content: string, fileName: string) => void;
  accessToken: string | null;
  currentUser: User | null;
  onLogin: () => Promise<void>;
}

export const DrivePickerModal: React.FC<DrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectContent,
  accessToken: initialToken,
}) => {
  const [token, setToken] = useState<string | null>(initialToken);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (activeTok?: string) => {
    const currentTok = activeTok || token;
    if (!currentTok) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listDriveFiles(currentTok, searchQuery);
      setFiles(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les fichiers depuis Google Drive"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, searchQuery]);

  useEffect(() => {
    if (isOpen && token) {
      fetchFiles();
    }
  }, [isOpen, token, fetchFiles]);

  if (!isOpen) return null;

  const handleAuthorizeDrive = async () => {
    setIsAuthorizing(true);
    setError(null);
    try {
      const newToken = await requestWorkspaceToken();
      if (newToken) {
        setToken(newToken);
        await fetchFiles(newToken);
      } else {
        setError("L'autorisation Google Drive a été annulée.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec d'autorisation Google Workspace");
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onSelectContent(content, file.name);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async (file: DriveFile) => {
    if (!token) return;
    setIsImporting(file.id);
    setError(null);
    try {
      const text = await getDriveFileContent(token, file);
      if (!text || text.trim().length === 0) {
        throw new Error("Le fichier sélectionné est vide ou illisible.");
      }
      onSelectContent(text, file.name);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'extraction du contenu"
      );
    } finally {
      setIsImporting(null);
    }
  };

  const getFileBadge = (mimeType: string) => {
    if (mimeType.includes("document")) {
      return (
        <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-bold bg-blue-50 text-blue-800 border border-blue-200">
          Google Doc
        </span>
      );
    }
    if (mimeType.includes("markdown") || mimeType.includes("md")) {
      return (
        <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Markdown
        </span>
      );
    }
    if (mimeType.includes("json")) {
      return (
        <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-bold bg-amber-50 text-amber-800 border border-amber-200">
          JSON
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
        Fichier Texte
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#D1CEC7] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-[#1A1A1A]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Importer des Signaux &amp; Documents
              </h2>
              <p className="text-[11px] text-neutral-500 font-serif italic">
                Chargez un fichier local ou connectez Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#E5E2DA] text-neutral-600 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-[#F9F8F6]">
          {/* Option A: Direct Local File Upload */}
          <div className="p-5 bg-white border border-[#D1CEC7] space-y-3">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              <FileUp className="w-4 h-4 text-emerald-700" />
              <span>Option 1 : Charger un fichier direct (.txt, .md, .json, .html)</span>
            </div>
            <p className="text-xs text-neutral-600 font-serif">
              Glissez ou sélectionnez un document depuis votre ordinateur sans aucune permission requise.
            </p>
            <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Parcourir mes fichiers locaux</span>
              <input
                type="file"
                accept=".txt,.md,.json,.html,.csv,.rtf"
                onChange={handleLocalFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option B: Google Drive Cloud Connection */}
          <div className="p-5 bg-white border border-[#D1CEC7] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                <HardDrive className="w-4 h-4 text-blue-700" />
                <span>Option 2 : Parcourir Google Drive</span>
              </div>
              {token && (
                <button
                  onClick={() => fetchFiles()}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-[#F1EFE9] hover:bg-[#E5E2DA] text-[10px] font-mono uppercase font-bold text-[#1A1A1A] flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Actualiser</span>
                </button>
              )}
            </div>

            {!token ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-neutral-600 font-serif leading-relaxed">
                  Autorisez l'accès en lecture à vos documents Google Drive pour les importer directement dans l'éditeur.
                </p>
                <button
                  onClick={handleAuthorizeDrive}
                  disabled={isAuthorizing}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-[#F1EFE9] border border-[#1A1A1A] text-[#1A1A1A] font-mono text-xs uppercase tracking-wider font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isAuthorizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#c44d2d]" />
                      <span>Autorisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      <span>Connecter Google Drive</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchFiles()}
                    placeholder="Rechercher par titre ou mot-clé dans Drive..."
                    className="w-full bg-[#FAF8F5] border border-[#D1CEC7] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-neutral-400 focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                {/* File List */}
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-neutral-500 font-serif italic">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
                    Chargement de vos fichiers Drive...
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-500 font-serif italic bg-[#FAF8F5] border border-[#D1CEC7] p-4">
                    <FileText className="w-6 h-6 mx-auto mb-1 opacity-30 text-neutral-400" />
                    Aucun fichier texte ou Google Doc trouvé.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 bg-[#FAF8F5] border border-[#D1CEC7] hover:border-[#1A1A1A] transition-all flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getFileBadge(file.mimeType)}
                            <span className="text-xs font-mono font-bold text-[#1A1A1A] truncate">
                              {file.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Modifié le {new Date(file.modifiedTime).toLocaleDateString("fr-FR")}
                          </div>
                        </div>

                        <button
                          onClick={() => handleImport(file)}
                          disabled={isImporting === file.id}
                          className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-mono text-[10px] uppercase tracking-wider font-bold flex items-center space-x-1 transition-colors disabled:opacity-50"
                        >
                          {isImporting === file.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Chargement...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Importer</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
