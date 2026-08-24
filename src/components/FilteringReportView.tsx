import React from "react";
import { Filter, Ban, CheckCircle2, Award } from "lucide-react";
import { FilteringReport, Innovation } from "../types";
import { VoiceButton } from "./VoiceButton";

interface FilteringReportViewProps {
  report: FilteringReport;
  innovations: Innovation[];
  takeaway: string;
}

export const FilteringReportView: React.FC<FilteringReportViewProps> = ({
  report,
  innovations,
  takeaway,
}) => {
  return (
    <div className="space-y-6">
      {/* Stats KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#D1CEC7] shadow-xs">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
            Total Éléments Analysés
          </div>
          <div className="text-3xl font-serif text-[#1A1A1A] mt-2">
            {report.totalItemsAnalyzed || 6}
          </div>
          <div className="text-xs font-serif italic text-neutral-500 mt-1">
            Flux bruts &amp; dépêches parsées
          </div>
        </div>

        <div className="p-5 bg-white border border-[#D1CEC7] shadow-xs">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-800 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Percées Retenues</span>
          </div>
          <div className="text-3xl font-serif text-emerald-900 mt-2">
            0{innovations.length || 3}
          </div>
          <div className="text-xs font-serif italic text-neutral-500 mt-1">
            Impact technique &amp; vérifiabilité
          </div>
        </div>

        <div className="p-5 bg-white border border-[#D1CEC7] shadow-xs">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-800 flex items-center space-x-1">
            <Ban className="w-3 h-3 text-rose-600" />
            <span>Bruits Éliminés</span>
          </div>
          <div className="text-3xl font-serif text-rose-900 mt-2">
            0{report.rejectedItemsCount || report.rejectionReasons?.length || 3}
          </div>
          <div className="text-xs font-serif italic text-neutral-500 mt-1">
            Marketing, hype &amp; non-sourcé
          </div>
        </div>
      </div>

      {/* Retained Innovations Highlights */}
      <div className="p-6 bg-white border border-[#D1CEC7] shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-[#D1CEC7]">
          <Award className="w-4 h-4 text-[#1A1A1A]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
            Les 3 Percées Techniques Validées
          </h3>
        </div>

        <div className="space-y-6">
          {innovations.map((item, idx) => (
            <article
              key={idx}
              className="p-5 bg-[#F9F8F6] border border-[#D1CEC7] hover:border-[#1A1A1A] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider">
                  Catégorie : {item.category}
                </span>
                <div className="flex items-center space-x-2">
                  {item.sourceRef && (
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Réf : {item.sourceRef}
                    </span>
                  )}
                  <VoiceButton
                    text={`Percée technique : ${item.title}. ${item.summary}. Impact opérationnel : ${item.impact}. ${item.keyMetricOrFact ? 'Fait clé : ' + item.keyMetricOrFact : ''}`}
                    label="Écouter l'article"
                    size="sm"
                  />
                </div>
              </div>

              <h4 className="font-serif italic text-xl text-[#1A1A1A] mb-3 flex items-baseline">
                <span className="w-6 h-[1px] bg-black mr-3 inline-block"></span>
                0{idx + 1}. {item.title}
              </h4>

              <p className="text-sm font-serif leading-relaxed text-[#1A1A1A] mb-4">
                {item.summary}
              </p>

              <div className="p-3.5 bg-white border border-[#D1CEC7] text-xs text-neutral-800 leading-relaxed font-sans">
                <strong className="text-[#1A1A1A] uppercase tracking-wider text-[10px] block mb-1">
                  🎯 Impact Opérationnel &amp; Architecture :
                </strong>
                {item.impact}
              </div>

              {item.keyMetricOrFact && (
                <div className="mt-2.5 text-xs text-neutral-600 font-mono">
                  <strong className="text-neutral-800">Métrique / Fait clé :</strong>{" "}
                  {item.keyMetricOrFact}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Filtered Out Items Log */}
      {report.rejectionReasons && report.rejectionReasons.length > 0 && (
        <div className="p-6 bg-white border border-[#D1CEC7] shadow-xs">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#D1CEC7]">
            <Filter className="w-4 h-4 text-rose-700" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Journal du Filtrage Autonome (Éléments Éliminés)
            </h3>
          </div>

          <div className="space-y-3">
            {report.rejectionReasons.map((rej, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#F9F8F6] border border-[#D1CEC7] flex items-start space-x-3"
              >
                <div className="p-1 text-rose-700 shrink-0 mt-0.5">
                  <Ban className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#1A1A1A] font-serif text-sm">{rej.topic}</div>
                  <div className="text-neutral-600 text-xs mt-1">
                    <span className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">
                      Motif d'élimination :
                    </span>{" "}
                    {rej.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Takeaway */}
      {takeaway && (
        <div className="p-5 bg-[#F1EFE9] border-y-2 border-[#1A1A1A]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Synthèse Décisionnelle &amp; Recommandation Ingénierie
            </div>
            <VoiceButton
              text={`Synthèse décisionnelle et recommandation ingénierie : ${takeaway}`}
              label="Écouter la synthèse"
              size="sm"
            />
          </div>
          <p className="text-sm font-serif italic text-[#1A1A1A] leading-relaxed">
            « {takeaway} »
          </p>
        </div>
      )}
    </div>
  );
};
