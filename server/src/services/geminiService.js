import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function generateQuestionsWithGemini(config, onProgress, shouldStop) {
  const {
    singleChoice,
    multipleChoice,
    trueFalse,
    shortAnswer,
    difficulty,
    keywords,
    filePath
  } = config;

  // Читаємо текст з файлу
  const textContent = fs.readFileSync(filePath, "utf8");
  const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
  let generatedQuestions = [];
  let completed = 0;

  // Ініціалізуємо модель Gemini
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  
  // Спробуємо різні моделі
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  let workingModel = null;
  
  // Знаходимо працюючу модель
  for (const modelName of modelsToTry) {
    try {
      console.log(`🔍 Перевірка моделі: ${modelName}`);
      const testModel = genAI.getGenerativeModel({ model: modelName });
      await testModel.generateContent("Тест");
      workingModel = modelName;
      console.log(`✅ Використовуємо модель: ${workingModel}`);
      break;
    } catch (error) {
      console.log(`❌ ${modelName} не працює: ${error.message}`);
    }
  }
  
  if (!workingModel) {
    throw new Error("Жодна модель Gemini не доступна. Перевірте API ключ.");
  }

  const model = genAI.getGenerativeModel({ 
    model: workingModel,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  });

  console.log("Початок генерації питань з Google Gemini...");

  // Генерація питань з однією правильною відповіддю
  for (let i = 0; i < singleChoice; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateSingleChoiceQuestion(model, textContent, difficulty, keywords, i);
      generatedQuestions.push(question);
      console.log(`✅ Згенеровано singleChoice питання ${i + 1}/${singleChoice}`);
    } catch (error) {
      console.error(`❌ Помилка генерації singleChoice питання ${i + 1}:`, error);
      throw error;
    }
    
    completed++;
    onProgress(Math.round((completed / totalQuestions) * 100));
    await delay(1000); // Затримка між запитами
  }

  // Генерація питань з множинним вибором
  for (let i = 0; i < multipleChoice; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateMultipleChoiceQuestion(model, textContent, difficulty, keywords, i);
      generatedQuestions.push(question);
      console.log(`✅ Згенеровано multipleChoice питання ${i + 1}/${multipleChoice}`);
    } catch (error) {
      console.error(`❌ Помилка генерації multipleChoice питання ${i + 1}:`, error);
      throw error;
    }
    
    completed++;
    onProgress(Math.round((completed / totalQuestions) * 100));
    await delay(1000);
  }

  // Генерація True/False питань
  for (let i = 0; i < trueFalse; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateTrueFalseQuestion(model, textContent, difficulty, keywords, i);
      generatedQuestions.push(question);
      console.log(`✅ Згенеровано trueFalse питання ${i + 1}/${trueFalse}`);
    } catch (error) {
      console.error(`❌ Помилка генерації trueFalse питання ${i + 1}:`, error);
      throw error;
    }
    
    completed++;
    onProgress(Math.round((completed / totalQuestions) * 100));
    await delay(1000);
  }

  // Генерація питань з короткою відповіддю
  for (let i = 0; i < shortAnswer; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateShortAnswerQuestion(model, textContent, difficulty, keywords, i);
      generatedQuestions.push(question);
      console.log(`✅ Згенеровано shortAnswer питання ${i + 1}/${shortAnswer}`);
    } catch (error) {
      console.error(`❌ Помилка генерації shortAnswer питання ${i + 1}:`, error);
      throw error;
    }
    
    completed++;
    onProgress(Math.round((completed / totalQuestions) * 100));
    await delay(1000);
  }

  console.log(`🎉 Генерація завершена! Створено ${generatedQuestions.length} питань`);
  return generatedQuestions;
}

// Функції генерації різних типів питань
async function generateSingleChoiceQuestion(model, text, difficulty, keywords, index) {
  const prompt = `
ТИП ЗАВДАННЯ: Створення тестового питання з однією правильною відповіддю

ТЕКСТ ДЛЯ АНАЛІЗУ:
"""
${text.substring(0, 1500)}
"""

КЛЮЧОВІ КОНЦЕПЦІЇ: ${keywords.join(", ")}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty}
НОМЕР ПИТАННЯ: ${index + 1}

ІНСТРУКЦІЇ:
1. Створіть чітке та зрозуміле питання на основі наданого тексту
2. Запропонуйте 4 варіанти відповідей (A, B, C, D)
3. Лише ОДИН варіант має бути правильним
4. Варіанти мають бути правдоподібними та відповідати рівню складності
5. Надайте пояснення чому обрана відповідь є правильною

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "Текст питання",
  "options": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
  "correctIndex": 0,
  "explanation": "Детальне пояснення правильної відповіді"
}

ВАЖЛИВО: Поверніть лише JSON без додаткового тексту!
  `;

  const response = await callGeminiAPI(model, prompt);
  return parseQuestionResponse(response, "singleChoice");
}

async function generateMultipleChoiceQuestion(model, text, difficulty, keywords, index) {
  const prompt = `
ТИП ЗАВДАННЯ: Створення питання з множинним вибором (кілька правильних відповідей)

ТЕКСТ ДЛЯ АНАЛІЗУ:
"""
${text.substring(0, 1500)}
"""

КЛЮЧОВІ КОНЦЕПЦІЇ: ${keywords.join(", ")}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty}
НОМЕР ПИТАННЯ: ${index + 1}

ІНСТРУКЦІЇ:
1. Створіть питання, де може бути кілька правильних відповідей
2. Запропонуйте 4 варіанти відповідей
3. Вкажіть 2-3 правильні варіанти
4. Варіанти мають бути логічними та пов'язаними з текстом
5. Надайте пояснення для правильних відповідей

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "Текст питання",
  "options": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
  "correctIndexes": [0, 2],
  "explanation": "Пояснення правильних відповідей"
}

ВАЖЛИВО: Поверніть лише JSON без додаткового тексту!
  `;

  const response = await callGeminiAPI(model, prompt);
  return parseQuestionResponse(response, "multipleChoice");
}

async function generateTrueFalseQuestion(model, text, difficulty, keywords, index) {
  const prompt = `
ТИП ЗАВДАННЯ: Створення твердження для перевірки істинності

ТЕКСТ ДЛЯ АНАЛІЗУ:
"""
${text.substring(0, 1500)}
"""

КЛЮЧОВІ КОНЦЕПЦІЇ: ${keywords.join(", ")}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty}
НОМЕР ПИТАННЯ: ${index + 1}

ІНСТРУКЦІЇ:
1. Створіть чітке твердження на основі тексту
2. Твердження має бути або правдою, або неправдою
3. Вкажіть правильну відповідь (true/false)
4. Надайте детальне пояснення

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "Твердження для оцінки",
  "correctAnswer": true,
  "explanation": "Детальне пояснення чому це правда/неправда"
}

ВАЖЛИВО: Поверніть лише JSON без додаткового тексту!
  `;

  const response = await callGeminiAPI(model, prompt);
  return parseQuestionResponse(response, "trueFalse");
}

async function generateShortAnswerQuestion(model, text, difficulty, keywords, index) {
  const prompt = `
ТИП ЗАВДАННЯ: Створення питання з короткою відповіддю

ТЕКСТ ДЛЯ АНАЛІЗУ:
"""
${text.substring(0, 1500)}
"""

КЛЮЧОВІ КОНЦЕПЦІЇ: ${keywords.join(", ")}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty}
НОМЕР ПИТАННЯ: ${index + 1}

ІНСТРУКЦІЇ:
1. Створіть питання, що вимагає розгорнутої, але короткої відповіді
2. Вкажіть очікувану правильну відповідь
3. Надайте пояснення та контекст

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "Текст питання",
  "expectedAnswer": "Очікувана правильна відповідь",
  "explanation": "Пояснення та додатковий контекст"
}

ВАЖЛИВО: Поверніть лише JSON без додаткового тексту!
  `;

  const response = await callGeminiAPI(model, prompt);
  return parseQuestionResponse(response, "shortAnswer");
}

// Основна функція виклику Gemini API
async function callGeminiAPI(model, prompt) {
  try {
    console.log("📨 Відправка запиту до Gemini API...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response.text()) {
      throw new Error("Пуста відповідь від Gemini API");
    }
    
    console.log("✅ Отримано відповідь від Gemini API");
    return response.text();
    
  } catch (error) {
    console.error("❌ Помилка виклику Gemini API:", error);
    
    // Детальна інформація про помилку
    if (error.message.includes("API_KEY_INVALID")) {
      throw new Error("Невірний Google AI API ключ. Перевірте .env файл.");
    } else if (error.message.includes("QUOTA_EXCEEDED")) {
      throw new Error("Перевищено квоту Google AI API. Спробуйте пізніше.");
    } else if (error.message.includes("SAFETY")) {
      throw new Error("Помилка безпеки контенту. Спробуйте змінити текст.");
    } else {
      throw new Error(`Помилка Gemini API: ${error.message}`);
    }
  }
}

// Функція парсингу відповіді
function parseQuestionResponse(response, type) {
  try {
    console.log("🔍 Парсинг відповіді від Gemini...");
    
    // Видаляємо всі символи до першої { і після останньої }
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON не знайдено у відповіді");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Додаємо тип питання
    parsed.type = type;
    
    console.log(`✅ Успішно розпарсено ${type} питання`);
    return parsed;
    
  } catch (error) {
    console.error("❌ Помилка парсингу відповіді:", error);
    console.log("Відповідь для дебагу:", response);
    
    // Fallback - створюємо просте питання
    return createFallbackQuestion(type);
  }
}

// Fallback функція на випадок помилок
function createFallbackQuestion(type) {
  const baseQuestion = {
    text: "Питання на основі наданого тексту (створено автоматично)",
    explanation: "Це питання було створено автоматично через тимчасову недоступність AI-сервісу"
  };

  switch (type) {
    case "singleChoice":
      return {
        ...baseQuestion,
        type: "singleChoice",
        options: ["Правильна відповідь", "Неправильна відповідь", "Неправильна відповідь", "Неправильна відповідь"],
        correctIndex: 0
      };
    case "multipleChoice":
      return {
        ...baseQuestion,
        type: "multipleChoice",
        options: ["Правильна відповідь 1", "Правильна відповідь 2", "Неправильна відповідь", "Правильна відповідь 3"],
        correctIndexes: [0, 1, 3]
      };
    case "trueFalse":
      return {
        ...baseQuestion,
        type: "trueFalse",
        correctAnswer: true
      };
    case "shortAnswer":
      return {
        ...baseQuestion,
        type: "shortAnswer",
        expectedAnswer: "Відповідь має бути на основі наданого тексту"
      };
    default:
      return baseQuestion;
  }
}

// Допоміжна функція затримки
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Експорт для тестування
export { callGeminiAPI, parseQuestionResponse };