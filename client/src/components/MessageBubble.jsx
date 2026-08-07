import styles from "./MessageBubble.module.css";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : styles.agentWrapper}`}>
      {!isUser && <div className={styles.agentIcon}>🤖</div>}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.agentBubble}`}>
        {content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
      {isUser && <div className={styles.userIcon}>👤</div>}
    </div>
  );
}
