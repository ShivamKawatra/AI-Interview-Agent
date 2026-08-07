const Session = require("../models/Session");
const { chat, startInterview } = require("../services/geminiService");

const { listAvailableModels } = require("../services/geminiService");

exports.interview = async (req, res) => {
  try {
    const { sessionId, candidate, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    let session = await Session.findOne({ sessionId });

    // Start new interview
    if (!session) {
      if (!candidate) {
        return res.status(400).json({ error: "candidate is required to start interview" });
      }

      const reply = await startInterview(candidate);

      session = await Session.create({
        sessionId,
        candidate,
        messages: [{ role: "model", content: reply }],
        coveredDays: [],
        questionCount: 1,
        status: "ongoing",
      });

      return res.json({ reply, done: false });
    }

    // Interview already completed
    if (session.status === "completed") {
      return res.json({
        reply: "This interview session has already been completed.",
        done: true,
        feedback: session.feedback,
      });
    }

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    // Add user message to history
    session.messages.push({ role: "user", content: message });

    const { reply, isDone, feedback } = await chat(session, message);

    // Add model reply to history
    session.messages.push({ role: "model", content: reply });
    session.questionCount += 1;

    if (isDone) {
      session.status = "completed";
      session.feedback = feedback;
    }

    await session.save();

    const response = { reply, done: isDone };
    if (isDone && feedback) response.feedback = feedback;

    return res.json(response);
  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = require("../data/candidates.json");
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getModels = async (req, res) => {
  try {
    const models = await listAvailableModels();
    res.json(models);
  } catch (err) {
    console.error("getModels error:", err);
    res.status(500).json({ error: err.message });
  }
};
