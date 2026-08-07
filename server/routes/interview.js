const express = require("express");
const router = express.Router();
const { interview, getSession, getCandidates, getModels, exportTranscript, exportAIUsage } = require("../controllers/interviewController");

router.post("/interview", interview);
router.get("/interview/:sessionId", getSession);
router.get("/candidates", getCandidates);
router.get("/debug/models", getModels);
router.get("/debug/transcript/:sessionId", exportTranscript);
router.get("/debug/ai-usage/:sessionId", exportAIUsage);

module.exports = router;
