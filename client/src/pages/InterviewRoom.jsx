import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MessageBubble from "../components/MessageBubble";
import FeedbackReport from "../components/FeedbackReport";
import styles from "./InterviewRoom.module.css";

const API = import.meta.env.VITE_API_URL;

export default function InterviewRoom({ session, onReset }) {
  const { sessionId, candidate, firstMessage } = session;
  const [messages, setMessages] = useState([
    { role: "model", content: firstMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !done) inputRef.current?.focus();
  }, [loading, done]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || done) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/interview`, {
        sessionId,
        message: text,
      });

      setMessages((prev) => [...prev, { role: "model", content: res.data.reply }]);

      if (res.data.done) {
        setDone(true);
        setFeedback(res.data.feedback);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.candidateInfo}>
          <div className={styles.avatar}>{candidate.member.name.charAt(0)}</div>
          <div>
            <h2>{candidate.member.name}</h2>
            <p>{candidate.member.jobRole}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.status} ${done ? styles.completed : styles.live}`}>
            {done ? "✅ Completed" : "🔴 Live Interview"}
          </span>
          <button className={styles.resetBtn} onClick={onReset}>
            ← New Interview
          </button>
        </div>
      </header>

      <div className={styles.chatArea}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        )}

        {done && feedback && <FeedbackReport feedback={feedback} />}

        <div ref={bottomRef} />
      </div>

      {!done && (
        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            rows={3}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            {loading ? "..." : "Send →"}
          </button>
        </div>
      )}

      {done && (
        <div className={styles.doneBar}>
          <p>Interview complete! Review your feedback above.</p>
          <button className={styles.resetBtn2} onClick={onReset}>
            Start New Interview
          </button>
        </div>
      )}
    </div>
  );
}
