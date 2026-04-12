# Fite Finance

AI-powered finance interview prep at [fitefinance.com](https://www.fitefinance.com). Practice real interview questions across Investment Banking, Private Equity, Asset Management, Consulting, and more — with AI grading, question history, and a structured mock interview mode.

## Features

- **AI Question Generation** — scenario-based questions calibrated to category, difficulty, and math preference
- **AI Answer Grading** — written feedback on your answers (premium)
- **Interview Mode** — structured 4-question mock interviews with an AI interviewer that responds to your answers and delivers a post-interview debrief
- **Question History** — searchable log of past questions with stats and filters (premium)
- **Free / Premium tiers** — free users get 5 questions/day; premium ($3/month via Stripe) gets unlimited everything

## Tech Stack

- **Frontend**: Next.js (Pages Router), React
- **Backend**: Vercel serverless functions (`/api/`)
- **Auth**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI gpt-4o-mini
- **Database**: Upstash Redis
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
```

### Environment Variables

Create a `.env.local` file with the following:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_URL=http://localhost:3000
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Project Structure

```
/pages/               — Next.js pages (index, history, success, legal)
/pages/questions/     — Dynamic question routes [category]/[difficulty]/[math]
/api/                 — Vercel serverless functions
  question.js         — Question + answer generation
  grade.js            — AI answer grading
  interview-*.js      — Interview mode (generate, respond, debrief)
  checkout.js         — Stripe checkout
  history.js          — Question history (Redis)
  _openai.js          — Shared OpenAI client
  _questionBank.js    — Curated question bank for prompt calibration
  _constants.js       — Shared category list
/src/                 — React components, hooks, and styles
```

## Categories

Investment Banking, Private Equity, Asset Management, Accounting, Consulting, Valuation, Sales and Trading

## Scripts

```bash
npm run dev      — local dev server
npm run build    — production build
npm run start    — serve production build locally
```
