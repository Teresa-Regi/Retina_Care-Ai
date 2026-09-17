import React from 'react';
import { X, Cpu, Eye, Layers, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface TechSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechSpecsModal: React.FC<TechSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Cpu className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">RetinaCare AI — System Architecture</h3>
              <p className="text-xs text-teal-200">SIH Judge Technical & Engineering Specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Section 1: Deep Learning Backbone */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>AI Deep Learning Architecture: EfficientNet-B0 / MobileNetV3</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed specifically for edge deployment in rural primary health centres and mobile clinics with zero cloud reliance.
              Uses depthwise separable convolutions and squeeze-and-excitation optimization.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-teal-100">
                <span className="text-slate-400 block text-[10px]">BACKBONE</span>
                <span className="font-semibold text-slate-800">MobileNetV3-Small / EfficientNet-B0</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-teal-100">
                <span className="text-slate-400 block text-[10px]">INFERENCE SPEED</span>
                <span className="font-semibold text-teal-700">68–88 ms (Edge Client)</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-teal-100">
                <span className="text-slate-400 block text-[10px]">RESOLUTION</span>
                <span className="font-semibold text-slate-800">512×512 Standardized</span>
              </div>
            </div>
          </div>

          {/* Section 2: OpenCV Preprocessing Pipeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Three-Stage Computer Vision Preprocessing</span>
            </h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  1. Green Channel
                </div>
                <p className="text-[11px] text-slate-600">
                  Isolates hemoglobin absorption peak (540–570 nm) for maximal vessel and hemorrhage contrast.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  2. CLAHE Filter
                </div>
                <p className="text-[11px] text-slate-600">
                  8×8 adaptive histogram equalization with 2.8 clip limit; amplifies microaneurysms without noise blowout.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  3. Ben Graham Crop
                </div>
                <p className="text-[11px] text-slate-600">
                  Auto-detects retinal circle, crops black margins, normalizes aspect ratio and dynamic range.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Explainable AI & Grad-CAM */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Explainable AI: Gradient-Weighted Class Activation Mapping (Grad-CAM)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides clinician trust by computing gradients of the predicted class score with respect to feature maps of the final
              convolutional layer. Identifies exact pathological regions (hard exudates, neovascular fronds, blot hemorrhages).
            </p>
          </div>

          {/* Section 4: Clinical Standards */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Clinical Triage Guidelines</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span>Follows International Clinical Diabetic Retinopathy (ICDR) 5-stage scale (Grade 0–4).</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span>Grade 3 incorporates the American Academy of Ophthalmology 4-2-1 rule criteria.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span>100% Offline client-side execution; patient data never leaves the local device.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between items-center">
          <span className="text-xs text-slate-500">Smart India Hackathon (SIH) 2026 Project</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
