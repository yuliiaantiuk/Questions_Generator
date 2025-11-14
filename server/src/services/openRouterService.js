import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️  OpenRouter API key not found. Please set OPENROUTER_API_KEY in .env');
}

/**
 * Основна функція для виклику OpenRouter API
 */
export async function callOpenRouter(prompt, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const {
    maxTokens = 1000,
    temperature = 0.7,
    systemMessage = "Ти - AI-асистент для генерації тестових запитань. Завжди відповідай у валідному JSON форматі.",
    model = OPENROUTER_MODEL
  } = options;

  try {
    console.log(`🔄 Виклик OpenRouter API з моделлю: ${model}`);
    
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000', // Обов'язково для OpenRouter
          'X-Title': 'Test Questions Generator'
        },
        timeout: 60000 // 60 секунд таймаут
      }
    );

    console.log('✅ Успішний запит до OpenRouter API');
    
    const content = response.data.choices[0].message.content;
    
    // Спроба парсингу JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Помилка парсингу JSON від OpenRouter:', content);
      throw new Error(`Невалідний JSON відповідь: ${content.substring(0, 200)}`);
    }

  } catch (error) {
    console.error('❌ Помилка виклику OpenRouter API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Невірний API ключ OpenRouter');
    } else if (error.response?.status === 429) {
      throw new Error('Перевищено ліміт запитів до OpenRouter');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Таймаут підключення до OpenRouter');
    } else {
      throw new Error(`Помилка OpenRouter: ${error.response?.data?.error?.message || error.message}`);
    }
  }
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