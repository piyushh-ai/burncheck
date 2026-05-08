# Reflection

## Q1: Hardest Bug This Week

The trickiest issue I ran into was in the `auditEngine.js` scoring logic. On Day 1, after building the initial `recommendPlan()` function, I tested it with a 2-person team that had a $50/month budget. The engine was returning Cursor Business ($40/seat × 2 = $80/month) as a top recommendation — clearly over budget.

The bug was in how I calculated `monthlyCost`. My code was:
```js
let monthlyCost = plan.isPerSeat
  ? (plan.pricePerSeat || 0) * teamSize
  : plan.pricePerSeat || plan.avgMonthlyEstimate || 0;
```

The logic itself looked correct — if `isPerSeat` is true, multiply by team size. But the budget filter `if (monthlyBudget && monthlyCost > monthlyBudget) return;` was being evaluated correctly too. The problem was that `pricePerSeat` for the Cursor Business plan was `40`, team size was `2`, so `monthlyCost` should have been `80`. And `80 > 50` should have filtered it out.

After adding console.logs, I found the real issue: the `monthlyBudget` was coming in as a string `"50"` from the request body, not a number. JavaScript's `"50" && 80 > "50"` evaluates differently than `50 && 80 > 50` — string comparison was happening, where `"80" > "50"` is true (which is correct by coincidence), but `"100" > "50"` is false because string comparison goes character by character and `"1" < "5"`.

The fix was simple — `parseInt(monthlyBudget)` at the top of the function — but it took me a solid 30 minutes of staring at "correct-looking" code before I thought to check the types. Classic JavaScript.

## Q2: Decision I Reversed

Initially I planned to use a single LLM call (Anthropic API) to do the entire audit — pass the user's input as a prompt and let Claude figure out the best plan recommendations. The appeal was obvious: less code to write, more nuanced recommendations, and it would handle edge cases I hadn't thought of.

By mid-Day 1, I reversed this and went with a pure rule-based engine instead. Three reasons:

1. **Pricing accuracy is non-negotiable.** If the tool says "switch to Copilot Pro at $10/month" and the actual price is $19/month, the entire tool's credibility is destroyed. LLMs are trained on older data and frequently hallucinate specific numbers. I verified every price manually — I can't trust an LLM to do that.

2. **Testability.** With rules, I can write deterministic tests: "2-person team, $50 budget → should NOT recommend Cursor Business." With an LLM, the output varies between runs. How do you test that?

3. **Cost.** Every audit would cost $0.01–0.05 in API calls. At 1000 audits/month, that's $10–50/month for a free tool. The rule engine costs $0.

I kept the LLM only for generating a natural-language summary paragraph on top of the rule-based results — where being approximate is acceptable. This hybrid approach gives users both accurate numbers AND a readable explanation.

## Q3: What I Would Build in Week 2

If I had another week, the most impactful feature would be **"Stack Comparison Mode."** Right now the tool audits individual plans. But most startups use 3-4 AI tools together (e.g., Cursor for coding + Claude for writing + OpenAI API for their product). The real savings come from optimizing the *combination*, not individual tools.

**What it would do:** Let users input their entire AI stack — which tools, which plans, how many seats each. The engine would then suggest an optimized stack. For example: "You're paying for both Cursor Pro ($20) and GitHub Copilot Business ($19/seat × 5 = $95). These tools overlap significantly for code completion. Drop Copilot and switch everyone to Cursor Business ($40/seat × 5 = $200) — you lose Copilot's PR reviews but save $20/month overall and get Cursor's agent mode."

**Why it matters:** Every user interview I did (see USER_INTERVIEWS.md) revealed the same insight — people don't overpay on one tool, they overpay by having *duplicate* tools doing the same job. A tool-by-tool audit misses this. Stack-level analysis is where the real value is.

**Technical approach:** Add a `detectOverlaps()` function in `auditEngine.js` that compares the `capabilities` arrays across the user's selected tools. If two tools share >50% of capabilities, flag it as a potential duplicate and calculate the cost of consolidating.

## Q4: AI Tools Usage

I used **Claude (via Antigravity/IDE integration)** as my primary AI assistant throughout the project.

**What I used it for:**
- Generating the initial structure of `pricingData.js` — I described the schema I wanted and had Claude scaffold it with placeholder values. I then went to each official pricing page and replaced every number manually.
- Writing boilerplate code — Express route/controller/model setup follows a pattern I've done dozens of times. AI saved 20 minutes of typing but I reviewed every line.
- Drafting the documentation files — GTM strategy, economics calculations, landing copy. AI gave me a solid starting structure that I then rewrote with my actual thoughts and numbers.

**What I did NOT trust AI for:**
- **Pricing numbers.** Every single price in `pricingData.js` was verified by me on the official website. Claude's training data is months old — pricing changes frequently.
- **Scoring logic.** The `scorePlan()` function needed to reflect my specific understanding of what makes a plan good for a given team. AI-generated scoring weights would be arbitrary.
- **User interview content.** The interviews in USER_INTERVIEWS.md are from actual conversations. AI can't fabricate those.

**Specific example where AI was wrong:** When I asked Claude to help me with the Anthropic API pricing, it gave me Claude 3.5 Sonnet pricing ($3 input / $15 output per 1M tokens). The actual current model is Claude Sonnet 4.6 at $3/$15 — the numbers happened to be the same for that model, but the model name was completely wrong. If I had blindly used it, the model names in my pricing data would have been outdated. I caught this because I was already on the pricing page verifying.

## Q5: Self Rating

- **Discipline: 7/10** — Spent a solid 5 hours on Day 1 and got a working backend with the core audit engine. However, I spent too long perfecting the pricing data when I should have built the frontend form first. Perfectionism on the data side slowed down the user-facing progress.

- **Code Quality: 7/10** — Clean separation of concerns (controller → service → data), proper error handling in the controller, env var validation that fails fast. But the scoring algorithm is too basic — only considers team size and API needs, missing use case matching and tool overlap detection. Also no tests yet.

- **Design Sense: 5/10** — The frontend is still the Vite boilerplate. No actual UI has been built yet. This is the weakest area after Day 1 and needs to be the priority for Day 2.

- **Problem Solving: 8/10** — Identified and solved the type coercion bug in the budget filter. Made a good architectural decision to use rules over LLM for the audit engine. Designed a flexible pricing data schema that handles three different pricing models (flat, per-seat, usage-based).

- **Entrepreneurial Thinking: 7/10** — Good understanding of the target user (engineering managers at small startups). Identified the "duplicate tool detection" insight from initial research. But haven't done user interviews yet (planned for Day 3-4), and the GTM strategy needs more specific distribution channels.


## Day 2 (2026-05-08) Updates

- Completed frontend implementation using React, Redux, and the Google Stitch MCP for a premium Financial Precision design system.
- Upgraded backend uditEngine.js for advanced tool overlap detection and budget savings calculations.
- Integrated Anthropic LLM (claude-haiku) for natural language AI summaries.
- Switched to express-validator for flexible, format-only email validation.
- Wired frontend forms and backend endpoints, including local storage draft persistence and an Admin Leads dashboard.
