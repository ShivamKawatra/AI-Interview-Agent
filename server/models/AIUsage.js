const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, default: null },
    modelName: { type: String },
    promptHistory: { type: String },
    userMessage: { type: String },
    responsePreview: { type: String },
    status: { type: String, enum: ["attempt", "success", "error"], default: "attempt" },
    error: { type: String, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIUsage", aiUsageSchema);
