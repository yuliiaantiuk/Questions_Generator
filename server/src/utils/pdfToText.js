import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

/**
 * Конвертує PDF-файл у текст
 * @param {string} filePath - шлях до PDF файлу
 * @returns {Promise<string>} - текст з PDF
 */
export async function pdfToText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));

  // Завантажуємо документ
  const loadingTask = pdfjsLib.getDocument({ 
    data,
    verbosity: pdfjsLib.VerbosityLevel.ERRORS,
    disableFontFace: true
  });

  const pdfDoc = await loadingTask.promise;
  let textContent = "";

  // Проходимо всі сторінки
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    textContent += strings.join(" ") + "\n";
  }

  return textContent;
}
