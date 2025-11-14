// // server/src/services/hfService.js
// import axios from "axios";
// import fs from "fs-extra";
// import path from "path";
// import dotenv from "dotenv";
// dotenv.config();

// const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
// const HF_BASE = "https://api-inference.huggingface.co/models";

// if (!HF_TOKEN) {
//   console.warn("HuggingFace token not set. Put HUGGINGFACE_API_TOKEN in .env");
// }

// async function callHFModel(model, payload, responseType = 'json') {
//   const url = `${HF_BASE}/${model}`;
//   const headers = {
//     Authorization: `Bearer ${HF_TOKEN}`,
//     Accept: responseType === 'arraybuffer' ? 'audio/mpeg' : 'application/json',
//   };

//   const res = await axios.post(url, payload, {
//     headers,
//     responseType: responseType === 'arraybuffer' ? 'arraybuffer' : 'json',
//     timeout: 120000,
//   });
//   return res.data;
// }

// export async function hfGenerateText(model, prompt, options = {}) {
//   // payload for many HF text models is { inputs: prompt, parameters: { ... } }
//   const payload = {
//     inputs: prompt,
//     parameters: {
//       max_new_tokens: options.maxTokens || 400,
//       temperature: options.temperature ?? 0.7,
//       // other params...
//     },
//   };

//   const data = await callHFModel(model, payload, 'json');
//   // response shape depends on model; many return plain text string or array
//   if (typeof data === "string") return data;
//   if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
//   if (data && data.generated_text) return data.generated_text;
//   // otherwise try to stringify
//   return JSON.stringify(data);
// }

// export async function hfTextToSpeech(model, text, outFilePath) {
//   // many HF TTS models accept {"inputs": text} and return audio bytes
//   const payload = { inputs: text };
//   const audioBuffer = await callHFModel(model, payload, 'arraybuffer');
//   // save buffer to file (mp3)
//   await fs.ensureDir(path.dirname(outFilePath));
//   await fs.writeFile(outFilePath, Buffer.from(audioBuffer));
//   return outFilePath;
// }

// server/src/services/hfService.js
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HF_BASE = "https://router.huggingface.co/hf-inference/models";

if (!HF_TOKEN) {
  console.warn("HuggingFace token not set. Put HUGGINGFACE_API_TOKEN in .env");
}

/**
 * Виклик моделі HF
 */
async function callHFModel(model, payload, responseType = "json") {
  const url = `${HF_BASE}/${model}`;
  const headers = {
    Authorization: `Bearer ${HF_TOKEN}`,
    Accept: responseType === "arraybuffer" ? "audio/mpeg" : "application/json",
  };

  const res = await axios.post(url, payload, {
    headers,
    responseType: responseType,
    timeout: 120000,
  });

  return res.data;
}

/**
 * Головна функція генерації тексту (з підтримкою JSON)
 */
export async function hfGenerateText(model, prompt, options = {}) {
  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens: options.maxTokens || 400,
      temperature: options.temperature ?? 0.7,
    },
  };

  let rawResponse = await callHFModel(model, payload, "json");

  // HF інколи повертає:
  // • рядок
  // • масив [{ generated_text: "..." }]
  // • об’єкт { generated_text: "..." }
  // • довільний текст
  let text;

  if (typeof rawResponse === "string") {
    text = rawResponse;
  } else if (Array.isArray(rawResponse)) {
    // HF LLM найчастіше повертає такий формат
    if (rawResponse[0]?.generated_text) {
      text = rawResponse[0].generated_text;
    } else {
      text = JSON.stringify(rawResponse);
    }
  } else if (rawResponse?.generated_text) {
    text = rawResponse.generated_text;
  } else {
    text = JSON.stringify(rawResponse);
  }

  // JSON-парсинг з обробкою помилок
  if (options.expectJson) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("❌ HF returned invalid JSON:", text);
      return {
        error: "Invalid JSON returned by model",
        raw: text,
      };
    }
  }

  return text;
}

/**
 * Текст → Мова (TTS)
 */
export async function hfTextToSpeech(model, text, outFilePath) {
  const payload = { inputs: text };
  const audioBuffer = await callHFModel(model, payload, "arraybuffer");

  await fs.ensureDir(path.dirname(outFilePath));
  await fs.writeFile(outFilePath, Buffer.from(audioBuffer));

  return outFilePath;
}
