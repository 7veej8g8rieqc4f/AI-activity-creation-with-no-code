import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Split,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  QuizConfig,
  QuestionType,
  QuizQuestion,
  MCQQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  MatchingPair,
} from '../types/quiz';
import { parseRawQuestions, validateQuestions, generateId } from '../utils/parser';
import { QUIZ_TEMPLATES } from '../utils/templates';

interface CreateStepProps {
  config: QuizConfig;
  onChangeConfig: (newConfig: QuizConfig) => void;
  onProceedToCustomize: () => void;
}

export const CreateStep: React.FC<CreateStepProps> = ({
  config,
  onChangeConfig,
  onProceedToCustomize,
}) => {
  const [rawText, setRawText] = useState<string>(() => {
    // Default initial text from the first template
    return QUIZ_TEMPLATES[0].rawText;
  });
  const [selectedType, setSelectedType] = useState<QuestionType | 'mixed'>(config.questionType);
  const [selectedCount, setSelectedCount] = useState<number>(config.targetQuestionCount || 5);
  const [customCountInput, setCustomCountInput] = useState<string>('5');
  const [showFormatGuide, setShowFormatGuide] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'editor'>('paste');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>(() => validateQuestions(config.questions));

  // Quick count preset options
  const countPresets = [1, 2, 3, 4, 5, 10, 20];

  // Process and Generate questions from raw text
  const handleGenerateQuestions = () => {
    if (!rawText.trim()) {
      setValidationResult({
        valid: false,
        errors: ['Please paste or type your questions in the textarea above before generating.'],
        warnings: [],
      });
      return;
    }

    let parsed = parseRawQuestions(rawText, selectedType);

    if (parsed.length === 0) {
      setValidationResult({
        valid: false,
        errors: ['Unable to parse any questions from the provided text. Please check the format guide below.'],
        warnings: [],
      });
      return;
    }

    // Slice to selected count if parsed has more, or pad if needed
    if (selectedCount > 0 && parsed.length > selectedCount) {
      parsed = parsed.slice(0, selectedCount);
    }

    const validation = validateQuestions(parsed);
    setValidationResult(validation);

    onChangeConfig({
      ...config,
      questionType: selectedType,
      targetQuestionCount: selectedCount,
      questions: parsed,
    });

    // Switch to visual editor tab so user can review/fine-tune
    setActiveTab('editor');
  };

  // Load a preset template
  const handleLoadTemplate = (templateId: string) => {
    const tpl = QUIZ_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setRawText(tpl.rawText);
    setSelectedType(tpl.type);
    setSelectedCount(tpl.questions.length);
    setCustomCountInput(String(tpl.questions.length));

    const validation = validateQuestions(tpl.questions);
    setValidationResult(validation);

    onChangeConfig({
      ...config,
      title: tpl.name,
      description: tpl.description,
      questionType: tpl.type,
      targetQuestionCount: tpl.questions.length,
      questions: JSON.parse(JSON.stringify(tpl.questions)),
    });
  };

  // Update a single question in the list
  const updateQuestion = (index: number, updated: QuizQuestion) => {
    const newQuestions = [...config.questions];
    newQuestions[index] = updated;
    const validation = validateQuestions(newQuestions);
    setValidationResult(validation);
    onChangeConfig({ ...config, questions: newQuestions });
  };

  // Delete question
  const deleteQuestion = (index: number) => {
    const newQuestions = config.questions.filter((_, i) => i !== index);
    const validation = validateQuestions(newQuestions);
    setValidationResult(validation);
    onChangeConfig({ ...config, questions: newQuestions });
  };

  // Duplicate question
  const duplicateQuestion = (index: number) => {
    const target = config.questions[index];
    const clone: QuizQuestion = {
      ...JSON.parse(JSON.stringify(target)),
      id: generateId(),
      title: target.title + ' (Copy)',
    };
    const newQuestions = [...config.questions];
    newQuestions.splice(index + 1, 0, clone);
    const validation = validateQuestions(newQuestions);
    setValidationResult(validation);
    onChangeConfig({ ...config, questions: newQuestions });
  };

  // Move question up/down
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.questions.length) return;
    const newQuestions = [...config.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    onChangeConfig({ ...config, questions: newQuestions });
  };

  // Add a new question manually
  const addNewQuestion = (type: QuestionType) => {
    let newQ: QuizQuestion;
    if (type === 'true-false') {
      newQ = {
        id: generateId(),
        type: 'true-false',
        title: 'New True or False Statement',
        correctAnswer: true,
        explanation: '',
        points: 1,
      };
    } else if (type === 'mcq') {
      newQ = {
        id: generateId(),
        type: 'mcq',
        title: 'New Multiple Choice Question',
        options: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        correctIndex: 0,
        explanation: '',
        points: 1,
      };
    } else if (type === 'fill-blank') {
      newQ = {
        id: generateId(),
        type: 'fill-blank',
        title: 'The answer to this question is ______.',
        correctAnswer: 'answer',
        acceptedAnswers: [],
        caseSensitive: false,
        explanation: '',
        points: 1,
      };
    } else {
      newQ = {
        id: generateId(),
        type: 'matching',
        title: 'Match the corresponding terms:',
        pairs: [
          { id: generateId(), left: 'Item A', right: 'Match A' },
          { id: generateId(), left: 'Item B', right: 'Match B' },
          { id: generateId(), left: 'Item C', right: 'Match C' },
        ],
        explanation: '',
        points: 3,
      };
    }

    const newQuestions = [...config.questions, newQ];
    const validation = validateQuestions(newQuestions);
    setValidationResult(validation);
    onChangeConfig({ ...config, questions: newQuestions });
    setActiveTab('editor');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Step 1: Questions & Input
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Your Quiz
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Paste or type your questions, select format & count, or load one of our ready templates.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
              <span className="block text-xl font-bold text-white">{config.questions.length}</span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Questions</span>
            </div>
            <button
              onClick={onProceedToCustomize}
              disabled={config.questions.length === 0 || !validationResult.valid}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span>Next: Customize</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quiz Metadata (Title & Description) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quiz Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
              placeholder="e.g., General Science Trivia Quiz"
              className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quiz Description / Instructions
            </label>
            <input
              type="text"
              value={config.description}
              onChange={(e) => onChangeConfig({ ...config, description: e.target.value })}
              placeholder="e.g., Test your knowledge across astronomy, biology and physics."
              className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Quick Load Templates */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Instant Preset Templates (Click to try):
          </label>
          <div className="flex flex-wrap gap-2">
            {QUIZ_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleLoadTemplate(tpl.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Paste/Input Area vs Interactive Question Editor */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Paste & Generate Questions</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>2. Interactive Question Editor ({config.questions.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowFormatGuide(!showFormatGuide)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Format Help</span>
        </button>
      </div>

      {/* Format Help Drawer/Box */}
      {showFormatGuide && (
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 text-sm text-slate-300 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Recognized Question Formats Guide
            </h4>
            <button
              onClick={() => setShowFormatGuide(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-blue-400 block font-sans">Multiple Choice (MCQ):</strong>
              <div className="text-slate-400">
                1. What is the powerhouse of the cell?<br />
                A) Nucleus<br />
                B) Mitochondria *<br />
                C) Ribosome<br />
                Explanation: Mitochondria make ATP.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-sans">True / False:</strong>
              <div className="text-slate-400">
                1. The Earth is flat. (False)<br />
                2. Water boils at 100°C. (True)<br />
                Explanation: Under standard atmospheric pressure.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-sans">Fill in the Blanks:</strong>
              <div className="text-slate-400">
                1. The capital of France is [Paris].<br />
                2. The chemical formula for water is [H2O].<br />
                (Use brackets [answer] or "___ with Answer: XYZ")
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-purple-400 block font-sans">Matching:</strong>
              <div className="text-slate-400">
                France - Paris<br />
                Japan - Tokyo<br />
                Italy - Rome<br />
                (Use hyphen '-' or arrow '-&gt;' between pairs)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Feedback Messages */}
      {(!validationResult.valid || validationResult.warnings.length > 0) && (
        <div className="space-y-2">
          {validationResult.errors.map((err, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          {validationResult.warnings.map((warn, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 1: PASTE & GENERATE CONTROLS */}
      {activeTab === 'paste' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Format Selection & Number of Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Question Type
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as QuestionType | 'mixed')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="mcq">Multiple Choice Questions (MCQ)</option>
                    <option value="true-false">True / False</option>
                    <option value="fill-blank">Fill in the Blanks</option>
                    <option value="matching">Matching Pairs</option>
                    <option value="mixed">Mixed (All Formats Together)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Choose the primary format you wish to generate or test.
                </p>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {countPresets.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setSelectedCount(cnt);
                        setCustomCountInput(String(cnt));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCount === cnt
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-slate-400">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customCountInput}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCustomCountInput(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setSelectedCount(val);
                        }
                      }}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target number of questions to include in the generated quiz.
                </p>
              </div>
            </div>

            {/* Questions Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Enter or Paste Questions Below:
                </label>
                <button
                  type="button"
                  onClick={() => setRawText('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear Text
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                placeholder="Paste your questions here...&#10;&#10;Example:&#10;1. What is the capital of Japan?&#10;A) Seoul&#10;B) Tokyo *&#10;C) Beijing&#10;Explanation: Tokyo has been Japan's capital since 1868."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600 leading-relaxed resize-y"
              />
            </div>

            {/* Generate Quiz Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-400">
                Automatic parsing detects options, answers, matching pairs, and explanations.
              </span>
              <button
                type="button"
                onClick={handleGenerateQuestions}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUESTION LIST & EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Active Questions:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                {config.questions.length} Items
              </span>
            </div>

            {/* Add New Question Dropdown/Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Add New:</span>
              <button
                onClick={() => addNewQuestion('mcq')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-blue-400" /> MCQ
              </button>
              <button
                onClick={() => addNewQuestion('true-false')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-400" /> True/False
              </button>
              <button
                onClick={() => addNewQuestion('fill-blank')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-400" /> Fill Blank
              </button>
              <button
                onClick={() => addNewQuestion('matching')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-purple-400" /> Matching
              </button>
            </div>
          </div>

          {config.questions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm mb-4">No questions added yet.</p>
              <button
                onClick={() => setActiveTab('paste')}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Paste Questions or Load Template
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {config.questions.map((q, idx) => (
                <QuestionCardEditor
                  key={q.id || idx}
                  question={q}
                  index={idx}
                  total={config.questions.length}
                  onUpdate={(updated) => updateQuestion(idx, updated)}
                  onDelete={() => deleteQuestion(idx)}
                  onDuplicate={() => duplicateQuestion(idx)}
                  onMoveUp={() => moveQuestion(idx, 'up')}
                  onMoveDown={() => moveQuestion(idx, 'down')}
                />
              ))}
            </div>
          )}

          {/* Bottom Next Step Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('paste')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Back to Paste Area
            </button>
            <button
              onClick={onProceedToCustomize}
              disabled={config.questions.length === 0 || !validationResult.valid}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Next: Customize Design</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Subcomponent: Individual Question Editor Card
 */
interface QuestionCardEditorProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onUpdate: (updated: QuizQuestion) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QuestionCardEditor: React.FC<QuestionCardEditorProps> = ({
  question,
  index,
  total,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const typeBadges = {
    'mcq': { label: 'Multiple Choice', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    'true-false': { label: 'True / False', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'fill-blank': { label: 'Fill in Blank', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'matching': { label: 'Matching Pairs', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  };

  const badge = typeBadges[question.type];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700">
      {/* Question Header Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-xs text-slate-300 font-semibold truncate hidden sm:inline">
            {question.title || 'Untitled question'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Question Details Editor Body */}
      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Question Title / Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Question Title / Statement
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => onUpdate({ ...question, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type-Specific Answer Controls */}

          {/* 1. MCQ OPTIONS */}
          {question.type === 'mcq' && (
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Choices (Click radio to mark correct answer):
              </label>
              <div className="space-y-2">
                {question.options.map((opt, optIdx) => {
                  const isCorrect = question.correctIndex === optIdx;
                  return (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdate({ ...question, correctIndex: optIdx })}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                        }`}
                        title="Mark as correct answer"
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...question.options];
                          newOpts[optIdx] = e.target.value;
                          onUpdate({ ...question, options: newOpts });
                        }}
                        className={`flex-1 bg-slate-950 border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none ${
                          isCorrect ? 'border-emerald-500/70' : 'border-slate-700/80 focus:border-blue-500'
                        }`}
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = question.options.filter((_, i) => i !== optIdx);
                            let newCorrect = question.correctIndex;
                            if (newCorrect >= newOpts.length) newCorrect = newOpts.length - 1;
                            onUpdate({ ...question, options: newOpts, correctIndex: newCorrect });
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => {
                    const newOpts = [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`];
                    onUpdate({ ...question, options: newOpts });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Choice
                </button>
              )}
            </div>
          )}

          {/* 2. TRUE / FALSE CONTROLS */}
          {question.type === 'true-false' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Correct Answer:
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...question, correctAnswer: true })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                    question.correctAnswer === true
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ✓ TRUE
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...question, correctAnswer: false })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                    question.correctAnswer === false
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ✕ FALSE
                </button>
              </div>
            </div>
          )}

          {/* 3. FILL IN THE BLANKS CONTROLS */}
          {question.type === 'fill-blank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Expected Correct Answer:
                </label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
                  placeholder="e.g., Paris"
                  className="w-full bg-slate-950 border border-emerald-500/60 rounded-lg px-3.5 py-2 text-sm text-emerald-400 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Accepted Alternative Answers (comma-separated):
                </label>
                <input
                  type="text"
                  value={(question.acceptedAnswers || []).join(', ')}
                  onChange={(e) => {
                    const alts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    onUpdate({ ...question, acceptedAnswers: alts });
                  }}
                  placeholder="e.g., City of Light, Paris France"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* 4. MATCHING PAIRS CONTROLS */}
          {question.type === 'matching' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Pairs (Column A ➔ Column B):
              </label>
              <div className="space-y-2">
                {question.pairs.map((pair, pIdx) => (
                  <div key={pair.id || pIdx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono w-4">{pIdx + 1}.</span>
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...question.pairs];
                        newPairs[pIdx] = { ...pair, left: e.target.value };
                        onUpdate({ ...question, pairs: newPairs });
                      }}
                      placeholder="Column A Item"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500 text-xs font-bold">➔</span>
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...question.pairs];
                        newPairs[pIdx] = { ...pair, right: e.target.value };
                        onUpdate({ ...question, pairs: newPairs });
                      }}
                      placeholder="Column B Match"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    {question.pairs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPairs = question.pairs.filter((_, i) => i !== pIdx);
                          onUpdate({ ...question, pairs: newPairs, points: newPairs.length });
                        }}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Remove pair"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {question.pairs.length < 8 && (
                <button
                  type="button"
                  onClick={() => {
                    const newPairs = [
                      ...question.pairs,
                      { id: generateId(), left: `Item ${question.pairs.length + 1}`, right: `Match ${question.pairs.length + 1}` },
                    ];
                    onUpdate({ ...question, pairs: newPairs, points: newPairs.length });
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Pair
                </button>
              )}
            </div>
          )}

          {/* Explanation Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Explanation / Fact (Optional):
            </label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
              placeholder="e.g., Provide context shown during review."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
