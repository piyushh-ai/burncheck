// src/services/llmService.js
// Generates a 2-3 paragraph natural language audit summary using Mistral AI.
// Called AFTER the rule engine produces recommendations — LLM only explains,
// never invents pricing numbers.

import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Builds the prompt for the audit summary.
 * We pass the rule engine's output directly — the LLM's job is ONLY to
 * explain these results in plain English, not recalculate anything.
 */
function buildPrompt(userInput, recommendations) {
  const { teamSize, useCase, monthlyBudget, needsAPI, currentTools = [] } = userInput;

  const topRec = recommendations[0];
  const recList = recommendations
    .map(
      (r, i) =>
        `${i + 1}. ${r.tool} — ${r.plan} plan: $${r.monthlyCost}/month for team of ${teamSize}. Fit reasons: ${r.reasons?.join("; ") || r.bestFor}`
    )
    .join("\n");

  const currentToolNames = currentTools.length
    ? currentTools.join(", ")
    : "none specified";

  return `You are an expert AI spend consultant. A startup team just ran an AI tool audit. Based on the EXACT results below (do NOT invent or change any pricing numbers), write a concise 2-3 paragraph summary that:
1. Explains the #1 recommendation and WHY it fits their specific situation
2. Highlights any overlap/duplicate tool warnings if present
3. Gives 1-2 actionable next steps

User profile:
- Team size: ${teamSize} people
- Primary use case: ${useCase}
- Monthly budget: ${monthlyBudget ? `$${monthlyBudget}` : "no hard limit"}
- Needs API access: ${needsAPI ? "yes" : "no"}
- Current tools: ${currentToolNames}

Audit results (calculated by our rule engine — use these exact numbers):
${recList}

Rules:
- Do NOT make up pricing numbers. Only use the numbers above.
- Be direct and actionable. Avoid filler phrases like "Great news!" or "Exciting results!".
- Write in plain, conversational English. Max 200 words.
- If there are overlap warnings, address them specifically.
- End with a concrete action the team can take today.`;
}

/**
 * Calls Mistral API and returns a plain text summary string.
 * Falls back gracefully if API call fails — never blocks the audit response.
 */
export async function generateAuditSummary(userInput, recommendations) {
  if (!process.env.MISTRAL_API_KEY) {
    console.log("[llmService] MISTRAL_API_KEY not set — skipping LLM summary");
    return null;
  }

  try {
    const prompt = buildPrompt(userInput, recommendations);

    const response = await client.chat.complete({
      model: "mistral-small-latest", // Fast + cheap — good for summaries
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 400,
      temperature: 0.4,
    });

    const summary = response.choices?.[0]?.message?.content?.trim();
    console.log("[llmService] Mistral summary generated successfully");
    return summary || null;
  } catch (err) {
    // Don't fail the whole audit if LLM is down
    console.error("[llmService] Mistral API error:", err.message);
    return null;
  }
}
