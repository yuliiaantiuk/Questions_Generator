import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const allowedFormats = [".txt", ".doc", ".docx", ".pdf"];

  const isFileValid = (fileName) => {
    return allowedFormats.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && isFileValid(uploadedFile.name)) {
      setFile(uploadedFile);
      setText("");
    } else {
      alert("Будь ласка, завантажте файл формату .txt, .doc, .docx або .pdf");
      e.target.value = ""; // очищаємо input
      setFile(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };


  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (newText.trim().length > 0) {
      setFile(null); // очищаємо файл, якщо користувач почав вводити текст
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const isButtonEnabled = (file && isFileValid(file.name)) || wordCount >= 500;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/settings");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Завантажте або вставте теоретичні відомості</h1>

        <div style={styles.hintContainer}>
          <button
            style={styles.hintButton}
            onClick={() => setShowHint((prev) => !prev)}
          >
            Інструкція
            <span style={styles.arrow}>{showHint ? "▲" : "▼"}</span>
          </button>
          {showHint && (
            <div style={styles.hintBox}>
              Вхідні дані повинні бути представлені як файли в форматі
              <b> .pdf, .doc або .txt</b> або як простий текст українською або
              англійською мовою <b>від 500 до 1&nbsp;000&nbsp;000 слів</b>.
              Підтримується лише текстова інформація без вкладених зображень,
              мультимедіа, таблиць чи інших складних форматів.
            </div>
          )}

          {file && (
          <div style={styles.fileInfo}>
            <span>
              Завантажено файл {file.name}
            </span>
            <button
              onClick={handleRemoveFile}
              style={styles.dangerButton}
            >
              Видалити
            </button>
          </div>
        )}
        </div>

        {text.trim().length > 0 && (
          <p style={styles.disabledHint}>
            Завантаження файлу недоступне, оскільки ви ввели текст вручну
          </p>
        )}

        {!!file && (
          <p style={styles.disabledHint}>
            Ви можете завантажити тільки один файл
          </p>
        )}

        <label style={styles.uploadBox}>
          <input
            type="file"
            accept=".txt,.doc,.docx,.pdf"
            onChange={handleFileUpload}
            disabled={text.trim().length > 0 || !!file}
            style={{ display: "none" }}
          />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "60px" }}>☁️</span>
            <p>Завантажте файл</p>
          </div>
        </label>

        <p>або</p>

        {file && (
        <p style={styles.disabledHint}>
          Поле введення тексту недоступне, оскільки ви завантажили файл
          </p>
        )}

        <textarea
          placeholder="Напишіть текстом..."
          value={text}
          onChange={handleTextChange}
          disabled={!!file}
          style={styles.textarea}
        />

      <button
        onClick={handleSubmit}
        disabled={!isButtonEnabled}
        className={`px-6 py-3 rounded font-semibold transition ${
          isButtonEnabled
            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-gray-600 cursor-not-allowed"
        }`}
      >
        Перейти до налаштування параметрів
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
  },
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    height: "94%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
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
  uploadBox: {
    boxSizing: "border-box",
    display: "block",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "30px 0px",
    cursor: "pointer",
    marginBottom: "15px",
    width: "100%",
  },
  fileInfo: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#ccc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "8px",
    borderRadius: "6px",
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
  button: {
    width: "100%",
    background: "black",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  disabledHint: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
    // backgroundColor: "#ccc",
    // padding: "8px",
    borderRadius: "6px",
    // color: "#333",
    color: "#ccc",
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    color: "white",
  },
};

export default UploadPage;
