import React, { useRef, useState } from "react";
import {
  FileText,
  Upload,
  HardDrive,
  Play,
  CheckCircle2,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Info,
  Layers,
} from "lucide-react";
import { SAMPLE_DATASETS, SampleDataset } from "../sampleData";
import { TemplateTheme, TargetAudience } from "../types";
import { VoiceButton } from "./VoiceButton";

interface RawDataWindowProps {
  rawData: string;
  setRawData: (data: string) => void;
  targetAudience: TargetAudience;
  setTargetAudience: (aud: TargetAudience) => void;
  styleTemplate: TemplateTheme;
  setStyleTemplate: (tpl: TemplateTheme) => void;
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenDrivePicker: () => void;
  isDriveConnected: boolean;
}

export const RawDataWindow: React.FC<RawDataWindowProps> = ({
  rawData,
  setRawData,
  targetAudience,
  setTargetAudience,
  styleTemplate,
  setStyleTemplate,
  language,
  setLanguage,
  onGenerate,
  isLoading,
  onOpenDrivePicker,
  isDriveConnected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingFeed, setIsFetchingFeed] = useState<boolean>(false);
  const [feedNotice, setFeedNotice] = useState<string | null>(null);

  const handleSelectSample = (dataset: SampleDataset) => {
    setRawData(dataset.content);
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

  const handleFetchLiveTechFeed = async (topic: string = "AI & System Architecture") => {
    setIsFetchingFeed(true);
    setFeedNotice(null);
    try {
      const res = await fetch("/api/fetch-live-tech-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.feedText) {
        setRawData(data.feedText);
        setFeedNotice(`Flux d'actualités d'ingénierie "${topic}" chargé avec succès !`);
        setTimeout(() => setFeedNotice(null), 5000);
      }
    } catch (_err) {
      // Handled cleanly
    } finally {
      setIsFetchingFeed(false);
    }
  };

  const wordCount = rawData.trim() ? rawData.trim().split(/\s+/).length : 0;
  const charCount = rawData.length;

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Hero Ingest Header */}
      <div className="border border-[#1a1a1a] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold block mb-1">
              Console d'Ingestion Brute • Multi-Domaines
            </span>
            <h1 className="font-display italic font-medium text-3xl sm:text-4xl text-[#1a1a1a] leading-tight">
              Données Brutes, Dépêches &amp; Flux d'Ingénierie
            </h1>
            <p className="font-serif text-base text-neutral-700 mt-2 leading-relaxed max-w-2xl">
              Collez vos flux RSS, dépêches Reuters/Bloomberg, prépublications arXiv, notes d'ingénierie internes ou documents Drive. L'agent débruite les contenus sponsorisés et retient les 3 innovations majeures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleFetchLiveTechFeed("Architecture LLM & GPU Inference")}
              disabled={isFetchingFeed}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[#f8f7f4] hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.7rem] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c44d2d] ${isFetchingFeed ? "animate-spin" : ""}`} />
              <span>{isFetchingFeed ? "Génération Flux..." : "Générer Flux Live (IA & Systèmes)"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFetchLiveTechFeed("Finance, Banques Centrales & Marchés")}
              disabled={isFetchingFeed}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[#f8f7f4] hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.7rem] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isFetchingFeed ? "animate-spin" : ""}`} />
              <span>Flux Live (Finance &amp; Taux)</span>
            </button>
          </div>
        </div>

        {feedNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{feedNotice}</span>
          </div>
        )}

        {/* 2-Columns Layout: Editor vs Configuration & Samples */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Textarea Ingest Console */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="border border-[#1a1a1a] bg-white flex-1 flex flex-col shadow-xs">
              <div className="px-4 py-3 bg-[#1a1a1a] text-[#f8f7f4] flex justify-between items-center">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white">
                  Source: Éditeur de Dépêches Brutes
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-400">
                  [{wordCount} mots • {charCount} car.]
                </span>
              </div>

              <textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder="[COLLEZ ICI VOS DÉPÊCHES OU NOTES BRUTES]&#10;Item 1: [Paper arXiv:2502.09112] Chunked-Prefill Multi-Tenant KV-Cache...&#10;Item 2: [SPONSORISÉ - Pub SuperCloud AI] Hébergez votre IA pour 5$/mois...&#10;Item 3: [BCE Rapport Trimestriel] Taux de dépôt et volume de liquidités bancaires...&#10;Item 4: [Nature Energy] Cellules solaires tandem pérovskite-silicium 34.2%..."
                spellCheck={false}
                rows={16}
                className="w-full flex-1 p-5 font-mono text-xs text-[#1a1a1a] bg-white outline-none resize-y leading-relaxed"
              />

              {/* Utility actions inside the block bottom */}
              <div className="px-4 py-3 bg-[#f8f7f4] border-t border-[rgba(26,26,26,0.1)] flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[0.65rem] text-neutral-500">
                  Formats acceptés : Dépêches, RSS, Rapports, arXiv, JSON, CSV
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onOpenDrivePicker}
                    className="px-3 py-1.5 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] transition-colors cursor-pointer flex items-center space-x-1"
                    title="Importer un document Google Drive"
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>Drive {isDriveConnected ? "✓" : "+"}</span>
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
                    className="px-3 py-1.5 bg-white hover:bg-[#1a1a1a] hover:text-white border border-[#1a1a1a] font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] transition-colors cursor-pointer flex items-center space-x-1"
                    title="Importer un fichier local"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Fichier Local</span>
                  </button>

                  {rawData && (
                    <>
                      <VoiceButton
                        text={rawData.slice(0, 1500)}
                        label="Écouter le texte brut"
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => setRawData("")}
                        className="px-3 py-1.5 bg-transparent hover:bg-rose-100 border border-[rgba(26,26,26,0.2)] text-neutral-600 hover:text-rose-800 font-mono text-[0.65rem] uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Effacer</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sample Presets & Parameters */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* 1-Click Sample Datasets */}
            <div>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold block mb-3">
                Jeux d'Essais Thématiques (1-Clic)
              </span>
              <div className="flex flex-col gap-2">
                {SAMPLE_DATASETS.map((dataset) => (
                  <button
                    key={dataset.id}
                    type="button"
                    onClick={() => handleSelectSample(dataset)}
                    className="text-left p-3.5 bg-[#f8f7f4] hover:bg-white border border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] transition-all cursor-pointer group flex items-start justify-between"
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
                    <span className="font-mono text-[0.65rem] text-neutral-400 pl-2 shrink-0">
                      {dataset.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration Form */}
            <div className="pt-4 border-t border-[rgba(26,26,26,0.12)]">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold block mb-3">
                Paramètres du Ghostwriter
              </span>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block mb-1">
                    Audience Cible
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

            {/* Anti-noise reminder */}
            <div className="bg-[rgba(26,26,26,0.05)] border-l-2 border-[#1a1a1a] p-3.5 font-serif text-xs text-neutral-700 italic leading-relaxed">
              « Le filtre autonome élimine automatiquement les publicités, annonces marketing et rumeurs pour isoler les 3 faits vérifiables majeurs. »
            </div>

            {/* Action CTA */}
            <button
              onClick={onGenerate}
              disabled={isLoading || !rawData.trim()}
              className="w-full bg-[#c44d2d] hover:bg-[#b04022] text-white p-5 font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Play className={`w-4 h-4 ${isLoading ? "animate-spin" : "fill-current"}`} />
              <span>
                {isLoading
                  ? "Débruitage & Synthèse en Cours..."
                  : "Filtrer & Rédiger la Synthèse (3 Majeures)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
