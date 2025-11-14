// test_groq.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testGroqAPI() {
  console.log("🔍 ТЕСТУВАННЯ GROQ API");
  console.log("======================");
  
  // Перевірка API ключа
  if (!process.env.GROQ_API_KEY) {
    console.log("❌ GROQ_API_KEY не знайдено в .env файлі");
    console.log("📝 Отримайте ключ: https://console.groq.com/keys");
    return;
  }

  console.log("✅ API ключ знайдено");
  console.log("   Перші 10 символів:", process.env.GROQ_API_KEY.substring(0, 10) + "...");

  try {
    console.log("\n📨 Тестовий запит до Groq API...");
    
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: "Скажи 'Привіт, Groq!' українською мовою."
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("✅ ЗАПИТ УСПІШНИЙ!");
    console.log("💬 Відповідь:", response.data.choices[0].message.content);

    // Тест генерації питання
    console.log("\n🎯 Тест генерації питання...");
    
    const questionResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system", 
            content: "Ти експерт з створення тестових питань. Повертай відповідь у JSON форматі."
          },
          {
            role: "user",
            content: `Створи просте тестове запитання про програмування українською мовою.
Поверни ТІЛЬКИ JSON:
{
  "text": "питання",
  "options": ["A", "B", "C", "D"],
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
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const questionText = questionResponse.data.choices[0].message.content;
    console.log("✅ ПИТАННЯ ЗГЕНЕРОВАНО!");
    console.log("📝 Відповідь:", questionText);

    // Парсинг JSON
    try {
      const jsonMatch = questionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ JSON РОЗПАРСЕНО!");
        console.log("📊 Питання:", parsed.text);
      }
    } catch (e) {
      console.log("⚠️ JSON не розпарсено, але API працює");
    }

  } catch (error) {
    console.log("❌ ПОМИЛКА:", error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log("🔑 Невірний API ключ");
    } else if (error.response?.status === 429) {
      console.log("📊 Ліміт запитів. Зачекайте кілька хвилин.");
    }
  }
}

testGroqAPI();