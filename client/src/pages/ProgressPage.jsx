import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const ProgressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = location.state || {};

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleGenerationCancel = () => {
    navigate("/");
  };

  // useEffect(() => {
  //   if (!isPaused) {
  //     intervalRef.current = setInterval(() => {
  //       setProgress((prev) => {
  //         if (prev >= 100) {
  //           clearInterval(intervalRef.current);
  //           setTimeout(() => navigate("/result"), 500);
  //           return 100;
  //         }
  //         return prev + 5;
  //       });
  //     }, 200);
  //   }

  //   return () => clearInterval(intervalRef.current);
  // }, [isPaused, navigate]);

  useEffect(() => {
    // Симуляція генерації
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);

            // Симулюємо отримання результатів із сервера (поки без бекенду)
            setTimeout(() => {
              const fakeResults = {
                questions: [
                  {
                    text: "Що таке ШІ?",
                    type: "shortAnswer",
                    answer: ""
                  },
                  {
                    text: "Які з наведених є мовами програмування?",
                    type: "multipleChoice",
                    options: ["Python", "HTML", "CSS", "Java"],
                    correctIndexes: [0,3]
                  },
                  {
                    text: "JavaScript є мовою програмування.",
                    type: "trueFalse",
                    correctAnswer: true
                  },
                ],
              };

              navigate("/result", { state: fakeResults });
            }, 500);

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
