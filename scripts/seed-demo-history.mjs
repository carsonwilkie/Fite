/**
 * seed-demo-history.mjs
 *
 * Populates Upstash Redis with realistic Fite Finance history entries
 * showing clear user growth over ~75 days — early scores low, recent scores high.
 *
 * Usage:
 *   node scripts/seed-demo-history.mjs <CLERK_USER_ID>
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  for (const file of ['.env.local', '.env']) {
    try {
      const lines = readFileSync(join(__dirname, '..', file), 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!env[key]) env[key] = val;
      }
    } catch {}
  }
  return env;
}

async function redis(url, token, ...args) {
  const res = await fetch(`${url}/${args.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ─── History entries — 75 days of practice with clear upward score arc ────────
//
// Phase 1 (days 75–50 ago): beginner, scores 4–6, short answers, basic Qs
// Phase 2 (days 49–25 ago): developing, scores 6–7.5, more depth
// Phase 3 (days 24–1 ago):  confident, scores 8–10, expert answers
//
// 42 question entries + 4 interview sessions = 58 total questions counted

const ENTRIES = [

  // ── PHASE 1: Beginner (days 73–52 ago, scores 4–6) ─────────────────────────

  {
    daysAgo: 73, category: 'Investment Banking', difficulty: 'Easy', math: 'No Math', score: 4,
    question: 'What is investment banking?',
    answer: '## Model Answer\nInvestment banking helps companies raise capital and execute strategic transactions. Core functions: underwriting equity/debt offerings, M&A advisory, restructuring, and sales & trading. Goldman Sachs, Morgan Stanley, and JPMorgan are the bulge bracket firms.\n\n## Other Angles to Mention\n- Distinction between buy-side and sell-side\n- How fees are structured (retainers + success fees)\n- The role of the pitch book in winning mandates',
    userAnswer: 'Investment banking is when banks help companies raise money and do mergers and acquisitions. They advise on deals.',
    feedback: 'Basic definition is correct but very thin. You need to cover the full scope: underwriting, advisory, capital markets. Also missed the buy-side vs sell-side distinction which is fundamental. Aim for more structure next time.',
    timeTaken: 45, timeRemaining: 0,
  },
  {
    daysAgo: 71, category: 'Accounting', difficulty: 'Easy', math: 'No Math', score: 5,
    question: 'What are the three financial statements?',
    answer: '## Model Answer\nThe three financial statements are: (1) **Income Statement** — revenues minus expenses = net income over a period. (2) **Balance Sheet** — assets = liabilities + equity at a point in time. (3) **Cash Flow Statement** — operating, investing, and financing cash flows reconciling net income to actual cash.\n\n## Other Angles to Mention\n- How they link together (net income flows into retained earnings; depreciation is added back in CFO)\n- Why cash flow ≠ net income\n- Which statement is most important (CFO is king)',
    userAnswer: 'Income statement, balance sheet, and cash flow statement. Income statement shows profit. Balance sheet shows assets and liabilities. Cash flow shows cash.',
    feedback: 'Correct identification but too brief. Interviewers want to hear how they link — net income to retained earnings, depreciation add-back in CFO. Practice explaining the connections.',
    timeTaken: 52, timeRemaining: 0,
  },
  {
    daysAgo: 69, category: 'Valuation', difficulty: 'Easy', math: 'No Math', score: 4,
    question: 'What are the main valuation methodologies?',
    answer: '## Model Answer\nThree primary approaches: (1) **Comparable Company Analysis (Comps)** — public market multiples (EV/EBITDA, P/E) applied to the target. (2) **Precedent Transaction Analysis** — M&A deal multiples, typically higher than comps due to control premium. (3) **DCF** — intrinsic value based on discounted future free cash flows. Use all three together and triangulate.\n\n## Other Angles to Mention\n- When each methodology is most appropriate\n- Why precedent transactions typically yield higher values than comps\n- LBO as a fourth methodology for PE targets',
    userAnswer: 'DCF and comparables. DCF looks at future cash flows discounted back. Comparables look at similar companies.',
    feedback: 'You missed precedent transactions, which is always the third leg of the valuation triangle. Also, the LBO as a floor value for PE situations is important. Add more structure to your answer.',
    timeTaken: 38, timeRemaining: 0,
  },
  {
    daysAgo: 67, category: 'Private Equity', difficulty: 'Easy', math: 'No Math', score: 5,
    question: 'What is private equity?',
    answer: '## Model Answer\nPrivate equity firms raise capital from institutional investors (LPs) and deploy it to acquire private companies or take public companies private, with the goal of improving operations and selling at a profit after 3–7 years. They use leverage to amplify returns (hence "leveraged buyout"). The GP earns a 2% management fee and 20% carried interest on profits.\n\n## Other Angles to Mention\n- Distinction between PE and venture capital (stage, control, leverage)\n- The J-curve in fund performance\n- Portfolio construction: typical fund has 8–15 investments',
    userAnswer: 'Private equity funds buy companies, improve them, and sell them for a profit. They use debt to do this. They target returns of 20%+ IRR.',
    feedback: 'Solid basic answer. Missing the LP/GP structure and the 2-and-20 fee model which is standard knowledge. Also the 3-7 year hold period is worth mentioning.',
    timeTaken: 60, timeRemaining: 0,
  },
  {
    daysAgo: 64, category: 'Accounting', difficulty: 'Easy', math: 'With Math', score: 5,
    question: 'If revenue is $100 and cost of goods sold is $60, what is gross profit and gross margin?',
    answer: '## Model Answer\nGross Profit = Revenue – COGS = $100 – $60 = **$40**\n\nGross Margin = Gross Profit / Revenue = $40 / $100 = **40%**\n\nGross margin measures how efficiently a company produces its goods/services before accounting for operating expenses. High gross margins (>70%) are typical of software; low margins (<30%) are typical of retailers and commodity businesses.\n\n## Other Angles to Mention\n- Gross margin expansion/contraction as a key trend to watch\n- Difference between gross margin and operating margin\n- How pricing power affects gross margins',
    userAnswer: 'Gross profit is $40. Gross margin is 40%. Revenue minus COGS.',
    feedback: 'Math is correct. But you should explain WHY gross margin matters and what a good gross margin looks like across industries. Context shows you understand the metric, not just the formula.',
    timeTaken: 30, timeRemaining: 15,
  },
  {
    daysAgo: 61, category: 'Investment Banking', difficulty: 'Medium', math: 'No Math', score: 5,
    question: 'What is EBITDA and why do bankers use it?',
    answer: '## Model Answer\nEBITDA = Earnings Before Interest, Taxes, Depreciation & Amortization. It approximates operating cash flow and is capital structure-neutral (ignores financing decisions) and accounting-neutral (adds back non-cash charges).\n\nBankers use it because: (1) it enables cross-company comparisons regardless of leverage or tax jurisdiction, (2) EV/EBITDA is the most common buyout valuation multiple, (3) it proxies for the cash a business generates to service debt.\n\n## Other Angles to Mention\n- Limitations: ignores capex (use EBITDA-CapEx or FCF instead for capital-intensive businesses)\n- "EBITDA is not cash flow" — Buffett famously criticizes it\n- Adjusted EBITDA and what gets added back',
    userAnswer: 'EBITDA is earnings before interest taxes depreciation and amortization. Bankers use it to compare companies because it removes the effects of financing and accounting decisions.',
    feedback: 'Good start. You got the definition and the core reason. To improve: explain WHY it removes financing effects (so you can compare levered vs unlevered companies) and mention the key limitation (ignores capex needs).',
    timeTaken: 75, timeRemaining: 0,
  },
  {
    daysAgo: 58, category: 'Valuation', difficulty: 'Medium', math: 'No Math', score: 6,
    question: 'Walk me through a DCF.',
    answer: '## Model Answer\nA DCF values a company by: (1) projecting free cash flows 5–10 years, (2) calculating a terminal value at the end of the projection period, (3) discounting everything back at WACC.\n\nFCF = EBIT(1–t) + D&A – CapEx – ΔNWC\n\nTerminal Value: either Gordon Growth (FCF × (1+g) / (WACC–g)) or exit multiple (EBITDA × multiple).\n\nSum the PV of FCFs + PV of TV = Enterprise Value. Subtract net debt = Equity Value. Divide by shares = price per share.\n\n## Other Angles to Mention\n- TV often represents 60–80% of total value\n- Sensitivity tables on WACC and growth rate are essential\n- WACC = weighted average of cost of debt and equity (CAPM for equity)',
    userAnswer: 'Project free cash flows for 5 years, calculate a terminal value using either the Gordon Growth Model or an exit multiple, then discount everything back at the WACC. The sum gives you enterprise value. Subtract debt to get equity value.',
    feedback: 'Good structure and much better than your previous answers. You got all the key steps. Missing: FCF formula definition, and the observation that terminal value dominates (60-80% of value) which shows analytical depth.',
    timeTaken: 110, timeRemaining: 0,
  },
  {
    daysAgo: 55, category: 'Consulting', difficulty: 'Easy', math: 'No Math', score: 6,
    question: 'What is a SWOT analysis?',
    answer: '## Model Answer\nSWOT = Strengths, Weaknesses, Opportunities, Threats. Internal factors: Strengths (what you do well), Weaknesses (gaps/limitations). External factors: Opportunities (market trends, white space), Threats (competition, regulation).\n\nIn consulting, SWOT is a starting framework but not an end — it should feed into strategic recommendations. A good SWOT is specific and evidence-based, not generic.\n\n## Other Angles to Mention\n- SWOT is descriptive, not prescriptive — always follow with "so what?"\n- TOWS matrix: matching internal/external factors to generate strategies\n- Porter\'s Five Forces as a more rigorous external analysis complement',
    userAnswer: 'SWOT stands for Strengths, Weaknesses, Opportunities, and Threats. Strengths and weaknesses are internal, opportunities and threats are external. It helps companies understand their position.',
    feedback: 'Correct but basic. A strong consulting answer would add that SWOT is only the starting point — you need to turn it into actionable strategy. Mention the TOWS matrix for extra credit.',
    timeTaken: 50, timeRemaining: 0,
  },

  // ── PHASE 2: Developing (days 49–22 ago, scores 6–7.5) ──────────────────────

  {
    daysAgo: 49, category: 'Investment Banking', difficulty: 'Medium', math: 'With Math', score: 6,
    question: 'How do you calculate enterprise value from equity value?',
    answer: '## Model Answer\nEV = Equity Value + Total Debt + Preferred Stock + Minority Interest – Cash & Equivalents\n\nIntuition: EV represents what you would pay to acquire the entire business. You start with the equity market cap, add what you\'d assume for debt holders and preferred shareholders, add minority interest (you consolidate their assets but don\'t own them), then subtract cash (which offsets purchase price).\n\n## Other Angles to Mention\n- Operating leases are sometimes added (particularly post-ASC 842)\n- Cash must be "excess cash" — some cash is needed to run the business\n- EV can be less than equity value if a company has net cash (cash > debt)',
    userAnswer: 'Enterprise value equals equity value plus debt plus preferred stock plus minority interest minus cash. You add debt because a buyer assumes it, and subtract cash because it reduces the net price.',
    feedback: 'Good answer. You included the correct components and gave good intuition for why debt is added and cash subtracted. For higher marks: mention minority interest treatment and the edge case where EV < equity value.',
    timeTaken: 85, timeRemaining: 10,
  },
  {
    daysAgo: 46, category: 'Accounting', difficulty: 'Medium', math: 'With Math', score: 7,
    question: 'Walk me through depreciation on the three financial statements.',
    answer: '## Model Answer\nDepreciation flows through all three statements:\n\n**Income Statement:** Depreciation is a non-cash expense reducing EBIT. If depreciation increases by $10, EBIT falls $10, and net income falls $10 × (1 – tax rate).\n\n**Cash Flow Statement:** Since depreciation is non-cash, it\'s added back in operating activities. Net cash impact is just the tax shield: +$10 × tax rate.\n\n**Balance Sheet:** Accumulated depreciation reduces net PP&E by $10. Retained earnings fall by the after-tax amount.\n\n**The linkage:** $10 more depreciation → NI down by $6 (at 40% tax) → CFO up by $4 (net of tax shield) → net PP&E down $10.\n\n## Other Angles to Mention\n- Depreciation creates a tax shield (reduces taxable income)\n- Book vs. tax depreciation creates deferred tax liability\n- EBITDA adds back depreciation to get a cash earnings proxy',
    userAnswer: 'On the income statement, depreciation reduces EBIT and net income. On the cash flow statement, it\'s added back as a non-cash charge, so the tax shield is the net cash impact. On the balance sheet, accumulated depreciation reduces net PP&E and retained earnings fall by the after-tax amount.',
    feedback: 'Solid answer with good linkage between all three statements. You correctly identified the tax shield concept. To make it perfect: walk through a specific numerical example to show you can do it live.',
    timeTaken: 120, timeRemaining: 5,
  },
  {
    daysAgo: 43, category: 'Private Equity', difficulty: 'Medium', math: 'With Math', score: 7,
    question: 'What is an LBO and how do returns work?',
    answer: '## Model Answer\nAn LBO (leveraged buyout) is the acquisition of a company using significant debt (typically 50-65% of the capital structure) to amplify equity returns.\n\n**How returns work — three drivers:**\n1. **EBITDA growth** — operational improvement increases exit value\n2. **Multiple expansion** — if entry multiple < exit multiple\n3. **Debt paydown** — FCF reduces debt, increasing equity value\n\n**Returns math:** If you buy at 7x $50M EBITDA = $350M. 60% debt = $210M debt, $140M equity. Grow EBITDA to $75M in 5 years, paydown $80M debt. Exit at 8x: $600M TEV → $600M – $130M debt = $470M equity → 3.4x MOIC / ~28% IRR.\n\n## Other Angles to Mention\n- The J-curve in fund returns\n- Why LBOs work better for stable, cash-generative businesses\n- Management incentive alignment through equity rollover',
    userAnswer: 'An LBO uses debt to buy a company and amplify equity returns. Returns come from three sources: EBITDA growth, multiple expansion, and debt paydown. If you put in $140M equity and get back $470M equity in 5 years, that\'s about 3.4x MOIC or 27% IRR.',
    feedback: 'Strong answer. You correctly identified all three return drivers and can do the math. Excellent improvement from early sessions. Add: why certain business profiles (stable cash flows, asset-light) are better LBO candidates.',
    timeTaken: 150, timeRemaining: 20,
  },
  {
    daysAgo: 40, category: 'Valuation', difficulty: 'Medium', math: 'No Math', score: 7,
    question: 'What is the difference between trailing and forward multiples?',
    answer: '## Model Answer\n**Trailing multiples** (LTM — Last Twelve Months) use actual historical financials. More reliable because the numbers are real, but may not reflect the company\'s current trajectory.\n\n**Forward multiples** (NTM — Next Twelve Months) use analyst estimates or management guidance. More relevant for fast-growing companies where LTM understates the business, but subject to forecast error.\n\n**When to use each:**\n- Mature, stable businesses: LTM is reliable\n- High-growth companies: NTM avoids penalizing them for past small size\n- M&A: both are used; buyers typically model on NTM + synergies\n\n## Other Angles to Mention\n- 2-year forward multiples for very high growth\n- The danger of "hockey stick" forecasts inflating NTM multiples\n- Consensus estimates as a starting point, then adjust',
    userAnswer: 'Trailing multiples use the last twelve months of actual results. Forward multiples use the next twelve months of estimates. Forward multiples are more relevant for growing companies. Both should be used for a complete picture.',
    feedback: 'Correct and well-reasoned. Good point about growing companies. You could add: the specific risk of NTM multiples relying on potentially optimistic forecasts, and when a deal team might prefer one over the other.',
    timeTaken: 95, timeRemaining: 0,
  },
  {
    daysAgo: 37, category: 'Sales and Trading', difficulty: 'Medium', math: 'With Math', score: 6,
    question: 'What is the yield curve and what does an inverted yield curve signal?',
    answer: '## Model Answer\nThe **yield curve** plots yields on government bonds across maturities (typically 3-month to 30-year). Normally upward sloping: longer duration = higher yield to compensate for time risk.\n\n**Inverted yield curve:** Short-term yields exceed long-term yields. Historically the most reliable recession predictor (has preceded every U.S. recession since 1955, with 6–18 month lag).\n\n**Why it inverts:** Markets expect the Fed to cut rates in the future (due to coming slowdown), pulling long rates down. Short rates remain elevated due to current tight monetary policy.\n\n**Trading implications:** Long duration bonds outperform, bank NIMs compress, risk assets typically reprice lower.\n\n## Other Angles to Mention\n- 2s10s spread as the most-watched inversion metric\n- "This time is different" arguments (and why they\'re usually wrong)\n- Steepening vs. flattening as trades',
    userAnswer: 'The yield curve shows yields across different maturities. An inverted yield curve means short-term rates are higher than long-term rates. It\'s a recession signal because it shows markets expect rates to fall in the future.',
    feedback: 'Correct core answer. For a S&T role, you need more texture: mention the 2s10s spread specifically, the historical accuracy as a recession predictor, and what trades you\'d put on if you believed the inversion would steepen back.',
    timeTaken: 130, timeRemaining: 0,
  },
  {
    daysAgo: 34, category: 'Asset Management', difficulty: 'Medium', math: 'No Math', score: 7,
    question: 'What is alpha and how is it measured?',
    answer: '## Model Answer\n**Alpha** is risk-adjusted outperformance versus a benchmark. If the S&P returns 10% and your portfolio returns 13% with the same risk, you generated 3% alpha.\n\n**Measurement:** Jensen\'s Alpha = Portfolio Return – [Risk-Free Rate + Beta × (Market Return – Risk-Free Rate)]\n\nAlpha is hard to generate consistently because markets are largely efficient. Sources of alpha: informational edge, analytical edge (better modeling), behavioral edge (exploiting market irrationality), structural edge (accessing illiquid premiums).\n\n**Key nuance:** alpha can be confused with beta-loading — a fund that simply owns high-beta stocks will outperform in bull markets but that\'s not skill.\n\n## Other Angles to Mention\n- Alpha decay: edges get arbitraged away as more capital chases them\n- The difference between gross alpha and net-of-fee alpha\n- Factor investing vs. pure alpha generation',
    userAnswer: 'Alpha is risk-adjusted excess return over a benchmark. It\'s measured using Jensen\'s Alpha: portfolio return minus the expected return given its beta. True alpha is hard to generate consistently because markets are efficient. You need an informational, analytical, or behavioral edge.',
    feedback: 'Good answer. You correctly stated the formula and identified the key sources of alpha. Strong improvement in depth and precision versus earlier sessions. Add: the distinction between gross and net-of-fee alpha, which LPs care about.',
    timeTaken: 140, timeRemaining: 15,
  },
  {
    daysAgo: 31, category: 'Investment Banking', difficulty: 'Hard', math: 'With Math', score: 7,
    question: 'How would you value a company with negative EBITDA?',
    answer: '## Model Answer\nFor a pre-profitability company, traditional EV/EBITDA is useless. Approach by stage:\n\n**1. Revenue multiples** — EV/Revenue is the primary lens. Calibrate to growth rate; use EV/NTM Revenue for dynamic businesses.\n\n**2. DCF with long runway** — Project to when FCF turns positive (year 4–7), discount back. Terminal value dominates. Sensitivity on discount rate is critical.\n\n**3. Comparable transactions** — Recent deals at similar growth/margin profiles. Private market comps are more relevant than public comps.\n\n**4. Unit economics** — LTV/CAC ratio, cohort margins, gross margin trajectory. These predict future profitability.\n\n**Rule of 40** for SaaS: growth rate + EBITDA margin > 40% = healthy business.\n\n## Other Angles to Mention\n- Gross margin matters — negative EBITDA from S&M spending is better than negative gross margins\n- Runway and burn rate in the context of next fundraise\n- EV/ARR for SaaS specifically',
    userAnswer: 'For negative EBITDA companies I would use EV/Revenue multiples since EBITDA-based multiples don\'t work. I\'d also run a DCF projecting out to profitability and look at comparable transactions. For SaaS, Rule of 40 and LTV/CAC are key health metrics. Gross margin trajectory matters a lot — losing money on S&M is much better than losing on cost of goods.',
    feedback: 'Good answer showing clear improvement. You correctly dismissed EBITDA multiples, used the right alternatives, and showed sector-specific knowledge with Rule of 40 and LTV/CAC. Very solid.',
    timeTaken: 160, timeRemaining: 25,
  },
  {
    daysAgo: 28, category: 'Accounting', difficulty: 'Hard', math: 'With Math', score: 7,
    question: 'How does a $100 stock buyback affect the three financial statements?',
    answer: '## Model Answer\n**Balance Sheet:** Cash –$100, Treasury Stock (contra-equity) +$100, so Total Equity –$100. Total assets down $100.\n\n**Income Statement:** No direct effect in the period. EPS increases going forward because share count decreases (same earnings ÷ fewer shares).\n\n**Cash Flow Statement:** $100 outflow in Financing Activities (repurchase of common stock).\n\n**Secondary effects:**\n- Debt/equity ratio increases (less equity in denominator)\n- EPS accretion supports higher stock price if P/E multiple holds\n- Tax-efficient vs. dividends (buybacks are better for high-tax investors)\n\n## Other Angles to Mention\n- ASR vs. open market repurchase\n- Signaling theory: management buying back signals undervaluation\n- Risk: buybacks at peak valuations destroy value (e.g., banks pre-2008)',
    userAnswer: 'Cash decreases by $100 on the balance sheet, offset by a $100 increase in treasury stock, so equity falls $100 and total assets fall $100. On the income statement, no immediate impact but EPS improves because share count fell. On the cash flow statement, it\'s a $100 financing outflow. Leverage increases since equity declined.',
    feedback: 'Excellent answer. Clean linkage across all three statements, EPS accretion logic, and the leverage increase observation. You\'ve come a long way — this is exactly interview-ready. Add: buyback signaling theory.',
    timeTaken: 145, timeRemaining: 30,
  },

  // ── PHASE 3: Confident (days 21–1 ago, scores 8–10) ────────────────────────

  {
    daysAgo: 21, category: 'Valuation', difficulty: 'Hard', math: 'With Math', score: 8,
    question: 'Build a quick LBO return analysis — 7x entry, $50M EBITDA, 5 years.',
    answer: '## Model Answer\n**Entry:** 7x × $50M = $350M TEV. Assume 60% leverage: $210M debt, $140M equity.\n\n**Operations:** 10% annual EBITDA growth → $80.5M EBITDA at year 5.\n\n**Debt paydown:** $12M FCF/year → $60M cumulative paydown → $150M remaining debt.\n\n**Exit at 8x:** $80.5M × 8 = $644M TEV → $644M – $150M = $494M equity.\n\n**Returns:** $494M / $140M = **3.5x MOIC / ~28% IRR** → strong deal.\n\n**Sensitivity:** At flat 7x exit multiple, equity = $413M → 3.0x / ~24% IRR — still meets threshold.\n\n## Other Angles to Mention\n- Operating improvements (margin expansion, add-ons) can push to 4x+\n- Downside: flat EBITDA, no debt paydown → 1.5x at 7x exit\n- IRR is time-sensitive; a 3x in 3 years >> 3x in 7 years',
    userAnswer: 'Entry: $350M TEV, 60% debt = $210M, $140M equity. Over 5 years at 10% EBITDA growth, EBITDA reaches about $80M. Paying down $12M debt per year gets debt to $150M. Exit at 8x: $640M TEV, equity value $490M. Returns: 3.5x MOIC, roughly 28% IRR. I\'d also run a downside at flat 7x exit: $560M TEV, $410M equity, about 3x / 24% IRR — still above hurdle.',
    feedback: 'Outstanding. The math is tight, you ran a downside case without being asked, and the IRR is correct. This is the answer a strong associate would give. Excellent.',
    timeTaken: 180, timeRemaining: 60,
  },
  {
    daysAgo: 18, category: 'Investment Banking', difficulty: 'Hard', math: 'With Math', score: 9,
    question: 'What happens to working capital in a fast-growing company and why does it consume cash?',
    answer: '## Model Answer\nFCF = EBIT(1–t) + D&A – CapEx – **ΔNWC**\n\nWorking capital = Receivables + Inventory – Payables. As revenue grows rapidly:\n- Receivables grow (more sales on credit outstanding)\n- Inventory grows (needed to support higher sales)\n- Payables grow too, but typically less fast\n\n**Net effect:** NWC increases → ΔWC is negative in the FCF formula → cash consumed.\n\n**Example:** If revenue grows $100M with 30-day DSO: receivables grow $8.2M ($100M × 30/365) → $8.2M cash consumed just from that one metric.\n\n**Amazon counterexample:** Negative WC (paid by customers before paying suppliers) → WC is a structural cash SOURCE and funds growth.\n\n**Levers:** Reduce DSO (tighter collections), extend DPO (negotiate better supplier terms), improve inventory turns.\n\n## Other Angles to Mention\n- WC seasonality (retailers build inventory in Q3, release in Q4)\n- WC as a valuation consideration in M&A (peg NWC in purchase price)',
    userAnswer: 'Working capital = receivables + inventory minus payables. As a company grows rapidly, receivables and inventory scale with revenue but payables grow more slowly. The result is NWC increases and that consumes cash — it\'s the delta NWC in the FCF formula. With 30-day DSO on $100M revenue growth, receivables increase $8.2M. Amazon is a famous example of negative working capital — they collect cash before paying suppliers so WC funds growth. Key levers: reduce DSO, extend DPO, improve inventory turns.',
    feedback: 'Excellent. Precise formula, concrete numerical example, the Amazon counterexample is exactly what separates top candidates. Textbook answer.',
    timeTaken: 175, timeRemaining: 45,
  },
  {
    daysAgo: 15, category: 'Private Equity', difficulty: 'Hard', math: 'With Math', score: 9,
    question: 'What makes a good LBO candidate?',
    answer: '## Model Answer\nA strong LBO candidate has characteristics that support using significant leverage and generating equity returns:\n\n**1. Stable, predictable cash flows** — Debt must be serviced; volatile EBITDA = covenant risk. Ideal: contracted revenues, recurring subscriptions, non-cyclical demand.\n\n**2. Strong free cash flow conversion** — Low capex requirements, minimal working capital needs. EBITDA-to-FCF conversion >70% is attractive.\n\n**3. Defensible market position** — Moat protects margins and revenue visibility. Not easily disrupted.\n\n**4. Operational improvement levers** — Margin expansion opportunity, cost takeout, add-on acquisition platform = ways to grow EBITDA beyond revenue growth.\n\n**5. Reasonable valuation** — Entry multiple matters enormously for IRR math; overpaying for quality still destroys returns.\n\n**6. Viable exit paths** — Strategic buyers, financial buyers, or IPO market must exist.\n\n## Other Angles to Mention\n- Asset-light business models are better (less capex = more FCF for debt service)\n- Management team quality and willingness to partner\n- Industry tailwinds that support organic growth without heavy reinvestment',
    userAnswer: 'A great LBO candidate has predictable cash flows (to service debt), low capex requirements (asset-light), strong free cash flow conversion above 70%, a defensible market position, and clear operational improvement levers the PE firm can pull. Valuation at entry matters enormously — even a great business at 15x EBITDA will struggle to generate 20%+ IRR. You also need multiple viable exit paths: strategic buyers, other PE firms, or a public market.',
    feedback: 'Excellent comprehensive answer. All six criteria covered with good reasoning. The point about entry multiple mattering even for quality businesses shows sophisticated thinking. Perfect.',
    timeTaken: 195, timeRemaining: 65,
  },
  {
    daysAgo: 12, category: 'Accounting', difficulty: 'Hard', math: 'With Math', score: 9,
    question: 'What is deferred revenue and how does it affect valuation?',
    answer: '## Model Answer\n**Deferred revenue** is a liability representing cash received for services/products not yet delivered. It\'s common in SaaS (annual subscriptions paid upfront), software, airlines (ticket sales), and maintenance contracts.\n\n**Balance sheet:** Current liability until earned. As the service is delivered, revenue is recognized and the liability decreases.\n\n**Valuation impact in M&A:**\nIn an acquisition, the acquired company\'s deferred revenue is written down to "fair value" in purchase accounting (typically to cost + normal profit margin, much less than face value). This creates a **deferred revenue haircut** — the acquirer will recognize less revenue than the target would have standalone.\n\n**Example:** $10M deferred revenue haircut at 25% EBITDA margin = $2.5M less EBITDA in year 1 post-close. Acquirers model this in their synergies/dis-synergies analysis.\n\n## Other Angles to Mention\n- Why high deferred revenue is a quality signal (customers pay upfront = strong demand)\n- Rule 606 (ASC 606) and how it changed revenue recognition\n- Deferred revenue burn model in SaaS M&A diligence',
    userAnswer: 'Deferred revenue is a liability for cash received before the service is delivered — common in SaaS with annual subscriptions. As the service is delivered, revenue is recognized and the liability unwinds. In M&A, acquired deferred revenue gets written down to fair value in purchase accounting, which means the acquirer recognizes less revenue than expected — the "deferred revenue haircut." On a $10M balance at 25% margin, that\'s $2.5M less EBITDA in year one. Buyers model this explicitly in their post-close financial projections.',
    feedback: 'Superb answer. The purchase accounting treatment of deferred revenue is a nuanced point that most candidates miss entirely. You quantified the impact correctly and showed you understand why it matters in deal modeling. Excellent.',
    timeTaken: 200, timeRemaining: 70,
  },
  {
    daysAgo: 9, category: 'Valuation', difficulty: 'Hard', math: 'With Math', score: 9,
    question: 'What is WACC and walk me through how to calculate it?',
    answer: '## Model Answer\n**WACC** = (E/V × Re) + (D/V × Rd × (1–T))\n\nWhere: E = market value of equity, D = market value of debt, V = E+D, Re = cost of equity, Rd = cost of debt, T = tax rate.\n\n**Cost of equity (Re):** Use CAPM: Re = Rf + β × (Rm – Rf)\n- Rf = risk-free rate (10-yr Treasury, currently ~4.5%)\n- β = levered beta from comparable companies (unlever, then re-lever for target capital structure)\n- (Rm–Rf) = equity risk premium (~5–6%)\n\n**Cost of debt (Rd):** YTM on existing debt or estimated rate for new debt. Multiply by (1–T) for tax shield.\n\n**Example:** 60% equity at 10% Re, 40% debt at 5% Rd, 25% tax → WACC = 0.6×10% + 0.4×5%×0.75 = **7.5%**\n\n## Other Angles to Mention\n- Circular reference: WACC depends on capital structure which depends on EV which depends on WACC\n- WACC is not constant — changes with capital structure\n- Adding an illiquidity premium for private companies (typically 2–5%)',
    userAnswer: 'WACC = (E/V × Re) + (D/V × Rd × (1-T)). Cost of equity uses CAPM: Rf plus beta times the equity risk premium. I use the 10-year Treasury for Rf (~4.5% today) and 5-6% for ERP. Beta should be unlevered from comps and re-levered for the target structure. Cost of debt is the YTM on existing debt or marginal borrowing rate, tax-effected. Example: 60/40 equity/debt, 10% Re, 5% Rd, 25% tax → WACC = 7.5%. For private companies, add 2-4% illiquidity premium.',
    feedback: 'Perfect answer. Correct formula, CAPM walkthrough with real numbers, proper beta treatment, and the private company adjustment. This is a complete, interview-winning response.',
    timeTaken: 210, timeRemaining: 90,
  },
  {
    daysAgo: 6, category: 'Investment Banking', difficulty: 'Hard', math: 'No Math', score: 10,
    question: 'Walk me through how you\'d run an M&A process for a sell-side client.',
    answer: '## Model Answer\nA sell-side M&A process typically runs 4–6 months in three phases:\n\n**Phase 1 — Preparation (6–8 weeks)**\n- Develop CIM (Confidential Information Memorandum) and management presentation\n- Build the financial model and set valuation expectations with client\n- Identify and tier the buyer universe (strategics vs. financials, domestic vs. international)\n- Prepare data room (VDR)\n\n**Phase 2 — Marketing (8–10 weeks)**\n- Send teasers, execute NDAs, distribute CIM\n- Management presentations with interested parties\n- Solicit first-round bids (IOIs — Indications of Interest)\n- Downselect to 3–5 qualified buyers for due diligence\n\n**Phase 3 — Negotiation & Close (6–8 weeks)**\n- Final bids (LOIs/definitive proposals) with markup of purchase agreement\n- Confirmatory diligence and financing commitments\n- Negotiate and sign definitive agreement\n- Regulatory approvals → close\n\n**Managing the client:** Maintain competitive tension across multiple bidders to maximize price. Never let a single buyer know they\'re the only one.\n\n## Other Angles to Mention\n- Controlled auction vs. targeted process vs. negotiated sale\n- How a banker protects confidentiality during the process\n- Break-up fees and deal protections in the purchase agreement',
    userAnswer: 'A sell-side process has three phases. First, 6-8 weeks of prep: build the CIM, financial model, management presentation, and identify the buyer universe — stratified into strategic and financial buyers. Second, 8-10 weeks of marketing: teasers and NDAs, then the CIM, then management presentations, then first-round bids to downselect to 3-5 serious parties. Third, 6-8 weeks of negotiation: final bids with redlined purchase agreements, confirmatory diligence, financing lock-up, then sign and work toward regulatory close. Throughout, you maintain competitive tension — no buyer should know they\'re the last one standing. That\'s how you maximize price for the client.',
    feedback: 'Flawless. You laid out all three phases with correct timing, covered the competitive tension point (which most candidates miss), and showed you understand the full deal lifecycle. This is how a strong associate thinks about process.',
    timeTaken: 220, timeRemaining: 80,
  },
  {
    daysAgo: 3, category: 'Private Equity', difficulty: 'Hard', math: 'With Math', score: 10,
    question: 'How would you diligence the quality of earnings for a PE acquisition target?',
    answer: '## Model Answer\nQuality of Earnings (QoE) analysis determines how much of reported EBITDA is real, recurring, and representative of the go-forward business.\n\n**Key adjustments:**\n1. **Non-recurring items** — Remove one-time gains (asset sales, insurance proceeds) and add back non-recurring costs (restructuring, legal settlements, one-time bonuses)\n2. **Revenue quality** — Test customer concentration, contract terms, churn, and revenue recognition timing (is revenue being pulled forward?)\n3. **Normalized owner compensation** — Owner/operators often pay themselves above or below market; normalize to market rate\n4. **Working capital analysis** — Identify whether WC is structurally normal or temporarily favorable (e.g., stretched payables)\n5. **Pro-forma adjustments** — Acquisitions, divestitures, run-rate savings from cost actions\n\n**Red flags:** Revenue concentration >30% in one customer, aggressive revenue recognition, operating leases kept off-balance-sheet, channel stuffing at period end.\n\n**Output:** Adjusted EBITDA ("PE EBITDA") which is typically 10–25% different from reported EBITDA.\n\n## Other Angles to Mention\n- Third-party QoE report from accounting firm (standard in PE diligence)\n- EBITDA bridge from reported to adjusted showing each add-back\n- Customer interviews as a key qualitative check',
    userAnswer: 'QoE analysis starts with reported EBITDA and works to get to "true" recurring EBITDA. Key adjustments: strip out non-recurring items (both one-time gains and one-time costs), normalize owner compensation to market rates, test revenue quality for concentration and recognition issues, and check whether working capital is structurally normal or temporarily favorable. Red flags: >30% customer concentration, aggressive revenue recognition, period-end channel stuffing. Output is an adjusted EBITDA bridge that\'s typically 10-25% different from reported. You always get a third-party accounting firm to do the QoE report — it\'s standard in PE diligence and provides legal cover. The EBITDA bridge is one of the most important deliverables in the entire process.',
    feedback: 'Outstanding answer. You nailed the framework, quantified the typical magnitude of adjustments (10-25%), identified the right red flags, and showed process knowledge with the third-party QoE report. This is exactly what a PE associate should know cold. Perfect.',
    timeTaken: 230, timeRemaining: 120,
  },
  {
    daysAgo: 1, category: 'Valuation', difficulty: 'Hard', math: 'With Math', score: 10,
    question: 'What is the difference between a merger and an acquisition, and how does purchase accounting work?',
    answer: '## Model Answer\n**Merger:** Two companies combine to form a new entity; both cease to exist separately. Typically structured as a stock deal. True mergers of equals are rare.\n\n**Acquisition:** One company (acquirer) purchases another (target), which may cease to exist or become a subsidiary. More common structure.\n\n**Purchase Accounting (ASC 805):**\nWhen an acquisition closes, the acquirer must revalue all of the target\'s assets and liabilities to **fair value** on the acquisition date.\n\nKey steps:\n1. Identify and value all tangible assets at FMV\n2. Identify intangible assets not on target\'s books (customer relationships, technology, brand, non-competes)\n3. Record deferred revenue at fair value (haircut)\n4. **Goodwill** = Purchase Price – Fair Value of Net Identifiable Assets (the "plug")\n\n**P&L impact post-close:**\n- Identified intangibles are amortized (non-cash drag on net income)\n- Deferred revenue haircut reduces reported revenue\n- Inventory step-up flows through COGS in first year (one-time hit)\n\nThis is why acquirers present "adjusted" or "pro-forma" financials excluding purchase accounting noise.\n\n## Other Angles to Mention\n- Stock vs. cash consideration (tax and dilution implications)\n- Earnouts as a way to bridge valuation gaps\n- Deferred tax liabilities created by intangible step-ups',
    userAnswer: 'A merger combines two companies into one new entity; an acquisition has one company buying another. In practice most deals are acquisitions. Under ASC 805 purchase accounting, the acquirer must mark all target assets and liabilities to fair value at close. Key mechanics: identified intangibles (customer relationships, IP, brand) are written up and then amortized post-close creating a non-cash drag. Deferred revenue gets haircut to fair value. Inventory step-up hits COGS in year one. The plug that makes everything balance is goodwill — it captures everything the buyer paid for that can\'t be separately identified. That\'s why deals often create goodwill impairment risk if they underperform: the goodwill was the premium for expected synergies that never materialized.',
    feedback: 'Perfect answer. You correctly covered the legal distinction, walked through ASC 805 with precision, identified all the P&L impact items, and made an insightful point about goodwill impairment risk from failed synergies. This is senior analyst level knowledge. Exceptional.',
    timeTaken: 245, timeRemaining: 115,
  },
];

// ─── Interview sessions — also showing growth arc ────────────────────────────

const INTERVIEWS = [
  {
    daysAgo: 62,
    category: 'Investment Banking',
    difficulty: 'Easy',
    math: 'No Math',
    score: 5.5,
    scenario: 'You are a first-round analyst candidate at a mid-market investment bank. The associate walks you through a basic M&A situation involving a consumer goods company looking to acquire a smaller competitor.',
    questions: [
      {
        question: 'Why do companies pursue mergers and acquisitions?',
        idealAnswer: 'Strategic rationale includes: revenue synergies (cross-selling, new geographies), cost synergies (eliminating duplicate functions), acquiring technology/talent, achieving scale, and eliminating a competitor. Financial motivation: accretive EPS if acquired at lower P/E than acquirer.',
        userAnswer: 'Companies do M&A to grow faster, get synergies, and eliminate competition.',
        score: 5,
        feedback: 'Too brief. You need to distinguish revenue vs. cost synergies and mention the accretion/dilution concept. Good instinct but needs more depth.',
      },
      {
        question: 'What is a fairness opinion?',
        idealAnswer: 'A fairness opinion is a professional assessment by an investment bank stating that the financial terms of an M&A transaction are fair to shareholders. It provides legal protection for the board of directors when approving a deal. Required in most public company transactions.',
        userAnswer: 'It\'s a document that says the deal price is fair. Banks provide it to protect the board.',
        score: 6,
        feedback: 'Correct but thin. Emphasize the legal protection aspect for the board and why independent advisors matter here.',
      },
      {
        question: 'How do you determine if a deal is accretive or dilutive to EPS?',
        idealAnswer: 'Compare the earnings yield of the target (target EPS / acquisition price) to the acquirer\'s cost of capital. If earnings yield > financing cost, the deal is accretive. For a stock deal: if the acquirer\'s P/E > target P/E, the deal is accretive to the acquirer\'s EPS.',
        userAnswer: 'If the target\'s earnings per share contribution exceeds the cost of financing, it\'s accretive. Stock deals are accretive if the acquirer has a higher P/E than the target.',
        score: 6,
        feedback: 'Correct logic on the P/E comparison. Define earnings yield more precisely and show you can do the math.',
      },
      {
        question: 'What is a material adverse change (MAC) clause?',
        idealAnswer: 'A MAC clause gives the acquirer the right to walk away from a deal if the target experiences a material adverse change in its business, financial condition, or prospects between signing and closing. What constitutes a MAC is heavily negotiated — pandemics and market-wide downturns are typically excluded.',
        userAnswer: 'A MAC clause lets the buyer exit the deal if something really bad happens to the target before closing.',
        score: 5,
        feedback: 'Basic answer. You need to explain what\'s typically excluded (systemic events, market downturns) and why that negotiation matters so much. The Akorn v. Fresenius MAC case is worth knowing.',
      },
    ],
  },
  {
    daysAgo: 35,
    category: 'Valuation',
    difficulty: 'Medium',
    math: 'With Math',
    score: 7.25,
    scenario: 'You are a second-round candidate at a bulge bracket bank. The VP is testing your technical modeling skills with a mid-size industrial company valuation case.',
    questions: [
      {
        question: 'Walk me through how you would build a comparable company analysis.',
        idealAnswer: 'Step 1: Identify 8-12 public companies with similar business models, size, and end markets. Step 2: Spread LTM and NTM financials (revenue, EBITDA, net income). Step 3: Calculate multiples: EV/EBITDA, EV/Revenue, P/E. Step 4: Look at the range and median, applying a premium/discount based on the target\'s relative quality. Step 5: Triangulate with a DCF and precedent transactions.',
        userAnswer: 'Find 8-10 comparable public companies, spread their LTM and NTM financials, calculate EV/EBITDA and P/E multiples, then apply the median or a relevant percentile to the target\'s financials to get an implied valuation range. Use it alongside DCF and precedent transactions.',
        score: 7,
        feedback: 'Good structure. Adding how to select comps (not just similar size, but similar growth and margin profiles) and how to apply a premium or discount would complete this answer.',
      },
      {
        question: 'A company has EV/EBITDA of 8x and EBITDA of $50M. What is the implied enterprise value? If it has $30M net debt, what is equity value per share with 10M shares outstanding?',
        idealAnswer: 'EV = 8x × $50M = $400M. Equity Value = EV – Net Debt = $400M – $30M = $370M. Per share = $370M / 10M = $37.00.',
        userAnswer: 'EV is 8 times $50M = $400M. Subtract $30M net debt to get $370M equity value. With 10 million shares, that\'s $37 per share.',
        score: 8,
        feedback: 'Perfect math, well-structured answer.',
      },
      {
        question: 'Why might two companies in the same industry trade at different EV/EBITDA multiples?',
        idealAnswer: 'Multiple differences reflect differences in: growth rate (higher growth = higher multiple), margin quality and trajectory, capital intensity (less capex = more FCF = higher multiple), management quality, customer concentration risk, balance sheet strength, and market position/moat. The DCF foundation: a higher quality business with better growth deserves a higher multiple because its intrinsic value is higher.',
        userAnswer: 'Different multiples reflect different growth rates, margin quality, capital intensity, competitive positioning, and risk profiles. A company growing 20% deserves a higher multiple than one growing 5%, even at the same EBITDA. Capital-light businesses also command premiums because more EBITDA converts to free cash flow.',
        score: 7,
        feedback: 'Good answer covering the main drivers. The capital-light point is sophisticated. Add: the theoretical DCF foundation that ties it all together.',
      },
      {
        question: 'When would you use EV/Revenue instead of EV/EBITDA as your primary valuation multiple?',
        idealAnswer: 'EV/Revenue is primary when EBITDA is negative or not meaningful (early-stage companies, turnarounds), when margins are highly variable across comps making EBITDA multiples noisy, or when the business is valued primarily on scale (e.g., SaaS with high gross margins where revenue = addressable ARR).',
        userAnswer: 'EV/Revenue is the go-to multiple when EBITDA is negative or highly volatile across comps. For high-growth SaaS companies with strong gross margins, revenue is often the primary driver of value. Also useful in turnarounds where current EBITDA doesn\'t represent normalized earnings.',
        score: 7,
        feedback: 'Correct and well-reasoned. The SaaS point is exactly right. You could add: EV/Revenue is also used in early-stage healthcare and biotech where revenue multiples reflect pipeline value.',
      },
    ],
  },
  {
    daysAgo: 14,
    category: 'Private Equity',
    difficulty: 'Hard',
    math: 'With Math',
    score: 8.25,
    scenario: 'Final round at a top-10 PE fund. The partner is evaluating your readiness to join as an associate. The case involves a potential $800M buyout of a specialty chemicals distributor.',
    questions: [
      {
        question: 'Initial screen: is this a fundable LBO?',
        idealAnswer: '$800M TEV on a specialty chemicals distributor. At typical distributor margins of 8-12% EBITDA margin, if revenue is $2-3B, EBITDA is $80-150M — giving 5-10x EV/EBITDA. With 50% leverage (~$400M), equity check is ~$400M. FCF conversion in distribution is moderate (needs working capital). It\'s fundable if EBITDA > $80M and FCF conversion is decent. Key question: is it specialty (defensible margins) or commodity (price-competitive)?',
        userAnswer: 'At $800M TEV and typical distributor margins of 8-12%, EBITDA should be somewhere around $70-100M, so you\'re entering at 8-11x EBITDA. Put 55% debt on ($440M), leaving $360M equity check. For a mid-market fund, this is a meaningful but doable deal. Key screening question: is the "specialty" characterization real — does the company have pricing power and value-add services, or is it just a commodity distributor with thin margins? The FCF profile and working capital intensity are critical diligence items.',
        score: 9,
        feedback: 'Excellent initial screen. You correctly probed the "specialty" label — that\'s exactly what experienced PE investors do. The math is right and the qualitative framing is sharp.',
      },
      {
        question: 'What are the top risks you\'d focus on in diligence?',
        idealAnswer: 'Environmental liability (chemicals = significant tail risk), customer concentration, supplier concentration (if dependent on 1-2 chemical producers), pricing dynamics (can they pass through raw material costs?), regulatory risk (EPA, REACH, Prop 65), and cyclicality of end markets.',
        userAnswer: 'Environmental liability is number one — you can\'t buy a chemicals business without a Phase 1/Phase 2 environmental assessment and understanding of historical site contamination. Customer concentration and supplier concentration both matter. Can they pass through raw material cost increases, or do they absorb margin pressure? Regulatory risk around EPA and EU REACH is significant. And end-market cyclicality: who are the customers — construction, automotive, consumer? Those cycles differ widely.',
        score: 8,
        feedback: 'Excellent diligence instincts. Environmental liability first is exactly correct. The pass-through pricing question is often overlooked but determines whether this is a real specialty business or not.',
      },
      {
        question: 'Build a back-of-envelope return analysis assuming $90M EBITDA.',
        idealAnswer: 'Entry: $800M TEV, ~$450M debt (56%), $350M equity. Grow EBITDA 8%/year to ~$132M in 5 years. Debt paydown: $15M FCF/year = $75M total → $375M remaining. Exit at 9x: $132M × 9 = $1,188M TEV → $1,188M – $375M = $813M equity. Returns: $813/$350 = 2.3x MOIC / ~18% IRR. Modest — needs multiple expansion or faster EBITDA growth to hit 20%+ IRR.',
        userAnswer: 'Entry: $800M TEV, 55% debt = $440M, equity = $360M. Starting at $90M EBITDA, grow 8% per year to get to $132M at year 5. FCF of $15M/year pays down $75M debt, leaving $365M. Exit at 9x gives $1.19B TEV, equity value $825M. That\'s 2.3x MOIC on $360M equity, about 18% IRR. Below a 20% hurdle, so you\'d need either multiple expansion, a faster growth case, or add-on acquisitions to get there. Worth pursuing but needs a clear value creation thesis.',
        score: 8,
        feedback: 'Right math and right conclusion. Identifying that 18% is sub-hurdle and articulating what would need to change to fix it shows PE analytical maturity. Strong answer.',
      },
      {
        question: 'How do you think about management alignment in this deal?',
        idealAnswer: 'Management alignment is critical in PE: ideally the existing CEO/CFO roll equity (10-20% of deal equity). Structure incentives with time-vesting (retention) and performance-vesting (aligned with IRR/MOIC targets). Avoid situations where management can "make it" on base salary alone — you want them invested in the exit. If management is not rolling, it\'s a red flag about their conviction in the business.',
        userAnswer: 'Management alignment is one of the most important non-financial factors in a deal. The ideal structure: existing management rolls 15-20% of equity, with additional options on a mix of time and performance vesting. Performance vesting should be tied to EBITDA targets and IRR/MOIC hurdles matching LP expectations. If management won\'t roll equity, that tells you something — they\'re not confident in the business or they don\'t want to be held accountable to PE discipline. I\'d also structure the deal so management can\'t become wealthy just from salary — skin in the game is everything.',
        score: 8,
        feedback: 'Very strong answer. The point about management unwillingness to roll as a negative signal is exactly the kind of judgment that matters in practice. Well done throughout this interview.',
      },
    ],
  },
  {
    daysAgo: 4,
    category: 'Investment Banking',
    difficulty: 'Hard',
    math: 'With Math',
    score: 9.25,
    scenario: 'You are in a superday at Goldman Sachs TMT group. The MD presents a live situation: a $12B software company is considering acquiring a $3B SaaS company to accelerate its cloud transition.',
    questions: [
      {
        question: 'Frame the strategic rationale. Why would the acquirer want this deal?',
        idealAnswer: 'Strategic rationale: (1) accelerate cloud/SaaS transition (avoid building which takes 3-5 years), (2) acquire ARR and existing enterprise customer relationships, (3) eliminate a potential competitive threat, (4) cost synergies from eliminating overlap, (5) revenue synergies from cross-selling into respective customer bases. The "build vs. buy vs. partner" framework: buying is right if time-to-market advantage justifies acquisition premium and integration risks.',
        userAnswer: 'The acquirer wants to buy rather than build cloud capability because building takes 3-5 years and they\'re already behind. Acquiring $3B in SaaS ARR and an enterprise customer base accelerates the transition. There\'s also a defensive rationale — leaving this SaaS company independent risks it being acquired by a competitor. Revenue synergies from cross-selling are real but hard to achieve; cost synergies (R&D overlap, G&A) are more reliable and should be the floor. The build-buy-partner framework favors buying when time-to-market is critical and integration risk is manageable.',
        score: 9,
        feedback: 'Excellent strategic framing. The defensive M&A rationale is often overlooked and you led with it. The build/buy/partner framework application is exactly right. The distinction between revenue and cost synergy reliability is sophisticated.',
      },
      {
        question: 'The target trades at 8x NTM revenue. Is that a fair price?',
        idealAnswer: 'Context-dependent. At 8x NTM revenue for a SaaS company: first check Rule of 40 (growth rate + FCF margin should exceed 40%). At $3B EV, implied ARR might be $400-500M. If growing 30%+ with 75%+ gross margins, 8x could be reasonable or even cheap. If growing 15% with margin issues, 8x is expensive. Compare to recent SaaS M&A transactions. Strategic buyers can justify a premium over market if synergies are real.',
        userAnswer: '8x NTM revenue needs context. For a high-growth SaaS company: check the Rule of 40 first. If growing 35% with strong gross margins (75%+), 8x is in the reasonable range — recent SaaS M&A has cleared 10x for premium assets. If growth is decelerating to 15-20%, 8x is aggressive. Calculate the implied ARR multiple and NRR — if NRR is 120%+ (net retention rate), the growth is sticky and justifies a premium. Strategic buyers can always pay more than financial buyers because they can monetize revenue synergies that a PE firm can\'t.',
        score: 10,
        feedback: 'Outstanding. You contextualized the multiple correctly, used Rule of 40, NRR, and the strategic vs. financial buyer premium distinction. This is a complete, nuanced answer that would impress any MD.',
      },
      {
        question: 'Walk me through accretion/dilution analysis for this deal.',
        idealAnswer: 'For a cash deal: compare earnings yield of target (target net income / purchase price) vs. after-tax cost of debt. For stock: compare acquirer P/E to implied P/E paid for target. At $3B for a money-losing SaaS company, this deal will likely be dilutive to EPS near-term. Frame it as "dilutive but strategically necessary" — quantify the dilution and show when it turns accretive (EPS crossover analysis typically shows year 3-5 with synergies).',
        userAnswer: 'Standard accretion/dilution: if cash deal, compare target\'s earnings yield to after-tax cost of debt. If stock deal, compare P/Es. For a money-losing SaaS target, this deal is dilutive to EPS initially — that\'s expected and acceptable for a strategic acquisition. The right framing for the board: quantify dilution in years 1-2, then show the crossover year where synergies make it accretive, typically year 3-4. The pitch is "3 years of dilution to capture 10 years of accelerated cloud growth." Management also needs to communicate this clearly to investors or the stock will sell off on announcement.',
        score: 9,
        feedback: 'Excellent handling of a deal that\'s inherently dilutive. The "3 years of dilution for 10 years of growth" framing is exactly how bankers pitch these deals to skeptical boards. Strong finish.',
      },
      {
        question: 'What are the biggest integration risks and how do you mitigate them?',
        idealAnswer: 'Key risks: (1) talent flight — SaaS engineers and product managers leave post-close if culture clashes, (2) customer churn — customers worried about product direction or support quality during transition, (3) technology integration — different tech stacks are expensive and slow to merge, (4) sales force conflict — overlapping products create channel conflict. Mitigation: retention packages for key talent, clear product roadmap communication to customers, dedicated integration PMO, and quick decision-making on organizational structure.',
        userAnswer: 'The biggest risk is talent — SaaS companies are people businesses. Key engineers and product leaders will have offers elsewhere and will leave if the acquirer moves slowly or imposes bureaucracy. Mitigation: lock up key personnel with retention packages at signing, communicate the product roadmap clearly and quickly so they feel excited not threatened. Customer churn is the second risk: customers will call their reps asking what happens to their contracts and roadmap. Get ahead of this with a customer communication plan on day one. Technology integration is a multi-year project — don\'t rush it and don\'t let engineering distraction slow the core product. Finally, appoint a dedicated integration officer with CEO-level access so decisions don\'t get stuck in committees.',
        score: 9,
        feedback: 'Excellent practical integration knowledge. The talent retention at signing point is exactly right — waiting until close is too late. Customer communication plan on day one shows you\'ve thought about real deal execution. Superday-ready answer.',
      },
    ],
  },
];

// ─── Build timestamped entries ────────────────────────────────────────────────

function ts(daysAgo) {
  const jitter = Math.floor(Math.random() * 3600000 * 4); // up to 4hr jitter
  return Date.now() - daysAgo * 86400000 - jitter;
}

function buildEntries() {
  const entries = [];

  for (const e of ENTRIES) {
    entries.push({
      question: e.question,
      answer: e.answer,
      userAnswer: e.userAnswer,
      feedback: e.feedback,
      score: e.score,
      category: e.category,
      difficulty: e.difficulty,
      math: e.math,
      customPrompt: null,
      timeTaken: e.timeTaken,
      timeRemaining: e.timeRemaining,
      timestamp: ts(e.daysAgo),
    });
  }

  for (const iv of INTERVIEWS) {
    entries.push({
      type: 'interview',
      scenario: iv.scenario,
      questions: iv.questions,
      score: iv.score,
      category: iv.category,
      difficulty: iv.difficulty,
      math: iv.math,
      customPrompt: null,
      timestamp: ts(iv.daysAgo),
    });
  }

  // Sort oldest-first so LPUSH ends up newest-first in Redis
  entries.sort((a, b) => a.timestamp - b.timestamp);
  return entries;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('\n❌  Usage: node scripts/seed-demo-history.mjs <CLERK_USER_ID>\n');
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('❌  Missing Redis credentials in .env.local / .env');
    process.exit(1);
  }

  const historyKey = `history:${userId}`;
  console.log(`\n🌱  Seeding demo history for: ${userId}`);
  console.log(`   ${ENTRIES.length} question entries + ${INTERVIEWS.length} interview sessions\n`);

  await redis(url, token, 'DEL', historyKey);

  const entries = buildEntries();
  for (const entry of entries) {
    await redis(url, token, 'LPUSH', historyKey, JSON.stringify(entry));
  }

  await redis(url, token, 'LTRIM', historyKey, '0', '99');
  await redis(url, token, 'SET', `paid:${userId}`, 'true');

  const count = await redis(url, token, 'LLEN', historyKey);

  console.log(`✅  Done!`);
  console.log(`   ${count.result} entries in Redis`);
  console.log(`   Premium flag set\n`);
  console.log(`   Score arc: 4–6 (days 70+) → 6–7.5 (days 25–49) → 8–10 (last 3 weeks)\n`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
