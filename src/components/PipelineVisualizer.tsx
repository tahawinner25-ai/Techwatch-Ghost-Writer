import React from "react";
import { Globe, Filter, Award, FileCode2, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export type PipelineVisualizerStatus =
  | "idle"
  | "grounding"
  | "filtering"
  | "selecting"
  | "writing"
  | "completed";

interface PipelineVisualizerProps {
  status: PipelineVisualizerStatus;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ status }) => {
  if (status === "idle") return null;

  const steps = [
    {
      id: "grounding",
      title: "01. Pré-Recherche & Grounding",
      desc: "Corroboration systématique de chaque sujet via Google Search en temps réel",
      icon: Globe,
    },
    {
      id: "filtering",
      title: "02. Filtrage & Débruitage",
      desc: "Élimination des bruits publicitaires, du marketing et des contenus sans substance",
      icon: Filter,
    },
    {
      id: "selecting",
      title: "03. Sélection des 3 Majeures",
      desc: "Identification des 3 percées techniques à plus fort impact étayées par le web",
      icon: Award,
    },
    {
      id: "writing",
      title: "04. Rédaction Senior & HTML",
      desc: "Synthèse factuelle, impacts vérifiés et génération HTML d'e-mailing prête à l'envoi",
      icon: FileCode2,
    },
  ];

  const stepOrder = ["grounding", "filtering", "selecting", "writing"];
  const currentStepIndex = stepOrder.indexOf(status);

  const getStepStatus = (stepId: string) => {
    if (status === "completed") return "done";
    const thisIndex = stepOrder.indexOf(stepId);
    if (thisIndex < currentStepIndex) return "done";
    if (thisIndex === currentStepIndex) return "current";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-[#F1EFE9] border border-[#D1CEC7] mb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#D1CEC7]">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
            {status === "completed"
              ? "Processus Autonome Finalisé • Prêt pour Export"
              : status === "grounding"
              ? "Étape 1/4 : Pré-Recherche & Grounding Web en Temps Réel..."
              : "Agent Autonome en Cours de Synthèse..."}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
          Corroboration Web Obligatoire &amp; Zéro Hallucination
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 border transition-all flex flex-col justify-between ${
                stepStatus === "current"
                  ? "bg-white border-[#1A1A1A] ring-1 ring-[#1A1A1A] text-[#1A1A1A] shadow-xs"
                  : stepStatus === "done"
                  ? "bg-white border-[#D1CEC7] text-[#1A1A1A]"
                  : "bg-[#F9F8F6]/60 border-[#D1CEC7]/60 text-neutral-400 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                    Étape
                  </span>
                  <div className="p-1">
                    {stepStatus === "current" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                    ) : stepStatus === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Icon className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  {step.title}
                </div>
                <div className="text-xs text-neutral-600 mt-1.5 leading-relaxed font-serif">
                  {step.desc}
                </div>
              </div>

              {/* Progress bar line */}
              <div className="h-1 w-full bg-neutral-200 mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    stepStatus === "done"
                      ? "bg-emerald-600 w-full"
                      : stepStatus === "current"
                      ? "bg-[#1A1A1A] w-2/3 animate-pulse"
                      : "bg-transparent w-0"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
