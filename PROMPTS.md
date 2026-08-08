# AI USAGE LOG

This file records the AI assistance used during development and debugging of the Interview Agent project.

## AI Usage Record

### 2026-08-07 — Initial project build (Amazon Q)
- Assistant: external AI inferred from conversation transcript
- Goal: Build the Interview Agent project as a MERN stack app with Gemini API integration and Vercel deployment readiness.

#### Summary of actions
- Explored the project directory and confirmed the initial file layout.
- Created full backend structure under `server/` including:
  - `server/package.json`, `server/index.js`
  - `routes/interview.js`, `controllers/interviewController.js`
  - `services/geminiService.js`, `models/Session.js`
  - data import from `curriculum.json` and `candidates.json`
  - `server/.env`, `server/.env.example`, `server/vercel.json`, `.gitignore`
- Scaffolded the React frontend under `client/` using Vite:
  - created `client/src/components`, `client/src/pages`, `client/src/hooks`
  - added `main.jsx`, `App.jsx`, `index.css`
  - added pages: `SelectCandidate.jsx`, `InterviewRoom.jsx`
  - added UI components: `MessageBubble.jsx`, `FeedbackReport.jsx`
  - added CSS modules and client Vite/Vercel configuration
- Added root-level docs and deployment instructions in `README.md`.
- Installed server and client dependencies.
- Prepared local development and Vercel deployment instructions.

#### Notes from the initial AI session
- The project was described as built completely with MERN stack and Gemini API.
- It was intended to support local development and deployment on Vercel as separate server/client projects.
- The initial setup included environment guidance for Gemini API key and MongoDB connection string.

### 2026-08-08 — Debugging CORS issue (GitHub Copilot)
- Assistant: GitHub Copilot (Raptor mini)
- User request: Debug and fix a cross-origin request (CORS) failure affecting the Interview Agent frontend/backend deployment on Vercel.

#### Problem Observed
- Frontend called backend at `https://interview-agent-backend-shivam.vercel.app/api/interview`.
- Browser showed CORS preflight failure:
  - `Response to preflight request doesn't pass access control check`
  - allowed origin header had an extra trailing slash.
- Axios reported `Network Error` and `POST ... net::ERR_FAILED`.

#### Root Cause Identified
- Backend `CLIENT_URL` env var included a trailing slash.
- Browser origin value did not include the trailing slash.
- Exact origin matching failed, causing CORS rejection.

#### Files Updated
1. `server/index.js`
   - Normalized `process.env.CLIENT_URL` by removing trailing slash characters with `replace(/\/+$|\/g, "")`.
   - Passed normalized origin into `cors({ origin: allowedOrigin, credentials: true })`.
2. `server/.env`
   - Updated `CLIENT_URL` to `https://interview-agent-frontend-shivam.vercel.app` without trailing slash.

#### Detailed Action Log
- Inspected `server/index.js` to confirm CORS setup.
- Checked the backend `.env` file values.
- Verified the origin mismatch and fixed it with normalization logic.
- Updated environment configuration and documented the fix.

#### Verification Instructions
- Restart or redeploy the backend after updating environment variables.
- On Vercel, update `CLIENT_URL` in the backend project and redeploy.
- Confirm backend returns exactly `Access-Control-Allow-Origin: https://interview-agent-frontend-shivam.vercel.app`.
- Re-test the frontend request to ensure the CORS preflight passes.

## Evaluator Evidence
- Submit this `PROMPTS.md` / `AI USAGE LOG` file as the AI usage record.
- Optionally attach exported session transcript JSON from `GET /api/debug/transcript/:sessionId`.
- Optionally attach AI usage log JSON from `GET /api/debug/ai-usage/:sessionId`.

These records show both the initial AI-assisted build and the later debugging support.
"
}