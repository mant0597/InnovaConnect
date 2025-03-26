const mongoose = require("mongoose");

const StartupSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    isBootstrapped: {
      type: Boolean,
      required: true,
    },
    fundingHistory: [
      {
        round: { type: String, enum: ["Seed", "Series A", "Series B", "Series C", "Other"] },
        amountRaised: { type: Number },
        investors: [{ type: String }],
      },
    ],
    fundingGoal: {
      amount: { type: Number, required: false },
      valuation: { type: Number, required: false },
    },
    category: {
      type: String,
      enum: ["Agriculture", "Tech", "Health", "Finance", "Education", "Other"],
      required: true,
    },
    notifications: [
      {
        investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Startup", StartupSchema);

