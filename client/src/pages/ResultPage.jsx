import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResultPage = () => {
  const [text, setText] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // початковий формат
  const [includeAnswers, setIncludeAnswers] = useState(true);

  const navigate = useNavigate();

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

  // Виправити форматування тексту для експорту

  const generateExportContent = () => {
    let content = "Результат генерації запитань:\n\n";

    content += "=== Запитання з однією відповіддю ===\n";
    content += includeAnswers
      ? "✔ Варіант 1 (правильна відповідь)\nВаріант 2\nВаріант 3\nВаріант 4\n\n"
      : "Варіант 1\nВаріант 2\nВаріант 3\nВаріант 4\n\n";

    content += "=== Запитання з множинною відповіддю ===\n";
    content += includeAnswers
      ? "✔ Варіант 1 (правильна)\n✔ Варіант 2 (правильна)\nВаріант 3\nВаріант 4\n\n"
      : "Варіант 1\nВаріант 2\nВаріант 3\nВаріант 4\n\n";

    content += "=== Твердження ===\n";
    content += includeAnswers
      ? "✔ Правда (правильна відповідь)\nНеправда\n\n"
      : "Правда\nНеправда\n\n";

    content += "=== Коротка відповідь ===\n";
    content += "Твоя відповідь: " + (text || "—") + "\n\n";

    return content;
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Результат генерації:</h1>

        <h3 style={styles.text}>Запитання з однією відповіддю:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="radio" name="singleChoice" disabled checked/>
            <label htmlFor="single-choice">Варіант 1</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" disabled />
            <label htmlFor="multiple-choice">Варіант 2</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" disabled />
            <label htmlFor="true-false">Варіант 3</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" disabled />
            <label htmlFor="short-answer">Варіант 4</label>
          </div>
        </div>

        <h3 style={styles.text}>Запитання з множинною відповіддю:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="checkbox" name="multiChoice1" disabled checked/>
            <label htmlFor="single-choice-multi">Варіант 1</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice2" disabled checked/>
            <label htmlFor="multiple-choice-multi">Варіант 2</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice3" disabled/>
            <label htmlFor="true-false-multi">Варіант 3</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice4" disabled/>
            <label htmlFor="short-answer-multi">Варіант 4</label>
          </div>
        </div>

        <h3 style={styles.text}>Твердження:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="radio" name="statements" disabled checked/>
            <label htmlFor="statement1">Правда</label>
          </div>
          <div>
            <input type="radio" name="statements" id="statement2" disabled/>
            <label htmlFor="statement2">Неправда</label>
          </div>
        </div>

        <h3 style={styles.text}>Коротка відповідь:</h3>
        <textarea
          placeholder="Напишіть текстом..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
          disabled
        />

        <div className="buttons" style={styles.buttonContainer}>
          <button style={styles.button} onClick={() => setShowExportModal(true)}>Експорт</button>
          <button style={styles.button} onClick={handleRepeatGeneration}>Повторити генерацію</button>
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
                /> PDF
              </label>
              <label>
                <input
                  type="radio"
                  value="doc"
                  checked={exportFormat === "doc"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> DOC
              </label>
              <label>
                <input
                  type="radio"
                  value="txt"
                  checked={exportFormat === "txt"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> TXT
              </label>
              <label>
                <input
                  type="radio"
                  value="html"
                  checked={exportFormat === "html"}
                  onChange={(e) => setExportFormat(e.target.value)}
                /> HTML
              </label>
              <label>
                <input
                  type="checkbox"
                  value="html"
                  checked
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
};

export default ResultPage;
