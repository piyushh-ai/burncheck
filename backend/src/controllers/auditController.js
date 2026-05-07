import { recommendPlan } from "../services/auditEngine.js";
import Lead from "../models/Lead.js";

export async function runAudit(req, res) {
  try {
    const userInput = req.body;
    const recommendations = recommendPlan(userInput);

    // Save as lead
    await Lead.create({ ...userInput, recommendedPlans: recommendations });
    
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}