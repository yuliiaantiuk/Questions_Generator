import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleGenerationStart = (e) => {
    navigate("/progress");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Налаштуйте потрібні параметри:</h1>
        <h3 style={styles.text}>Тип запитань:</h3>
        <div style={styles.optionContainer}>
            <div>
                <input type="checkbox" name="questionType" id="single-choice" />
                <label htmlFor="single-choice">Одинарний вибір</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="multiple-choice" />
                <label htmlFor="multiple-choice">Множинний вибір</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="true-false" />
                <label htmlFor="true-false">Правда/Неправда</label>
            </div>
            <div>
                <input type="checkbox" name="questionType" id="short-answer" />
                <label htmlFor="short-answer">Коротка відповідь</label>
            </div>
        </div>
        <div style={styles.quantityContainer}>
            <div>
                <label>Кількість запитань типу <span><b>Одинарний вибір</b></span>:</label>
                <input type="number" />
            </div>
            <div>
                <label>Кількість запитань типу <span><b>Множинний вибір</b></span>:</label>
                <input type="number" />
            </div>
        </div>
        <div style={styles.quantityCount}>Кількість запитань всього (автоматичний розрахунок): <b><u>0</u></b></div>
        <button style={styles.button} onClick={handleGenerationStart}>
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
  quantityContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
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
};


export default SettingsPage;
