// src/controllers/auditController.js
// Orchestrates the full audit flow:
//   1. Rule engine → top 5 recommendations
//   2. LLM → natural language summary (non-blocking)
//   3. Save lead to MongoDB
//   4. Send transactional email (non-blocking)
//   5. Return everything to frontend

import { recommendPlan } from "../services/auditEngine.js";
import { generateAuditSummary } from "../services/llmService.js";
import { sendAuditEmail } from "../services/emailService.js";
import Lead from "../models/Lead.js";

export async function runAudit(req, res) {
  try {
    const userInput = req.body;

    // Step 1 — Rule engine
    const recommendations = recommendPlan(userInput);

    if (recommendations.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        summary:
          "No plans found within your budget. Try increasing your monthly budget or adjusting your team size.",
      });
    }

    // Step 2 — LLM summary + DB save in parallel
    const [summary] = await Promise.all([
      generateAuditSummary(userInput, recommendations),
      Lead.create({
        name: userInput.name,
        email: userInput.email,
        company: userInput.company,
        teamSize: userInput.teamSize,
        useCase: userInput.useCase,
        monthlyBudget: userInput.monthlyBudget,
        needsAPI: userInput.needsAPI,
        currentTools: userInput.currentTools || [],
        recommendedPlans: recommendations,
        aiSummary: null,
      }),
    ]);

    const finalSummary =
      summary || buildFallbackSummary(recommendations, userInput);

    // Update saved lead with AI summary (best-effort)
    if (summary) {
      Lead.findOneAndUpdate(
        { email: userInput.email },
        { aiSummary: summary },
        { sort: { createdAt: -1 } }
      ).catch((err) =>
        console.error("[auditController] Summary update failed:", err.message)
      );
    }

    // Step 3 — Send transactional email (non-blocking — never delays response)
    sendAuditEmail(userInput, recommendations, finalSummary).catch((err) =>
      console.error("[auditController] Email send failed:", err.message)
    );

    // Step 4 — Return
    return res.json({
      success: true,
      recommendations,
      summary: finalSummary,
    });
  } catch (err) {
    console.error("[auditController] Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fallback summary used when Anthropic API is unavailable.
 * Rule-based, deterministic — always works.
 */
function buildFallbackSummary(
  recommendations,
  { teamSize, useCase, monthlyBudget }
) {
  const top = recommendations[0];
  const budgetText = monthlyBudget
    ? ` within your $${monthlyBudget}/month budget`
    : "";
  const savings =
    top.savingsVsBudget > 0
      ? ` (saving you $${Math.round(top.savingsVsBudget)}/month vs your budget)`
      : "";

  return `Based on your team of ${teamSize} with a ${useCase} focus, we recommend **${top.tool} ${top.plan}** at $${top.monthlyCost}/month${budgetText}${savings}. ${top.bestFor}. ${
    recommendations.length > 1
      ? `We found ${recommendations.length} plans that fit your needs — review all options below to find the best match.`
      : ""
  }`;
}
