# LLM Prompts

## Audit Summary Prompt

### Final Prompt (used in production)

```
You are a cost optimization advisor specializing in AI tool subscriptions for startups and small engineering teams.

Given the following audit data, write a concise 80-100 word personalized summary explaining where this team is overspending and what they should change.

Context:
- Team size: {teamSize} people
- Primary use case: {useCase}
- Monthly budget: ${monthlyBudget}
- Needs API access: {needsAPI}
- Current monthly spend (estimated): ${currentSpend}
- Top recommended plan: {topPlan.tool} {topPlan.plan} at ${topPlan.monthlyCost}/month
- Total potential savings: ${totalSavings}/month

Rules:
1. Write in second person ("you", "your team").
2. Lead with the single biggest savings opportunity.
3. Include specific dollar amounts — never say "significant savings" without a number.
4. If savings are less than $10/month, honestly say they're already optimized.
5. End with one clear action item.
6. Do NOT invent pricing numbers — only use the values provided above.
```

### Why This Prompt Works

- **"Cost optimization advisor" persona** sets a professional, specific tone. Earlier versions used "financial advisor" which made the output too formal and generic.
- **80-100 word limit** forces the LLM to be concise. Users don't read paragraphs — they want a quick verdict.
- **Explicit "Rules" section** prevents common LLM failure modes: vague language ("significant savings"), missing numbers, third-person tone, and hallucinated prices.
- **"Do NOT invent pricing numbers"** is critical. Without this guardrail, Claude occasionally generates plausible-looking but incorrect prices, especially for newer plans it wasn't trained on.

### What I Tried That Didn't Work

**Attempt 1 — Too generic:**
```
Summarize this audit data for the user. Tell them how to save money on AI tools.
```
Output was bland: "You should consider switching to more cost-effective plans." No specifics, no dollar amounts. Useless.

**Attempt 2 — Too long:**
```
Write a comprehensive analysis of this user's AI spending...
[200-word prompt with 10 rules]
```
Output was 300+ words. Users closed the tab before finishing reading. Nobody reads a wall of text for a free tool audit.

**Attempt 3 — Hallucination issues:**
```
Based on your knowledge of AI tool pricing, recommend the best plan...
```
This made Claude use its training data for prices instead of the provided values. It recommended "GitHub Copilot Individual at $10/month" — a plan name that no longer exists (it's now "Pro"). Caught this during testing.

### Fallback Template (when API fails or is unavailable)

Used when the Anthropic API returns an error, times out, or when API credits are exhausted:

```
Based on your current AI tool setup, your team of {teamSize} could save 
approximately ${totalSavings}/month. Your biggest opportunity: switch to 
{topPlan.tool} {topPlan.plan} at ${topPlan.monthlyCost}/month — 
{topPlan.bestFor}. This recommendation is based on verified pricing data 
as of May 2026.
```

This fallback uses template literals with the exact same data the LLM would receive, so users still get actionable output even when the API is down.
