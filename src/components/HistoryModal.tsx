import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  Calendar,
  FileText,
  ArrowRight,
  Clock,
  MailOpen,
  MousePointerClick,
  Send,
  CalendarCheck2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Users,
  Search,
  Tag,
  Filter,
} from "lucide-react";
import { NewsletterResult, ScheduledNewsletter } from "../types";
import { generateMetricsForNewsletter } from "../lib/analyticsHelper";
import { deleteNewsletterFromGoogleCalendar } from "../lib/calendarService";
import { extractTagsFromNewsletter } from "../lib/tagExtractor";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: NewsletterResult[];
  scheduledQueue: ScheduledNewsletter[];
  onSelect: (item: NewsletterResult) => void;
  onClear: () => void;
  onDeleteOne: (id: string) => void;
  onDeleteScheduled: (id: string) => void;
  onTriggerSendNow?: (item: ScheduledNewsletter) => void;
  isCloudSynced?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  scheduledQueue,
  onSelect,
  onClear,
  onDeleteOne,
  onDeleteScheduled,
  onTriggerSendNow,
  isCloudSynced,
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "queue">("history");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: "history" | "scheduled";
    id: string;
    title: string;
    calendarEventId?: string;
  } | null>(null);

  // Ensure all newsletters have auto-extracted tags
  const enrichedHistory = useMemo(() => {
    return history.map((item) => ({
      ...item,
      tags: item.tags && item.tags.length > 0 ? item.tags : extractTagsFromNewsletter(item),
    }));
  }, [history]);

  // Aggregate all unique tags with count
  const allTagsWithCounts = useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    enrichedHistory.forEach((item) => {
      (item.tags || []).forEach((t) => {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      });
    });

    return Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [enrichedHistory]);

  // Filtered newsletters based on search query & selected tag
  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return enrichedHistory.filter((item) => {
      // Tag filter
      const matchesTag =
        selectedTag === "ALL" || (item.tags || []).includes(selectedTag);

      // Search query filter (search in subject, intro, takeaway, innovations, tags)
      const matchesSearch =
        !q ||
        (item.subject || "").toLowerCase().includes(q) ||
        (item.editorialIntro || "").toLowerCase().includes(q) ||
        (item.takeaway || "").toLowerCase().includes(q) ||
        (item.tags || []).some((t) => (t || "").toLowerCase().includes(q)) ||
        (item.innovations || []).some(
          (inv) =>
            (inv.title || "").toLowerCase().includes(q) ||
            (inv.category || "").toLowerCase().includes(q) ||
            (inv.summary || "").toLowerCase().includes(q)
        );

      return matchesTag && matchesSearch;
    });
  }, [enrichedHistory, searchQuery, selectedTag]);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;

    if (deleteConfirmItem.type === "history") {
      onDeleteOne(deleteConfirmItem.id);
    } else if (deleteConfirmItem.type === "scheduled") {
      // If linked to Google Calendar, remove event
      if (deleteConfirmItem.calendarEventId) {
        await deleteNewsletterFromGoogleCalendar(deleteConfirmItem.calendarEventId);
      }
      onDeleteScheduled(deleteConfirmItem.id);
    }

    setDeleteConfirmItem(null);
  };

  const formatScheduledDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a] w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header & Tabs */}
        <div className="px-6 py-3 border-b border-[#1a1a1a] bg-[#f8f7f4] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest font-mono transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#1a1a1a] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#1a1a1a]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Archives ({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest font-mono transition-all cursor-pointer ${
                activeTab === "queue"
                  ? "bg-[#1a1a1a] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#1a1a1a]"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-[#c44d2d]" />
              <span>File d'Attente / Queue ({scheduledQueue.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-[#e5e2da] text-neutral-600 hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tag Filter Bar (Only in history tab) */}
        {activeTab === "history" && history.length > 0 && (
          <div className="p-4 border-b border-[rgba(26,26,26,0.15)] bg-[#fcfbf9] space-y-2.5">
            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mots-clés, technologies, sujets ou termes d'innovations..."
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-[rgba(26,26,26,0.2)] text-xs font-mono text-[#1a1a1a] placeholder:text-neutral-400 focus:outline-none focus:border-[#1a1a1a]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1a1a1a] text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Auto-extracted Tag Filter Chips */}
            {allTagsWithCounts.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-thin">
                <span className="text-[10px] uppercase text-neutral-400 tracking-wider shrink-0 mr-1 flex items-center">
                  <Tag className="w-2.5 h-2.5 mr-1 text-[#c44d2d]" />
                  Tags auto-extraits :
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedTag("ALL")}
                  className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                    selectedTag === "ALL"
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a] font-bold"
                      : "bg-white text-neutral-600 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a]"
                  }`}
                >
                  Tous ({enrichedHistory.length})
                </button>

                {allTagsWithCounts.map(({ tag, count }) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isActive ? "ALL" : tag)}
                      className={`px-2 py-0.5 border text-[10px] shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#c44d2d] text-white border-[#c44d2d] font-bold shadow-xs"
                          : "bg-white text-neutral-600 border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                      }`}
                    >
                      #{tag} <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-[#f8f7f4]">
          {/* TAB 1: ARCHIVES HISTORY */}
          {activeTab === "history" && (
            <>
              {history.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs font-serif italic">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                  Aucune newsletter archivée pour le moment.
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs font-serif italic space-y-2">
                  <Search className="w-7 h-7 mx-auto opacity-30 text-neutral-400" />
                  <p>Aucune édition ne correspond aux mots-clés ou au tag sélectionné.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag("ALL");
                    }}
                    className="text-xs font-mono text-[#c44d2d] underline uppercase tracking-wider cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const metrics = item.performanceMetrics || generateMetricsForNewsletter(item);
                  const tags = item.tags || [];

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] transition-all flex flex-col justify-between gap-3 group shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-500 mb-1.5">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-neutral-500" />
                            {item.dateStr || "Récent"}
                          </span>
                          <span>•</span>
                          <span className="text-[#c44d2d] font-bold uppercase">
                            {item.innovations?.length || 0} innovations
                          </span>
                          <span>•</span>
                          <span className="flex items-center text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                            <MailOpen className="w-2.5 h-2.5 mr-1" />
                            {metrics.openRate}% ouv.
                          </span>
                          <span className="flex items-center text-[#1a1a1a] bg-[#f8f7f4] px-1.5 py-0.5 border border-[rgba(26,26,26,0.15)]">
                            <MousePointerClick className="w-2.5 h-2.5 mr-1" />
                            {metrics.clickRate}% CTR
                          </span>
                        </div>

                        <h3 className="text-sm font-serif font-bold text-[#1a1a1a] group-hover:text-[#c44d2d] truncate transition-colors">
                          {item.subject}
                        </h3>
                        <p className="text-xs text-neutral-600 font-serif italic truncate mt-0.5">
                          {item.editorialIntro}
                        </p>

                        {/* Extracted Tags Badges */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-2.5">
                            {tags.map((t, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(t);
                                }}
                                className="px-1.5 py-0.5 bg-[#f8f7f4] hover:bg-[#e5e2da] border border-[rgba(26,26,26,0.12)] text-[9px] font-mono text-neutral-700 hover:text-[#1a1a1a] transition-colors cursor-pointer"
                                title={`Filtrer par #${t}`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(26,26,26,0.06)]">
                        <span className="text-[10px] font-mono text-neutral-400">
                          ID: {item.id?.slice(0, 14)}...
                        </span>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => {
                              onSelect(item);
                              onClose();
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                          >
                            <span>Charger</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              if (item.id) {
                                setDeleteConfirmItem({
                                  type: "history",
                                  id: item.id,
                                  title: item.subject,
                                });
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Supprimer cette édition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: QUEUE (SCHEDULED NEWSLETTERS) */}
          {activeTab === "queue" && (
            <>
              {scheduledQueue.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs font-serif italic space-y-2">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                  <p>Aucun envoi planifié dans la file d'attente.</p>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Utilisez le bouton "Planifier l'envoi" depuis l'aperçu d'une newsletter pour programmer une publication avec Google Calendar.
                  </p>
                </div>
              ) : (
                scheduledQueue.map((item) => {
                  const isPending = item.status === "PENDING";
                  const isSent = item.status === "SENT";

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-[rgba(26,26,26,0.15)] hover:border-[#1a1a1a] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 uppercase tracking-wider font-bold border ${
                              isPending
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : isSent
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                : "bg-neutral-100 text-neutral-600 border-neutral-300"
                            }`}
                          >
                            {isPending ? "⏳ En attente d'envoi" : isSent ? "✅ Envoyé" : "Annulé"}
                          </span>

                          <span className="flex items-center text-neutral-600 font-semibold">
                            <Clock className="w-3 h-3 mr-1 text-[#c44d2d]" />
                            {formatScheduledDate(item.scheduledFor)}
                          </span>

                          <span className="text-neutral-400">•</span>

                          <span className="flex items-center text-neutral-600">
                            <Users className="w-3 h-3 mr-1 text-neutral-400" />
                            {item.targetRecipientsGroup || "Équipe R&D"}
                          </span>
                        </div>

                        <h3 className="text-sm font-serif font-bold text-[#1a1a1a] truncate">
                          {item.newsletter.subject}
                        </h3>

                        {/* Calendar Link if present */}
                        {item.googleCalendarEventLink && (
                          <div className="flex items-center space-x-1 text-[11px] font-mono text-blue-700">
                            <CalendarCheck2 className="w-3 h-3 text-blue-700" />
                            <a
                              href={item.googleCalendarEventLink}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline flex items-center gap-0.5"
                            >
                              <span>Événement Google Calendar associé</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-neutral-500 font-serif italic truncate">
                            Note : {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            onSelect(item.newsletter);
                            onClose();
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-[#1a1a1a] text-[#1a1a1a] font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                          title="Ouvrir dans l'éditeur"
                        >
                          <span>Voir</span>
                        </button>

                        {onTriggerSendNow && isPending && (
                          <button
                            onClick={() => onTriggerSendNow(item)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-xs"
                            title="Diffuser immédiatement"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Envoyer</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setDeleteConfirmItem({
                              type: "scheduled",
                              id: item.id,
                              title: item.newsletter.subject,
                              calendarEventId: item.googleCalendarEventId,
                            });
                          }}
                          className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Supprimer la programmation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === "history" && history.length > 0 && (
          <div className="px-6 py-3 border-t border-[#1a1a1a] bg-[#f8f7f4] flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px] font-mono flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? "bg-emerald-600" : "bg-neutral-400"}`} />
              {isCloudSynced
                ? "Synchronisé avec Firebase Firestore Cloud"
                : "Stockage local dans le navigateur"}
              {filteredHistory.length < enrichedHistory.length && (
                <span className="text-[#c44d2d] font-bold ml-1">
                  ({filteredHistory.length}/{enrichedHistory.length} affichée{filteredHistory.length > 1 ? "s" : ""})
                </span>
              )}
            </span>
            <button
              onClick={onClear}
              className="text-rose-700 hover:text-rose-900 font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tout effacer</span>
            </button>
          </div>
        )}

        {/* EXPLICIT USER CONFIRMATION MODAL FOR DELETION (Workspace safety guideline) */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#1a1a1a] max-w-md w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#c44d2d] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1a1a1a]">
                    Confirmation requise
                  </h4>
                  <p className="text-sm font-serif text-neutral-700 mt-1">
                    Êtes-vous certain de vouloir supprimer{" "}
                    {deleteConfirmItem.type === "scheduled"
                      ? "cette programmation de la file d'attente (et l'événement Google Calendar associé si existant) ?"
                      : "cette édition archivée ?"}
                  </p>
                  <p className="text-xs font-serif italic text-neutral-500 mt-1 truncate">
                    "{deleteConfirmItem.title}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-200">
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-3 py-1.5 border border-[#1a1a1a] text-xs font-mono uppercase tracking-wider hover:bg-neutral-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-mono uppercase tracking-wider font-bold cursor-pointer shadow-xs"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

