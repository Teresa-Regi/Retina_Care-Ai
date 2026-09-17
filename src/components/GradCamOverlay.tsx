import React, { useState } from 'react';
import { Eye, Layers, Sparkles, HelpCircle, Flame, Check } from 'lucide-react';
import { AIScreeningResult, AttentionHotspot } from '../types/screening';

interface GradCamOverlayProps {
  baseImageSrc: string;
  screeningResult: AIScreeningResult;
}

export const GradCamOverlay: React.FC<GradCamOverlayProps> = ({ baseImageSrc, screeningResult }) => {
  const [opacity, setOpacity] = useState<number>(65); // 0 to 100%
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<AttentionHotspot | null>(
    screeningResult.attentionHotspots[0] || null
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Explainable AI: Grad-CAM Activation Heatmap</h3>
            <p className="text-xs text-slate-500">
              Visualizes neural network attention weights directly over retinal microvascular lesions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showMarkers
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {showMarkers ? 'Hide ROI Markers' : 'Show ROI Markers'}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Heatmap Viewer + Clinical Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Canvas Overlay */}
        <div className="md:col-span-6 flex flex-col items-center space-y-3">
          <div className="relative aspect-square w-full max-w-[340px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 shadow-xl flex items-center justify-center select-none">
            {/* Base preprocessed retinal image */}
            <img
              src={baseImageSrc}
              alt="Retinal Base"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Heatmap overlay with reactive opacity */}
            <img
              src={screeningResult.gradCamHeatmapUrl}
              alt="Grad-CAM Heatmap"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150"
              style={{ opacity: opacity / 100 }}
            />

            {/* Interactive Anatomical ROI Markers */}
            {showMarkers &&
              screeningResult.attentionHotspots.map((spot, idx) => {
                const isSelected = selectedHotspot?.label === spot.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedHotspot(spot)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-125 z-10 flex items-center justify-center ${
                      isSelected ? 'scale-120 ring-4 ring-white shadow-lg' : ''
                    }`}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${Math.max(28, spot.radius * 2.2)}px`,
                      height: `${Math.max(28, spot.radius * 2.2)}px`,
                      border: `2px dashed ${
                        spot.significance === 'Critical'
                          ? '#ef4444'
                          : spot.significance === 'High'
                          ? '#f97316'
                          : '#eab308'
                      }`,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                    }}
                    title={spot.label}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs"></span>
                  </button>
                );
              })}

            {/* Lens border overlay */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-teal-500/20"></div>
          </div>

          {/* Opacity Slider */}
          <div className="w-full max-w-[340px] space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Heatmap Blending:</span>
              <span className="font-mono text-teal-700 font-bold">{opacity}% Overlay</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Raw Fundus)</span>
              <span>100% (Pure Heatmap)</span>
            </div>
          </div>

          {/* Colormap Colorbar Legend */}
          <div className="w-full max-w-[340px] flex items-center gap-2 text-[10px] text-slate-500">
            <span>Low</span>
            <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600 shadow-inner"></div>
            <span>High Activation</span>
          </div>
        </div>

        {/* Right Column: Hotspot Explanations & Model Interpretability */}
        <div className="md:col-span-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Attention Hotspots Breakdown ({screeningResult.attentionHotspots.length})</span>
            </h4>

            <div className="space-y-1.5">
              {screeningResult.attentionHotspots.map((spot, idx) => {
                const isSelected = selectedHotspot?.label === spot.label;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedHotspot(spot)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-white border-teal-600 shadow-sm ring-1 ring-teal-500/20'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          spot.significance === 'Critical'
                            ? 'bg-red-500'
                            : spot.significance === 'High'
                            ? 'bg-orange-500'
                            : spot.significance === 'Moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span className="font-semibold text-slate-800">{spot.label}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                      {spot.significance}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Hotspot Detailed Insight */}
          {selectedHotspot && (
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Feature Interpretation: {selectedHotspot.label}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                The top convolutional layers of MobileNetV3/EfficientNet-B0 placed primary feature weighting in this ROI due to high local gradient variance corresponding to microvascular permeability, lipid deposition, or active vessel proliferation.
              </p>
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed italic">
            * Grad-CAM generates coarse localization maps highlighting the discriminative regions in the retinal image used by the network for its prediction.
          </div>
        </div>
      </div>
    </div>
  );
};
