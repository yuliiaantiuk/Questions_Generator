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
    <div style={styles.contentWrapper}>
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
    fontSize: "24px", // щоб заголовок не був занадто величезним
    fontWeight: "bold",
  },
  uploadBox: {
    boxSizing: "border-box",
    display: "block",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "30px 0px",
    cursor: "pointer",
    marginBottom: "15px",
    width: "100%",       // займає всю ширину контейнера
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
    background: "#222",  // щоб виглядало краще на темному фоні
    color: "white",
  },
  button: {
    width: "100%",       // кнопка на всю ширину
    background: "black",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};


export default UploadPage;
