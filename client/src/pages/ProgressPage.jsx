import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const ProgressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = location.state || {};

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState("starting");
  const intervalRef = useRef(null);
  const sessionId = sessionStorage.getItem("sessionId");

    const fetchProgress = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/questions/progress/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        
        setProgress(data.progress);
        setStatus(data.status);
        setIsPaused(data.isPaused);
        
        if (data.status === "completed") {
          // Переходимо на сторінку результатів
          navigate("/result", { 
            state: { 
              questions: data.questions,
              ...settings 
            } 
          });
        } else if (data.status === "error") {
          alert("Помилка генерації: " + data.error);
          navigate("/settings");
        } else if (data.status === "cancelled") {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await fetch(`http://localhost:5000/api/questions/resume/${sessionId}`, {
          method: "PUT"
        });
        setIsPaused(false);
        console.log("▶️ Спроба відновити генерацію");
      } else {
        await fetch(`http://localhost:5000/api/questions/pause/${sessionId}`, {
          method: "PUT"
        });
        setIsPaused(true);
        console.log("⏸️ Спроба поставити на паузу");
      }
    } catch (error) {
      console.error("Error pausing/resuming:", error);
    }
  };

  const handleGenerationCancel = async () => {
    try {
      await fetch(`http://localhost:5000/api/questions/cancel/${sessionId}`, {
        method: "DELETE"
      });
      navigate("/");
    } catch (error) {
      console.error("Error cancelling generation:", error);
    }
  };

  useEffect(() => {
    const startGeneration = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            ...settings
          })
        });

        if (!response.ok) {
          throw new Error("Не вдалося запустити генерацію");
        }
      } catch (error) {
        console.error("Error starting generation:", error);
        alert("Помилка запуску генерації");
        navigate("/settings");
      }
    };

    startGeneration();
  }, [sessionId, settings, navigate]);

  // Інтервал для оновлення прогресу
  useEffect(() => {
    intervalRef.current = setInterval(fetchProgress, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusText = () => {
    switch (status) {
      case "starting": return "Запуск генерації...";
      case "generating": return "Генерація питань...";
      case "paused": return "Генерація призупинена";
      case "completed": return "Генерація завершена";
      case "error": return "Помилка генерації";
      default: return "Генерація...";
    }
  };


  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Виконується генерація тестових запитань</h1>

        <div style={styles.summaryBox}>
          <h3>Обрані параметри:</h3>
          <p>Рівень складності: <b>{settings.difficulty || "Не вказано"}</b></p>
          <p>Одинарний вибір: {settings.singleChoice || 0}</p>
          <p>Множинний вибір: {settings.multipleChoice || 0}</p>
          <p>Правда / Неправда: {settings.trueFalse || 0}</p>
          <p>Коротка відповідь: {settings.shortAnswer || 0}</p>

          {settings.keywords?.length > 0 && (
            <div style={styles.keywordsBox}>
              <h4>Ключові слова:</h4>
              <div style={styles.keywordsList}>
                {settings.keywords.map((word, i) => (
                  <span key={i} style={styles.keywordItem}>{word}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Статус */}
        <div style={styles.statusText}>{getStatusText()}</div>

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
          <button 
            style={styles.button} 
            onClick={handlePauseResume}
            disabled={status === "completed" || status === "error"}
          >
            {isPaused ? "Продовжити" : "Пауза"}
          </button>
          <button 
            style={styles.buttonSecondary} 
            onClick={handleGenerationCancel}
            disabled={status === "completed"}
          >
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
    // height: "100vh",
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
  buttonSecondary: {
    background: "#3d3d3dff",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  summaryBox: {
    padding: "15px",
    borderRadius: "8px",
    width: "100%",
    textAlign: "left",
  },
  keywordsBox: {
    marginTop: "10px",
  },
  keywordsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  keywordItem: {
    border: "2px solid #ddd",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "14px",
  },
};

export default ProgressPage;
