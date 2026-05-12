# Prompt: Compile 400 IB Question Bank from PDFs

You are compiling a clean, structured question bank for a finance interview prep app. The user has uploaded multiple PDFs containing Investment Banking interview questions. Your job is to extract, deduplicate, filter, categorize, and output a single JavaScript file ready to be dropped into a Next.js codebase.

---

## Your Task

1. Read every uploaded PDF in full
2. Extract every interview question
3. Remove all behavioral/fit questions (see exclusion rules below)
4. Deduplicate — keep only one version of near-identical questions
5. Categorize each question into one of the defined categories
6. Assign a difficulty level where it can be reasonably inferred
7. Output the result as a single JavaScript export file: `src/ibQuestions.js`

Aim for **approximately 400 questions** after filtering and deduplication. If the source material has fewer, include all. If it has significantly more, prefer the most commonly-seen and technically substantive questions.

---

## Exclusion Rules — Remove These

Strip out any question that is primarily about the candidate's personal background, motivation, or interpersonal fit. This includes but is not limited to:

- "Tell me about yourself"
- "Why investment banking?" / "Why this firm?" / "Why this group?"
- "Walk me through your resume"
- "What's your greatest strength / weakness?"
- "Where do you see yourself in 5 years?"
- "Tell me about a time you showed leadership / worked in a team / dealt with conflict"
- "What do you do outside of work?"
- "Why did you choose your major?"
- "What makes you different from other candidates?"
- Any question that asks the candidate to reflect on personal experiences, values, or motivations
- Any question that begins with "Tell me about a time..." or "Give me an example of..."

Keep **all technical and conceptual questions** even if they feel basic.

---

## Categories

Assign each question to exactly one of these categories:

| Category | What belongs here |
|---|---|
| `"Accounting"` | Financial statements, GAAP concepts, adjustments, ratios, working capital, deferred taxes, PP&E, goodwill, intangibles |
| `"Valuation"` | Comparable company analysis, precedent transactions, general valuation concepts, enterprise vs equity value, multiples |
| `"DCF"` | Discounted cash flow, WACC, terminal value, unlevered FCF, sensitivity analysis |
| `"LBO"` | Leveraged buyout mechanics, returns (IRR/MoM), debt paydown, sponsor economics, entry/exit, sources & uses |
| `"M&A"` | Merger models, accretion/dilution, synergies, purchase price allocation, deal structure, stock vs cash |
| `"Debt & Capital Structure"` | Bonds, credit, leverage ratios, covenants, refinancing, capital structure optimization, interest coverage |
| `"Markets"` | Macro, interest rates, equities, commodities, FX, current events framing, "pitch me a stock" type questions |
| `"Brain Teasers"` | Mental math, estimation, logic puzzles, quick-answer conceptual questions |

If a question spans two categories, assign it to the most dominant one.

---

## Difficulty Assignment

Assign `"Easy"`, `"Medium"`, or `"Hard"` based on these rules:

- **Easy**: Definitional or conceptual ("What is EBITDA?", "What are the three financial statements?"). A first-year analyst candidate should know this cold.
- **Medium**: Requires some analysis or multi-step reasoning ("How does a $10 increase in depreciation affect the three statements?", "Walk me through an LBO model"). Most common category.
- **Hard**: Requires deep technical knowledge, nuance, or integration across topics ("How would you value a company with negative EBITDA?", "Explain the difference between a tax-free and taxable merger reorganization and the conditions for each.").

If you genuinely cannot determine difficulty, set it to `null`.

---

## Deduplication Rules

Questions are duplicates if they are asking the same thing, even if worded differently. Examples of duplicates:

- "Walk me through a DCF" and "Can you walk me through how you'd build a discounted cash flow analysis?"
- "What is WACC?" and "How do you calculate the weighted average cost of capital?"
- "How does depreciation flow through the three statements?" and "Walk me through how a $10 increase in D&A affects each financial statement"

When deduplicating, **keep the clearest, most complete phrasing**. Prefer the version that is specific and actionable over the one that is vague.

---

## Output Format

Write the output to `src/ibQuestions.js` using this exact structure:

```js
// Auto-generated IB question bank — do not edit manually
// Total: N questions across M categories

export const IB_QUESTIONS = [
  {
    id: "ib_001",
    question: "Walk me through a DCF.",
    category: "DCF",
    difficulty: "Medium",
  },
  {
    id: "ib_002",
    question: "What is EBITDA and why do analysts use it?",
    category: "Accounting",
    difficulty: "Easy",
  },
  // ...
];
```

Rules for the output file:
- IDs are zero-padded to 3 digits: `ib_001`, `ib_002`, ..., `ib_400`
- If there are more than 400, continue the numbering: `ib_401`, etc.
- Question text should be clean prose — no numbering prefixes, no "Q:" prefix, no trailing whitespace
- Category must be exactly one of the 8 defined strings above — no variations
- Difficulty must be `"Easy"`, `"Medium"`, `"Hard"`, or `null`
- Sort questions by category alphabetically, then by difficulty (Easy → Medium → Hard → null) within each category

---

## What to Do With Ambiguous Questions

- **Borderline behavioral**: If a question asks for a personal example but has a strong technical component (e.g. "Tell me about a deal you've worked on and how you valued it"), **keep it** and assign it the most relevant technical category.
- **Overlapping categories**: Use the dominant theme. An LBO question that also tests accounting goes in `"LBO"`.
- **Very similar but not identical**: If two questions test meaningfully different knowledge despite similar framing, keep both.

---

## After Writing the File

Report back with:
1. Total question count
2. Breakdown by category (count per category)
3. Breakdown by difficulty
4. How many questions were removed as behavioral/fit
5. How many duplicates were merged
6. Any notable decisions or edge cases you encountered

---

## Files to Read

The PDFs are attached to this conversation. Read all of them before starting. Process them sequentially and build a running deduplicated list as you go.
