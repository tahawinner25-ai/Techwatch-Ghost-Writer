import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity, Copy, Check } from "lucide-react";
import { TrendChartData } from "../types";

interface TrendChartRendererProps {
  chart: TrendChartData;
  className?: string;
}

const COLORS = ["#1A1A1A", "#C44D2D", "#0F766E", "#D97706", "#4F46E5", "#0284C7", "#9333EA"];

export const TrendChartRenderer: React.FC<TrendChartRendererProps> = ({ chart, className = "" }) => {
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(chart.type || "bar");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const data = chart.data || [];
  const unit = data[0]?.unit || "";

  const handleCopySummary = async () => {
    const summaryText = `${chart.title}\n${data.map((d) => `• ${d.label}: ${d.value}${d.unit || unit} ${d.secondaryValue ? `(Ref: ${d.secondaryValue})` : ""}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_e) {
      // ignore
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] text-white p-2.5 border border-neutral-700 shadow-md font-mono text-xs">
          <p className="font-bold text-[#E5E5E5] mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || "#00E599" }}>
              <span className="capitalize">{entry.name} : </span>
              <span className="font-bold">
                {entry.value} {entry.payload?.unit || unit}
              </span>
            </p>
          ))}
          {payload[0]?.payload?.baseline !== undefined && (
            <p className="text-neutral-400 text-[10px] mt-1 border-t border-neutral-700 pt-1">
              Base de référence : {payload[0].payload.baseline} {unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`border border-[#D1CEC7] bg-white overflow-hidden shadow-xs transition-all ${className}`}>
      {/* Header bar */}
      <div className="bg-[#F9F8F6] px-4 py-2.5 border-b border-[#D1CEC7] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#c44d2d]" />
          <span className="font-serif italic font-bold text-sm text-[#1A1A1A]">
            {chart.title || "Graphique des Tendances & Métriques Clés"}
          </span>
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#EAE8E3] text-neutral-700 font-bold">
            RECHARTS DATA
          </span>
        </div>

        {/* Action controls & chart type switcher */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-white border border-[#D1CEC7] p-0.5">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1 text-[10px] font-mono transition-colors ${
                chartType === "bar" ? "bg-[#1A1A1A] text-white" : "text-neutral-600 hover:text-black"
              }`}
              title="Graphique en barres"
            >
              <BarChart3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`p-1 text-[10px] font-mono transition-colors ${
                chartType === "line" ? "bg-[#1A1A1A] text-white" : "text-neutral-600 hover:text-black"
              }`}
              title="Graphique en courbes"
            >
              <LineIcon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1 text-[10px] font-mono transition-colors ${
                chartType === "area" ? "bg-[#1A1A1A] text-white" : "text-neutral-600 hover:text-black"
              }`}
              title="Graphique en aires"
            >
              <Activity className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("pie")}
              className={`p-1 text-[10px] font-mono transition-colors ${
                chartType === "pie" ? "bg-[#1A1A1A] text-white" : "text-neutral-600 hover:text-black"
              }`}
              title="Graphique circulaire"
            >
              <PieIcon className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F1EFE9] border border-[#D1CEC7] text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A] transition-colors cursor-pointer"
            title="Copier les métriques textuelles"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-600" />
                <span>Données</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description caption */}
      {chart.description && (
        <div className="px-4 py-2 bg-[#FAF9F6] border-b border-[#EAE8E3] text-xs font-serif text-neutral-600 italic">
          📈 {chart.description}
        </div>
      )}

      {/* Chart container */}
      <div className="p-4 sm:p-5 bg-white min-h-[220px]">
        {data.length === 0 ? (
          <div className="py-8 text-center text-xs font-serif text-neutral-400 italic">
            Aucune métrique chiffrée exploitable pour ce graphique.
          </div>
        ) : (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "sans-serif" }}
                  />
                  <Bar
                    dataKey="value"
                    name={chart.metricLabel || "Valeur"}
                    fill="#1A1A1A"
                    radius={[2, 2, 0, 0]}
                  />
                  {data.some((d) => d.secondaryValue !== undefined) && (
                    <Bar
                      dataKey="secondaryValue"
                      name={chart.secondaryMetricLabel || "Référence Antérieure"}
                      fill="#C44D2D"
                      radius={[2, 2, 0, 0]}
                    />
                  )}
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "sans-serif" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={chart.metricLabel || "Valeur"}
                    stroke="#1A1A1A"
                    strokeWidth={2}
                    dot={{ fill: "#C44D2D", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {data.some((d) => d.secondaryValue !== undefined) && (
                    <Line
                      type="monotone"
                      dataKey="secondaryValue"
                      name={chart.secondaryMetricLabel || "Référence"}
                      stroke="#C44D2D"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ fill: "#1A1A1A", r: 3 }}
                    />
                  )}
                </LineChart>
              ) : chartType === "area" ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#666666", fontSize: 10, fontFamily: "sans-serif" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "sans-serif" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={chart.metricLabel || "Valeur"}
                    stroke="#1A1A1A"
                    fill="#F1EFE9"
                    strokeWidth={2}
                  />
                  {data.some((d) => d.secondaryValue !== undefined) && (
                    <Area
                      type="monotone"
                      dataKey="secondaryValue"
                      name={chart.secondaryMetricLabel || "Référence"}
                      stroke="#C44D2D"
                      fill="#FBEAE5"
                      strokeWidth={1.5}
                    />
                  )}
                </AreaChart>
              ) : (
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "sans-serif" }}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    fill="#1A1A1A"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick KPI stats row */}
        {data.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#EAE8E3] grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.slice(0, 4).map((point, pIdx) => (
              <div key={pIdx} className="bg-[#FAF9F6] p-2 border border-[#EAE8E3]">
                <div className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 truncate">
                  {point.label}
                </div>
                <div className="text-sm font-bold font-mono text-[#1A1A1A] mt-0.5">
                  {point.value} <span className="text-[10px] font-normal text-neutral-600">{point.unit || unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
