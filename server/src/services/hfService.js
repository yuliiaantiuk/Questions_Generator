// server/src/services/hfService.js
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HF_BASE = "https://api-inference.huggingface.co/models";

if (!HF_TOKEN) {
  console.warn("HuggingFace token not set. Put HUGGINGFACE_API_TOKEN in .env");
}

async function callHFModel(model, payload, responseType = 'json') {
  const url = `${HF_BASE}/${model}`;
  const headers = {
    Authorization: `Bearer ${HF_TOKEN}`,
    Accept: responseType === 'arraybuffer' ? 'audio/mpeg' : 'application/json',
  };

  const res = await axios.post(url, payload, {
    headers,
    responseType: responseType === 'arraybuffer' ? 'arraybuffer' : 'json',
    timeout: 120000,
  });
  return res.data;
}

export async function hfGenerateText(model, prompt, options = {}) {
  // payload for many HF text models is { inputs: prompt, parameters: { ... } }
  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens: options.maxTokens || 400,
      temperature: options.temperature ?? 0.7,
      // other params...
    },
  };

  const data = await callHFModel(model, payload, 'json');
  // response shape depends on model; many return plain text string or array
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
  if (data && data.generated_text) return data.generated_text;
  // otherwise try to stringify
  return JSON.stringify(data);
}

export async function hfTextToSpeech(model, text, outFilePath) {
  // many HF TTS models accept {"inputs": text} and return audio bytes
  const payload = { inputs: text };
  const audioBuffer = await callHFModel(model, payload, 'arraybuffer');
  // save buffer to file (mp3)
  await fs.ensureDir(path.dirname(outFilePath));
  await fs.writeFile(outFilePath, Buffer.from(audioBuffer));
  return outFilePath;
}
