import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️  OpenRouter API key not found. Please set OPENROUTER_API_KEY in .env');
}

// Кеш для уникнення дублювання питань
const questionCache = new Set();

/**
 * Генерує унікальний ідентифікатор для питання
 */
function generateQuestionHash(questionText, questionType) {
  return `${questionType}_${questionText.substring(0, 50).replace(/\s+/g, '_')}`;
}

/**
 * Перевіряє, чи не було вже згенеровано схоже питання
 */
function isQuestionUnique(questionText, questionType) {
  const hash = generateQuestionHash(questionText, questionType);
  if (questionCache.has(hash)) {
    console.log(`🔄 Пропускаємо дубльоване питання: ${questionText.substring(0, 50)}...`);
    return false;
  }
  questionCache.add(hash);
  return true;
}

/**
 * Очищає кеш питань
 */
export function clearQuestionCache() {
  questionCache.clear();
  console.log('🧹 Кеш питань очищено');
}

/**
 * Основна функція для виклику OpenRouter API з покращеними промптами
 */
// export async function callOpenRouter(prompt, options = {}) {
//   if (!OPENROUTER_API_KEY) {
//     throw new Error('OpenRouter API key not configured');
//   }

//   const {
//     maxTokens = 800,
//     temperature = 0.7,
//     systemMessage = "Ти - AI-асистент для генерації тестових запитань. Завжди відповідай у валідному JSON форматі. Створюй різноманітні питання, що охоплюють різні аспекти тексту.",
//     model = OPENROUTER_MODEL,
//     uniqueCheck = true,
//     questionType = 'unknown'
//   } = options;

//   try {
//     console.log(`🔄 Виклик OpenRouter API для ${questionType} (temperature: ${temperature})`);
    
//     const response = await axios.post(
//       `${OPENROUTER_BASE_URL}/chat/completions`,
//       {
//         model: model,
//         messages: [
//           {
//             role: "system",
//             content: systemMessage + " Створюй унікальні питання, що не повторюються. Зосередься на різних частинах тексту та аспектах теми."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         max_tokens: maxTokens,
//         temperature: temperature,
//         response_format: { type: "json_object" }
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
//           'Content-Type': 'application/json',
//           'HTTP-Referer': 'http://localhost:5000',
//           'X-Title': 'Test Questions Generator'
//         },
//         timeout: 60000
//       }
//     );

//     console.log('✅ Успішний запит до OpenRouter API');
    
//     const content = response.data.choices[0].message.content;
    
//     try {
//       // const safeContent = content
//       // .replace(/(\r\n|\n|\r)/gm, "\\n") 
//       // .replace(/\\?"/g, '\\"');

//       // const parsedResponse = JSON.parse(safeContent);

//       const parsedResponse = JSON.parse(content);
      
//       // Перевірка унікальності питання
//       if (uniqueCheck && parsedResponse.text) {
//         if (!isQuestionUnique(parsedResponse.text, questionType)) {
//           throw new Error('DUPLICATE_QUESTION');
//         }
//       }
      
//       return parsedResponse;
//     } catch (parseError) {
//       if (parseError.message === 'DUPLICATE_QUESTION') {
//         throw parseError;
//       }
//       console.error('❌ Помилка парсингу JSON від OpenRouter:', content);
//       throw new Error(`Невалідний JSON відповідь: ${content.substring(0, 200)}`);
//     }

//   } catch (error) {
//     console.error('❌ Помилка виклику OpenRouter API:', error.response?.data || error.message);
    
//     if (error.message === 'DUPLICATE_QUESTION') {
//       throw error; // Перекидаємо далі для обробки
//     } else if (error.response?.status === 401) {
//       throw new Error('Невірний API ключ OpenRouter');
//     } else if (error.response?.status === 429) {
//       throw new Error('Перевищено ліміт запитів до OpenRouter');
//     } else if (error.code === 'ECONNABORTED') {
//       throw new Error('Таймаут підключення до OpenRouter');
//     } else {
//       throw new Error(`Помилка OpenRouter: ${error.response?.data?.error?.message || error.message}`);
//     }
//   }
// }

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

  console.log(`🔄 Виклик OpenRouter API для ${questionType} (temperature: ${temperature})`);

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


/**
 * Допоміжна функція для перевірки доступності API
 */
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