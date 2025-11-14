// test_gemini_fixed.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testGeminiFixed() {
  console.log("🔍 ОНОВЛЕНИЙ ТЕСТ GEMINI API");
  console.log("=============================");
  
  // Перевірка ключа
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.log("❌ GOOGLE_AI_API_KEY не знайдено");
    return;
  }

  console.log("✅ API ключ знайдено");
  console.log("📦 Версія пакету: перевіряємо...");

  try {
    // Створюємо об'єкт Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    
    console.log("🔄 Тестуємо нові моделі...");
    
    // НОВІ ПРАВИЛЬНІ НАЗВИ МОДЕЛЕЙ
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest", 
      "gemini-pro",
      "models/gemini-1.5-flash-latest"
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`\n   🧪 Тест моделі: ${modelName}`);
        
        // Використовуємо новий спосіб
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        });

        // Простий тестовий запит
        const prompt = "Скажи 'Привіт, Gemini!' українською мовою.";
        console.log("   📨 Відправляємо запит...");
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`   🎉 ${modelName} - ПРАЦЮЄ!`);
        console.log(`   💬 Відповідь: ${text}`);
        
        // Тестуємо генерацію питання
        console.log("\n   🎯 Тестуємо генерацію питання...");
        await testQuestionGeneration(genAI, modelName);
        return;
        
      } catch (modelError) {
        console.log(`   ❌ ${modelName} - помилка: ${modelError.message}`);
      }
    }
    
    console.log("\n❌ Жодна модель не працює.");
    console.log("📝 Можливі причини:");
    console.log("   • Потрібно оновити пакет: npm update @google/generative-ai");
    console.log("   • API ключ не має доступу до Gemini");
    console.log("   • Потрібно активувати білінг");
    
  } catch (error) {
    console.log("❌ Загальна помилка:", error.message);
  }
}

async function testQuestionGeneration(genAI, workingModel) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: workingModel,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const prompt = `Створи просте тестове запитання про JavaScript українською мовою.
Поверни відповідь у форматі JSON:
{
  "text": "текст питання",
  "options": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
  "correctIndex": 0,
  "explanation": "пояснення"
}`;

    console.log("   📨 Генеруємо питання...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("   ✅ Питання згенеровано!");
    console.log("   📝 Відповідь:", text);

    // Перевірка JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("   ✅ JSON успішно розпарсено!");
        console.log("   📊 Результат:", {
          text: parsed.text,
          options: parsed.options,
          correctIndex: parsed.correctIndex
        });
      }
    } catch (parseError) {
      console.log("   ⚠️ Не вдалось розпарсити JSON");
    }
    
  } catch (error) {
    console.log("   ❌ Помилка генерації:", error.message);
  }
}

// Запускаємо тест
testGeminiFixed();