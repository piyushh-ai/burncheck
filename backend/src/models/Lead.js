import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  company: String,
  teamSize: Number,
  useCase: String,
  monthlyBudget: Number,
  needsAPI: Boolean,
  currentTools: [String], // array of tool keys user already pays for
  recommendedPlans: [Object], // full recommendation objects from engine
  aiSummary: String, // LLM-generated natural language summary
  createdAt: { type: Date, default: Date.now },
});

const leadModel = mongoose.model("Lead", leadSchema);

export default leadModel;
