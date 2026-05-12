# Prompt: Build the 400 IB Questions Feature for Fite Finance

You are building a new feature for **Fite Finance** (`fitefinance.com`), a finance interview prep app. Below is all the context you need. Read it carefully before writing a single line of code.

---

## What to Build

A new page — `/ibQuestions` — where users can practice the classic "400 Investment Banking Questions." Each question comes from a pre-built static bank. Users can reveal AI-generated model answers and (if premium) submit their own written answer for AI grading. Progress is persisted per-user in Redis.

This page is **only reachable via an explicit link from the Dashboard** — it should not appear in any nav, sitemap, or other surface.

---

## Tech Stack

- **Framework**: Next.js 16.2.3 (Pages Router), React 19, `motion/react`
- **Auth**: Clerk via `@clerk/nextjs`
- **AI**: OpenAI `gpt-4o-mini` via `openai` SDK
- **Data**: Upstash Redis
- **Payments**: Stripe (subscription gating)
- **Styling**: Plain CSS (no Tailwind), `Manrope` + `Inter` fonts, Material Symbols icons

---

## Critical Constraint: 12 Serverless Function Limit

The project is on Vercel Hobby and is **already at the 12-function cap**. Every file under `pages/api/` counts as one function. The current 12 are:

```
admin-users.js, checkPaid.js, checkout.js, feedback.js, grade.js,
history.js, interview.js, portal.js, price.js, question.js,
total-questions.js, webhook.js
```

**You must not create any new files under `pages/api/`.** All new server-side logic must be folded into existing API routes.

---

## Files to Create

```
pages/ib-questions.js          ← thin Next.js page wrapper
src/IBQuestions.js             ← main page component (like Dashboard.js)
src/ibQuestions.js             ← static question bank (provided separately, see format below)
```

---

## Files to Modify

```
pages/api/history.js           ← extend to handle IB progress (see schema below)
src/Dashboard.js               ← add navigation link to the new page
src/App.css                    ← any new shared styles needed
```

---

## Static Question Bank Format

`src/ibQuestions.js` will already exist when you work on this. It exports:

```js
export const IB_QUESTIONS = [
  {
    id: "ib_001",
    question: "Walk me through a DCF.",
    category: "Valuation",
    difficulty: "Medium",   // "Easy" | "Medium" | "Hard" | null
  },
  // ...up to ~400 entries
];
```

Categories used in the bank:
- `"Accounting"`
- `"Valuation"`
- `"DCF"`
- `"LBO"`
- `"M&A"`
- `"Debt & Capital Structure"`
- `"Markets"`
- `"Brain Teasers"`

---

## Progress Persistence — Redis Schema Extension

Progress is stored in a **Redis hash** separate from the main history list:

- **Key**: `ib_progress:${userId}`
- **Field**: `questionId` (e.g. `"ib_001"`)
- **Value**: JSON string — `{ score: 8, timestamp: 1710000000000 }`

A question is considered "completed" if it has any entry in this hash (even if the user only revealed the answer without grading; score can be `null` in that case).

### Extending `pages/api/history.js`

Add a `scope` discriminator to the existing route:

**`GET /api/history?scope=ib`**
- Requires authenticated Clerk user (use existing `requireAuthenticatedUserId`)
- Calls `HGETALL ib_progress:${userId}`
- Returns `{ progress: { ib_001: { score: 8, timestamp: ... }, ... } }` or `{ progress: {} }` if none

**`POST /api/history` with body `{ scope: "ib", questionId, score, timestamp }`**
- Requires authenticated Clerk user
- Calls `HSET ib_progress:${userId} questionId JSON.stringify({ score, timestamp })`
- Returns `{ ok: true }`

The existing `GET /api/history` (no scope) and `POST /api/history` with `{ entry }` (no scope) must remain **completely unchanged** — the new scope logic is purely additive.

---

## Reusing Existing API Routes (No Changes Needed)

**Answer generation** — call `POST /api/question` exactly as the dashboard does, with:
```json
{ "type": "answer", "question": "<question text>", "difficulty": "<difficulty>" }
```
This already handles streaming. Wire it up identically to how `Dashboard.js` calls it.

**Grading** — call `POST /api/grade` exactly as the dashboard does, with:
```json
{ "question": "<question text>", "userAnswer": "<user's answer>", "idealAnswer": "<model answer>" }
```
Grading is **premium-only** (same as the dashboard). Use `usePaidStatus()` to gate the grading UI.

---

## Page Structure & UX

### Layout
Mirror the dashboard's dark aesthetic. Use the existing CSS variables and palette:
- Background: `#020817`
- Surface/card: `#0d1b2a`
- Primary: `#1565C0`
- Accent/cyan: `#4FC3F7`
- Gold: `#c9a84c`
- Font: `Manrope` for labels, `Inter` for body text

### Left panel — Question List
- Search input (filters by question text)
- Category filter buttons (All + each category from the bank)
- Difficulty filter (All / Easy / Medium / Hard)
- Scrollable list of question cards showing:
  - Question number (e.g. `#001`)
  - Category badge
  - Difficulty badge
  - A green checkmark + score badge if completed (score can be shown as `8/10` or just `✓` if score is null)
  - Truncated question preview text
- Progress summary at top: `X / 400 completed` with a thin progress bar

### Right panel — Active Question
When a question is selected from the list:

1. **Question display** — full question text at top
2. **"Reveal Model Answer" button** — triggers streaming answer generation from `/api/question`. Once revealed, the markdown answer renders below (use the same markdown rendering as the dashboard uses for answers). Revealing an answer marks the question as completed in Redis (score: null) if not already saved.
3. **Answer input textarea** — labeled "Your Answer" — always visible below the model answer once revealed
4. **"Grade My Answer" button** — premium only. Sends to `/api/grade`. Shows score (X/10) and feedback inline. On successful grade, saves `{ score, timestamp }` to Redis via the extended history endpoint.
5. **Upgrade CTA** — if user is not premium, show a locked state on the grading section with a brief upsell prompt (reuse `useUpgrade()` hook for the upgrade action)

### State per question
Track locally (React state, not persisted unless graded):
- `answerRevealed: boolean`
- `modelAnswer: string`
- `userAnswer: string`
- `feedback: string`
- `score: number | null`
- `graded: boolean`
- Loading flags for answer streaming and grading

When switching to a different question, reset local state. Pre-populate `score` from Redis progress if a saved score exists, so returning users see their prior result.

### Mobile
- Single-column layout: question list collapses into a bottom sheet or a back-navigable "list view" vs "question view"
- Follow the same responsive pattern used in `Dashboard.js` for the mobile drawer

---

## Navigation — Adding the Link in Dashboard

In `src/Dashboard.js`, add an "IB 400" navigation link in the **left desktop sidebar** (near the existing History/Stats links) and in the **mobile bottom nav**. Use `next/link` pointing to `/ib-questions`. Use a relevant Material Symbol icon (e.g. `menu_book` or `format_list_numbered`).

The link should be visible to **all signed-in users** (not gated behind premium), since answer-reveal is free. Only grading inside the page is premium-gated.

---

## Page Entry Guard

`pages/ib-questions.js` should:
- Use Clerk's `useUser()` — if not signed in, redirect to `/sign-in?redirect_url=/ib-questions`
- Render `<IBQuestions />` when authenticated
- Include appropriate `<Head>` meta (`noindex` is fine — this is an app page not a marketing page)

---

## Auth & Server Helpers

Use the existing helpers from `src/server/auth.js`:
```js
import { requireAuthenticatedUserId } from "../src/server/auth";
```

For client-side auth state, use Clerk's `useUser()` and `useAuth()` hooks as already done throughout the app. For paid status, use `usePaidStatus()` from `src/usePaidStatus.js`.

---

## Animation

Use `motion/react` (already installed) for:
- Fade-in on question panel when a question is selected
- Smooth reveal animation when the model answer streams in
- Keep animations subtle — match the dashboard's existing motion style

Do **not** use GSAP here — that's only for the landing page hero.

---

## What NOT to Do

- Do not create any new file under `pages/api/`
- Do not modify `pages/api/webhook.js`, `pages/api/checkout.js`, `pages/api/checkPaid.js`, or `pages/api/grade.js`
- Do not add this page to `pages/sitemap.xml.js`
- Do not add a link to this page in `src/LandingNav.js` or `pages/features.js`
- Do not use Tailwind (not installed)
- Do not use `localStorage` for progress — it must go through Redis via the extended history endpoint
- Do not import `src/Navbar.js` — it was deleted; the dashboard has its own nav

---

## Existing Patterns to Mirror

Before writing any component code, read these files to understand conventions:
- `src/Dashboard.js` — main app component, state management, API call patterns, streaming, grading UX
- `pages/api/history.js` — Redis patterns, Clerk auth integration
- `pages/api/question.js` — answer generation call structure and streaming
- `src/PaidStatusContext.js` — how paid status is provided and consumed
- `src/App.css` — global dark-theme CSS variables and utility classes

---

## Deliverables

1. `pages/ib-questions.js` — page wrapper
2. `src/IBQuestions.js` — full page component
3. `pages/api/history.js` — modified with IB progress scope (additive only)
4. `src/Dashboard.js` — modified with IB 400 nav link
5. Any new CSS added to `src/App.css`

Start by reading the files listed under "Existing Patterns to Mirror" before writing any code.
