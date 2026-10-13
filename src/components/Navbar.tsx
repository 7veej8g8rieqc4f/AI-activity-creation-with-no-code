import React from 'react';
import { Download, Code2, Sparkles, CheckCircle2, Sliders, PlayCircle } from 'lucide-react';
import { QuizConfig } from '../types/quiz';

interface NavbarProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  config: QuizConfig;
  onDownloadZip: () => void;
  onOpenCodeModal: () => void;
  isDownloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onSetStep,
  config,
  onDownloadZip,
  onOpenCodeModal,
  isDownloading,
}) => {
  const steps = [
    { num: 1, label: 'Create', icon: Sparkles, detail: `${config.questions.length} Qs` },
    { num: 2, label: 'Customize', icon: Sliders, detail: config.design.themePreset },
    { num: 3, label: 'Preview & Download', icon: PlayCircle, detail: 'Live' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">Custom Quiz Generator</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Generate, Customize & Download Standalone ZIP</p>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => onSetStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.num}
                </span>
                <span className="hidden md:inline">{s.label}</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">({s.detail})</span>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-all cursor-pointer"
            title="Inspect generated files code"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">View Code</span>
          </button>

          <button
            onClick={onDownloadZip}
            disabled={isDownloading || config.questions.length === 0}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            title="Download complete quiz as standalone ZIP bundle"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Packaging...' : 'Download ZIP'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
