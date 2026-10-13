/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuizConfig } from './types/quiz';
import { DEFAULT_DESIGN } from './utils/themePresets';
import { QUIZ_TEMPLATES } from './utils/templates';
import { downloadQuizZip } from './utils/zipGenerator';
import { Navbar } from './components/Navbar';
import { CreateStep } from './components/CreateStep';
import { CustomizeStep } from './components/CustomizeStep';
import { PreviewStep } from './components/PreviewStep';
import { CodeExportModal } from './components/CodeExportModal';
import { CheckCircle2, Download, Sparkles } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);

  // Initialize config with the first rich template
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(() => {
    const defaultTemplate = QUIZ_TEMPLATES[0];
    return {
      title: defaultTemplate.name,
      description: defaultTemplate.description,
      questionType: defaultTemplate.type,
      targetQuestionCount: defaultTemplate.questions.length,
      questions: JSON.parse(JSON.stringify(defaultTemplate.questions)),
      design: { ...DEFAULT_DESIGN },
    };
  });

  // Handle ZIP Download
  const handleDownloadZip = async () => {
    if (quizConfig.questions.length === 0) return;
    try {
      setIsDownloading(true);
      const safeTitle = (quizConfig.title || 'custom-quiz')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const filename = `${safeTitle || 'quiz'}-bundle.zip`;

      await downloadQuizZip(quizConfig, filename);

      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 4500);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        onSetStep={setCurrentStep}
        config={quizConfig}
        onDownloadZip={handleDownloadZip}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        isDownloading={isDownloading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <CreateStep
            config={quizConfig}
            onChangeConfig={setQuizConfig}
            onProceedToCustomize={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <CustomizeStep
            design={quizConfig.design}
            onChangeDesign={(newDesign) => setQuizConfig({ ...quizConfig, design: newDesign })}
            onProceedToPreview={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <PreviewStep
            config={quizConfig}
            onDownloadZip={handleDownloadZip}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            onBackToCustomize={() => setCurrentStep(2)}
            isDownloading={isDownloading}
          />
        )}
      </main>

      {/* Download Success Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">ZIP Bundle Downloaded!</h4>
            <p className="text-xs text-slate-300">Extract the files and double-click index.html to run.</p>
          </div>
        </div>
      )}

      {/* Code Inspector Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        config={quizConfig}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Custom Quiz Generator</span>
            <span>•</span>
            <span>Supports True/False, MCQ, Fill in the Blanks & Matching</span>
          </div>
          <div>
            <span>Generated packages are 100% self-contained vanilla HTML/CSS/JS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
