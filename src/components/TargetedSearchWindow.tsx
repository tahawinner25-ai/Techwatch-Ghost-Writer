import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Globe,
  CheckCircle2,
  SlidersHorizontal,
  Play,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  Layers,
  Building2,
  Cpu,
  Leaf,
  Dna,
  Coins,
  Compass,
} from "lucide-react";
import { TemplateTheme, TargetAudience } from "../types";

interface TargetedSearchWindowProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  targetAudience: TargetAudience;
  setTargetAudience: (aud: TargetAudience) => void;
  styleTemplate: TemplateTheme;
  setStyleTemplate: (tpl: TemplateTheme) => void;
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const SEARCH_DOMAINS = [
  {
    id: "finance",
    label: "Finance & Marchés",
    icon: Building2,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    query: "Taux directeurs BCE Fed rendements obligataires 10 ans liquidité marchés",
    description: "Politique monétaire, spreads souverains, valorisations boursières et flux institutionnels.",
    suggestedTopics: [
      "Taux directeurs BCE & Fed 2026",
      "Courbe des rendements obligataires 10 ans",
      "Spreads de crédit corporate & liquidité",
      "Valorisations boursières & flux institutionnels",
    ],
  },
  {
    id: "ai_systems",
    label: "IA & Systèmes R&D",
    icon: Cpu,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    query: "Inférence LLM KV-Cache optimisations GPU FlashAttention architectures",
    description: "Inférence distribuée, compilation de modèles, benchmarks matériels et modèles raisonnants.",
    suggestedTopics: [
      "Inférence LLM & Chunked Prefill KV-Cache",
      "Modèles de raisonnement & Distillation",
      "Accélérateurs GPU & Hardware FP8",
      "Runtimes asynchrones & Kernels Rust",
    ],
  },
  {
    id: "climate_energy",
    label: "Climat & Énergie",
    icon: Leaf,
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    query: "Cellules solaires tandem pérovskite silicium batteries sodium-ion HVDC",
    description: "Photovoltaïque de rupture, stockage stationnaire, réseaux HVDC et décarbonation.",
    suggestedTopics: [
      "Cellules solaires tandem Pérovskite 34%",
      "Batteries Sodium-Ion stockage stationnaire",
      "Liaisons sous-marines HVDC 525 kV",
      "Capture carbone industrielle & hydrogène",
    ],
  },
  {
    id: "biotech_health",
    label: "Santé & Biotech",
    icon: Dna,
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    query: "Thérapies géniques CRISPR in vivo nanoparticules LNP vaccins ARN messager",
    description: "Édition génomique de précision, vaccins thermostables et criblage moléculaire par IA.",
    suggestedTopics: [
      "Thérapies CRISPR in vivo par LNP",
      "Vaccins ARN messager conservés à +4°C",
      "Conception moléculaire de novo par IA",
      "Essais cliniques oncologie de précision",
    ],
  },
  {
    id: "crypto_web3",
    label: "Crypto & Web3",
    icon: Coins,
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    query: "Ethereum Layer-2 zero-knowledge rollups DeFi institutionnelle Bitcoin ETF",
    description: "Preuves à divulgation nulle de connaissance (ZK), conformité MiCA et finance décentralisée.",
    suggestedTopics: [
      "ZK-Rollups & scalabilité Ethereum",
      "Adoption institutionnelle des actifs tokenisés",
      "Règlement européen MiCA & stablecoins",
      "Sécurité des ponts inter-chaînes",
    ],
  },
  {
    id: "geopolitics",
    label: "Géopolitique & Stratégie",
    icon: Compass,
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
    query: "Corridors maritimes minerais critiques semi-conducteurs accords commerciaux",
    description: "Sécurisation des chaînes de valeur, matières premières critiques et souveraineté.",
    suggestedTopics: [
      "Chaîne d'approvisionnement des semi-conducteurs",
      "Minerais critiques & terres rares",
      "Sécurité des câbles sous-marins et routes",
      "Accords commerciaux bilatéraux et devises",
    ],
  },
];

export const TargetedSearchWindow: React.FC<TargetedSearchWindowProps> = ({
  searchQuery,
  setSearchQuery,
  targetAudience,
  setTargetAudience,
  styleTemplate,
  setStyleTemplate,
  language,
  setLanguage,
  onGenerate,
  isLoading,
}) => {
  const [activeDomainId, setActiveDomainId] = useState<string>("ai_systems");
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "Inférence LLM KV-Cache optimisations GPU",
    "Taux directeurs BCE et rendements obligataires",
    "Cellules solaires tandem pérovskite 34%",
  ]);

  const activeDomain = SEARCH_DOMAINS.find((d) => d.id === activeDomainId) || SEARCH_DOMAINS[0];

  const handleSelectDomain = (domain: typeof SEARCH_DOMAINS[0]) => {
    setActiveDomainId(domain.id);
    setSearchQuery(domain.query);
  };

  const handleSelectTopic = (topic: string) => {
    setSearchQuery(topic);
    if (!recentQueries.includes(topic)) {
      setRecentQueries([topic, ...recentQueries.slice(0, 4)]);
    }
  };

  const handleExecuteSearch = () => {
    if (!searchQuery.trim()) return;
    if (!recentQueries.includes(searchQuery.trim())) {
      setRecentQueries([searchQuery.trim(), ...recentQueries.slice(0, 4)]);
    }
    onGenerate();
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="border border-[#1a1a1a] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold">
                Moteur de Recherche &amp; Veille Groundée
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                Google Search En Direct
              </span>
            </div>
            <h1 className="font-display italic font-medium text-3xl sm:text-4xl text-[#1a1a1a] leading-tight">
              Recherche Ciblée &amp; Corroboration Web Universelle
            </h1>
            <p className="font-serif text-base text-neutral-700 mt-2 leading-relaxed">
              Explorez n'importe quelle thématique en temps réel. L'agent interroge Google Search, filtre le bruit marketing, vérifie les publications officielles et synthétise les 3 faits majeurs avec diagrammes Mermaid.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#f8f7f4] border border-[rgba(26,26,26,0.15)] px-3 py-2">
            <Globe className="w-4 h-4 text-[#c44d2d]" />
            <div className="font-mono text-[0.65rem] text-neutral-700">
              <span className="font-bold text-[#1a1a1a]">Grounding Vérifié</span> • Sources Citées
            </div>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="mt-6">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-neutral-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() && !isLoading) {
                  handleExecuteSearch();
                }
              }}
              placeholder="Saisissez une thématique précise (ex: Rendements obligataires BCE, Inférence KV-Cache, Cellules Tandem Pérovskite, Thérapies CRISPR...)"
              className="w-full pl-12 pr-32 py-4 font-serif text-base sm:text-lg border-2 border-[#1a1a1a] bg-white outline-none focus:bg-[#fcfbf9] transition-all"
            />
            <div className="absolute right-2.5 flex items-center space-x-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2.5 py-1 text-xs font-mono text-neutral-500 hover:text-[#1a1a1a] cursor-pointer"
                >
                  Effacer
                </button>
              )}
              <button
                type="button"
                onClick={handleExecuteSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-5 py-2.5 bg-[#c44d2d] hover:bg-[#b04022] text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Play className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : "fill-current"}`} />
                <span>{isLoading ? "Recherche..." : "Lancer"}</span>
              </button>
            </div>
          </div>

          {/* Recent Queries */}
          {recentQueries.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-[0.65rem] text-neutral-500 uppercase tracking-wider">
                Récents :
              </span>
              {recentQueries.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(q)}
                  className="px-2.5 py-0.5 bg-[#f8f7f4] hover:bg-neutral-200 border border-[rgba(26,26,26,0.12)] text-[#1a1a1a] text-[11px] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Domain Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block">
              Exploration Thématique Guidée
            </span>
            <h2 className="font-display italic text-2xl text-[#1a1a1a]">
              Sélectionnez un Grand Domaine Stratégique
            </h2>
          </div>
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500 hidden sm:block">
            6 Pôles de Veille Fact-Checkés
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEARCH_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isSelected = activeDomainId === domain.id;
            return (
              <div
                key={domain.id}
                onClick={() => handleSelectDomain(domain)}
                className={`p-5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[#1a1a1a] bg-white shadow-sm ring-1 ring-[#1a1a1a]"
                    : "border-[rgba(26,26,26,0.15)] bg-white hover:border-[#1a1a1a] hover:bg-[#faf9f6]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 border ${domain.bgColor}`}>
                        <Icon className={`w-4 h-4 ${domain.color}`} />
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#1a1a1a]">
                        {domain.label}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-[#1a1a1a] text-white text-[10px] font-mono uppercase">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-xs text-neutral-600 mt-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[rgba(26,26,26,0.08)]">
                  <div className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500 mb-2">
                    Sujets clés :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {domain.suggestedTopics.map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTopic(topic);
                        }}
                        className="px-2 py-1 bg-[#f8f7f4] hover:bg-[#1a1a1a] hover:text-white border border-[rgba(26,26,26,0.12)] font-mono text-[10px] text-neutral-700 transition-colors cursor-pointer"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editorial Configuration & Launch Workspace */}
      <div className="border border-[#1a1a1a] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(26,26,26,0.12)]">
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block">
              Paramètres Éditoriaux &amp; Ciblage
            </span>
            <h3 className="font-display italic text-2xl text-[#1a1a1a]">
              Personnalisation du Ghostwriter
            </h3>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs text-neutral-600">
            <SlidersHorizontal className="w-4 h-4 text-[#c44d2d]" />
            <span>Format &amp; Audience</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-600 block mb-1.5 font-bold">
              Audience Cible
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full p-3 font-serif text-sm border border-[#1a1a1a] bg-white text-[#1a1a1a] outline-none"
            >
              <option value="Dirigeants, Décideurs & Stratèges">Dirigeants, Décideurs &amp; Stratèges</option>
              <option value="CTO & Ingénieurs Seniors">CTO &amp; Ingénieurs Seniors</option>
              <option value="Tech Leads & Développeurs">Tech Leads &amp; Développeurs</option>
              <option value="Analystes Financiers & Investisseurs">Analystes Financiers &amp; Investisseurs</option>
              <option value="Chercheurs & R&D">Chercheurs &amp; R&amp;D</option>
              <option value="Architectes Solutions">Architectes Solutions &amp; Cloud</option>
            </select>
            <p className="font-serif text-[11px] text-neutral-500 mt-1">
              Adapte le vocabulaire et la densité d'impact.
            </p>
          </div>

          <div>
            <label className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-600 block mb-1.5 font-bold">
              Gabarit Visuel Email
            </label>
            <select
              value={styleTemplate}
              onChange={(e) => setStyleTemplate(e.target.value as TemplateTheme)}
              className="w-full p-3 font-serif text-sm border border-[#1a1a1a] bg-white text-[#1a1a1a] outline-none"
            >
              <option value="editorial">Editorial Warm Paper (Élégant &amp; Pro)</option>
              <option value="slate">Modern Tech Slate (Ardoise &amp; Bleu)</option>
              <option value="indigo">Deep Indigo (Contraste Nuit)</option>
              <option value="terminal">Cyber Terminal (Monospace)</option>
            </select>
            <p className="font-serif text-[11px] text-neutral-500 mt-1">
              Palette de couleurs et typographie du rendu HTML.
            </p>
          </div>

          <div>
            <label className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-600 block mb-1.5 font-bold">
              Langue de Rédaction
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
              className="w-full p-3 font-serif text-sm border border-[#1a1a1a] bg-white text-[#1a1a1a] outline-none"
            >
              <option value="fr">Français (Factuel &amp; Rigoureux)</option>
              <option value="en">English (Concise &amp; High-Impact)</option>
            </select>
            <p className="font-serif text-[11px] text-neutral-500 mt-1">
              Traduction et synthèse nativement formulées.
            </p>
          </div>
        </div>

        {/* Process Checklist */}
        <div className="bg-[#f8f7f4] border border-[rgba(26,26,26,0.12)] p-4 sm:p-5 mb-6">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold mb-2">
            Protocole de Vérification Autonome Déclenché :
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-serif text-neutral-700">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>1. Recherche web temps réel sur "{searchQuery || activeDomain.label}"</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>2. Élimination du bruit marketing &amp; rumeurs clickbait</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>3. Rédaction des 3 Faits Majeurs + Diagrammes Mermaid</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecuteSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="w-full bg-[#c44d2d] hover:bg-[#b04022] text-white p-5 font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Play className={`w-4 h-4 ${isLoading ? "animate-spin" : "fill-current"}`} />
          <span>
            {isLoading
              ? "Recherche Web & Rédaction de la Synthèse en Cours..."
              : `Générer la Newsletter Ciblée sur : "${searchQuery || activeDomain.label}"`}
          </span>
        </button>
      </div>
    </div>
  );
};
