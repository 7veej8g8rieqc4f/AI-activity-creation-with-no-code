import JSZip from 'jszip';
import { QuizConfig, QuizQuestion } from '../types/quiz';

/**
 * Generates the standalone HTML, CSS, JS, and README bundle for the quiz
 */
export function buildQuizFiles(config: QuizConfig) {
  const { title, description, questions, design } = config;
  const quizTitle = title.trim() || 'Custom Quiz';
  const quizDesc = description.trim() || 'Test your knowledge with this interactive quiz.';

  // Google Font URL mapping
  const fontFamilies: Record<string, string> = {
    'Inter': 'Inter:wght@400;500;600;700',
    'Poppins': 'Poppins:wght@400;500;600;700',
    'Outfit': 'Outfit:wght@400;500;600;700',
    'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
    'Playfair Display': 'Playfair+Display:ital,wght@0,600;0,700;1,400',
    'JetBrains Mono': 'JetBrains+Mono:wght@400;500;600',
  };

  const selectedFont = design.fontFamily || 'Inter';
  const googleFontParam = fontFamilies[selectedFont] || 'Inter:wght@400;500;600;700';

  // Radius mappings
  const radiusMap = {
    'none': '0px',
    'sm': '6px',
    'md': '12px',
    'lg': '18px',
    'xl': '24px',
  };
  const cardRadiusVal = radiusMap[design.cardRadius] || '16px';

  const btnRadiusMap = {
    'square': '0px',
    'rounded': '8px',
    'pill': '9999px',
  };
  const btnRadiusVal = btnRadiusMap[design.buttonShape] || '8px';

  // Shadow mappings
  const shadowMap = {
    'none': 'none',
    'subtle': '0 2px 8px rgba(0,0,0,0.08)',
    'medium': '0 8px 24px rgba(0,0,0,0.16)',
    'elevated': '0 20px 40px rgba(0,0,0,0.28)',
    'glow': `0 0 30px ${design.accentColor}44, 0 10px 25px rgba(0,0,0,0.3)`,
  };
  const cardShadowVal = shadowMap[design.cardShadow] || '0 12px 32px rgba(0,0,0,0.2)';

  // Background CSS
  let bodyBackground = `background-color: ${design.solidColor};`;
  if (design.backgroundType === 'gradient') {
    bodyBackground = `background: linear-gradient(${design.gradientAngle}deg, ${design.gradientFrom}, ${design.gradientTo});`;
  } else if (design.backgroundType === 'imageUrl' || design.backgroundType === 'imageUpload') {
    const bgUrl = design.bgImageData || design.bgImageUrl || '';
    if (bgUrl) {
      bodyBackground = `background-image: url('${bgUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }
  }

  // 1. GENERATE INDEX.HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(quizTitle)}</title>
  <meta name="description" content="${escapeHtml(quizDesc)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${googleFontParam}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="bg-overlay"></div>
  <canvas id="confetti-canvas"></canvas>

  <main class="quiz-wrapper">
    <!-- Header -->
    <header class="quiz-header">
      <div class="quiz-meta-bar">
        <span class="quiz-brand-badge">${escapeHtml(config.questionType.toUpperCase())} QUIZ</span>
        ${design.enableTimer ? `<div id="timer-badge" class="timer-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span id="time-left">00:00</span></div>` : ''}
      </div>
      <h1 class="quiz-title">${escapeHtml(quizTitle)}</h1>
      <p class="quiz-description">${escapeHtml(quizDesc)}</p>

      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-info">
          <span id="question-tracker">Question 1 of ${questions.length}</span>
          <span id="score-counter">Score: 0 / ${questions.length}</span>
        </div>
        <div class="progress-bar-bg">
          <div id="progress-bar-fill" class="progress-bar-fill" style="width: 0%;"></div>
        </div>
      </div>
    </header>

    <!-- Active Question Card -->
    <section id="quiz-card" class="quiz-card">
      <div class="card-inner">
        <div class="question-header">
          <span id="q-type-badge" class="badge">Question</span>
          <span id="q-points-badge" class="points-badge">1 Point</span>
        </div>

        <h2 id="question-title" class="question-title">Loading question...</h2>

        <!-- Answers Container -->
        <div id="answers-container" class="answers-container">
          <!-- Dynamically populated by script.js -->
        </div>

        <!-- Immediate Feedback Box -->
        <div id="feedback-box" class="feedback-box" style="display: none;">
          <div id="feedback-icon" class="feedback-icon"></div>
          <div class="feedback-content">
            <h4 id="feedback-title" class="feedback-title"></h4>
            <p id="feedback-text" class="feedback-text"></p>
          </div>
        </div>
      </div>

      <!-- Navigation Footer -->
      <footer class="card-footer">
        <button id="prev-btn" class="btn btn-secondary" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Previous
        </button>

        <div class="footer-actions">
          <button id="next-btn" class="btn btn-primary">
            Next
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button id="submit-btn" class="btn btn-accent" style="display: none;">
            Submit Quiz
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </button>
        </div>
      </footer>
    </section>

    <!-- Score & Results Card (Initially hidden) -->
    <section id="results-card" class="quiz-card results-card" style="display: none;">
      <div class="results-inner">
        <div class="results-badge" id="results-badge">QUIZ COMPLETED</div>
        <h2 id="results-headline" class="results-headline">Quiz Finished!</h2>
        <p id="results-subtext" class="results-subtext">Review your final performance breakdown below.</p>

        <div class="score-summary-grid">
          <div class="score-metric">
            <span class="metric-label">Final Score</span>
            <span id="final-score-val" class="metric-val">0 / ${questions.length}</span>
          </div>
          <div class="score-metric">
            <span class="metric-label">Accuracy</span>
            <span id="final-percent-val" class="metric-val">0%</span>
          </div>
          <div class="score-metric">
            <span class="metric-label">Grade</span>
            <span id="final-grade-val" class="metric-val">--</span>
          </div>
        </div>

        <div class="results-actions">
          <button id="restart-btn" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            Restart Quiz
          </button>
          <button id="toggle-review-btn" class="btn btn-secondary">
            Review Questions
          </button>
        </div>

        <!-- Detailed Review Section -->
        <div id="review-container" class="review-container">
          <h3 class="review-title">Detailed Answers Review</h3>
          <div id="review-list" class="review-list"></div>
        </div>
      </div>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. GENERATE STYLE.CSS
  const btnSizePadding = {
    'compact': '8px 16px',
    'normal': '12px 24px',
    'prominent': '16px 32px',
  }[design.buttonSize] || '12px 24px';

  const btnFontSize = {
    'compact': '0.875rem',
    'normal': '1rem',
    'prominent': '1.125rem',
  }[design.buttonSize] || '1rem';

  const baseFontSize = {
    'compact': '15px',
    'medium': '16px',
    'large': '18px',
  }[design.fontSize] || '16px';

  // Hover effect styles
  let btnHoverCSS = '';
  if (design.buttonHoverEffect === 'lift') {
    btnHoverCSS = 'transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.18);';
  } else if (design.buttonHoverEffect === 'glow') {
    btnHoverCSS = `box-shadow: 0 0 18px ${design.accentColor}88; transform: translateY(-1px);`;
  } else if (design.buttonHoverEffect === 'scale') {
    btnHoverCSS = 'transform: scale(1.03);';
  } else if (design.buttonHoverEffect === 'outline') {
    btnHoverCSS = `border-color: ${design.accentColor}; box-shadow: 0 0 0 2px ${design.accentColor}44;`;
  }

  // Heading Style CSS
  let headingStyleCSS = '';
  if (design.headingStyle === 'accent-bar') {
    headingStyleCSS = `border-left: 4px solid var(--accent-color); padding-left: 14px;`;
  } else if (design.headingStyle === 'banner') {
    headingStyleCSS = `background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--card-border);`;
  }

  const cssContent = `/* Custom Quiz Generator - Standalone Stylesheet */
:root {
  --font-family: '${selectedFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size: ${baseFontSize};
  --card-bg: ${design.cardBgColor};
  --card-text: ${design.cardTextColor};
  --card-border: ${design.cardBorderColor};
  --card-radius: ${cardRadiusVal};
  --card-shadow: ${cardShadowVal};
  --card-max-width: ${design.cardMaxWidth || '720px'};
  
  --primary-btn-bg: ${design.primaryBtnBg};
  --primary-btn-text: ${design.primaryBtnText};
  --secondary-btn-bg: ${design.secondaryBtnBg};
  --secondary-btn-text: ${design.secondaryBtnText};
  --btn-radius: ${btnRadiusVal};
  --btn-padding: ${btnSizePadding};
  --btn-font-size: ${btnFontSize};

  --primary-text: ${design.primaryTextColor};
  --muted-text: ${design.mutedTextColor};
  --accent-color: ${design.accentColor};
  --correct-color: ${design.correctColor};
  --incorrect-color: ${design.incorrectColor};
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--primary-text);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  position: relative;
  ${bodyBackground}
  overflow-x: hidden;
}

.bg-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, ${design.bgOverlayOpacity / 100});
  pointer-events: none;
  z-index: 1;
}

#confetti-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.quiz-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--card-max-width);
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.quiz-header {
  text-align: ${design.alignment};
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quiz-meta-bar {
  display: flex;
  align-items: center;
  justify-content: ${design.alignment === 'center' ? 'center' : 'space-between'};
  gap: 12px;
}

.quiz-brand-badge {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--accent-color);
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: inline-block;
}

.timer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
  padding: 4px 10px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.quiz-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--primary-text);
  line-height: 1.25;
}

.quiz-description {
  font-size: 0.95rem;
  color: var(--muted-text);
  line-height: 1.5;
}

/* Progress bar */
.progress-container {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--muted-text);
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--correct-color));
  transition: width 0.3s ease;
  border-radius: 9999px;
}

/* Card */
.quiz-card {
  background: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  transition: all 0.25s ease;
}

.card-inner {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--muted-text);
}

.points-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-color);
}

.question-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--card-text);
  ${headingStyleCSS}
}

/* Answers Layout */
.answers-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* MCQ & True/False Option Button */
.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid var(--card-border);
  border-radius: var(--btn-radius);
  color: var(--card-text);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
}

.option-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  border-color: var(--accent-color);
  ${btnHoverCSS}
}

.option-btn.selected {
  background: ${design.accentColor}22;
  border-color: var(--accent-color);
  font-weight: 600;
}

.option-btn.correct {
  background: ${design.correctColor}26 !important;
  border-color: var(--correct-color) !important;
  color: var(--correct-color) !important;
}

.option-btn.incorrect {
  background: ${design.incorrectColor}26 !important;
  border-color: var(--incorrect-color) !important;
  color: var(--incorrect-color) !important;
}

.opt-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.opt-label {
  flex-grow: 1;
}

/* Fill-in-the-blank input */
.fill-blank-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blank-input {
  width: 100%;
  padding: 14px 18px;
  font-family: inherit;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--card-border);
  border-radius: var(--btn-radius);
  color: var(--card-text);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.blank-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px ${design.accentColor}33;
}

.blank-input.correct {
  border-color: var(--correct-color);
  background: ${design.correctColor}18;
}

.blank-input.incorrect {
  border-color: var(--incorrect-color);
  background: ${design.incorrectColor}18;
}

.blank-helper {
  font-size: 0.825rem;
  color: var(--muted-text);
}

/* Matching UI */
.matching-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.matching-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-heading {
  font-size: 0.825rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-text);
  margin-bottom: 2px;
}

.match-item {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid var(--card-border);
  border-radius: var(--btn-radius);
  color: var(--card-text);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.18s ease;
  min-height: 48px;
  user-select: none;
}

.match-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-color);
}

.match-item.active-source {
  border-color: var(--accent-color);
  background: ${design.accentColor}28;
  box-shadow: 0 0 10px ${design.accentColor}55;
}

.match-item.paired {
  border-color: var(--correct-color);
  background: ${design.correctColor}18;
}

.match-item.wrong-pair {
  border-color: var(--incorrect-color);
  background: ${design.incorrectColor}18;
}

.pair-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--accent-color);
  color: #fff;
  margin-left: 8px;
}

/* Feedback box */
.feedback-box {
  padding: 14px 16px;
  border-radius: var(--btn-radius);
  border: 1px solid var(--card-border);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 0.9rem;
}

.feedback-box.correct {
  background: ${design.correctColor}20;
  border-color: var(--correct-color);
  color: var(--correct-color);
}

.feedback-box.incorrect {
  background: ${design.incorrectColor}20;
  border-color: var(--incorrect-color);
  color: var(--incorrect-color);
}

.feedback-title {
  font-weight: 700;
  margin-bottom: 2px;
}

.feedback-text {
  font-size: 0.85rem;
  color: var(--card-text);
  opacity: 0.9;
}

/* Footer & Buttons */
.card-footer {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--btn-padding);
  font-size: var(--btn-font-size);
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--btn-radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-primary {
  background: var(--primary-btn-bg);
  color: var(--primary-btn-text);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  ${btnHoverCSS}
}

.btn-secondary {
  background: var(--secondary-btn-bg);
  color: var(--secondary-btn-text);
}

.btn-secondary:hover:not(:disabled) {
  opacity: 0.92;
  ${btnHoverCSS}
}

.btn-accent {
  background: var(--correct-color);
  color: #ffffff;
}

.btn-accent:hover:not(:disabled) {
  opacity: 0.92;
  ${btnHoverCSS}
}

/* Results Card */
.results-inner {
  padding: 36px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.results-badge {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 9999px;
  background: ${design.accentColor}25;
  color: var(--accent-color);
  border: 1px solid ${design.accentColor}55;
}

.results-headline {
  font-size: 2rem;
  font-weight: 800;
  color: var(--card-text);
}

.results-subtext {
  font-size: 1rem;
  color: var(--muted-text);
  max-width: 480px;
}

.score-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 500px;
  margin: 10px 0;
}

.score-metric {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-size: 0.78rem;
  color: var(--muted-text);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.metric-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary-text);
}

.results-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Detailed Review */
.review-container {
  width: 100%;
  text-align: left;
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--card-border);
}

.review-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-card.correct {
  border-left: 4px solid var(--correct-color);
}

.review-card.incorrect {
  border-left: 4px solid var(--incorrect-color);
}

.review-card-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.review-ans-row {
  display: flex;
  gap: 10px;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.review-label {
  color: var(--muted-text);
}

.review-expl {
  font-size: 0.825rem;
  color: var(--muted-text);
  font-style: italic;
  margin-top: 4px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  body {
    padding: 16px 12px;
  }
  .card-inner {
    padding: 20px 16px;
  }
  .quiz-title {
    font-size: 1.45rem;
  }
  .question-title {
    font-size: 1.1rem;
  }
  .matching-board {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .score-summary-grid {
    grid-template-columns: 1fr;
  }
  .card-footer {
    padding: 14px 16px;
    flex-direction: column-reverse;
    gap: 12px;
  }
  .footer-actions, .card-footer .btn {
    width: 100%;
  }
}
`;

  // 3. GENERATE SCRIPT.JS
  const jsContent = `/**
 * Standalone Quiz Engine
 * Built with Custom Quiz Generator
 */

(function () {
  'use strict';

  // Embed Quiz Data
  const quizData = ${JSON.stringify(questions, null, 2)};
  const config = {
    instantFeedback: ${design.instantFeedback},
    enableSounds: ${design.enableSounds},
    enableTimer: ${design.enableTimer},
    timePerQuestion: ${design.timePerQuestionSeconds || 30},
    totalQuestions: quizData.length
  };

  // State
  let currentIndex = 0;
  let userAnswers = {}; // { [qIndex]: answerValue }
  let matchingState = {}; // { [qIndex]: { activeLeft: null, pairs: { [left]: right } } }
  let quizSubmitted = false;
  let timerInterval = null;
  let secondsRemaining = config.timePerQuestion;

  // DOM Elements
  const questionTracker = document.getElementById('question-tracker');
  const scoreCounter = document.getElementById('score-counter');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const qTypeBadge = document.getElementById('q-type-badge');
  const qPointsBadge = document.getElementById('q-points-badge');
  const questionTitle = document.getElementById('question-title');
  const answersContainer = document.getElementById('answers-container');
  const feedbackBox = document.getElementById('feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackText = document.getElementById('feedback-text');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const quizCard = document.getElementById('quiz-card');
  const resultsCard = document.getElementById('results-card');
  const finalScoreVal = document.getElementById('final-score-val');
  const finalPercentVal = document.getElementById('final-percent-val');
  const finalGradeVal = document.getElementById('final-grade-val');
  const restartBtn = document.getElementById('restart-btn');
  const toggleReviewBtn = document.getElementById('toggle-review-btn');
  const reviewContainer = document.getElementById('review-container');
  const reviewList = document.getElementById('review-list');
  const timeLeftDisplay = document.getElementById('time-left');

  // Sound Synthesizer via Web Audio API (Offline, Zero-Asset)
  class SoundFx {
    constructor() {
      this.ctx = null;
      this.enabled = config.enableSounds;
    }
    init() {
      if (!this.enabled || this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {}
    }
    correct() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
    incorrect() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    }
    fanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    }
  }
  const sfx = new SoundFx();

  // Confetti Animation Engine
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }

    let animFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35; // gravity
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
        animFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animFrame);
      }
    }
    render();
  }

  // Timer Setup
  function resetTimer() {
    if (!config.enableTimer || !timeLeftDisplay) return;
    clearInterval(timerInterval);
    secondsRemaining = config.timePerQuestion;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      secondsRemaining--;
      updateTimerDisplay();
      if (secondsRemaining <= 0) {
        clearInterval(timerInterval);
        // Time expired for this question
        handleTimeout();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!timeLeftDisplay) return;
    const mins = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
    const secs = (secondsRemaining % 60).toString().padStart(2, '0');
    timeLeftDisplay.textContent = mins + ':' + secs;
  }

  function handleTimeout() {
    if (currentIndex < quizData.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      submitQuiz();
    }
  }

  // Render Active Question
  function renderCurrentQuestion() {
    const q = quizData[currentIndex];
    if (!q) return;

    resetTimer();

    // Progress updates
    questionTracker.textContent = 'Question ' + (currentIndex + 1) + ' of ' + quizData.length;
    const answeredCount = Object.keys(userAnswers).length;
    scoreCounter.textContent = 'Answered: ' + answeredCount + ' / ' + quizData.length;
    const percent = ((currentIndex) / quizData.length) * 100;
    progressBarFill.style.width = percent + '%';

    // Badge & Title
    qTypeBadge.textContent = q.type.replace('-', ' ').toUpperCase();
    qPointsBadge.textContent = (q.points || 1) + ' Point' + ((q.points || 1) > 1 ? 's' : '');
    questionTitle.textContent = q.title;

    // Reset feedback
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'feedback-box';

    // Clear answers
    answersContainer.innerHTML = '';

    // Render by type
    if (q.type === 'true-false') {
      renderTrueFalse(q);
    } else if (q.type === 'mcq') {
      renderMCQ(q);
    } else if (q.type === 'fill-blank') {
      renderFillBlank(q);
    } else if (q.type === 'matching') {
      renderMatching(q);
    }

    // Nav button state
    prevBtn.disabled = currentIndex === 0;
    if (currentIndex === quizData.length - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }

    // Check if instant feedback should show for previously answered question
    if (config.instantFeedback && userAnswers[currentIndex] !== undefined) {
      showInstantFeedback(q, userAnswers[currentIndex]);
    }
  }

  // True / False Renderer
  function renderTrueFalse(q) {
    const options = [
      { label: 'True', value: true, key: 'T' },
      { label: 'False', value: false, key: 'F' }
    ];

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      if (userAnswers[currentIndex] === opt.value) {
        btn.classList.add('selected');
      }

      btn.innerHTML = \`
        <span class="opt-prefix">\${opt.key}</span>
        <span class="opt-label">\${opt.label}</span>
      \`;

      btn.addEventListener('click', () => {
        userAnswers[currentIndex] = opt.value;
        renderCurrentQuestion();
        if (config.instantFeedback) {
          const isCorrect = opt.value === q.correctAnswer;
          if (isCorrect) sfx.correct(); else sfx.incorrect();
        }
      });

      answersContainer.appendChild(btn);
    });
  }

  // MCQ Renderer
  function renderMCQ(q) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      if (userAnswers[currentIndex] === optIdx) {
        btn.classList.add('selected');
      }

      btn.innerHTML = \`
        <span class="opt-prefix">\${letters[optIdx] || optIdx + 1}</span>
        <span class="opt-label">\${escapeHtml(optText)}</span>
      \`;

      btn.addEventListener('click', () => {
        userAnswers[currentIndex] = optIdx;
        renderCurrentQuestion();
        if (config.instantFeedback) {
          const isCorrect = optIdx === q.correctIndex;
          if (isCorrect) sfx.correct(); else sfx.incorrect();
        }
      });

      answersContainer.appendChild(btn);
    });
  }

  // Fill in the Blank Renderer
  function renderFillBlank(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fill-blank-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'blank-input';
    input.placeholder = 'Type your answer here...';
    input.value = userAnswers[currentIndex] !== undefined ? userAnswers[currentIndex] : '';

    const helper = document.createElement('div');
    helper.className = 'blank-helper';
    helper.textContent = 'Press Enter or click Next to save your answer.';

    input.addEventListener('input', (e) => {
      userAnswers[currentIndex] = e.target.value.trim();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        userAnswers[currentIndex] = input.value.trim();
        if (config.instantFeedback) {
          showInstantFeedback(q, input.value.trim());
        } else if (currentIndex < quizData.length - 1) {
          goToQuestion(currentIndex + 1);
        } else {
          submitQuiz();
        }
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(helper);
    answersContainer.appendChild(wrapper);

    // Auto focus for easy typing
    setTimeout(() => input.focus(), 50);
  }

  // Matching Renderer
  function renderMatching(q) {
    if (!matchingState[currentIndex]) {
      matchingState[currentIndex] = {
        activeLeft: null,
        pairs: userAnswers[currentIndex] || {}
      };
    }

    const state = matchingState[currentIndex];
    const board = document.createElement('div');
    board.className = 'matching-board';

    // Left Column
    const leftCol = document.createElement('div');
    leftCol.className = 'matching-column';
    const leftHead = document.createElement('div');
    leftHead.className = 'col-heading';
    leftHead.textContent = 'Column A (Items)';
    leftCol.appendChild(leftHead);

    // Right Column
    const rightCol = document.createElement('div');
    rightCol.className = 'matching-column';
    const rightHead = document.createElement('div');
    rightHead.className = 'col-heading';
    rightHead.textContent = 'Column B (Matches)';
    rightCol.appendChild(rightHead);

    // Render Left items
    q.pairs.forEach((pair, idx) => {
      const item = document.createElement('div');
      item.className = 'match-item';
      const pairedRight = state.pairs[pair.left];

      if (pairedRight) {
        item.classList.add('paired');
      }
      if (state.activeLeft === pair.left) {
        item.classList.add('active-source');
      }

      item.innerHTML = \`
        <span>\${escapeHtml(pair.left)}</span>
        \${pairedRight ? \`<span class="pair-tag">Connected</span>\` : ''}
      \`;

      item.addEventListener('click', () => {
        if (state.activeLeft === pair.left) {
          state.activeLeft = null;
        } else {
          state.activeLeft = pair.left;
        }
        renderCurrentQuestion();
      });

      leftCol.appendChild(item);
    });

    // Shuffled Right items
    // Seeded shuffle so order stays stable for this question
    const rightItems = q.pairs.map(p => p.right).sort();
    rightItems.forEach((rightVal) => {
      const item = document.createElement('div');
      item.className = 'match-item';

      // Check if paired to any left
      const pairedLeft = Object.keys(state.pairs).find(l => state.pairs[l] === rightVal);
      if (pairedLeft) {
        item.classList.add('paired');
      }

      item.innerHTML = \`
        <span>\${escapeHtml(rightVal)}</span>
        \${pairedLeft ? \`<span class="pair-tag">\${escapeHtml(pairedLeft)}</span>\` : ''}
      \`;

      item.addEventListener('click', () => {
        if (state.activeLeft) {
          // Bind pair!
          state.pairs[state.activeLeft] = rightVal;
          state.activeLeft = null;
          userAnswers[currentIndex] = { ...state.pairs };
          renderCurrentQuestion();
        } else if (pairedLeft) {
          // Unbind pair
          delete state.pairs[pairedLeft];
          userAnswers[currentIndex] = { ...state.pairs };
          renderCurrentQuestion();
        }
      });

      rightCol.appendChild(item);
    });

    board.appendChild(leftCol);
    board.appendChild(rightCol);
    answersContainer.appendChild(board);
  }

  // Instant Feedback Renderer
  function showInstantFeedback(q, userAns) {
    const isCorrect = checkAnswer(q, userAns);
    feedbackBox.style.display = 'flex';
    feedbackBox.className = 'feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
    feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';

    let explanation = q.explanation || '';
    if (!isCorrect) {
      if (q.type === 'true-false') {
        explanation = 'The correct answer is: ' + (q.correctAnswer ? 'True' : 'False') + '. ' + explanation;
      } else if (q.type === 'mcq') {
        explanation = 'The correct choice is: ' + q.options[q.correctIndex] + '. ' + explanation;
      } else if (q.type === 'fill-blank') {
        explanation = 'Expected answer: ' + q.correctAnswer + '. ' + explanation;
      }
    }
    feedbackText.textContent = explanation;
  }

  // Answer Evaluation Engine
  function checkAnswer(q, userAns) {
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
        return q.acceptedAnswers.some(a => String(a).trim().toLowerCase() === trimmed);
      }
      return false;
    } else if (q.type === 'matching') {
      if (typeof userAns !== 'object') return false;
      const allMatched = q.pairs.every(p => userAns[p.left] === p.right);
      return allMatched;
    }
    return false;
  }

  // Navigation
  function goToQuestion(idx) {
    if (idx < 0 || idx >= quizData.length) return;
    currentIndex = idx;
    renderCurrentQuestion();
  }

  // Submit Quiz & Show Final Results
  function submitQuiz() {
    if (quizSubmitted) return;
    quizSubmitted = true;
    clearInterval(timerInterval);

    // Calculate score
    let score = 0;
    quizData.forEach((q, idx) => {
      if (checkAnswer(q, userAnswers[idx])) {
        score++;
      }
    });

    const percent = Math.round((score / quizData.length) * 100);
    progressBarFill.style.width = '100%';

    // Determine Grade
    let grade = 'A+';
    if (percent < 50) grade = 'F';
    else if (percent < 65) grade = 'D';
    else if (percent < 75) grade = 'C';
    else if (percent < 85) grade = 'B';
    else if (percent < 95) grade = 'A';

    finalScoreVal.textContent = score + ' / ' + quizData.length;
    finalPercentVal.textContent = percent + '%';
    finalGradeVal.textContent = grade;

    // Show celebratory confetti if passed!
    if (percent >= 60) {
      launchConfetti();
      sfx.fanfare();
    } else {
      sfx.incorrect();
    }

    // Switch views
    quizCard.style.display = 'none';
    resultsCard.style.display = 'block';

    // Populate Detailed Review
    buildReviewList();
  }

  // Build Detailed Review List
  function buildReviewList() {
    reviewList.innerHTML = '';
    quizData.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = checkAnswer(q, userAns);

      const item = document.createElement('div');
      item.className = 'review-card ' + (isCorrect ? 'correct' : 'incorrect');

      let userAnsLabel = 'Not answered';
      let correctAnsLabel = '';

      if (q.type === 'true-false') {
        userAnsLabel = userAns !== undefined ? (userAns ? 'True' : 'False') : 'None';
        correctAnsLabel = q.correctAnswer ? 'True' : 'False';
      } else if (q.type === 'mcq') {
        userAnsLabel = userAns !== undefined && q.options[userAns] ? q.options[userAns] : 'None';
        correctAnsLabel = q.options[q.correctIndex];
      } else if (q.type === 'fill-blank') {
        userAnsLabel = userAns ? String(userAns) : 'None';
        correctAnsLabel = q.correctAnswer;
      } else if (q.type === 'matching') {
        userAnsLabel = isCorrect ? 'All pairs connected correctly' : 'Partial or incomplete matching';
        correctAnsLabel = q.pairs.map(p => p.left + ' -> ' + p.right).join(', ');
      }

      item.innerHTML = \`
        <div class="review-card-title">#\${idx + 1}. \${escapeHtml(q.title)}</div>
        <div class="review-ans-row">
          <span class="review-label">Your Answer:</span>
          <strong style="color: \${isCorrect ? 'var(--correct-color)' : 'var(--incorrect-color)'};">\${escapeHtml(userAnsLabel)}</strong>
        </div>
        \${!isCorrect ? \`
          <div class="review-ans-row">
            <span class="review-label">Correct Answer:</span>
            <strong style="color: var(--correct-color);">\${escapeHtml(correctAnsLabel)}</strong>
          </div>
        \` : ''}
        \${q.explanation ? \`<div class="review-expl">Explanation: \${escapeHtml(q.explanation)}</div>\` : ''}
      \`;

      reviewList.appendChild(item);
    });
  }

  // Restart Quiz
  function restartQuiz() {
    currentIndex = 0;
    userAnswers = {};
    matchingState = {};
    quizSubmitted = false;

    resultsCard.style.display = 'none';
    quizCard.style.display = 'block';

    renderCurrentQuestion();
  }

  // Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Event Listeners
  prevBtn.addEventListener('click', () => goToQuestion(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToQuestion(currentIndex + 1));
  submitBtn.addEventListener('click', submitQuiz);
  restartBtn.addEventListener('click', restartQuiz);

  toggleReviewBtn.addEventListener('click', () => {
    reviewContainer.scrollIntoView({ behavior: 'smooth' });
  });

  // Start Quiz
  renderCurrentQuestion();
})();
`;

  // 4. GENERATE README.MD
  const readmeContent = `# ${quizTitle}

> Generated with **Custom Quiz Generator**

An interactive, responsive standalone quiz web application ready to be deployed or opened in any modern web browser.

## 🚀 Quick Start

1. **Extract all files** from this ZIP into a single folder.
2. **Double-click \`index.html\`** to launch the quiz in your web browser (Chrome, Edge, Safari, Firefox).
3. That's it! No build steps, databases, or npm dependencies required.

## 📁 Project Structure

\`\`\`
.
├── index.html   # Main HTML5 entry point and semantic quiz layout
├── style.css    # Complete custom styling, variables, theme, and animations
├── script.js    # Quiz engine, answer validation, scoring, and Web Audio sounds
└── README.md    # Documentation and customization guide
\`\`\`

## 🛠️ Customization & Modifications

### Adding or Changing Questions
Open \`script.js\` in any text editor (VS Code, Notepad, etc.).
At the top of the file, locate the \`quizData\` array:

\`\`\`javascript
const quizData = [
  // Add or edit questions here!
];
\`\`\`

You can add any question of types:
- \`"true-false"\`: \`{ type: "true-false", title: "...", correctAnswer: true, points: 1 }\`
- \`"mcq"\`: \`{ type: "mcq", title: "...", options: ["A", "B", "C"], correctIndex: 1 }\`
- \`"fill-blank"\`: \`{ type: "fill-blank", title: "The answer is ______", correctAnswer: "Paris" }\`
- \`"matching"\`: \`{ type: "matching", title: "...", pairs: [{ left: "Item 1", right: "Match 1" }] }\`

### Changing Colors & Styles
Open \`style.css\` and modify the CSS variables under \`:root\`:

\`\`\`css
:root {
  --primary-btn-bg: #3b82f6;
  --card-bg: #1e293b;
  --accent-color: #3b82f6;
  /* ... */
}
\`\`\`

## 🌐 Hosting Online

You can host this quiz for free in seconds by uploading the folder to:
- **GitHub Pages**
- **Vercel**
- **Netlify**
- Any shared cPanel web hosting

Enjoy your quiz!
`;

  return {
    'index.html': htmlContent,
    'style.css': cssContent,
    'script.js': jsContent,
    'README.md': readmeContent,
  };
}

/**
 * Creates and downloads the ZIP file containing all quiz assets
 */
export async function downloadQuizZip(config: QuizConfig, filename = 'custom-quiz.zip') {
  const zip = new JSZip();
  const files = buildQuizFiles(config);

  // Add each file to the ZIP archive
  Object.entries(files).forEach(([name, content]) => {
    zip.file(name, content);
  });

  // Generate the zip blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Trigger browser download via anchor element
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Cleanup object URL
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);

  return zipBlob;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
