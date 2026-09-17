import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Clinical Notice:</strong> AI screening support only — final diagnosis must be done by a qualified ophthalmologist.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl text-slate-700 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <span>MANDATORY CLINICAL & REGULATORY NOTICE</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-white rounded-full border border-amber-300 text-amber-800">
              <ShieldCheck className="w-3 h-3 text-amber-600" /> SIH Demo Prototype
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong>RetinaCare AI</strong> is an automated triage decision-support tool powered by deep learning
            (MobileNetV3 / EfficientNet-B0 architecture). It is intended for early community tele-screening prioritization.
            <span className="text-amber-950 font-semibold block mt-1">
              "AI screening support only — final diagnosis and treatment planning must be performed by a certified ophthalmologist or retinal specialist."
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
