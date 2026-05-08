import express from "express";
import { runAudit } from "../controllers/auditController.js";
import { getLeads } from "../controllers/adminController.js";
import { validateWorkEmail } from "../middleware/validateEmail.js";

const router = express.Router();

// validateWorkEmail runs first — rejects personal emails before audit logic
router.post("/audit", validateWorkEmail, runAudit);

// Admin dashboard route
router.get("/leads", getLeads);

export default router;
