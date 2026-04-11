# Fite Finance — Project Context for Claude

## Overview
Finance interview prep tool at fitefinance.com. Users select a category, difficulty, and math preference to get AI-generated questions and answers. Premium users ($3/month via Stripe) get unlimited questions, AI answer grading, and question history.

## Tech Stack
- **Frontend**: React (Create React App)
- **Backend**: Vercel serverless functions (`/api/`)
- **Auth**: Clerk
- **Payments**: Stripe ($3/month subscription)
- **AI**: OpenAI gpt-4o-mini
- **Database**: Upstash Redis (via Vercel integration)
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel

## Security
Never read, display, or reference the contents of .env, .env.local, or any .env.* files.

## File Structure
```
/api/
  webhook.js            — Stripe webhook handler
  checkout.js           — Stripe checkout session creator
  portal.js             — Stripe customer portal
  checkPaid.js          — Checks if user has active subscription
  question.js           — Question + answer generation via OpenAI
  grade.js              — AI answer grading (premium only), returns {feedback}
  history.js            — GET/POST question history via Upstash Redis
  price.js              — Fetches dynamic Stripe price
  constants.js          — Shared CATEGORIES array (used by question.js, interview endpoints)
  interview-generate.js — Generates interview scenario + 4 structured questions with ideal answers
  interview-respond.js  — Evaluates a single candidate answer, returns {score, onTrack, response}
  interview-debrief.js  — Generates post-interview debrief after all 4 answers, returns {feedback}

/src/
  App.js           — Router, renders Navbar + Analytics + SpeedInsights once
  Navbar.js        — Shared navbar (SignIn, History, Manage Sub, Upgrade buttons)
  Home.js          — Category/difficulty/math selection + custom prompt
  Questions.js     — Question/answer/grading flow
  History.js       — Premium history page with stats, search, filters
  Success.js       — Post-payment success page
  ScrollToTop.js   — Scroll restoration on navigation
  usePaidStatus.js — Custom hook: returns { isPaid, loading }
  usePrice.js      — Custom hook: returns dynamic Stripe price string
  App.css          — All styles including mobile responsive classes
  constants.js     — Shared CATEGORIES array (frontend)
  ElectricBorder.js    — Animated electric border wrapper component (active prop toggles animation)
  LightsaberLoader.js  — Progress bar styled as a lightsaber (accepts percent 0–1)
  PremiumBadge.js      — Gold PREMIUM badge component (small prop for compact variant)
  PrivacyPolicy.js     — Privacy policy page (rendered via react-markdown)
  TermsOfService.js    — Terms of service page (rendered via react-markdown)
  RefundPolicy.js      — Refund policy page (rendered via react-markdown)

/public/
  Background.png
  Fite_Logo_Premium.png
  favicon.png
```

## Categories
All, Investment Banking, Private Equity, Asset Management, Accounting, Financial Modeling, Valuation, Sales and Trading

## Key Patterns

### Page wrapper (all pages)
```jsx
<div style={styles.page} className="page-bg page-wrapper">
  <div style={{ backgroundColor: "#f0f4f8", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "728px", boxSizing: "border-box", marginBottom: "16px", boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)" }} className="wrapper-mobile">
```

### Color palette
- Dark navy: `#0a2463`
- Medium blue: `#4a6fa5`
- Light blue bg: `#e8edf5`
- Page bg: `#f0f4f8`
- Gold (premium): `#c9a84c`
- Text dark: `#1a1a2e`

### usePaidStatus
Returns `{ isPaid, loading }`. Always check `loading` before using `isPaid` to avoid flash of wrong state.

### History entry shape (Redis)
```json
{
  "question": "...",
  "answer": "...",
  "userAnswer": "...",
  "feedback": "...",
  "category": "Investment Banking",
  "difficulty": "Hard",
  "math": "With Math",
  "customPrompt": "LBO modeling",
  "timestamp": 1234567890000
}
```

### History storage
- Key: `history:${userId}` in Upstash Redis
- Stored as JSON strings in a Redis list
- Max 100 entries per user (ltrim)
- GET: `?userId=` query param
- POST: `{ userId, entry }` body

### Questions.js — key state
```js
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
const [userAnswer, setUserAnswer] = useState("");
const [feedback, setFeedback] = useState("");
const [graded, setGraded] = useState(false);
const [loadingQuestion, setLoadingQuestion] = useState(false);
const [loadingAnswer, setLoadingAnswer] = useState(false);
const [loadingFeedback, setLoadingFeedback] = useState(false);
const [answerRevealed, setAnswerRevealed] = useState(false);
const answerRef = React.useRef(answer); // keeps answer in sync for handleGrade
```

### handleGrade saves to history
History is saved inside `handleGrade` (not on question load) so `userAnswer` and `feedback` are always captured. Uses `answerRef.current` to ensure answer is included even if user graded before clicking Show Answer.

### Anti-repeat logic
Questions are stored in `localStorage` as `questionHistory`. Questions asked in the last 24 hours are skipped (up to 5 retry attempts).

### Session memory
`difficulty` and `math` selections persist via `sessionStorage` (reset on tab close). `customPrompt` resets on page load.

## App.css Key Classes
```css
.page-bg::before       — fixed background image (iOS Safari compatible)
.navbar-transparent    — pointer-events: none on desktop (transparent navbar)
.navbar-fixed          — flex layout for navbar
.byline-fixed          — "by Colgate's finest" in navbar (hidden on mobile)
.byline-bottom         — shown below support email on mobile only
.manage-sub-btn        — smaller button for navbar actions
.wrapper-mobile        — full width, reduced padding on mobile
.card-mobile           — reduced padding on mobile
.grid-mobile           — 2-col grid on mobile
.history-answer        — smaller font/spacing for AI answer in history
```

## Mobile Behavior
- Navbar switches from `position: fixed` (transparent, desktop) to `position: relative` (mobile)
- `.byline-fixed` hidden on mobile; `.byline-bottom` shown below support email
- `overscroll-behavior-x: none` (allows pull-to-refresh, blocks horizontal bounce)

## Environment Variables
```
REACT_APP_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
REACT_APP_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_URL=https://www.fitefinance.com
OPENAI_API_KEY
UPSTASH_REDIS_REST_URL (auto via Vercel)
UPSTASH_REDIS_REST_TOKEN (auto via Vercel)
```

## Routes
```
/                          → Home
/questions/:category/:difficulty/:math/:customPrompt → Questions
/questions/:category/:difficulty/:math               → Questions
/success                   → Success (redirects non-paid to /)
/history                   → History (redirects non-paid to /)
/privacy                   → PrivacyPolicy
/terms                     → TermsOfService
/refunds                   → RefundPolicy
```

## Premium Features
- Unlimited questions (free users: 5/day)
- AI answer grading with written feedback
- Question history page with stats, search, and filters
- Custom question descriptor input
- Interview Mode with sequential, structured follow-up questions + feedback
- Toggleable Timer feature for timed question answering
- Premium logo + gold PREMIUM badge

## Interview Mode (API-complete, no frontend page yet)
Three new API endpoints power a structured mock interview feature:

- `POST /api/interview-generate` — takes `{ category, difficulty, math, customPrompt }`, returns `{ scenario, questions: [{question, idealAnswer}x4], resolvedCategory }`
- `POST /api/interview-respond` — takes `{ scenario, questionIndex, question, idealAnswer, userAnswer, isLast }`, returns `{ score (0–10), onTrack (bool), response (interviewer reply) }`
- `POST /api/interview-debrief` — takes `{ scenario, questions: [{question, idealAnswer, userAnswer, score}], category, difficulty }`, returns `{ feedback }` (4–6 sentence holistic debrief)

The interview flow: generate scenario → loop through 4 questions calling respond → call debrief once complete.

## Shared Constants
Categories are now centralized:
- `src/constants.js` — ES module export, used by frontend
- `api/constants.js` — CommonJS export, used by `question.js` and `interview-generate.js`

Both must stay in sync if categories change.

## Legal Pages
`PrivacyPolicy.js`, `TermsOfService.js`, `RefundPolicy.js` all use the same pattern:
- Content stored as a markdown template string in the file
- Rendered with `react-markdown`
- Last updated: April 2026

## Clerk OAuth
Google OAuth redirect URI: `https://clerk.fitefinance.com/v1/oauth_callback`
