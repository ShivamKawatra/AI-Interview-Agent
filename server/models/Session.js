const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  content: { type: String, required: true },
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    candidate: { type: Object, required: true },
    messages: [messageSchema],
    coveredDays: [Number],
    questionCount: { type: Number, default: 0 },
    status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
    feedback: { type: Object, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
