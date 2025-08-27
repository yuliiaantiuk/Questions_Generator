import React, { useState } from "react";

const ProgressPage = () => {
  const [text, setText] = useState("");

  const handleGenerationPause = (e) => {
    console.log("Генерація запитань призупинена!");
  };

  const handleGenerationCancel = (e) => {
    console.log("Генерація запитань скасована!");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Виконується генерація тестових запитань</h1>
        <div className="buttons" style={styles.buttonContainer}>
          <button style={styles.button} onClick={handleGenerationPause}>Пауза</button>
          <button style={styles.button} onClick={handleGenerationCancel}>Скасувати</button>
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
    padding: "20px",
    borderTop: "2px solid #ccc",
    borderBottom: "2px solid #ccc",
    padding: "30px"
  },
  title: {
    marginBottom: "10px",
    fontSize: "24px", 
    fontWeight: "bold",
    textAlign: "center"
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
};


export default ProgressPage;
