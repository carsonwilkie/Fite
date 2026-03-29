# Fite Finance — Personal Project Notes

## What It Is
Finance interview prep web app at fitefinance.com. Users pick a category, difficulty, and math preference to get AI-generated interview questions and answers. Built as a side project and monetized via a $3/month Stripe subscription.

## Tech Stack
- React (Create React App) — frontend
- Vercel — hosting + serverless API functions
- Clerk — authentication (email + Google OAuth)
- Stripe — payments ($3/month)
- OpenAI gpt-4o-mini — question/answer/grading generation
- Upstash Redis — stores question history per user
- Vercel Analytics + Speed Insights — usage tracking

## Free vs Premium
**Free**: 5 questions/day, no grading, no history, no custom prompt
**Premium ($3/month)**: Unlimited questions, AI answer grading, question history, custom question descriptor

## Key Pages
- **Home** (`/`) — select difficulty, math, category, optional custom prompt
- **Questions** (`/questions/...`) — get question, show answer, grade your answer
- **History** (`/history`) — premium only, shows all past questions with stats/search/filters
- **Success** (`/success`) — post-payment confirmation

## Features Built
- Google OAuth via Clerk
- Stripe checkout + customer portal
- AI answer grading (written feedback, no score, one attempt per question)
- Question history stored in Redis, displayed with expand/collapse
- History stats dashboard: total questions, graded count, top category, difficulty breakdown, category breakdown
- History search by keyword, filter by category/difficulty/math, sort newest/oldest
- Anti-repeat logic: questions asked in last 24hrs are skipped
- Session memory for difficulty/math selections (resets on tab close)
- Custom question descriptor (premium only, gold badge in history)
- Mobile responsive design with fixed transparent navbar on desktop, relative navbar on mobile
- Background image with dark shadow box around content
- "by Colgate's finest" byline — hidden in navbar on mobile, shown below support email instead
- Premium logo swap + gold PREMIUM badge
- Dynamic Stripe price fetched from API

## File Locations
- API functions: `/api/` (webhook, checkout, portal, checkPaid, question, grade, history, price)
- Pages: `/src/Home.js`, `/src/Questions.js`, `/src/History.js`, `/src/Success.js`
- Shared: `/src/Navbar.js`, `/src/App.js`, `/src/App.css`, `/src/ScrollToTop.js`
- Hooks: `/src/usePaidStatus.js` (returns `{ isPaid, loading }`), `/src/usePrice.js`

## Color Palette
- Dark navy: `#0a2463`
- Medium blue: `#4a6fa5`
- Light blue bg: `#e8edf5`
- Page bg: `#f0f4f8`
- Gold (premium): `#c9a84c`
- Dark text: `#1a1a2e`

## Important Implementation Details
- History is saved when user clicks "Grade My Answer" (not on question load) so userAnswer + feedback are always captured
- `answerRef` is used in `handleGrade` to capture the AI answer even if user grades before clicking Show Answer
- `usePaidStatus` uses localStorage caching + Clerk `isLoaded` check — always check `loading` before using `isPaid`
- Navbar is rendered once in `App.js` outside Routes to prevent flicker
- `pointer-events: none` on navbar on desktop so transparent navbar doesn't block clicks
- `overscroll-behavior-x: none` allows pull-to-refresh but blocks horizontal bounce

## Environment Variables (all set in Vercel)
- Clerk publishable + secret keys
- Stripe secret key, publishable key, price ID, webhook secret
- `NEXT_PUBLIC_URL=https://www.fitefinance.com`
- OpenAI API key
- Upstash Redis URL + token (auto-added via Vercel integration)

## Google OAuth
Redirect URI: `https://clerk.fitefinance.com/v1/oauth_callback`

## Future Ideas
- Progress tracking over time
- Referral system
- Annual pricing
- Free trial (3 days premium)
- Mock interview mode (5 questions in a row with overall grade)
- Email a question/answer to yourself
- Retry a question from history
