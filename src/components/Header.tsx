import React from "react";
import {
  History,
  LogOut,
  HardDrive,
  BarChart3,
  FileText,
  Share2,
  Search,
} from "lucide-react";
import { User } from "firebase/auth";

export type AppViewMode = "raw_data" | "social" | "search" | "analytics";

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  queueCount?: number;
  currentUser: User | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  isLoggingIn?: boolean;
  currentView: AppViewMode;
  onToggleView: (view: AppViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  historyCount,
  queueCount = 0,
  currentUser,
  onLogin,
  onLogout,
  isLoggingIn,
  currentView,
  onToggleView,
}) => {
  return (
    <header className="border-b border-[#1a1a1a] bg-[#f8f7f4] sticky top-0 z-30 px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Identity */}
      <div>
        <div
          className="font-display italic font-medium text-2xl sm:text-3xl text-[#1a1a1a] leading-none select-none cursor-pointer"
          onClick={() => onToggleView("raw_data")}
        >
          Ghostwriter
        </div>
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-[#c44d2d] mt-1">
          Veille Stratégique Multi-Domaines • Agent v2.4
        </div>
      </div>

      {/* Center Navigation Switcher - 4 Dedicated Windows */}
      <nav className="flex flex-wrap items-center space-x-1 border border-[#1a1a1a] p-1 bg-white shadow-2xs">
        <button
          onClick={() => onToggleView("raw_data")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
            currentView === "raw_data"
              ? "bg-[#1a1a1a] text-white shadow-xs font-bold"
              : "text-neutral-600 hover:text-[#1a1a1a] bg-transparent"
          }`}
          title="Console d'ingestion des flux bruts, fichiers et dépêches"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Données Brutes &amp; Dépêches</span>
        </button>

        <button
          onClick={() => onToggleView("social")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
            currentView === "social"
              ? "bg-[#1a1a1a] text-white shadow-xs font-bold"
              : "text-neutral-600 hover:text-[#1a1a1a] bg-transparent"
          }`}
          title="Extraction & analyse des signaux faibles sur X, Instagram, Facebook"
        >
          <Share2 className="w-3.5 h-3.5 text-[#c44d2d]" />
          <span>Réseaux Sociaux &amp; Signaux</span>
        </button>

        <button
          onClick={() => onToggleView("search")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
            currentView === "search"
              ? "bg-[#1a1a1a] text-white shadow-xs font-bold"
              : "text-neutral-600 hover:text-[#1a1a1a] bg-transparent"
          }`}
          title="Recherche ciblée web en direct via Google Search Grounding"
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Recherche Ciblée &amp; Grounding</span>
        </button>

        <button
          onClick={() => onToggleView("analytics")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
            currentView === "analytics"
              ? "bg-[#1a1a1a] text-white shadow-xs font-bold"
              : "text-neutral-600 hover:text-[#1a1a1a] bg-transparent"
          }`}
          title="Métriques d'audience, taux d'ouverture et clics"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Statistiques &amp; Télémétrie</span>
        </button>
      </nav>

      {/* Action badges, Drive Status & Auth */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {currentUser && (
          <div className="hidden lg:flex items-center font-mono text-[0.65rem] uppercase tracking-wider text-emerald-800 font-bold bg-white px-2.5 py-1.5 border border-[rgba(26,26,26,0.15)]">
            <HardDrive className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
            <span>Drive &amp; Cloud Actifs</span>
          </div>
        )}

        <button
          onClick={onOpenHistory}
          className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-transparent hover:bg-white border border-[#1a1a1a] font-mono text-[0.7rem] uppercase tracking-wider text-[#1a1a1a] transition-all cursor-pointer"
          title="Historique des newsletters et file d'attente"
        >
          <History className="w-3.5 h-3.5 text-neutral-700" />
          <span className="hidden sm:inline">Historique</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#1a1a1a] text-white text-[10px] font-mono">
              {historyCount}
            </span>
          )}
          {queueCount > 0 && (
            <span
              className="px-1.5 py-0.2 bg-[#c44d2d] text-white text-[10px] font-mono font-bold"
              title={`${queueCount} envoi(s) planifié(s)`}
            >
              Q:{queueCount}
            </span>
          )}
        </button>

        {/* User Sign In / Profile */}
        {currentUser ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-[rgba(26,26,26,0.15)]">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || "User"}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-[#1a1a1a]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center font-bold font-mono">
                {(currentUser.email || currentUser.displayName || "U").charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="hidden xl:block text-left text-xs max-w-[120px] truncate font-mono text-neutral-700">
              {currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Utilisateur")}
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-neutral-600 hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#1a1a1a] transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-mono text-[0.7rem] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>{isLoggingIn ? "Connexion..." : "Google Login"}</span>
          </button>
        )}
      </div>
    </header>
  );
};

