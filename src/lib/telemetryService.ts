import { TelemetryEvent, RealTimeTelemetryData, NewsletterResult } from "../types";
import { db } from "./firebase";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

const LOCAL_STORAGE_KEY = "techwatch_telemetry_events_v2";
const LOCAL_STORAGE_SUMMARY_KEY = "techwatch_telemetry_summary_v2";

type TelemetryListener = (summary: RealTimeTelemetryData, newEvent: TelemetryEvent) => void;
const listeners: Set<TelemetryListener> = new Set();

/**
 * Loads all stored real-time telemetry events from local storage
 */
export function getStoredTelemetryEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading telemetry events from storage:", err);
    return [];
  }
}

/**
 * Computes aggregated real-time telemetry stats from live events
 */
export function computeRealTimeTelemetry(newsletterId?: string): RealTimeTelemetryData {
  const events = getStoredTelemetryEvents();
  const relevantEvents = newsletterId
    ? events.filter((e) => e.newsletterId === newsletterId || e.newsletterId === "all")
    : events;

  let totalRealOpens = 0;
  let totalRealClicks = 0;
  let totalRealDwellSeconds = 0;
  const linkClicksMap: Record<string, number> = {};

  relevantEvents.forEach((ev) => {
    if (ev.type === "OPEN") {
      totalRealOpens += 1;
    } else if (ev.type === "LINK_CLICK" || ev.type === "SOCIAL_VISIT") {
      totalRealClicks += 1;
      if (ev.url) {
        linkClicksMap[ev.url] = (linkClicksMap[ev.url] || 0) + 1;
      }
    } else if (ev.type === "READ_DWELL") {
      totalRealDwellSeconds += ev.readingTimeSeconds || 0;
    }
  });

  // If no open events yet, treat initial view as 1
  const effectiveOpens = Math.max(1, totalRealOpens);
  const actualCtrPct = Number(((totalRealClicks / effectiveOpens) * 100).toFixed(1));

  // Determine active readers (events in the last 5 minutes)
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const activeRecent = relevantEvents.filter((e) => e.timestamp >= fiveMinAgo);
  const activeReadersCount = Math.max(1, activeRecent.length > 0 ? Math.min(6, activeRecent.length) : 1);

  return {
    totalRealOpens,
    totalRealClicks,
    totalRealDwellSeconds,
    actualCtrPct,
    activeReadersCount,
    recentEvents: relevantEvents.slice(0, 30),
    linkClicksMap,
    lastEventTimestamp: relevantEvents[0]?.timestamp || Date.now(),
  };
}

/**
 * Record a real telemetry event in real time and broadcast to all live listeners
 */
export async function trackTelemetryEvent(
  eventData: Omit<TelemetryEvent, "id" | "timestamp">,
  userId?: string
): Promise<TelemetryEvent> {
  const newEvent: TelemetryEvent = {
    ...eventData,
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getStoredTelemetryEvents();
    const updated = [newEvent, ...existing].slice(0, 200); // retain last 200 real events
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Also persist to Firestore if user logged in
    if (userId && db) {
      try {
        const eventsCol = collection(db, "users", userId, "telemetry_events");
        addDoc(eventsCol, newEvent).catch(() => {});
      } catch (err) {
        console.warn("Firestore telemetry async write note:", err);
      }
    }

    const summary = computeRealTimeTelemetry(eventData.newsletterId);
    listeners.forEach((cb) => {
      try {
        cb(summary, newEvent);
      } catch (err) {
        console.error("Telemetry listener error:", err);
      }
    });
  } catch (err) {
    console.error("Error storing telemetry event:", err);
  }

  return newEvent;
}

/**
 * Helper to record a link click with automatic direct external opening & analytics capture
 */
export function trackLinkClick(
  newsletterId: string,
  url: string,
  label: string,
  userId?: string
) {
  trackTelemetryEvent(
    {
      newsletterId,
      type: "LINK_CLICK",
      label: `Clic sur le lien direct : ${label}`,
      url,
      details: { target: url },
    },
    userId
  );
}

/**
 * Helper to record a social post direct link inspection
 */
export function trackSocialVisit(
  platform: string,
  postUrl: string,
  author: string,
  userId?: string
) {
  trackTelemetryEvent(
    {
      newsletterId: "social_hub",
      type: "SOCIAL_VISIT",
      label: `Consultation du post direct sur ${(platform || "Réseau").toUpperCase()} (@${author || "auteur"})`,
      url: postUrl,
      details: { platform, author, postUrl },
    },
    userId
  );
}

/**
 * Helper to record real dwell reading time (called periodically during active reading)
 */
export function trackDwellReadingTime(
  newsletterId: string,
  seconds: number,
  userId?: string
) {
  if (seconds <= 0) return;
  trackTelemetryEvent(
    {
      newsletterId,
      type: "READ_DWELL",
      label: `Temps de lecture actif enregistré (+${seconds}s)`,
      readingTimeSeconds: seconds,
      details: { durationSeconds: seconds },
    },
    userId
  );
}

/**
 * Helper to record newsletter opening/preview render
 */
export function trackNewsletterOpen(
  newsletterId: string,
  subject: string,
  userId?: string
) {
  trackTelemetryEvent(
    {
      newsletterId,
      type: "OPEN",
      label: `Ouverture et affichage de l'édition "${subject.slice(0, 40)}..."`,
      details: { subject },
    },
    userId
  );
}

/**
 * Subscribe to real-time telemetry updates
 */
export function subscribeTelemetry(listener: TelemetryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
