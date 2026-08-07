const { GoogleGenerativeAI } = require("@google/generative-ai");
const curriculum = require("../data/curriculum.json");
const AIUsage = require("../models/AIUsage");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "models/gemini-3.6-flash";
let model;
try {
  console.log(`Initializing generative model: ${DEFAULT_MODEL}`);
  model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
} catch (err) {
  console.error(`Failed to initialize model ${DEFAULT_MODEL}:`, err);
  console.error("Ensure the model name is valid and your API key has access. Falling back to models/gemini-2.5-flash.");
  // Fallback to a commonly-available Gemini model
  try {
    model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    console.log("Fallback model initialized: models/gemini-2.5-flash");
  } catch (err2) {
    console.error("Fallback model initialization failed:", err2);
    throw err2;
  }
}

function buildSystemPrompt(candidate) {
  const { member, missions, signals } = candidate;

  const completedMissions = missions.filter((m) => m.passed);
  const skippedMissions = missions.filter((m) => m.skipped);
  const struggledMissions = missions.filter(
    (m) => m.passed && m.attempts >= 4
  );

  const completedDays = completedMissions.map((m) => m.day);
  const dayDetails = curriculum.days
    .filter((d) => completedDays.includes(d.day))
    .map(
      (d) =>
        `Day ${d.day}: ${d.title} | Tools: ${d.tools.join(", ")} | Objectives: ${d.objectives.join("; ")}`
    )
    .join("\n");

  return `You are a senior AI engineer conducting a technical interview for ${member.name}, a ${member.jobRole} with ${member.yearsExperience} years of experience (${member.education}).

They completed the 31-day AI Cohort. Here is their learning profile:

COMPLETED TOPICS:
${dayDetails}

STRUGGLED WITH (4+ attempts): ${struggledMissions.map((m) => `Day ${m.day}: ${m.title}`).join(", ") || "None"}
SKIPPED: ${skippedMissions.map((m) => `Day ${m.day}: ${m.title}`).join(", ") || "None"}
SIGNALS: ${signals.commitDays} commit days, ${signals.missionsCompleted} missions completed, ${signals.missionsFirstTry} passed on first try

INTERVIEW RULES:
1. Ask EXACTLY 8-10 questions covering AT LEAST 4 different curriculum days from their completed topics.
2. Start with a warm welcome, then ask the first technical question.
3. Generate intelligent follow-up questions based on their answers.
4. Probe deeper on topics they struggled with (high attempts).
5. Keep the conversation natural and conversational, not robotic.
6. Track internally which days you've covered.
7. After 8+ questions covering 4+ days, wrap up and produce structured feedback.

FEEDBACK FORMAT (when done=true, include this JSON in your response after "---FEEDBACK---"):
{
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "next": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

When the interview is complete, end your reply with exactly: ---DONE---
Then on the next line: ---FEEDBACK---
Then the feedback JSON.`;
}

async function chat(session, userMessage) {
  const systemPrompt = buildSystemPrompt(session.candidate);

  const history = session.messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const historyForChat = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [{ text: "Understood. I'm ready to conduct the interview." }],
    },
    ...history,
  ];

  const result = await sendWithFallback(historyForChat, userMessage, session.sessionId);
  const responseText = result.response.text();

  const isDone = responseText.includes("---DONE---");
  let reply = responseText;
  let feedback = null;

  if (isDone) {
    const parts = responseText.split("---DONE---");
    reply = parts[0].trim();

    const feedbackMatch = responseText.match(
      /---FEEDBACK---\s*([\s\S]*?)(\s*$)/
    );
    if (feedbackMatch) {
      try {
        const jsonStr = feedbackMatch[1]
          .trim()
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
        feedback = JSON.parse(jsonStr);
      } catch {
        feedback = {
          summary: "Interview completed successfully.",
          strengths: ["Completed the AI Cohort"],
          gaps: ["Review skipped topics"],
          next: ["Practice building end-to-end AI projects"],
        };
      }
    }
  }

  return { reply, isDone, feedback };
}

async function startInterview(candidate, sessionId = null) {
  const systemPrompt = buildSystemPrompt(candidate);

  const historyForChat = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [{ text: "Understood. I'm ready to conduct the interview." }],
    },
  ];

  const result = await sendWithFallback(historyForChat, "Please begin the interview with a warm welcome and your first question.", sessionId);
  return result.response.text();
}

async function sendWithFallback(history, message, sessionId = null) {
  const preferredFallbacks = process.env.GEMINI_FALLBACKS
    ? process.env.GEMINI_FALLBACKS.split(",").map((s) => s.trim())
    : [
        "models/gemini-3.6-flash",
        "models/gemini-3.5-flash",
        "models/gemini-2.5-flash",
        "models/gemini-3.5-flash-lite",
        "models/gemini-2.0-flash",
      ];

  // Try the currently-initialized model first
  const tried = new Set();

  // helper to attempt sends with retries on 503
  const trySend = async (modelObj) => {
    const chatSession = modelObj.startChat({ history });
    const maxAttempts = 3;
    let attempt = 0;
    let lastErr;
    while (attempt < maxAttempts) {
      try {
        return await chatSession.sendMessage(message);
      } catch (err) {
        lastErr = err;
        attempt += 1;
        // only retry on transient server errors (503) or network errors
        const status = err && err.status;
        if (status === 503) {
          const delay = 500 * Math.pow(2, attempt - 1);
          console.warn(`Model ${modelObj.model} returned 503, retrying in ${delay}ms (attempt ${attempt})`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        // non-retriable
        throw err;
      }
    }
    throw lastErr;
  };

  // Build ordered list of candidate model names
  const candidateModels = [process.env.GEMINI_MODEL || DEFAULT_MODEL, ...preferredFallbacks];
  for (const mName of candidateModels) {
    if (!mName || tried.has(mName)) continue;
    tried.add(mName);
    try {
      console.log(`Attempting send using model: ${mName}`);
      const modelObj = genAI.getGenerativeModel({ model: mName });
      // attach model name for logging
      modelObj.model = mName;
      // record attempt
      try {
        await AIUsage.create({
          sessionId,
          modelName: mName,
          promptHistory: history.map((h) => (h.parts || []).map((p) => p.text || "").join("\n")).join("\n---\n"),
          userMessage: message,
          status: "attempt",
        });
      } catch (logErr) {
        console.warn("Failed to write AIUsage attempt log:", logErr);
      }

      const res = await trySend(modelObj);
      // on success, set global model to this one for future calls
      model = modelObj;
      console.log(`Send succeeded with model: ${mName}`);
      try {
        const preview = (res && res.response && typeof res.response.text === "function") ? res.response.text().slice(0, 2000) : undefined;
        await AIUsage.create({
          sessionId,
          modelName: mName,
          promptHistory: history.map((h) => (h.parts || []).map((p) => p.text || "").join("\n")).join("\n---\n"),
          userMessage: message,
          responsePreview: preview,
          status: "success",
        });
      } catch (logErr) {
        console.warn("Failed to write AIUsage success log:", logErr);
      }
      return res;
    } catch (err) {
      console.error(`Model ${mName} failed:`, err && err.message ? err.message : err);
      try {
        await AIUsage.create({
          sessionId,
          modelName: mName,
          promptHistory: history.map((h) => (h.parts || []).map((p) => p.text || "").join("\n")).join("\n---\n"),
          userMessage: message,
          status: "error",
          error: err && (err.message || JSON.stringify(err)),
        });
      } catch (logErr) {
        console.warn("Failed to write AIUsage error log:", logErr);
      }
      // if 503, try next model; if other errors like 404, try listing models for debugging
      if (err && err.status === 404) {
        try {
          const available = await listAvailableModels();
          console.error("Available models from API:", available.models ? available.models.map((x) => x.name) : available);
        } catch (listErr) {
          console.error("Failed to list models:", listErr);
        }
      }
      // continue to next candidate
    }
  }

  throw new Error("All candidate models failed to generate a response");
}

async function listAvailableModels() {
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  const resp = await fetch(baseUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`List models failed: ${resp.status} ${resp.statusText} ${text}`);
  }
  const json = await resp.json();
  return json;
}

module.exports = { chat, startInterview, listAvailableModels };
