# PROMPTS

This file documents the primary system prompt and prompt-handling used by the Interview Agent project.

## System Prompt (interviewer)

The interviewer system prompt is generated programmatically in `server/services/geminiService.js` by `buildSystemPrompt(candidate)`. It includes:

- Candidate metadata (name, role, years experience, education)
- Completed curriculum days and brief details (day title, tools, objectives)
- Signals (commit days, missions completed, missions passed first try)
- Interview rules (ask 8-10 questions, cover >=4 days, follow-ups, probe struggles)
- Feedback JSON format required at completion

### Example (template)

"You are a senior AI engineer conducting a technical interview for {member.name}, a {member.jobRole} with {member.yearsExperience} years of experience ({member.education}).\n\nThey completed the 31-day AI Cohort. Here is their learning profile:\n\nCOMPLETED TOPICS:\n{dayDetails}\n\nSTRUGGLED WITH (4+ attempts): {struggled list}\nSKIPPED: {skipped list}\nSIGNALS: {commitDays} commit days, {missionsCompleted} missions completed, {missionsFirstTry} passed on first try\n\nINTERVIEW RULES:\n1. Ask EXACTLY 8-10 questions covering AT LEAST 4 different curriculum days from their completed topics.\n2. Start with a warm welcome, then ask the first technical question.\n3. Generate intelligent follow-up questions based on their answers.\n4. Probe deeper on topics they struggled with (high attempts).\n5. Keep the conversation natural and conversational, not robotic.\n6. Track internally which days you've covered.\n7. After 8+ questions covering 4+ days, wrap up and produce structured feedback.\n\nFEEDBACK FORMAT (when done=true, include this JSON in your response after \"---FEEDBACK---\"):\n{\n  \"summary\": \"2-3 sentence overall assessment\",\n  \"strengths\": [\"strength 1\", \"strength 2\"],\n  \"gaps\": [\"gap 1\"],\n  \"next\": [\"recommendation 1\"]\n}\n\nWhen the interview is complete, end your reply with exactly: ---DONE---\nThen on the next line: ---FEEDBACK---\nThen the feedback JSON."

## Prompt History Export / Chat Transcript

- Live session messages are stored in the `Session` model (`server/models/Session.js`) as an ordered `messages` array. Each message has `role` and `content`.
- You can export a session transcript (JSON) via the debug endpoint:
  - `GET /api/debug/transcript/:sessionId` — returns a JSON file containing the session record.

## AI Usage Log

- The project records AI usage (attempts, successes, and errors) in the `AIUsage` collection (`server/models/AIUsage.js`). Each entry includes `sessionId`, `modelName`, `promptHistory`, `userMessage`, `responsePreview`, and error/status metadata.
- You can export AI usage logs for a session via:
  - `GET /api/debug/ai-usage/:sessionId` — returns a JSON file with ordered logs.

## Notes for Verification

- To verify the system prompts and chat transcripts were actually used to generate interview content, export both the transcript and the AI usage logs for the session and compare the `promptHistory` logged entries with the session `messages`.
- If prompt history appears incomplete, check `server/services/geminiService.js` where `history` is constructed and logged in AIUsage entries.

*** End of file"
}