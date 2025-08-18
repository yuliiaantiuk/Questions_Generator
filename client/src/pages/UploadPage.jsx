import React, { useState } from "react";

const UploadPage = () => {
  const [text, setText] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Файл завантажено:", file.name);
    }
  };

  const handleSubmit = () => {
    console.log("Текст:", text);
    // тут згодом буде перехід на сторінку налаштувань
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Завантажте або вставте теоретичні відомості</h1>

      <label style={styles.uploadBox}>
        <input
          type="file"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "40px" }}>☁️</span>
          <p>Завантажте файл</p>
        </div>
      </label>

      <p>або</p>

      <textarea
        placeholder="Напишіть текстом..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.textarea}
      />

      <button style={styles.button} onClick={handleSubmit}>
        Перейти до налаштування параметрів
      </button>
    </div>
  );
};

const styles = {
  container: { maxWidth: "500px", margin: "50px auto", textAlign: "center" },
  title: { marginBottom: "20px" },
  uploadBox: {
    display: "block",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "30px",
    cursor: "pointer",
    marginBottom: "15px",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  button: {
    background: "black",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default UploadPage;
