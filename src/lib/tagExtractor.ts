import { NewsletterResult, Innovation } from "../types";

// Canonical tech dictionaries with regex rules for accurate extraction
const TECH_TAXONOMY: Array<{ tag: string; patterns: RegExp[]; category: "AI & ML" | "Architecture & Infra" | "Languages & Runtime" | "Sécurité & Crypto" | "Données & DB" }> = [
  // AI & ML
  { tag: "LLM", patterns: [/\bllms?\b/i, /\blarge language models?\b/i, /\bgpt/i, /\bclaude\b/i, /\bgemini\b/i, /\bdeepseek\b/i], category: "AI & ML" },
  { tag: "Inférence IA", patterns: [/\binf[ée]rence\b/i, /\bvllm\b/i, /\bflashattention\b/i, /\bkv-?cache\b/i, /\bspeculative decoding\b/i, /\bquantization\b/i, /\bfp8\b/i, /\bint4\b/i], category: "AI & ML" },
  { tag: "KV-Cache", patterns: [/\bkv-?cache\b/i, /\bpagedattention\b/i, /\bchunked prefill\b/i], category: "AI & ML" },
  { tag: "Transformers", patterns: [/\btransformers?\b/i, /\battention mechanism\b/i, /\bmoe\b/i, /\bmixture of experts\b/i], category: "AI & ML" },
  { tag: "Agents IA", patterns: [/\bagents?\s+ia\b/i, /\bai\s+agents?\b/i, /\bmulti-agent\b/i, /\bfunction calling\b/i], category: "AI & ML" },
  { tag: "PyTorch", patterns: [/\bpytorch\b/i, /\btorch\b/i, /\btensorflow\b/i, /\bjax\b/i], category: "AI & ML" },
  { tag: "GPU & CUDA", patterns: [/\bgpus?\b/i, /\bcuda\b/i, /\btriton\b/i, /\bh100\b/i, /\bb200\b/i, /\bblackwell\b/i, /\btpu\b/i, /\bnpu\b/i], category: "AI & ML" },

  // Languages & Runtime
  { tag: "Rust", patterns: [/\brust\b/i, /\bcargo\b/i, /\btokio\b/i, /\bpolonius\b/i, /\brustc\b/i], category: "Languages & Runtime" },
  { tag: "WebAssembly", patterns: [/\bwebassembly\b/i, /\bwasm\b/i, /\bwasi\b/i], category: "Languages & Runtime" },
  { tag: "Compilateurs & JIT", patterns: [/\bcompilat(eur|ion)\b/i, /\bjit\b/i, /\bllvm\b/i, /\bgc\b/i, /\bgarbage collect/i, /\bv8\b/i], category: "Languages & Runtime" },
  { tag: "TypeScript", patterns: [/\btypescript\b/i, /\bts\b/i, /\bjavascript\b/i, /\bnode\.?js\b/i, /\bbun\b/i, /\bdeno\b/i], category: "Languages & Runtime" },
  { tag: "Go", patterns: [/\bgolang\b/i, /\bgo\s+1\.\d+\b/i, /\bgoroutine/i], category: "Languages & Runtime" },
  { tag: "React 19", patterns: [/\breact\s*(19|compiler|forget)\b/i, /\bserver components\b/i, /\brsc\b/i, /\bhydration\b/i], category: "Languages & Runtime" },

  // Architecture & Infra
  { tag: "Systèmes Distribués", patterns: [/\bdistribu[ée]s?\b/i, /\bconsensus\b/i, /\braft\b/i, /\bpaxos\b/i, /\breplication\b/i, /\bhigh availability\b/i], category: "Architecture & Infra" },
  { tag: "Kubernetes & K8s", patterns: [/\bkubernetes\b/i, /\bk8s\b/i, /\bhelm\b/i, /\bcontainerd\b/i, /\bpod\b/i], category: "Architecture & Infra" },
  { tag: "eBPF & Kernel", patterns: [/\bebpf\b/i, /\blinux\s+kernel\b/i, /\bxsk\b/i, /\bbpf\b/i, /\bcilium\b/i], category: "Architecture & Infra" },
  { tag: "Cloud Native", patterns: [/\bcloud native\b/i, /\bserverless\b/i, /\bmesh\b/i, /\benvoy\b/i, /\bgateway api\b/i], category: "Architecture & Infra" },
  { tag: "Latence & Débit", patterns: [/\blatenc(e|y)\b/i, /\bthroughput\b/i, /\bd[ée]bit\b/i, /\bp99\b/i, /\bttft\b/i, /\bjitter\b/i], category: "Architecture & Infra" },
  { tag: "Microservices", patterns: [/\bmicroservices?\b/i, /\bgrpc\b/i, /\bprotobuf\b/i, /\bkafka\b/i, /\brabbitmq\b/i], category: "Architecture & Infra" },

  // Sécurité & Crypto
  { tag: "Crypto Post-Quantique", patterns: [/\bpost-?quant(um|ique)\b/i, /\bpqc\b/i, /\bml-kem\b/i, /\bfips\s+203\b/i, /\bkyber\b/i, /\bdilithium\b/i], category: "Sécurité & Crypto" },
  { tag: "Sécurité & Zero Trust", patterns: [/\bzero trust\b/i, /\bauthentification\b/i, /\boauth\b/i, /\bmfa\b/i, /\biam\b/i], category: "Sécurité & Crypto" },
  { tag: "TLS 1.3 & Chiffrement", patterns: [/\btls\s*1\.3\b/i, /\bchiffrement\b/i, /\bencryption\b/i, /\bcrypto\b/i, /\baes-gcm\b/i], category: "Sécurité & Crypto" },
  { tag: "Vulnérabilités & CVE", patterns: [/\bcve-\d{4}-\d+\b/i, /\bvuln[ée]rabilit[ée]\b/i, /\bexploit\b/i, /\bside-?channel\b/i, /\bspeculative\b/i], category: "Sécurité & Crypto" },

  // Données & DB
  { tag: "Bases Vectorielles", patterns: [/\bvector\s*(db|database|index)\b/i, /\bpgvector\b/i, /\bqdrant\b/i, /\bmilvus\b/i, /\brag\b/i], category: "Données & DB" },
  { tag: "PostgreSQL & SQL", patterns: [/\bpostgres(ql)?\b/i, /\bsql\b/i, /\bduckdb\b/i, /\bsnowflake\b/i, /\bolap\b/i, /\boltp\b/i], category: "Données & DB" },
  { tag: "Streaming & Pipelines", patterns: [/\bstreaming\b/i, /\bflink\b/i, /\bspark\b/i, /\bdata lake\b/i, /\biceberg\b/i], category: "Données & DB" },
];

/**
 * Automatically extracts canonical technology tags and topics from a newsletter's content
 */
export function extractTagsFromNewsletter(newsletter: Partial<NewsletterResult>): string[] {
  if (!newsletter) return ["Veille Tech"];

  const textToAnalyze = [
    newsletter.subject || "",
    newsletter.editorialIntro || "",
    newsletter.takeaway || "",
    ...(newsletter.innovations || []).map((inv: Innovation) => 
      `${inv.category || ""} ${inv.title || ""} ${inv.summary || ""} ${inv.impact || ""} ${inv.keyMetricOrFact || ""}`
    ),
  ].join(" ");

  const detectedTags = new Set<string>();

  for (const item of TECH_TAXONOMY) {
    for (const pattern of item.patterns) {
      if (pattern.test(textToAnalyze)) {
        detectedTags.add(item.tag);
        break; // matched this tag, move to next
      }
    }
  }

  // Also include custom category tags from innovations if clean
  if (newsletter.innovations) {
    newsletter.innovations.forEach((inv) => {
      if (inv.category && inv.category.length > 2 && inv.category.length < 25) {
        const cleanCat = inv.category.trim().replace(/^[\d\.\-\s]+/, "");
        if (cleanCat && !["INNOVATION", "TECHNIQUE", "GENERAL"].includes(cleanCat.toUpperCase())) {
          // Format capitalized nicely
          const formatted = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).toLowerCase();
          if (detectedTags.size < 8) {
            detectedTags.add(formatted);
          }
        }
      }
    });
  }

  // Default fallback if no tag matched
  if (detectedTags.size === 0) {
    detectedTags.add("Architecture");
    detectedTags.add("Veille R&D");
  }

  return Array.from(detectedTags).slice(0, 8);
}

/**
 * Ensures all newsletters in an array have populated tags
 */
export function ensureNewsletterTags(newsletters: NewsletterResult[]): NewsletterResult[] {
  return newsletters.map((n) => {
    if (n.tags && n.tags.length > 0) {
      return n;
    }
    return {
      ...n,
      tags: extractTagsFromNewsletter(n),
    };
  });
}
