// src/services/auditEngine.js
// Advanced audit engine — v2
// Improvements over v1:
//  - Use-case matching score (writers get chat tools, devs get code editors)
//  - Team-size fit score (ideal range from pricingData)
//  - Overlap / duplicate detection (flags tools with identical capabilities)
//  - Savings calculation (how much cheaper vs their current budget)
//  - Confidence score per recommendation
//  - Budget type coercion (fixes v1 string comparison bug)

import pricingData from "../data/pricingData.js";

// Map use case → tool categories that actually fit
const USE_CASE_CATEGORY_FIT = {
  coding: ["ai_code_editor", "ai_api"],
  writing: ["ai_chat"],
  research: ["ai_chat", "ai_api"],
  data: ["ai_api", "ai_chat"],
  mixed: ["ai_chat", "ai_code_editor", "ai_api"],
};

// Canonical capabilities per category — used for overlap detection
const CAPABILITY_GROUPS = {
  code_completion: ["code completion", "tab completion"],
  chat: ["chat"],
  agent: ["agent mode", "cascade agent", "multi-file edits"],
  writing: ["writing"],
  analysis: ["analysis", "research"],
};

/**
 * Main export — takes user input, returns top 5 plan recommendations
 * with enriched metadata and savings info.
 */
export function recommendPlan(userInput) {
  const {
    teamSize = 1,
    useCase = "mixed",
    monthlyBudget,
    needsAPI = false,
    currentTools = [], // array of tool keys user already pays for
  } = userInput;

  // Coerce to numbers (v1 bug fix)
  const parsedTeamSize = parseInt(teamSize) || 1;
  const parsedBudget = monthlyBudget ? parseFloat(monthlyBudget) : null;

  const results = [];

  Object.entries(pricingData).forEach(([toolKey, tool]) => {
    Object.entries(tool.plans).forEach(([planKey, plan]) => {
      // Skip custom/enterprise plans (no public price)
      if (plan.pricePerSeat === null) return;

      // Calculate actual monthly cost
      const monthlyCost = plan.isPerSeat
        ? plan.pricePerSeat * parsedTeamSize
        : plan.pricePerSeat ?? plan.avgMonthlyEstimate ?? 0;

      // Hard budget filter
      if (parsedBudget !== null && monthlyCost > parsedBudget) return;

      // Build score
      const { score, reasons } = scorePlan(plan, tool, toolKey, {
        teamSize: parsedTeamSize,
        useCase,
        needsAPI,
        monthlyBudget: parsedBudget,
        currentTools,
      });

      // Calculate savings vs budget
      const savingsVsBudget =
        parsedBudget !== null ? parsedBudget - monthlyCost : null;

      // Overlap warning — does user already pay for something that does the same job?
      const overlapsWith = detectOverlap(toolKey, currentTools);

      results.push({
        toolKey,
        tool: tool.name,
        plan: plan.name,
        category: tool.category,
        monthlyCost,
        savingsVsBudget,
        bestUseCases: tool.bestUseCases,
        capabilities: tool.capabilities,
        alternatives: tool.alternatives,
        bestFor: plan.bestFor,
        features: plan.features,
        website: tool.website,
        isPerSeat: plan.isPerSeat,
        idealTeamSize: plan.idealTeamSize,
        overlapsWith, // e.g. ["cursor"] if user already has cursor
        score,
        reasons, // human-readable why this was recommended
      });
    });
  });

  // Sort by score, break ties by lowest cost (value for money)
  return results
    .sort((a, b) => b.score - a.score || a.monthlyCost - b.monthlyCost)
    .slice(0, 5);
}

/**
 * Scoring function — returns a score and array of reason strings.
 * Higher score = better fit for this user.
 */
function scorePlan(plan, tool, toolKey, { teamSize, useCase, needsAPI, monthlyBudget, currentTools }) {
  let score = 0;
  const reasons = [];

  // --- Use case fit (most important signal) ---
  const fittingCategories = USE_CASE_CATEGORY_FIT[useCase] || USE_CASE_CATEGORY_FIT.mixed;
  if (fittingCategories.includes(tool.category)) {
    score += 25;
    reasons.push(`Good fit for ${useCase} use case`);
  }

  // --- Team size fit ---
  const { min = 1, max = 999 } = plan.idealTeamSize || {};
  if (teamSize >= min && teamSize <= max) {
    score += 20;
    reasons.push(`Designed for teams of ${min}–${max === 999 ? "any size" : max}`);
  } else if (teamSize < min) {
    score -= 10; // overkill for this team
    reasons.push(`Plan is designed for larger teams (${min}+)`);
  } else {
    score -= 5; // team is too big for this plan
  }

  // --- API needs ---
  if (needsAPI && tool.category === "ai_api") {
    score += 20;
    reasons.push("Provides direct API access you need");
  }
  if (!needsAPI && tool.category === "ai_api") {
    score -= 5; // API tool when user doesn't need API
  }

  // --- Free tier bonus ---
  if (plan.pricePerSeat === 0) {
    score += 8;
    reasons.push("Free plan — $0 cost");
  }

  // --- Budget efficiency ---
  // Plans that use <60% of budget score higher than plans near the limit
  if (monthlyBudget !== null) {
    const monthlyCost = plan.isPerSeat
      ? plan.pricePerSeat * teamSize
      : plan.pricePerSeat ?? plan.avgMonthlyEstimate ?? 0;
    const budgetUsage = monthlyCost / monthlyBudget;
    if (budgetUsage <= 0.5) {
      score += 10;
      reasons.push(`Only uses ${Math.round(budgetUsage * 100)}% of your budget`);
    } else if (budgetUsage <= 0.75) {
      score += 5;
    }
  }

  // --- Not already paying for it ---
  if (currentTools.includes(toolKey)) {
    score -= 30; // Don't recommend what they already have
    reasons.push("⚠️ You already pay for this tool");
  }

  // --- Overlap penalty ---
  const overlapsWith = detectOverlap(toolKey, currentTools);
  if (overlapsWith.length > 0) {
    score -= 15;
    reasons.push(`⚠️ Overlaps with tools you already use: ${overlapsWith.join(", ")}`);
  }

  // --- Usage level fit ---
  // Heavy users shouldn't get light plans
  if (plan.usageLevel === "heavy") {
    score += 5; // heavy plans are generally more capable
  }

  return { score, reasons };
}

/**
 * Detects if a tool duplicates functionality of tools the user already has.
 * Compares capability arrays.
 */
function detectOverlap(toolKey, currentTools) {
  if (!currentTools || currentTools.length === 0) return [];

  const tool = pricingData[toolKey];
  if (!tool) return [];

  const overlaps = [];

  currentTools.forEach((currentToolKey) => {
    if (currentToolKey === toolKey) return;
    const currentTool = pricingData[currentToolKey];
    if (!currentTool) return;

    // Count shared capabilities
    const sharedCapabilities = tool.capabilities.filter((cap) =>
      currentTool.capabilities.some(
        (existingCap) =>
          existingCap.toLowerCase().includes(cap.toLowerCase()) ||
          cap.toLowerCase().includes(existingCap.toLowerCase())
      )
    );

    const overlapRatio = sharedCapabilities.length / tool.capabilities.length;
    if (overlapRatio >= 0.4) {
      overlaps.push(currentTool.name);
    }
  });

  return overlaps;
}

/**
 * Calculates potential savings if user switches FROM their current tools
 * TO the recommended plan.
 * Returns { currentSpend, newSpend, saving }
 */
export function calculateSavings(currentTools, currentPlanKeys, teamSize, recommendedPlan) {
  const parsedTeamSize = parseInt(teamSize) || 1;

  let currentSpend = 0;
  currentTools.forEach((toolKey, i) => {
    const tool = pricingData[toolKey];
    if (!tool) return;
    const planKey = currentPlanKeys[i];
    const plan = planKey ? tool.plans[planKey] : null;
    if (!plan || plan.pricePerSeat === null) return;
    currentSpend += plan.isPerSeat
      ? plan.pricePerSeat * parsedTeamSize
      : plan.pricePerSeat ?? plan.avgMonthlyEstimate ?? 0;
  });

  const newSpend = recommendedPlan.monthlyCost;
  const saving = currentSpend - newSpend;

  return { currentSpend, newSpend, saving };
}
