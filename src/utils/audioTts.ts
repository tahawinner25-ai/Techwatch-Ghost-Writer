import { NewsletterResult, SocialPost } from "../types";

export interface AudioChapter {
  id: string;
  title: string;
  text: string;
  startTimeSec?: number;
  durationEstSec?: number;
}

export interface PodcastScript {
  title: string;
  totalDurationEstSec: number;
  fullText: string;
  chapters: AudioChapter[];
}

/**
 * Strips HTML tags, Markdown symbols, and Mermaid codes to create clean, natural spoken text
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~[\]()]/g, "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds an executive podcast script from a NewsletterResult
 */
export function buildPodcastScript(result: NewsletterResult): PodcastScript {
  const chapters: AudioChapter[] = [];

  // Chapter 0: Introduction & Overview
  const introClean = cleanTextForSpeech(result.editorialIntro || result.preheader || "");
  const introText = `Bonjour et bienvenue dans votre synthèse audio d'ingénierie et de veille stratégique. Nous analysons aujourd'hui : ${result.subject}. ${introClean}`;
  chapters.push({
    id: "chap_intro",
    title: "1. Introduction & Contexte",
    text: introText,
    durationEstSec: Math.ceil(introText.split(" ").length / 2.5),
  });

  // Chapters for each retained innovation
  result.innovations.forEach((item, idx) => {
    const summaryClean = cleanTextForSpeech(item.summary);
    const impactClean = cleanTextForSpeech(item.impact);
    const metricText = item.keyMetricOrFact
      ? `Fait clé quantifié : ${cleanTextForSpeech(item.keyMetricOrFact)}.`
      : "";

    const storyText = `Fait marquant numéro ${idx + 1}, dans le domaine ${item.category} : ${item.title}. ${summaryClean} Impact pour les équipes techniques : ${impactClean} ${metricText}`;

    chapters.push({
      id: `chap_item_${idx}`,
      title: `${idx + 2}. ${item.title.slice(0, 45)}...`,
      text: storyText,
      durationEstSec: Math.ceil(storyText.split(" ").length / 2.5),
    });
  });

  // Chapter Conclusion & Key Takeaway
  const takeawayClean = cleanTextForSpeech(result.takeaway || "");
  const conclusionText = `À retenir pour vos choix d'architecture et de stratégie : ${takeawayClean} C'était votre synthèse d'intelligence technologique TechWatch Ghostwriter. Bonne journée et à bientôt pour la prochaine édition !`;
  chapters.push({
    id: "chap_conclusion",
    title: `${chapters.length + 1}. Synthèse & À Retenir`,
    text: conclusionText,
    durationEstSec: Math.ceil(conclusionText.split(" ").length / 2.5),
  });

  const fullText = chapters.map((c) => c.text).join("\n\n");
  const totalDurationEstSec = chapters.reduce((acc, c) => acc + (c.durationEstSec || 15), 0);

  return {
    title: `Podcast Briefing : ${result.subject}`,
    totalDurationEstSec,
    fullText,
    chapters,
  };
}

/**
 * Builds a clean spoken text for a single Social Media Post
 */
export function buildSocialPostAudioText(post: SocialPost): string {
  const platformName =
    post.platform === "x"
      ? "sur le réseau X"
      : post.platform === "instagram"
      ? "sur Instagram"
      : "sur Facebook";

  const author = post.authorName || post.author || "Auteur vérifié";
  const cleanContent = cleanTextForSpeech(post.content);
  const impact = post.technicalImpact
    ? `Impact technique relevé : ${cleanTextForSpeech(post.technicalImpact)}.`
    : "";
  const verdict =
    post.recommendationScore >= 80
      ? "Signal technique jugé très fort et recommandé."
      : "Signal informatif.";

  return `Publication de ${author} ${platformName}. ${cleanContent}. ${impact} ${verdict}`;
}

// Global active speech instance tracker
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentOnEndCallback: (() => void) | null = null;

/**
 * Web Speech API Playback Handler
 */
export function speakText(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    onBoundary?: (charIndex: number) => void;
  } = {}
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API not supported in this browser.");
    options.onError?.("Speech synthesis not supported");
    return false;
  }

  // Cancel any existing speech
  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) return false;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.lang = options.lang || "fr-FR";

  // Attempt to select the best natural French or English voice available
  const voices = window.speechSynthesis.getVoices();
  const targetLangPrefix = (options.lang || "fr").slice(0, 2);
  const matchedVoice =
    voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(targetLangPrefix) &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Premium") ||
          v.name.includes("Neural") ||
          v.name.includes("Thomas") ||
          v.name.includes("Audrey") ||
          v.name.includes("Aurelie") ||
          v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    currentOnEndCallback = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    currentOnEndCallback = null;
    if (e.error !== "canceled" && e.error !== "interrupted") {
      options.onError?.(e);
    }
  };

  if (options.onBoundary) {
    utterance.onboundary = (e) => {
      options.onBoundary?.(e.charIndex);
    };
  }

  currentUtterance = utterance;
  currentOnEndCallback = options.onEnd || null;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    if (currentOnEndCallback) {
      currentOnEndCallback();
    }
    currentUtterance = null;
    currentOnEndCallback = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }
  return false;
}
