import React from 'react';
import { User, Camera, CheckCircle, Sliders, Cpu, FileText } from 'lucide-react';
import { AppStep } from '../types/screening';

interface StepperProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  canNavigate: (step: AppStep) => boolean;
}

interface StepItem {
  id: AppStep;
  label: string;
  icon: React.ReactNode;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, setStep, canNavigate }) => {
  const steps: StepItem[] = [
    { id: 'patient', label: 'Patient Info', icon: <User className="w-4 h-4" /> },
    { id: 'image', label: 'Fundus Image', icon: <Camera className="w-4 h-4" /> },
    { id: 'quality', label: 'Quality Check', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'preprocess', label: 'CV Preprocess', icon: <Sliders className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Screening', icon: <Cpu className="w-4 h-4" /> },
    { id: 'report', label: 'Clinical Report', icon: <FileText className="w-4 h-4" /> },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-xs overflow-x-auto">
      <div className="max-w-5xl mx-auto flex items-center justify-between min-w-[580px]">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isPassed = idx < currentIndex;
          const isClickable = canNavigate(step.id);

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    idx <= currentIndex ? 'bg-teal-500' : 'bg-slate-200'
                  }`}
                />
              )}
              <button
                onClick={() => isClickable && setStep(step.id)}
                disabled={!isClickable}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                    : isPassed
                    ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer'
                    : 'text-slate-400 bg-slate-50 cursor-not-allowed'
                }`}
              >
                <span className={isActive ? 'text-teal-200' : isPassed ? 'text-teal-600' : 'text-slate-400'}>
                  {step.icon}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
