// server/src/services/textExtractor.js
import fs from "fs-extra";
import path from "path";
import mammoth from "mammoth";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


export async function extractTextFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return fs.readFile(filePath, "utf8");
  }

  if (ext === ".pdf") {
    const data = await fs.readFile(filePath);
    const parsed = await pdfParse(data);
    return parsed.text;
  }

  if (ext === ".docx" || ext === ".doc") {
    // mammoth працює з docx (doc — можливо потрібно конвертувати)
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type for text extraction: " + ext);
}
