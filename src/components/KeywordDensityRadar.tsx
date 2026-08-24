import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Flame,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { TechKeywordTrend, NewsletterResult } from "../types";
import { computeKeywordDensityTrends } from "../lib/keywordDensityService";

interface KeywordDensityRadarProps {
  newsletters: NewsletterResult[];
  onSelectNewsletter?: (newsletter: NewsletterResult) => void;
}

export const KeywordDensityRadar: React.FC<KeywordDensityRadarProps> = ({
  newsletters,
  onSelectNewsletter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"delta" | "density" | "volume">("delta");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  // Compute 30-day keyword trends dynamically from newsletters
  const trends: TechKeywordTrend[] = useMemo(() => {
    return computeKeywordDensityTrends(newsletters);
  }, [newsletters]);

  // Filter and sort trends
  const filteredTrends = useMemo(() => {
    return trends
      .filter((t) => {
        const matchesCategory =
          selectedCategory === "ALL" || t.category === selectedCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          t.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "delta") return b.deltaPct - a.deltaPct;
        if (sortBy === "density") return b.densityPct - a.densityPct;
        return b.count30d - a.count30d;
      });
  }, [trends, selectedCategory, sortBy, searchQuery]);

  // Macro Statistics
  const topEmerging = trends[0];
  const total30dVolume = trends.reduce((acc, t) => acc + t.count30d, 0);
  const emergingCount = trends.filter((t) => t.trend === "EMERGING").length;
  const acceleratingCount = trends.filter((t) => t.trend === "ACCELERATING").length;

  const categories = [
    { id: "ALL", label: "Toutes Catégories" },
    { id: "AI & ML", label: "🧠 IA & Inférence" },
    { id: "Languages & Runtime", label: "🦀 Langages & Compilateurs" },
    { id: "Architecture & Infra", label: "☁️ Infra & Systèmes" },
    { id: "Sécurité & Crypto", label: "🛡️ Sécurité & Crypto" },
    { id: "Données & DB", label: "💾 Données & DB" },
  ];

  const getTrendBadge = (trend: TechKeywordTrend["trend"], delta: number) => {
    switch (trend) {
      case "EMERGING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-300 text-purple-900 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Rocket className="w-3 h-3 text-purple-600 animate-bounce" />
            Émergence Forte (+{delta}%)
          </span>
        );
      case "ACCELERATING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-amber-600" />
            Accélération (+{delta}%)
          </span>
        );
      case "ESTABLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-300 text-blue-900 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Layers className="w-3 h-3 text-blue-600" />
            Établi / Stable (+{delta}%)
          </span>
        );
      case "WANING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-700 text-[10px] font-mono font-bold uppercase tracking-wider">
            Ralentissement ({delta}%)
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#1a1a1a] p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[rgba(26,26,26,0.15)]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold">
              Radar R&amp;D &bull; Fenêtre Glissante 30 Jours
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-mono font-bold">
              Delta 30d Actif
            </span>
          </div>
          <h3 className="font-display italic font-medium text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight">
            Densité des Mots-Clés &amp; Trajectoire des Tendances Émergentes
          </h3>
          <p className="font-serif text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl">
            Mesure algorithmique de la part de voix technologique et détection précoce des accélérations de signaux faibles sur vos thématiques de veille.
          </p>
        </div>

        {/* Quick KPI Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 bg-[#f8f7f4] border border-[rgba(26,26,26,0.15)] text-right">
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block">
              Volume 30j Détecté
            </span>
            <span className="font-mono text-base font-bold text-[#1a1a1a]">
              {total30dVolume} mentions
            </span>
          </div>
          <div className="px-3.5 py-2 bg-purple-50 border border-purple-200 text-right">
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-purple-700 block">
              Signaux de Rupture
            </span>
            <span className="font-mono text-base font-bold text-purple-900">
              {emergingCount + acceleratingCount} technologies
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Emerging Highlights Mini-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {trends.slice(0, 3).map((item, idx) => (
          <div
            key={item.keyword}
            className="p-3.5 bg-[#f8f7f4] border border-[rgba(26,26,26,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[0.65rem] font-mono mb-1.5">
                <span className="text-[#c44d2d] font-bold">
                  #{idx + 1} &bull; {item.category}
                </span>
                <span className="text-emerald-700 font-bold">
                  +{item.deltaPct}% vs M-1
                </span>
              </div>
              <h4 className="font-serif text-sm font-bold text-[#1a1a1a]">
                {item.keyword}
              </h4>
              <p className="font-serif text-xs text-neutral-600 mt-1 line-clamp-2 italic">
                {item.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between font-mono text-[0.65rem] text-neutral-500">
              <span>Densité : <strong className="text-[#1a1a1a]">{item.densityPct}%</strong></span>
              <span>{item.count30d} mentions 30j</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar: Search, Category Filter, and Sorting */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer un mot-clé ou un concept technique (ex: KV-Cache, Rust, eBPF)..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#f8f7f4] border border-[rgba(26,26,26,0.2)] text-xs font-mono text-[#1a1a1a] placeholder:text-neutral-400 focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-1.5 shrink-0 font-mono text-xs">
            <span className="text-neutral-500 text-[10px] uppercase tracking-wider mr-1">
              Trier par :
            </span>
            <button
              type="button"
              onClick={() => setSortBy("delta")}
              className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                sortBy === "delta"
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-[#f8f7f4] text-neutral-700 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a]"
              }`}
            >
              🚀 Vélocité (+Δ%)
            </button>
            <button
              type="button"
              onClick={() => setSortBy("density")}
              className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                sortBy === "density"
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-[#f8f7f4] text-neutral-700 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a]"
              }`}
            >
              📊 Densité (%)
            </button>
            <button
              type="button"
              onClick={() => setSortBy("volume")}
              className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                sortBy === "volume"
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-[#f8f7f4] text-neutral-700 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a]"
              }`}
            >
              🔥 Volume
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#c44d2d] text-white border-[#c44d2d] font-bold shadow-xs"
                    : "bg-white text-neutral-600 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Table / List */}
      <div className="border border-[rgba(26,26,26,0.15)] overflow-hidden">
        {filteredTrends.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-serif italic text-xs">
            Aucun mot-clé technique ne correspond aux critères de filtre.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(26,26,26,0.1)]">
            {filteredTrends.map((item) => {
              const isExpanded = expandedKeyword === item.keyword;

              return (
                <div
                  key={item.keyword}
                  className={`p-4 transition-colors ${
                    isExpanded ? "bg-[#fdfcfb]" : "bg-white hover:bg-[#faf9f6]"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Keyword + Category + Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-serif text-sm sm:text-base font-bold text-[#1a1a1a]">
                          {item.keyword}
                        </span>
                        <span className="px-2 py-0.5 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)] text-[10px] font-mono text-neutral-600">
                          {item.category}
                        </span>
                        {getTrendBadge(item.trend, item.deltaPct)}
                      </div>

                      <p className="font-serif text-xs text-neutral-600 max-w-2xl line-clamp-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Middle: 4-Week Sparkline Bars */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 block">
                          Courbe 4 Semaines
                        </span>
                        <div className="flex items-end gap-1 h-7 pt-1">
                          {item.sparkline.map((val, idx) => {
                            const maxVal = Math.max(...item.sparkline, 1);
                            const heightPct = Math.max(20, Math.round((val / maxVal) * 100));
                            return (
                              <div
                                key={idx}
                                title={`Semaine ${idx + 1}: ${val} mentions`}
                                className="w-2 bg-[#1a1a1a] hover:bg-[#c44d2d] transition-colors rounded-t-xs"
                                style={{ height: `${heightPct}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Density Progress Bar */}
                      <div className="w-32 sm:w-40">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-600 mb-1">
                          <span>Densité</span>
                          <strong className="text-[#1a1a1a]">{item.densityPct}%</strong>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 border border-[rgba(26,26,26,0.1)] overflow-hidden">
                          <div
                            className="h-full bg-[#c44d2d]"
                            style={{ width: `${Math.min(100, item.densityPct * 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Mentions Pill */}
                      <div className="px-2.5 py-1 bg-[#f8f7f4] border border-[rgba(26,26,26,0.15)] font-mono text-xs text-center min-w-[70px]">
                        <span className="block font-bold text-[#1a1a1a]">{item.count30d}</span>
                        <span className="text-[9px] text-neutral-500">mentions/30j</span>
                      </div>

                      {/* Expand Occurrences Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedKeyword(isExpanded ? null : item.keyword)
                        }
                        className="px-2 py-1 text-[11px] font-mono border border-[rgba(26,26,26,0.2)] hover:border-[#1a1a1a] text-neutral-700 hover:text-[#1a1a1a] transition-colors cursor-pointer shrink-0"
                      >
                        {isExpanded ? "Fermer" : `Détails (${item.occurrencesInNewsletters.length})`}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel: Occurrences in Archive */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[rgba(26,26,26,0.1)] space-y-2 bg-[#f8f7f4] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#c44d2d] font-bold">
                          Publications &amp; Éditions Couvertes
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {item.occurrencesInNewsletters.length} édition(s) dans vos archives
                        </span>
                      </div>

                      {item.occurrencesInNewsletters.length > 0 ? (
                        <div className="space-y-1.5">
                          {item.occurrencesInNewsletters.map((occ, oIdx) => {
                            const matchingNl = newsletters.find((n) => n.id === occ.id);

                            return (
                              <div
                                key={oIdx}
                                className="flex items-center justify-between p-2 bg-white border border-[rgba(26,26,26,0.1)] text-xs font-mono"
                              >
                                <div className="flex items-center space-x-2 truncate mr-2">
                                  <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                                  <span className="text-neutral-500 text-[10px] shrink-0">
                                    {occ.dateStr}
                                  </span>
                                  <span className="font-serif font-bold text-[#1a1a1a] truncate">
                                    {occ.subject}
                                  </span>
                                </div>

                                {matchingNl && onSelectNewsletter && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectNewsletter(matchingNl)}
                                    className="shrink-0 flex items-center space-x-1 px-2 py-0.5 bg-[#1a1a1a] hover:bg-[#c44d2d] text-white text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    <span>Consulter</span>
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] font-serif text-neutral-500 italic">
                          Ce mot-clé a été détecté dans les flux de veille technologique globaux (arXiv, GitHub releases, RFCs). Il apparaîtra ici dès qu'une newsletter générée intégrera ce sujet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
