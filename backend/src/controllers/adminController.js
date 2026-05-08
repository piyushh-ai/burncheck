import Lead from "../models/Lead.js";

// Fetch all leads for admin dashboard
export async function getLeads(req, res) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
}
