// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import auditReducer from "./slices/auditSlice";

export const store = configureStore({
  reducer: {
    audit: auditReducer,
  },
});
