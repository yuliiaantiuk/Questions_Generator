import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Формує текстовий варіант з урахуванням includeAnswers
 */
export function generatePlainText(questions = [], includeAnswers = true) {
  let out = "Результат генерації запитань:\n\n";
  questions.forEach((q, idx) => {
    out += `Запитання ${idx + 1} (${q.type}):\n`;
    out += `${q.text}\n`;
    if (q.type === "singleChoice" || q.type === "multipleChoice") {
      q.options.forEach((opt, i) => {
        const isCorrect = (q.type === "singleChoice" && q.correctIndex === i)
                        || (q.type === "multipleChoice" && Array.isArray(q.correctIndexes) && q.correctIndexes.includes(i));
        const mark = includeAnswers && isCorrect ? "✔ " : "  ";
        out += `${mark}${opt}\n`;
      });
    } else if (q.type === "trueFalse") {
      const trueMark = includeAnswers && q.correctAnswer === true ? "✔ " : "  ";
      const falseMark = includeAnswers && q.correctAnswer === false ? "✔ " : "  ";
      out += `${trueMark}Правда\n${falseMark}Неправда\n`;
    } else if (q.type === "shortAnswer") {
        if (includeAnswers){
            out += `Відповідь: ${q.expectedAnswer ?? q.answer ?? "—"}\n`;
        }
    }
    out += "\n";
  });
  return out;
}

function uint8ToBase64(uint8) {
  const CHUNK_SIZE = 0x8000; 
  let index = 0;
  let result = '';
  let slice;
  while (index < uint8.length) {
    slice = uint8.subarray(index, Math.min(index + CHUNK_SIZE, uint8.length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

/**
 * Генерує простий HTML 
 */
export function generateHTML(questions = [], includeAnswers = true) {
  const escape = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Questions</title>
  <style>
    body{font-family: Arial, sans-serif; color:#111; padding:12px}
    .q{margin-bottom:18px; padding:8px; border-bottom:1px solid #ddd}
    .q h3{margin:0 0 6px 0}
    .opt{margin-left:14px}
    .correct{font-weight:700; color: #0a0}
  </style>
  </head><body>`;
  html += `<h1>Результат генерації</h1>`;
  questions.forEach((q, idx) => {
    html += `<div class="q"><h3>Запитання ${idx + 1} — (${escape(q.type)})</h3>`;
    html += `<div>${escape(q.text)}</div>`;
    if (q.type === "singleChoice" || q.type === "multipleChoice") {
      html += `<div>`;
      q.options.forEach((opt, i) => {
        const isCorrect = (q.type === "singleChoice" && q.correctIndex === i)
                        || (q.type === "multipleChoice" && Array.isArray(q.correctIndexes) && q.correctIndexes.includes(i));
        const cls = includeAnswers && isCorrect ? "correct" : "";
        const mark = includeAnswers && isCorrect ? "✔ " : "";
        html += `<div class="opt ${cls}">${mark}${escape(opt)}</div>`;
      });
      html += `</div>`;
    } else if (q.type === "trueFalse") {
      const trueCls = includeAnswers && q.correctAnswer === true ? "correct" : "";
      const falseCls = includeAnswers && q.correctAnswer === false ? "correct" : "";
      const trueMark = includeAnswers && q.correctAnswer === true ? "✔ " : "";
      const falseMark = includeAnswers && q.correctAnswer === false ? "✔ " : "";
      html += `<div class="opt ${trueCls}">${trueMark}Правда</div>`;
      html += `<div class="opt ${falseCls}">${falseMark}Неправда</div>`;
    } else if (q.type === "shortAnswer") {
      if (includeAnswers) {
        html += `<div class="opt correct">Відповідь: ${escape(q.expectedAnswer ?? q.answer ?? "—")}</div>`;
      }
    }
    html += `</div>`;
  });
  html += `</body></html>`;
  return html;
}

/**
 * Export TXT
 */
export function exportTXT(questions, includeAnswers, filename = "questions.txt") {
  const content = generatePlainText(questions, includeAnswers);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

/**
 * Export DOC (MS Word) 
 */
export function exportDOC(questions, includeAnswers, filename = "questions.doc") {
  const html = generateHTML(questions, includeAnswers);
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  saveAs(blob, filename);
}

/**
 * Export HTML
 */
export function exportHTML(questions, includeAnswers, filename = "questions.html") {
  const html = generateHTML(questions, includeAnswers);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, filename);
}

/**
 * Export PDF using jsPDF (посторінково, простий алгоритм).
 * onProgress(percent, message) — опціональний колбек
 */
export async function exportPDF(questions, includeAnswers, filename = "questions.pdf", onProgress = () => {}) {
  onProgress(5, "Формую PDF...");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;
  let y = 40;
  const lineHeight = 14;
  const fontSize = 12;
  doc.setFontSize(fontSize);

  const fontResponse = await fetch("/fonts/Roboto-Regular.ttf");
  const fontBuffer = await fontResponse.arrayBuffer();
  const fontBase64 = uint8ToBase64(new Uint8Array(fontBuffer));

  doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto"); // кирилиця тепер відображається

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    onProgress(Math.round(5 + (i / questions.length) * 85), `Додаю питання ${i + 1} з ${questions.length}...`);

    const header = `Запитання ${i + 1} (${q.type}):`;
    const textLines = doc.splitTextToSize(q.text, usableWidth);

    if (y + textLines.length * lineHeight > pageHeight - 60) {
      doc.addPage();
      y = 40;
    }
    doc.text(header, margin, y);
    y += lineHeight + 2;
    doc.text(textLines, margin, y);
    y += textLines.length * lineHeight + 6;

    if (q.type === "singleChoice" || q.type === "multipleChoice") {
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        const isCorrect = (q.type === "singleChoice" && q.correctIndex === j)
                        || (q.type === "multipleChoice" && Array.isArray(q.correctIndexes) && q.correctIndexes.includes(j));
        const prefix = (includeAnswers && isCorrect) ? "+ " : "-  ";
        const lines = doc.splitTextToSize(prefix + opt, usableWidth);
        if (y + lines.length * lineHeight > pageHeight - 60) {
          doc.addPage();
          y = 40;
        }
        doc.text(lines, margin + 8, y);
        y += lines.length * lineHeight + 8;
      }
    } else if (q.type === "trueFalse") {
      const trueMark = includeAnswers && q.correctAnswer === true ? "+ " : "-  ";
      const falseMark = includeAnswers && q.correctAnswer === false ? "+ " : "- ";
      const t1 = doc.splitTextToSize(trueMark + "Правда", usableWidth);
      const t2 = doc.splitTextToSize(falseMark + "Неправда", usableWidth);
      if (y + (t1.length + t2.length) * lineHeight > pageHeight - 60) {
        doc.addPage(); y = 40;
      }
      doc.text(t1, margin + 8, y); y += t1.length * lineHeight;
      doc.text(t2, margin + 8, y); y += t2.length * lineHeight;
    } else if (q.type === "shortAnswer") {
      if (includeAnswers) { 
            const ans = q.expectedAnswer ?? q.answer ?? "—";
            const lines = doc.splitTextToSize("Відповідь: " + ans, usableWidth);
            if (y + lines.length * lineHeight > pageHeight - 60) {
            doc.addPage();
            y = 40;
            }
            doc.text(lines, margin + 8, y);
            y += lines.length * lineHeight;
        }
    }

    y += 8;
    if (y > pageHeight - 80) { doc.addPage(); y = 40; }
  }

  onProgress(95, "Генерую PDF...");
  const arrayBuffer = doc.output("arraybuffer");
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  saveAs(blob, filename);
  onProgress(100, "Готово");
}


/**
 * Export PNG ZIP: для кожного питання створюємо картинку (використовуючи html2canvas)
 * onProgress(percent, message)
 */
export async function exportPNGZip(questions = [], includeAnswers = true, filename = "questions_images.zip", onProgress = () => {}) {
  onProgress(2, "Починаю збір зображень...");
  const zip = new JSZip();

  // Для зручності ми створюємо оффскрін контейнер
  const offscreen = document.createElement("div");
  offscreen.style.position = "fixed";
  offscreen.style.left = "-9999px";
  offscreen.style.top = "0";
  offscreen.style.width = "800px";
  offscreen.style.padding = "12px";
  document.body.appendChild(offscreen);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    onProgress(Math.round(2 + (i / questions.length) * 90), `Рендер питання ${i + 1} з ${questions.length}...`);

    // Створюємо DOM елемент з питанням
    const wrapper = document.createElement("div");
    wrapper.style.width = "760px";
    wrapper.style.padding = "16px";
    wrapper.style.background = "white";
    wrapper.style.border = "1px solid #ddd";
    wrapper.style.boxSizing = "border-box";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.color = "#111";

    const h = document.createElement("h3");
    h.textContent = `Запитання ${i + 1}`;
    wrapper.appendChild(h);

    const p = document.createElement("div");
    p.textContent = q.text;
    p.style.marginBottom = "8px";
    wrapper.appendChild(p);

    if (q.type === "singleChoice" || q.type === "multipleChoice") {
      q.options.forEach((opt, j) => {
        const div = document.createElement("div");
        div.textContent = (includeAnswers && ((q.type === "singleChoice" && q.correctIndex === j) || (q.type === "multipleChoice" && Array.isArray(q.correctIndexes) && q.correctIndexes.includes(j)))) ? `✔ ${opt}` : `- ${opt}`;
        wrapper.appendChild(div);
      });
    } else if (q.type === "trueFalse") {
      const tdiv = document.createElement("div");
      tdiv.textContent = (includeAnswers && q.correctAnswer === true) ? "✔ Правда" : "- Правда";
      wrapper.appendChild(tdiv);
      const fdiv = document.createElement("div");
      fdiv.textContent = (includeAnswers && q.correctAnswer === false) ? "✔ Неправда" : "- Неправда";
      wrapper.appendChild(fdiv);
    } else if (q.type === "shortAnswer") {
      const sdiv = document.createElement("div");
      if (includeAnswers) {
        sdiv.textContent = `Відповідь: ${q.expectedAnswer ?? q.answer ?? "—"}`;
      }
      wrapper.appendChild(sdiv);
    }

    offscreen.appendChild(wrapper);

    // робимо скрін
    // опції html2canvas — підвищують якість
    // чекаємо рендер
    // eslint-disable-next-line no-await-in-loop
    const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: "#ffffff" });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    zip.file(`question_${i + 1}.png`, blob);

    // очищаємо wrapper
    offscreen.removeChild(wrapper);
  }

  document.body.removeChild(offscreen);

  onProgress(95, "Формую ZIP архів...");
  const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
    const percent = 95 + Math.round(metadata.percent / 100 * 5);
    onProgress(percent, `Архівування ${Math.round(metadata.percent)}%`);
  });

  saveAs(content, filename);
  onProgress(100, "Готово");
}
