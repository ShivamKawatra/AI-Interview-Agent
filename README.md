# AI Interview Agent

A full-stack MERN application that conducts personalized AI-powered technical interviews using Google Gemini.

## Tech Stack
- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Vercel)
- **Database**: MongoDB Atlas
- **AI**: Google Gemini 1.5 Pro

## Project Structure
```
Interview_Agent/
├── server/          # Express backend
├── client/          # React frontend
├── curriculum.json  # 31-day AI cohort curriculum
└── candidates.json  # Candidate profiles
```

---

## Local Development

### 1. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_atlas_uri
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open http://localhost:5173

---

## Deployment on Vercel

### Step 1: Deploy Backend

1. Push the `server/` folder to a GitHub repo (or the full monorepo)
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `server`
4. Add Environment Variables:
   - `GEMINI_API_KEY` = your key
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your frontend Vercel URL (add after frontend deploy)
5. Deploy → copy the backend URL (e.g. `https://interview-agent-server.vercel.app`)

### Step 2: Deploy Frontend

1. Go to Vercel → New Project → same repo
2. Set **Root Directory** to `client`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.vercel.app/api`
4. Deploy → copy the frontend URL

### Step 3: Update Backend CORS
Go back to backend Vercel project → Settings → Environment Variables → update `CLIENT_URL` to your frontend URL → Redeploy.

---

## API Contract

### POST /api/interview

**Start interview:**
```json
{ "sessionId": "abc-123", "candidate": { ...candidateObject } }
```

**Send message:**
```json
{ "sessionId": "abc-123", "message": "My answer here" }
```

**Response:**
```json
{ "reply": "...", "done": false }
```

**Final response (when done):**
```json
{
  "reply": "...",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
```

### GET /api/candidates
Returns all candidate profiles.

### GET /api/interview/:sessionId
Returns session details.
