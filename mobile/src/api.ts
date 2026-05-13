import { API_BASE } from './constants';

// All API calls go to fitefinance.com/api/* — same backend as the web app.
// Clerk session token is passed as Bearer in Authorization header.

async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
}

// ─── Auth / Paid Status ───────────────────────────────────────────────────────

export async function checkPaid(token: string): Promise<boolean> {
  try {
    const res = await apiFetch('/checkPaid', { method: 'POST', token });
    if (!res.ok) return false;
    const data = await res.json();
    return data.isPaid === true;
  } catch {
    return false;
  }
}

// ─── Price ────────────────────────────────────────────────────────────────────

export async function getPrice(): Promise<string> {
  try {
    const res = await apiFetch('/price');
    if (!res.ok) return '$3.00/month';
    const data = await res.json();
    return `$${(data.amount / 100).toFixed(2)}/${data.interval}`;
  } catch {
    return '$3.00/month';
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function createCheckout(token: string): Promise<string | null> {
  try {
    const res = await apiFetch('/checkout', { method: 'POST', token });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────

export interface QuestionResult {
  question: string;
  questionsUsed?: number;
  questionsLimit?: number;
}

export async function generateQuestion(params: {
  category: string;
  difficulty: string;
  math: string;
  customPrompt?: string;
  token?: string;
  onChunk?: (text: string) => void;
}): Promise<QuestionResult> {
  const { category, difficulty, math, customPrompt, token, onChunk } = params;

  const body = JSON.stringify({
    type: 'question',
    category,
    difficulty,
    math,
    customPrompt: customPrompt || undefined,
    stream: !!onChunk,
  });

  if (onChunk) {
    // Streaming mode
    const res = await apiFetch('/question', { method: 'POST', body, token });
    if (!res.ok) throw new Error('Failed to generate question');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let question = '';
    let questionsUsed: number | undefined;
    let questionsLimit: number | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.question) {
            question += parsed.question;
            onChunk(question);
          }
          if (parsed.questionsUsed !== undefined) questionsUsed = parsed.questionsUsed;
          if (parsed.questionsLimit !== undefined) questionsLimit = parsed.questionsLimit;
        } catch {}
      }
    }

    return { question, questionsUsed, questionsLimit };
  } else {
    const res = await apiFetch('/question', { method: 'POST', body, token });
    if (!res.ok) throw new Error('Failed to generate question');
    const data = await res.json();
    return { question: data.question, questionsUsed: data.questionsUsed, questionsLimit: data.questionsLimit };
  }
}

export async function generateAnswer(params: {
  question: string;
  category: string;
  difficulty: string;
  math: string;
  token?: string;
  onChunk?: (text: string) => void;
}): Promise<string> {
  const { question, category, difficulty, math, token, onChunk } = params;

  const body = JSON.stringify({
    type: 'answer',
    question,
    category,
    difficulty,
    math,
    stream: !!onChunk,
  });

  if (onChunk) {
    const res = await apiFetch('/question', { method: 'POST', body, token });
    if (!res.ok) throw new Error('Failed to generate answer');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let answer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.answer) {
            answer += parsed.answer;
            onChunk(answer);
          }
        } catch {}
      }
    }
    return answer;
  } else {
    const res = await apiFetch('/question', { method: 'POST', body, token });
    if (!res.ok) throw new Error('Failed to generate answer');
    const data = await res.json();
    return data.answer;
  }
}

// ─── Grading ──────────────────────────────────────────────────────────────────

export interface GradeResult {
  feedback: string;
  score: number;
}

export async function gradeAnswer(params: {
  question: string;
  userAnswer: string;
  idealAnswer: string;
  token: string;
}): Promise<GradeResult> {
  const res = await apiFetch('/grade', {
    method: 'POST',
    body: JSON.stringify(params),
    token: params.token,
  });
  if (!res.ok) throw new Error('Failed to grade answer');
  return res.json();
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  question?: string;
  answer?: string;
  userAnswer?: string;
  feedback?: string;
  score?: number;
  category?: string;
  difficulty?: string;
  math?: string;
  customPrompt?: string;
  timeTaken?: number;
  timeRemaining?: number;
  timestamp: number;
  type?: 'interview';
  scenario?: string;
  questions?: InterviewQuestion[];
}

export interface InterviewQuestion {
  question: string;
  idealAnswer: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

export async function getHistory(token: string): Promise<HistoryEntry[]> {
  const res = await apiFetch('/history', { method: 'GET', token });
  if (!res.ok) return [];
  const data = await res.json();
  return data.history ?? [];
}

export async function saveHistory(entry: HistoryEntry, token: string): Promise<void> {
  await apiFetch('/history', {
    method: 'POST',
    body: JSON.stringify({ entry }),
    token,
  });
}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface InterviewSession {
  scenario: string;
  questions: { question: string; idealAnswer: string }[];
  resolvedCategory: string;
}

export async function generateInterview(params: {
  category: string;
  difficulty: string;
  math: string;
  customPrompt?: string;
  token: string;
}): Promise<InterviewSession> {
  const res = await apiFetch('/interview', {
    method: 'POST',
    body: JSON.stringify({ action: 'generate', ...params }),
    token: params.token,
  });
  if (!res.ok) throw new Error('Failed to generate interview');
  return res.json();
}

export interface InterviewResponse {
  score: number;
  onTrack: boolean;
  response: string;
}

export async function respondToInterview(params: {
  scenario: string;
  questionIndex: number;
  question: string;
  idealAnswer: string;
  userAnswer: string;
  isLast: boolean;
  token: string;
}): Promise<InterviewResponse> {
  const res = await apiFetch('/interview', {
    method: 'POST',
    body: JSON.stringify({ action: 'respond', ...params }),
    token: params.token,
  });
  if (!res.ok) throw new Error('Failed to get interview response');
  return res.json();
}

export async function debriefInterview(params: {
  scenario: string;
  questions: { question: string; idealAnswer: string; userAnswer?: string }[];
  category: string;
  difficulty: string;
  token: string;
}): Promise<{ feedback: string }> {
  const res = await apiFetch('/interview', {
    method: 'POST',
    body: JSON.stringify({ action: 'debrief', ...params }),
    token: params.token,
  });
  if (!res.ok) throw new Error('Failed to get debrief');
  return res.json();
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(params: {
  type: 'feedback' | 'vote';
  message: string;
  token?: string;
}): Promise<void> {
  await apiFetch('/feedback', {
    method: 'POST',
    body: JSON.stringify({ type: params.type, message: params.message }),
    token: params.token,
  });
}
