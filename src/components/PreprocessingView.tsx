import React, { useState, useEffect } from 'react';
import { Sliders, Layers, ArrowRight, ArrowLeft, RefreshCw, Eye, Sparkles, SplitSquareVertical } from 'lucide-react';
import { PreprocessingStages } from '../types/screening';
import { processAllStages } from '../utils/imageProcessing';

interface PreprocessingViewProps {
  imageSrc: string;
  stages: PreprocessingStages | null;
  setStages: (stages: PreprocessingStages) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PreprocessingView: React.FC<PreprocessingViewProps> = ({
  imageSrc,
  stages,
  setStages,
  onNext,
  onBack,
}) => {
  const [processing, setProcessing] = useState<boolean>(!stages);
  const [activeTab, setActiveTab] = useState<'clahe' | 'green' | 'circular' | 'original' | 'split'>('clahe');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage for split view

  useEffect(() => {
    let isMounted = true;
    async function executePipeline() {
      if (!stages && imageSrc) {
        setProcessing(true);
        try {
          const results = await processAllStages(imageSrc);
          if (isMounted) {
            setStages(results);
            setProcessing(false);
          }
        } catch (e) {
          console.error('Preprocessing failed', e);
          if (isMounted) setProcessing(false);
        }
      }
    }
    executePipeline();
    return () => {
      isMounted = false;
    };
  }, [imageSrc, stages, setStages]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: OpenCV Computer Vision Preprocessing</h2>
              <p className="text-xs text-slate-500">
                Multi-stage enhancement pipeline isolating retinal pathology before deep convolutional network inference.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>OpenCV Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Stage Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('clahe')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'clahe'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CLAHE Enhanced
            </button>
            <button
              onClick={() => setActiveTab('green')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'green'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Green-Channel
            </button>
            <button
              onClick={() => setActiveTab('circular')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'circular'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ben Graham Circular Crop
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'original'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Original RGB
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'split'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Comparison</span>
            </button>
          </div>

          <span className="text-xs text-slate-400">Resolution: 512×512 Standardized</span>
        </div>

        {/* Viewport & Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Visualizer */}
          <div className="md:col-span-7 flex flex-col items-center">
            {processing ? (
              <div className="aspect-square w-full max-w-[360px] rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-teal-400 gap-3 border border-slate-900 shadow-inner">
                <RefreshCw className="w-10 h-10 animate-spin" />
                <div className="text-xs font-bold tracking-wider uppercase text-white">Applying CLAHE & Masking...</div>
                <div className="text-[11px] text-slate-400">Equalizing 8×8 tiles with clip-limit 2.8</div>
              </div>
            ) : stages ? (
              <div className="relative aspect-square w-full max-w-[360px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 shadow-xl flex items-center justify-center">
                {activeTab === 'split' ? (
                  /* Interactive Split Slider */
                  <div className="relative w-full h-full select-none">
                    {/* Background: Original */}
                    <img
                      src={stages.original}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                    {/* Foreground: CLAHE clipped to slider position */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={stages.clahe}
                        alt="CLAHE"
                        className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                        style={{ width: '360px', height: '360px' }}
                      />
                    </div>
                    {/* Split line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                        ↔
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={
                      activeTab === 'clahe'
                        ? stages.clahe
                        : activeTab === 'green'
                        ? stages.greenChannel
                        : activeTab === 'circular'
                        ? stages.circularCrop
                        : stages.original
                    }
                    alt="Preprocessed Fundus"
                    className="w-full h-full object-contain transition-all duration-300"
                  />
                )}

                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono rounded">
                  {activeTab === 'clahe'
                    ? 'CV: CLAHE (clip=2.8, grid=8x8)'
                    : activeTab === 'green'
                    ? 'CV: Green Channel (540nm)'
                    : activeTab === 'circular'
                    ? 'CV: Ben Graham Mask (512x512)'
                    : activeTab === 'split'
                    ? `Split: CLAHE (${sliderPosition}%) | Original`
                    : 'Original RGB'}
                </div>
              </div>
            ) : null}

            {activeTab === 'split' && (
              <div className="w-full max-w-[360px] mt-4 space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Enhanced (CLAHE)</span>
                  <span>Original RGB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Right Column: Preprocessing Rationale & Mini-Thumbnails */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Clinical Preprocessing Objectives</span>
              </h4>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block text-emerald-700">
                    1. Green-Channel Extraction (540–570 nm)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Hemoglobin absorbs green wavelengths heavily, maximizing dark contrast of microaneurysms and hemorrhages.
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block text-sky-700">
                    2. Contrast Limited Adaptive Hist. Eq. (CLAHE)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Equalizes local 8×8 pixel blocks. The 2.8 clip limit prevents noise amplification in homogeneous choroidal zones.
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block text-indigo-700">
                    3. Ben Graham Circular Mask
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Eliminates camera border artifacts, standardizes image center, and normalizes aspect ratio for EfficientNet-B0.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Multi-Thumb Strip */}
            {stages && (
              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setActiveTab('green')}
                  className={`p-1.5 rounded-xl border cursor-pointer text-center transition-all ${
                    activeTab === 'green' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={stages.greenChannel} alt="Green" className="w-full aspect-square object-contain rounded-lg bg-black" />
                  <span className="text-[10px] font-semibold text-slate-700 mt-1 block">Green</span>
                </div>
                <div
                  onClick={() => setActiveTab('clahe')}
                  className={`p-1.5 rounded-xl border cursor-pointer text-center transition-all ${
                    activeTab === 'clahe' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={stages.clahe} alt="CLAHE" className="w-full aspect-square object-contain rounded-lg bg-black" />
                  <span className="text-[10px] font-semibold text-slate-700 mt-1 block">CLAHE</span>
                </div>
                <div
                  onClick={() => setActiveTab('circular')}
                  className={`p-1.5 rounded-xl border cursor-pointer text-center transition-all ${
                    activeTab === 'circular' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={stages.circularCrop} alt="Mask" className="w-full aspect-square object-contain rounded-lg bg-black" />
                  <span className="text-[10px] font-semibold text-slate-700 mt-1 block">Masked</span>
                </div>
              </div>
            )}
          </div>
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
          <span>Back to Quality Check</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={processing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
            processing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 cursor-pointer'
          }`}
        >
          <span>Run AI Screening & Grad-CAM</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
