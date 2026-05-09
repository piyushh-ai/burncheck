// src/routes/auditRoutes.js
import express from "express";
import { runAudit } from "../controllers/auditController.js";
import { validateWorkEmail } from "../middleware/validateEmail.js";
import { honeypotCheck } from "../middleware/honeypot.js";

const router = express.Router();

// POST /api/audit
// Pipeline: honeypot check → email validation → audit logic
router.post("/audit", honeypotCheck, validateWorkEmail, runAudit);

export default router;
