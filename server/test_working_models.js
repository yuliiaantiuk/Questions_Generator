// test_working_models.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// МОДЕЛІ, ЩО ТОЧНО ПРАЦЮЮТЬ
const WORKING_MODELS = [
  "microsoft/DialoGPT-small",     // Маленька та швидка
  "distilgpt2",                   // Дуже легка модель
  "gpt2",                         // Базова GPT-2
  "facebook/blenderbot-400M-distill",
  "microsoft/DialoGPT-medium"     // Спробуємо ще раз
];

async function testWorkingModels() {
  console.log("🧪 Тестування робочих моделей...");
  
  for (const model of WORKING_MODELS) {
    try {
      console.log(`\n🔍 Перевірка: ${model}`);
      
      // Тестуємо через Inference API
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: "Привіт, тест",
          parameters: {
            max_new_tokens: 10,
            temperature: 0.7
          }
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );
      
      console.log(`✅ ${model} - ПРАЦЮЄ!`);
      console.log("Відповідь:", response.data);
      
    } catch (error) {
      console.log(`❌ ${model} - помилка:`, error.response?.status, error.response?.data?.error || error.message);
    }
  }
}

testWorkingModels();