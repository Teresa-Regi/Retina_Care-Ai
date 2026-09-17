import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { ImageQualityAssessment } from '../types/screening';
import { assessImageQuality } from '../utils/imageProcessing';

interface QualityCheckProps {
  imageSrc: string;
  quality: ImageQualityAssessment | null;
  setQuality: (quality: ImageQualityAssessment) => void;
  onNext: () => void;
  onBack: () => void;
  onRetake: () => void;
}

export const QualityCheck: React.FC<QualityCheckProps> = ({
  imageSrc,
  quality,
  setQuality,
  onNext,
  onBack,
  onRetake,
}) => {
  const [analyzing, setAnalyzing] = useState<boolean>(!quality);

  useEffect(() => {
    let isMounted = true;
    async function runIQA() {
      if (!quality && imageSrc) {
        setAnalyzing(true);
        try {
          const result = await assessImageQuality(imageSrc);
          if (isMounted) {
            setQuality(result);
            setAnalyzing(false);
          }
        } catch (e) {
          console.error('IQA failed', e);
          if (isMounted) setAnalyzing(false);
        }
      }
    }
    runIQA();
    return () => {
      isMounted = false;
    };
  }, [imageSrc, quality, setQuality]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    const result = await assessImageQuality(imageSrc);
    setQuality(result);
    setAnalyzing(false);
  };

  const getStatusBadge = (status: 'Pass' | 'Warning' | 'Fail') => {
    switch (status) {
      case 'Pass':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Optimal Quality — Pass for Screening</span>
          </div>
        );
      case 'Warning':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Borderline Quality — Caution Recommended</span>
          </div>
        );
      case 'Fail':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-bold">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Poor Image Quality — Retake Recommended</span>
          </div>
        );
    }
  };

  const renderMetricBar = (label: string, score: number, desc: string) => {
    const isGood = score >= 75;
    const isMedium = score >= 55 && score < 75;

    return (
      <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">{label}</span>
          <span className={`font-mono font-bold ${isGood ? 'text-emerald-600' : isMedium ? 'text-amber-600' : 'text-red-600'}`}>
            {score}/100
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isGood ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Retinal Image Quality Assessment (IQA)</h2>
              <p className="text-xs text-slate-500">Automated pre-flight check to verify optical sharpness, illumination, and retinal aperture.</p>
            </div>
          </div>
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-teal-600' : ''}`} />
            <span>Re-evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Fundus Inspection + Metric Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image with Reticle */}
        <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="relative aspect-square w-full max-w-[280px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 shadow-inner flex items-center justify-center">
            <img src={imageSrc} alt="Inspection Fundus" className="w-full h-full object-contain" />
            {analyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-teal-400 gap-2">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold tracking-wider uppercase text-white">Running IQA Filters...</span>
              </div>
            )}
            {/* Overlay grid */}
            <div className="absolute inset-0 pointer-events-none border border-teal-500/20 rounded-2xl"></div>
          </div>
          <div className="text-center text-xs text-slate-500">
            Field of View: <strong>45° Circular Aperture</strong>
          </div>
        </div>

        {/* Right Column: Detailed Diagnostics */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Quality Assessment Verdict</span>
              <div className="mt-1">
                {quality ? getStatusBadge(quality.overall) : <div className="text-xs text-slate-400">Evaluating...</div>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Aggregate Index</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {quality
                  ? Math.round(
                      (quality.sharpnessScore +
                        quality.illuminationScore +
                        quality.contrastScore +
                        quality.fieldOfViewScore) /
                        4
                    )
                  : '--'}
                <span className="text-xs text-slate-400">/100</span>
              </span>
            </div>
          </div>

          {/* Metric Progress Bars */}
          {quality && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderMetricBar(
                'Focus & Sharpness',
                quality.sharpnessScore,
                'Laplacian high-frequency variance across vascular borders.'
              )}
              {renderMetricBar(
                'Illumination Uniformity',
                quality.illuminationScore,
                'Evaluation of choroidal exposure and absence of severe flare.'
              )}
              {renderMetricBar(
                'Lesion Contrast (RMS)',
                quality.contrastScore,
                'Microvascular lesion discrimination against retinal background.'
              )}
              {renderMetricBar(
                'Aperture Centration',
                quality.fieldOfViewScore,
                'Detection of complete macula and optic disc coverage.'
              )}
            </div>
          )}

          {/* Feedback Notes */}
          {quality && quality.feedbackMessages.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Pre-Flight Clinical Observations:</span>
              </div>
              <ul className="space-y-1 text-slate-600">
                {quality.feedbackMessages.map((msg, i) => (
                  <li key={i} className="text-[11px] leading-relaxed">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Image Capture</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Retake / Change Image
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={analyzing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
              analyzing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 cursor-pointer'
            }`}
          >
            <span>Proceed to CV Preprocessing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
