import React, { useState, useEffect } from 'react';
import { Eye, Wifi, WifiOff, History, Stethoscope, Cpu, Sparkles } from 'lucide-react';
import { DRGrade } from '../types/screening';

interface HeaderProps {
  activeTab: 'screening' | 'history';
  setActiveTab: (tab: 'screening' | 'history') => void;
  onSelectJudgeDemo: (grade: DRGrade) => void;
  onOpenTechSpecs: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectJudgeDemo,
  onOpenTechSpecs,
  historyCount,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-md shadow-teal-500/20">
            <Eye className="w-6 h-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                Retina<span className="text-teal-600">Care</span> <span className="text-xs px-1.5 py-0.5 font-bold bg-teal-100 text-teal-800 rounded">AI</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                <Sparkles className="w-3 h-3 text-teal-600" /> SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Diabetic Retinopathy Screening & Triage
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline/Online Status */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
            title={isOnline ? 'Internet connected. Local processing enabled.' : 'Operating in 100% Offline Mode. All models & data stored locally.'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>

          {/* Tech Specs Button */}
          <button
            onClick={onOpenTechSpecs}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="View system architecture and ML parameters"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Specs</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('screening')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'screening'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Screening</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-teal-600 text-white text-[10px] rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Judge Presets Bar (Sticky SIH Demo Selector) */}
      <div className="bg-slate-900 text-white px-4 py-1.5 border-t border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-300 font-bold rounded text-[10px] uppercase tracking-wider border border-teal-500/40">
              Judge Presets
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">1-Click ICDR Demo:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            <button
              onClick={() => onSelectJudgeDemo(0)}
              className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 font-medium text-[11px] whitespace-nowrap transition-colors"
            >
              Grade 0 (Normal)
            </button>
            <button
              onClick={() => onSelectJudgeDemo(1)}
              className="px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-700/60 font-medium text-[11px] whitespace-nowrap transition-colors"
            >
              Grade 1 (Mild)
            </button>
            <button
              onClick={() => onSelectJudgeDemo(2)}
              className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-700/60 font-medium text-[11px] whitespace-nowrap transition-colors"
            >
              Grade 2 (Mod)
            </button>
            <button
              onClick={() => onSelectJudgeDemo(3)}
              className="px-2.5 py-1 rounded bg-orange-950/80 hover:bg-orange-800 text-orange-300 border border-orange-700/60 font-medium text-[11px] whitespace-nowrap transition-colors"
            >
              Grade 3 (Severe)
            </button>
            <button
              onClick={() => onSelectJudgeDemo(4)}
              className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-800 text-red-300 border border-red-700/60 font-medium text-[11px] whitespace-nowrap transition-colors animate-pulse-subtle"
            >
              Grade 4 (PDR Urgent)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
