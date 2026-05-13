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

export const CATEGORY_ICONS: Record<string, string> = {
  'All': '📊',
  'Investment Banking': '🏦',
  'Private Equity': '💼',
  'Asset Management': '📈',
  'Accounting': '🧮',
  'Consulting': '🎯',
  'Valuation': '💰',
  'Sales and Trading': '📉',
};
