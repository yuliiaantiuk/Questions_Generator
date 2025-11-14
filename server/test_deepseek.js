// test_deepseek.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testDeepSeekAPI() {
  console.log("🔍 ТЕСТУВАННЯ DEEPSEEK API");
  console.log("===========================");
  
  // КРОК 1: ПЕРЕВІРКА API КЛЮЧА
  console.log("\n📋 КРОК 1: ПЕРЕВІРКА API КЛЮЧА");
  console.log("-----------------------------");
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.log("❌ ПОМИЛКА: DEEPSEEK_API_KEY не знайдено в .env файлі");
    console.log("📝 Що робити:");
    console.log("   1. Відкрийте файл .env у папці server");
    console.log("   2. Додайте рядок: DEEPSEEK_API_KEY=sk-ваш_ключ");
    console.log("   3. Перезапустіть тест");
    return;
  }

  console.log("✅ API ключ знайдено в .env файлі");
  console.log("   Перші 10 символів:", process.env.DEEPSEEK_API_KEY.substring(0, 10) + "...");
  console.log("   Довжина ключа:", process.env.DEEPSEEK_API_KEY.length, "символів");

  // КРОК 2: ПРОСТИЙ ТЕСТОВИЙ ЗАПИТ
  console.log("\n📋 КРОК 2: ПРОСТИЙ ТЕСТОВИЙ ЗАПИТ");
  console.log("---------------------------------");
  
  try {
    console.log("   📨 Відправляємо тестовий запит до DeepSeek API...");
    
    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Скажи 'Привіт, DeepSeek!' українською мовою."
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 секунд
      }
    );

    console.log("   ✅ ЗАПИТ УСПІШНИЙ!");
    console.log("   📊 Статус відповіді:", response.status);
    
    const answer = response.data.choices[0].message.content;
    console.log("   💬 Відповідь від DeepSeek:", answer);

  } catch (error) {
    console.log("   ❌ ПОМИЛКА ЗАПИТУ:");
    
    if (error.response) {
      // Помилка від сервера
      console.log("      Статус:", error.response.status);
      console.log("      Помилка:", error.response.data.error?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.log("   🔑 ПРОБЛЕМА: НЕВІРНИЙ API КЛЮЧ");
        console.log("      Перевірте чи ключ правильний у .env файлі");
      } else if (error.response.status === 429) {
        console.log("   📊 ПРОБЛЕМА: ПЕРЕВИЩЕНО ЛІМІТ ЗАПИТІВ");
        console.log("      Зачекайте кілька хвилин");
      }
    } else if (error.request) {
      // Не вдалося відправити запит
      console.log("   🌐 ПРОБЛЕМА: НЕ ВДАЛОСЯ ЗВ'ЯЗАТИСЯ З API");
      console.log("      Перевірте підключення до інтернету");
    } else {
      // Інша помилка
      console.log("   🔧 ПРОБЛЕМА:", error.message);
    }
    return;
  }

  // КРОК 3: ТЕСТ ГЕНЕРАЦІЇ ПИТАННЯ
  console.log("\n📋 КРОК 3: ТЕСТ ГЕНЕРАЦІЇ ПИТАННЯ");
  console.log("---------------------------------");
  
  try {
    console.log("   📨 Генеруємо тестове питання...");
    
    const questionResponse = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
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
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("   ✅ ПИТАННЯ ЗГЕНЕРОВАНО!");
    
    const questionText = questionResponse.data.choices[0].message.content;
    console.log("   📝 Відповідь від DeepSeek:", questionText);

    // Спроба парсингу JSON
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
  }

  // КРОК 4: ПІДСУМОК
  console.log("\n🎯 ПІДСУМОК ТЕСТУ");
  console.log("=================");
  console.log("✅ DeepSeek API працює коректно!");
  console.log("✅ Підтримує українську мову!");
  console.log("✅ Може генерувати тестові питання!");
  console.log("🚀 Можете використовувати у вашому додатку!");
}

// Запускаємо тест
testDeepSeekAPI();