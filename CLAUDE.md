# Fite Finance — Project Context for Claude

## Overview
Finance interview prep tool at fitefinance.com. Users select a category, difficulty, and math preference to get AI-generated questions and answers. Premium users ($3/month via Stripe) get unlimited questions, AI answer grading, and question history.

## Tech Stack
- **Frontend**: React (Next.js 16, Pages Router)
- **Backend**: Vercel serverless functions (`/api/`)
- **Auth**: Clerk (`@clerk/clerk-react`)
- **Payments**: Stripe ($3/month subscription)
- **AI**: OpenAI gpt-4o-mini
- **Database**: Upstash Redis (via Vercel integration)
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel

## Dev Commands
```
npm run dev     — local dev server (localhost:3000)
npm run build   — production build
npm run start   — serve production build locally
```

## Security
Never read, display, or reference the contents of .env, .env.local, or any .env.* files.

## File Structure
```
/pages/
  _app.js          — ClerkProvider, PaidStatusProvider, Navbar, Analytics, global CSS
                     Navbar is hidden on "/" and "/features" (isLanding check)
  index.js         → Hero landing page (canvas scroll animation only)
  features.js      → Supplemental landing page (Features, How It Works, Pricing, CTA, Footer)
  success.js       → Success
  history.js       → History
  privacy.js       → PrivacyPolicy
  terms.js         → TermsOfService
  refunds.js       → RefundPolicy
  questions/[category]/[difficulty]/[math]/
    index.js       → Questions (no customPrompt)
    [customPrompt].js → Questions (with customPrompt)

/api/
  webhook.js            — Stripe webhook handler
  checkout.js           — Stripe checkout session creator
  portal.js             — Stripe customer portal
  checkPaid.js          — Checks if user has active subscription
  question.js           — Question + answer generation via OpenAI
  grade.js              — AI answer grading (premium only), returns {feedback}
  history.js            — GET/POST question history via Upstash Redis
  price.js              — Fetches dynamic Stripe price
  _constants.js         — Shared CATEGORIES array (prefixed _ so Vercel ignores it as a function)
  _openai.js            — Shared OpenAI client singleton (used by all AI endpoints)
  _questionBank.js      — Curated question bank by category/difficulty/math; exports sampleQuestions()
  interview-generate.js — Generates interview scenario + 4 structured questions with ideal answers
  interview-respond.js  — Evaluates a single candidate answer, returns {score, onTrack, response}
  interview-debrief.js  — Generates post-interview debrief after all 4 answers, returns {feedback}

/src/
  Navbar.js        — Shared navbar (SignIn, History, Manage Sub, Upgrade buttons)
  Home.js          — Category/difficulty/math selection + custom prompt
  Questions.js     — Question/answer/grading flow
  History.js       — Premium history page with stats, search, filters
  Success.js       — Post-payment success page
  ScrollToTop.js   — Scroll restoration on navigation
  PaidStatusContext.js — Context + provider for isPaid state
  usePaidStatus.js — Custom hook: returns { isPaid, loading }
  usePrice.js      — Custom hook: returns dynamic Stripe price string
  useUpgrade.js    — Custom hook: handles Stripe checkout redirect
  App.css          — All styles including mobile responsive classes
  index.css        — Base body/font styles
  constants.js     — Shared CATEGORIES array (frontend, ES module)
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
All, Investment Banking, Private Equity, Asset Management, Accounting, Consulting, Valuation, Sales and Trading

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
- `overscroll-behavior-x: none` in App.css (allows pull-to-refresh, blocks horizontal bounce)
- Hero page (`/`) additionally sets `overscroll-behavior-y: none` via inline `<style>` to prevent vertical rubber-band showing white space

## Environment Variables
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  — Clerk publishable key (client-safe)
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_URL=https://www.fitefinance.com
OPENAI_API_KEY
UPSTASH_REDIS_REST_URL (auto via Vercel)
UPSTASH_REDIS_REST_TOKEN (auto via Vercel)
```

## Routes
```
/                                                    → Hero landing page (canvas animation)
/features                                            → Supplemental landing page (features/pricing/CTA)
/questions/[category]/[difficulty]/[math]            → Questions (no customPrompt)
/questions/[category]/[difficulty]/[math]/[customPrompt] → Questions
/success                                             → Success (redirects non-paid to /)
/history                                             → History (redirects non-paid to /)
/privacy                                             → PrivacyPolicy
/terms                                               → TermsOfService
/refunds                                             → RefundPolicy
```

## Navigation
All navigation uses Next.js — not React Router:
- `useRouter()` from `next/router` (replaces `useNavigate`)
- `router.push("/path")` (replaces `navigate("/path")`)
- `router.query` (replaces `useParams()`)
- `Link href=` from `next/link` (replaces `Link to=` from react-router-dom)

## Premium Features
- Unlimited questions (free users: 5/day)
- AI answer grading with written feedback
- Question history page with stats, search, and filters
- Custom question descriptor input
- Interview Mode with sequential, structured follow-up questions + feedback
- Toggleable Timer feature for timed question answering
- Premium logo + gold PREMIUM badge

## Landing Page Architecture

The landing experience is split across two pages:

### Hero page (`pages/index.js`)
- **Scroll-driven canvas animation**: 111 JPEG frames in `/public/frames/` scrubbed via GSAP ScrollTrigger. Section height 600vh with a `position: sticky` 100vh viewport.
- **No scroll gate**: Users can scroll freely back and forth through the animation. No `scrollLockedRef` or wheel/touch event blockers.
- **Overlays driven by scroll progress**:
  - Hero text (bottom-left): exits p 0.18–0.28
  - Mid-scroll tagline: visible p 0.30–0.72
  - End-of-scroll product details + sign-up card: enters p 0.82–0.94
- **"Explore Features" CTA**: always visible (bottom-center, fixed to sticky viewport). Clicking navigates to `/features` via `router.push`.
- **Entry animation**: Full-screen dark cover slides **upward** (translateY(0) → translateY(-100%)) on every page load, with a glowing cyan sweep line at its departing edge. `heroTextIn` delayed to 650ms to sync with the cover clearing.
- **Overscroll**: `body { overscroll-behavior-y: none }` + `html, body { background: #020817 }` prevents white flash.
- **Design tokens** (shared with features page): `C.bg = #020817`, `C.primary = #1565C0`, `C.secondary = #4FC3F7`, `C.gold = #c9a84c`.

### Supplemental features page (`pages/features.js`)
- Contains: Features grid, How It Works, Pricing, CTA section, Footer.
- All helper components live here (ScrollReveal, SectionScan, GlowCard, ScrambleText, CountUp, AnimatedBar) — not in index.js.
- **"← Back" button**: fixed top-left, glassmorphism style, routes to `/`.
- **Entry animation**: Same dark cover but slides **downward** (translateY(0) → translateY(100%)), glow line on the top edge, revealing the page from top down.
- Navbar is hidden here (same as `/`) via `isLanding` check in `_app.js`.

### LandingPage.css (`src/LandingPage.css`)
Imported globally via `_app.js`. Covers: mid-tag and end-details spawn keyframes, hero/feat/how/pricing grid layouts, button variants (`lp-btn-*`), glass card styles, footer layout.

## Interview Mode (API-complete, no frontend page yet)
Three new API endpoints power a structured mock interview feature:

- `POST /api/interview-generate` — takes `{ category, difficulty, math, customPrompt }`, returns `{ scenario, questions: [{question, idealAnswer}x4], resolvedCategory }`
- `POST /api/interview-respond` — takes `{ scenario, questionIndex, question, idealAnswer, userAnswer, isLast }`, returns `{ score (0–10), onTrack (bool), response (interviewer reply) }`
- `POST /api/interview-debrief` — takes `{ scenario, questions: [{question, idealAnswer, userAnswer, score}], category, difficulty }`, returns `{ feedback }` (4–6 sentence holistic debrief)

The interview flow: generate scenario → loop through 4 questions calling respond → call debrief once complete.

## Shared Constants
Categories are now centralized:
- `src/constants.js` — ES module export, used by frontend
- `api/_constants.js` — CommonJS export, used by `question.js` and `interview-generate.js`

Both must stay in sync if categories change.

## Question Bank (`api/_questionBank.js`)
A curated bank of finance interview questions used to inject few-shot calibration examples into question generation prompts, so GPT sees real examples of the target difficulty/category instead of guessing.

- Each entry: `{ q: string, math: boolean }`
- Organized by category → difficulty (Easy / Medium / Hard)
- Covers: Investment Banking, Private Equity, Asset Management, Accounting, Consulting, Valuation, Sales and Trading
- `sampleQuestions(category, difficulty, math, n)` — returns `n` randomly sampled question strings with fallback logic:
  1. Category + difficulty + math match
  2. Category + difficulty (any math)
  3. Cross-category at this difficulty + math match
  4. Cross-category at this difficulty
  5. Empty array (graceful — prompt just won't include examples)
- Used by `question.js` (3 examples, `type === "question"` only) and `interview-generate.js` (2 examples)
- To add a new category: add a key matching a value in CATEGORIES with Easy/Medium/Hard arrays; aim for 5+ questions per tier

## Shared OpenAI Client (`api/_openai.js`)
All AI endpoints import the OpenAI client from `api/_openai.js` rather than instantiating their own. Do not add `new OpenAI(...)` to individual endpoint files.

## JSON Parse Safety (interview endpoints)
`interview-generate.js` and `interview-respond.js` both sanitize GPT output before parsing to handle cases where the model wraps JSON in markdown fences:
```js
const clean = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
const parsed = JSON.parse(clean);
```

## Legal Pages
`PrivacyPolicy.js`, `TermsOfService.js`, `RefundPolicy.js` all use the same pattern:
- Content stored as a markdown template string in the file
- Rendered with `react-markdown`
- Last updated: April 2026

## Clerk OAuth
Google OAuth redirect URI: `https://clerk.fitefinance.com/v1/oauth_callback`
