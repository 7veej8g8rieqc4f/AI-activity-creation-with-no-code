export type QuestionType = 'true-false' | 'mcq' | 'fill-blank' | 'matching';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  explanation?: string;
  points?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: string[];
  correctIndex: number;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  correctAnswer: string;
  acceptedAnswers?: string[]; // alternative answers or synonyms
  caseSensitive?: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export type QuizQuestion =
  | TrueFalseQuestion
  | MCQQuestion
  | FillBlankQuestion
  | MatchingQuestion;

export type ButtonShape = 'rounded' | 'square' | 'pill';
export type ButtonSize = 'compact' | 'normal' | 'prominent';
export type ButtonHoverEffect = 'lift' | 'glow' | 'scale' | 'outline';

export type BackgroundType = 'solid' | 'gradient' | 'imageUrl' | 'imageUpload';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardShadow = 'none' | 'subtle' | 'medium' | 'elevated' | 'glow';
export type HeadingStyle = 'minimal' | 'accent-bar' | 'badge' | 'banner';
export type ThemePreset = 'slate' | 'minimal' | 'vibrant' | 'midnight' | 'emerald' | 'sunset' | 'cyber';

export interface DesignSettings {
  // Theme
  themePreset: ThemePreset;

  // Background
  backgroundType: BackgroundType;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  bgImageUrl: string;
  bgImageData?: string;
  bgOverlayOpacity: number; // 0 to 80%

  // Card / Layout
  cardBgColor: string;
  cardTextColor: string;
  cardBorderColor: string;
  cardRadius: CardRadius;
  cardShadow: CardShadow;
  cardMaxWidth: string; // '640px', '720px', '840px'
  alignment: 'left' | 'center';

  // Typography
  fontFamily: 'Inter' | 'Poppins' | 'Outfit' | 'Space Grotesk' | 'Playfair Display' | 'JetBrains Mono';
  fontSize: 'compact' | 'medium' | 'large';
  primaryTextColor: string;
  mutedTextColor: string;
  headingStyle: HeadingStyle;

  // Buttons
  primaryBtnBg: string;
  primaryBtnText: string;
  secondaryBtnBg: string;
  secondaryBtnText: string;
  buttonShape: ButtonShape;
  buttonSize: ButtonSize;
  buttonHoverEffect: ButtonHoverEffect;

  // Feedback Colors
  correctColor: string;
  incorrectColor: string;
  accentColor: string;

  // Behavior
  flowMode: 'stepper' | 'single-page';
  instantFeedback: boolean;
  enableSounds: boolean;
  enableTimer: boolean;
  timePerQuestionSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface QuizConfig {
  title: string;
  description: string;
  questionType: QuestionType | 'mixed';
  targetQuestionCount: number;
  questions: QuizQuestion[];
  design: DesignSettings;
}
