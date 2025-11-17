import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const ResultPage = () => {
  const [text, setText] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // початковий формат
  const [includeAnswers, setIncludeAnswers] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const generatedData = location.state || {}; 
  // generatedData.questions — масив запитань, який передали з ProgressPage

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



const handleExport = (format) => {
  const content = generateExportContent(); // формуємо текст
  const blobOptions = { type: "text/plain;charset=utf-8" };

  let blob;
  let fileName = `questions.${format}`;

  switch (format) {
    case "txt":
      blob = new Blob([content], blobOptions);
      break;
    case "doc":
      blob = new Blob(
        [`<html><body><pre>${content}</pre></body></html>`],
        { type: "application/msword" }
      );
      break;
    case "html":
      blob = new Blob(
        [`<html><body><h2>Результат генерації</h2><pre>${content}</pre></body></html>`],
        { type: "text/html" }
      );
      break;
    case "pdf":
      // якщо pdf — використовуємо jsPDF
      import("jspdf").then(({ jsPDF }) => {
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
        doc.save("questions.pdf");
      });
      setShowExportModal(false);
      return;
    default:
      blob = new Blob([content], blobOptions);
  }

  // створюємо посилання для завантаження
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  setShowExportModal(false);
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

const handleSpeakAll = () => {
  const synth = window.speechSynthesis;
  
  // Скасувати всі поточні озвучення
  synth.cancel();

  // Чекаємо невелику затримку перед початком нового озвучення
  setTimeout(() => {
    // Отримуємо список доступних голосів
    const voices = synth.getVoices();
    
    // Шукаємо український голос або схожий
    const ukrainianVoice = voices.find(voice => 
      voice.lang.includes('uk') || 
      voice.lang.includes('UA') ||
      voice.name.toLowerCase().includes('ukrainian')
    );

    // Якщо українського голосу немає, шукаємо схожі східноєвропейські голоси
    const fallbackVoice = ukrainianVoice || 
      voices.find(voice => voice.lang.includes('ru')) || // російський
      voices.find(voice => voice.lang.includes('pl')) || // польський
      voices.find(voice => voice.lang.includes('cs'));   // чеський

    console.log('Доступні голоси:', voices);
    console.log('Обраний голос:', fallbackVoice);

    // Озвучуємо кожне питання з паузами
    generatedData.questions.forEach((q, index) => {
      setTimeout(() => {
        const utter = new SpeechSynthesisUtterance();
        
        // Обробляємо текст для кращого озвучення
        let textToSpeak = q.text
          .replace(/ChatGPT/gi, 'Чат Джи Пі Ті') // Англійські абревіатури
          .replace(/API/gi, 'А П І')
          .replace(/JavaScript/gi, 'Джава Скрипт')
          .replace(/OpenAI/gi, 'Опен А І')
          .replace(/GPT/gi, 'Джі Пі Ті')
          .replace(/HTML/gi, 'ХТ М Л')
          .replace(/CSS/gi, 'Сі Ес Ес');
        
        utter.text = textToSpeak;
        utter.lang = "uk-UA"; // Українська мова
        
        if (fallbackVoice) {
          utter.voice = fallbackVoice;
        }
        
        // Налаштування для кращої якості
        utter.rate = 0.9;   // Трохи повільніше
        utter.pitch = 1.0;  // Нормальна висота
        utter.volume = 1.0; // Максимальна гучність

        // Додаємо обробники подій для відладки
        utter.onstart = () => {
          console.log(`Початок озвучення питання ${index + 1}`);
        };
        
        utter.onend = () => {
          console.log(`Закінчення озвучення питання ${index + 1}`);
        };
        
        utter.onerror = (event) => {
          console.error(`Помилка озвучення питання ${index + 1}:`, event);
        };

        synth.speak(utter);
        
      }, index * 5000); // Пауза 5 секунд між питаннями
    });
  }, 100);
};

  // Виправити форматування тексту для експорту

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
          <button style={styles.button} onClick={handleSpeakAll}>Озвучити запитання</button>
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
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                /> Показувати правильні відповіді
              </label>
            </div>
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
