// src/store/slices/auditSlice.js
// Redux slice — manages audit form state, submission status, and results.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitAudit } from "../../api/auditApi";

// ─── Async Thunk ────────────────────────────────────────────────────────────

/**
 * Async thunk that calls the API layer and dispatches pending/fulfilled/rejected
 * actions automatically.
 */
export const runAudit = createAsyncThunk(
  "audit/runAudit",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await submitAudit(formData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────────────────

const DRAFT_KEY = "burncheck_draft";

function loadDraftFromStorage() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const defaultForm = {
  email: "",
  name: "",
  company: "",
  teamSize: 1,
  useCase: "coding",
  monthlyBudget: 150,
  needsAPI: false,
  currentTools: [],
};

const initialState = {
  // Form data (persisted to localStorage)
  form: loadDraftFromStorage() || defaultForm,

  // Submission state
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,

  // Results from backend
  recommendations: [],
  summary: null,

  // Draft persistence indicator
  draftSaved: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    /**
     * Update a single form field and save draft to localStorage.
     */
    updateField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
      state.draftSaved = true;

      // Persist to localStorage
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state.form));
      } catch {
        // Ignore localStorage errors
      }
    },

    /**
     * Toggle a tool chip on/off in the currentTools array.
     */
    toggleTool(state, action) {
      const toolKey = action.payload;
      const index = state.form.currentTools.indexOf(toolKey);
      if (index === -1) {
        state.form.currentTools.push(toolKey);
      } else {
        state.form.currentTools.splice(index, 1);
      }

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state.form));
      } catch {
        // Ignore localStorage errors
      }
      state.draftSaved = true;
    },

    /**
     * Reset the form and clear localStorage draft.
     */
    resetForm(state) {
      state.form = { ...defaultForm };
      state.status = "idle";
      state.error = null;
      state.recommendations = [];
      state.summary = null;
      state.draftSaved = false;
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore
      }
    },

    /**
     * Clear only the results (keep form filled).
     */
    clearResults(state) {
      state.status = "idle";
      state.error = null;
      state.recommendations = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAudit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(runAudit.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recommendations = action.payload.recommendations || [];
        state.summary = action.payload.summary || null;
      })
      .addCase(runAudit.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Audit failed. Please try again.";
      });
  },
});

export const { updateField, toggleTool, resetForm, clearResults } = auditSlice.actions;
export default auditSlice.reducer;
