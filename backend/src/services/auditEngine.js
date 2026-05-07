// src/services/auditEngine.js
import pricingData from "../data/pricingData.js";

export function recommendPlan(userInput) {
  const { teamSize, useCase, monthlyBudget, needsAPI } = userInput;

  const results = [];

  Object.entries(pricingData).forEach(([toolKey, tool]) => {

    Object.entries(tool.plans).forEach(([planKey, plan]) => {
      // Calculate actual monthly cost
      let monthlyCost = plan.isPerSeat
        ? (plan.pricePerSeat || 0) * teamSize
        : plan.pricePerSeat || plan.avgMonthlyEstimate || 0;

      // Budget filter
      if (monthlyBudget && monthlyCost > monthlyBudget) return;

      results.push({
        tool: tool.name,
        plan: plan.name,
        monthlyCost,
        bestUseCases: tool.bestUseCases,
        capabilities: tool.capabilities,
        alternatives: tool.alternatives,
        bestFor: plan.bestFor,
        website: tool.website,
        score: scoreplan(plan, userInput),
      });
    });
  });

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

function scoreplan(plan, { teamSize, useCase, needsAPI }) {
  let score = 0;

  if (teamSize > 5 && plan.isPerSeat) score += 10;
  if (teamSize <= 2 && !plan.isPerSeat) score += 10;
  if (needsAPI && plan.features?.toLowerCase().includes("token")) score += 15;
  if (plan.pricePerSeat === 0) score += 5; // free tier bonus

  return score;
}
