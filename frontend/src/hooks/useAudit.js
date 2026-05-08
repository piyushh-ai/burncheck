// src/hooks/useAudit.js
// Layer 2 — Hooks layer.
// UI components interact with Redux exclusively through this hook.

import { useDispatch, useSelector } from "react-redux";
import { updateField, toggleTool, resetForm, clearResults, runAudit } from "../store/slices/auditSlice";

export function useAudit() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.audit);

  const handleUpdateField = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleToggleTool = (tool) => {
    dispatch(toggleTool(tool));
  };

  const handleSubmitAudit = () => {
    // Return the promise so components can await/navigate on success
    return dispatch(runAudit(state.form)).unwrap();
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const handleClearResults = () => {
    dispatch(clearResults());
  };

  return {
    // State
    form: state.form,
    status: state.status,
    error: state.error,
    recommendations: state.recommendations,
    summary: state.summary,
    draftSaved: state.draftSaved,

    // Actions
    updateField: handleUpdateField,
    toggleTool: handleToggleTool,
    submitAudit: handleSubmitAudit,
    resetForm: handleReset,
    clearResults: handleClearResults,
  };
}
