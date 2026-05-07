import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  company: String,
  teamSize: Number,
  useCase: String,
  monthlyBudget: Number,
  needsAPI: Boolean,
  recommendedPlans: [Object], // store audit result
  createdAt: { type: Date, default: Date.now },
});

const leadModel = mongoose.model("Lead", leadSchema);

export default leadModel;
