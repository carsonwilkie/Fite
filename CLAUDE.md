# Fite Finance — Project Context

## Overview
Fite Finance is a finance interview prep platform that ships as both a website at `fitefinance.com` and a native mobile app for iOS + Android (in `/mobile`). The product combines a cinematic landing experience with a dark-theme practice dashboard where users can generate finance questions, reveal model answers, get AI grading, work through a curated 400-question IB bank, run structured mock interviews, review saved history, inspect stats, submit feedback, and vote on future features.

Free users are limited to 5 generated questions per day. Premium users unlock unlimited question generation, answer grading, history, stats, interview mode, custom descriptors, the timer, IB 400 progress tracking, and premium-only feature voting.

The website and the mobile app share the same backend (`fitefinance.com/api/*`), the same Clerk users, and the same Upstash Redis paid flag. The mobile app is fully documented in the "Mobile App" section near the end of this file.

## Tech Stack
- Frontend: Next.js 16.2.3 (Pages Router), React 19, `motion/react`
- Backend: Vercel serverless functions in `/api`
- Auth: Clerk via `@clerk/nextjs`
- Payments: Stripe subscriptions + Stripe Billing Portal
- AI: OpenAI via `openai` SDK, currently using `gpt-4o-mini`
- Data: Upstash Redis
- Email: Resend for feedback/feature-vote notifications when `RESEND_API_KEY` is configured
- Analytics: Vercel Analytics + Speed Insights
- Animation: GSAP ScrollTrigger on the landing hero

## Dev Commands
```bash
npm run dev
npm run build
npm run start
npm run qcount
```

`npm run qcount` prints question-bank totals by category, difficulty, and format.

## Security
Never read, display, or reference the contents of `.env`, `.env.local`, or any `.env.*` file.

## Current Route Map
```text
/              → Animated landing page
/features      → Supplemental marketing/features page
/dashboard     → Main practice dashboard
/ib-questions  → Premium-only IB 400 curated question bank
/history       → Premium history page
/stats         → Premium stats page
/success       → Premium success page
/account       → Signed-in account management
/sign-in       → Full-page sign-in
/sign-up       → Full-page sign-up
/sso-callback  → Clerk OAuth callback screen
/feedback      → Feedback submission page
/feature-vote  → Premium-only roadmap vote page
/privacy       → Privacy policy
/terms         → Terms of service
/refunds       → Refund policy
/sitemap.xml   → Server-rendered XML sitemap
```

Notes:
- Legacy redirect routes like `/practice` and the old `/questions/...` routes were removed.
- There is no shared runtime navbar file anymore; `src/Navbar.js` was deleted.
- `/account`, `/sso-callback`, and `/ib-questions` are marked `noindex`.
- `/ib-questions` runs `getServerSideProps` which redirects non-signed-in users to `/sign-in` and non-paid users to `/`. The page itself also re-verifies Clerk auth on the client.

## App Shell

### `pages/_app.js`
- Wraps the app in `ClerkProvider`, `PaidStatusProvider`, and `AuthProvider`
- Mounts Vercel Analytics and Speed Insights
- Imports `src/index.css`, `src/App.css`, and `src/LandingPage.css`
- Implements the full-page transition cover used between routes
- Keeps a displayed route snapshot during page transitions to avoid visual tearing

### Global page transition
- The app uses a dark fixed overlay that animates with `translateY`
- Initial entry reveals upward after a short delay
- Route changes first cover the old page, then reveal the new page
- Hero routes use a slightly different reveal timing via `isHeroRoute()`
- `resetWindowScroll()` forces scroll to top when revealing the next route

### `pages/_document.js`
- Loads Google Fonts for `Inter`, `Manrope`, and `Material Symbols Outlined`
- Advertises versioned favicon assets:
  - `/favicon-1.ico`
  - `/favicon-v3.png`
  - `/apple-touch-icon-v2.png`
- The versioned favicon paths are intentional, used to nudge search engines away from cached old favicon URLs.

### `proxy.js`
- Runs Clerk middleware through `@clerk/nextjs/server`
- Applies to app routes and API routes while excluding static assets, `_next`, and common public file extensions

### `next.config.js`
- Enables `reactStrictMode`

## File Structure
```text
/pages
  _app.js
  _document.js
  account.js
  dashboard.js
  feature-vote.js
  features.js
  feedback.js
  history.js
  ib-questions.js
  index.js
  privacy.js
  refunds.js
  sign-in.js
  sign-up.js
  sitemap.xml.js
  sso-callback.js
  stats.js
  success.js
  terms.js
  api/
    admin-users.js
    checkPaid.js
    checkout.js
    delete-account.js
    feedback.js
    grade.js
    history.js
    ib-questions.js
    interview.js
    portal.js
    price.js
    question.js
    webhook.js
    _constants.js
    _ibQuestions.js
    _openai.js
    _questionBank.js

/src
  App.css
  Dashboard.js
  HistoryDark.js
  IBQuestionsPage.js
  LandingNav.js
  LandingPage.css
  LightsaberLoader.js
  PaidStatusContext.js
  PrivacyPolicy.js
  RefundPolicy.js
  ScrollToTop.js
  StatsPage.js
  SubmissionPage.js
  Success.js
  TermsOfService.js
  constants.js
  index.css
  usePaidStatus.js
  usePrice.js
  useStableViewport.js
  useUpgrade.js
  server/
    auth.js
  auth/
    AccountPanel.js
    AuthCard.js
    AuthFullPage.js
    AuthPrimitives.js
    AuthProvider.js
    redirects.js
    UserMenu.js

/mobile               — Expo React Native app (iOS + Android). See "Mobile App" section.

/public
  Fite_Premium_NB.png
  apple-touch-icon.png
  apple-touch-icon-v2.png
  favicon.ico
  favicon.png
  favicon-v2.ico
  favicon-v2.png
  favicon-1.ico
  favicon-v3.png
  google2aa907af818e918b.html
  logo-realistic-small.png
  logo-realistic.png
  logo-realistic.webp
  social-banner.jpg
  social_banner.jpg
  frames/frame-0002.webp ... frame-0169.webp
  frames/mobile/frame-0003.webp ... frame-0169.webp
  robots.txt
  Logo/
```

Note: `pages/api/total-questions.js` was removed. Its functionality has been folded into `GET /api/question` (still protected with the same `x-admin-secret` header).

## Frontend Architecture

### Landing experience

#### `pages/index.js`
- Primary hero page
- Uses `LandingNav`
- Uses Clerk auth state, `useAuthModal()`, `usePaidStatus()`, and `useUpgrade()`
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
- Canvas updates freeze on `routeChangeStart` so the ScrollTrigger scrub does not rewind frames under the page-transition cover

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
- Contains a stats strip, animated feature cards, "How It Works", pricing, CTA, roadmap-style sections, and footer links
- On narrow mobile viewports, left/right reveal animations fall back to vertical motion to avoid temporary side-gutter imbalance during scroll-in

#### `src/LandingNav.js`
- Shared nav for `/` and `/features`
- Shows brand, Home / Features / Dashboard links, auth CTAs, and a Practice button plus `UserMenu` for signed-in users
- Uses `/favicon.png` for standard users and `/Fite_Premium_NB.png` for paid users
- Uses inline `style jsx` instead of `App.css`

#### `src/LandingPage.css`
- Holds landing-page-specific shared styles
- Covers hero, feature grids, pricing layouts, CTA variants, glass cards, and footer styles

### Authentication and account management

#### `src/auth/AuthProvider.js`
- Provides `useAuthModal()`
- Offers `openAuth`, `closeAuth`, `openSignIn`, and `openSignUp`
- Renders the animated auth modal with `AuthCard`
- Locks body scroll while the modal is open
- Closes on Escape or outside click
- Auto-closes when the user becomes signed in
- Uses Next router after sign-out to avoid a hard white flash

#### `src/auth/AuthCard.js`
- Shared auth card used by the modal and full-page auth routes
- Supports views:
  - sign-in
  - sign-up
  - verify email
  - forgot password
  - reset password
- Supports email/password and Google OAuth via Clerk
- Uses `CodeInput` for email verification and password reset codes
- Uses `PasswordStrength` for password guidance
- Uses an `auth-card` CSS scope so global input focus shadows do not clip inside the card

#### `src/auth/AuthFullPage.js`
- Full-page shell for `/sign-in` and `/sign-up`
- Redirects already-signed-in users to `redirect_url` or `/dashboard`
- Provides dark ambient background, home link, and centered `AuthCard`

#### `src/auth/AuthPrimitives.js`
- Shared auth UI primitives and design tokens:
  - `AUTH_COLORS`
  - `cyberGrad`
  - `FloatingInput`
  - `CodeInput`
  - `PasswordStrength`
  - `GoogleButton`
  - `PrimaryButton`
  - `GhostButton`
  - `Divider`
  - `ShakeWrapper`
- `FloatingInput` handles autofill detection so labels float correctly after browser autofill
- `FloatingInput` uses 16px input text to avoid iOS zoom and briefly resets viewport scaling on blur
- Auth text inputs use scoped CSS classes to avoid the oversized global input focus glow

#### `src/auth/AccountPanel.js`
- Signed-in account management UI for `/account`
- Tabs:
  - Profile
  - Security
  - Sessions
  - Danger
- Profile supports:
  - first/last name update via `user.update()`
  - profile image upload via `user.setProfileImage()`
  - read-only primary verified email display
- Security supports:
  - set password for OAuth users
  - update password for password users
  - current-password verification before changing an existing password
  - sign out of other sessions on password update
- Sessions supports:
  - listing active Clerk sessions with browser/device/location metadata
  - revoking non-current sessions
- Danger supports:
  - typed `DELETE` confirmation
  - `user.delete()`
  - sign out and route home after deletion
- Uses an `account-page` CSS scope so page text inputs do not pick up the global focus glow

#### `src/auth/UserMenu.js`
- Signed-in user menu used by the landing/nav surfaces
- Provides account, billing, dashboard, and sign-out actions
- Shows user initials/image and paid-aware actions

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
- Feedback and feature-vote routes are reachable from app navigation surfaces

Important implementation notes:
- `INTERVIEW_QUESTIONS` is fixed at 4
- Timer presets are `[60, 120, 180, 300]`
- Question mode supports `OTG` ("On The Go") as a fourth difficulty; interview mode intentionally does not
- Switching from question mode to interview mode while `OTG` is selected resets difficulty to `Medium`
- Custom descriptors are disabled while `OTG` is selected
- The `OtgInfoBadge` helper shows a delayed hover/tap tooltip without triggering the parent difficulty button
- The toggle controls use a shared `ToggleSwitch` helper
- The profile card forwards account/profile actions through the auth user menu/account route
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
- Fetches history from `/api/history`; the API derives the user from Clerk auth
- Supports:
  - search
  - category filter
  - difficulty filter
  - math filter
  - newest/oldest sort
- Groups entries by formatted date
- Renders both normal question entries and interview entries
- Can auto-expand and scroll to a highlighted history entry when arriving from the stats page
- Uses `QUESTION_DIFFICULTIES`, so OTG history can be filtered alongside Easy/Medium/Hard

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
- Tracks OTG in the difficulty breakdown
- Links back into `/history` with a `highlight` timestamp

### IB 400 question bank

#### `src/IBQuestionsPage.js`
- Premium-only page rendered at `/ib-questions`
- Server-rendered: `getServerSideProps` redirects unauthenticated users to `/sign-in` and non-paid users to `/`, then injects the full `IB_QUESTIONS` array (from `pages/api/_ibQuestions.js`) as the initial prop
- Loads existing per-question progress from `GET /api/history?scope=ib`
- Filters by category and difficulty, searches by text
- Clicking a question opens an inline answer surface that uses the same `POST /api/question` (`type: "answer"`) and `POST /api/grade` flow as the main dashboard
- Progress is upserted to `POST /api/history?scope=ib` with `{ questionId, score }`
- Supports per-question reset and full-bank reset via `DELETE /api/history?scope=ib`
- Reuses the dark navy/cyan palette and the same shared viewport-stability hook

#### `pages/api/_ibQuestions.js`
- Static, server-side question bank — 400 items, never edited at runtime
- Each entry has `{ id, question, category, difficulty }`
- Categories used by IB 400 only: `Accounting`, `DCF`, `LBO`, `M&A`, `Valuation`, `Markets`, `Debt & Capital Structure`, `Brain Teasers`
- Difficulties: `Easy`, `Medium`, `Hard`
- Note: these categories differ from the global `CATEGORIES` list. IB 400 categories live exclusively inside this file and the IB 400 UI.

### Feedback and feature voting

#### `src/SubmissionPage.js`
- Shared page component for `/feedback` and `/feature-vote`
- Uses `useStableViewport()` for mobile layout stability
- Supports optional roadmap list content
- Enforces premium gating when `paidOnly` is true
- Posts to `/api/feedback`
- Sends only `type` and `message`; the API enriches submissions with signed-in Clerk metadata when available
- Caps message length at 4000 characters
- Shows animated success state and links back to `/dashboard`

#### `pages/feedback.js`
- Public feedback route
- Uses `SubmissionPage` with `type="feedback"`
- Accepts anonymous or signed-in submissions

#### `pages/feature-vote.js`
- Premium-only roadmap voting route
- Uses `SubmissionPage` with `type="vote"` and `paidOnly`
- Current roadmap ideas:
  - Adaptive difficulty
  - Live mock interviews
  - Deep analytics
  - Guided study plans
  - Modeling practice
  - Peer leaderboards

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
- The API derives the user from Clerk request auth; the client no longer sends `userId`

### `src/usePaidStatus.js`
- Thin wrapper around the context hook

### `src/useUpgrade.js`
- If signed out: opens the custom auth modal
- If signed in: calls `POST /api/checkout` with an empty body and redirects to Stripe Checkout

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
export const QUESTION_DIFFICULTIES = ["Easy", "Medium", "Hard", "OTG"];
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

OTG is intentionally frontend/question-route only. Interview mode and backend category constants stay on Easy/Medium/Hard and concrete categories.

## Server Auth Helpers

### `src/server/auth.js`
- Wraps Clerk request auth for API routes:
  - `getAuthenticatedUserId(req)`
  - `requireAuthenticatedUserId(req, res)`
  - `getAuthenticatedUserEmail(userId)`
  - `getAuthenticatedUserProfile(userId)`
  - `sanitizeRedirectPath(value, fallback)`
- `requireAuthenticatedUserId()` responds with `401` and `{ error: "Authentication required" }` when no Clerk user is present
- `sanitizeRedirectPath()` only allows same-site relative paths and rejects protocol-relative or external redirects

## API Surface

### `GET /api/admin-users` via `pages/api/admin-users.js`
- Requires `x-admin-secret` matching `ADMIN_SECRET`
- Calls Clerk's users API with `CLERK_SECRET_KEY`
- Supports `limit` and `offset`
- Returns a summarized list of users:
  - id
  - email
  - firstName
  - lastName
  - createdAt
  - lastSignInAt

### `POST /api/checkPaid`
- Requires authenticated Clerk user
- Input: empty body
- Output: `{ isPaid: boolean }`
- Reads `paid:${authenticatedUserId}` from Redis

### `POST /api/checkout`
- Requires authenticated Clerk user
- Input: empty body
- Creates a Stripe subscription checkout session
- Looks up the primary Clerk email and passes it as `customer_email` when available
- Adds authenticated user ID to both checkout metadata and subscription metadata
- Allows Stripe promotion codes
- Redirects to `/success` on success and `/` on cancel

### `POST /api/portal`
- Requires authenticated Clerk user
- Input: `{ returnPath }`
- Creates a Stripe Billing Portal session
- First reads `stripe_customer:${userId}` from Redis
- If missing, searches Stripe subscriptions by `metadata['userId']`
- Falls back to scanning recent checkout sessions
- Caches the resolved customer ID back to Redis
- Sanitizes `returnPath` before composing the portal `return_url`

### `GET /api/price`
- Returns Stripe price info from `STRIPE_PRICE_ID`
- Output shape: `{ amount, interval }`

### `GET /api/question` (admin stats)
- Returns the aggregate `stats:total_questions` counter from Redis
- Can be protected with `ADMIN_SECRET` via the `x-admin-secret` header
- Output shape: `{ total }`
- Replaces the old `/api/total-questions` route, which has been removed

### `GET|POST|DELETE /api/history`
- Requires authenticated Clerk user
- Default scope (standard question + interview history):
  - GET input: none → returns `{ entries: HistoryEntry[] }`
  - POST input: `{ entry }`
  - DELETE: pops (`LPOP`) the most recently saved entry — used by the retry flow so an abandoned attempt is replaced by the retried question's record
  - Storage key: `history:${authenticatedUserId}`
  - Entries are stored with `LPUSH` and capped to 100 with `LTRIM`
- IB 400 progress scope (`?scope=ib` query or `{ scope: "ib" }` body):
  - GET: returns `{ progress: Record<questionId, { score, timestamp }> }`
  - POST input: `{ questionId, score, timestamp }` → upserts that field on the Redis hash
  - DELETE: with `questionId` removes one entry from the hash; without it deletes the whole hash
  - Storage key: `ib_progress:${authenticatedUserId}` (Redis hash, `HSET`/`HGETALL`/`HDEL`)

### `GET /api/ib-questions`
- Premium-only
- Requires authenticated Clerk user
- Returns the full static IB 400 bank: `{ questions: { id, question, category, difficulty }[] }`
- Returns `403` for users without the `paid:${userId}` flag

### `POST /api/delete-account`
- Requires authenticated Clerk user
- Deletes all user data from Redis (`paid:${userId}`, `stripe_customer:${userId}`, `history:${userId}`, `ib_progress:${userId}`) and then deletes the Clerk user via `clerkClient().users.deleteUser(userId)`
- Deleting the Clerk user revokes every Clerk session and every OAuth grant (including Sign in with Apple and Google) — required by App Store account-deletion rules
- Returns `{ deleted: true }` on success, `500` on failure

### `POST /api/feedback`
- Handles both feedback and feature-vote submissions
- Input: `{ type, message }`
- `type === "vote"` stores under `vote:submissions`; all other values store as `feedback`
- Reads Clerk auth opportunistically and enriches records with `{ userId, email, name }` when available
- Requires non-empty `message`
- Rejects messages over 4000 characters
- Stores recent submissions in Redis with `LPUSH` and caps each list to 500
- Sends email through Resend when `RESEND_API_KEY` is configured
- Uses `FEEDBACK_FROM_EMAIL` when set, otherwise defaults to `feedback@fitefinance.com`
- Sends to `support@fitefinance.com`

### `POST /api/question`
Two modes:

1. `type === "question"`
- Generates a new question
- Non-paid users are limited to 5/day
- Limit key: `questions:${userId || clientIp}:${YYYY-MM-DD}`
- Supports SSE streaming when `stream: true`
- Streaming responses include `questionsUsed` and `questionsLimit` when a free-user count was incremented
- Increments the aggregate Redis counter `stats:total_questions`
- Uses:
  - category
  - difficulty
  - math
  - optional custom prompt
  - few-shot examples from `_questionBank`
- Non-OTG requests randomly select one of five formats:
  - scenario
  - pitch
  - walk-through
  - comparison
  - pressure-test
- Non-OTG requests inject a Q2 2026 market-context block and negative examples to avoid generic definition prompts
- OTG requests skip the question bank, format selection, custom descriptor, and negative examples
- OTG questions have separate prompts for mental-math vs. quick conceptual/brain-teaser questions

2. `type === "answer"`
- Generates a markdown model answer for a question
- OTG answers use a separate short plain-text answer prompt
- Standard answers are tiered by difficulty and return exactly:
  - `## Model Answer`
  - `## Other Angles to Mention`

Current model:
- `gpt-4o-mini`

### `POST /api/grade`
- Premium-only
- Requires authenticated Clerk user
- Input: `{ question, userAnswer, idealAnswer }`
- Returns `{ feedback, score }`
- If the answer is blank, returns score `0` and a timeout-style message
- Uses optional `idealAnswer` as an internal grading anchor when provided

### `POST /api/interview`
Unified interview endpoint. Dispatches on `action` in the request body:
- Requires authenticated Clerk user and an active Redis paid flag before any action runs

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
- Unified billing webhook — handles both Stripe (web + Android) and RevenueCat (iOS in-app purchases) on a single route to stay under Vercel Hobby's 12-function cap
- Disables the default Next.js body parser; the raw body is read manually so Stripe signature verification still works
- Branches on which provider sent the request:
  - `stripe-signature` header → Stripe handler
  - `authorization` header → RevenueCat handler (shared secret in `REVENUECAT_WEBHOOK_AUTH`)
- Stripe handler:
  - On `checkout.session.completed`, sets `paid:${userId}` to `"true"` and stores `stripe_customer:${userId}` when Stripe provides a customer ID
  - On `customer.subscription.deleted`, deletes `paid:${userId}`
  - On `customer.subscription.updated`, deletes `paid:${userId}` when `cancel_at_period_end` is true
- RevenueCat handler:
  - Requires `Authorization` header to match `REVENUECAT_WEBHOOK_AUTH`
  - Reads `app_user_id` from the RC event payload (set by the mobile app to the Clerk user ID, so the keyspace stays consistent with Stripe)
  - Grant events (`INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION`, `PRODUCT_CHANGE`, `NON_RENEWING_PURCHASE`, `SUBSCRIPTION_EXTENDED`) → `SET paid:${userId} "true"`
  - Revoke events (`EXPIRATION`, `BILLING_ISSUE`, `SUBSCRIPTION_PAUSED`) → `DEL paid:${userId}`
  - `CANCELLATION` is a no-op — access is retained until `EXPIRATION` fires later
  - `TRANSFER` grants or revokes based on `expiration_at_ms`
  - `TEST` is acknowledged for RC dashboard validation
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
  "timeTaken": 118,
  "timeRemaining": 2,
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

### Feedback / vote submission record
```json
{
  "type": "feedback",
  "message": "...",
  "userId": "user_...",
  "email": "user@example.com",
  "name": "User Name",
  "timestamp": 1234567890000
}
```

### IB 400 progress entry
Stored as a field on the Redis hash `ib_progress:${userId}`, keyed by question id.
```json
{
  "score": 7,
  "timestamp": 1234567890000
}
```
`score` may be `null` if the user marked the question as attempted without grading.

## Premium Gating
- Free users:
  - 5 generated questions per day
  - no grading
  - no history
  - no stats
  - no interview mode
  - no timer
  - no custom descriptor
  - no IB 400 question bank
  - no feature voting
- Paid users:
  - unlimited generation
  - grading
  - history
  - stats
  - interview mode
  - timer
  - custom descriptor
  - IB 400 bank with progress tracking
  - feature voting

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
- Auth and account inputs intentionally opt out of the broad global input focus shadow in `src/App.css`; keep those scoped overrides when editing auth forms.

## Important Implementation Notes
- Navigation is Next.js-only via `next/router` and `next/link`
- The runtime app is Next.js Pages Router; old CRA runtime files/dependencies are no longer part of the shipped app
- `public/index.html`, `public/manifest.json`, the old redirect routes, and `src/Navbar.js` were removed in the cleanup
- The repo still contains non-runtime archive/design folders outside the app shell; do not assume everything in the repo is part of the shipped website
- Several full-height screens now use `useStableViewport()` instead of raw `100vh` to reduce Chrome mobile resize jitter
- Versioned favicon URLs are intentional; Google can cache search result favicons aggressively, so avoid reverting `_document.js` to only `/favicon.ico`

## Environment Variables
```text
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Billing (web + Android)
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET

# Billing (iOS in-app purchases via RevenueCat)
REVENUECAT_WEBHOOK_AUTH        # shared-secret value in the Authorization header of RC webhook posts

# App
NEXT_PUBLIC_URL
OPENAI_API_KEY

# Data
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Admin
ADMIN_SECRET

# Email
RESEND_API_KEY
FEEDBACK_FROM_EMAIL
```

## Safe Assumptions for Future Edits
- If you are changing practice behavior, start in `src/Dashboard.js`
- If you are changing the IB 400 page, start in `src/IBQuestionsPage.js` and `pages/api/_ibQuestions.js`
- If you are changing premium gating, inspect both the UI hooks and the Stripe/Redis API routes
- If you are changing landing visuals, check both `pages/index.js` / `pages/features.js` and `src/LandingPage.css`
- If you are changing auth UI, inspect `src/auth/AuthCard.js`, `src/auth/AuthPrimitives.js`, and `src/auth/AuthProvider.js`
- If you are changing account management, inspect `src/auth/AccountPanel.js`
- If you are changing account deletion, verify `pages/api/delete-account.js` clears every relevant Redis key
- If you are changing billing behavior, verify `checkout.js`, `portal.js`, and `webhook.js` together. Remember `webhook.js` now serves both Stripe AND RevenueCat.
- If you are changing feedback or feature voting, inspect `src/SubmissionPage.js` and `pages/api/feedback.js`
- If you are changing categories, update `src/constants.js`, `api/_constants.js`, AND `mobile/src/constants.ts`
- If you are changing API shapes the mobile app consumes (`/checkPaid`, `/checkout`, `/price`, `/question`, `/grade`, `/history`, `/interview`, `/ib-questions`, `/delete-account`, `/feedback`), update `mobile/src/api.ts` and any affected mobile screens
- If you are changing anything mobile-related, see the "Mobile App" section below

---

# Mobile App

The native mobile app lives in `/mobile`. It is an Expo (React Native) build of Fite Finance for iOS and Android. It calls the same `fitefinance.com/api/*` backend as the website — no backend changes are needed when iterating on mobile features unless a new endpoint or response shape is required.

## Mobile Tech Stack
- Runtime: Expo SDK 55 with `newArchEnabled: true`
- Router: Expo Router v5 (`expo-router`) with `typedRoutes` enabled
- Language: TypeScript (strict TSX)
- React: React 19 + React Native 0.83
- Auth: Clerk via `@clerk/clerk-expo`, with Clerk tokens cached in `expo-secure-store`
- Payments:
  - iOS → RevenueCat (`react-native-purchases`) backed by StoreKit, with the RC webhook hitting `POST /api/webhook` to set `paid:${userId}` in Redis
  - Android + web fallback → Stripe Checkout opened in `expo-web-browser`
- AI: same backend as the website — `POST /api/question`, `POST /api/grade`, `POST /api/interview`
- Data: Upstash Redis via the same web API; local persistence via `@react-native-async-storage/async-storage` for recent-question dedupe and a paid-status hint
- Animation: `react-native-reanimated` + `react-native-gesture-handler`
- Fonts: `@expo-google-fonts/inter` (Inter 400/500/600/700) + `@expo-google-fonts/manrope` (Manrope 500/600/700/800)
- Iconography: `@expo/vector-icons` (Ionicons)
- Build & submit: EAS Build + EAS Submit (`build:ios`, `build:android`, `submit:ios`, `submit:android` scripts)
- Updates: `expo-updates` pointed at `https://u.expo.dev/<eas project id>`

## Mobile Bundle Identifiers
- iOS bundle id: `com.fitefinance.app`
- Android package: `com.fitefinance.app`
- App scheme: `fitefinance://`
- Display name: `Fite Finance`
- EAS owner: `carsonwilkie`
- EAS project id: declared in `mobile/app.json` under `extra.eas.projectId`

## Mobile Route Map (Expo Router)
```text
app/_layout.tsx                 → Root layout: ClerkProvider, PaidStatusProvider, AuthGate, splash
app/(auth)/_layout.tsx          → Auth group layout (no header)
app/(auth)/sign-in.tsx          → Sign in (email/password, Google OAuth, Sign in with Apple)
app/(auth)/sign-up.tsx          → Sign up (email/password, Google OAuth, Sign in with Apple)
app/(tabs)/_layout.tsx          → Tab bar (Practice · IB 400 · History · Stats · Account)
app/(tabs)/index.tsx            → Practice dashboard
app/(tabs)/ib400.tsx            → IB 400 question bank (premium)
app/(tabs)/history.tsx          → Practice history (premium)
app/(tabs)/stats.tsx            → Stats (premium)
app/(tabs)/account.tsx          → Account (profile, billing, sign out, delete account)
app/interview.tsx               → Mock interview flow (modal)
app/paywall.tsx                 → Premium upgrade (modal)
app/feedback.tsx                → Feedback form (modal)
app/feature-vote.tsx            → Feature voting (modal, premium)
app/ib-question.tsx             → Single IB 400 question detail (modal)
```

Stack modal routes use `presentation: 'modal'` with `slide_from_bottom` animation, and tabs use `freezeOnBlur: true` with no inter-tab animation.

## Mobile File Structure
```text
/mobile
  app.json                      Expo config (name, scheme, plugins, extra)
  eas.json                      EAS Build/Submit configuration
  babel.config.js
  tsconfig.json
  package.json
  App.tsx
  index.ts
  SETUP.md                      Local-dev and store-submission walkthrough
  APP_STORE_METADATA.md         Apple/Google metadata source of truth
  RESUBMISSION_CHECKLIST.md     Re-submission checklist for binary updates

  /app                          Expo Router screens (see route map above)
    _layout.tsx
    feature-vote.tsx
    feedback.tsx
    ib-question.tsx
    interview.tsx
    paywall.tsx
    (auth)/
      _layout.tsx
      sign-in.tsx
      sign-up.tsx
    (tabs)/
      _layout.tsx
      account.tsx
      history.tsx
      ib400.tsx
      index.tsx
      stats.tsx

  /src
    api.ts                      Typed fetch client for fitefinance.com/api/*
    constants.ts                Shared categories, difficulties, math options, etc.
    theme.ts                    Colors, gradients, typography, spacing, radius, shadows, motion
    revenuecat.ts               iOS StoreKit purchases + restore + entitlement check
    guestMode.ts                Module-level "let me browse without signing in" flag
    hooks/
      usePaidStatus.tsx         Paid-status context + cache + RC fallback
      usePrice.ts               Stripe price string for UI
    components/
      AnimatedNumber.tsx
      Background.tsx
      BrandLogo.tsx
      Button.tsx
      Card.tsx
      GlassCard.tsx
      GradientButton.tsx
      InfoBadge.tsx             InfoButton + InfoSheet pair
      LoadingDots.tsx
      Pill.tsx
      PremiumGate.tsx
      PressableScale.tsx
      ScoreDisplay.tsx
      ScrollFade.tsx
      SectionHeader.tsx
      SimpleMarkdown.tsx        Minimal markdown renderer for model answers

  /assets                       App icon, splash icon, favicon, adaptive icon
  /auth_keys                    Local-only auth provider helper artifacts (ignored from EAS)
  /app_store_screenshots        Polished + raw screenshots used in App Store Connect
  /ios                          Native iOS shell (generated by `expo prebuild` for Sign in with Apple)
  /dist                         Local build artifacts (gitignored)
```

## Mobile App Shell

### `mobile/app/_layout.tsx`
- Loads Inter and Manrope from `@expo-google-fonts/*`
- Wraps the tree in `GestureHandlerRootView` → `SafeAreaProvider` → `ClerkProvider` → `PaidStatusProvider`
- `ClerkProvider` uses a `tokenCache` backed by `expo-secure-store`
- `AuthGate` inside the tree:
  - Configures RevenueCat once on iOS via `configureRevenueCat(clerkUserId)` and keeps RC's app-user-id in sync with the signed-in Clerk user, so the RC webhook can map StoreKit events to `paid:${clerkUserId}` in Redis
  - Routes unauthenticated users to `(auth)/sign-in` unless they have explicitly entered guest mode via `guestMode.allow()`
  - Holds the native splash screen up until Clerk has resolved AND (for signed-in users) `usePaidStatus()` has resolved, so paid users don't briefly see the free-tier UI on cold start
- The root `Stack` registers each modal route with `presentation: 'modal'` and `slide_from_bottom` animation
- `userInterfaceStyle: "dark"` is enforced app-wide

### `mobile/app.json` highlights
- `scheme: "fitefinance"` → Clerk OAuth callbacks return to `fitefinance://oauth-callback`
- `ios.usesAppleSignIn: true` → Sign in with Apple is required by App Store rules whenever Google sign-in is offered
- `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` (export-compliance answer is baked in)
- `extra.clerkPublishableKey` and `extra.revenueCatIosKey` are read at runtime through `expo-constants`
- Plugins: `expo-router`, `expo-secure-store`, `expo-apple-authentication`, `expo-splash-screen`, `expo-web-browser`, `expo-font`

## Mobile Auth
- `@clerk/clerk-expo` is used directly — same Clerk application as the website
- Sign in / sign up screens support:
  - Email + password
  - Google OAuth via `useOAuth({ strategy: 'oauth_google' })`
  - Sign in with Apple via `useOAuth({ strategy: 'oauth_apple' })`
  - Email verification codes during sign-up
- Tokens are persisted with `expo-secure-store`
- Clerk requires `fitefinance://oauth-callback` to be listed under Google + Apple social connections in the Clerk dashboard
- A "Continue as guest" path stores a session-only flag via `guestMode.allow()` so users can explore the dashboard without an account; the flag is cleared on sign-out so the next launch still prompts

## Mobile Premium Gating

### `src/hooks/usePaidStatus.tsx`
- `PaidStatusProvider` exposes `{ isPaid, loading, refresh }` and:
  - Hydrates `isPaid` from `AsyncStorage` (`fite_isPaid`) on mount so returning paid users don't flash the free UI
  - Calls `POST /api/checkPaid` with the Clerk session token
  - On iOS, falls back to RevenueCat (`isRcPremium()`) when the backend says not-paid — this unlocks the app instantly after a fresh StoreKit purchase even before the RC webhook has set `paid:${userId}` in Redis
  - If neither source confirms a status (transient network failure), trusts the cached value rather than flipping a paid user to free
- All gated UI in the app reads from this hook

### `src/revenuecat.ts`
- Lazy-loads `react-native-purchases` so Android and web bundles never try to require the native module
- `configureRevenueCat(clerkUserId)` is called from `AuthGate` and re-runs on user-id changes so RC's `appUserID` matches the Clerk user id
- `PREMIUM_ENTITLEMENT = "premium"` — single entitlement that gates everything premium on mobile
- Exposes `getPremiumPackage()`, `purchasePremium(pkg)`, `restorePurchases()`, `isRcPremium()`, and `getCustomerInfo()`
- `isRcSupported()` is `true` only on iOS with a non-empty `revenueCatIosKey`

### Paywall flow
- `app/paywall.tsx` shows the perks list and the price string
- Price string is the RC-localized `priceString` from StoreKit on iOS, or the Stripe-derived price from `usePrice()` elsewhere
- iOS purchases call `purchasePremium(iapPackage)` (native StoreKit sheet) and refresh paid status on success; everything else opens Stripe Checkout in `expo-web-browser`
- Apple requires a "Restore Purchases" action — wired to `restorePurchases()`

## Mobile API Client

### `mobile/src/api.ts`
All calls go to `https://fitefinance.com/api/*` (defined in `src/constants.ts` as `API_BASE`). The Clerk session token is passed as `Authorization: Bearer <token>` on every authenticated call.

Exports:
- `checkPaid(token)` → `POST /api/checkPaid`
- `getPrice()` → `GET /api/price` → formatted string like `$3.00/month`
- `createCheckout(token)` → `POST /api/checkout`, returns Stripe Checkout URL for `expo-web-browser`
- `generateQuestion({ category, difficulty, math, customPrompt?, token?, onChunk? })`:
  - Uses `XMLHttpRequest` instead of `fetch` because React Native's `fetch` does not support `ReadableStream`. XHR's `onprogress` keeps the SSE chunks flowing past the 10s Vercel function ceiling.
  - Surfaces `questionsUsed` and `questionsLimit` from the stream and throws `LIMIT_REACHED` on 403
- `generateAnswer({ question, category, difficulty, math, token? })` → non-streaming JSON from `POST /api/question` (`type: "answer"`)
- `gradeAnswer({ question, userAnswer, idealAnswer, token })` → `POST /api/grade`
- `getHistory(token)` / `saveHistory(entry, token)` → `GET|POST /api/history`
- `generateInterview` / `respondToInterview` / `debriefInterview` → all hit `POST /api/interview` with different `action` values
- `getIBQuestions(token)` → `GET /api/ib-questions`
- `getIBProgress(token)` / `saveIBProgress(...)` / `resetIBProgress(qid|null, token)` → `GET|POST|DELETE /api/history?scope=ib`
- `deleteAccount(token)` → `POST /api/delete-account`
- `submitFeedback({ type, message, token? })` → `POST /api/feedback`

## Mobile Screens

### `app/(tabs)/index.tsx` — Practice dashboard
Closest analogue to `src/Dashboard.js` on the web.
- Glass-card hero with quota bar for free users (color-shifts from cyan → orange → red as questions are consumed)
- Category picker as a `pageSheet` modal listing all 8 categories with Ionicons
- Difficulty pills (`Easy`, `Medium`, `Hard`, `OTG`) — OTG is a compound pill with an integrated info affordance
- Math toggle pills (`No Math` / `With Math`)
- Premium-only custom focus prompt, disabled while `OTG` is selected
- Premium-only timer with `[60, 120, 180, 300]` presets and Manual/Auto modes
- Streaming question generation via `generateQuestion` (XHR + SSE parsing)
- Reveal-answer and Grade-answer flow with `react-native-reanimated` enter animations and haptic feedback
- 24h anti-repeat dedupe via `AsyncStorage` key `fite_questionHistory` (up to 100 entries; 5 retries before accepting)

### `app/(tabs)/ib400.tsx` — IB 400 bank
- Premium-gated via `<PremiumGate>` when `!isPaid`
- Fetches the 400-question bank from `/api/ib-questions` and the user's per-question progress from `/api/history?scope=ib`
- Category filter (IB 400 specific: Accounting, DCF, LBO, M&A, Valuation, Markets, Debt & Capital Structure, Brain Teasers), difficulty filter, search input, pull-to-refresh
- Tapping a question opens `/ib-question` modal which reuses the same reveal/grade flow as the dashboard and writes the result back to IB progress

### `app/(tabs)/history.tsx`
- Premium-gated; loads from `GET /api/history`
- Same filters as the web (`search`, category, difficulty, math, sort) — works on both standard question entries and interview entries

### `app/(tabs)/stats.tsx`
- Premium-gated; reads the same history source as the history tab
- Computes totals, average/best/worst score, streaks, per-category performance, difficulty breakdown (including OTG), and a recent trend

### `app/(tabs)/account.tsx`
- Signed-in: shows profile, paid-status pill, manage-billing entry (Stripe portal URL on non-iOS, Restore Purchases on iOS), Send Feedback / Feature Vote shortcuts, Privacy / Terms links, Sign Out, and a typed-DELETE account deletion flow that calls `POST /api/delete-account`
- Guest: shows sign-in / sign-up CTAs plus Privacy / Terms / Feedback links

### `app/interview.tsx`
- 4-step structured mock interview using `POST /api/interview` with `action: "generate" | "respond" | "debrief"`
- Setup → loading → active → debrief phases driven by a local `Phase` state machine
- Interview category list mirrors the web (no `OTG` here either)

### `app/paywall.tsx`
- Premium upsell; iOS uses the StoreKit purchase flow via RevenueCat, everything else falls back to Stripe Checkout via in-app browser

### `app/feedback.tsx` and `app/feature-vote.tsx`
- Modal versions of the web feedback/feature-vote pages, posting to `POST /api/feedback` with `type: "feedback"` or `type: "vote"`
- Feature voting is premium-only; feedback is open to everyone, including guests

### `app/(auth)/sign-in.tsx` and `app/(auth)/sign-up.tsx`
- Clerk-driven email/password, Google OAuth, and Sign in with Apple flows
- Sign-up handles email verification with a code input
- Both screens auto-redirect to `(tabs)` if Clerk reports an existing session

## Mobile Shared Constants (`mobile/src/constants.ts`)
- `DIFFICULTIES = ['Easy', 'Medium', 'Hard']`
- `QUESTION_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'OTG']`
- `CATEGORIES = ['All', 'Investment Banking', 'Private Equity', 'Asset Management', 'Accounting', 'Consulting', 'Valuation', 'Sales and Trading']` (matches web `src/constants.js`)
- `IB_CATEGORIES = CATEGORIES.filter(c => c !== 'All')` (IB 400 picker excludes "All")
- `MATH_OPTIONS = ['No Math', 'With Math']`
- `TIMER_PRESETS = [60, 120, 180, 300]`
- `INTERVIEW_QUESTIONS = 4`
- `FREE_DAILY_LIMIT = 5`
- `API_BASE = 'https://fitefinance.com/api'`
- `DIFFICULTY_COLORS`, `CATEGORY_ICONS`, `CATEGORY_SUBTITLES`, and `ROADMAP_IDEAS` for UI

When categories or difficulties change on the web, also update this file.

## Mobile Theme (`mobile/src/theme.ts`)
Mirrors the website palette:
- `bg` `#020817`, `surface` `#0d1b2a`, brand `#1565C0` / `#4FC3F7`, premium gold `#c9a84c`
- Inter for body, Manrope for display/eyebrow labels
- Gradient tuples for `expo-linear-gradient`, animation timing tokens, and shadow presets are all centralized here

## Mobile Dev Commands
```bash
cd mobile
npm install
npm start                # Expo Dev Server (scan QR code in Expo Go)
npm run ios              # `expo run:ios`
npm run android          # `expo run:android`
npm run build:ios        # `eas build --platform ios`
npm run build:android    # `eas build --platform android`
npm run submit:ios       # `eas submit --platform ios`
npm run submit:android   # `eas submit --platform android`
```

## Mobile Environment Variables
The mobile app reads its public Clerk key and RevenueCat key primarily through `app.json` `extra`, with `EXPO_PUBLIC_*` env fallbacks:

```text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY      # fallback if app.json `extra.clerkPublishableKey` is missing
EXPO_PUBLIC_REVENUECAT_IOS_KEY         # fallback if app.json `extra.revenueCatIosKey` is missing
```

No server secrets are bundled into the mobile app — Stripe + OpenAI + Clerk secret keys + RevenueCat webhook auth live exclusively on the Vercel backend.

## Mobile Implementation Notes
- The mobile app does NOT have its own backend. Every authenticated request is signed by a Clerk JWT minted from `useAuth().getToken()` and verified server-side by `src/server/auth.js`. Don't introduce mobile-only endpoints — extend the existing ones.
- Streaming endpoints must continue to send SSE so the XHR-based mobile client keeps the connection alive past Vercel's 10s function timeout.
- `paid:${userId}` Redis flag is the single source of truth for premium across web AND mobile. Both Stripe (web/Android) and RevenueCat (iOS) webhooks write into it.
- When deleting accounts, `pages/api/delete-account.js` must clear every per-user Redis key AND call `clerkClient().users.deleteUser(userId)` — App Store rules require account deletion to fully revoke OAuth grants (Sign in with Apple, Google) on the auth provider side.
- The mobile app already passes the App Store / Play Store review process. When making changes that touch billing UX, account deletion, or Sign in with Apple, run through `mobile/RESUBMISSION_CHECKLIST.md` before tagging a new build.
- Local dev requires Expo Go (or a development build) and `fitefinance://oauth-callback` registered in Clerk's social connections for Google and Apple.
