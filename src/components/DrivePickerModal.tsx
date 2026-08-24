import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  FileText,
  RefreshCw,
  FileCode,
  HardDrive,
  Download,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { DriveFile } from "../types";
import { listDriveFiles, getDriveFileContent } from "../lib/driveService";
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
  accessToken,
  currentUser,
  onLogin,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listDriveFiles(accessToken, searchQuery);
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
  }, [accessToken, searchQuery]);

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFiles();
    }
  }, [isOpen, accessToken, fetchFiles]);

  if (!isOpen) return null;

  const handleImport = async (file: DriveFile) => {
    if (!accessToken) return;
    setIsImporting(file.id);
    setError(null);
    try {
      const text = await getDriveFileContent(accessToken, file);
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
      <div className="bg-white border border-[#D1CEC7] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-[#1A1A1A]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Importer depuis Google Drive
              </h2>
              <p className="text-[11px] text-neutral-500 font-serif italic">
                Sélectionnez un document, une note de veille ou un fichier texte
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
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-[#F9F8F6]">
          {!accessToken || !currentUser ? (
            <div className="text-center py-12 px-4 space-y-4 bg-white border border-[#D1CEC7] p-8">
              <HardDrive className="w-12 h-12 mx-auto text-neutral-400" />
              <div className="max-w-md mx-auto">
                <h3 className="font-serif italic text-xl text-[#1A1A1A] mb-2">
                  Connexion Google Drive Requise
                </h3>
                <p className="text-xs text-neutral-600 font-serif leading-relaxed mb-6">
                  Connectez votre compte Google pour accéder à vos documents,
                  comptes-rendus techniques et flux de veille hébergés sur Google
                  Drive.
                </p>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter avec Google</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search & Actions Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchFiles()}
                    placeholder="Rechercher par titre ou mot-clé dans Drive..."
                    className="w-full bg-white border border-[#D1CEC7] pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-neutral-400 focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
                <button
                  onClick={fetchFiles}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white hover:bg-[#F1EFE9] border border-[#D1CEC7] text-xs uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-white border-l-4 border-rose-600 text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* File List */}
              {isLoading ? (
                <div className="py-16 text-center text-xs text-neutral-500 font-serif italic">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                  Chargement de vos fichiers Google Drive...
                </div>
              ) : files.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500 font-serif italic bg-white border border-[#D1CEC7] p-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                  Aucun fichier texte ou document trouvé dans Google Drive.
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-white border border-[#D1CEC7] hover:border-[#1A1A1A] transition-all flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getFileBadge(file.mimeType)}
                          {file.modifiedTime && (
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Modifié le{" "}
                              {new Date(file.modifiedTime).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-serif font-bold text-[#1A1A1A] truncate">
                          {file.name}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-400 hover:text-[#1A1A1A] transition-colors"
                            title="Ouvrir dans Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleImport(file)}
                          disabled={isImporting === file.id}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-[10px] uppercase tracking-widest font-bold shadow-xs transition-colors disabled:opacity-50"
                        >
                          {isImporting === file.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Extraction...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Importer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D1CEC7] bg-[#F1EFE9] flex items-center justify-between text-xs">
          <span className="text-neutral-500 text-[11px] font-mono">
            {currentUser
              ? `Connecté en tant que ${currentUser.email}`
              : "Non connecté à Google Drive"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#E5E2DA] border border-[#D1CEC7] text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
