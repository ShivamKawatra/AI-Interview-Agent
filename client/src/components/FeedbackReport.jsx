import styles from "./FeedbackReport.module.css";

export default function FeedbackReport({ feedback }) {
  if (!feedback) return null;
  const { summary, strengths = [], gaps = [], next = [] } = feedback;

  return (
    <div className={styles.report}>
      <div className={styles.title}>📋 Interview Feedback Report</div>

      <div className={styles.summary}>{summary}</div>

      <div className={styles.sections}>
        {strengths.length > 0 && (
          <div className={styles.section}>
            <h4>✅ Strengths</h4>
            <ul>
              {strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {gaps.length > 0 && (
          <div className={`${styles.section} ${styles.gaps}`}>
            <h4>⚠️ Gaps</h4>
            <ul>
              {gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
        )}

        {next.length > 0 && (
          <div className={`${styles.section} ${styles.next}`}>
            <h4>🚀 Next Steps</h4>
            <ul>
              {next.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
