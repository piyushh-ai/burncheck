// src/api/auditApi.js
// Layer 4 — API calls.
// All HTTP communication with the backend lives here.
// Components never call axios directly — they use hooks which call these functions.

import api from "../utils/axios";

/**
 * POST /api/audit
 * Submits the audit form and returns recommendations + AI summary.
 * @param {Object} formData - { email, name, company, teamSize, useCase, monthlyBudget, needsAPI, currentTools }
 * @returns {Promise<{ recommendations: Array, summary: string }>}
 */
export async function submitAudit(formData) {
  const response = await api.post("/api/audit", {
    ...formData,
    teamSize: parseInt(formData.teamSize) || 1,
    monthlyBudget: parseFloat(formData.monthlyBudget) || null,
    needsAPI: Boolean(formData.needsAPI),
    currentTools: formData.currentTools || [],
  });
  return response.data;
}

/**
 * GET /api/leads (admin)
 * Fetches all audit leads for the admin dashboard.
 * @returns {Promise<Array>}
 */
export async function fetchLeads() {
  const response = await api.get("/api/leads");
  return response.data;
}

/**
 * GET /health
 * Health check — used on mount to verify backend is reachable.
 * @returns {Promise<{ status: string }>}
 */
export async function healthCheck() {
  const response = await api.get("/health");
  return response.data;
}
