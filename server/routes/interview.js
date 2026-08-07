const express = require("express");
const router = express.Router();
const { interview, getSession, getCandidates, getModels } = require("../controllers/interviewController");

router.post("/interview", interview);
router.get("/interview/:sessionId", getSession);
router.get("/candidates", getCandidates);
router.get("/debug/models", getModels);

module.exports = router;
