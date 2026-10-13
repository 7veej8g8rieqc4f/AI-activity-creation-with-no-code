import React, { useState } from 'react';
import {
  Download,
  Code2,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Sliders,
  FileCode,
  FileSpreadsheet,
  PackageCheck,
} from 'lucide-react';
import { QuizConfig } from '../types/quiz';
import { LiveQuizPlayer } from './LiveQuizPlayer';

interface PreviewStepProps {
  config: QuizConfig;
  onDownloadZip: () => void;
  onOpenCodeModal: () => void;
  onBackToCustomize: () => void;
  isDownloading: boolean;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  config,
  onDownloadZip,
  onOpenCodeModal,
  onBackToCustomize,
  isDownloading,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  const handleResetPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner & ZIP Download CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Step 3: Test & Export
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interactive Quiz Preview & Standalone Export
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Test your quiz directly below. When ready, click <strong>Download ZIP</strong> to package the self-contained
              <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded mx-1">index.html</code>,
              <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded mx-1">style.css</code>,
              <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded mx-1">script.js</code>, and
              <code className="text-purple-400 bg-slate-900 px-1 py-0.5 rounded mx-1">README.md</code>.
            </p>
          </div>

          {/* Prominent ZIP Download Button Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenCodeModal}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm font-semibold transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Inspect Code</span>
            </button>

            <button
              onClick={onDownloadZip}
              disabled={isDownloading || config.questions.length === 0}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Packaging ZIP...' : 'Download ZIP Bundle'}</span>
            </button>
          </div>
        </div>

        {/* Included Files Chips */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <PackageCheck className="w-4 h-4 text-emerald-400" /> Package includes:
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            📄 index.html
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            🎨 style.css
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            ⚡ script.js
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            📖 README.md
          </span>
          <span className="text-slate-500 ml-auto hidden md:inline">
            100% Client-Side • Zero Backend Required • Double-Click to Run
          </span>
        </div>
      </div>

      {/* Preview Device Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Device Viewport:</span>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (390px)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPreview}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
            title="Reset Quiz State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Test</span>
          </button>

          <button
            onClick={onBackToCustomize}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Styles</span>
          </button>
        </div>
      </div>

      {/* DEVICE FRAME WRAPPER */}
      <div className="flex justify-center items-center py-4">
        <div
          className={`w-full transition-all duration-300 ${
            deviceMode === 'mobile'
              ? 'max-w-[400px] border-4 border-slate-700 rounded-[36px] p-2 shadow-2xl bg-slate-950'
              : deviceMode === 'tablet'
              ? 'max-w-[768px] border-4 border-slate-700 rounded-[28px] p-2 shadow-2xl bg-slate-950'
              : 'max-w-4xl'
          }`}
        >
          {deviceMode !== 'desktop' && (
            <div className="w-full flex justify-center py-1">
              <div className="w-20 h-1.5 bg-slate-700 rounded-full" />
            </div>
          )}

          <div className="rounded-2xl overflow-hidden">
            <LiveQuizPlayer key={previewKey} config={config} />
          </div>

          {deviceMode !== 'desktop' && (
            <div className="w-full flex justify-center py-1">
              <div className="w-28 h-1 bg-slate-700 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
