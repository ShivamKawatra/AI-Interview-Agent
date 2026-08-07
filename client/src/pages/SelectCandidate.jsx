import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SelectCandidate.module.css";

const API = import.meta.env.VITE_API_URL;

export default function SelectCandidate({ onStart }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/candidates`)
      .then((r) => setCandidates(r.data.candidates || []))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, []);

  const handleStart = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const res = await axios.post(`${API}/interview`, {
        sessionId,
        candidate: selected,
      });
      onStart({
        sessionId,
        candidate: selected,
        firstMessage: res.data.reply,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. Check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>🤖</div>
        <h1>AI Interview Agent</h1>
        <p>Select a candidate to begin their personalized technical interview</p>
      </div>

      <div className={styles.grid}>
        {candidates.map((c) => (
          <div
            key={c.member.id}
            className={`${styles.card} ${selected?.member.id === c.member.id ? styles.selected : ""}`}
            onClick={() => setSelected(c)}
          >
            <div className={styles.avatar}>
              {c.member.name.charAt(0)}
            </div>
            <div className={styles.info}>
              <h3>{c.member.name}</h3>
              <p className={styles.role}>{c.member.jobRole}</p>
              <p className={styles.meta}>{c.member.yearsExperience} yrs · {c.member.education}</p>
              <div className={styles.stats}>
                <span className={styles.badge}>
                  ✅ {c.missions.filter((m) => m.passed).length} passed
                </span>
                <span className={`${styles.badge} ${styles.skip}`}>
                  ⏭ {c.missions.filter((m) => m.skipped).length} skipped
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.startBtn}
          onClick={handleStart}
          disabled={!selected || loading}
        >
          {loading ? "Starting Interview..." : selected ? `Interview ${selected.member.name} →` : "Select a Candidate"}
        </button>
      </div>
    </div>
  );
}
