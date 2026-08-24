import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ThumbsUp,
  Share2,
  MessageSquare,
  ArrowRight,
  Filter,
  Check,
  Zap,
  SlidersHorizontal,
  Info,
  Globe,
  Copy,
  Layers,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { SocialPost, SocialPlatform, SocialExtractionResult } from "../types";
import { trackSocialVisit } from "../lib/telemetryService";
import { VoiceButton } from "./VoiceButton";
import { buildSocialPostAudioText } from "../utils/audioTts";

interface SocialMediaHubProps {
  onInjectData: (formattedContent: string, count: number) => void;
  targetAudience: string;
  onDirectGenerate?: (formattedContent: string) => void;
  onNavigateToRawData?: () => void;
  isGenerating?: boolean;
}

const SEARCH_STAGES = [
  { stage: 1, title: "Formulation requêtes d'ancrage", desc: "Génération de requêtes ciblées X, Instagram et Facebook" },
  { stage: 2, title: "Exploration flux & comptes officiels", desc: "Extraction des signaux d'ingénieurs et labos reconnus" },
  { stage: 3, title: "Contrôle d'intégrité anti-404", desc: "Vérification des permaliens directs et des profils réels" },
  { stage: 4, title: "Filtrage & calcul ratio signal/bruit", desc: "Élimination des buzzwords marketing et scoring technique" },
];

const DOMAIN_CATEGORIES = [
  {
    id: "ai_llm",
    name: "🧠 Inférence IA & LLM",
    query: "vLLM KV-Cache FlashAttention GPU inference benchmark",
    categoryLabel: "Architectures LLM & Systèmes d'Inférence",
  },
  {
    id: "rust_kernel",
    name: "🦀 Rust & Kernel Linux",
    query: "Rust 1.85 compiler async closures eBPF Linux kernel",
    categoryLabel: "Langages Systèmes & Runtimes Bas-Niveau",
  },
  {
    id: "security_quantum",
    name: "🛡️ Sécurité & Crypto Post-Quantique",
    query: "Post-Quantum Cryptography FIPS 203 ML-KEM TLS 1.3 NIST",
    categoryLabel: "Cryptographie & Sécurité Infrastructure",
  },
  {
    id: "frontend_react",
    name: "⚛️ Frontend & React 19",
    query: "React Compiler React 19 hydration performance telemetry",
    categoryLabel: "Frameworks Web & Compilateurs Frontend",
  },
  {
    id: "cloud_k8s",
    name: "☁️ Kubernetes & Cloud Native",
    query: "Kubernetes gateway API service mesh Cilium eBPF throughput",
    categoryLabel: "Cloud Native & Orchestration Distribuée",
  },
  {
    id: "hardware_gpu",
    name: "⚡ Hardware & Accélérateurs",
    query: "NVIDIA Blackwell B200 Tensor Core FP8 microarchitecture",
    categoryLabel: "Microarchitecture Silicium & GPU Compute",
  },
];

export const SocialMediaHub: React.FC<SocialMediaHubProps> = ({
  onInjectData,
  targetAudience,
  onDirectGenerate,
  onNavigateToRawData,
  isGenerating = false,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("ai_llm");
  const [query, setQuery] = useState<string>("vLLM KV-Cache FlashAttention GPU inference benchmark");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | SocialPlatform>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const [extractionResult, setExtractionResult] = useState<SocialExtractionResult | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<"all" | "recommended" | "high_signal" | "rejected">("all");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ xConfigured: boolean; metaConfigured: boolean } | null>(null);

  // Check API configuration status on mount
  useEffect(() => {
    fetch("/api/social/status")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus(null));
  }, []);

  // Timer and progress stepper during loading to give the AI proper searching time
  useEffect(() => {
    if (isLoading) {
      setElapsedSeconds(0);
      setSearchStep(0);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const secs = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(secs);
        if (secs < 2) setSearchStep(0);
        else if (secs < 4) setSearchStep(1);
        else if (secs < 7) setSearchStep(2);
        else setSearchStep(3);
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleSelectDomain = (domainId: string) => {
    setSelectedDomain(domainId);
    const domain = DOMAIN_CATEGORIES.find((d) => d.id === domainId);
    if (domain) {
      setQuery(domain.query);
    }
  };

  const handleExtract = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setWarningNotice(null);
    setInjectedSuccess(false);

    const activeDomain = DOMAIN_CATEGORIES.find((d) => d.id === selectedDomain);

    try {
      const response = await fetch("/api/social/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeQuery,
          platform: selectedPlatform,
          domainCategory: activeDomain?.categoryLabel || "Veille Technologique & R&D",
          targetAudience,
          limit: 8,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Erreur HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (resData.warning) {
        setWarningNotice(resData.warning);
      }
      if (resData.data) {
        setExtractionResult(resData.data);
        // Pre-select all recommended posts
        const recommendedIds = new Set<string>(
          (resData.data.posts as SocialPost[])
            .filter((p) => p.isRecommended)
            .map((p) => p.id)
        );
        setSelectedPostIds(recommendedIds);
      }
    } catch (err: unknown) {
      console.error("Extraction error:", err);
      const msg = err instanceof Error ? err.message : "Erreur lors de l'extraction";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectPost = (id: string) => {
    const next = new Set(selectedPostIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPostIds(next);
  };

  const handleSelectAllRecommended = () => {
    if (!extractionResult) return;
    const recommendedIds = new Set<string>(
      extractionResult.posts.filter((p) => p.isRecommended).map((p) => p.id)
    );
    setSelectedPostIds(recommendedIds);
  };

  const handleSelectAll = () => {
    if (!extractionResult) return;
    const allIds = new Set<string>(extractionResult.posts.map((p) => p.id));
    setSelectedPostIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedPostIds(new Set());
  };

  const handleCopyLink = (url: string, postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleOpenDirectPost = (post: SocialPost, e: React.MouseEvent) => {
    e.stopPropagation();
    trackSocialVisit(post.platform, post.url, post.authorName);
  };

  const getFormattedSelectedContent = () => {
    if (!extractionResult) return "";
    const postsToInject = extractionResult.posts.filter((p) => selectedPostIds.has(p.id));
    if (postsToInject.length === 0) return "";

    let formatted = `=== DEPECHES & POSTS EXTRAITS DES RESEAUX SOCIAUX (X, INSTAGRAM, FACEBOOK) ===\n`;
    formatted += `Thematique de veille : ${extractionResult.query}\n`;
    if (extractionResult.domainCategory) {
      formatted += `Domaine : ${extractionResult.domainCategory}\n`;
    }
    formatted += `Synthese Macro Sociale : ${extractionResult.summaryAnalysis}\n\n`;

    postsToInject.forEach((p, idx) => {
      const platLabel = p.platform === "x" ? "X (Twitter)" : p.platform === "instagram" ? "Instagram" : "Facebook";
      formatted += `--- [ITEM ${idx + 1}] ${platLabel} • Auteur: ${p.authorName} (${p.author}) ---\n`;
      formatted += `Date: ${p.timestamp}\n`;
      formatted += `Metriques: ${p.metrics.likes || 0} likes, ${p.metrics.shares || 0} partages/retweets, ${p.metrics.comments || 0} commentaires\n`;
      formatted += `Score de Recommandation: ${p.recommendationScore}/100 (${p.recommendationVerdict})\n`;
      if (p.extractedKeywords && p.extractedKeywords.length > 0) {
        formatted += `Mots-cles: ${p.extractedKeywords.join(", ")}\n`;
      }
      formatted += `Contenu brut du post :\n${p.content}\n`;
      if (p.technicalImpact) {
        formatted += `Impact technique declare : ${p.technicalImpact}\n`;
      }
      if (p.url) {
        formatted += `Lien direct vers la publication : ${p.url}\n`;
      }
      formatted += `\n`;
    });

    formatted += `=== FIN DES DONNEES SOCIALES INJECTEES ===\n`;
    return formatted;
  };

  // Convert selected social posts into rich factual text block for the Ghostwriter console
  const handleInjectSelected = () => {
    const formatted = getFormattedSelectedContent();
    if (!formatted || !extractionResult) return;
    const postsToInject = extractionResult.posts.filter((p) => selectedPostIds.has(p.id));
    onInjectData(formatted, postsToInject.length);
    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 4000);
    if (onNavigateToRawData) {
      setTimeout(() => onNavigateToRawData(), 1200);
    }
  };

  const handleDirectGenerateClick = () => {
    const formatted = getFormattedSelectedContent();
    if (formatted && onDirectGenerate) {
      onDirectGenerate(formatted);
    }
  };

  // Filter posts based on selected tab filter
  const filteredPosts = (extractionResult?.posts || []).filter((p) => {
    if (filterVerdict === "recommended") return p.isRecommended;
    if (filterVerdict === "high_signal") return p.recommendationScore >= 80;
    if (filterVerdict === "rejected") return !p.isRecommended || p.recommendationScore < 50;
    return true;
  });

  const getPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case "x":
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#111111] text-white text-[10px] font-mono font-bold tracking-wider">
            𝕏 X (Twitter)
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[10px] font-sans font-bold tracking-wider">
            📷 Instagram
          </span>
        );
      case "facebook":
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-[#1877F2] text-white text-[10px] font-sans font-bold tracking-wider">
            f Facebook
          </span>
        );
    }
  };

  const getVerdictBadge = (post: SocialPost) => {
    if (post.recommendationScore >= 85) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Score {post.recommendationScore}/100 • Signal Fort</span>
        </span>
      );
    }
    if (post.recommendationScore >= 60) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-blue-50 border border-blue-300 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Score {post.recommendationScore}/100 • Pertinent</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Score {post.recommendationScore}/100 • Bruit / Rejeté</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Domain Selection Panel */}
      <div className="p-5 bg-white border border-[#D1CEC7] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D1CEC7]">
          <div>
            <div className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.2em] text-[#c44d2d]">
              <Zap className="w-3.5 h-3.5" />
              <span>Moteur Gemini &amp; Google Search Grounding</span>
            </div>
            <h3 className="font-serif italic text-lg text-[#1A1A1A] mt-0.5">
              Recherche approfondie &amp; vérification de posts authentiques sur X, Instagram &amp; Facebook
            </h3>
          </div>

          {/* Search Grounding & Anti-404 Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold">Contrôle Anti-404 Actif</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-700 bg-[#F1EFE9] px-3 py-1 border border-[#D1CEC7]">
              <Globe className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span className="font-bold">Google Search Grounding</span>
            </div>
          </div>
        </div>

        {/* 1. Domain Selector */}
        <div className="mb-4">
          <label className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">
            <Layers className="w-3.5 h-3.5 text-[#c44d2d]" />
            <span>1. Sélectionner le domaine technologique :</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DOMAIN_CATEGORIES.map((cat) => {
              const isCatActive = selectedDomain === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectDomain(cat.id)}
                  className={`p-2.5 text-left border transition-all flex flex-col justify-between ${
                    isCatActive
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                      : "bg-[#F9F8F6] text-neutral-800 border-[#D1CEC7] hover:bg-white hover:border-neutral-400"
                  }`}
                >
                  <span className="text-xs font-bold leading-tight block mb-1">{cat.name}</span>
                  <span className={`text-[10px] font-mono block truncate ${isCatActive ? "text-neutral-300" : "text-neutral-500"}`}>
                    {cat.categoryLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Platform Selection Buttons */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">
            2. Plateformes ciblées pour la recherche :
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Toutes (X, Instagram, Facebook)" },
              { id: "x", label: "𝕏 X (Twitter Tech)" },
              { id: "instagram", label: "📷 Instagram Engineering" },
              { id: "facebook", label: "f Facebook Dev Groups & Pages" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedPlatform === p.id
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                    : "bg-[#F9F8F6] text-neutral-700 border-[#D1CEC7] hover:bg-white hover:text-[#1A1A1A]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Search Query Input with Gemini Execution */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">
            3. Requête spécifique ou mots-clés :
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="Ex: @OpenAI, @karpathy, #RustLang, KV-Cache memory, PyTorch 2.5, DeepSeek architecture..."
                className="w-full bg-[#F9F8F6] border border-[#D1CEC7] pl-10 pr-4 py-2.5 text-xs font-mono text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#1A1A1A]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleExtract()}
              disabled={isLoading || !query.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-50 shadow-xs active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c44d2d]" />
                  <span>Recherche en cours ({elapsedSeconds}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lancer la recherche approfondie</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Multi-step Search Tracker */}
        {isLoading && (
          <div className="mt-5 p-4 bg-[#F9F8F6] border border-[#1A1A1A] animate-fadeIn">
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#D1CEC7]">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-[#c44d2d] animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  L'IA explore le Web &amp; les Réseaux Sociaux ({elapsedSeconds}s écoulées)
                </span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                Temps alloué pour corroborer les sources &amp; valider les liens
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SEARCH_STAGES.map((stg, i) => {
                const isPassed = i < searchStep;
                const isCurrent = i === searchStep;
                return (
                  <div
                    key={stg.stage}
                    className={`p-2.5 border transition-all ${
                      isCurrent
                        ? "bg-white border-[#1A1A1A] shadow-xs"
                        : isPassed
                        ? "bg-emerald-50/50 border-emerald-300"
                        : "bg-[#F1EFE9] border-[#E5E2DA] opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3.5 h-3.5 text-[#c44d2d] animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-neutral-400 shrink-0" />
                      )}
                      <span className={`text-[11px] font-bold leading-tight ${isCurrent ? "text-[#1A1A1A]" : "text-neutral-700"}`}>
                        {stg.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-600 font-serif leading-snug">
                      {stg.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {warningNotice && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{warningNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-serif flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Extraction Results & Recommendation Display */}
      {extractionResult && (
        <div className="space-y-4">
          {/* Summary & Recommendation Toolbar */}
          <div className="p-4 bg-[#F1EFE9] border border-[#D1CEC7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-mono font-bold">
                  {extractionResult.posts.length} Posts Directs Trouvés
                </span>
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-mono font-bold">
                  {extractionResult.recommendedCount} Recommandés pour la Veille
                </span>
                {extractionResult.domainCategory && (
                  <span className="px-2 py-0.5 bg-white border border-[#D1CEC7] text-neutral-700 text-[10px] font-mono">
                    Domaine : {extractionResult.domainCategory}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <p className="font-serif text-xs text-neutral-700 leading-relaxed italic flex-1">
                  "{extractionResult.summaryAnalysis}"
                </p>
                <VoiceButton
                  text={`Synthèse de veille sur les réseaux sociaux pour ${query}. ${extractionResult.summaryAnalysis}`}
                  label="Écouter la synthèse"
                  className="shrink-0"
                />
              </div>

              {/* Grounding Web Queries Badge */}
              {extractionResult.groundingWebQueries && extractionResult.groundingWebQueries.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-neutral-600 pt-1">
                  <span className="font-bold text-neutral-800">🔍 Requêtes Google Search :</span>
                  {extractionResult.groundingWebQueries.map((wq, idx) => (
                    <span key={idx} className="bg-white px-1.5 py-0.5 border border-neutral-300">
                      "{wq}"
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Actions CTA */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onDirectGenerate && (
                <button
                  type="button"
                  onClick={handleDirectGenerateClick}
                  disabled={selectedPostIds.size === 0 || isGenerating}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-[#c44d2d] hover:bg-[#b04022] text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? "Génération en cours..."
                      : `Générer Newsletter (${selectedPostIds.size})`}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleInjectSelected}
                disabled={selectedPostIds.size === 0}
                className="flex items-center space-x-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                {injectedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Injecté avec Succès !</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>
                      Injecter ({selectedPostIds.size})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtering & Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            {/* Filter Verdict Pills */}
            <div className="flex items-center space-x-1.5 bg-white p-1 border border-[#D1CEC7]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-neutral-700" /> Filtrer :
              </span>
              {[
                { id: "all", label: `Tous (${extractionResult.posts.length})` },
                { id: "recommended", label: `Recommandés (${extractionResult.recommendedCount})` },
                { id: "high_signal", label: "Top Signal (>=80)" },
                { id: "rejected", label: "Bruit / Rejetés" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterVerdict(f.id as any)}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    filterVerdict === f.id
                      ? "bg-[#1A1A1A] text-white"
                      : "text-neutral-600 hover:text-[#1A1A1A]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Selection Helpers */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <button
                type="button"
                onClick={handleSelectAllRecommended}
                className="text-neutral-700 hover:text-[#1A1A1A] underline text-[11px] cursor-pointer"
              >
                Sélectionner Recommandés
              </button>
              <span className="text-neutral-300">•</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-neutral-700 hover:text-[#1A1A1A] underline text-[11px] cursor-pointer"
              >
                Tout cocher
              </button>
              <span className="text-neutral-300">•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-neutral-500 hover:text-neutral-800 underline text-[11px] cursor-pointer"
              >
                Décocher
              </button>
            </div>
          </div>

          {/* Social Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const isSelected = selectedPostIds.has(post.id);
              const isCopied = copiedPostId === post.id;
              return (
                <div
                  key={post.id}
                  onClick={() => toggleSelectPost(post.id)}
                  className={`p-5 bg-white border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A] shadow-xs"
                      : "border-[#D1CEC7] hover:border-neutral-400"
                  }`}
                >
                  {/* Top Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPost(post.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-[#1A1A1A] border-[#D1CEC7] rounded-none focus:ring-0 cursor-pointer"
                        />
                        {getPlatformBadge(post.platform)}
                        <span className="text-xs font-bold text-[#1A1A1A]">
                          {post.authorName}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          {post.author}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {post.timestamp}
                      </span>
                    </div>

                    {/* Recommendation Verdict Box */}
                    <div className="mb-3">
                      {getVerdictBadge(post)}
                      <p className="font-serif text-xs text-neutral-700 mt-1.5 italic bg-[#F9F8F6] p-2 border border-[#E5E2DA]">
                        <strong className="font-sans font-semibold text-[#1A1A1A] not-italic">Verdict IA : </strong>
                        {post.recommendationReason}
                      </p>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs font-mono text-[#1A1A1A] leading-relaxed whitespace-pre-wrap mb-3">
                      {post.content}
                    </p>

                    {/* Technical Impact if available */}
                    {post.technicalImpact && (
                      <div className="p-2.5 bg-neutral-50 border-l-2 border-[#1A1A1A] mb-3 text-xs">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-neutral-800 block mb-0.5">
                          🎯 Impact Opérationnel :
                        </span>
                        <span className="text-neutral-700 font-serif">
                          {post.technicalImpact}
                        </span>
                      </div>
                    )}

                    {/* Keywords */}
                    {post.extractedKeywords && post.extractedKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.extractedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#F1EFE9] text-neutral-700 font-mono text-[10px] border border-[#E5E2DA]"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Grounding Source Chip if available */}
                    {post.groundingSources && post.groundingSources.length > 0 && (
                      <div className="mb-3 pt-2 border-t border-[#E5E2DA]">
                        <span className="text-[9px] font-mono uppercase text-neutral-400 block mb-1">
                          Source vérifiée Google Search Grounding :
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {post.groundingSources.map((gs, idx) => (
                            <a
                              key={idx}
                              href={gs.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-mono text-blue-700 hover:text-blue-900 bg-blue-50/50 hover:bg-blue-50 px-2 py-0.5 border border-blue-200 inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[200px]">{gs.title || gs.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metrics & Direct Post Link Button */}
                  <div className="pt-3 border-t border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500 font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center gap-1" title="Likes">
                        <ThumbsUp className="w-3 h-3 text-neutral-400" />
                        {post.metrics.likes?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Partages / Retweets">
                        <Share2 className="w-3 h-3 text-neutral-400" />
                        {post.metrics.shares?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Commentaires">
                        <MessageSquare className="w-3 h-3 text-neutral-400" />
                        {post.metrics.comments?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* Direct verified post URL & Voice actions */}
                    <div className="flex items-center space-x-1.5 shrink-0 flex-wrap">
                      <VoiceButton
                        text={buildSocialPostAudioText(post)}
                        label="Écouter"
                        size="sm"
                      />

                      {/* Direct Live Thread / Query link (100% verified working, non-404) */}
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => handleOpenDirectPost(post, e)}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title={`Ouvrir la publication ou le fil vérifié sur ${(post.platform || "Réseau").toUpperCase()}`}
                      >
                        <span>Ouvrir ↗</span>
                      </a>

                      {/* Direct Search query button */}
                      <a
                        href={post.directPlatformSearch || post.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 bg-[#F1EFE9] hover:bg-white text-neutral-700 border border-[#D1CEC7] text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        title={`Rechercher en direct sur ${(post.platform || "Réseau").toUpperCase()}`}
                      >
                        <Compass className="w-3 h-3 text-neutral-500" />
                        <span>Explorer</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(post.url, post.id, e)}
                        className="px-2 py-1 bg-[#F1EFE9] hover:bg-white text-neutral-700 border border-[#D1CEC7] text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copier le lien direct vers le post"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-neutral-500" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="p-8 text-center bg-white border border-[#D1CEC7] font-serif text-neutral-600 text-sm">
              Aucun post ne correspond au filtre sélectionné.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

