import React from 'react';
import { Activity, ShieldAlert, Cpu, CheckCircle2, AlertCircle, BarChart3, Clock, Sparkles } from 'lucide-react';
import { AIScreeningResult, DRGrade } from '../types/screening';
import { DR_SEVERITY_SCALE } from '../data/demoCases';

interface ScreeningResultProps {
  result: AIScreeningResult;
}

export const ScreeningResult: React.FC<ScreeningResultProps> = ({ result }) => {
  const sevInfo = DR_SEVERITY_SCALE[result.predictedGrade];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
      {/* Top Banner: Prominent Model & Demo Notice */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span className="font-mono text-teal-200 font-bold">{result.modelArchitecture}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Latency: {result.latencyMs}ms (Edge NPU)</span>
          </span>
          <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 font-bold rounded border border-amber-400/40 text-[10px]">
            DEMO AI RESULTS
          </span>
        </div>
      </div>

      {/* Main Diagnosis Card */}
      <div
        className={`p-6 rounded-2xl border-2 transition-all ${
          result.predictedGrade === 0
            ? 'bg-emerald-50/70 border-emerald-500'
            : result.predictedGrade === 1
            ? 'bg-sky-50/70 border-sky-500'
            : result.predictedGrade === 2
            ? 'bg-amber-50/70 border-amber-500'
            : result.predictedGrade === 3
            ? 'bg-orange-50/70 border-orange-500'
            : 'bg-red-50/70 border-red-500'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg border ${sevInfo.badgeBg}`}>
                ICDR Scale {sevInfo.shortCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">Risk: {sevInfo.riskLevel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{sevInfo.name}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{sevInfo.icdrDefinition}</p>
          </div>

          {/* Big Confidence Pill */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex-shrink-0 min-w-[130px]">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Confidence</span>
            <span className="text-3xl font-black text-teal-700 font-mono">{result.confidence}%</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Top-1 Class Match</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution & Detected Lesions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: 5-Class Probabilities Bar Chart */}
        <div className="md:col-span-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Full ICDR Class Probabilities</span>
            </h4>
            <span className="text-[10px] text-slate-400">Softmax Distribution</span>
          </div>

          <div className="space-y-2 pt-1">
            {result.classProbabilities.map((prob) => {
              const isSelected = prob.grade === result.predictedGrade;
              return (
                <div key={prob.grade} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-semibold ${isSelected ? 'text-teal-900 font-bold' : 'text-slate-600'}`}>
                      {prob.label}
                    </span>
                    <span className="font-mono text-slate-700 font-bold">{prob.probability.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isSelected
                          ? prob.grade === 4
                            ? 'bg-red-500'
                            : prob.grade === 3
                            ? 'bg-orange-500'
                            : prob.grade === 2
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(2, prob.probability)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detected Retinal Lesions Checklist */}
        <div className="md:col-span-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Biomarker & Lesion Detection</span>
            </h4>
            <span className="text-[10px] text-slate-400">Feature Activation</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Microaneurysms</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.microaneurysms > 0 ? (
                  <span className="text-amber-700">{result.lesions.microaneurysms} count</span>
                ) : (
                  <span className="text-emerald-700">None detected</span>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Blot Hemorrhages</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.hemorrhages > 0 ? (
                  <span className="text-orange-700">{result.lesions.hemorrhages} count</span>
                ) : (
                  <span className="text-emerald-700">None detected</span>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Hard Lipid Exudates</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.hardExudates ? (
                  <span className="text-amber-600">Present (Circinate)</span>
                ) : (
                  <span className="text-slate-400">Absent</span>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Cotton Wool Spots</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.cottonWoolSpots ? (
                  <span className="text-orange-600">Present (Ischemia)</span>
                ) : (
                  <span className="text-slate-400">Absent</span>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Venous Beading (4-2-1)</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.venousBeading ? (
                  <span className="text-red-600">Present (Severe)</span>
                ) : (
                  <span className="text-slate-400">Absent</span>
                )}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Neovascularization</span>
              <span className="font-bold text-slate-900 text-sm mt-1">
                {result.lesions.neovascularization ? (
                  <span className="text-red-700 font-black animate-pulse">ACTIVE (PDR)</span>
                ) : (
                  <span className="text-slate-400">Absent</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Narrative Summary */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
          Automated Clinical Narrative:
        </span>
        <p className="text-slate-700 leading-relaxed">{result.clinicalSummary}</p>
      </div>
    </div>
  );
};
