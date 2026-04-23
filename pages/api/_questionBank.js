/**
 * _questionBank.js
 *
 * A curated bank of finance interview questions organized by category and difficulty.
 * Used to inject few-shot examples into the question generation prompt so that
 * gpt-4o-mini sees real calibration samples on every request instead of relying
 * on a single hardcoded example.
 *
 * Each entry: { q: string, math: boolean }
 *   q    — the question text
 *   math — true if the question requires calculations or quantitative reasoning
 *
 * To add a new category, add a new top-level key matching a value in CATEGORIES.
 * Each category should have Easy, Medium, and Hard arrays.
 * Aim for at least 5 questions per difficulty tier.
 */

const QUESTION_BANK = {

  // ─── Private Equity ────────────────────────────────────────────────────────

  "Private Equity": {
    Easy: [
      { q: "What makes a good LBO candidate? Walk me through the key characteristics you look for.", math: false },
      { q: "What are the three main drivers of returns in an LBO, and which is the most reliable?", math: false },
      { q: "Why private equity over investment banking or hedge funds?", math: false },
      { q: "What sectors are you most interested in from a PE perspective, and why?", math: false },
      { q: "Tell me about a recent PE deal you found interesting — what was the thesis and what could go wrong?", math: false },
      { q: "What's the difference between MOIC and IRR, and when does each matter more?", math: false },
      { q: "Why does debt paydown increase equity value in an LBO?", math: false },
    ],
    Medium: [
      { q: "Walk me through a basic LBO model from entry to exit.", math: true },
      { q: "A sponsor buys a company for $500M at 10x EBITDA, funds 60% with debt. If EBITDA grows 15% per year and they exit at the same multiple after 5 years, what's the rough MOIC?", math: true },
      { q: "Walk me through how you'd build a sources and uses table for a $500M buyout.", math: true },
      { q: "How do you calculate IRR and MOIC? Give me an example where a 3x MOIC in 5 years translates to an approximate IRR.", math: true },
      { q: "Pitch me a company you'd want to take private and walk me through your investment thesis.", math: false },
      { q: "How would you create value in a portfolio company over a 5-year hold period? Give me concrete levers, not just categories.", math: false },
      { q: "Walk me through a deal you worked on — what was the investment thesis, what was your role, and what would you have done differently?", math: false },
      { q: "What does a sources and uses table tell you about deal risk that an LBO model alone doesn't?", math: false },
    ],
    Hard: [
      { q: "You're evaluating an LBO where the target has $100M EBITDA, you're paying 10x, and you're financing with 6x total leverage. If EBITDA grows at 10% annually but interest rates rise 150bps mid-hold, walk me through how that changes your return profile.", math: true },
      { q: "A portfolio company is approaching a net leverage covenant of 5.5x and EBITDA is declining. Walk me through the options the sponsor has and how you'd model each.", math: true },
      { q: "If you could only change one assumption in an LBO to maximize IRR, what would you choose? Walk me through the math of how each lever — entry multiple, exit multiple, leverage, and EBITDA growth — affects returns differently.", math: true },
      { q: "How would you structure an LBO for a company with lumpy, project-based revenue instead of recurring contracts? What adjustments do you make to the model and the debt package?", math: true },
      { q: "Compare maintenance covenants vs. incurrence covenants — how do they affect the borrower differently, and why has the market shifted toward cov-lite structures?", math: false },
      { q: "How do you think about entry multiples across different industries — why would you pay 15x for a SaaS business but only 7x for a manufacturer with similar EBITDA?", math: false },
      { q: "Dry powder is at record highs and rate cuts are expected. Walk me through how you'd adjust your deal sourcing strategy and return expectations over the next 18 months.", math: false },
      { q: "You're in a competitive auction for a business at 12x EBITDA. Your model needs 20%+ IRR to clear the investment committee. What creative structuring options do you explore to make the deal work?", math: true },
    ],
  },

  // ─── Asset Management ─────────────────────────────────────────────────────

  "Asset Management": {
    Easy: [
      { q: "What are credit spreads and why do they matter to investors beyond just watching the prime rate?", math: false },
      { q: "What is your investment philosophy — do you lean toward value or growth investing, and why?", math: false },
      { q: "Would you rather invest in a company with strong financials and poor management, or poor financials and strong management? Defend your answer.", math: false },
      { q: "Name a company you think will still be around in 100 years. Walk me through your reasoning — what factors give a business that kind of longevity?", math: false },
      { q: "What do you like to read or follow outside of finance, and how does it inform how you think about investing?", math: false },
      { q: "What makes a business 'high quality' in your view? What characteristics do you screen for before doing deeper research?", math: false },
      { q: "Why are you interested in asset management specifically — as opposed to banking or trading?", math: false },
    ],
    Medium: [
      { q: "If interest rates rise 100bps, walk me through the effect on the yield curve, bond prices, and what that signals about the economy.", math: false },
      { q: "If the S&P 500 is up 1.5% today, is that a big move or a small one? How do you contextualize it, and what tools or indicators would you use?", math: false },
      { q: "Walk me through how you would value a company. Which methodology would you lead with, and under what circumstances would you weight each differently?", math: false },
      { q: "How do you approach risk management in a portfolio? Walk me through how you'd identify, assess, and mitigate risk using both top-down and bottom-up lenses.", math: false },
      { q: "Where do you think the market is headed over the next 12–18 months? What macro theme are you watching most closely, and what's your variant view?", math: false },
      { q: "You're made CEO of a company you admire for 100 days. Name the company, and walk me through the three most impactful changes you'd make and why.", math: false },
      { q: "Would you rather own a hotel or Expedia? Pick a valuation metric and walk me through how each business performs on it — then apply the Buffett competition test.", math: false },
      { q: "Name three businesses you interacted with today. Which is the best business, and why? Walk me through your criteria systematically.", math: false },
      { q: "Name a company with low ROA but high ROE. Explain how that's possible and what it implies about the business.", math: true },
      { q: "When could a company trading at a high P/E ratio still be considered a value stock? Give me a real example if you can.", math: false },
      { q: "Pitch me a stock you'd buy today. Walk me through the investment thesis, why the market is mispricing it, and the two biggest risks.", math: false },
    ],
    Hard: [
      { q: "Walk me through calculating unlevered free cash flow from net income. Then tell me: if management wanted to temporarily boost reported free cash flow, how could they manipulate each line item to do it?", math: true },
      { q: "You want to liquidate an entire US corporate bond fund and redeploy into a UK corporate bond fund. What currency, credit, liquidity, and execution risks do you need to manage, and how would you sequence the transition?", math: false },
      { q: "Goldman Sachs question: Tell me how you would lower the Sharpe ratio of a portfolio. Walk me through the mechanics.", math: true },
      { q: "A company issues $500M in corporate bonds. Walk me through the exact impact on each of the three financial statements, including any interest effects in year one.", math: true },
      { q: "Why might emerging markets be more attractive than domestic markets right now? Argue the bull case, then steelman the bear case — where does the thesis break down?", math: false },
      { q: "Walk me through the full transmission mechanism of a 150bps rate hike — from the Fed funds rate through credit markets, equity valuations, and ultimately consumer behavior.", math: false },
      { q: "What does factor theory imply about optimal asset allocation? How has the rise of factor investing affected the premiums associated with value, size, and momentum?", math: false },
      { q: "Estimate Uber's annual global revenue from first principles. Walk me through every variable you'd need and your assumptions for each.", math: true },
      { q: "A risk-averse client gives you $1 million with a 10-year horizon. Walk me through your asset allocation framework — how do you think about equities vs. bonds vs. alternatives, and how do you stress-test it?", math: true },
      { q: "You're evaluating a company trading at 25x earnings in a sector that typically trades at 15x. Walk me through the five questions you'd ask before deciding whether it's overvalued or worth the premium.", math: false },
    ],
  },

  // ─── Investment Banking ────────────────────────────────────────────
  "Investment Banking": {
    Easy: [
      { q: "What are the different groups at an investment bank and what does each do?", math: false },
      { q: "What is investment banking and how do banks make money?", math: false },
      { q: "Walk me through the process of an IPO from start to finish.", math: false },
      { q: "Walk me through a sell-side M&A deal from start to finish.", math: false },
      { q: "Walk me through a buy-side M&A deal from the buyer's perspective.", math: false },
      { q: "Walk me through a debt issuance — what happens from the company's first call to closing?", math: false },
      { q: "Describe an LBO and walk me through how the process works.", math: false },
      { q: "What's in a pitch book? Walk me through the key sections.", math: false },
      { q: "How do companies select investment banks? What criteria do they use?", math: false },
      { q: "Should a company go public or sell to a strategic acquirer? How would you advise them?", math: false },
      { q: "What are the three financial statements and why do we need all three?", math: false },
      { q: "How do the three financial statements link together?", math: false },
      { q: "What is the most important financial statement and why?", math: false },
      { q: "What does Enterprise Value represent? How is it different from Equity Value?", math: false },
      { q: "Give me a real-life analogy explaining the difference between Enterprise Value and Equity Value.", math: false },
      { q: "What does WACC stand for and what does it mean intuitively?", math: false },
      { q: "Explain the time value of money. Is it just about inflation?", math: false },
      { q: "What does Discount Rate mean, and why is it higher when potential returns are higher?", math: false },
      { q: "What are the three main valuation methodologies, and what are the advantages and disadvantages of each?", math: false },
      { q: "Which valuation methodology typically produces the highest implied values, and why?", math: false },
      { q: "Why do you value a public company if it already has a market cap?", math: false },
      { q: "What is Free Cash Flow and how do you calculate it?", math: false },
      { q: "What is Working Capital? What does it mean if a company has positive or negative Working Capital?", math: false },
    ],
    Medium: [
      { q: "Walk me through a DCF analysis from start to finish.", math: false },
      { q: "How do you move from Revenue to Free Cash Flow in a DCF?", math: false },
      { q: "How do you calculate Terminal Value in a DCF? Which method is best and why?", math: false },
      { q: "What's the difference between a Levered DCF and an Unlevered DCF?", math: false },
      { q: "A client plans to change their capital structure from 10% to 30% Debt. Does the Unlevered DCF change?", math: false },
      { q: "Should you add back Stock-Based Compensation when calculating Free Cash Flow? Walk me through the debate.", math: false },
      { q: "How do you pick a Terminal Growth Rate using the Gordon Growth Method?", math: false },
      { q: "How would you check whether a Terminal Value estimate is reasonable?", math: false },
      { q: "The central bank raises interest rates from 2% to 5%. How does that affect WACC and your DCF output?", math: false },
      { q: "What does Cost of Equity mean intuitively? How do you calculate it using CAPM?", math: true },
      { q: "What does Beta mean intuitively? Walk me through un-levering and re-levering Beta.", math: true },
      { q: "How do you move from Equity Value to Enterprise Value? Walk me through the bridge.", math: false },
      { q: "Why do you subtract Equity Investments but add Noncontrolling Interests when calculating Enterprise Value?", math: false },
      { q: "Should Operating Leases be added to Enterprise Value? Walk me through the argument.", math: false },
      { q: "Walk me through Public Comps and Precedent Transactions — how do you run each analysis?", math: false },
      { q: "How do you screen for comparable companies in a comps analysis?", math: false },
      { q: "How do you decide which metrics and multiples to use in a valuation?", math: false },
      { q: "How do you decide between using Equity Value vs. Enterprise Value multiples?", math: false },
      { q: "What IS a valuation multiple? Explain the theory and give a real-life analogy.", math: false },
      { q: "A company trades at 15x EV/EBITDA while peers trade at 10x. What are the most likely explanations?", math: false },
      { q: "What are Deferred Taxes and how do they flow through the financial statements?", math: false },
      { q: "What is the difference between Deferred Tax Assets and Deferred Tax Liabilities? How do NOLs factor in?", math: false },
      { q: "How do you fund operations via Debt vs. Equity, and how does each affect the three statements?", math: false },
      { q: "A firm acquires a company for $1,000 and creates $400 in Goodwill. Why does Goodwill exist?", math: false },
      { q: "Why might a company issue Debt rather than Equity to fund operations?", math: false },
      { q: "How do you decide between Term Loans and Subordinated Notes when advising on a debt raise?", math: false },
      { q: "Explain the difference between Coupon Rate, Current Yield, and Yield to Maturity.", math: false },
      { q: "How do you value a bond? Walk me through the mechanics.", math: false },
      { q: "What is the difference between stressed, distressed, and bankrupt companies?", math: false },
      { q: "What options does a distressed company have — refinance, sell assets, restructure, or file for bankruptcy?", math: false },
      { q: "What is the difference between Chapter 7 and Chapter 11 bankruptcy?", math: false },
      { q: "What is DIP financing and why do companies seek it?", math: false },
      { q: "A $500M EBITDA healthcare company vs. a $500M EBITDA industrials company — which is worth more and why?", math: false },
      { q: "What is a Liquidation Valuation and when would you use it?", math: false },
      { q: "How does a DDM differ from a DCF?", math: false },
    ],
    Hard: [
      { q: "A company hires a new employee at $100K/year. Walk me through the impact on all three financial statements, assuming a 25% tax rate.", math: true },
      { q: "Depreciation decreases by $10. Walk me through the full impact on all three financial statements.", math: true },
      { q: "A factory with a book value of $100 is sold for $140. Walk me through the full impact on all three financial statements, assuming a 25% tax rate.", math: true },
      { q: "A customer orders a $100 product on credit. First, walk me through when the product ships (revenue recognized). Then walk me through when cash is collected.", math: true },
      { q: "A marketing agency charges $10K for a campaign, invoiced with 60-day payment terms. Walk me through the impact when you receive the invoice and then when you pay it.", math: true },
      { q: "An e-commerce company buys $200 of inventory on credit and later sells it for $500 cash. Walk me through each step on all three statements.", math: true },
      { q: "A SaaS company bills a client $250 upfront annually for software, and it costs $50 to deliver the service over the year. Walk me through the impact from billing to full revenue recognition.", math: true },
      { q: "A company issues $200 of Debt at 10% annual interest. Walk me through the full impact on all three financial statements through the first year, including interest payments.", math: true },
      { q: "A company signs a 10-year operating lease at $160/year rent with a 5% discount rate. Walk me through the impact on all three statements in Year 1 under US GAAP.", math: true },
      { q: "A company buys a factory for $200 using $200 of new Debt. Walk me through the initial impact, then walk me through the statements after one year assuming 10% interest, 10% straight-line depreciation, and 5% principal repayment. Then walk me through the statements when the factory is sold for $220 and remaining debt is repaid.", math: true },
      { q: "Company has $100M EBITDA, $15M D&A, $10M CapEx, $5M change in working capital, and a $500M Equity Value with $200M Net Debt. Calculate TEV, Unlevered FCF, and TEV/EBITDA.", math: true },
      { q: "Company A trades at 15x P/E with $120M Net Income. Company B trades at 15x P/E with $100M Net Income but $200M EBITDA vs. Company A's $150M. Which company has higher Net Debt?", math: true },
      { q: "A company has $100 Operating Income, $500 Debt at 4% interest, and trades at a P/E of 12x. What can you conclude about the Enterprise Value?", math: true },
      { q: "A company has 200 shares outstanding at $10 per share, plus 50 options with an exercise price of $8. What is the Diluted Equity Value using the treasury stock method?", math: true },
      { q: "Walk me through a complex diluted share count calculation involving options, RSUs, and convertible bonds.", math: true },
      { q: "A company trading at 10x EV/EBITDA sells a non-core asset for 2x EV/EBITDA. How do Enterprise Value and the overall EV/EBITDA multiple change?", math: true },
      { q: "You purchase a $100 face value bond at a 5% discount with an 8% coupon and 5-year maturity. What is the approximate Yield to Maturity?", math: true },
      { q: "A PE firm acquires a company with $100M EBITDA at 10x, financing with 60% debt. EBITDA grows to $150M over 5 years and $250M of debt is repaid. The firm exits at 9x EV/EBITDA. What is the approximate IRR?", math: true },
      { q: "A PE firm buys a company at 12x EBITDA with 5x Debt/EBITDA leverage. EBITDA doubles in 5 years and no debt is repaid. What exit multiple is needed to achieve a 25% IRR?", math: true },
      { q: "Same deal as above, but 75% of the debt is repaid over the 5 years. What exit multiple is now needed for a 25% IRR?", math: true },
      { q: "A PE firm acquires a company at 10x EBITDA with 6x Debt/EBITDA. EBITDA grows from $100M to $150M in 5 years and $300M of debt is repaid. What exit multiple is needed for a 25% IRR?", math: true },
      { q: "A distressed company with $100M EBITDA is sold at 3x. It has a $100M Revolver, $300M Term Loan, and $200M Subordinated Notes. What are the recovery percentages for each tranche?", math: true },
      { q: "Revenue growth drops from 10% to 5% vs. Discount Rate drops from 10% to 5% — which change has a bigger impact on DCF output and why?", math: false },
      { q: "A corporate tax cut from 35% to 20% — walk me through the full effect on WACC and DCF output.", math: false },
      { q: "You extend a DCF forecast period from 10 years to 20 years. How and why does the output change?", math: false },
      { q: "Compare a DCF for an emerging market company vs. a developed market company. How do your inputs and outputs differ?", math: false },
    ],
  },


  // ─── Valuation ────────────────────────────────────────────────────────────────────────────

  "Valuation": {
    Easy: [
      { q: "What are the two primary valuation methodologies? When would you use each?", math: false },
      { q: "What is the difference between enterprise value and equity value? Walk me through the formula for each.", math: false },
      { q: "Which is higher — the cost of debt or the cost of equity — and why?", math: false },
      { q: "What is WACC and why do we use it as the discount rate in an unlevered DCF?", math: false },
      { q: "What's the difference between trading comps and precedent transactions? Why do precedent transaction multiples tend to be higher?", math: false },
      { q: "What multiple would you use for a mature manufacturing company? What about an early-stage SaaS company losing money? Why?", math: false },
      { q: "Why does enterprise value use pre-debt metrics like EBITDA in the denominator, while equity value uses post-debt metrics like net income?", math: false },
    ],
    Medium: [
      { q: "Walk me through the six steps to build a trading comparables analysis, from selecting the peer group to deriving implied value.", math: true },
      { q: "How do you calculate unlevered free cash flow from EBIT? Write out the full formula and explain each adjustment.", math: true },
      { q: "Walk me through the two terminal value methods in a DCF. What are the pros and cons of each, and which do practitioners prefer?", math: true },
      { q: "Two identical companies — same earnings, growth, leverage, and risk. Company A trades at 15x P/E, Company B at 10x P/E. Which would you buy and why?", math: false },
      { q: "What multiple would you use to value a REIT? A bank? A pre-revenue biotech? Walk me through the reasoning for each.", math: false },
      { q: "Walk me through how you get from a DCF-derived enterprise value to price per share. What adjustments are required?", math: true },
      { q: "How do you calculate beta for a private company that doesn't trade publicly? Walk me through the unlevering and relevering process.", math: true },
      { q: "A company has negative EBITDA but is growing revenue 40% year-over-year. How do you value it, and what multiples are most relevant?", math: false },
    ],
    Hard: [
      { q: "A company has $100M EBITDA. Your trading comps yield 8-10x, precedent transactions yield 10-12x, and your DCF yields $750M EV. Walk me through why these methods diverge and how you'd reconcile them for a fairness opinion.", math: true },
      { q: "Walk me through a complete DCF: FCFF formula, WACC build, terminal value using both methods, and bridge to equity value per share. Use $50M Year 5 FCF, 10% WACC, 2.5% terminal growth, $120M net debt, 40M diluted shares.", math: true },
      { q: "Your DCF yields an implied EV/EBITDA of 18x, but your trading comps trade at 12x. What are the most likely explanations and how do you pressure-test your assumptions?", math: true },
      { q: "How does a 50 basis point increase in WACC affect a DCF valuation? Walk me through the sensitivity — why does terminal value get hit harder than the forecast period?", math: true },
      { q: "Walk me through why a strategic acquirer can justify paying more for a target than a financial sponsor. What are the structural reasons the IRR math works differently?", math: true },
      { q: "What is the Rule of 40 for SaaS companies, and how does it factor into EV/Revenue multiples? At what Rule of 40 score would you expect a premium multiple, and why?", math: true },
      { q: "A company's peer group has leverage ratios ranging from 0x to 4x net debt/EBITDA. How do you account for this dispersion when selecting and applying multiples, and why can't you just use the median?", math: false },
      { q: "You're valuing a conglomerate with four business units across different industries. Walk me through a sum-of-the-parts (SOTP) analysis — when is it appropriate, how do you build it, and what's the conglomerate discount?", math: true },
    ],
  },

  // ─── Consulting ───────────────────────────────────────────────────────────────────

  "Consulting": {
    Easy: [
      { q: "Our client is a retailer and profits have fallen 20% this year. How would you structure your analysis to diagnose the problem?", math: false },
      { q: "What frameworks would you consider when evaluating whether a company should enter a new market? Walk me through your approach.", math: false },
      { q: "A client wants to grow revenue by 15% next year. What levers would you explore, and how would you prioritize them?", math: false },
      { q: "How would you estimate the market size for a new product? Walk me through how you'd structure a market sizing problem from scratch.", math: true },
      { q: "What's the difference between a profitability case and a market entry case? How does your opening structure differ for each?", math: false },
      { q: "Why consulting, and why this firm specifically? What do you know about how this firm works differently from its competitors?", math: false },
      { q: "A client's costs are rising faster than revenue. What questions would you ask first, and how would you separate fixed from variable cost issues?", math: false },
    ],
    Medium: [
      { q: "A coffee chain has seen profits decline for three consecutive quarters despite flat revenue. Walk me through your diagnosis — what are the most likely causes and how would you test each?", math: true },
      { q: "Estimate the number of gas stations in the United States. Walk me through your assumptions and show your math.", math: true },
      { q: "A fashion retailer is considering expanding into Southeast Asia. What are the three most important factors you'd analyze before making a recommendation?", math: false },
      { q: "A mid-size pharma company is losing market share to a new generic entrant. How would you structure a competitive response strategy?", math: false },
      { q: "A consumer goods company wants to launch a new product line. How do you assess whether it's worth pursuing — what's the framework and what data do you need?", math: true },
      { q: "A B2B software company has high customer acquisition costs and declining retention. What's your diagnostic framework and what are the first two hypotheses you'd test?", math: false },
      { q: "Estimate the annual revenue of a mid-sized urban hotel with 300 rooms. What variables matter most and what assumptions would you make?", math: true },
      { q: "A trucking company's operating margins have dropped from 15% to 8% over two years while revenue grew 10%. What's going on and how would you investigate it?", math: true },
    ],
    Hard: [
      { q: "A global beauty company is losing share in premium skincare to direct-to-consumer brands who spend 60% less on customer acquisition. Walk me through a full diagnosis and a 12-month strategic response.", math: false },
      { q: "A private equity firm is acquiring a regional grocery chain at 8x EBITDA. Walk me through the due diligence framework — what are the three most important questions to answer before recommending the deal?", math: false },
      { q: "A national education nonprofit has a $50M annual budget and wants to improve literacy outcomes across 10 competing program types. How would you build a framework to prioritize resource allocation?", math: true },
      { q: "A truck manufacturer wants to launch an electric vehicle line in 4 years. Upfront investment is $800M; the EV market is growing 35% annually but margins are thin. How do you advise the CEO?", math: true },
      { q: "A European pharma company with $2B in revenue wants to expand into emerging markets. Estimate the addressable market and walk me through how you'd prioritize which three markets to enter first.", math: true },
      { q: "A retail bank's digital customer acquisition costs are 3x those of a neobank competitor. The CEO wants a plan to close the gap in 18 months without cannibalizing the existing branch network. What do you recommend?", math: false },
      { q: "A conservation organization has a $200M endowment and must choose between five regions for land preservation. Each has different ecological impact, cost, and political risk profiles. How do you structure the decision?", math: true },
      { q: "A conglomerate generates $500M in revenue across three business units: one growing 30% but unprofitable, one declining but highly profitable at 35% margins, and one flat at 15% margins. How do you advise on capital allocation?", math: true },
    ],
  },

  // ─── Sales and Trading ─────────────────────────────────────────────────────────────────

  "Sales and Trading": {
    Easy: [
      { q: "What is the difference between a primary market and a secondary market? Give an example of a transaction in each.", math: false },
      { q: "What are the key differences between a stock and a bond? Which has the more senior claim in a bankruptcy?", math: false },
      { q: "What is a call option? What is a put option? When would you use each?", math: false },
      { q: "What is duration, and what does it tell you about a bond's risk?", math: false },
      { q: "What are the two categories of bonds by credit quality? What is the yield difference between them and why?", math: false },
      { q: "What are the three main objectives of the Federal Reserve, and what tools does it use to achieve them?", math: false },
      { q: "Tell me about a stock you'd buy right now. Give me the thesis in under a minute — what's the opportunity and what could go wrong?", math: false },
      { q: "What did the major market indices do this past week? Give me three things that moved markets and why.", math: false },
    ],
    Medium: [
      { q: "If interest rates rise 100 basis points, what happens to bond prices, equity valuations, and the currency? Walk me through the transmission mechanism.", math: false },
      { q: "Pitch me a stock you'd buy or short right now. Walk through the thesis, your time horizon, and two key risks.", math: false },
      { q: "What is quantitative easing and how does it work? What are the risks of unwinding it?", math: false },
      { q: "What is a repo agreement? Walk me through how it works and why banks use it for short-term funding.", math: false },
      { q: "A fund returned 50% last year. Should you invest? What questions do you ask before deciding?", math: false },
      { q: "If you had $1 million to invest today, how would you allocate it? Walk me through your asset allocation and the current market conditions driving your thinking.", math: false },
      { q: "Why is the duration of a zero-coupon bond equal to its maturity, while a coupon bond's duration is always less than its maturity?", math: true },
      { q: "Two bonds have the same maturity and coupon. Bond A trades below the yield curve; Bond B trades above it. Which do you buy and why?", math: false },
      { q: "A company's stock drops 10% after reporting earnings that were down 30% year-over-year. What are the possible explanations?", math: false },
      { q: "What is put-call parity? Write the formula and walk me through the logic of why it must hold.", math: true },
    ],
    Hard: [
      { q: "The yield curve inverts. Walk me through what that signals, the trades you'd put on to profit from a subsequent steepening, and the risks of that position.", math: false },
      { q: "Explain negative convexity in a callable bond and in a mortgage-backed security. How does each affect the investor's risk profile as rates fall?", math: true },
      { q: "A company has $500M in excess cash. Walk me through the decision between a buyback, a special dividend, and debt paydown — what factors drive the choice and what are the tax and signaling implications?", math: true },
      { q: "Walk me through how an interest rate swap works. If you're receiving fixed and paying floating, are you expressing a bullish or bearish view on rates, and why?", math: true },
      { q: "You expect significant volatility in a stock but aren't sure of the direction. What option strategy do you use, and at what point does the trade become profitable? Walk through the payoff diagram.", math: true },
      { q: "What causes swap spreads to widen? Walk me through the relationship between credit risk, interest rate expectations, and the spread between SOFR swaps and Treasuries.", math: false },
      { q: "If interest rates are expected to rise, should you own a 10-year coupon bond or a 10-year zero-coupon bond? Walk me through the duration math and which loses more.", math: true },
      { q: "Walk me through how a mortgage-backed security is structured and why it exhibits negative convexity. What happens to the MBS investor when rates fall sharply?", math: false },
      { q: "The dollar strengthens 10% against major currencies. Walk me through the second-order effects on S&P 500 earnings, commodity prices, emerging market debt, and Fed policy.", math: false },
      { q: "You're running a fixed income book and duration is 6 years. Rates rise 50bps across the curve. Estimate your P&L impact and explain what you'd do to hedge the position.", math: true },
    ],
  },

  // ─── Accounting ───────────────────────────────────────────────────────────

  "Accounting": {
    Easy: [
      { q: "What are the three main financial statements and what does each one tell you?", math: false },
      { q: "What is working capital and how is it calculated? What does a negative working capital figure tell you about a business?", math: true },
      { q: "What is depreciation, and what are the two most common methods? When would you use each?", math: false },
      { q: "What is the difference between depreciation and amortization? Give an example of an asset you'd apply each to.", math: false },
      { q: "What are current assets and current liabilities? Give three examples of each.", math: false },
      { q: "What is the accounting equation, and why must it always balance?", math: false },
      { q: "What is the difference between tangible and intangible assets? How are they treated differently on the balance sheet?", math: false },
      { q: "What are accruals, and why does accrual-basis accounting give a more accurate picture than cash-basis accounting?", math: false },
      { q: "What is the difference between a reserve and a provision? Give a real-world example of each.", math: false },
      { q: "What is COGS, and what's the difference between COGS and operating expenses?", math: false },
    ],
    Medium: [
      { q: "Walk me through how a $10M depreciation charge flows through all three financial statements.", math: true },
      { q: "A company has $5M in current assets and $8M in current liabilities. What does this tell you, and what questions would you ask management?", math: true },
      { q: "What is a bank reconciliation statement, why is it prepared, and what are the most common reconciling items you'd expect to find?", math: false },
      { q: "Explain the difference between a cash discount and a trade discount. How does each affect the financial statements?", math: false },
      { q: "What are contingent liabilities, and how are they treated on the balance sheet? Walk me through an example of one that would be disclosed vs. one that would be accrued.", math: false },
      { q: "What is deferred revenue, and why is it a liability? Walk me through a real example and how it unwinds over time.", math: false },
      { q: "What is a provision for doubtful debts, and what's the journal entry to create and release it? How does it affect net income?", math: true },
      { q: "Walk me through the difference between prepaid expenses and accrued expenses — where does each sit on the balance sheet and why?", math: false },
      { q: "How is COGS calculated? If a company uses FIFO vs. LIFO during a period of rising prices, how does that affect COGS, gross profit, and ending inventory?", math: true },
      { q: "What is the difference between direct and indirect expenses? How does the distinction affect how costs flow through the income statement?", math: false },
    ],
    Hard: [
      { q: "A company switches from straight-line depreciation to the diminishing value method. Walk me through the impact on all three financial statements in year 1 compared to year 5.", math: true },
      { q: "What is the Sarbanes-Oxley Act, and how does it affect internal controls and financial reporting at a public company? What are the key sections a finance professional needs to know?", math: false },
      { q: "A company is growing revenue 20% year-over-year but running out of cash. Walk me through the possible accounting explanations — what working capital dynamics could cause this?", math: true },
      { q: "What is a suspense account? Walk me through two scenarios where one would be created, and what the risk is if items remain in it across accounting periods.", math: false },
      { q: "Compare cost centers, service centers, and profit centers. In a large corporation, how would management use each to evaluate performance, and what are the limitations of each?", math: false },
      { q: "A company capitalizes a cost that should have been expensed. Walk me through the impact on net income, assets, and cash flow in the current year and in subsequent years.", math: true },
      { q: "How does a sale-leaseback transaction work, and what are the accounting implications under ASC 842? Why might a company choose to do one?", math: false },
      { q: "Walk me through how goodwill is created in an acquisition, how it sits on the balance sheet, and what triggers an impairment charge. What's the P&L impact?", math: true },
    ],
  },
};

/**
 * Returns n randomly sampled example questions from the bank for a given
 * category, difficulty, and math preference.
 *
 * Matching logic (in priority order):
 *   1. Category + difficulty + math match
 *   2. Category + difficulty (any math)
 *   3. Any category at this difficulty + math match
 *   4. Any category at this difficulty
 *   5. Empty array (graceful fallback — prompt just won't include examples)
 *
 * @param {string} category   - e.g. "Private Equity" or "All"
 * @param {string} difficulty - "Easy" | "Medium" | "Hard"
 * @param {string} math       - "With Math" | "Without Math"
 * @param {number} n          - number of examples to return (default 3)
 * @returns {string[]}        - array of question strings
 */
function sampleQuestions(category, difficulty, math, n = 3) {
  const mathBool = math === "With Math";
  const resolvedCategory = category === "All" ? null : category;

  // Build a pool from the relevant slice of the bank
  let pool = [];

  if (resolvedCategory && QUESTION_BANK[resolvedCategory]?.[difficulty]) {
    pool = QUESTION_BANK[resolvedCategory][difficulty];
  }

  // If category not in bank yet, or "All" — draw from everything at this difficulty
  if (pool.length === 0) {
    Object.values(QUESTION_BANK).forEach(cat => {
      if (cat[difficulty]) pool = pool.concat(cat[difficulty]);
    });
  }

  if (pool.length === 0) return [];

  // Prefer math-matched questions; fall back to full pool if not enough
  const filtered = pool.filter(q => q.math === mathBool);
  const source = filtered.length >= n ? filtered : pool;

  // Shuffle and return question strings
  return [...source]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map(entry => entry.q);
}

module.exports = { QUESTION_BANK, sampleQuestions };
