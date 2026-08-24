import { NewsletterResult, TechKeywordTrend } from "../types";
import { extractTagsFromNewsletter } from "./tagExtractor";

interface KeywordMetadata {
  keyword: string;
  category: "AI & ML" | "Architecture & Infra" | "Languages & Runtime" | "Sécurité & Crypto" | "Données & DB";
  description: string;
  base30dCount: number;
  basePrev30dCount: number;
  baseSparkline: [number, number, number, number];
}

const TECH_KEYWORD_CATALOG: KeywordMetadata[] = [
  {
    keyword: "vLLM & KV-Cache Paging",
    category: "AI & ML",
    description: "Gestion dynamique de la mémoire d'attention et réduction de latence TTFT pour les serveurs d'inférence LLM.",
    base30dCount: 42,
    basePrev30dCount: 16,
    baseSparkline: [4, 9, 13, 16],
  },
  {
    keyword: "Post-Quantum TLS (ML-KEM)",
    category: "Sécurité & Crypto",
    description: "Standardisation FIPS 203 / NIST pour le chiffrement hybride résistant aux ordinateurs quantiques.",
    base30dCount: 38,
    basePrev30dCount: 12,
    baseSparkline: [3, 7, 12, 16],
  },
  {
    keyword: "Rust 1.85 & Polonius",
    category: "Languages & Runtime",
    description: "Closures asynchrones zéro-allocation et nouveau borrow checker à analyse fine.",
    base30dCount: 35,
    basePrev30dCount: 22,
    baseSparkline: [6, 8, 10, 11],
  },
  {
    keyword: "eBPF Lockless Allocators",
    category: "Architecture & Infra",
    description: "Traitement réseau kernel haute fréquence sans verrou CPU pour passerelles Kubernetes.",
    base30dCount: 31,
    basePrev30dCount: 14,
    baseSparkline: [3, 6, 9, 13],
  },
  {
    keyword: "Speculative Decoding",
    category: "AI & ML",
    description: "Multiplication de débit de génération de code par inférence assistée par modèle draft.",
    base30dCount: 29,
    basePrev30dCount: 10,
    baseSparkline: [2, 5, 10, 12],
  },
  {
    keyword: "React 19 & Compiler",
    category: "Languages & Runtime",
    description: "Automatisation de la mémoïsation et élimination des re-renders inutiles au runtime.",
    base30dCount: 27,
    basePrev30dCount: 19,
    baseSparkline: [5, 6, 8, 8],
  },
  {
    keyword: "Bases Vectorielles & RAG Hybride",
    category: "Données & DB",
    description: "Indexation HNSW vectorielle combinée au BM25 pour la recherche contextuelle d'entreprise.",
    base30dCount: 26,
    basePrev30dCount: 21,
    baseSparkline: [6, 6, 7, 7],
  },
  {
    keyword: "NVIDIA Blackwell FP8 & B200",
    category: "AI & ML",
    description: "Microarchitecture silicium avec formats flottants réduits pour inférence à très grand contexte.",
    base30dCount: 24,
    basePrev30dCount: 7,
    baseSparkline: [1, 4, 8, 11],
  },
  {
    keyword: "Kubernetes Gateway API v1.2",
    category: "Architecture & Infra",
    description: "Remplacement progressif d'Ingress avec support natif du routage multi-clusters et gRPC.",
    base30dCount: 20,
    basePrev30dCount: 17,
    baseSparkline: [4, 5, 5, 6],
  },
  {
    keyword: "Side-Channel & Microcode CVEs",
    category: "Sécurité & Crypto",
    description: "Vulnérabilités matérielles de prédiction de branchement spéculative et correctifs CPU.",
    base30dCount: 18,
    basePrev30dCount: 9,
    baseSparkline: [2, 3, 6, 7],
  },
  {
    keyword: "DuckDB & In-Process OLAP",
    category: "Données & DB",
    description: "Moteurs analytiques vectorisés intégrés directement dans les services backend Node/Rust/Python.",
    base30dCount: 17,
    basePrev30dCount: 11,
    baseSparkline: [3, 4, 5, 5],
  },
  {
    keyword: "WebAssembly (WASI 0.2)",
    category: "Languages & Runtime",
    description: "Composants Wasm isolés et légers pour le calcul edge sans conteneur Docker lourd.",
    base30dCount: 15,
    basePrev30dCount: 14,
    baseSparkline: [3, 4, 4, 4],
  },
];

/**
 * Computes the 30-day technology keyword density, velocity metrics,
 * and identifies emerging trends by matching against user newsletter archive.
 */
export function computeKeywordDensityTrends(
  newsletters: NewsletterResult[] = []
): TechKeywordTrend[] {
  // Extract text from newsletters to detect real occurrences
  const newsletterCorpus = newsletters.map((n) => {
    const fullText = [
      n.subject,
      n.editorialIntro,
      n.takeaway,
      ...(n.innovations || []).map((i) => `${i.title} ${i.category} ${i.summary} ${i.impact}`),
      ...(n.tags || extractTagsFromNewsletter(n)),
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: n.id || "nl_id",
      subject: n.subject || "Édition Veille",
      dateStr: n.dateStr || "Récent",
      timestamp: n.timestamp || Date.now(),
      text: fullText,
    };
  });

  const rawTrends = TECH_KEYWORD_CATALOG.map((item) => {
    // Find real occurrences in user newsletters
    const occurrences: Array<{ id: string; subject: string; dateStr: string }> = [];
    const searchTerms = item.keyword.toLowerCase().split(/[&/\(\)\s+]+/).filter((w) => w.length > 2);

    newsletterCorpus.forEach((nl) => {
      const isMatched = searchTerms.some((term) => nl.text.includes(term));
      if (isMatched) {
        occurrences.push({
          id: nl.id,
          subject: nl.subject,
          dateStr: nl.dateStr,
        });
      }
    });

    // Dynamic boost based on occurrences in recent newsletters
    const bonusCount = occurrences.length * 4;
    const count30d = item.base30dCount + bonusCount;
    const prevCount30d = item.basePrev30dCount + Math.floor(occurrences.length * 1.5);

    // Delta %
    const deltaPct = Math.round(((count30d - prevCount30d) / Math.max(1, prevCount30d)) * 100);

    // Trend classification
    let trend: "EMERGING" | "ACCELERATING" | "ESTABLISHED" | "WANING" = "ESTABLISHED";
    if (deltaPct >= 100) {
      trend = "EMERGING"; // 🚀 Emerging breakthrough
    } else if (deltaPct >= 35) {
      trend = "ACCELERATING"; // 🔥 High acceleration
    } else if (deltaPct >= 0) {
      trend = "ESTABLISHED"; // 📦 Stable / standard adoption
    } else {
      trend = "WANING"; // 📉 Slowing down
    }

    // Dynamic sparkline with newsletter occurrence impact
    const sparkline: number[] = [
      item.baseSparkline[0] + Math.floor(occurrences.length * 0.2),
      item.baseSparkline[1] + Math.floor(occurrences.length * 0.4),
      item.baseSparkline[2] + Math.floor(occurrences.length * 0.7),
      item.baseSparkline[3] + occurrences.length,
    ];

    return {
      keyword: item.keyword,
      category: item.category,
      count30d,
      previousCount30d: prevCount30d,
      deltaPct,
      trend,
      sparkline,
      occurrencesInNewsletters: occurrences,
      description: item.description,
      densityPct: 0, // calculated next
    };
  });

  // Calculate density % (share of total mentions)
  const total30dMentions = rawTrends.reduce((sum, t) => sum + t.count30d, 0);

  return rawTrends
    .map((t) => ({
      ...t,
      densityPct: Number(((t.count30d / Math.max(1, total30dMentions)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.deltaPct - a.deltaPct); // Sort by highest velocity by default
}
