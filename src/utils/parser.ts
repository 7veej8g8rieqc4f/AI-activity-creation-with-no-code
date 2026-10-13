import { QuizQuestion, QuestionType, MCQQuestion, TrueFalseQuestion, FillBlankQuestion, MatchingQuestion, MatchingPair } from '../types/quiz';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return 'q_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Parses user-pasted text into QuizQuestion items based on selected questionType
 */
export function parseRawQuestions(text: string, expectedType: QuestionType | 'mixed'): QuizQuestion[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  if (expectedType === 'matching') {
    return parseMatchingText(cleaned);
  }

  // Split into chunks by double newline or numbered patterns
  const chunks = splitIntoQuestionChunks(cleaned);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i].trim();
    if (!chunk) continue;

    const parsed = parseSingleChunk(chunk, expectedType, i + 1);
    if (parsed) {
      questions.push(parsed);
    }
  }

  return questions;
}

/**
 * Splits text into question blocks based on common patterns
 */
function splitIntoQuestionChunks(text: string): string[] {
  // If text contains double newlines, that's the cleanest separator
  const doubleNewlineSplits = text.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
  if (doubleNewlineSplits.length > 1) {
    return doubleNewlineSplits;
  }

  // Otherwise, split by numbered questions: e.g. "1. " or "Q1:" or "Question 1:"
  const numberedSplit = text.split(/(?=(?:^|\n)\s*(?:Q\s*\d+[:.]|\d+[:.]|Question\s+\d+[:.]))/i);
  if (numberedSplit.length > 1) {
    return numberedSplit.map(s => s.trim()).filter(Boolean);
  }

  // Fallback: split by lines
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

/**
 * Parses a single chunk into a QuizQuestion
 */
function parseSingleChunk(chunk: string, expectedType: QuestionType | 'mixed', index: number): QuizQuestion {
  const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || `Question ${index}`;

  // Clean numbering prefix from question text
  const cleanTitle = firstLine.replace(/^(?:Q\s*\d+[:.]|\d+[:.]|Question\s+\d+[:.])\s*/i, '').trim();

  // If specific type selected, parse as that type
  if (expectedType === 'true-false') {
    return parseTrueFalseChunk(cleanTitle, lines);
  } else if (expectedType === 'mcq') {
    return parseMCQChunk(cleanTitle, lines);
  } else if (expectedType === 'fill-blank') {
    return parseFillBlankChunk(cleanTitle, lines);
  } else if (expectedType === 'matching') {
    const matchingQ = parseMatchingText(chunk);
    if (matchingQ.length > 0) return matchingQ[0];
  }

  // Mixed type detection:
  // 1. Check for fill-in-the-blank brackets or underscores
  if (/\[.+?\]/.test(cleanTitle) || /_{2,}/.test(cleanTitle)) {
    return parseFillBlankChunk(cleanTitle, lines);
  }

  // 2. Check for True/False keywords
  const isTF = /\b(true|false)\b/i.test(chunk) && lines.length <= 3 && !lines.some(l => /^[A-Da-d][).]\s+/.test(l));
  if (isTF) {
    return parseTrueFalseChunk(cleanTitle, lines);
  }

  // 3. Check for matching pairs (multiple " - " or " -> " or " = ")
  const pairLines = lines.filter(l => /[-=–—]|->|:/.test(l));
  if (pairLines.length >= 3 && lines.length === pairLines.length) {
    const matching = parseMatchingText(chunk);
    if (matching.length > 0) return matching[0];
  }

  // Default to MCQ
  return parseMCQChunk(cleanTitle, lines);
}

/**
 * True / False parser
 */
function parseTrueFalseChunk(title: string, lines: string[]): TrueFalseQuestion {
  let correctAnswer = true;
  let explanation = '';
  let cleanTitle = title;

  // Check inline answer in title e.g., "The earth is flat. (False)" or "[False]"
  const inlineMatch = cleanTitle.match(/[([{\s](true|false)[)\]}\s]*$/i);
  if (inlineMatch) {
    correctAnswer = inlineMatch[1].toLowerCase() === 'true';
    cleanTitle = cleanTitle.replace(/[([{\s]*(true|false)[)\]}\s]*$/i, '').trim();
  }

  // Check subsequent lines for "Answer: False" or "Ans: True"
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const ansMatch = line.match(/^(?:ans(?:wer)?|correct)[:\s]+(true|false)/i);
    if (ansMatch) {
      correctAnswer = ansMatch[1].toLowerCase() === 'true';
    }
    const expMatch = line.match(/^(?:explanation|note|hint)[:\s]+(.+)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
    }
  }

  return {
    id: generateId(),
    type: 'true-false',
    title: cleanTitle || 'Is this statement true or false?',
    correctAnswer,
    explanation,
    points: 1,
  };
}

/**
 * MCQ parser
 */
function parseMCQChunk(title: string, lines: string[]): MCQQuestion {
  const options: string[] = [];
  let correctIndex = 0;
  let explanation = '';

  // Look for options in subsequent lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for "Answer: B" line
    const ansLineMatch = line.match(/^(?:ans(?:wer)?|correct)[:\s]+([A-Za-z0-9])/i);
    if (ansLineMatch) {
      const char = ansLineMatch[1].toUpperCase();
      const idx = char.charCodeAt(0) - 65;
      if (idx >= 0 && idx < 10) {
        correctIndex = idx;
      }
      continue;
    }

    // Check for explanation
    const expMatch = line.match(/^(?:explanation|note|hint)[:\s]+(.+)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
      continue;
    }

    // Check option pattern: "A) Option" or "1. Option" or "- Option"
    const isOption = /^(?:[A-Za-z0-9][).]|[-*•])\s+/.test(line);
    if (isOption || lines.length > 2) {
      let optText = line.replace(/^(?:[A-Za-z0-9][).]|[-*•])\s+/, '').trim();

      // Check if marked as correct with * or [correct] or (correct)
      const hasCorrectFlag = /[*✓]|\[correct\]|\(correct\)/i.test(optText);
      if (hasCorrectFlag) {
        optText = optText.replace(/[*✓]|\[correct\]|\(correct\)/gi, '').trim();
        correctIndex = options.length;
      }

      if (optText) {
        options.push(optText);
      }
    }
  }

  // Fallback options if none provided
  if (options.length === 0) {
    options.push('Option A', 'Option B', 'Option C', 'Option D');
  } else if (options.length === 1) {
    options.push('Option B');
  }

  if (correctIndex >= options.length) {
    correctIndex = 0;
  }

  return {
    id: generateId(),
    type: 'mcq',
    title: title || 'Choose the correct option:',
    options,
    correctIndex,
    explanation,
    points: 1,
  };
}

/**
 * Fill in the Blank parser
 */
function parseFillBlankChunk(title: string, lines: string[]): FillBlankQuestion {
  let cleanTitle = title;
  let correctAnswer = '';
  let explanation = '';
  const acceptedAnswers: string[] = [];

  // 1. Bracket format: "The capital of France is [Paris]."
  const bracketMatch = cleanTitle.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    const rawAns = bracketMatch[1].trim();
    // Support alternatives with slash e.g. [Paris/City of Light]
    const parts = rawAns.split('/').map(p => p.trim()).filter(Boolean);
    correctAnswer = parts[0] || '';
    if (parts.length > 1) {
      acceptedAnswers.push(...parts.slice(1));
    }
    // Replace with standard blank placeholder
    cleanTitle = cleanTitle.replace(/\[([^\]]+)\]/, '______');
  }

  // 2. Check subsequent lines for answer
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const ansMatch = line.match(/^(?:ans(?:wer)?|correct)[:\s]+(.+)/i);
    if (ansMatch) {
      const parts = ansMatch[1].split(/[,/]/).map(p => p.trim()).filter(Boolean);
      if (!correctAnswer && parts[0]) {
        correctAnswer = parts[0];
      }
      if (parts.length > 1) {
        acceptedAnswers.push(...parts.slice(1));
      }
    }

    const expMatch = line.match(/^(?:explanation|note|hint)[:\s]+(.+)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
    }
  }

  // If still no answer and title has underscore with trailing parenthesis: "___ is the largest ocean. (Pacific)"
  if (!correctAnswer) {
    const parenMatch = cleanTitle.match(/\(([^)]+)\)$/);
    if (parenMatch) {
      correctAnswer = parenMatch[1].trim();
      cleanTitle = cleanTitle.replace(/\(([^)]+)\)$/, '').trim();
    }
  }

  if (!correctAnswer) {
    correctAnswer = 'answer';
  }

  return {
    id: generateId(),
    type: 'fill-blank',
    title: cleanTitle || 'Fill in the missing word: ______',
    correctAnswer,
    acceptedAnswers,
    caseSensitive: false,
    explanation,
    points: 1,
  };
}

/**
 * Matching parser
 */
function parseMatchingText(text: string): MatchingQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const pairs: MatchingPair[] = [];
  let title = 'Match the items on the left with their correct pairs on the right:';

  for (const line of lines) {
    // If line has a title marker
    if (/^(?:match|question|title)[:.]/i.test(line)) {
      title = line.replace(/^(?:match|question|title)[:.]\s*/i, '').trim();
      continue;
    }

    // Try split by ' -> ', ' - ', ' = ', or ' : '
    let parts: string[] = [];
    if (line.includes('->')) {
      parts = line.split('->');
    } else if (line.includes('=')) {
      parts = line.split('=');
    } else if (line.includes(' - ')) {
      parts = line.split(' - ');
    } else if (line.includes(':') && !/^[A-Za-z0-9]+:/.test(line)) {
      parts = line.split(':');
    }

    if (parts.length >= 2) {
      const left = parts[0].replace(/^(?:\d+[:.]|[A-Za-z][).])\s*/, '').trim();
      const right = parts.slice(1).join('-').replace(/^(?:\d+[:.]|[A-Za-z][).])\s*/, '').trim();
      if (left && right) {
        pairs.push({
          id: generateId(),
          left,
          right,
        });
      }
    }
  }

  // If pairs detected, build matching question
  if (pairs.length >= 2) {
    return [{
      id: generateId(),
      type: 'matching',
      title,
      pairs,
      explanation: 'Connect each matching concept accurately.',
      points: pairs.length,
    }];
  }

  // Fallback sample pairs
  return [{
    id: generateId(),
    type: 'matching',
    title: 'Match each country to its capital city:',
    pairs: [
      { id: generateId(), left: 'France', right: 'Paris' },
      { id: generateId(), left: 'Japan', right: 'Tokyo' },
      { id: generateId(), left: 'Italy', right: 'Rome' },
      { id: generateId(), left: 'Canada', right: 'Ottawa' },
    ],
    explanation: 'Capital cities matched with their corresponding nations.',
    points: 4,
  }];
}

/**
 * Validates a list of questions and returns errors or warnings
 */
export function validateQuestions(questions: QuizQuestion[]): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!questions || questions.length === 0) {
    errors.push('Quiz must contain at least one question.');
    return { valid: false, errors, warnings };
  }

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    if (!q.title || !q.title.trim()) {
      errors.push(`Question #${qNum} title cannot be empty.`);
    }

    if (q.type === 'mcq') {
      if (!q.options || q.options.length < 2) {
        errors.push(`Question #${qNum} (MCQ) must have at least 2 answer choices.`);
      } else {
        const emptyOpts = q.options.filter(o => !o.trim());
        if (emptyOpts.length > 0) {
          warnings.push(`Question #${qNum} contains empty option labels.`);
        }
      }
      if (q.correctIndex < 0 || q.correctIndex >= (q.options?.length || 0)) {
        errors.push(`Question #${qNum} (MCQ) does not have a valid correct choice selected.`);
      }
    } else if (q.type === 'fill-blank') {
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        errors.push(`Question #${qNum} (Fill in Blank) requires an expected correct answer.`);
      }
      if (!q.title.includes('___') && !q.title.includes('______') && !q.title.includes('blank')) {
        warnings.push(`Question #${qNum} title does not clearly show where the blank is (tip: use '______').`);
      }
    } else if (q.type === 'matching') {
      if (!q.pairs || q.pairs.length < 2) {
        errors.push(`Question #${qNum} (Matching) must have at least 2 item pairs.`);
      } else {
        q.pairs.forEach((pair, pIdx) => {
          if (!pair.left.trim() || !pair.right.trim()) {
            errors.push(`Question #${qNum} Pair #${pIdx + 1} has missing left or right text.`);
          }
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
