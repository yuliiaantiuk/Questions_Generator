import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️  OpenRouter API key not found. Please set OPENROUTER_API_KEY in .env');
}

// Cache for generated questions to avoid duplicates
const questionCache = new Set();

// Generates a unique identifier for a question
function generateQuestionHash(questionText, questionType) {
  return `${questionType}_${questionText.substring(0, 50).replace(/\s+/g, '_')}`;
}

// Checks if a similar question has already been generated
function isQuestionUnique(questionText, questionType) {
  const hash = generateQuestionHash(questionText, questionType);
  if (questionCache.has(hash)) {
    console.log(`Skipping duplicate question: ${questionText.substring(0, 50)}...`);
    return false;
  }
  questionCache.add(hash);
  return true;
}

// Clears the question cache
export function clearQuestionCache() {
  questionCache.clear();
  console.log('Question cache cleared');
}

// Calls OpenRouter API to generate question
export async function callOpenRouter(prompt, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const {
    maxTokens = 800,
    temperature = 0.7,
    systemMessage = "Ти - AI-асистент для генерації тестових запитань. Завжди відповідай у валідному JSON форматі.",
    model = OPENROUTER_MODEL,
    uniqueCheck = true,
    questionType = "unknown"
  } = options;

  console.log(`Виклик OpenRouter API для ${questionType} (temperature: ${temperature})`);

  let responseText;

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Test Questions Generator"
        },
        timeout: 60000
      }
    );

    console.log("Отримано відповідь від OpenRouter");

    responseText = response.data?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("EMPTY_RESPONSE");
    }

  } catch (err) {
    console.error("❌ Помилка HTTP/API:", err.response?.data || err.message);

    if (err.response?.status === 401) throw new Error("INVALID_API_KEY");
    if (err.response?.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
    if (err.code === "ECONNABORTED") throw new Error("REQUEST_TIMEOUT");

    throw new Error(`OPENROUTER_REQUEST_FAILED: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.warn("⚠️ Невалідний JSON від моделі:", responseText);
    throw new Error("INVALID_JSON");
  }

  if (uniqueCheck && parsed.text) {
    if (!isQuestionUnique(parsed.text, questionType)) {
      throw new Error("DUPLICATE_QUESTION");
    }
  }

  return parsed;
}

// Helper function to check API availability
export async function checkOpenRouterAvailability() {
  try {
    const response = await axios.get(
      `${OPENROUTER_BASE_URL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        timeout: 10000
      }
    );
    
    console.log('✅ OpenRouter API доступне');
    return true;
  } catch (error) {
    console.error('❌ OpenRouter API недоступне:', error.response?.data || error.message);
    return false;
  }
}