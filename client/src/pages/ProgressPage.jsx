import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null); // для збереження інтервалу

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

    // очистка інтервалу при паузі або виході
    return () => clearInterval(intervalRef.current);
  }, [isPaused, navigate]);

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Виконується генерація тестових запитань</h1>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className="bg-purple-600 h-6 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mt-2">{progress}%</p>
        <div className="buttons" style={styles.buttonContainer}>
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
