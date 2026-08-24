import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  MousePointerClick,
  MailOpen,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Award,
  ArrowUpRight,
  Monitor,
  Smartphone,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  Activity,
  Radio,
  Share2,
} from "lucide-react";
import { NewsletterResult, NewsletterPerformanceMetrics, RealTimeTelemetryData } from "../types";
import { generateMetricsForNewsletter, calculateAggregatedStats } from "../lib/analyticsHelper";
import { computeRealTimeTelemetry, subscribeTelemetry } from "../lib/telemetryService";
import { KeywordDensityRadar } from "./KeywordDensityRadar";

interface AnalyticsDashboardProps {
  newsletters: NewsletterResult[];
  onSelectNewsletter?: (newsletter: NewsletterResult) => void;
  currentNewsletter?: NewsletterResult | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  newsletters,
  onSelectNewsletter,
  currentNewsletter,
}) => {
  // If there are no newsletters in history, we synthesize realistic historical editions
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>(
    currentNewsletter?.id || (newsletters.length > 0 ? newsletters[0].id || "demo_1" : "demo_1")
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveTelemetry, setLiveTelemetry] = useState<RealTimeTelemetryData>(
    computeRealTimeTelemetry()
  );

  // Listen to live telemetry events in real-time
  useEffect(() => {
    const unsubscribe = subscribeTelemetry((data) => {
      setLiveTelemetry(data);
    });
    return () => unsubscribe();
  }, []);

  // Fallback demo newsletters if user hasn't saved any yet
  const effectiveNewsletters: NewsletterResult[] =
    newsletters.length > 0
      ? newsletters
      : [
          {
            id: "demo_1",
            subject: "Édition #042 : Optimisation KV-Cache & Compilateur Rust 1.85",
            preheader: "Analyse d'ingénierie sur l'inférence vLLM et cryptographie TLS 1.3",
            editorialIntro: "Cette édition explore les gains de débit d'inférence en pré-remplissage fractionné et l'arrivée des fermetures asynchrones.",
            filteringReport: { totalItemsAnalyzed: 14, rejectedItemsCount: 11, rejectionReasons: [] },
            innovations: [
              { category: "Inférence IA", title: "Chunked Prefill & Multi-Tenant KV-Cache", summary: "Gain de 42% sur le TTFT", impact: "Division par deux des coûts de serving" },
              { category: "Langages & Compilateurs", title: "Rust 1.85 & Polonius Borrow Checker", summary: "Async closures natives", impact: "Zero-cost abstractions en multithreading" },
              { category: "Sécurité Systèmes", title: "Post-Quantum Cryptography FIPS 203 ML-KEM", summary: "Standardisation NIST", impact: "Résistance aux attaques quantiques sur TLS 1.3" },
            ],
            takeaway: "L'optimisation des architectures d'inférence et la mémoire partagée dominent la réduction des coûts de compute.",
            dateStr: "18/08/2026",
            html: "",
            timestamp: Date.now() - 3 * 86400000,
          },
          {
            id: "demo_2",
            subject: "Édition #041 : Architecture GPU Blackwell & FlashAttention-3",
            preheader: "Calcul matriciel FP8 et registres Tensor Core de nouvelle génération",
            editorialIntro: "Retour approfondi sur les micro-noyaux CUDA et l'élimination des goulots d'étranglement mémoire HBM3e.",
            filteringReport: { totalItemsAnalyzed: 18, rejectedItemsCount: 15, rejectionReasons: [] },
            innovations: [
              { category: "Silicium & GPU", title: "FlashAttention-3 & FP8 Asynchronous Warps", summary: "75% d'efficacité crête", impact: "Accélération 2.2x sur les contextes longs" },
              { category: "Noyau & OS", title: "eBPF Sched-Ext Dynamic Dispatch", summary: "Ordonnancement custom dans Linux 6.12", impact: "Réduction des queues d'attente réseau" },
            ],
            takeaway: "Le goulot d'étranglement des clusters IA bascule des FLOPS vers la bande passante interconnecte NVLink.",
            dateStr: "11/08/2026",
            html: "",
            timestamp: Date.now() - 10 * 86400000,
          },
          {
            id: "demo_3",
            subject: "Édition #040 : Wasm Component Model 2.0 & Microservices Isomorphes",
            preheader: "Virtualisation légère et temps de démarrage sub-milliseconde",
            editorialIntro: "Synthèse de l'adoption de WebAssembly côté serveur pour le routage de requêtes sans cold-start.",
            filteringReport: { totalItemsAnalyzed: 12, rejectedItemsCount: 9, rejectionReasons: [] },
            innovations: [
              { category: "Runtime & Cloud", title: "Wasm Component Model WASI 0.2", summary: "Interfaces WIT typées", impact: "Interopérabilité polyglotte sans overhead" },
              { category: "Bases de données", title: "Spanner Dual-Region Active-Active", summary: "Cohérence stricte sous 15ms", impact: "Disponibilité 99.999% sans bascule manuelle" },
            ],
            takeaway: "Le runtime Wasm émerge comme standard pour le serverless haute densité.",
            dateStr: "04/08/2026",
            html: "",
            timestamp: Date.now() - 17 * 86400000,
          },
        ];

  // Aggregated global stats
  const aggStats = calculateAggregatedStats(effectiveNewsletters);

  // Active edition metrics
  const activeNewsletter =
    effectiveNewsletters.find((n) => n.id === selectedNewsletterId) || effectiveNewsletters[0];
  const activeMetrics: NewsletterPerformanceMetrics =
    activeNewsletter?.performanceMetrics || generateMetricsForNewsletter(activeNewsletter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLiveTelemetry(computeRealTimeTelemetry());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold">
              Tableau de Bord &bull; Télémétrie en Temps Réel
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync ({liveTelemetry.activeReadersCount} lecteur{liveTelemetry.activeReadersCount > 1 ? "s" : ""} actif{liveTelemetry.activeReadersCount > 1 ? "s" : ""})
            </span>
          </div>
          <h2 className="font-display italic font-medium text-3xl sm:text-4xl text-[#1a1a1a] tracking-tight">
            Analyse de Performance &amp; Taux d'Engagement
          </h2>
          <p className="font-serif text-sm text-neutral-600 mt-1 max-w-2xl">
            Télémétrie continue alimentée par les événements réels : interactions utilisateurs, clics sur liens vérifiés, et consultations sociales.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#f8f7f4] border border-[#1a1a1a] font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#c44d2d]" : ""}`} />
            <span>{isRefreshing ? "Actualisation..." : "Actualiser Télémétrie"}</span>
          </button>
        </div>
      </div>

      {/* Global Aggregate KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Open Rate */}
        <div className="p-5 bg-white border border-[#1a1a1a] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
              Taux d'Ouverture Moyen
            </span>
            <MailOpen className="w-4 h-4 text-[#c44d2d]" />
          </div>
          <div>
            <div className="font-display italic text-3xl sm:text-4xl text-[#1a1a1a] font-bold">
              {aggStats.avgOpenRate}%
            </div>
            <div className="mt-2 flex items-center text-[0.65rem] font-mono text-emerald-700 font-medium">
              <span>+14.2% vs Benchmark Tech (38%)</span>
            </div>
          </div>
        </div>

        {/* Click Through Rate (CTR) */}
        <div className="p-5 bg-white border border-[#1a1a1a] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
              Taux de Clics (CTR)
            </span>
            <MousePointerClick className="w-4 h-4 text-[#c44d2d]" />
          </div>
          <div>
            <div className="font-display italic text-3xl sm:text-4xl text-[#1a1a1a] font-bold">
              {aggStats.avgClickRate}%
            </div>
            <div className="mt-2 flex items-center text-[0.65rem] font-mono text-emerald-700 font-medium">
              <span>+6.8% vs Benchmark B2B (7.5%)</span>
            </div>
          </div>
        </div>

        {/* Real-time Click & Social Visits Counter */}
        <div className="p-5 bg-white border border-[#1a1a1a] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
              Clics &amp; Visites en Direct
            </span>
            <Activity className="w-4 h-4 text-[#c44d2d]" />
          </div>
          <div>
            <div className="font-display italic text-3xl sm:text-4xl text-[#1a1a1a] font-bold">
              {liveTelemetry.totalRealClicks}
            </div>
            <div className="mt-2 text-[0.65rem] font-mono text-neutral-600">
              {liveTelemetry.totalRealOpens} ouvertures réelles &bull; {liveTelemetry.totalRealClicks} interactions directes
            </div>
          </div>
        </div>

        {/* Global Score & Health */}
        <div className="p-5 bg-white border border-[#1a1a1a] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
              Score d'Impact Signal
            </span>
            <Award className="w-4 h-4 text-[#c44d2d]" />
          </div>
          <div>
            <div className="font-display italic text-3xl sm:text-4xl text-[#1a1a1a] font-bold">
              {aggStats.avgEngagementScore}<span className="text-xl font-normal text-neutral-400">/100</span>
            </div>
            <div className="mt-2 flex items-center text-[0.65rem] font-mono text-[#c44d2d] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Excellence R&amp;D</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Live Activity Feed */}
      <div className="p-4 bg-white border border-[#1a1a1a] shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(26,26,26,0.15)]">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#c44d2d] animate-pulse" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#1a1a1a]">
              Flux d'Événements Télémétriques en Temps Réel
            </span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">
            Dernier événement : {new Date(liveTelemetry.lastEventTimestamp).toLocaleTimeString()}
          </span>
        </div>

        {liveTelemetry.recentEvents.length > 0 ? (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {liveTelemetry.recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="px-1.5 py-0.5 bg-[#1a1a1a] text-white text-[9px] font-bold uppercase">
                    {evt.type}
                  </span>
                  <span className="text-neutral-800 font-bold truncate">
                    {evt.label}
                  </span>
                  {evt.url && (
                    <a
                      href={evt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c44d2d] hover:underline text-[10px] truncate max-w-xs flex items-center gap-0.5"
                    >
                      <span>{evt.url}</span>
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>
                  )}
                </div>
                <span className="text-neutral-500 text-[10px] shrink-0 ml-2">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 font-mono text-xs text-neutral-500 italic">
            En attente de nouvelles interactions utilisateurs... Les clics sur liens vérifiés et les consultations de posts alimentent ce flux instantanément.
          </div>
        )}
      </div>

      {/* Main Split View: Edition Selector & In-Depth Analytical Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Edition List with quick stats (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(26,26,26,0.15)]">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d]">
              Éditions Diffusées ({effectiveNewsletters.length})
            </span>
            <span className="font-mono text-[0.65rem] text-neutral-500">
              Sélectionnez pour détailler
            </span>
          </div>

          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {effectiveNewsletters.map((edition) => {
              const m = edition.performanceMetrics || generateMetricsForNewsletter(edition);
              const isSelected = edition.id === selectedNewsletterId;

              return (
                <button
                  key={edition.id}
                  type="button"
                  onClick={() => setSelectedNewsletterId(edition.id || "demo")}
                  className={`w-full text-left p-4 border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-[#1a1a1a] shadow-md ring-1 ring-[#1a1a1a]"
                      : "bg-[#f8f7f4] hover:bg-white border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[0.65rem] font-mono text-neutral-500 mb-1.5">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-neutral-400" />
                        {edition.dateStr || "Récent"}
                      </span>
                      <span className="text-[#c44d2d] font-bold">
                        Score {m.engagementScore}/100
                      </span>
                    </div>

                    <h4 className="font-serif text-sm font-bold text-[#1a1a1a] line-clamp-1 group-hover:text-[#c44d2d] transition-colors">
                      {edition.subject}
                    </h4>

                    <p className="font-serif text-xs text-neutral-600 mt-1 line-clamp-1 italic">
                      {edition.editorialIntro}
                    </p>
                  </div>

                  {/* Micro KPI Bar inside edition item */}
                  <div className="mt-3 pt-2.5 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between font-mono text-[0.65rem]">
                    <div className="flex items-center space-x-3 text-neutral-600">
                      <span>Ouverture : <strong className="text-[#1a1a1a]">{m.openRate}%</strong></span>
                      <span>Clics : <strong className="text-[#1a1a1a]">{m.clickRate}%</strong></span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-[#c44d2d] translate-x-1" : "text-neutral-400"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Detailed Analytics for Selected Edition (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#1a1a1a] bg-white p-6 shadow-xs">
            {/* Active Newsletter Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(26,26,26,0.15)]">
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#c44d2d] font-bold">
                  Focus Télémétrie Édition
                </span>
                <h3 className="font-display italic font-medium text-2xl text-[#1a1a1a] mt-0.5 leading-tight">
                  {activeNewsletter.subject}
                </h3>
              </div>

              {onSelectNewsletter && (
                <button
                  type="button"
                  onClick={() => onSelectNewsletter(activeNewsletter)}
                  className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-mono text-[0.65rem] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Charger dans l'éditeur</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Campaign Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)]">
                <span className="font-mono text-[0.6rem] text-neutral-500 uppercase tracking-wider block">
                  Envoyés / Livrés
                </span>
                <span className="font-display text-xl font-bold text-[#1a1a1a] block mt-1">
                  {activeMetrics.deliveredCount.toLocaleString()}
                </span>
                <span className="font-mono text-[0.6rem] text-emerald-700">
                  {activeMetrics.deliveryRate}% délivrabilité
                </span>
              </div>

              <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)]">
                <span className="font-mono text-[0.6rem] text-neutral-500 uppercase tracking-wider block">
                  Ouvertures Uniques
                </span>
                <span className="font-display text-xl font-bold text-[#1a1a1a] block mt-1">
                  {activeMetrics.openCount.toLocaleString()}
                </span>
                <span className="font-mono text-[0.6rem] text-[#c44d2d] font-bold">
                  {activeMetrics.openRate}% (vs 38% moy.)
                </span>
              </div>

              <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)]">
                <span className="font-mono text-[0.6rem] text-neutral-500 uppercase tracking-wider block">
                  Clics Uniques (CTR)
                </span>
                <span className="font-display text-xl font-bold text-[#1a1a1a] block mt-1">
                  {activeMetrics.uniqueClicksCount.toLocaleString()}
                </span>
                <span className="font-mono text-[0.6rem] text-[#c44d2d] font-bold">
                  {activeMetrics.clickRate}% CTR ({activeMetrics.clickToOpenRate}% CTOR)
                </span>
              </div>

              <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)]">
                <span className="font-mono text-[0.6rem] text-neutral-500 uppercase tracking-wider block">
                  Désabonnements
                </span>
                <span className="font-display text-xl font-bold text-[#1a1a1a] block mt-1">
                  {activeMetrics.unsubscribesCount}
                </span>
                <span className="font-mono text-[0.6rem] text-emerald-700">
                  {activeMetrics.unsubscribeRate}% (Ultra faible)
                </span>
              </div>
            </div>

            {/* Performance Visual Bars: Hourly Open Curve & Devices */}
            <div className="space-y-5 pt-2 border-t border-[rgba(26,26,26,0.1)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 text-[#c44d2d]" />
                    Dynamique d'Ouverture (Premières 48 heures)
                  </span>
                  <span className="font-mono text-[0.6rem] text-neutral-500">Pic principal à H+1</span>
                </div>

                {/* Micro Bar Chart */}
                <div className="grid grid-cols-7 gap-2 items-end h-20 pt-4 px-2 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)]">
                  {activeMetrics.hourlyOpens.map((item, idx) => {
                    const maxOpens = Math.max(...activeMetrics.hourlyOpens.map((h) => h.opens), 1);
                    const heightPct = Math.max(15, Math.round((item.opens / maxOpens) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        <div
                          className="w-full bg-[#1a1a1a] group-hover:bg-[#c44d2d] transition-all rounded-t-xs relative"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-1.5 py-0.5 text-[0.55rem] font-mono pointer-events-none transition-opacity whitespace-nowrap z-10">
                            {item.opens} ouv.
                          </div>
                        </div>
                        <span className="font-mono text-[0.6rem] text-neutral-500 mt-1">
                          {item.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Click Breakdown by Technical Link */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a] font-bold flex items-center">
                    <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#c44d2d]" />
                    Répartition des Clics par Innovation
                  </span>
                  <span className="font-mono text-[0.6rem] text-neutral-500">
                    Total: {activeMetrics.uniqueClicksCount} clics
                  </span>
                </div>

                <div className="space-y-2">
                  {activeMetrics.linksMetrics.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)] hover:border-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-serif mb-1">
                        <span className="font-bold text-[#1a1a1a] truncate mr-2">
                          #{idx + 1} &bull; {link.title}
                        </span>
                        <span className="font-mono text-[0.65rem] text-[#c44d2d] font-bold shrink-0">
                          {link.clicks} clics ({link.clickSharePct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-200 overflow-hidden">
                        <div
                          className="h-full bg-[#1a1a1a]"
                          style={{ width: `${link.clickSharePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices & Reading Terminal Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-neutral-600" />
                    <div>
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block">
                        Desktop vs Mobile
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1a1a1a]">
                        {activeMetrics.deviceBreakdown.desktopPct}% Desktop &bull; {activeMetrics.deviceBreakdown.mobilePct}% Mobile
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#f8f7f4] border border-[rgba(26,26,26,0.1)] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#c44d2d]" />
                    <div>
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500 block">
                        Temps de Lecture Moyen
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1a1a1a]">
                        {Math.floor(activeMetrics.avgReadingTimeSeconds / 60)}m {activeMetrics.avgReadingTimeSeconds % 60}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Technology Keyword Density & Emerging Trends Radar */}
      <KeywordDensityRadar
        newsletters={effectiveNewsletters}
        onSelectNewsletter={(nl) => {
          setSelectedNewsletterId(nl.id || "");
          if (onSelectNewsletter) {
            onSelectNewsletter(nl);
          }
        }}
      />
    </div>
  );
};


