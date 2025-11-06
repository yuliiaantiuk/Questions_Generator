import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const navigate = useNavigate();
  const [singleChoice, setSingleChoice] = useState(0);
  const [multipleChoice, setMultipleChoice] = useState(0);
  const [trueFalse, setTrueFalse] = useState(0);
  const [shortAnswer, setShortAnswer] = useState(0);
  const [difficulty, setDifficulty] = useState("medium"); 
  const [keywords, setKeywords] = useState([]);
  const [showKeywords, setShowKeywords] = useState(false);



  const totalQuestions =
    (Number(singleChoice) || 0) +
    (Number(multipleChoice) || 0) +
    (Number(trueFalse) || 0) +
    (Number(shortAnswer) || 0);


  const isButtonDisabled = totalQuestions === 0;

useEffect(() => {
  const sessionId = localStorage.getItem("sessionId");
  if (!sessionId) return;

  const ping = () => {
    fetch(`http://localhost:5000/api/session/ping/${sessionId}`, {
      method: "POST"
    }).catch(() => {});
  };

  // пінг кожні 5 хвилин
  const interval = setInterval(ping, 5 * 60 * 1000);

  // очищення при закритті вкладки
  window.addEventListener("beforeunload", ping);

  return () => {
    clearInterval(interval);
    window.removeEventListener("beforeunload", ping);
  };
}, []);


const handleGenerationStart = () => {
  navigate("/progress", {
    state: {
      singleChoice,
      multipleChoice,
      trueFalse,
      shortAnswer,
      difficulty,
      keywords,
    },
  });
};


  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Налаштуйте потрібні параметри:</h1>

        <button
            style={styles.hintButton}
            onClick={() => setShowHint((prev) => !prev)}
          >
            Інструкція
            <span style={styles.arrow}>{showHint ? "▲" : "▼"}</span>
        </button>

        {showHint && (
            <div style={styles.hintBox}>
              Вкажіть кількість запитань кожного типу для генерації (<b>1 - 10</b>). Якщо ви не хочете генерувати запитання певного типу, введіть <b>0</b> або залиште відповідне поле пустим.
              <br />
              Загальна кількість запитань розраховується автоматично.
            </div>
        )}
        <h3 style={styles.text}>Тип запитань:</h3>
        <div style={styles.quantityContainer}>
            <div>
                <label>Кількість запитань типу <span><b>Одинарний вибір</b></span>:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={singleChoice === "" ? "" : singleChoice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setSingleChoice("");
                      return;
                    }
                    const numValue = Math.max(0, Math.min(10, Number(value)));
                    setSingleChoice(numValue);
                  }}
                  style={styles.quantityInput}
                />


            </div>
            <div>
                <label>Кількість запитань типу <span><b>Множинний вибір</b></span>:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={multipleChoice === "" ? "" : multipleChoice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setMultipleChoice("");
                      return;
                    }
                    const numValue = Math.max(0, Math.min(10, Number(value)));
                    setMultipleChoice(numValue);
                  }}
                  style={styles.quantityInput}
                />
            </div>
            <div>
                <label>Кількість запитань типу <span><b>Правда/Неправда</b></span>:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={trueFalse === "" ? "" : trueFalse}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setTrueFalse("");
                      return;
                    }
                    const numValue = Math.max(0, Math.min(10, Number(value)));
                    setTrueFalse(numValue);
                  }}
                  style={styles.quantityInput}
                />
            </div>
            <div>
                <label>Кількість запитань типу <span><b>Коротка відповідь</b></span>:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={shortAnswer === "" ? "" : shortAnswer}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setShortAnswer("");
                      return;
                    }
                    const numValue = Math.max(0, Math.min(10, Number(value)));
                    setShortAnswer(numValue);
                  }}
                  style={styles.quantityInput}
                />
            </div>
        </div>
        <div style={styles.quantityCount}>
          Кількість запитань всього (автоматичний розрахунок): <b><u>{totalQuestions}</u></b>
        </div>

        <h3 style={styles.text}>Рівень складності:</h3>
        <div style={styles.difficultyContainer}>
          <label>
            <input
              type="radio"
              name="difficulty"
              value="easy"
              checked={difficulty === "easy"}
              onChange={() => setDifficulty("easy")}
            />
            Простий
          </label>
          <label>
            <input
              type="radio"
              name="difficulty"
              value="medium"
              checked={difficulty === "medium"}
              onChange={() => setDifficulty("medium")}
            />
            Середній
          </label>
          <label>
            <input
              type="radio"
              name="difficulty"
              value="hard"
              checked={difficulty === "hard"}
              onChange={() => setDifficulty("hard")}
            />
            Складний
          </label>
        </div>

        {showKeywords ? (
        <div style={styles.keywordsBox}>
          <h3>Ключові слова:</h3>
          {keywords.length === 0 ? (
            <p>Ключові слова ще не згенеровані.</p>
          ) : (
            <div style={styles.keywordsList}>
              {keywords.map((word, index) => (
                <div key={index} style={styles.keywordItem}>
                  <span>{word}</span>
                  <button
                    style={styles.removeKeywordButton}
                    onClick={() =>
                      setKeywords((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <button style={styles.buttonSecondary} onClick={() => setShowKeywords(false)}>
            Приховати
          </button>
        </div>
      ) : (
        <button style={styles.buttonSecondary} onClick={() => {
          // Імітація генерації ключових слів (поки бекенд не готовий)
          setKeywords(["освіта", "навчання", "піфагор", "математика", "інтелект"]);
          setShowKeywords(true);
        }}>
          Показати ключові слова
        </button>
      )}



        <button
          style={{
            ...styles.button,
            opacity: isButtonDisabled ? 0.5 : 1,
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
          disabled={isButtonDisabled}
          onClick={handleGenerationStart}
        >
          Почати генерацію
        </button>

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
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: "20px",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "30px"
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px", 
    fontWeight: "bold",
  },
  text: {
    fontSize: "16px",
  },
    hintContainer: {
    width: "100%",
    marginBottom: "15px",
    textAlign: "left",
  },
  hintButton: {
    background: "none",
    border: "none",
    color: "#ccc",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
    width: "100%",
    border: "1px solid #ccc",
  },
  arrow: {
    marginLeft: "6px",
    fontSize: "12px",
  },
  hintBox: {
    background: "#ccc",
    borderRadius: "6px",
    padding: "12px",
    marginTop: "8px",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#333",
  },
  quantityContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  quantityInput:{
    padding: "6px",
    width: "100%",
    marginTop: "10px",
  },
  quantityCount:{
    marginBottom: "20px",
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
  difficultyContainer: {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: "20px",
  },
  keywordsBox: {
    // width: "100%",
    border: "2px solid #f0f0f0",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "20px",
  },
  keywordsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "10px",
  },
  keywordItem: {
    border: "2px solid #ddd",
    padding: "6px 10px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  removeKeywordButton: {
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
    fontWeight: "bold",
  },
  buttonSecondary: {
    background: "#3d3d3dff",
    color: "white",
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    marginBottom: "10px",
  },

};


export default SettingsPage;
