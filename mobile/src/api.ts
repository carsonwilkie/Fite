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

  const bodyStr = JSON.stringify({
    type: 'question',
    category,
    difficulty,
    math,
    customPrompt: customPrompt || undefined,
    stream: true,
  });

  // Use XHR instead of fetch — React Native fetch doesn't support ReadableStream,
  // but XHR fires onprogress as SSE chunks arrive, keeping the connection alive
  // past Vercel's 10s function timeout.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/question`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    let processed = 0;
    let question = '';
    let questionsUsed: number | undefined;
    let questionsLimit: number | undefined;

    xhr.onprogress = () => {
      const chunk = xhr.responseText.slice(processed);
      processed = xhr.responseText.length;
      console.log('XHR progress chunk length:', chunk.length, '| preview:', chunk.slice(0, 80));
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.text) { question = parsed.text; onChunk?.(question); }
          if (parsed.questionsUsed !== undefined) questionsUsed = parsed.questionsUsed;
          if (parsed.questionsLimit !== undefined) questionsLimit = parsed.questionsLimit;
        } catch {}
      }
    };

    xhr.onload = () => {
      console.log('XHR onload status:', xhr.status, '| question length:', question.length, '| body preview:', xhr.responseText.slice(0, 200));
      if (xhr.status >= 400) {
        reject(new Error(`Failed to generate question (${xhr.status})`));
      } else {
        resolve({ question, questionsUsed, questionsLimit });
      }
    };

    xhr.onerror = () => reject(new Error('Network error generating question'));
    xhr.ontimeout = () => reject(new Error('Request timed out'));
    xhr.timeout = 60000;
    xhr.send(bodyStr);
  });
}

export async function generateAnswer(params: {
  question: string;
  category: string;
  difficulty: string;
  math: string;
  token?: string;
  onChunk?: (text: string) => void;
}): Promise<string> {
  const { question, category, difficulty, math, token } = params;

  const res = await apiFetch('/question', {
    method: 'POST',
    body: JSON.stringify({ type: 'answer', question, category, difficulty, math }),
    token,
  });

  if (!res.ok) throw new Error(`Failed to generate answer (${res.status})`);
  const data = await res.json();
  const text: string = data.result ?? '';
  return text;
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
  // Web returns { entries }; older callers may have used `history`.
  return data.entries ?? data.history ?? [];
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

// ─── IB 400 Question Bank ─────────────────────────────────────────────────────

export interface IBQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export async function getIBQuestions(token: string): Promise<IBQuestion[]> {
  const res = await apiFetch('/ib-questions', { method: 'GET', token });
  if (!res.ok) return [];
  const data = await res.json();
  return data.questions ?? [];
}

export interface IBProgressEntry {
  score: number | null;
  timestamp: number;
}

export async function getIBProgress(token: string): Promise<Record<string, IBProgressEntry>> {
  const res = await apiFetch('/history?scope=ib', { method: 'GET', token });
  if (!res.ok) return {};
  const data = await res.json();
  return data.progress ?? {};
}

export async function saveIBProgress(params: {
  questionId: string;
  score: number | null;
  token: string;
}): Promise<void> {
  await apiFetch('/history?scope=ib', {
    method: 'POST',
    body: JSON.stringify({
      questionId: params.questionId,
      score: params.score,
      timestamp: Date.now(),
    }),
    token: params.token,
  });
}

export async function resetIBProgress(questionId: string | null, token: string): Promise<void> {
  const path = questionId
    ? `/history?scope=ib&questionId=${encodeURIComponent(questionId)}`
    : '/history?scope=ib';
  await apiFetch(path, { method: 'DELETE', token });
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
