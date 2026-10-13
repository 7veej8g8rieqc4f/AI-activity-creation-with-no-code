import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, FileText } from 'lucide-react';
import { QuizConfig } from '../types/quiz';
import { buildQuizFiles } from '../utils/zipGenerator';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QuizConfig;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  config,
  onDownloadZip,
  isDownloading,
}) => {
  const [activeFile, setActiveFile] = useState<'index.html' | 'style.css' | 'script.js' | 'README.md'>('index.html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files = buildQuizFiles(config);
  const currentContent = files[activeFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileTabs: Array<'index.html' | 'style.css' | 'script.js' | 'README.md'> = [
    'index.html',
    'style.css',
    'script.js',
    'README.md',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Generated Project Files Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Copy Bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {fileTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFile(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeFile === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy File'}</span>
            </button>

            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed selection:bg-blue-600/40">
          <pre className="whitespace-pre-wrap">{currentContent}</pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>This file is automatically packaged into your downloadable ZIP.</span>
          <span className="font-mono text-slate-500">{activeFile}</span>
        </div>
      </div>
    </div>
  );
};
