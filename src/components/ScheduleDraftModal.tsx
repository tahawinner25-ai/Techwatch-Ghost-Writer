import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CalendarCheck2,
  FileText,
} from "lucide-react";
import { NewsletterResult, ScheduledNewsletter } from "../types";
import { scheduleNewsletterInGoogleCalendar } from "../lib/calendarService";

interface ScheduleDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsletter: NewsletterResult;
  onScheduleSuccess: (scheduledItem: ScheduledNewsletter) => void;
  isGoogleConnected: boolean;
  onConnectGoogle?: () => void;
}

export const ScheduleDraftModal: React.FC<ScheduleDraftModalProps> = ({
  isOpen,
  onClose,
  newsletter,
  onScheduleSuccess,
  isGoogleConnected,
  onConnectGoogle,
}) => {
  // Default to tomorrow 09:00 AM
  const getTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [scheduledDateTime, setScheduledDateTime] = useState<string>(getTomorrowMorning());
  const [recipientsGroup, setRecipientsGroup] = useState<string>("Équipe R&D & Ingénierie");
  const [syncWithGoogleCalendar, setSyncWithGoogleCalendar] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ eventLink?: string } | null>(null);

  if (!isOpen) return null;

  const setPresetTime = (preset: "tomorrow_9am" | "next_monday" | "in_2_hours") => {
    const now = new Date();
    if (preset === "tomorrow_9am") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      setScheduledDateTime(d.toISOString().slice(0, 16));
    } else if (preset === "next_monday") {
      const d = new Date();
      const day = d.getDay();
      const diff = (day === 0 ? 1 : 8 - day);
      d.setDate(d.getDate() + diff);
      d.setHours(8, 30, 0, 0);
      setScheduledDateTime(d.toISOString().slice(0, 16));
    } else if (preset === "in_2_hours") {
      const d = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      setScheduledDateTime(d.toISOString().slice(0, 16));
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const scheduledDateObj = new Date(scheduledDateTime);
      if (isNaN(scheduledDateObj.getTime())) {
        throw new Error("Veuillez sélectionner une date et heure valides.");
      }

      if (scheduledDateObj.getTime() < Date.now() - 60000) {
        throw new Error("La date de planification doit être ultérieure à la date actuelle.");
      }

      let calEventId: string | undefined = undefined;
      let calEventLink: string | undefined = undefined;

      // If user enabled Google Calendar synchronization and is connected
      if (syncWithGoogleCalendar && isGoogleConnected) {
        try {
          const calResult = await scheduleNewsletterInGoogleCalendar({
            newsletter,
            scheduledDate: scheduledDateTime,
            durationMinutes: 30,
            recipientsGroup,
            notes,
          });
          calEventId = calResult.eventId;
          calEventLink = calResult.eventLink;
        } catch (calError: any) {
          console.warn("Google Calendar sync warning:", calError);
          // Don't fail the whole queue if calendar fails, but notify
          setErrorMessage(
            `Avertissement Google Calendar: ${calError.message || "Erreur de synchronisation calendrier"}. La newsletter sera tout de même mise en file d'attente.`
          );
        }
      }

      const scheduledItem: ScheduledNewsletter = {
        id: `sched_${Date.now()}`,
        newsletter,
        scheduledFor: new Date(scheduledDateTime).toISOString(),
        targetRecipientsGroup: recipientsGroup,
        status: "PENDING",
        googleCalendarEventId: calEventId,
        googleCalendarEventLink: calEventLink,
        createdAt: Date.now(),
        notes,
      };

      onScheduleSuccess(scheduledItem);
      setSuccessInfo({ eventLink: calEventLink });

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de la planification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#f8f7f4] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#c44d2d]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
              Planificateur d'Envoi &bull; Draft Scheduler
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#e5e2da] text-neutral-600 hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleScheduleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f8f7f4]">
          {/* Target Newsletter Summary */}
          <div className="p-3.5 bg-white border border-[rgba(26,26,26,0.15)] shadow-xs space-y-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#c44d2d] font-bold block">
              Édition à Programmer
            </span>
            <h3 className="font-serif font-bold text-sm text-[#1a1a1a] line-clamp-1">
              {newsletter.subject}
            </h3>
            <p className="text-xs text-neutral-600 font-serif italic line-clamp-1">
              {newsletter.editorialIntro}
            </p>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-semibold">
              Raccourcis de Diffusion
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPresetTime("tomorrow_9am")}
                className="px-2.5 py-2 bg-white border border-[rgba(26,26,26,0.2)] hover:border-[#1a1a1a] text-xs font-mono text-neutral-800 text-left transition-colors cursor-pointer hover:bg-neutral-50 shadow-xs"
              >
                <div className="font-bold text-[11px]">Demain 09h00</div>
                <div className="text-[10px] text-neutral-500">Matinée</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetTime("next_monday")}
                className="px-2.5 py-2 bg-white border border-[rgba(26,26,26,0.2)] hover:border-[#1a1a1a] text-xs font-mono text-neutral-800 text-left transition-colors cursor-pointer hover:bg-neutral-50 shadow-xs"
              >
                <div className="font-bold text-[11px]">Lundi 08h30</div>
                <div className="text-[10px] text-neutral-500">Hebdo R&amp;D</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetTime("in_2_hours")}
                className="px-2.5 py-2 bg-white border border-[rgba(26,26,26,0.2)] hover:border-[#1a1a1a] text-xs font-mono text-neutral-800 text-left transition-colors cursor-pointer hover:bg-neutral-50 shadow-xs"
              >
                <div className="font-bold text-[11px]">Dans 2 heures</div>
                <div className="text-[10px] text-neutral-500">Express</div>
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>Date et Heure précises de Programmation</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-[#1a1a1a] font-mono text-xs text-[#1a1a1a] focus:outline-hidden focus:ring-1 focus:ring-[#c44d2d] shadow-xs"
            />
          </div>

          {/* Target Audience List */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>Groupe / Liste de Destinataires</span>
            </label>
            <select
              value={recipientsGroup}
              onChange={(e) => setRecipientsGroup(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#1a1a1a] font-serif text-xs text-[#1a1a1a] focus:outline-hidden focus:ring-1 focus:ring-[#c44d2d] shadow-xs"
            >
              <option value="Équipe R&D & Ingénierie">Équipe R&D &amp; Ingénierie (Liste Principale)</option>
              <option value="CTOs, VPs Engineering & Direction">CTOs, VPs Engineering &amp; Direction Technique</option>
              <option value="Tech Leads & Développeurs Seniors">Tech Leads &amp; Développeurs Seniors</option>
              <option value="Architectes Solutions & Cloud">Architectes Solutions &amp; Cloud</option>
              <option value="Tous les Abonnés Veille Technologique">Tous les Abonnés (Broadcast Complet)</option>
            </select>
          </div>

          {/* Google Calendar Sync Option */}
          <div className="p-4 bg-white border border-[rgba(26,26,26,0.15)] shadow-xs space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="sync-calendar"
                  checked={syncWithGoogleCalendar}
                  onChange={(e) => setSyncWithGoogleCalendar(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#c44d2d] focus:ring-[#c44d2d] border-[#1a1a1a] rounded-none cursor-pointer"
                />
                <label htmlFor="sync-calendar" className="text-xs text-[#1a1a1a] font-serif cursor-pointer">
                  <span className="font-bold block flex items-center gap-1.5">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-blue-700 inline" />
                    Synchroniser avec Google Calendar
                  </span>
                  <span className="text-neutral-500 text-[11px] block mt-0.5">
                    Crée automatiquement un événement de publication dans votre calendrier Google avec rappel et résumé des innovations.
                  </span>
                </label>
              </div>

              {!isGoogleConnected && syncWithGoogleCalendar && (
                <button
                  type="button"
                  onClick={onConnectGoogle}
                  className="shrink-0 px-2.5 py-1 bg-white border border-blue-700 text-blue-800 font-mono text-[10px] uppercase font-bold hover:bg-blue-50 transition-colors"
                >
                  Connexion Google
                </button>
              )}
            </div>

            {isGoogleConnected && syncWithGoogleCalendar && (
              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 p-2 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Compte Google connecté &bull; Création d'événement actif sur votre agenda principal</span>
              </div>
            )}
          </div>

          {/* Editorial Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>Notes Éditoriales / Instructions d'Envoi (Optionnel)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Valider les metrics de charge avant envoi..."
              className="w-full p-2.5 bg-white border border-[#1a1a1a] font-serif text-xs text-[#1a1a1a] focus:outline-hidden focus:ring-1 focus:ring-[#c44d2d] shadow-xs"
            />
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-white border border-[#c44d2d] text-[#1a1a1a] text-xs flex items-start space-x-2 shadow-xs">
              <AlertCircle className="w-4 h-4 text-[#c44d2d] shrink-0 mt-0.5" />
              <div className="font-serif text-xs">{errorMessage}</div>
            </div>
          )}

          {successInfo && (
            <div className="p-3 bg-white border border-emerald-600 text-[#1a1a1a] text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-serif">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Newsletter planifiée avec succès dans la file d'attente !</span>
              </div>
              {successInfo.eventLink && (
                <a
                  href={successInfo.eventLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>Google Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[rgba(26,26,26,0.15)] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#1a1a1a] bg-white text-[#1a1a1a] font-mono text-[11px] uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-mono text-[11px] uppercase tracking-wider font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Planification..." : "Confirmer la Programmation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
