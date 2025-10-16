import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleGenerationCancel = () => {
    navigate("/");
  };

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            setTimeout(() => navigate("/result"), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused, navigate]);

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Виконується генерація тестових запитань</h1>

        {/* Прогрес-бар */}
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          ></div>
        </div>

        <p style={styles.progressText}>{progress}%</p>

        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={handlePauseResume}>
            {isPaused ? "Продовжити" : "Пауза"}
          </button>
          <button style={styles.button} onClick={handleGenerationCancel}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  contentWrapper: {
    padding: "0",
    margin: "0",
    width: "96vw",
    height: "100vh",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    boxSizing: "border-box",
    width: "500px",
    margin: "0 auto",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "20px",
    alignItems: "center",
    padding: "30px",
    borderTop: "2px solid #ccc",
    borderBottom: "2px solid #ccc",
  },
  title: {
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: "20px",
    background: "#545353ff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
  },
  progressFill: {
    height: "100%",
    background: "#ccc",
    transition: "width 0.3s ease-in-out",
  },
  progressText: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "500",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    width: "100%",
  },
  button: {
    width: "100%",
    background: "black",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ProgressPage;
