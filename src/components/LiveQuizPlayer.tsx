import React, { useState, useEffect, useRef } from 'react';
import {
  QuizConfig,
  QuizQuestion,
  MCQQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  MatchingQuestion,
} from '../types/quiz';
import { soundPlayer } from '../utils/audio';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowLeft,
  ArrowRight,
  Award,
  Sparkles,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';

interface LiveQuizPlayerProps {
  config: QuizConfig;
  onRestart?: () => void;
}

export const LiveQuizPlayer: React.FC<LiveQuizPlayerProps> = ({ config }) => {
  const { questions, design, title, description } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [matchingState, setMatchingState] = useState<Record<number, { activeLeft: string | null; pairs: Record<string, string> }>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(design.timePerQuestionSeconds || 30);
  const [showReview, setShowReview] = useState(false);

  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sound player settings sync
  useEffect(() => {
    soundPlayer.enabled = design.enableSounds;
  }, [design.enableSounds]);

  // Timer countdown
  useEffect(() => {
    if (!design.enableTimer || isSubmitted) return;
    setTimeLeft(design.timePerQuestionSeconds || 30);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextOrSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, design.enableTimer, isSubmitted]);

  // Restart quiz
  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setMatchingState({});
    setIsSubmitted(false);
    setShowReview(false);
    setTimeLeft(design.timePerQuestionSeconds || 30);
  };

  const currentQ = questions[currentIndex];

  // Answer Evaluation Engine
  const checkAnswer = (q: QuizQuestion, userAns: any): boolean => {
    if (userAns === undefined || userAns === null || userAns === '') return false;

    if (q.type === 'true-false') {
      return userAns === q.correctAnswer;
    } else if (q.type === 'mcq') {
      return userAns === q.correctIndex;
    } else if (q.type === 'fill-blank') {
      const trimmed = String(userAns).trim().toLowerCase();
      const expected = String(q.correctAnswer).trim().toLowerCase();
      if (trimmed === expected) return true;
      if (q.acceptedAnswers && Array.isArray(q.acceptedAnswers)) {
        return q.acceptedAnswers.some((a) => String(a).trim().toLowerCase() === trimmed);
      }
      return false;
    } else if (q.type === 'matching') {
      if (typeof userAns !== 'object') return false;
      return q.pairs.every((p) => userAns[p.left] === p.right);
    }
    return false;
  };

  // Score calculation
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (checkAnswer(q, userAnswers[idx])) {
        score++;
      }
    });
    return score;
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const percent = Math.round((score / questions.length) * 100);

    if (percent >= 60) {
      soundPlayer.playFanfare();
      triggerConfetti();
    } else {
      soundPlayer.playIncorrect();
    }
  };

  // Confetti explosion
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
      });
    }

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.rotation += p.vr;
          p.life -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        frameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(frameId);
      }
    };
    render();
  };

  const handleNextOrSubmit = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        No questions generated yet. Please go to the Create step.
      </div>
    );
  }

  // Visual styling values derived from design
  const radiusMap = {
    none: '0px',
    sm: '6px',
    md: '12px',
    lg: '18px',
    xl: '24px',
  };
  const cardRadius = radiusMap[design.cardRadius] || '16px';

  const btnRadiusMap = {
    square: '0px',
    rounded: '8px',
    pill: '9999px',
  };
  const btnRadius = btnRadiusMap[design.buttonShape] || '8px';

  // Background styling
  let containerBgStyle: React.CSSProperties = {
    backgroundColor: design.solidColor,
  };
  if (design.backgroundType === 'gradient') {
    containerBgStyle = {
      background: `linear-gradient(${design.gradientAngle}deg, ${design.gradientFrom}, ${design.gradientTo})`,
    };
  } else if (design.backgroundType === 'imageUrl' || design.backgroundType === 'imageUpload') {
    const img = design.bgImageData || design.bgImageUrl;
    if (img) {
      containerBgStyle = {
        backgroundImage: `url('${img}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
  }

  // Answer selection handlers
  const handleSelectTF = (val: boolean) => {
    soundPlayer.playClick();
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: val }));
    if (design.instantFeedback) {
      if (val === (currentQ as TrueFalseQuestion).correctAnswer) {
        soundPlayer.playCorrect();
      } else {
        soundPlayer.playIncorrect();
      }
    }
  };

  const handleSelectMCQ = (optIdx: number) => {
    soundPlayer.playClick();
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
    if (design.instantFeedback) {
      if (optIdx === (currentQ as MCQQuestion).correctIndex) {
        soundPlayer.playCorrect();
      } else {
        soundPlayer.playIncorrect();
      }
    }
  };

  const handleInputFillBlank = (text: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: text }));
  };

  // Matching pair logic
  const currentMatching = matchingState[currentIndex] || { activeLeft: null, pairs: {} };

  const handleLeftMatchClick = (leftText: string) => {
    soundPlayer.playClick();
    setMatchingState((prev) => {
      const state = prev[currentIndex] || { activeLeft: null, pairs: {} };
      return {
        ...prev,
        [currentIndex]: {
          ...state,
          activeLeft: state.activeLeft === leftText ? null : leftText,
        },
      };
    });
  };

  const handleRightMatchClick = (rightText: string) => {
    soundPlayer.playClick();
    setMatchingState((prev) => {
      const state = prev[currentIndex] || { activeLeft: null, pairs: {} };
      const currentPairs = { ...state.pairs };

      if (state.activeLeft) {
        // Link left with right!
        currentPairs[state.activeLeft] = rightText;
        const updated = {
          ...prev,
          [currentIndex]: {
            activeLeft: null,
            pairs: currentPairs,
          },
        };
        setUserAnswers((ansPrev) => ({ ...ansPrev, [currentIndex]: currentPairs }));
        return updated;
      } else {
        // Unlink if already linked
        const existingLeft = Object.keys(currentPairs).find((l) => currentPairs[l] === rightText);
        if (existingLeft) {
          delete currentPairs[existingLeft];
          const updated = {
            ...prev,
            [currentIndex]: {
              ...state,
              pairs: currentPairs,
            },
          };
          setUserAnswers((ansPrev) => ({ ...ansPrev, [currentIndex]: currentPairs }));
          return updated;
        }
      }
      return prev;
    });
  };

  // Hover Effect CSS class
  const hoverClass = {
    lift: 'hover:-translate-y-0.5 hover:shadow-lg transition-all',
    glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all',
    scale: 'hover:scale-[1.02] transition-all',
    outline: 'hover:ring-2 hover:ring-blue-400 transition-all',
  }[design.buttonHoverEffect];

  const currentAnswer = userAnswers[currentIndex];
  const isCurrentAnswered = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <div
      style={containerBgStyle}
      className="relative min-h-[580px] p-4 sm:p-8 rounded-2xl flex flex-col justify-center items-center overflow-hidden transition-all duration-300 shadow-2xl"
    >
      {/* Dark overlay for legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: `rgba(0, 0, 0, ${design.bgOverlayOpacity / 100})` }}
      />

      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Main Quiz Container */}
      <div
        className="relative z-10 w-full mx-auto space-y-5"
        style={{
          maxWidth: design.cardMaxWidth || '720px',
          fontFamily: design.fontFamily,
          color: design.primaryTextColor,
        }}
      >
        {/* Quiz Header */}
        <div className={`space-y-2 ${design.alignment === 'center' ? 'text-center' : 'text-left'}`}>
          <div className={`flex items-center gap-3 ${design.alignment === 'center' ? 'justify-center' : 'justify-between'}`}>
            <span
              className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-white/20"
              style={{ color: design.accentColor, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              {config.questionType.toUpperCase()} QUIZ
            </span>

            {design.enableTimer && !isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: design.primaryTextColor }}>
            {title || 'Custom Quiz'}
          </h2>
          {description && (
            <p className="text-sm opacity-80" style={{ color: design.mutedTextColor }}>
              {description}
            </p>
          )}

          {/* Progress bar */}
          {!isSubmitted && (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold opacity-75">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Answered: {Object.keys(userAnswers).length} / {questions.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex) / questions.length) * 100}%`,
                    background: `linear-gradient(90deg, ${design.accentColor}, ${design.correctColor})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE QUESTION CARD */}
        {!isSubmitted ? (
          <div
            style={{
              backgroundColor: design.cardBgColor,
              color: design.cardTextColor,
              borderColor: design.cardBorderColor,
              borderRadius: cardRadius,
            }}
            className="border shadow-2xl backdrop-blur-md overflow-hidden transition-all"
          >
            {/* Card Content Inner */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 opacity-75">
                  {currentQ.type.replace('-', ' ')}
                </span>
                <span className="text-xs font-semibold" style={{ color: design.accentColor }}>
                  {currentQ.points || 1} Point{(currentQ.points || 1) > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question Prompt Heading */}
              <h3
                className={`text-lg sm:text-xl font-bold leading-relaxed ${
                  design.headingStyle === 'accent-bar'
                    ? 'border-l-4 pl-3.5'
                    : design.headingStyle === 'banner'
                    ? 'p-3 bg-white/5 rounded-lg border border-white/10'
                    : ''
                }`}
                style={{
                  borderLeftColor: design.headingStyle === 'accent-bar' ? design.accentColor : undefined,
                }}
              >
                {currentQ.title}
              </h3>

              {/* 1. TRUE / FALSE OPTIONS */}
              {currentQ.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-3">
                  {[true, false].map((tfVal) => {
                    const isSelected = currentAnswer === tfVal;
                    let extraBg = 'bg-white/5 border-white/15';
                    if (isSelected) {
                      extraBg = 'ring-2 border-transparent';
                    }

                    return (
                      <button
                        key={String(tfVal)}
                        onClick={() => handleSelectTF(tfVal)}
                        style={{
                          borderRadius: btnRadius,
                          backgroundColor: isSelected ? `${design.accentColor}33` : undefined,
                          borderColor: isSelected ? design.accentColor : undefined,
                        }}
                        className={`p-4 border font-bold text-base flex items-center justify-center gap-2 cursor-pointer ${extraBg} ${hoverClass}`}
                      >
                        <span className="text-sm opacity-60">[{tfVal ? 'T' : 'F'}]</span>
                        <span>{tfVal ? 'TRUE' : 'FALSE'}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. MCQ OPTIONS */}
              {currentQ.type === 'mcq' && (
                <div className="space-y-2.5">
                  {(currentQ as MCQQuestion).options.map((opt, optIdx) => {
                    const isSelected = currentAnswer === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectMCQ(optIdx)}
                        style={{
                          borderRadius: btnRadius,
                          backgroundColor: isSelected ? `${design.accentColor}25` : 'rgba(255, 255, 255, 0.04)',
                          borderColor: isSelected ? design.accentColor : design.cardBorderColor,
                        }}
                        className={`w-full p-3.5 sm:p-4 border text-left flex items-center gap-3 font-medium text-sm sm:text-base cursor-pointer transition-all ${hoverClass}`}
                      >
                        <span
                          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: isSelected ? design.accentColor : 'rgba(255, 255, 255, 0.1)',
                            color: isSelected ? '#ffffff' : undefined,
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. FILL IN THE BLANK */}
              {currentQ.type === 'fill-blank' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={currentAnswer || ''}
                    onChange={(e) => handleInputFillBlank(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNextOrSubmit();
                    }}
                    placeholder="Type your answer here..."
                    style={{
                      borderRadius: btnRadius,
                      borderColor: design.cardBorderColor,
                    }}
                    className="w-full p-4 bg-white/5 border text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-xs opacity-60">
                    Type the missing word or phrase. Press Enter or click Next to save.
                  </p>
                </div>
              )}

              {/* 4. MATCHING PAIRS */}
              {currentQ.type === 'matching' && (
                <div className="space-y-3">
                  <p className="text-xs opacity-75">
                    Click an item on the left, then click its match on the right:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Column A (Left) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-60">Column A</div>
                      {(currentQ as MatchingQuestion).pairs.map((p) => {
                        const pairedRight = currentMatching.pairs[p.left];
                        const isActive = currentMatching.activeLeft === p.left;
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleLeftMatchClick(p.left)}
                            style={{
                              borderRadius: btnRadius,
                              borderColor: isActive
                                ? design.accentColor
                                : pairedRight
                                ? design.correctColor
                                : design.cardBorderColor,
                              backgroundColor: isActive
                                ? `${design.accentColor}33`
                                : pairedRight
                                ? `${design.correctColor}22`
                                : 'rgba(255,255,255,0.04)',
                            }}
                            className={`p-3 border text-sm font-semibold flex items-center justify-between cursor-pointer transition-all ${hoverClass}`}
                          >
                            <span>{p.left}</span>
                            {pairedRight && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                                style={{ backgroundColor: design.correctColor }}
                              >
                                Linked
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Column B (Right) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-60">Column B</div>
                      {(currentQ as MatchingQuestion).pairs
                        .map((p) => p.right)
                        .sort()
                        .map((rightVal, rIdx) => {
                          const linkedLeft = Object.keys(currentMatching.pairs).find(
                            (l) => currentMatching.pairs[l] === rightVal
                          );
                          return (
                            <div
                              key={rIdx}
                              onClick={() => handleRightMatchClick(rightVal)}
                              style={{
                                borderRadius: btnRadius,
                                borderColor: linkedLeft ? design.correctColor : design.cardBorderColor,
                                backgroundColor: linkedLeft
                                  ? `${design.correctColor}22`
                                  : 'rgba(255,255,255,0.04)',
                              }}
                              className={`p-3 border text-sm font-medium flex items-center justify-between cursor-pointer transition-all ${hoverClass}`}
                            >
                              <span>{rightVal}</span>
                              {linkedLeft && (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                                  style={{ backgroundColor: design.accentColor }}
                                >
                                  ➔ {linkedLeft}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Instant feedback box */}
              {design.instantFeedback && isCurrentAnswered && (
                <div
                  style={{
                    borderRadius: btnRadius,
                    backgroundColor: checkAnswer(currentQ, currentAnswer)
                      ? `${design.correctColor}22`
                      : `${design.incorrectColor}22`,
                    borderColor: checkAnswer(currentQ, currentAnswer)
                      ? design.correctColor
                      : design.incorrectColor,
                  }}
                  className="p-3.5 border flex items-start gap-3 text-sm animate-fade-in"
                >
                  {checkAnswer(currentQ, currentAnswer) ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: design.correctColor }} />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0" style={{ color: design.incorrectColor }} />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {checkAnswer(currentQ, currentAnswer) ? 'Correct Answer!' : 'Not Quite!'}
                    </strong>
                    {currentQ.explanation && (
                      <p className="text-xs opacity-90 mt-0.5">{currentQ.explanation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Navigation */}
            <div
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{
                borderColor: design.cardBorderColor,
                backgroundColor: 'rgba(0,0,0,0.15)',
              }}
            >
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                style={{
                  backgroundColor: design.secondaryBtnBg,
                  color: design.secondaryBtnText,
                  borderRadius: btnRadius,
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${hoverClass}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    style={{
                      backgroundColor: design.primaryBtnBg,
                      color: design.primaryBtnText,
                      borderRadius: btnRadius,
                    }}
                    className={`px-5 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer ${hoverClass}`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    style={{
                      backgroundColor: design.correctColor,
                      color: '#ffffff',
                      borderRadius: btnRadius,
                    }}
                    className={`px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg ${hoverClass}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* RESULTS CARD VIEW */
          <div
            style={{
              backgroundColor: design.cardBgColor,
              color: design.cardTextColor,
              borderColor: design.cardBorderColor,
              borderRadius: cardRadius,
            }}
            className="border shadow-2xl backdrop-blur-md p-8 sm:p-10 text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Award className="w-4 h-4" />
              <span>QUIZ COMPLETED</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black">
              {Math.round((calculateScore() / questions.length) * 100) >= 80
                ? 'Outstanding Achievement! 🎉'
                : Math.round((calculateScore() / questions.length) * 100) >= 60
                ? 'Great Job! 👍'
                : 'Nice Effort! Keep Learning 💡'}
            </h3>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-xs uppercase tracking-wider opacity-60">Score</span>
                <span className="text-2xl font-black">{calculateScore()} / {questions.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-xs uppercase tracking-wider opacity-60">Accuracy</span>
                <span className="text-2xl font-black" style={{ color: design.accentColor }}>
                  {Math.round((calculateScore() / questions.length) * 100)}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-xs uppercase tracking-wider opacity-60">Grade</span>
                <span className="text-2xl font-black" style={{ color: design.correctColor }}>
                  {calculateScore() / questions.length >= 0.9 ? 'A+' : calculateScore() / questions.length >= 0.7 ? 'B' : 'C'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                style={{
                  backgroundColor: design.primaryBtnBg,
                  color: design.primaryBtnText,
                  borderRadius: btnRadius,
                }}
                className={`px-6 py-3 font-bold text-sm flex items-center gap-2 cursor-pointer ${hoverClass}`}
              >
                <RotateCcw className="w-4 h-4" />
                Restart Quiz
              </button>

              <button
                onClick={() => setShowReview(!showReview)}
                style={{
                  backgroundColor: design.secondaryBtnBg,
                  color: design.secondaryBtnText,
                  borderRadius: btnRadius,
                }}
                className={`px-5 py-3 font-semibold text-sm cursor-pointer ${hoverClass}`}
              >
                {showReview ? 'Hide Answers Review' : 'Review Questions & Answers'}
              </button>
            </div>

            {/* Detailed Review Breakdown */}
            {showReview && (
              <div className="pt-6 border-t border-white/10 text-left space-y-4">
                <h4 className="text-base font-bold">Detailed Review:</h4>
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const ans = userAnswers[idx];
                    const isCorrect = checkAnswer(q, ans);
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border bg-white/5 space-y-1.5 ${
                          isCorrect ? 'border-emerald-500/50' : 'border-red-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>#{idx + 1}. {q.title}</span>
                          <span style={{ color: isCorrect ? design.correctColor : design.incorrectColor }}>
                            {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                          </span>
                        </div>
                        <div className="text-xs opacity-75">
                          {q.type === 'true-false' && (
                            <>
                              Your Answer: <strong>{ans !== undefined ? (ans ? 'True' : 'False') : 'None'}</strong> | Correct: <strong>{(q as TrueFalseQuestion).correctAnswer ? 'True' : 'False'}</strong>
                            </>
                          )}
                          {q.type === 'mcq' && (
                            <>
                              Your Answer: <strong>{ans !== undefined ? (q as MCQQuestion).options[ans] : 'None'}</strong> | Correct: <strong>{(q as MCQQuestion).options[(q as MCQQuestion).correctIndex]}</strong>
                            </>
                          )}
                          {q.type === 'fill-blank' && (
                            <>
                              Your Answer: <strong>{ans || 'None'}</strong> | Expected: <strong>{(q as FillBlankQuestion).correctAnswer}</strong>
                            </>
                          )}
                          {q.type === 'matching' && (
                            <>
                              Matching: <strong>{isCorrect ? 'All pairs matched' : 'Incomplete or wrong pairs'}</strong>
                            </>
                          )}
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] opacity-60 italic pt-1">
                            Note: {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
