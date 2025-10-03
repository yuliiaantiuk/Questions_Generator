// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ResultPage = () => {
//   const [text, setText] = useState("");
//   const navigate = useNavigate();


//   const handleExport = (e) => {
//     console.log("Експорт запитань розпочато!");
//   };

//   const handleRepeatGeneration = (e) => {
//     navigate("/settings");
//   };

//   return (
//     <div style={styles.contentWrapper}>
//       <div style={styles.container}>
//         <h1 style={styles.title}>Результат генерації:</h1>

//         <h3 style={styles.text}>Запитання з однією відповіддю:</h3>
//         <div style={styles.optionContainer}>
//             <div>
//                 <input type="radio" name="questionType" id="single-choice" />
//                 <label htmlFor="single-choice">Варіант 1</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="multiple-choice" />
//                 <label htmlFor="multiple-choice">Варіант 2</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="true-false" />
//                 <label htmlFor="true-false">Варіант 3</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="short-answer" />
//                 <label htmlFor="short-answer">Варіант 4</label>
//             </div>
//         </div>

//         <h3 style={styles.text}>Запитання з множинною відповіддю:</h3>
//         <div style={styles.optionContainer}>
//             <div>
//                 <input type="checkbox" name="questionType" id="single-choice" />
//                 <label htmlFor="single-choice">Варіант 1</label>
//             </div>
//             <div>
//                 <input type="checkbox" name="questionType" id="multiple-choice" />
//                 <label htmlFor="multiple-choice">Варіант 2</label>
//             </div>
//             <div>
//                 <input type="checkbox" name="questionType" id="true-false" />
//                 <label htmlFor="true-false">Варіант 3</label>
//             </div>
//             <div>
//                 <input type="checkbox" name="questionType" id="short-answer" />
//                 <label htmlFor="short-answer">Варіант 4</label>
//             </div>
//         </div>

//         <h3 style={styles.text}>Твердження:</h3>
//         <div style={styles.optionContainer}>
//             <div>
//                 <input type="radio" name="questionType" id="single-choice" />
//                 <label htmlFor="single-choice">Варіант 1</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="multiple-choice" />
//                 <label htmlFor="multiple-choice">Варіант 2</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="true-false" />
//                 <label htmlFor="true-false">Варіант 3</label>
//             </div>
//             <div>
//                 <input type="radio" name="questionType" id="short-answer" />
//                 <label htmlFor="short-answer">Варіант 4</label>
//             </div>
//         </div>

//         <h3 style={styles.text}>Коротка відповідь:</h3>
//         <textarea
//             placeholder="Напишіть текстом..."
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             style={styles.textarea}
//         />

//         <div className="buttons" style={styles.buttonContainer}>
//           <button style={styles.button} onClick={handleExport}>Експорт</button>
//           <button style={styles.button} onClick={handleRepeatGeneration}>Повторити генерацію</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   contentWrapper: {
//     padding: "0",
//     margin: "0",
//     width: "96vw",
//     boxSizing: "border-box",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   container: {
//     boxSizing: "border-box",
//     width: "500px",
//     margin: "0 auto",
//     minHeight: "400px",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "flex-start",
//     alignItems: "flex-start",
//     padding: "20px",
//     border: "2px dashed #ccc",
//     borderRadius: "8px",
//     padding: "30px"
//   },
//   title: {
//     marginBottom: "10px",
//     fontSize: "24px", 
//     fontWeight: "bold",
//   },
//   text: {
//     fontSize: "16px",
//   },
//   optionContainer: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
//     marginBottom: "20px",
//   },
//   textarea: {
//     boxSizing: "border-box",
//     maxWidth: "100%", 
//     minWidth: "100%", 
//     minHeight: "120px",
//     padding: "10px",
//     borderRadius: "6px",
//     border: "1px solid #ccc",
//     marginBottom: "20px",
//     background: "#222",  
//     color: "white",
//   },
//   buttonContainer: {
//     display: "flex",
//     flexDirection: "row",
//     gap: "12px",
//     width: "100%",
//   },
//   button: {
//     width: "100%",       
//     background: "black",
//     color: "white",
//     padding: "12px 20px",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//   },
// };


// export default ResultPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResultPage = () => {
  const [text, setText] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // початковий формат
  const navigate = useNavigate();

  const handleExport = (format) => {
    console.log(`Експорт запитань у формат ${format} розпочато!`);
    // Тут можна додати логіку для генерації та завантаження файлу
    setShowExportModal(false); // закриваємо модальне вікно після експорту
  };

  const handleRepeatGeneration = () => {
    navigate("/settings");
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Результат генерації:</h1>

        <h3 style={styles.text}>Запитання з однією відповіддю:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="radio" name="singleChoice" id="single-choice" />
            <label htmlFor="single-choice">Варіант 1</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" id="multiple-choice" />
            <label htmlFor="multiple-choice">Варіант 2</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" id="true-false" />
            <label htmlFor="true-false">Варіант 3</label>
          </div>
          <div>
            <input type="radio" name="singleChoice" id="short-answer" />
            <label htmlFor="short-answer">Варіант 4</label>
          </div>
        </div>

        <h3 style={styles.text}>Запитання з множинною відповіддю:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="checkbox" name="multiChoice1" id="single-choice-multi" />
            <label htmlFor="single-choice-multi">Варіант 1</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice2" id="multiple-choice-multi" />
            <label htmlFor="multiple-choice-multi">Варіант 2</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice3" id="true-false-multi" />
            <label htmlFor="true-false-multi">Варіант 3</label>
          </div>
          <div>
            <input type="checkbox" name="multiChoice4" id="short-answer-multi" />
            <label htmlFor="short-answer-multi">Варіант 4</label>
          </div>
        </div>

        <h3 style={styles.text}>Твердження:</h3>
        <div style={styles.optionContainer}>
          <div>
            <input type="radio" name="statements" id="statement1" />
            <label htmlFor="statement1">Варіант 1</label>
          </div>
          <div>
            <input type="radio" name="statements" id="statement2" />
            <label htmlFor="statement2">Варіант 2</label>
          </div>
          <div>
            <input type="radio" name="statements" id="statement3" />
            <label htmlFor="statement3">Варіант 3</label>
          </div>
          <div>
            <input type="radio" name="statements" id="statement4" />
            <label htmlFor="statement4">Варіант 4</label>
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
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={styles.button} onClick={() => handleExport(exportFormat)}>Експортувати</button>
              <button style={styles.button} onClick={() => setShowExportModal(false)}>Назад</button>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "400px",
    textAlign: "center",
  },
};

export default ResultPage;
