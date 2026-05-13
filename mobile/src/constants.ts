export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const QUESTION_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'OTG'] as const;

export type Difficulty = typeof DIFFICULTIES[number];
export type QuestionDifficulty = typeof QUESTION_DIFFICULTIES[number];

export const CATEGORIES = [
  'All',
  'Investment Banking',
  'Private Equity',
  'Asset Management',
  'Accounting',
  'Consulting',
  'Valuation',
  'Sales and Trading',
] as const;

export type Category = typeof CATEGORIES[number];

// IB 400 uses concrete categories only (no "All").
export const IB_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

export const MATH_OPTIONS = ['No Math', 'With Math'] as const;
export type MathOption = typeof MATH_OPTIONS[number];

export const TIMER_PRESETS = [60, 120, 180, 300] as const;
export const INTERVIEW_QUESTIONS = 4;

export const FREE_DAILY_LIMIT = 5;

export const API_BASE = 'https://fitefinance.com/api';

export const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  OTG: '#4FC3F7',
};

// Material/Ionicon names for each category. Used by <Icon>.
// Source family: Ionicons (good built-in coverage in @expo/vector-icons).
export const CATEGORY_ICONS: Record<string, string> = {
  All: 'apps-outline',
  'Investment Banking': 'business-outline',
  'Private Equity': 'briefcase-outline',
  'Asset Management': 'trending-up-outline',
  Accounting: 'calculator-outline',
  Consulting: 'compass-outline',
  Valuation: 'cash-outline',
  'Sales and Trading': 'pulse-outline',
};

// Short, branded subtitles per category.
export const CATEGORY_SUBTITLES: Record<string, string> = {
  All: 'Mixed bank',
  'Investment Banking': 'M&A · IPOs · debt',
  'Private Equity': 'LBOs · returns · funds',
  'Asset Management': 'Public markets · funds',
  Accounting: 'Statements · GAAP',
  Consulting: 'Cases · frameworks',
  Valuation: 'DCF · multiples · LBO',
  'Sales and Trading': 'Markets · products',
};

export const ROADMAP_IDEAS = [
  { title: 'Adaptive difficulty', desc: 'Questions get harder as you nail them.' },
  { title: 'Live mock interviews', desc: '1:1 voice interviews with AI examiners.' },
  { title: 'Deep analytics', desc: 'Where you bleed points — by sub-topic.' },
  { title: 'Guided study plans', desc: 'Day-by-day plans for IB/PE/AM superdays.' },
  { title: 'Modeling practice', desc: 'In-app LBO and DCF drills.' },
  { title: 'Peer leaderboards', desc: 'Compete with the cohort week-over-week.' },
];
