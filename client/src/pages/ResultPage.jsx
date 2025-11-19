import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ttsClient } from "../services/ttsService";
import {
  exportTXT,
  exportDOC,
  exportHTML,
  exportPDF,
  exportPNGZip
} from "../services/exportService";


const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const generatedData = location.state || {}; 

  const [text, setText] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [exportProgress, setExportProgress] = useState({ percent: 0, message: "" });
  const [isExporting, setIsExporting] = useState(false);
  const speakingRef = React.useRef(false);

  const [speakingStates, setSpeakingStates] = useState(() =>
  generatedData.questions?.map(() => false)
  
);

  useEffect(() => {
  const sessionId = sessionStorage.getItem("sessionId");
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

const toggleSpeaking = async (index, question) => {
  const currentlySpeakingIndex = speakingStates.findIndex(s => s);

  // Якщо зараз йде озвучка саме цього питання
  if (currentlySpeakingIndex === index) {
    ttsClient.stopAll();
    speakingRef.current = false;
    setIsSpeaking(false);
    setSpeakingStates(Array(generatedData.questions.length).fill(false));
    return; // зупиняємо, нічого нового не запускаємо
  }

  // Якщо йде інше питання — зупиняємо його, але не виходимо
  if (currentlySpeakingIndex !== -1 || speakingRef.current) {
    ttsClient.stopAll();
    speakingRef.current = false;
    setIsSpeaking(false);
    setSpeakingStates(Array(generatedData.questions.length).fill(false));
  }

  // Вмикаємо озвучку для нового питання
  speakingRef.current = true;
  setIsSpeaking(true);
  setSpeakingStates(prev => {
    const updated = [...prev];
    updated.fill(false);
    updated[index] = true;
    return updated;
  });

  try {
    await ttsClient.speakQuestion(question);
  } finally {
    speakingRef.current = false;
    setIsSpeaking(false);
    setSpeakingStates(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  }
};


const handleSpeakAll = async () => {
  if (!generatedData.questions || generatedData.questions.length === 0) return;

  // Встановлюємо глобальний стан озвучення
  setIsSpeaking(true);
  speakingRef.current = true;

  // Спочатку вимикаємо всі кнопки
  setSpeakingStates(Array(generatedData.questions.length).fill(false));

  try {
    for (let i = 0; i < generatedData.questions.length; i++) {
      // Якщо користувач натиснув "стоп" — перериваємо цикл
      if (!speakingRef.current) break;

      // Підсвічуємо кнопку поточного питання
      setSpeakingStates(prev => {
        const updated = [...prev];
        updated.fill(false);
        updated[i] = true;
        return updated;
      });

      // Озвучуємо питання
      await ttsClient.speakQuestion(generatedData.questions[i]);

      // Після завершення вимикаємо кнопку
      setSpeakingStates(prev => {
        const updated = [...prev];
        updated[i] = false;
        return updated;
      });
    }
  } finally {
    // Після завершення всієї озвучки
    speakingRef.current = false;
    setIsSpeaking(false);
    setSpeakingStates(Array(generatedData.questions.length).fill(false));
  }
};

const handleStopSpeaking = () => {
  speakingRef.current = false;           // глобальний стан
  ttsClient.stopAll();                    // зупиняємо TTS
  setIsSpeaking(false);                   // оновлюємо кнопку зверху
  setSpeakingStates(Array(generatedData.questions.length).fill(false)); // вимикаємо всі індикатори
};

const handleExport = async (format) => {
  if (!generatedData.questions || generatedData.questions.length === 0) {
    alert("Немає запитань для експорту");
    return;
  }

  setIsExporting(true);
  setExportProgress({ percent: 0, message: "Починаю..." });

  const questions = generatedData.questions;
  try {
    if (format === "txt") {
      exportTXT(questions, includeAnswers, "questions.txt");
      setExportProgress({ percent: 100, message: "Готово" });
    } else if (format === "doc") {
      exportDOC(questions, includeAnswers, "questions.doc");
      setExportProgress({ percent: 100, message: "Готово" });
    } else if (format === "html") {
      exportHTML(questions, includeAnswers, "questions.html");
      setExportProgress({ percent: 100, message: "Готово" });
    } else if (format === "pdf") {
      await exportPDF(questions, includeAnswers, "questions.pdf", (p, m) => setExportProgress({ percent: p, message: m }));
    } else if (format === "png") {
      await exportPNGZip(questions, includeAnswers, "questions_images.zip", (p, m) => setExportProgress({ percent: p, message: m }));
    }
    setTimeout(() => {
      setExportProgress({ percent: 0, message: "" });
    }, 1200);
  } catch (err) {
    console.error("Export error:", err);
    alert("Помилка експорту: " + err.message);
    setExportProgress({ percent: 0, message: "" });
  } finally {
    setIsExporting(false);
    setShowExportModal(false);
  }
};


  const handleRepeatGeneration = () => {
    navigate("/settings");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <div style={styles.questionHeader}>
          <h1 style={styles.title}>Результат генерації:</h1>

          <button
            onClick={isSpeaking ? handleStopSpeaking : handleSpeakAll}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            {isSpeaking ? "⏹️" : "🔊"}
          </button>
        </div>

        {generatedData.questions?.map((q, index) => (
          <div key={index} style={styles.questionBlock}>
            <div style={styles.questionHeader}>
                <h3>Запитання {index + 1}:</h3>
                <button
                  style={{ marginLeft: "10px", padding: "4px 8px", cursor: "pointer" }}
                  onClick={() => toggleSpeaking(index, q)}
                >
                  {speakingStates[index] ? "⏹️ Стоп" : "🔊"}
                </button>
            </div>

            <p>{q.text}</p>

            {q.type === "singleChoice" && (
              <div style={styles.optionContainer}>
                {q.options.map((opt, i) => (
                  <div key={i}>
                    <input type="radio" disabled checked={i === q.correctIndex} />
                    <label>{opt}</label>
                  </div>
                ))}
              </div>
                )}

                {q.type === "multipleChoice" && (
                  <div style={styles.optionContainer}>
                    {q.options.map((opt, i) => (
                      <div key={i}>
                        <input type="checkbox" disabled checked={q.correctIndexes.includes(i)} />
                        <label>{opt}</label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "trueFalse" && (
                  <div style={styles.optionContainer}>
                    <div>
                      <input type="radio" disabled checked={q.correctAnswer === true} />
                      <label>Правда</label>
                    </div>
                    <div>
                      <input type="radio" disabled checked={q.correctAnswer === false} />
                      <label>Неправда</label>
                    </div>
                  </div>
                )}

                {q.type === "shortAnswer" && (
                  <textarea value={q.answer || ""} disabled style={styles.textarea} />
                )}
              </div>
            ))}


        <div className="buttons" style={styles.buttonContainer}>
          <button style={styles.button} onClick={() => setShowExportModal(true)}>Експорт</button>
          <button style={styles.buttonSecondary} onClick={handleRepeatGeneration}>Повторити генерацію</button>
        </div>
      </div>

      {/* Модальне вікно експорту */}
      {showExportModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Виберіть формат експорту</h2>
            <div style={styles.optionContainer}>
              <label>
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === "pdf"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> Документ PDF (.pdf)
              </label>
              <label>
                <input
                  type="radio"
                  value="doc"
                  checked={exportFormat === "doc"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> Документ Microsoft Word (.doc)
              </label>
              <label>
                <input
                  type="radio"
                  value="txt"
                  checked={exportFormat === "txt"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> Простий текст (.txt)
              </label>
              <label>
                <input
                  type="radio"
                  value="html"
                  checked={exportFormat === "html"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> Спрощений HTML-файл (.html)
              </label>
              <label>
                <input
                  type="radio"
                  value="png"
                  checked={exportFormat === "png"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> ZIP Архів файл .png
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  style={styles.showAnswersCheckbox}
                /> Показувати правильні відповіді
              </label>
            </div>
            {isExporting && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 10, width: "100%", background: "#333", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${exportProgress.percent}%`, background: "#0a0", borderRadius: 4 }} />
                </div>
                <div style={{ marginTop: 6, color: "#fff", fontSize: 12 }}>{exportProgress.message} ({exportProgress.percent}%)</div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={{ ...styles.button, ...styles.buttonWhiteOutline }} onClick={() => handleExport(exportFormat)}>Експортувати</button>
              <button style={{ ...styles.button, ...styles.buttonWhiteOutline }} onClick={() => setShowExportModal(false)}>Назад</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  contentWrapper: {
    padding: "0",
    margin: "0",
    width: "96vw",
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
    padding: "30px",
    border: "2px dashed #ccc",
    borderRadius: "8px",
  },
  title: {
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  text: {
    fontSize: "16px",
  },
  questionHeader:{
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    gap: "16px",
    alignItems: "center",
  },
  optionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  textarea: {
    boxSizing: "border-box",
    maxWidth: "100%",
    minWidth: "100%",
    minHeight: "30px",
    maxHeight: "30px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    background: "#222",
    color: "white",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "black",
    padding: "30px",
    borderRadius: "8px",
    width: "400px",
    textAlign: "left",
  },
  showAnswersCheckbox: {
    marginTop: "15px",
  },
  buttonWhiteOutline: {
    border: "2px solid white",
  },
  questionBlock: {
    width: "90%",
},

};

export default ResultPage;
