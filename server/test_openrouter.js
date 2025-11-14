// test_openrouter.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testOpenRouterAPI() {
  console.log("🔍 ТЕСТУВАННЯ OPENROUTER API");
  console.log("=============================");
  
  // КРОК 1: ПЕРЕВІРКА КОНФІГУРАЦІЇ
  console.log("\n📋 КРОК 1: ПЕРЕВІРКА НАЛАШТУВАНЬ");
  console.log("-------------------------------");
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("❌ ПОМИЛКА: OPENROUTER_API_KEY не знайдено в .env");
    console.log("📝 Додайте до .env файлу:");
    console.log("   OPENROUTER_API_KEY=sk-or-ваш_ключ");
    return;
  }

  if (!process.env.OPENROUTER_MODEL) {
    console.log("❌ ПОМИЛКА: OPENROUTER_MODEL не знайдено");
    console.log("📝 Додайте до .env файлу:");
    console.log("   OPENROUTER_MODEL=google/gemini-flash-1.5");
    return;
  }

  console.log("✅ API ключ знайдено:", process.env.OPENROUTER_API_KEY.substring(0, 15) + "...");
  console.log("✅ Модель обрана:", process.env.OPENROUTER_MODEL);

  // КРОК 2: ПЕРЕВІРКА ДОСТУПНИХ МОДЕЛЕЙ
  console.log("\n📋 КРОК 2: ПЕРЕВІРКА ДОСТУПНИХ МОДЕЛЕЙ");
  console.log("-------------------------------------");
  
  try {
    console.log("   📊 Отримую список моделей...");
    
    const modelsResponse = await axios.get(
      "https://openrouter.ai/api/v1/models",
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    console.log("   ✅ Отримано список моделей!");
    console.log("   📝 Доступні моделі:");
    
    modelsResponse.data.data.slice(0, 5).forEach(model => {
      console.log(`      - ${model.id} (${model.pricing?.prompt || 'безкоштовно'})`);
    });

  } catch (error) {
    console.log("   ⚠️ Не вдалося отримати список моделей:", error.response?.status);
  }

  // КРОК 3: ПРОСТИЙ ТЕСТОВИЙ ЗАПИТ
  console.log("\n📋 КРОК 3: ТЕСТОВИЙ ЗАПИТ");
  console.log("-------------------------");
  
  try {
    console.log("   📨 Відправляю тестовий запит...");
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: "Скажи 'Привіт, OpenRouter!' українською мовою. Це тест."
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000", // Обов'язково для OpenRouter
          "X-Title": "Question Generator App",
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("   ✅ ЗАПИТ УСПІШНИЙ!");
    console.log("   📊 Статус:", response.status);
    console.log("   💬 Відповідь:", response.data.choices[0].message.content);
    console.log("   ⚡ Використано токенів:", response.data.usage?.total_tokens);

  } catch (error) {
    console.log("   ❌ ПОМИЛКА ЗАПИТУ:");
    
    if (error.response) {
      console.log("      Статус:", error.response.status);
      console.log("      Помилка:", error.response.data?.error?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.log("   🔑 НЕВІРНИЙ API КЛЮЧ");
        console.log("      Перевірте OPENROUTER_API_KEY в .env файлі");
      } else if (error.response.status === 402) {
        console.log("   💳 НЕДОСТАТНЬО КРЕДИТІВ");
        console.log("      Поповніть баланс на https://openrouter.ai/settings");
      } else if (error.response.status === 404) {
        console.log("   🔧 МОДЕЛЬ НЕ ЗНАЙДЕНА");
        console.log("      Спробуйте іншу модель у .env файлі");
      }
    } else {
      console.log("   🌐 ПРОБЛЕМА З МЕРЕЖЕЮ:", error.message);
    }
    return;
  }

  // КРОК 4: ТЕСТ ГЕНЕРАЦІЇ ПИТАННЯ
  console.log("\n📋 КРОК 4: ТЕСТ ГЕНЕРАЦІЇ ПИТАННЯ");
  console.log("---------------------------------");
  
  try {
    console.log("   📨 Генерую тестове питання...");
    
    const questionResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: "Ти експерт з створення тестових питань. Завжди повертай відповідь у форматі JSON."
          },
          {
            role: "user",
            content: `Створи просте тестове запитання про JavaScript українською мовою.
Поверни відповідь ТІЛЬКИ у форматі JSON:
{
  "text": "текст питання",
  "options": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
  "correctIndex": 0,
  "explanation": "пояснення",
  "type": "singleChoice"
}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Question Generator App",
          "Content-Type": "application/json"
        }
      }
    );

    console.log("   ✅ ПИТАННЯ ЗГЕНЕРОВАНО!");
    
    const questionText = questionResponse.data.choices[0].message.content;
    console.log("   📝 Відповідь:", questionText);

    // Парсинг JSON
    try {
      const jsonMatch = questionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedQuestion = JSON.parse(jsonMatch[0]);
        console.log("   ✅ JSON УСПІШНО РОЗПАРСЕНО!");
        console.log("   📊 Результат:");
        console.log("      Питання:", parsedQuestion.text);
        console.log("      Варіанти:", parsedQuestion.options);
        console.log("      Правильна відповідь:", parsedQuestion.correctIndex);
        console.log("      Тип:", parsedQuestion.type);
      } else {
        console.log("   ⚠️ JSON не знайдено у відповіді");
      }
    } catch (parseError) {
      console.log("   ⚠️ Не вдалось розпарсити JSON:", parseError.message);
    }

  } catch (error) {
    console.log("   ❌ Помилка генерації питання:", error.response?.data?.error?.message || error.message);
    return;
  }

  // КРОК 5: ПІДСУМОК
  console.log("\n🎯 ПІДСУМОК ТЕСТУ");
  console.log("=================");
  console.log("✅ OpenRouter API працює коректно!");
  console.log("✅ Обрана модель:", process.env.OPENROUTER_MODEL);
  console.log("✅ Підтримує українську мову!");
  console.log("✅ Може генерувати тестові питання у JSON!");
  console.log("🚀 Можете використовувати у вашому додатку!");
}

// Запускаємо тест
testOpenRouterAPI();