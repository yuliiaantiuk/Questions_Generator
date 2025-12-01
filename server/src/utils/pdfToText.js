import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

// Converts PDF file to text
export async function pdfToText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));

  // Loading document
  const loadingTask = pdfjsLib.getDocument({ 
    data,
    verbosity: pdfjsLib.VerbosityLevel.ERRORS,
    disableFontFace: true
  });

  const pdfDoc = await loadingTask.promise;
  let textContent = "";

  // Iterating through all pages
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    textContent += strings.join(" ") + "\n";
  }

  return textContent;
}
