// // // import axios from "axios";
// // // import fs from "fs";
// // // import dotenv from "dotenv";
// // // dotenv.config();

// // // const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
// // // const HF_API_URL = "https://router.huggingface.co/hf-inference/models";

// // // // Моделі для різних типів питань (можна налаштувати)
// // // // const MODELS = {
// // // //   questionGeneration: "microsoft/DialoGPT-medium",
// // // //   multipleChoice: "microsoft/DialoGPT-medium", 
// // // //   trueFalse: "microsoft/DialoGPT-medium",
// // // //   shortAnswer: "microsoft/DialoGPT-medium"
// // // // };

// // // const MODELS = {
// // //   questionGeneration: "google/flan-t5-large",
// // //   multipleChoice: "google/flan-t5-large", 
// // //   trueFalse: "google/flan-t5-large",
// // //   shortAnswer: "google/flan-t5-large"
// // // };

// // // export async function hfGenerateQuestions(config, onProgress, shouldStop) {
// // //   const {
// // //     singleChoice,
// // //     multipleChoice, 
// // //     trueFalse,
// // //     shortAnswer,
// // //     difficulty,
// // //     keywords,
// // //     filePath
// // //   } = config;

// // //   // Читаємо текст з файлу
// // //   const textContent = fs.readFileSync(filePath, "utf8");
  
// // //   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
// // //   let generatedQuestions = [];
// // //   let completed = 0;

// // //   // Генерація питань з однією правильною відповіддю
// // //   if (singleChoice > 0) {
// // //     for (let i = 0; i < singleChoice; i++) {
// // //       if (shouldStop && shouldStop()) break;
      
// // //       const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
      
// // //       completed++;
// // //       onProgress(Math.round((completed / totalQuestions) * 100));
      
// // //       // Затримка для уникнення rate limits
// // //       await delay(1000);
// // //     }
// // //   }

// // //   // Генерація питань з множинним вибором
// // //   if (multipleChoice > 0 && (!shouldStop || !shouldStop())) {
// // //     for (let i = 0; i < multipleChoice; i++) {
// // //       if (shouldStop && shouldStop()) break;
      
// // //       const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
      
// // //       completed++;
// // //       onProgress(Math.round((completed / totalQuestions) * 100));
      
// // //       await delay(1000);
// // //     }
// // //   }

// // //   // Генерація True/False питань
// // //   if (trueFalse > 0 && (!shouldStop || !shouldStop())) {
// // //     for (let i = 0; i < trueFalse; i++) {
// // //       if (shouldStop && shouldStop()) break;
      
// // //       const question = await generateTrueFalseQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
      
// // //       completed++;
// // //       onProgress(Math.round((completed / totalQuestions) * 100));
      
// // //       await delay(1000);
// // //     }
// // //   }

// // //   // Генерація питань з короткою відповіддю
// // //   if (shortAnswer > 0 && (!shouldStop || !shouldStop())) {
// // //     for (let i = 0; i < shortAnswer; i++) {
// // //       if (shouldStop && shouldStop()) break;
      
// // //       const question = await generateShortAnswerQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
      
// // //       completed++;
// // //       onProgress(Math.round((completed / totalQuestions) * 100));
      
// // //       await delay(1000);
// // //     }
// // //   }

// // //   return generatedQuestions;
// // // }

// // // async function generateSingleChoiceQuestion(text, difficulty, keywords) {
// // //   const prompt = `
// // // На основі наступного тексту згенеруй запитання з однією правильною відповіддю та трьома неправильними варіантами.

// // // Текст: "${text.substring(0, 2000)}"

// // // Ключові слова: ${keywords.join(", ")}

// // // Рівень складності: ${difficulty}

// // // Формат відповіді у JSON:
// // // {
// // //   "text": "текст запитання",
// // //   "type": "singleChoice", 
// // //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// // //   "correctIndex": 0,
// // //   "explanation": "пояснення правильної відповіді"
// // // }

// // // Варіанти мають бути чіткими та відповідати рівню складності.
// // //   `;

// // //   const response = await callHuggingFace(MODELS.questionGeneration, prompt);
// // //   return parseQuestionResponse(response, "singleChoice");
// // // }

// // // async function generateMultipleChoiceQuestion(text, difficulty, keywords) {
// // //   const prompt = `
// // // На основі наведеного тексту згенеруй запитання з множинним вибором, де може бути кілька правильних відповідей.

// // // Текст: "${text.substring(0, 2000)}"

// // // Ключові слова: ${keywords.join(", ")}

// // // Рівень складності: ${difficulty}

// // // Формат відповіді у JSON:
// // // {
// // //   "text": "текст запитання",
// // //   "type": "multipleChoice",
// // //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// // //   "correctIndexes": [0, 2],
// // //   "explanation": "пояснення правильної відповіді"  
// // // }

// // // Створи 2-3 правильні відповіді серед 4 варіантів.
// // //   `;

// // //   const response = await callHuggingFace(MODELS.multipleChoice, prompt);
// // //   return parseQuestionResponse(response, "multipleChoice");
// // // }

// // // async function generateTrueFalseQuestion(text, difficulty, keywords) {
// // //   const prompt = `
// // // На основі тексту згенеруй твердження для перевірки істинності.

// // // Текст: "${text.substring(0, 2000)}"

// // // Ключові слова: ${keywords.join(", ")}

// // // Рівень складності: ${difficulty}

// // // Формат відповіді у JSON:
// // // {
// // //   "text": "твердження для оцінки",
// // //   "type": "trueFalse",
// // //   "correctAnswer": true,
// // //   "explanation": "пояснення чому це правда/неправда"
// // // }

// // // Твердження має бути чітким і однозначним.
// // //   `;

// // //   const response = await callHuggingFace(MODELS.trueFalse, prompt);
// // //   return parseQuestionResponse(response, "trueFalse");
// // // }

// // // async function generateShortAnswerQuestion(text, difficulty, keywords) {
// // //   const prompt = `
// // // На основі тексту згенеруй запитання, що вимагає короткої текстової відповіді.

// // // Текст: "${text.substring(0, 2000)}"

// // // Ключові слова: ${keywords.join(", ")}

// // // Рівень складності: ${difficulty}

// // // Формат відповіді у JSON:
// // // {
// // //   "text": "текст запитання",
// // //   "type": "shortAnswer", 
// // //   "expectedAnswer": "очікувана правильна відповідь",
// // //   "explanation": "додаткові пояснення"
// // // }

// // // Відповідь має бути конкретною та відповідати тексту.
// // //   `;

// // //   const response = await callHuggingFace(MODELS.shortAnswer, prompt);
// // //   return parseQuestionResponse(response, "shortAnswer");
// // // }

// // // async function callHuggingFace(model, prompt) {
// // //   try {
// // //     const response = await axios.post(
// // //       `${HF_API_URL}/${model}`,
// // //       {
// // //         inputs: prompt,
// // //         parameters: {
// // //           max_new_tokens: 500,
// // //           temperature: 0.7,
// // //           do_sample: true,
// // //           return_full_text: false
// // //         }
// // //       },
// // //       {
// // //         headers: {
// // //           Authorization: `Bearer ${HF_API_TOKEN}`,
// // //           "Content-Type": "application/json"
// // //         },
// // //         timeout: 30000
// // //       }
// // //     );

// // //     return response.data[0]?.generated_text || response.data;
// // //   } catch (error) {
// // //     console.error("Hugging Face API error:", error.response?.data || error.message);
    
// // //     // Fallback - генерація простих питань якщо API не працює
// // //     return generateFallbackQuestion(prompt);
// // //   }
// // // }

// // // function parseQuestionResponse(response, type) {
// // //   try {
// // //     // Спроба знайти JSON у відповіді
// // //     const jsonMatch = response.match(/\{[\s\S]*\}/);
// // //     if (jsonMatch) {
// // //       const parsed = JSON.parse(jsonMatch[0]);
// // //       return { ...parsed, type };
// // //     }
    
// // //     // Fallback якщо JSON не знайдено
// // //     return createFallbackQuestion(type);
// // //   } catch (error) {
// // //     console.error("Error parsing question response:", error);
// // //     return createFallbackQuestion(type);
// // //   }
// // // }

// // // function generateFallbackQuestion(prompt) {
// // //   // Проста fallback логіка для демонстрації
// // //   return JSON.stringify({
// // //     text: "Це демонстраційне запитання (Hugging Face API недоступне)",
// // //     type: "singleChoice",
// // //     options: ["Варіант 1", "Варіант 2", "Варіант 3", "Варіант 4"],
// // //     correctIndex: 0,
// // //     explanation: "Демонстраційне пояснення"
// // //   });
// // // }

// // // function createFallbackQuestion(type) {
// // //   const baseQuestion = {
// // //     text: "Демонстраційне запитання",
// // //     explanation: "Згенеровано як fallback"
// // //   };

// // //   switch (type) {
// // //     case "singleChoice":
// // //       return {
// // //         ...baseQuestion,
// // //         type: "singleChoice",
// // //         options: ["Правильна відповідь", "Неправильно", "Неправильно", "Неправильно"],
// // //         correctIndex: 0
// // //       };
// // //     case "multipleChoice":
// // //       return {
// // //         ...baseQuestion,
// // //         type: "multipleChoice", 
// // //         options: ["Правильно", "Неправильно", "Правильно", "Неправильно"],
// // //         correctIndexes: [0, 2]
// // //       };
// // //     case "trueFalse":
// // //       return {
// // //         ...baseQuestion,
// // //         type: "trueFalse",
// // //         correctAnswer: true
// // //       };
// // //     case "shortAnswer":
// // //       return {
// // //         ...baseQuestion,
// // //         type: "shortAnswer",
// // //         expectedAnswer: "Приклад правильної відповіді"
// // //       };
// // //     default:
// // //       return baseQuestion;
// // //   }
// // // }

// // // function delay(ms) {
// // //   return new Promise(resolve => setTimeout(resolve, ms));
// // // }

// // import axios from "axios";
// // import fs from "fs";
// // import dotenv from "dotenv";
// // dotenv.config();

// // const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// // // Спробуємо різні URL для Hugging Face API
// // const HF_API_URLS = [
// //   "https://api-inference.huggingface.co/models",
// //   "https://router.huggingface.co/hf-inference/models"
// // ];

// // // Спробуємо різні моделі
// // const MODELS = [
// //   "google/flan-t5-large",
// //   "google/flan-t5-base", 
// //   "microsoft/DialoGPT-medium",
// //   "facebook/blenderbot-400M-distill",
// //   "allenai/t5-small"
// // ];

// // export async function hfGenerateQuestions(config, onProgress, shouldStop) {
// //   const {
// //     singleChoice,
// //     multipleChoice, 
// //     trueFalse,
// //     shortAnswer,
// //     difficulty,
// //     keywords,
// //     filePath
// //   } = config;

// //   // Читаємо текст з файлу
// //   const textContent = fs.readFileSync(filePath, "utf8");
  
// //   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
// //   let generatedQuestions = [];
// //   let completed = 0;

// //   // Генерація питань з однією правильною відповіддю
// //   if (singleChoice > 0) {
// //     for (let i = 0; i < singleChoice; i++) {
// //       if (shouldStop && shouldStop()) break;
      
// //       const question = await generateQuestionWithFallback(textContent, difficulty, keywords, "singleChoice");
// //       generatedQuestions.push(question);
      
// //       completed++;
// //       const progress = Math.round((completed / totalQuestions) * 100);
// //       onProgress(progress);
      
// //       await delay(1500); // Збільшимо затримку
// //     }
// //   }

// //   // Генерація питань з множинним вибором
// //   if (multipleChoice > 0 && (!shouldStop || !shouldStop())) {
// //     for (let i = 0; i < multipleChoice; i++) {
// //       if (shouldStop && shouldStop()) break;
      
// //       const question = await generateQuestionWithFallback(textContent, difficulty, keywords, "multipleChoice");
// //       generatedQuestions.push(question);
      
// //       completed++;
// //       const progress = Math.round((completed / totalQuestions) * 100);
// //       onProgress(progress);
      
// //       await delay(1500);
// //     }
// //   }

// //   // Генерація True/False питань
// //   if (trueFalse > 0 && (!shouldStop || !shouldStop())) {
// //     for (let i = 0; i < trueFalse; i++) {
// //       if (shouldStop && shouldStop()) break;
      
// //       const question = await generateQuestionWithFallback(textContent, difficulty, keywords, "trueFalse");
// //       generatedQuestions.push(question);
      
// //       completed++;
// //       const progress = Math.round((completed / totalQuestions) * 100);
// //       onProgress(progress);
      
// //       await delay(1500);
// //     }
// //   }

// //   // Генерація питань з короткою відповіддю
// //   if (shortAnswer > 0 && (!shouldStop || !shouldStop())) {
// //     for (let i = 0; i < shortAnswer; i++) {
// //       if (shouldStop && shouldStop()) break;
      
// //       const question = await generateQuestionWithFallback(textContent, difficulty, keywords, "shortAnswer");
// //       generatedQuestions.push(question);
      
// //       completed++;
// //       const progress = Math.round((completed / totalQuestions) * 100);
// //       onProgress(progress);
      
// //       await delay(1500);
// //     }
// //   }

// //   return generatedQuestions;
// // }

// // async function generateQuestionWithFallback(text, difficulty, keywords, type) {
// //   // Спочатку пробуємо Hugging Face API
// //   try {
// //     const question = await generateQuestionByType(text, difficulty, keywords, type);
// //     if (question && question.text && question.text !== "Демонстраційне запитання") {
// //       return question;
// //     }
// //   } catch (error) {
// //     console.log("Hugging Face API не вдалося, використовую fallback");
// //   }
  
// //   // Якщо API не працює, використовуємо локальну генерацію
// //   return generateLocalQuestion(text, difficulty, keywords, type);
// // }

// // async function generateQuestionByType(text, difficulty, keywords, type) {
// //   const prompts = {
// //     singleChoice: `
// // Створи тестове запитання з чотирма варіантами відповіді на основі тексту.
// // Текст: "${text.substring(0, 1500)}"
// // Ключові слова: ${keywords.join(", ")}
// // Складність: ${difficulty}
// // Формат: {"text": "питання", "options": ["a", "b", "c", "d"], "correctIndex": 0, "explanation": "пояснення"}
// //     `,
// //     multipleChoice: `
// // Створи запитання з множинним вибором (кілька правильних відповідей).
// // Текст: "${text.substring(0, 1500)}"  
// // Ключові слова: ${keywords.join(", ")}
// // Складність: ${difficulty}
// // Формат: {"text": "питання", "options": ["a", "b", "c", "d"], "correctIndexes": [0,1], "explanation": "пояснення"}
// //     `,
// //     trueFalse: `
// // Створи твердження для перевірки істинності (правда/неправда).
// // Текст: "${text.substring(0, 1500)}"
// // Ключові слова: ${keywords.join(", ")}
// // Складність: ${difficulty}
// // Формат: {"text": "твердження", "correctAnswer": true, "explanation": "пояснення"}
// //     `,
// //     shortAnswer: `
// // Створи запитання з короткою відповіддю.
// // Текст: "${text.substring(0, 1500)}"
// // Ключові слова: ${keywords.join(", ")}
// // Складність: ${difficulty}  
// // Формат: {"text": "питання", "expectedAnswer": "відповідь", "explanation": "пояснення"}
// //     `
// //   };

// //   const prompt = prompts[type];
// //   const response = await callHuggingFaceWithRetry(prompt);
// //   return parseQuestionResponse(response, type);
// // }

// // async function callHuggingFaceWithRetry(prompt) {
// //   for (const model of MODELS) {
// //     for (const baseUrl of HF_API_URLS) {
// //       try {
// //         console.log(`Спроба виклику: ${baseUrl}/${model}`);
        
// //         const response = await axios.post(
// //           `${baseUrl}/${model}`,
// //           {
// //             inputs: prompt,
// //             parameters: {
// //               max_new_tokens: 300,
// //               temperature: 0.7,
// //               do_sample: true
// //             }
// //           },
// //           {
// //             headers: {
// //               Authorization: `Bearer ${HF_API_TOKEN}`,
// //               "Content-Type": "application/json"
// //             },
// //             timeout: 10000
// //           }
// //         );

// //         console.log("Успішний виклик API");
// //         return response.data;
// //       } catch (error) {
// //         console.log(`Помилка для ${baseUrl}/${model}:`, error.response?.status || error.message);
// //         continue; // Пробуємо наступну комбінацію
// //       }
// //     }
// //   }
  
// //   throw new Error("Усі спроби не вдалися");
// // }

// // function generateLocalQuestion(text, difficulty, keywords, type) {
// //   console.log("Генерація локального питання типу:", type);
  
// //   const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
// //   const keyConcepts = keywords.length > 0 ? keywords : ["основні поняття", "ключові ідеї", "головні тези"];
  
// //   const baseQuestion = {
// //     text: "",
// //     explanation: `Питання стосується ${keyConcepts[0]} та пов'язане з рівнем складності: ${difficulty}`
// //   };

// //   // Базовий текст питання на основі типів
// //   const questionTexts = {
// //     singleChoice: `Що є основним поняттям у контексті "${keyConcepts[0]}"?`,
// //     multipleChoice: `Які з наведених понять пов'язані з "${keyConcepts[0]}"?`,
// //     trueFalse: `Твердження про "${keyConcepts[0]}" є правильним.`,
// //     shortAnswer: `Поясніть поняття "${keyConcepts[0]}" на основі наданого тексту.`
// //   };

// //   baseQuestion.text = questionTexts[type] || `Питання про ${keyConcepts[0]}`;

// //   switch (type) {
// //     case "singleChoice":
// //       return {
// //         ...baseQuestion,
// //         type: "singleChoice",
// //         options: [
// //           `Правильна відповідь про ${keyConcepts[0]}`,
// //           `Альтернативне пояснення`,
// //           `Неповне визначення`, 
// //           `Некоректна інтерпретація`
// //         ],
// //         correctIndex: 0
// //       };
// //     case "multipleChoice":
// //       return {
// //         ...baseQuestion,
// //         type: "multipleChoice", 
// //         options: [
// //           `Правильний аспект ${keyConcepts[0]}`,
// //           `Додатковий коректний факт`,
// //           `Неправильне твердження`,
// //           `Інший правильний елемент`
// //         ],
// //         correctIndexes: [0, 1, 3]
// //       };
// //     case "trueFalse":
// //       return {
// //         ...baseQuestion,
// //         type: "trueFalse",
// //         correctAnswer: true
// //       };
// //     case "shortAnswer":
// //       return {
// //         ...baseQuestion,
// //         type: "shortAnswer",
// //         expectedAnswer: `Відповідь має містити пояснення поняття "${keyConcepts[0]}" на основі наданого тексту.`
// //       };
// //     default:
// //       return baseQuestion;
// //   }
// // }

// // function parseQuestionResponse(response, type) {
// //   try {
// //     console.log("Відповідь від API:", response);
    
// //     if (!response) {
// //       throw new Error("Пуста відповідь");
// //     }

// //     // Спроба отримати текст з різних форматів відповіді
// //     let responseText = "";
// //     if (typeof response === "string") {
// //       responseText = response;
// //     } else if (Array.isArray(response) && response[0] && response[0].generated_text) {
// //       responseText = response[0].generated_text;
// //     } else if (response.generated_text) {
// //       responseText = response.generated_text;
// //     } else {
// //       responseText = JSON.stringify(response);
// //     }

// //     // Спроба знайти JSON
// //     const jsonMatch = responseText.match(/\{[\s\S]*\}/);
// //     if (jsonMatch) {
// //       const parsed = JSON.parse(jsonMatch[0]);
// //       return { ...parsed, type };
// //     }
    
// //     // Якщо JSON не знайдено, створюємо просте питання
// //     return createSimpleQuestion(type, responseText);
    
// //   } catch (error) {
// //     console.error("Помилка парсингу:", error);
// //     return generateLocalQuestion("", "medium", [], type);
// //   }
// // }

// // function createSimpleQuestion(type, responseText) {
// //   const baseQuestion = {
// //     text: responseText.substring(0, 200) || "Питання на основі наданого тексту",
// //     explanation: "Згенеровано автоматично",
// //     type: type
// //   };

// //   if (type === "singleChoice" || type === "multipleChoice") {
// //     baseQuestion.options = ["Варіант А", "Варіант Б", "Варіант В", "Варіант Г"];
// //     baseQuestion.correctIndex = type === "singleChoice" ? 0 : [0];
// //   } else if (type === "trueFalse") {
// //     baseQuestion.correctAnswer = true;
// //   } else if (type === "shortAnswer") {
// //     baseQuestion.expectedAnswer = "Очікувана відповідь на основі тексту";
// //   }

// //   return baseQuestion;
// // }

// // function delay(ms) {
// //   return new Promise(resolve => setTimeout(resolve, ms));
// // }

// import axios from "axios";
// import fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

// const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// // ПРАВИЛЬНИЙ URL для Hugging Face Inference API
// const HF_API_URL = "https://router.huggingface.co/hf-inference/models";

// // Моделі, що підтримуються Inference API
// const SUPPORTED_MODELS = [
//   "microsoft/DialoGPT-large",
//   "google/flan-t5-xl",
//   "facebook/blenderbot-3B",
//   "mistralai/Mistral-7B-v0.1"
// ];

// export async function hfGenerateQuestions(config, onProgress, shouldStop) {
//   const {
//     singleChoice,
//     multipleChoice, 
//     trueFalse,
//     shortAnswer,
//     difficulty,
//     keywords,
//     filePath
//   } = config;

//   const textContent = fs.readFileSync(filePath, "utf8");
//   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
//   let generatedQuestions = [];
//   let completed = 0;

//   // Спочатку перевіримо, чи API взагалі доступне
//   const isApiAvailable = await checkHuggingFaceAvailability();
//   if (!isApiAvailable) {
//     throw new Error("Hugging Face API недоступне. Перевірте підключення або токен.");
//   }

//   // Генерація питань з однією правильною відповіддю
//   for (let i = 0; i < singleChoice; i++) {
//     if (shouldStop && shouldStop()) break;
    
//     try {
//       const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords);
//       generatedQuestions.push(question);
//     } catch (error) {
//       console.error("Помилка генерації питання:", error);
//       throw error; // Перериваємо весь процес при помилці
//     }
    
//     completed++;
//     onProgress(Math.round((completed / totalQuestions) * 100));
//     await delay(2000); // Збільшуємо затримку між запитами
//   }

//   // Аналогічно для інших типів питань...
//   for (let i = 0; i < multipleChoice; i++) {
//     if (shouldStop && shouldStop()) break;
    
//     try {
//       const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords);
//       generatedQuestions.push(question);
//     } catch (error) {
//       console.error("Помилка генерації питання:", error);
//       throw error;
//     }
    
//     completed++;
//     onProgress(Math.round((completed / totalQuestions) * 100));
//     await delay(2000);
//   }

//   for (let i = 0; i < trueFalse; i++) {
//     if (shouldStop && shouldStop()) break;
    
//     try {
//       const question = await generateTrueFalseQuestion(textContent, difficulty, keywords);
//       generatedQuestions.push(question);
//     } catch (error) {
//       console.error("Помилка генерації питання:", error);
//       throw error;
//     }
    
//     completed++;
//     onProgress(Math.round((completed / totalQuestions) * 100));
//     await delay(2000);
//   }

//   for (let i = 0; i < shortAnswer; i++) {
//     if (shouldStop && shouldStop()) break;
    
//     try {
//       const question = await generateShortAnswerQuestion(textContent, difficulty, keywords);
//       generatedQuestions.push(question);
//     } catch (error) {
//       console.error("Помилка генерації питання:", error);
//       throw error;
//     }
    
//     completed++;
//     onProgress(Math.round((completed / totalQuestions) * 100));
//     await delay(2000);
//   }

//   return generatedQuestions;
// }

// // Функція перевірки доступності API
// async function checkHuggingFaceAvailability() {
//   for (const model of SUPPORTED_MODELS) {
//     try {
//       console.log(`Перевірка доступності моделі: ${model}`);
      
//       const response = await axios.get(
//         `${HF_API_URL}/${model}`,
//         {
//           headers: {
//             Authorization: `Bearer ${HF_API_TOKEN}`,
//           },
//           timeout: 10000
//         }
//       );
      
//       if (response.status === 200) {
//         console.log(`✅ Модель ${model} доступна`);
//         return true;
//       }
//     } catch (error) {
//       console.log(`❌ Модель ${model} недоступна:`, error.response?.status || error.message);
//       continue;
//     }
//   }
  
//   console.log("❌ Жодна модель не доступна");
//   return false;
// }

// async function generateSingleChoiceQuestion(text, difficulty, keywords) {
//   const prompt = createPrompt("singleChoice", text, difficulty, keywords);
//   const response = await callHuggingFaceAPI(prompt);
//   return parseQuestionResponse(response, "singleChoice");
// }

// async function generateMultipleChoiceQuestion(text, difficulty, keywords) {
//   const prompt = createPrompt("multipleChoice", text, difficulty, keywords);
//   const response = await callHuggingFaceAPI(prompt);
//   return parseQuestionResponse(response, "multipleChoice");
// }

// async function generateTrueFalseQuestion(text, difficulty, keywords) {
//   const prompt = createPrompt("trueFalse", text, difficulty, keywords);
//   const response = await callHuggingFaceAPI(prompt);
//   return parseQuestionResponse(response, "trueFalse");
// }

// async function generateShortAnswerQuestion(text, difficulty, keywords) {
//   const prompt = createPrompt("shortAnswer", text, difficulty, keywords);
//   const response = await callHuggingFaceAPI(prompt);
//   return parseQuestionResponse(response, "shortAnswer");
// }

// function createPrompt(type, text, difficulty, keywords) {
//   const basePrompt = `
// Створи тестове запитання на основі наступного тексту.
// Текст: "${text.substring(0, 1000)}"
// Ключові слова: ${keywords.join(", ")}
// Рівень складності: ${difficulty}

// `;
  
//   const typePrompts = {
//     singleChoice: `${basePrompt}
// Тип: запитання з однією правильною відповіддю
// Формат JSON:
// {
//   "text": "текст запитання",
//   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
//   "correctIndex": 0,
//   "explanation": "пояснення"
// }`,

//     multipleChoice: `${basePrompt}
// Тип: запитання з множинним вибором (кілька правильних відповідей)
// Формат JSON:
// {
//   "text": "текст запитання", 
//   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
//   "correctIndexes": [0, 2],
//   "explanation": "пояснення"
// }`,

//     trueFalse: `${basePrompt}
// Тип: твердження (правда/неправда)
// Формат JSON:
// {
//   "text": "твердження",
//   "correctAnswer": true,
//   "explanation": "пояснення"
// }`,

//     shortAnswer: `${basePrompt}
// Тип: запитання з короткою відповіддю
// Формат JSON:
// {
//   "text": "текст запитання",
//   "expectedAnswer": "очікувана відповідь", 
//   "explanation": "пояснення"
// }`
//   };

//   return typePrompts[type];
// }

// async function callHuggingFaceAPI(prompt) {
//   // Спробуємо всі підтримувані моделі
//   for (const model of SUPPORTED_MODELS) {
//     try {
//       console.log(`Спроба виклику моделі: ${model}`);
      
//       const response = await axios.post(
//         `${HF_API_URL}/${model}`,
//         {
//           inputs: prompt,
//           parameters: {
//             max_new_tokens: 500,
//             temperature: 0.7,
//             do_sample: true,
//             return_full_text: false
//           }
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${HF_API_TOKEN}`,
//             "Content-Type": "application/json"
//           },
//           timeout: 30000
//         }
//       );

//       console.log(`✅ Успішний виклик моделі: ${model}`);
//       return response.data;

//     } catch (error) {
//       console.log(`❌ Помилка для моделі ${model}:`, error.response?.status || error.message);
      
//       // Якщо це помилка 503 (модель завантажується), чекаємо і пробуємо знову
//       if (error.response?.status === 503) {
//         const waitTime = error.response.headers['x-wait-for-model'] || 30;
//         console.log(`⏳ Модель завантажується, чекаємо ${waitTime} секунд...`);
//         await delay(waitTime * 1000);
//         continue;
//       }
      
//       // Пробуємо наступну модель
//       continue;
//     }
//   }

//   throw new Error("Усі спроби виклику API не вдалися");
// }

// function parseQuestionResponse(response, type) {
//   try {
//     console.log("Відповідь від API:", response);
    
//     let responseText = "";
//     if (typeof response === "string") {
//       responseText = response;
//     } else if (Array.isArray(response) && response[0] && response[0].generated_text) {
//       responseText = response[0].generated_text;
//     } else if (response.generated_text) {
//       responseText = response.generated_text;
//     } else {
//       responseText = JSON.stringify(response);
//     }

//     // Спроба знайти JSON
//     const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       const parsed = JSON.parse(jsonMatch[0]);
//       return { ...parsed, type };
//     }

//     throw new Error("JSON не знайдено у відповіді");

//   } catch (error) {
//     console.error("Помилка парсингу відповіді:", error);
//     throw new Error(`Не вдалося обробити відповідь від API: ${error.message}`);
//   }
// }

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

import { callOpenRouter, checkOpenRouterAvailability } from './openRouterService.js';
import fs from 'fs';

export async function hfGenerateQuestions(config, onProgress, shouldStop) {
  const {
    singleChoice,
    multipleChoice, 
    trueFalse,
    shortAnswer,
    difficulty,
    keywords,
    filePath
  } = config;

  const textContent = fs.readFileSync(filePath, 'utf8');
  const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
  let generatedQuestions = [];
  let completed = 0;

  // Перевірка доступності OpenRouter API
  const isApiAvailable = await checkOpenRouterAvailability();
  if (!isApiAvailable) {
    throw new Error('OpenRouter API недоступне. Перевірте підключення або API ключ.');
  }

  // Оновлюємо прогрес
  const updateProgress = () => {
    completed++;
    const progress = Math.round((completed / totalQuestions) * 100);
    onProgress(progress);
  };

  // Генерація питань з однією правильною відповіддю
  for (let i = 0; i < singleChoice; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords);
      generatedQuestions.push(question);
      updateProgress();
      await delay(1000); // Затримка між запитами
    } catch (error) {
      console.error('Помилка генерації питання з однією відповіддю:', error);
      throw error;
    }
  }

  // Генерація питань з множинним вибором
  for (let i = 0; i < multipleChoice; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords);
      generatedQuestions.push(question);
      updateProgress();
      await delay(1000);
    } catch (error) {
      console.error('Помилка генерації питання з множинним вибором:', error);
      throw error;
    }
  }

  // Генерація питань Правда/Неправда
  for (let i = 0; i < trueFalse; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateTrueFalseQuestion(textContent, difficulty, keywords);
      generatedQuestions.push(question);
      updateProgress();
      await delay(1000);
    } catch (error) {
      console.error('Помилка генерації питання Правда/Неправда:', error);
      throw error;
    }
  }

  // Генерація питань з короткою відповіддю
  for (let i = 0; i < shortAnswer; i++) {
    if (shouldStop && shouldStop()) break;
    
    try {
      const question = await generateShortAnswerQuestion(textContent, difficulty, keywords);
      generatedQuestions.push(question);
      updateProgress();
      await delay(1000);
    } catch (error) {
      console.error('Помилка генерації питання з короткою відповіддю:', error);
      throw error;
    }
  }

  return generatedQuestions;
}

async function generateSingleChoiceQuestion(text, difficulty, keywords) {
  const prompt = createPrompt('singleChoice', text, difficulty, keywords);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty)
  });
  return { ...response, type: 'singleChoice' };
}

async function generateMultipleChoiceQuestion(text, difficulty, keywords) {
  const prompt = createPrompt('multipleChoice', text, difficulty, keywords);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty)
  });
  return { ...response, type: 'multipleChoice' };
}

async function generateTrueFalseQuestion(text, difficulty, keywords) {
  const prompt = createPrompt('trueFalse', text, difficulty, keywords);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty)
  });
  return { ...response, type: 'trueFalse' };
}

async function generateShortAnswerQuestion(text, difficulty, keywords) {
  const prompt = createPrompt('shortAnswer', text, difficulty, keywords);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty)
  });
  return { ...response, type: 'shortAnswer' };
}

function createPrompt(type, text, difficulty, keywords) {
  // Обмежуємо довжину тексту для економії токенів
  const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;
  
  const difficultyMap = {
    easy: 'початкового рівня',
    medium: 'середнього рівня', 
    hard: 'високого рівня складності'
  };

  const baseInstructions = `
Створи тестове запитання на основі наведеного тексту.

ТЕКСТ:
${truncatedText}

КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
РІВЕНЬ СКЛАДНОСТІ: ${difficultyMap[difficulty]}

ВАЖЛИВО: 
- Запитання має бути чітким і однозначним
- Відповіді мають бути релевантними до тексту
- Уникай загальних фраз, конкретизуй
- Використовуй інформацію з тексту
`;

  const typeSpecificInstructions = {
    singleChoice: `
ТИП: Запитання з однією правильною відповіддю

ВИМОГИ:
- 4 варіанти відповіді
- Лише один правильний варіант
- Інші варіанти мають бути правдоподібними, але неправильними

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання",
  "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
  "correctIndex": 0,
  "explanation": "пояснення чому ця відповідь правильна"
}
`,

    multipleChoice: `
ТИП: Запитання з множинним вибором (кілька правильних відповідей)

ВИМОГИ:
- 4 варіанти відповіді  
- Від 2 до 3 правильних відповідей
- Правильні відповіді мають бути логічно пов'язані

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання",
  "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
  "correctIndexes": [0, 2],
  "explanation": "пояснення правильних відповідей"
}
`,

    trueFalse: `
ТИП: Твердження (Правда/Неправда)

ВИМОГИ:
- Чітке твердження, яке може бути істинним або хибним
- Твердження має базуватися на конкретній інформації з тексту

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "твердження",
  "correctAnswer": true,
  "explanation": "пояснення чому це правда/неправда з посиланням на текст"
}
`,

    shortAnswer: `
ТИП: Запитання з короткою відповіддю

ВИМОГИ:
- Запитання, що вимагає короткої текстової відповіді
- Відповідь має бути конкретною і ґрунтуватися на тексті
- Очікувана відповідь має бути чіткою і зрозумілою

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання", 
  "expectedAnswer": "очікувана відповідь",
  "explanation": "пояснення відповіді"
}
`
  };

  return baseInstructions + typeSpecificInstructions[type];
}

function getTemperatureByDifficulty(difficulty) {
  const temperatures = {
    easy: 0.3,    // Менша варіативність для простих питань
    medium: 0.5,  // Середня варіативність
    hard: 0.7     // Більша варіативність для складних питань
  };
  return temperatures[difficulty] || 0.5;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}