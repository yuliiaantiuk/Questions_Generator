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
  setSpeakingStates(prev => {
    const updated = [...prev];

    // якщо кнопка вже активна — зупиняємо
    if (updated[index]) {
      ttsClient.stopAll();
      updated[index] = false;
      return updated;
    }

    // вимикаємо всі інші
    updated.fill(false);
    updated[index] = true;

    return updated;
  });

  try {
    await ttsClient.speakQuestion(question);
  } finally {
    // після завершення озвучення — вимикаємо кнопку
    setSpeakingStates(prev => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  }
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

//   const handleSpeakAll = () => {
//   const synth = window.speechSynthesis;
//   synth.cancel(); // скасувати попереднє озвучення

//   generatedData.questions.forEach((q) => {
//     const utter = new SpeechSynthesisUtterance(q.text);
//     utter.lang = "uk-UA"; // українська мова
//     synth.speak(utter);
//   });
// };

  const handleSpeakAll = async () => {
      if (!generatedData.questions || generatedData.questions.length === 0) {
        alert('Немає запитань для озвучення');
        return;
      }

      setIsSpeaking(true);
      console.log('🎯 Starting SERVER TTS playback');

      try {
        await ttsClient.speakAllQuestions(generatedData.questions);
        console.log('✅ SERVER TTS playback completed successfully');
      } catch (error) {
        console.error('❌ SERVER TTS failed:', error);
        alert('Помилка озвучення: ' + error.message);
      } finally {
        setIsSpeaking(false);
      }
    };


  const handleStopSpeaking = () => {
    console.log('⏹️ User requested stop');
    ttsClient.stopAll();
    setIsSpeaking(false);
  };


  const generateExportContent = () => {
    let content = "Результат генерації запитань:\n\n";

    content += "Запитання з однією відповіддю:\n";
    content += includeAnswers
      ? "✔ Варіант 1 (правильна відповідь)\nВаріант 2\nВаріант 3\nВаріант 4\n\n"
      : "Варіант 1\nВаріант 2\nВаріант 3\nВаріант 4\n\n";

    content += "Запитання з множинною відповіддю:\n";
    content += includeAnswers
      ? "✔ Варіант 1 (правильна)\n✔ Варіант 2 (правильна)\nВаріант 3\nВаріант 4\n\n"
      : "Варіант 1\nВаріант 2\nВаріант 3\nВаріант 4\n\n";

    content += "Твердження:\n";
    content += includeAnswers
      ? "✔ Правда (правильна відповідь)\nНеправда\n\n"
      : "Правда\nНеправда\n\n";

    content += "Коротка відповідь:\n";
    content += "Твоя відповідь: " + (text || "—") + "\n\n";

    return content;
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Результат генерації:</h1>

        {generatedData.questions?.map((q, index) => (
          <div key={index} style={styles.questionBlock}>
            <h3>Запитання {index + 1}:</h3>
            <button
              style={{ marginLeft: "10px", padding: "4px 8px", cursor: "pointer" }}
              onClick={() => toggleSpeaking(index, q)}
            >
              {speakingStates[index] ? "⏹️ Стоп" : "🔊"}
            </button>

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
          <button style={styles.button} onClick={handleRepeatGeneration}>Повторити генерацію</button>
          {/* <button 
            style={styles.button} 
            onClick={isSpeaking ? handleStopSpeaking : handleSpeakAll}
          >
            {isSpeaking ? 'Зупинити озвучення' : 'Озвучити запитання'}
          </button> */}
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
    minHeight: "120px",
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
  buttonWhiteOutline: {
    border: "2px solid white",
  },
  questionBlock: {
    width: "90%",
},

};

export default ResultPage;
