import { getAccessToken } from "./firebase";
import { NewsletterResult } from "../types";

export interface CreateCalendarEventParams {
  newsletter: NewsletterResult;
  scheduledDate: string; // "YYYY-MM-DDTHH:mm" or ISO string
  durationMinutes?: number;
  recipientsGroup?: string;
  notes?: string;
}

export interface GoogleCalendarEventResponse {
  id: string;
  htmlLink: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

/**
 * Creates an event in Google Calendar for the scheduled newsletter dispatch
 */
export async function scheduleNewsletterInGoogleCalendar(
  params: CreateCalendarEventParams
): Promise<{ eventId: string; eventLink: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Jeton Google introuvable. Veuillez vous reconnecter avec votre compte Google.");
  }

  // Parse start date
  const startDate = new Date(params.scheduledDate);
  if (isNaN(startDate.getTime())) {
    throw new Error("Date et heure de planification invalides.");
  }

  const duration = params.durationMinutes || 30;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // Build clean markdown / text description
  const innovationsSummary = params.newsletter.innovations?.length
    ? params.newsletter.innovations.map((inv, idx) => `${idx + 1}. [${inv.category}] ${inv.title}`).join("\n")
    : "Veille R&D automatisée";

  const description = `📢 DISPATCH NEWSLETTER TECHNIQUE R&D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sujet : ${params.newsletter.subject}
Public cible : ${params.recipientsGroup || "Équipe Ingénierie & R&D"}
Date de diffusion : ${startDate.toLocaleString("fr-FR")}

🔍 INNOVATIONS CLÉS RETENUES :
${innovationsSummary}

💡 SYNTHÈSE STRATÉGIQUE :
${params.newsletter.takeaway || "Revue technique complète"}

${params.notes ? `📝 NOTES ÉDITORIALES :\n${params.notes}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Généré par TechWatch Ghostwriter AI`;

  const eventPayload = {
    summary: `🚀 Envoi Newsletter: ${params.newsletter.subject.substring(0, 70)}`,
    description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
    },
    colorId: "11", // Bold Flamingo / Red in Google Calendar
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "email", minutes: 60 },
      ],
    },
  };

  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || response.statusText;
    throw new Error(`Erreur Google Calendar (${response.status}): ${message}`);
  }

  const data: GoogleCalendarEventResponse = await response.json();
  return {
    eventId: data.id,
    eventLink: data.htmlLink,
  };
}

/**
 * Removes an event from Google Calendar (with mandatory confirmation pattern)
 */
export async function deleteNewsletterFromGoogleCalendar(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok || response.status === 404;
  } catch (err) {
    console.warn("Failed to delete Google Calendar event:", err);
    return false;
  }
}
