import express from 'express';
import { runAudit } from "../controllers/auditController.js";

const router = express.Router();
router.post("/audit", runAudit);

export default router;