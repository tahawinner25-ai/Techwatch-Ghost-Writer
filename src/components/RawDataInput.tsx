import React, { useState, useRef } from "react";
import {
  FileText,
  Search,
  Upload,
  Trash2,
  Play,
  Layers,
  HardDrive,
  Share2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { SAMPLE_DATASETS, SampleDataset } from "../sampleData";
import { TemplateTheme, TargetAudience } from "../types";
import { SocialMediaHub } from "./SocialMediaHub";

interface RawDataInputProps {
  rawData: string;
  setRawData: (data: string) => void;
  targetAudience: TargetAudience;
  setTargetAudience: (aud: TargetAudience) => void;
  styleTemplate: TemplateTheme;
  setStyleTemplate: (tpl: TemplateTheme) => void;
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
  useSearchGrounding: boolean;
  setUseSearchGrounding: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenDrivePicker: () => void;
  isDriveConnected: boolean;
}

export const RawDataInput: React.FC<RawDataInputProps> = ({
  rawData,
  setRawData,
  targetAudience,
  setTargetAudience,
  styleTemplate,
  setStyleTemplate,
  language,
  setLanguage,
  useSearchGrounding,
  setUseSearchGrounding,
  searchQuery,
  setSearchQuery,
  onGenerate,
  isLoading,
  onOpenDrivePicker,
  isDriveConnected,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "liveSearch" | "socialHub">("text");
  const [socialInjectedNotice, setSocialInjectedNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (dataset: SampleDataset) => {
    setRawData(dataset.content);
    setUseSearchGrounding(false);
    setActiveTab("text");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleInjectSocialData = (formattedContent: string, count: number) => {
    const updated = rawData.trim()
      ? `${rawData.trim()}\n\n${formattedContent}`
      : formattedContent;
    setRawData(updated);
    setUseSearchGrounding(false);
    setActiveTab("text");
    setSocialInjectedNotice(`${count} post(s) sociaux recommandés injectés dans la console.`);
    setTimeout(() => setSocialInjectedNotice(null), 5000);
  };

  const wordCount = rawData.trim() ? rawData.trim().split(/\s+/).length : 0;
  const charCount = rawData.length;

  return (
    <div className="w-full">
      {/* Mode navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[rgba(26,26,26,0.12)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("text");
              setUseSearchGrounding(false);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-[#1a1a1a] text-white shadow-xs"
                : "bg-transparent hover:bg-white border border-[rgba(26,26,26,0.15)] text-[#1a1a1a]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Données Brutes &amp; Dépêches</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("socialHub");
              setUseSearchGrounding(false);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "socialHub"
                ? "bg-[#1a1a1a] text-white shadow-xs"
                : "bg-transparent hover:bg-white border border-[rgba(26,26,26,0.15)] text-[#1a1a1a]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#c44d2d]" />
            <span>Réseaux Sociaux (X, Insta, FB)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("liveSearch");
              setUseSearchGrounding(true);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "liveSearch"
                ? "bg-[#1a1a1a] text-white shadow-xs"
                : "bg-transparent hover:bg-white border border-[rgba(26,26,26,0.15)] text-[#1a1a1a]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Recherche Ciblée (Search)</span>
          </button>
        </div>

        <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-neutral-500">
          MODE DE VEILLE AUTONOME HAUTE FIDÉLITÉ
        </div>
      </div>

      {/* Social injection alert */}
      {socialInjectedNotice && (
        <div className="mb-6 p-3 bg-white border border-[#c44d2d] text-[#1a1a1a] text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#c44d2d] shrink-0" />
          <span>{socialInjectedNotice}</span>
        </div>
      )}

      {/* Social Hub View */}
      {activeTab === "socialHub" && (
        <div className="mb-8">
          <SocialMediaHub
            onInjectData={handleInjectSocialData}
            targetAudience={targetAudience}
          />
        </div>
      )}

      {/* Grid: 2 Columns layout corresponding to the Design Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Heading, Lead & Ingest Block */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-6">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block mb-2">
              Édition Spéciale — Intelligence Multi-Domaines
            </span>
            <h2 className="font-display italic font-medium text-3xl sm:text-4xl lg:text-5xl text-[#1a1a1a] leading-[1.1] tracking-tight">
              Transformez des données brutes en une veille d'élite.
            </h2>
            <p className="font-serif text-base sm:text-lg text-neutral-700 mt-4 leading-relaxed max-w-xl">
              Le filtrage autonome isole rigoureusement les 3 faits majeurs (Tech, Finance, Climat, Santé, Géopolitique, Business) et génère des diagrammes explicatifs et exports complets.
            </p>
          </div>

          {/* Ingest Block (Text Mode or Search Mode) */}
          {activeTab === "text" || activeTab === "socialHub" ? (
            <div className="border border-[#1a1a1a] bg-white flex-1 flex flex-col shadow-xs">
              <div className="px-4 py-3 bg-[#1a1a1a] text-[#f8f7f4] flex justify-between items-center">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white">
                  Source: Raw Data Ingest (Tous Domaines)
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-400">
                  [{wordCount} mots • {charCount} car.]
                </span>
              </div>

              <textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder="[FLUX DÉPÊCHES & ARTICLES MULTI-DOMAINES]&#10;Item 1: [Paper arXiv:2502.09112] Chunked-Prefill Multi-Tenant KV-Cache...&#10;Item 2: [SPONSORISÉ - Pub SuperCloud AI]&#10;Item 3: [Banque Centrale Européenne] Rapport Taux Directeurs & Marché Obligataire...&#10;Item 4: [Revue Nature Energy] Rendement record cellules Tandem Pérovskite-Silicium..."
                spellCheck={false}
                rows={12}
                className="w-full flex-1 p-5 font-mono text-xs text-[#1a1a1a] bg-white outline-none resize-y leading-relaxed"
              />

              {/* Utility actions inside the block bottom */}
              <div className="px-4 py-2.5 bg-[#f8f7f4] border-t border-[rgba(26,26,26,0.1)] flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[0.65rem] text-neutral-500">
                  Format brut : Dépêches, RSS, Rapports, arXiv, Relevés
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onOpenDrivePicker}
                    className="px-2.5 py-1 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] transition-colors cursor-pointer"
                    title="Importer un document Google Drive"
                  >
                    Drive {isDriveConnected ? "✓" : "+"}
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.json,.xml,.csv"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] transition-colors cursor-pointer"
                    title="Importer un fichier local"
                  >
                    Fichier
                  </button>

                  {rawData && (
                    <button
                      type="button"
                      onClick={() => setRawData("")}
                      className="px-2.5 py-1 bg-transparent hover:bg-rose-100 border border-[rgba(26,26,26,0.2)] text-neutral-600 hover:text-rose-800 font-mono text-[0.65rem] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[#1a1a1a] bg-white p-6 shadow-xs flex-1 flex flex-col">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] mb-2">
                Recherche Ciblée Google Grounding (Tous Domaines)
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Taux directeurs BCE, stockage énergie pérovskite, inférence LLM..."
                className="w-full p-4 font-serif text-base border border-[#1a1a1a] bg-white outline-none focus:ring-1 focus:ring-[#1a1a1a] mb-4"
              />
              <div className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500 mb-2">
                Thématiques suggérées (Tous Domaines) :
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "IA & Systèmes : Inférence LLM & KV-Cache",
                  "Macro-Économie & Marchés Obligataires",
                  "Climat & Énergie : Cellules Solaires Pérovskite",
                  "Biotech : Thérapies Géniques CRISPR in vivo",
                  "Géopolitique : Routes Maritimes & Minerais Critiques",
                  "Cryptographie Post-Quantique TLS 1.3",
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSearchQuery(topic)}
                    className="border border-[rgba(26,26,26,0.15)] px-3 py-1.5 font-mono text-[0.7rem] bg-[#f8f7f4] hover:border-[#1a1a1a] text-[#1a1a1a] transition-all cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Samples, Configuration & Main CTA Button */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* 1-Click Samples Strip */}
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block mb-3">
              Échantillons Multi-Domaines (1-clic)
            </span>
            <div className="flex flex-col gap-2">
              {SAMPLE_DATASETS.map((dataset) => (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => handleSelectSample(dataset)}
                  className="text-left p-3.5 bg-white hover:bg-[#f8f7f4] border border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] transition-all cursor-pointer group flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center text-xs font-bold text-[#1a1a1a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c44d2d] mr-2 inline-block shrink-0" />
                      <span>{dataset.title}</span>
                    </div>
                    <p className="font-serif text-xs text-neutral-600 mt-1 pl-3.5 line-clamp-1">
                      {dataset.description}
                    </p>
                  </div>
                  <span className="font-mono text-[0.65rem] text-neutral-400 pl-2">
                    {dataset.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="pt-4 border-t border-[rgba(26,26,26,0.12)]">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block mb-3">
              Configuration du Ghostwriter
            </span>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block mb-1">
                  Cible
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="w-full p-2.5 font-serif text-sm border border-[rgba(26,26,26,0.2)] bg-white text-[#1a1a1a] outline-none"
                >
                  <option value="Dirigeants, Décideurs & Stratèges">Dirigeants &amp; Stratèges</option>
                  <option value="CTO & Ingénieurs Seniors">CTO &amp; Seniors</option>
                  <option value="Tech Leads & Développeurs">Tech Leads &amp; Dév</option>
                  <option value="Analystes Financiers & Investisseurs">Finance &amp; Investisseurs</option>
                  <option value="Chercheurs & R&D">Chercheurs &amp; R&amp;D</option>
                  <option value="Architectes Solutions">Architectes Cloud</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block mb-1">
                  Langue
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
                  className="w-full p-2.5 font-serif text-sm border border-[rgba(26,26,26,0.2)] bg-white text-[#1a1a1a] outline-none"
                >
                  <option value="fr">Français (Factuel)</option>
                  <option value="en">English (Tech)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block mb-1">
                Gabarit Visuel
              </label>
              <select
                value={styleTemplate}
                onChange={(e) => setStyleTemplate(e.target.value as TemplateTheme)}
                className="w-full p-2.5 font-serif text-sm border border-[rgba(26,26,26,0.2)] bg-white text-[#1a1a1a] outline-none"
              >
                <option value="editorial">Editorial Warm Paper (Recommandé)</option>
                <option value="slate">Modern Tech Slate (Ardoise)</option>
                <option value="indigo">Deep Indigo (Nuit & Violet)</option>
                <option value="terminal">Cyber Terminal (Monospace)</option>
              </select>
            </div>
          </div>

          {/* Editorial quote badge */}
          <div className="bg-[rgba(26,26,26,0.05)] border-l-2 border-[#1a1a1a] p-4 font-serif text-xs text-neutral-700 italic leading-relaxed">
            « Le système exclura automatiquement le contenu publicitaire (SuperCloud AI, Webinar No-code) pour se concentrer exclusivement sur l'excellence technique. »
          </div>

          {/* Primary Terracotta Action Button */}
          <button
            onClick={onGenerate}
            disabled={isLoading || (activeTab === "text" || activeTab === "socialHub" ? !rawData.trim() : !searchQuery.trim())}
            className="w-full bg-[#c44d2d] hover:bg-[#b04022] text-white p-5 font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center space-x-2"
          >
            <Play className={`w-4 h-4 ${isLoading ? "animate-spin" : "fill-current"}`} />
            <span>
              {isLoading
                ? "Analyse & Rédaction en Cours..."
                : "Filtrer & Rédiger (3 Majeures)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

