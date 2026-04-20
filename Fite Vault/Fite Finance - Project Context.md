
## Overview

Fite Finance is a finance interview prep app at `fitefinance.com`. The product combines a cinematic landing experience with a dark-theme practice dashboard where users can generate finance questions, reveal model answers, get AI grading, run structured mock interviews, review saved history, and inspect stats.

  

Free users are limited to 5 generated questions per day. Premium users unlock unlimited question generation, answer grading, history, stats, interview mode, custom descriptors, and the timer.

  

## Tech Stack

- Frontend: Next.js 16.2.3 (Pages Router), React 19, `motion/react`

- Backend: Vercel serverless functions in `/api`

- Auth: Clerk via `@clerk/clerk-react`

- Payments: Stripe subscriptions + Stripe Billing Portal

- AI: OpenAI via `openai` SDK, currently using `gpt-4o-mini`

- Data: Upstash Redis

- Analytics: Vercel Analytics + Speed Insights

- Animation: GSAP ScrollTrigger on the landing hero

  

## Dev Commands

```bash

npm run dev

npm run build

npm run start

```

  

## Security

Never read, display, or reference the contents of `.env`, `.env.local`, or any `.env.*` file.

  

## Current Route Map

```text

/ → Animated landing page

/features → Supplemental marketing/features page

/dashboard → Main practice dashboard

/history → Premium history page

/stats → Premium stats page

/success → Premium success page (redirects non-paid users home)

/privacy → Privacy policy

/terms → Terms of service

/refunds → Refund policy

```

  

Notes:

- Legacy redirect routes like `/practice` and the old `/questions/...` routes were removed.

- There is no shared runtime navbar file anymore; `src/Navbar.js` was deleted.

  

## App Shell

  

### `pages/_app.js`

- Wraps the app in `ClerkProvider` and `PaidStatusProvider`

- Mounts Vercel Analytics and Speed Insights

- Mounts `ScrollToTop`

- Imports `src/index.css`, `src/App.css`, and `src/LandingPage.css`

- Implements the full-page transition cover used between routes

  

### Global page transition

- The app uses a dark fixed overlay that animates with `translateY`

- Initial entry reveals upward after a short delay

- Route changes first cover the old page, then reveal the new page

- Hero routes use a slightly different reveal timing via `isHeroRoute()`

  

### `pages/_document.js`

- Loads Google Fonts for `Inter`, `Manrope`, and `Material Symbols Outlined`

  

## File Structure

```text

/pages

_app.js

_document.js

dashboard.js

features.js

history.js

index.js

privacy.js

refunds.js

stats.js

success.js

terms.js

  

/src

App.css

Dashboard.js

HistoryDark.js

LandingNav.js

LandingPage.css

LightsaberLoader.js

PaidStatusContext.js

PrivacyPolicy.js

RefundPolicy.js

ScrollToTop.js

StatsPage.js

Success.js

TermsOfService.js

constants.js

index.css

usePaidStatus.js

usePrice.js

useStableViewport.js

useUpgrade.js

  

/api

_constants.js

_openai.js

_questionBank.js

checkPaid.js

checkout.js

grade.js

history.js

interview-debrief.js

interview-generate.js

interview-respond.js

portal.js

price.js

question.js

total-questions.js

webhook.js

  

/public

Background.png

Fite_Premium_NB.png

apple-touch-icon.png

favicon.ico

favicon.png

frames/frame-0002.webp ... frame-0169.webp

frames/mobile/frame-0003.webp ... frame-0169.webp

robots.txt

Logo/

Old Logo/

```

  

## Frontend Architecture

  

### Landing experience

  

#### `pages/index.js`

- Primary hero page

- Uses `LandingNav`

- Runs a GSAP ScrollTrigger-driven image-sequence hero using 169 WebP frames

- Uses desktop frames from `/public/frames` and sampled mobile frames from `/public/frames/mobile`

- Uses a sticky full-height canvas scene with a long scroll container

- Dynamically samples fewer frames on mobile

- Contains staged overlay content that appears/disappears based on scroll progress

- Includes a mid-scroll pricing comparison and end-state CTA cards inside the scroll-driven hero timeline

- Routes users to `/features` via the "Explore" CTA

  

Important details:

- Mobile viewport height is stabilized through `useStableViewport()` to avoid browser chrome resize jitter

- Frame assets are cached and progressively preloaded

- Uses `createImageBitmap` on desktop when available for smoother frame drawing

  

#### `pages/features.js`

- Supplemental marketing/features page

- Uses `LandingNav`

- Contains helper components local to the page:

- `ScrollReveal`

- `SectionScan`

- `GlowCard`

- `ScrambleText`

- `CountUp`

- `AnimatedBar`

- Contains a stats strip, animated feature cards, "How It Works", pricing, CTA, and footer links

- On narrow mobile viewports, left/right reveal animations fall back to vertical motion to avoid temporary side-gutter imbalance during scroll-in

  

#### `src/LandingNav.js`

- Shared nav for `/` and `/features`

- Shows brand, Home / Features / Dashboard links, auth CTAs, and a Practice button plus `UserButton` for signed-in users

- Uses inline `style jsx` instead of `App.css`

  

#### `src/LandingPage.css`

- Holds landing-page-specific shared styles

- Covers hero, feature grids, pricing layouts, CTA variants, glass cards, and footer styles

  

### Dashboard and practice flow

  

#### `src/Dashboard.js`

This is the main application surface and contains a lot of the product logic inline.

  

High-level structure:

- Left desktop sidebar with navigation, session intel, and profile CTA

- Sticky top bar

- Desktop control panel + mobile drawer for session configuration

- Main question/interview canvas

- Mobile bottom nav and mobile settings drawer

  

Key features:

- Question mode and interview mode

- Difficulty/category selection

- Math toggle

- Premium-only custom descriptor

- Premium-only timer toggle with presets

- AI question generation with progressive streaming loader

- Model answer reveal

- AI grading

- Structured 4-question interview flow

- Session-level readiness / stat indicators

  

Important implementation notes:

- `INTERVIEW_QUESTIONS` is fixed at 4

- Timer presets are `[60, 120, 180, 300]`

- The toggle controls use a shared `ToggleSwitch` helper

- The profile card forwards clicks to Clerk's `UserButton`

- Sidebar and drawer scrollbars are hidden via `.hide-scrollbar`

  

Question state includes:

- `question`

- `answer`

- `userAnswer`

- `feedback`

- `score`

- `graded`

- `answerRevealed`

- loading flags for question / answer / feedback

  

Interview state includes:

- scenario + structured question set

- current step

- submitted answers

- interviewer responses

- final debrief

  

Snapshot behavior:

- The dashboard snapshots category, difficulty, and math at question-generation time so displayed tags stay tied to the generated question even if the controls change afterward.

  

Anti-repeat behavior:

- Generated questions are cached in `localStorage` as `questionHistory`

- Questions from the last 24 hours are skipped, with up to 5 retries

  

Timer behavior:

- When timer is enabled but not started, `TimerDisplay` shows a Start button

- Timer can be paused/resumed

- Disabling timer clears the interval and resets state

  

### History and stats

  

#### `src/HistoryDark.js`

- Premium-only page

- Fetches history from `/api/history?userId=...`

- Supports:

- search

- category filter

- difficulty filter

- math filter

- newest/oldest sort

- Groups entries by formatted date

- Renders both normal question entries and interview entries

- Can auto-expand and scroll to a highlighted history entry when arriving from the stats page

  

#### `src/StatsPage.js`

- Premium-only page

- Fetches the same history source as the history page

- Computes:

- total questions

- graded questions

- average / best / worst score

- current streak / longest streak

- average questions per day

- category performance

- difficulty breakdown

- recent score trend

- Links back into `/history` with a `highlight` timestamp

  

### Success and policy pages

  

#### `src/Success.js`

- Premium success page

- Redirects non-paid users back to `/`

- Uses confetti particles and premium branding

- Uses the shared stable viewport-height helper for mobile layout consistency

- No longer relies on the old shared navbar

  

#### `src/PrivacyPolicy.js`, `src/TermsOfService.js`, `src/RefundPolicy.js`

- Standalone dark-theme policy pages

- Also use the stable viewport-height helper for mobile full-height layout stability

- Routed via thin wrappers in `/pages`

  

## Hooks and Context

  

### `src/PaidStatusContext.js`

- Provides `{ isPaid, loading }`

- Uses Clerk `useUser()`

- Calls `POST /api/checkPaid`

- Persists a local `isPaid` hint in `localStorage`

  

### `src/usePaidStatus.js`

- Thin wrapper around the context hook

  

### `src/useUpgrade.js`

- If signed out: opens Clerk sign-in modal

- If signed in: calls `POST /api/checkout` and redirects to Stripe Checkout

  

### `src/usePrice.js`

- Calls `GET /api/price`

- Returns a formatted string like `$3.00/month`

  

### `src/useStableViewport.js`

- Shared viewport stabilization hook for full-height mobile layouts

- Ignores height-only resize events caused by collapsing or expanding mobile browser chrome

- Still updates on real width and orientation changes

- Exports `toViewportCssValue()` for inline full-height style usage

  

### `src/ScrollToTop.js`

- Forces scroll restoration to manual

- Scrolls to `(0, 0)` on route change using `requestAnimationFrame`

  

## Shared Constants

  

### Frontend: `src/constants.js`

```js

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const CATEGORIES = [

"All",

"Investment Banking",

"Private Equity",

"Asset Management",

"Accounting",

"Consulting",

"Valuation",

"Sales and Trading",

];

```

  

### Backend: `api/_constants.js`

- Same categories, but without `"All"`

- Used by API routes that need a concrete finance category

  

## API Surface

  

### `POST /api/checkPaid`

- Input: `{ userId }`

- Output: `{ isPaid: boolean }`

- Reads `paid:${userId}` from Redis

  

### `POST /api/checkout`

- Input: `{ userId, email }`

- Creates a Stripe subscription checkout session

- Adds `userId` to both checkout metadata and subscription metadata

- Redirects to `/success` on success and `/` on cancel

  

### `POST /api/portal`

- Input: `{ userId, returnPath }`

- Creates a Stripe Billing Portal session

- Finds the Stripe customer by scanning recent checkout sessions for matching metadata

  

### `GET /api/price`

- Returns Stripe price info from `STRIPE_PRICE_ID`

- Output shape: `{ amount, interval }`

  

### `GET /api/total-questions`

- Returns the aggregate `stats:total_questions` counter from Redis

- Can be protected with `ADMIN_SECRET` via the `x-admin-secret` header

- Output shape: `{ total }`

  

### `GET|POST /api/history`

- GET input: `?userId=...`

- POST input: `{ userId, entry }`

- Storage key: `history:${userId}`

- Entries are stored with `LPUSH`

- History is capped to 100 entries with `LTRIM`

  

### `POST /api/question`

Two modes:

  

1. `type === "question"`

- Generates a new question

- Non-paid users are limited to 5/day

- Limit key: `questions:${userId || clientIp}:${YYYY-MM-DD}`

- Supports SSE streaming when `stream: true`

- Increments the aggregate Redis counter `stats:total_questions`

- Uses:

- category

- difficulty

- math

- optional custom prompt

- few-shot examples from `_questionBank`

  

2. `type === "answer"`

- Generates a markdown model answer for a question

  

Current model:

- `gpt-4o-mini`

  

### `POST /api/grade`

- Premium-only

- Input: `{ question, userAnswer, userId }`

- Returns `{ feedback, score }`

- If the answer is blank, returns score `0` and a timeout-style message

  

### `POST /api/interview`

Unified interview endpoint. Dispatches on `action` in the request body:

  

- `action: "generate"`

- Extra input: `{ category, difficulty, math, customPrompt }`

- Increments the aggregate question counter by `4` because interview mode always generates a 4-question set

- Returns: `{ scenario, questions: [{ question, idealAnswer } x4], resolvedCategory }`

- `action: "respond"`

- Extra input: `{ scenario, questionIndex, question, idealAnswer, userAnswer, isLast }`

- Returns: `{ score, onTrack, response }`

- Blank answers are explicitly handled and scored `0`

- `action: "debrief"`

- Extra input: `{ scenario, questions, category, difficulty }`

- Returns: `{ feedback }` — concise, direct debrief for the candidate

  

Consolidated from three separate `interview-*` routes to stay under Vercel Hobby's 12-function cap.

  

### `POST /api/webhook`

- Stripe webhook handler

- On `checkout.session.completed`, sets `paid:${userId}` to `"true"`

- On `customer.subscription.deleted`, deletes `paid:${userId}`

- On `customer.subscription.updated`, deletes `paid:${userId}` when `cancel_at_period_end` is true

- Check this file before changing billing assumptions because Redis paid-state is driven here

  

## History Data Shapes

  

### Standard question entry

```json

{

"question": "...",

"answer": "...",

"userAnswer": "...",

"feedback": "...",

"score": 7,

"category": "Investment Banking",

"difficulty": "Hard",

"math": "With Math",

"customPrompt": "LBO modeling",

"timestamp": 1234567890000

}

```

  

### Interview entry

```json

{

"type": "interview",

"scenario": "...",

"questions": [

{

"question": "...",

"idealAnswer": "...",

"userAnswer": "...",

"score": 6,

"feedback": "..."

}

],

"score": 7.5,

"category": "Private Equity",

"difficulty": "Medium",

"math": "No Math",

"customPrompt": null,

"timestamp": 1234567890000

}

```

  

## Premium Gating

- Free users:

- 5 generated questions per day

- no grading

- no history

- no stats

- no interview mode

- no timer

- no custom descriptor

- Paid users:

- unlimited generation

- grading

- history

- stats

- interview mode

- timer

- custom descriptor

  

## Visual Design Notes

- The live application uses a dark navy / cyan palette:

- bg: `#020817`

- surface: `#0d1b2a`

- primary: `#1565C0`

- secondary: `#4FC3F7`

- gold: `#c9a84c`

- `Manrope` is used heavily for compact uppercase UI labels

- `Inter` is used for primary body/UI text

- Material Symbols are loaded globally through `_document.js`

- Marketing pages lean heavily on glass-card panels, gradient borders, blurred glow layers, and animated count-up/stat treatments

  

## Important Implementation Notes

- Navigation is Next.js-only via `next/router` and `next/link`

- The project still contains some old CRA-era dependencies in `package.json` (`react-router-dom`, `react-scripts`), but the runtime app is Next.js Pages Router

- `public/index.html`, `public/manifest.json`, the old redirect routes, and `src/Navbar.js` were removed in the recent cleanup

- The repo still contains non-runtime archive/design folders outside the app shell; do not assume everything in the repo is part of the shipped website

- Several full-height screens now use `useStableViewport()` instead of raw `100vh` to reduce Chrome mobile resize jitter

  

## Environment Variables

```text

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

CLERK_SECRET_KEY

STRIPE_SECRET_KEY

STRIPE_PRICE_ID

STRIPE_WEBHOOK_SECRET

NEXT_PUBLIC_URL

OPENAI_API_KEY

UPSTASH_REDIS_REST_URL

UPSTASH_REDIS_REST_TOKEN

ADMIN_SECRET

```

  

## Safe Assumptions for Future Edits

- If you are changing practice behavior, start in `src/Dashboard.js`

- If you are changing premium gating, inspect both the UI hooks and the Stripe/Redis API routes

- If you are changing landing visuals, check both `pages/index.js` / `pages/features.js` and `src/LandingPage.css`

- If you are changing billing behavior, verify `checkout.js`, `portal.js`, and `webhook.js` together

- If you are changing categories, update both `src/constants.js` and `api/_constants.js`