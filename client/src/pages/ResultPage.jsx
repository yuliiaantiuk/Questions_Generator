import React, { useState } from "react";

const ResultPage = () => {
  const [text, setText] = useState("");

  const handleExport = (e) => {
    console.log("Експорт запитань розпочато!");
  };

  const handleRepeatGeneration = (e) => {
    console.log("Повторну генерація запитань розпочато!");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Результат генерації:</h1>

        <h3 style={styles.text}>Запитання з однією відповіддю:</h3>
        <div style={styles.optionContainer}>
            <div>
                <input type="radio" name="questionType" id="single-choice" />
                <label htmlFor="single-choice">Варіант 1</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="multiple-choice" />
                <label htmlFor="multiple-choice">Варіант 2</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="true-false" />
                <label htmlFor="true-false">Варіант 3</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="short-answer" />
                <label htmlFor="short-answer">Варіант 4</label>
            </div>
        </div>

        <h3 style={styles.text}>Запитання з множинною відповіддю:</h3>
        <div style={styles.optionContainer}>
            <div>
                <input type="checkbox" name="questionType" id="single-choice" />
                <label htmlFor="single-choice">Варіант 1</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="multiple-choice" />
                <label htmlFor="multiple-choice">Варіант 2</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="true-false" />
                <label htmlFor="true-false">Варіант 3</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="short-answer" />
                <label htmlFor="short-answer">Варіант 4</label>
            </div>
        </div>

        <h3 style={styles.text}>Твердження:</h3>
        <div style={styles.optionContainer}>
            <div>
                <input type="radio" name="questionType" id="single-choice" />
                <label htmlFor="single-choice">Варіант 1</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="multiple-choice" />
                <label htmlFor="multiple-choice">Варіант 2</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="true-false" />
                <label htmlFor="true-false">Варіант 3</label>
            </div>
            <div>
                <input type="radio" name="questionType" id="short-answer" />
                <label htmlFor="short-answer">Варіант 4</label>
            </div>
        </div>

        <h3 style={styles.text}>Коротка відповідь:</h3>
        <textarea
            placeholder="Напишіть текстом..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
        />

        <div className="buttons" style={styles.buttonContainer}>
          <button style={styles.button} onClick={handleExport}>Експорт</button>
          <button style={styles.button} onClick={handleRepeatGeneration}>Повторити генерацію</button>
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
};


export default ResultPage;
