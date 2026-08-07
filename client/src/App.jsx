import { useState } from "react";
import SelectCandidate from "./pages/SelectCandidate";
import InterviewRoom from "./pages/InterviewRoom";

export default function App() {
  const [session, setSession] = useState(null);

  const handleStart = (sessionData) => setSession(sessionData);
  const handleReset = () => setSession(null);

  return session ? (
    <InterviewRoom session={session} onReset={handleReset} />
  ) : (
    <SelectCandidate onStart={handleStart} />
  );
}
