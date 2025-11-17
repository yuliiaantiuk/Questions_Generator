// // // import { callOpenRouter, checkOpenRouterAvailability } from './openRouterService.js';
// // // import fs from 'fs';

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

// // //   const textContent = fs.readFileSync(filePath, 'utf8');
// // //   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
// // //   let generatedQuestions = [];
// // //   let completed = 0;

// // //   // Перевірка доступності OpenRouter API
// // //   const isApiAvailable = await checkOpenRouterAvailability();
// // //   if (!isApiAvailable) {
// // //     throw new Error('OpenRouter API недоступне. Перевірте підключення або API ключ.');
// // //   }

// // //   // Оновлюємо прогрес
// // //   const updateProgress = () => {
// // //     completed++;
// // //     const progress = Math.round((completed / totalQuestions) * 100);
// // //     onProgress(progress);
// // //   };

// // //   // Генерація питань з однією правильною відповіддю
// // //   for (let i = 0; i < singleChoice; i++) {
// // //     if (shouldStop && shouldStop()) break;
    
// // //     try {
// // //       const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
// // //       updateProgress();
// // //       await delay(1000); // Затримка між запитами
// // //     } catch (error) {
// // //       console.error('Помилка генерації питання з однією відповіддю:', error);
// // //       throw error;
// // //     }
// // //   }

// // //   // Генерація питань з множинним вибором
// // //   for (let i = 0; i < multipleChoice; i++) {
// // //     if (shouldStop && shouldStop()) break;
    
// // //     try {
// // //       const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
// // //       updateProgress();
// // //       await delay(1000);
// // //     } catch (error) {
// // //       console.error('Помилка генерації питання з множинним вибором:', error);
// // //       throw error;
// // //     }
// // //   }

// // //   // Генерація питань Правда/Неправда
// // //   for (let i = 0; i < trueFalse; i++) {
// // //     if (shouldStop && shouldStop()) break;
    
// // //     try {
// // //       const question = await generateTrueFalseQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
// // //       updateProgress();
// // //       await delay(1000);
// // //     } catch (error) {
// // //       console.error('Помилка генерації питання Правда/Неправда:', error);
// // //       throw error;
// // //     }
// // //   }

// // //   // Генерація питань з короткою відповіддю
// // //   for (let i = 0; i < shortAnswer; i++) {
// // //     if (shouldStop && shouldStop()) break;
    
// // //     try {
// // //       const question = await generateShortAnswerQuestion(textContent, difficulty, keywords);
// // //       generatedQuestions.push(question);
// // //       updateProgress();
// // //       await delay(1000);
// // //     } catch (error) {
// // //       console.error('Помилка генерації питання з короткою відповіддю:', error);
// // //       throw error;
// // //     }
// // //   }

// // //   return generatedQuestions;
// // // }

// // // async function generateSingleChoiceQuestion(text, difficulty, keywords) {
// // //   const prompt = createPrompt('singleChoice', text, difficulty, keywords);
// // //   const response = await callOpenRouter(prompt, {
// // //     temperature: getTemperatureByDifficulty(difficulty)
// // //   });
// // //   return { ...response, type: 'singleChoice' };
// // // }

// // // async function generateMultipleChoiceQuestion(text, difficulty, keywords) {
// // //   const prompt = createPrompt('multipleChoice', text, difficulty, keywords);
// // //   const response = await callOpenRouter(prompt, {
// // //     temperature: getTemperatureByDifficulty(difficulty)
// // //   });
// // //   return { ...response, type: 'multipleChoice' };
// // // }

// // // async function generateTrueFalseQuestion(text, difficulty, keywords) {
// // //   const prompt = createPrompt('trueFalse', text, difficulty, keywords);
// // //   const response = await callOpenRouter(prompt, {
// // //     temperature: getTemperatureByDifficulty(difficulty)
// // //   });
// // //   return { ...response, type: 'trueFalse' };
// // // }

// // // async function generateShortAnswerQuestion(text, difficulty, keywords) {
// // //   const prompt = createPrompt('shortAnswer', text, difficulty, keywords);
// // //   const response = await callOpenRouter(prompt, {
// // //     temperature: getTemperatureByDifficulty(difficulty)
// // //   });
// // //   return { ...response, type: 'shortAnswer' };
// // // }

// // // function createPrompt(type, text, difficulty, keywords) {
// // //   // Обмежуємо довжину тексту для економії токенів
// // //   const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;
  
// // //   const difficultyMap = {
// // //     easy: 'початкового рівня',
// // //     medium: 'середнього рівня', 
// // //     hard: 'високого рівня складності'
// // //   };

// // //   const baseInstructions = `
// // // Створи тестове запитання на основі наведеного тексту.

// // // ТЕКСТ:
// // // ${truncatedText}

// // // КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// // // РІВЕНЬ СКЛАДНОСТІ: ${difficultyMap[difficulty]}

// // // ВАЖЛИВО: 
// // // - Запитання має бути чітким і однозначним
// // // - Відповіді мають бути релевантними до тексту
// // // - Уникай загальних фраз, конкретизуй
// // // - Використовуй інформацію з тексту
// // // `;

// // //   const typeSpecificInstructions = {
// // //     singleChoice: `
// // // ТИП: Запитання з однією правильною відповіддю

// // // ВИМОГИ:
// // // - 4 варіанти відповіді
// // // - Лише один правильний варіант
// // // - Інші варіанти мають бути правдоподібними, але неправильними

// // // ФОРМАТ ВІДПОВІДІ (JSON):
// // // {
// // //   "text": "текст запитання",
// // //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// // //   "correctIndex": 0,
// // //   "explanation": "пояснення чому ця відповідь правильна"
// // // }
// // // `,

// // //     multipleChoice: `
// // // ТИП: Запитання з множинним вибором (кілька правильних відповідей)

// // // ВИМОГИ:
// // // - 4 варіанти відповіді  
// // // - Від 2 до 3 правильних відповідей
// // // - Правильні відповіді мають бути логічно пов'язані

// // // ФОРМАТ ВІДПОВІДІ (JSON):
// // // {
// // //   "text": "текст запитання",
// // //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// // //   "correctIndexes": [0, 2],
// // //   "explanation": "пояснення правильних відповідей"
// // // }
// // // `,

// // //     trueFalse: `
// // // ТИП: Твердження (Правда/Неправда)

// // // ВИМОГИ:
// // // - Чітке твердження, яке може бути істинним або хибним
// // // - Твердження має базуватися на конкретній інформації з тексту

// // // ФОРМАТ ВІДПОВІДІ (JSON):
// // // {
// // //   "text": "твердження",
// // //   "correctAnswer": true,
// // //   "explanation": "пояснення чому це правда/неправда з посиланням на текст"
// // // }
// // // `,

// // //     shortAnswer: `
// // // ТИП: Запитання з короткою відповіддю

// // // ВИМОГИ:
// // // - Запитання, що вимагає короткої текстової відповіді
// // // - Відповідь має бути конкретною і ґрунтуватися на тексті
// // // - Очікувана відповідь має бути чіткою і зрозумілою

// // // ФОРМАТ ВІДПОВІДІ (JSON):
// // // {
// // //   "text": "текст запитання", 
// // //   "expectedAnswer": "очікувана відповідь",
// // //   "explanation": "пояснення відповіді"
// // // }
// // // `
// // //   };

// // //   return baseInstructions + typeSpecificInstructions[type];
// // // }

// // // function getTemperatureByDifficulty(difficulty) {
// // //   const temperatures = {
// // //     easy: 0.3,    // Менша варіативність для простих питань
// // //     medium: 0.5,  // Середня варіативність
// // //     hard: 0.7     // Більша варіативність для складних питань
// // //   };
// // //   return temperatures[difficulty] || 0.5;
// // // }

// // // function delay(ms) {
// // //   return new Promise(resolve => setTimeout(resolve, ms));
// // // }

// // import { callOpenRouter, checkOpenRouterAvailability, clearQuestionCache } from './openRouterService.js';
// // import fs from 'fs';

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

// //   const textContent = fs.readFileSync(filePath, 'utf8');
// //   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
// //   let generatedQuestions = [];
// //   let completed = 0;

// //   // Очищаємо кеш перед новою генерацією
// //   clearQuestionCache();

// //   // Перевірка доступності OpenRouter API
// //   const isApiAvailable = await checkOpenRouterAvailability();
// //   if (!isApiAvailable) {
// //     throw new Error('OpenRouter API недоступне. Перевірте підключення або API ключ.');
// //   }

// //   // Оновлюємо прогрес
// //   const updateProgress = () => {
// //     completed++;
// //     const progress = Math.round((completed / totalQuestions) * 100);
// //     onProgress(progress);
// //   };

// //   // Генерація питань з однією правильною відповіддю
// //   for (let i = 0; i < singleChoice; i++) {
// //     if (shouldStop && shouldStop()) break;
    
// //     try {
// //       const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords, i, singleChoice);
// //       generatedQuestions.push(question);
// //       updateProgress();
// //       await delay(1200); // Збільшуємо затримку для уникнення обмежень
// //     } catch (error) {
// //       if (error.message === 'DUPLICATE_QUESTION') {
// //         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
// //         i--; // Повторюємо спробу для цього індексу
// //         await delay(500);
// //         continue;
// //       }
// //       console.error('Помилка генерації питання з однією відповіддю:', error);
// //       throw error;
// //     }
// //   }

// //   // Генерація питань з множинним вибором
// //   for (let i = 0; i < multipleChoice; i++) {
// //     if (shouldStop && shouldStop()) break;
    
// //     try {
// //       const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords, i, multipleChoice);
// //       generatedQuestions.push(question);
// //       updateProgress();
// //       await delay(1200);
// //     } catch (error) {
// //       if (error.message === 'DUPLICATE_QUESTION') {
// //         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
// //         i--;
// //         await delay(500);
// //         continue;
// //       }
// //       console.error('Помилка генерації питання з множинним вибором:', error);
// //       throw error;
// //     }
// //   }

// //   // Генерація питань Правда/Неправда
// //   for (let i = 0; i < trueFalse; i++) {
// //     if (shouldStop && shouldStop()) break;
    
// //     try {
// //       const question = await generateTrueFalseQuestion(textContent, difficulty, keywords, i, trueFalse);
// //       generatedQuestions.push(question);
// //       updateProgress();
// //       await delay(1200);
// //     } catch (error) {
// //       if (error.message === 'DUPLICATE_QUESTION') {
// //         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
// //         i--;
// //         await delay(500);
// //         continue;
// //       }
// //       console.error('Помилка генерації питання Правда/Неправда:', error);
// //       throw error;
// //     }
// //   }

// //   // Генерація питань з короткою відповіддю
// //   for (let i = 0; i < shortAnswer; i++) {
// //     if (shouldStop && shouldStop()) break;
    
// //     try {
// //       const question = await generateShortAnswerQuestion(textContent, difficulty, keywords, i, shortAnswer);
// //       generatedQuestions.push(question);
// //       updateProgress();
// //       await delay(1200);
// //     } catch (error) {
// //       if (error.message === 'DUPLICATE_QUESTION') {
// //         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
// //         i--;
// //         await delay(500);
// //         continue;
// //       }
// //       console.error('Помилка генерації питання з короткою відповіддю:', error);
// //       throw error;
// //     }
// //   }

// //   return generatedQuestions;
// // }

// // async function generateSingleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
// //   const prompt = createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
// //   const response = await callOpenRouter(prompt, {
// //     temperature: getTemperatureByDifficulty(difficulty),
// //     questionType: 'singleChoice'
// //   });
// //   return { ...response, type: 'singleChoice' };
// // }

// // async function generateMultipleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
// //   const prompt = createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
// //   const response = await callOpenRouter(prompt, {
// //     temperature: getTemperatureByDifficulty(difficulty),
// //     questionType: 'multipleChoice'
// //   });
// //   return { ...response, type: 'multipleChoice' };
// // }

// // async function generateTrueFalseQuestion(text, difficulty, keywords, currentIndex, totalCount) {
// //   const prompt = createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount);
// //   const response = await callOpenRouter(prompt, {
// //     temperature: getTemperatureByDifficulty(difficulty),
// //     questionType: 'trueFalse'
// //   });
// //   return { ...response, type: 'trueFalse' };
// // }

// // async function generateShortAnswerQuestion(text, difficulty, keywords, currentIndex, totalCount) {
// //   const prompt = createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount);
// //   const response = await callOpenRouter(prompt, {
// //     temperature: getTemperatureByDifficulty(difficulty),
// //     questionType: 'shortAnswer'
// //   });
// //   return { ...response, type: 'shortAnswer' };
// // }

// // function createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
// //   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  
// //   return `
// // Створи тестове запитання з однією правильною відповіддю на основі тексту.

// // ТЕКСТ:
// // ${truncatedText}

// // КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// // РІВЕНЬ СКЛАДНОСТІ: ${getDifficultyText(difficulty)}
// // ПИТАННЯ ${currentIndex + 1} З ${totalCount}

// // ІНСТРУКЦІЇ:
// // - Створи унікальне питання, що не повторює попередні
// // - Зосередься на ${getFocusArea(currentIndex, totalCount)}
// // - 4 варіанти відповіді, лише один правильний
// // - Неправильні варіанти мають бути правдоподібними
// // - Питання має бути чітким і конкретним

// // ФОРМАТ ВІДПОВІДІ (JSON):
// // {
// //   "text": "текст запитання",
// //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// //   "correctIndex": 0,
// //   "explanation": "пояснення чому ця відповідь правильна"
// // }
// // `;
// // }

// // function createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
// //   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  
// //   return `
// // Створи запитання з множинним вибором (кілька правильних відповідей) на основі тексту.

// // ТЕКСТ:
// // ${truncatedText}

// // КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// // РІВЕНЬ СКЛАДНОСТІ: ${getDifficultyText(difficulty)}
// // ПИТАННЯ ${currentIndex + 1} З ${totalCount}

// // ІНСТРУКЦІЇ:
// // - Створи унікальне питання про ${getTopicVariation(currentIndex)}
// // - 4 варіанти відповіді, від 2 до 3 правильних
// // - Правильні відповіді мають бути логічно пов'язані
// // - Уникай очевидних чи загальних питань

// // ФОРМАТ ВІДПОВІДІ (JSON):
// // {
// //   "text": "текст запитання",
// //   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
// //   "correctIndexes": [0, 2],
// //   "explanation": "пояснення правильних відповідей"
// // }
// // `;
// // }

// // function createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount) {
// //   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  
// //   return `
// // Створи твердження для перевірки (Правда/Неправда) на основі тексту.

// // ТЕКСТ:
// // ${truncatedText}

// // КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// // РІВЕНЬ СКЛАДНОСТІ: ${getDifficultyText(difficulty)}
// // ПИТАННЯ ${currentIndex + 1} З ${totalCount}

// // ІНСТРУКЦІЇ:
// // - Створи унікальне твердження про ${getAspectVariation(currentIndex)}
// // - Твердження має бути чітким і однозначним
// // - Воно має бути або явно правильним, або явно неправильним
// // - Ґрунтуйся на конкретній інформації з тексту

// // ФОРМАТ ВІДПОВІДІ (JSON):
// // {
// //   "text": "твердження",
// //   "correctAnswer": true,
// //   "explanation": "пояснення чому це правда/неправда з посиланням на текст"
// // }
// // `;
// // }

// // function createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount) {
// //   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  
// //   return `
// // Створи запитання з короткою відповіддю на основі тексту.

// // ТЕКСТ:
// // ${truncatedText}

// // КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// // РІВЕНЬ СКЛАДНОСТІ: ${getDifficultyText(difficulty)}
// // ПИТАННЯ ${currentIndex + 1} З ${totalCount}

// // ІНСТРУКЦІЇ:
// // - Створи унікальне запитання, що вимагає конкретної відповіді
// // - Зосередься на ${getDetailFocus(currentIndex)}
// // - Відповідь має бути чіткою і ґрунтуватися на тексті
// // - Уникай загальних чи очевидних питань

// // ФОРМАТ ВІДПОВІДІ (JSON):
// // {
// //   "text": "текст запитання", 
// //   "expectedAnswer": "очікувана відповідь",
// //   "explanation": "пояснення відповіді"
// // }
// // `;
// // }

// // // Допоміжні функції для варіативності
// // function getTextExcerpt(fullText, currentIndex, totalCount) {
// //   const textParts = splitTextIntoParts(fullText, totalCount);
// //   const partIndex = currentIndex % textParts.length;
// //   return textParts[partIndex];
// // }

// // function splitTextIntoParts(text, partsCount) {
// //   const partLength = Math.floor(text.length / partsCount);
// //   const parts = [];
  
// //   for (let i = 0; i < partsCount; i++) {
// //     const start = i * partLength;
// //     const end = (i + 1) * partLength;
// //     parts.push(text.substring(start, end) + '...');
// //   }
  
// //   return parts;
// // }

// // function getDifficultyText(difficulty) {
// //   const difficultyMap = {
// //     easy: 'початкового рівня (фактологічні питання)',
// //     medium: 'середнього рівня (аналітичні питання)', 
// //     hard: 'високого рівня (синтез та оцінка)'
// //   };
// //   return difficultyMap[difficulty] || 'середнього рівня';
// // }

// // function getFocusArea(index, total) {
// //   const focusAreas = [
// //     'основних поняттях та визначеннях',
// //     'конкретних фактах та деталях',
// //     'причинах та наслідках',
// //     'процесах та послідовностях',
// //     'порівняннях та відмінностях',
// //     'прикладах та застосуванні',
// //     'принципах та правилах',
// //     'винятках та особливостях'
// //   ];
// //   return focusAreas[index % focusAreas.length];
// // }

// // function getTopicVariation(index) {
// //   const topics = [
// //     'взаємозв\'язки між поняттями',
// //     'ключові характеристики',
// //     'структуру та організацію',
// //     'функції та призначення',
// //     'умови та вимоги',
// //     'етапи та процеси',
// //     'критерії та показники',
// //     'причини та фактори'
// //   ];
// //   return topics[index % topics.length];
// // }

// // function getAspectVariation(index) {
// //   const aspects = [
// //     'конкретні факти з тексту',
// //     'причинно-наслідкові зв\'язки',
// //     'хронологічну послідовність',
// //     'логічні висновки',
// //     'визначення понять',
// //     'застосування принципів',
// //     'порівняння явищ',
// //     'умови виконання'
// //   ];
// //   return aspects[index % aspects.length];
// // }

// // function getDetailFocus(index) {
// //   const focuses = [
// //     'конкретних деталях та фактах',
// //     'ключових характеристиках',
// //     'послідовності дій',
// //     'умовах виконання',
// //     'критеріях оцінки',
// //     'причинах явищ',
// //     'наслідках процесів',
// //     'прикладах застосування'
// //   ];
// //   return focuses[index % focuses.length];
// // }

// // function getTemperatureByDifficulty(difficulty) {
// //   const temperatures = {
// //     easy: 0.4,    // Менша варіативність для простих питань
// //     medium: 0.6,  // Середня варіативність
// //     hard: 0.8     // Більша варіативність для складних питань
// //   };
// //   return temperatures[difficulty] || 0.6;
// // }

// // function delay(ms) {
// //   return new Promise(resolve => setTimeout(resolve, ms));
// // }

// import { callOpenRouter, checkOpenRouterAvailability, clearQuestionCache } from './openRouterService.js';
// import fs from 'fs';

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

//   const textContent = fs.readFileSync(filePath, 'utf8');
//   const totalQuestions = singleChoice + multipleChoice + trueFalse + shortAnswer;
//   let generatedQuestions = [];
//   let completed = 0;

//   // Очищаємо кеш перед новою генерацією
//   clearQuestionCache();

//   // Перевірка доступності OpenRouter API
//   const isApiAvailable = await checkOpenRouterAvailability();
//   if (!isApiAvailable) {
//     throw new Error('OpenRouter API недоступне. Перевірте підключення або API ключ.');
//   }

//   // Оновлюємо прогрес
//   const updateProgress = () => {
//     completed++;
//     const progress = Math.round((completed / totalQuestions) * 100);
//     onProgress(progress);
//   };

//   console.log(`🚀 Початок генерації ${totalQuestions} питань (рівень: ${difficulty})`);

//   // ДОДАЄМО ФУНКЦІЮ ОЧІКУВАННЯ ПРИ ПАУЗІ
//   const waitIfPaused = async () => {
//     let checkCount = 0;
//     const maxChecks = 9000; // Максимум 30 хвилин (9000 * 2000ms = 30 хв)
    
//     while (shouldStop && shouldStop()) {
//       checkCount++;
//       if (checkCount >= maxChecks) {
//         console.log('⏰ Досягнуто максимальний час очікування (30 хв), вихід з очікування');
//         return true; // Повертаємо true, щоб сигналізувати про таймаут
//       }

//       if (checkCount % 5 === 0) {
//         console.log('🔍 Перевірка стану генерації...');
//         // Якщо все ще на паузі або скасовано, продовжуємо очікування
//       }
      
//       console.log('⏸️ Генерація на паузі, очікування...');
//       await delay(2000); // Перевіряємо кожні 2 секунди
//     }
      
//     //   // ДОДАЄМО ПЕРЕВІРКУ СКАСУВАННЯ КОЖНІ 10 СЕКУНД
//     //   if (checkCount % 5 === 0) {
//     //     console.log('🔍 Перевірка стану генерації...');
//     //     if (shouldStop && shouldStop()) {
//     //       // Якщо все ще на паузі або скасовано, продовжуємо очікування
//     //       continue;
//     //     }
//     //   }
//     // }
    
//     return false; // Повертаємо false, якщо очікування успішне
//   };

//   // Генерація питань з однією правильною відповіддю
//   for (let i = 0; i < singleChoice; i++) {
//     // ВИКОРИСТОВУЄМО РЕЗУЛЬТАТ waitIfPaused
//     const shouldBreak = await waitIfPaused();
//     if (shouldBreak || (shouldStop && shouldStop())) {
//       console.log('⏹️ Переривання генерації через паузу/скасування');
//       break;
//     }
    
//     try {
//       const question = await generateSingleChoiceQuestion(textContent, difficulty, keywords, i, singleChoice);
//       generatedQuestions.push(question);
//       updateProgress();
//       await delay(1200);
//     } catch (error) {
//       if (error.message === 'DUPLICATE_QUESTION') {
//         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
//         i--; // Повторюємо спробу для цього індексу
//         await delay(500);
//         continue;
//       }
//       console.error('Помилка генерації питання з однією відповіддю:', error);
//       throw error;
//     }
//   }

//   // Перевірка після кожного типу питань
//   if (shouldStop && shouldStop()) {
//     console.log(`⏹️ Генерацію перервано після singleChoice. Згенеровано ${generatedQuestions.length} питань`);
//     return generatedQuestions;
//   }

//   // Генерація питань з множинним вибором
//   for (let i = 0; i < multipleChoice; i++) {
//     // ВИКОРИСТОВУЄМО РЕЗУЛЬТАТ waitIfPaused
//     const shouldBreak = await waitIfPaused();
//     if (shouldBreak || (shouldStop && shouldStop())) {
//       console.log('⏹️ Переривання генерації через паузу/скасування');
//       break;
//     }
    
//     try {
//       const question = await generateMultipleChoiceQuestion(textContent, difficulty, keywords, i, multipleChoice);
//       generatedQuestions.push(question);
//       updateProgress();
//       await delay(1200);
//     } catch (error) {
//       if (error.message === 'DUPLICATE_QUESTION') {
//         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
//         i--;
//         await delay(500);
//         continue;
//       }
//       console.error('Помилка генерації питання з множинним вибором:', error);
//       throw error;
//     }
//   }

//   // Перевірка після кожного типу питань
//   if (shouldStop && shouldStop()) {
//     console.log(`⏹️ Генерацію перервано після multipleChoice. Згенеровано ${generatedQuestions.length} питань`);
//     return generatedQuestions;
//   }

//   // Генерація питань Правда/Неправда
//   for (let i = 0; i < trueFalse; i++) {
//     // ВИКОРИСТОВУЄМО РЕЗУЛЬТАТ waitIfPaused
//     const shouldBreak = await waitIfPaused();
//     if (shouldBreak || (shouldStop && shouldStop())) {
//       console.log('⏹️ Переривання генерації через паузу/скасування');
//       break;
//     }
    
//     try {
//       const question = await generateTrueFalseQuestion(textContent, difficulty, keywords, i, trueFalse);
//       generatedQuestions.push(question);
//       updateProgress();
//       await delay(1200);
//     } catch (error) {
//       if (error.message === 'DUPLICATE_QUESTION') {
//         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
//         i--;
//         await delay(500);
//         continue;
//       }
//       console.error('Помилка генерації питання Правда/Неправда:', error);
//       throw error;
//     }
//   }

//   // Перевірка після кожного типу питань
//   if (shouldStop && shouldStop()) {
//     console.log(`⏹️ Генерацію перервано після trueFalse. Згенеровано ${generatedQuestions.length} питань`);
//     return generatedQuestions;
//   }

//   // Генерація питань з короткою відповіддю
//   for (let i = 0; i < shortAnswer; i++) {
//     // ВИКОРИСТОВУЄМО РЕЗУЛЬТАТ waitIfPaused
//     const shouldBreak = await waitIfPaused();
//     if (shouldBreak || (shouldStop && shouldStop())) {
//       console.log('⏹️ Переривання генерації через паузу/скасування');
//       break;
//     }
    
//     try {
//       const question = await generateShortAnswerQuestion(textContent, difficulty, keywords, i, shortAnswer);
//       generatedQuestions.push(question);
//       updateProgress();
//       await delay(1200);
//     } catch (error) {
//       if (error.message === 'DUPLICATE_QUESTION') {
//         console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
//         i--;
//         await delay(500);
//         continue;
//       }
//       console.error('Помилка генерації питання з короткою відповіддю:', error);
//       throw error;
//     }
//   }


//   // ПЕРЕВІРКА ЧИ ГЕНЕРАЦІЮ БУЛО СКАСОВАНО
//   if (shouldStop && shouldStop()) {
//     console.log(`⏹️ Генерацію перервано. Згенеровано ${generatedQuestions.length} з ${totalQuestions} питань`);
//     return generatedQuestions;
//   }

//   console.log(`✅ Генерацію завершено! Створено ${generatedQuestions.length} питань`);
//   return generatedQuestions;
// }

// // ІНШІ ФУНКЦІЇ ЗАЛИШАЮТЬСЯ БЕЗ ЗМІН...
// async function generateSingleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
//   const prompt = createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
//   const response = await callOpenRouter(prompt, {
//     temperature: getTemperatureByDifficulty(difficulty),
//     questionType: 'singleChoice'
//   });
//   return { ...response, type: 'singleChoice' };
// }

// async function generateMultipleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
//   const prompt = createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
//   const response = await callOpenRouter(prompt, {
//     temperature: getTemperatureByDifficulty(difficulty),
//     questionType: 'multipleChoice'
//   });
//   return { ...response, type: 'multipleChoice' };
// }

// async function generateTrueFalseQuestion(text, difficulty, keywords, currentIndex, totalCount) {
//   const prompt = createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount);
//   const response = await callOpenRouter(prompt, {
//     temperature: getTemperatureByDifficulty(difficulty),
//     questionType: 'trueFalse'
//   });
//   return { ...response, type: 'trueFalse' };
// }

// async function generateShortAnswerQuestion(text, difficulty, keywords, currentIndex, totalCount) {
//   const prompt = createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount);
//   const response = await callOpenRouter(prompt, {
//     temperature: getTemperatureByDifficulty(difficulty),
//     questionType: 'shortAnswer'
//   });
//   return { ...response, type: 'shortAnswer' };
// }

// /**
//  * ПРОМПТИ ДЛЯ РІЗНИХ ТИПІВ ПИТАНЬ
//  */

// function createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
//   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
//   const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'singleChoice');
//   const languageComplexity = getLanguageComplexity(difficulty);
  
//   return `
// Створи тестове запитання ${getDifficultyText(difficulty)} рівня з однією правильною відповіддю.

// ТЕКСТ:
// ${truncatedText}

// КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

// СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
// ${difficultyInstructions}

// ${languageComplexity}

// КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
// ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

// СТРУКТУРА ВІДПОВІДЕЙ:
// - 4 варіанти відповіді, лише один правильний
// - Неправильні варіанти мають бути правдоподібними, але помилковими
// - ${getAnswerOptionsComplexity(difficulty)}

// ФОРМАТ ВІДПОВІДІ (JSON):
// {
//   "text": "текст запитання",
//   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
//   "correctIndex": 0,
//   "explanation": "детальне пояснення з посиланням на конкретні частини тексту"
// }
// `;
// }

// function createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
//   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
//   const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'multipleChoice');
//   const languageComplexity = getLanguageComplexity(difficulty);
  
//   return `
// Створи запитання ${getDifficultyText(difficulty)} рівня з множинним вибором.

// ТЕКСТ:
// ${truncatedText}

// КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

// СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
// ${difficultyInstructions}

// ${languageComplexity}

// ТИП ПИТАННЯ: ${getMultipleChoiceType(difficulty)}
// КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
// ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

// СТРУКТУРА ВІДПОВІДЕЙ:
// - 4 варіанти відповіді
// - ${getCorrectAnswersCount(difficulty)} правильних відповіді(ей)
// - Варіанти мають бути логічно пов'язані

// ФОРМАТ ВІДПОВІДІ (JSON):
// {
//   "text": "текст запитання",
//   "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
//   "correctIndexes": [0, 2],
//   "explanation": "пояснення чому саме ці варіанти правильні з посиланням на текст"
// }
// `;
// }

// function createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount) {
//   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
//   const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'trueFalse');
//   const languageComplexity = getLanguageComplexity(difficulty);
  
//   return `
// Створи твердження ${getDifficultyText(difficulty)} рівня для перевірки (Правда/Неправда).

// ТЕКСТ:
// ${truncatedText}

// КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

// СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
// ${difficultyInstructions}

// ${languageComplexity}

// ТИП ТВЕРДЖЕННЯ: ${getTrueFalseType(difficulty)}
// КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
// ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

// ВИМОГИ ДО ТВЕРДЖЕННЯ:
// - Чітке та однозначне
// - Може бути перевірене на основі тексту
// - ${getTrueFalseComplexity(difficulty)}

// ФОРМАТ ВІДПОВІДІ (JSON):
// {
//   "text": "твердження",
//   "correctAnswer": true,
//   "explanation": "детальне пояснення чому це правда/неправда з конкретними посиланнями на текст"
// }
// `;
// }

// function createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount) {
//   const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
//   const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'shortAnswer');
//   const languageComplexity = getLanguageComplexity(difficulty);
  
//   return `
// Створи запитання ${getDifficultyText(difficulty)} рівня з короткою відповіддю.

// ТЕКСТ:
// ${truncatedText}

// КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
// РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

// СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
// ${difficultyInstructions}

// ${languageComplexity}

// ТИП ВІДПОВІДІ: ${getShortAnswerType(difficulty)}
// КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
// ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

// ВИМОГИ ДО ВІДПОВІДІ:
// - Відповідь має бути конкретною та обґрунтованою текстом
// - ${getShortAnswerComplexity(difficulty)}
// - Очікувана відповідь має містити ключові елементи

// ФОРМАТ ВІДПОВІДІ (JSON):
// {
//   "text": "текст запитання", 
//   "expectedAnswer": "очікувана відповідь",
//   "explanation": "пояснення відповіді з посиланням на відповідні частини тексту"
// }
// `;
// }

// /**
//  * ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ РІВНІВ СКЛАДНОСТІ
//  */

// function getDifficultySpecificInstructions(difficulty, questionType) {
//   const instructions = {
//     easy: {
//       singleChoice: "Питання має перевіряти запам'ятовування базових фактів, термінів, дат, назв. Використовуй прямі цитати або очевидні факти з тексту. Уникай інтерпретацій та аналізу.",
//       multipleChoice: "Створи питання на визначення основних понять, перелік очевидних характеристик. Правильні відповіді мають бути явними з тексту. Усі неправильні варіанти мають бути явно помилковими.",
//       trueFalse: "Твердження мають бути простими, очевидними фактами, які легко перевірити в тексті. Уникай інтерпретацій, умовних конструкцій та оціночних суджень.",
//       shortAnswer: "Питання мають вимагати коротких, конкретних відповідей: імена, дати, терміни, прості визначення. Відповідь має бути прямо в тексті."
//     },
//     medium: {
//       singleChoice: "Питання мають перевіряти розуміння причинно-наслідкових зв'язків, порівняння понять, аналіз процесів. Потрібно мислення на рівні 'чому' та 'як'. Можеш використовувати інформацію з різних частин тексту.",
//       multipleChoice: "Створи питання на встановлення зв'язків між поняттями, аналіз характеристик, визначення послідовностей. Деякі варіанти можуть бути частково правильними. Потрібне розуміння контексту.",
//       trueFalse: "Твердження мають перевіряти розуміння концепцій, можуть містити логічні висновки, що випливають з тексту. Можуть вимагати інтеграції інформації з різних частин тексту.",
//       shortAnswer: "Питання мають вимагати пояснень, коротких описів процесів, порівнянь, аналізу простих зв'язків. Відповідь може вимагати синтезу кількох фактів з тексту."
//     },
//     hard: {
//       singleChoice: "Питання мають перевіряти здатність до синтезу, оцінки, прогнозування. Можуть поєднувати кілька концепцій, вимагати застосування знань в нових ситуаціях. Можуть стосуватися гіпотетичних сценаріїв.",
//       multipleChoice: "Створи складні питання на оцінку, прогнозування наслідків, вибір оптимальних рішень. Варіанти можуть містити нюансовані відмінності. Можуть вимагати критичного мислення та оцінки альтернатив.",
//       trueFalse: "Твердження мають бути складними, можуть містити умовні конструкції, оціночні судження, потребувати глибокого розуміння матеріалу. Можуть стосуватися інтерпретацій та висновків, що не є явно зазначеними в тексті.",
//       shortAnswer: "Питання мають вимагати аргументації, обґрунтування позицій, аналізу альтернатив, формулювання висновків. Відповідь може вимагати критичного осмислення та оцінки інформації з тексту."
//     }
//   };
  
//   return instructions[difficulty]?.[questionType] || "";
// }

// function getLanguageComplexity(difficulty) {
//   const complexities = {
//     easy: "ВИКОРИСТОВУЙ: просту лексику, короткі речення, конкретні формулювання. УНИКАЙ: складних термінів, абстрактних понять, умовних конструкцій.",
//     medium: "ВИКОРИСТОВУЙ: спеціальну термінологію, складніші синтаксичні конструкції, аналітичні формулювання. МОЖНА: умовні речення, порівняння.",
//     hard: "ВИКОРИСТОВУЙ: абстрактні поняття, складну термінологію, умовні конструкції, гіпотетичні сценарії, оціночні судження. ВИМАГАЙ: критичного мислення."
//   };
//   return complexities[difficulty] || "";
// }

// function getCognitiveFocus(difficulty, index) {
//   const focuses = {
//     easy: [
//       "запам'ятовуванні конкретних фактів",
//       "визначенні основних понять", 
//       "переліку ключових елементів",
//       "ідентифікації основних об'єктів",
//       "назвах та датах",
//       "простій класифікації",
//       "основних характеристиках",
//       "очевидних послідовностях"
//     ],
//     medium: [
//       "розумінні причинно-наслідкових зв'язків",
//       "порівнянні понять та явищ",
//       "аналізі процесів та механізмів",
//       "класифікації складних явищ",
//       "поясненні принципів дії",
//       "встановленні взаємозв'язків",
//       "інтерпретації фактів",
//       "аналізі структури"
//     ],
//     hard: [
//       "синтезі інформації з різних частин тексту",
//       "оцінці явищ та процесів",
//       "прогнозуванні наслідків та тенденцій",
//       "аргументації позицій та висновків",
//       "аналізі альтернатив та гіпотез",
//       "критичному оцінюванні інформації",
//       "створенні власних інтерпретацій",
//       "застосуванні знань в нових контекстах"
//     ]
//   };
  
//   const levelFocuses = focuses[difficulty] || focuses.medium;
//   return levelFocuses[index % levelFocuses.length];
// }

// function getMultipleChoiceType(difficulty) {
//   const types = {
//     easy: "ВИЗНАЧЕННЯ/ПЕРЕЛІК - вибір правильних визначень, складових, характеристик з явно правильними та неправильними варіантами",
//     medium: "ПОРІВНЯННЯ/АНАЛІЗ - вибір відповідних порівнянь, аналізів, пояснень з нюансованими варіантами",
//     hard: "ОЦІНКА/СИНТЕЗ - вибір оптимальних рішень, оцінок, синтез різних концепцій з гіпотетичними сценаріями"
//   };
//   return types[difficulty] || types.medium;
// }

// function getTrueFalseType(difficulty) {
//   const types = {
//     easy: "ФАКТИЧНЕ - перевірка конкретних фактів, явно зазначених у тексті",
//     medium: "ІНТЕРПРЕТАЦІЙНЕ - перевірка логічних висновків та інтерпретацій",
//     hard: "ОЦІНОЧНЕ - перевірка оціночних суджень, гіпотез, альтернативних поглядів"
//   };
//   return types[difficulty] || types.medium;
// }

// function getShortAnswerType(difficulty) {
//   const types = {
//     easy: "ФАКТОЛОГІЧНА - конкретні факти, визначення, прості переліки",
//     medium: "АНАЛІТИЧНА - пояснення, описи процесів, порівняння",
//     hard: "СИНТЕТИЧНА - аргументація, аналіз, оцінка, формулювання висновків"
//   };
//   return types[difficulty] || types.medium;
// }

// function getAnswerOptionsComplexity(difficulty) {
//   const complexities = {
//     easy: "Варіанти відповідей мають бути чіткими, конкретними, без двозначностей. Правильна відповідь очевидна при знанні тексту. Неправильні варіанти мають бути явно помилковими.",
//     medium: "Варіанти можуть містити нюанси, часткові істини. Правильна відповідь вимагає розуміння, а не лише пам'яті. Деякі варіанти можуть бути правдоподібними, але неповними.",
//     hard: "Варіанти можуть бути схожими, містити умовні конструкції, вимагати оцінки та синтезу. Можуть бути кілька частково правильних варіантів, але лише один(кілька) повністю вірних."
//   };
//   return complexities[difficulty];
// }

// function getCorrectAnswersCount(difficulty) {
//   const counts = {
//     easy: "1-2",
//     medium: "2-3", 
//     hard: "2-3 (з нюансованими відмінностями)"
//   };
//   return counts[difficulty] || "2-3";
// }

// function getTrueFalseComplexity(difficulty) {
//   const complexities = {
//     easy: "Твердження має бути або явно правильним, або явно неправильним на основі прямої інформації з тексту.",
//     medium: "Твердження може вимагати інтеграції інформації з різних частин тексту для визначення його істинності.",
//     hard: "Твердження може стосуватися інтерпретацій, оцінок або гіпотетичних ситуацій, що вимагають критичного мислення."
//   };
//   return complexities[difficulty];
// }

// function getShortAnswerComplexity(difficulty) {
//   const complexities = {
//     easy: "Відповідь має бути короткою (1-3 слова) і безпосередньо міститися в тексті.",
//     medium: "Відповідь може бути довшою (1-2 речення) і вимагати синтезу кількох фактів з тексту.",
//     hard: "Відповідь може бути розгорнутою (2-4 речення) і вимагати аналізу, аргументації або оцінки."
//   };
//   return complexities[difficulty];
// }

// /**
//  * ЗАГАЛЬНІ ДОПОМІЖНІ ФУНКЦІЇ
//  */

// function getTextExcerpt(fullText, currentIndex, totalCount) {
//   const textParts = splitTextIntoParts(fullText, totalCount);
//   const partIndex = currentIndex % textParts.length;
//   return textParts[partIndex];
// }

// function splitTextIntoParts(text, partsCount) {
//   const partLength = Math.floor(text.length / Math.max(partsCount, 1));
//   const parts = [];
  
//   for (let i = 0; i < partsCount; i++) {
//     const start = i * partLength;
//     const end = (i + 1) * partLength;
//     const part = text.substring(start, Math.min(end, text.length));
//     if (part.trim().length > 0) {
//       parts.push(part + (end < text.length ? '...' : ''));
//     }
//   }
  
//   // Якщо частин менше ніж потрібно, додаємо весь текст
//   if (parts.length === 0 && text.trim().length > 0) {
//     parts.push(text);
//   }
  
//   return parts;
// }

// function getDifficultyText(difficulty) {
//   const difficultyMap = {
//     easy: 'ПРОСТОГО',
//     medium: 'СЕРЕДНЬОГО', 
//     hard: 'СКЛАДНОГО'
//   };
//   return difficultyMap[difficulty] || 'СЕРЕДНЬОГО';
// }

// function getTemperatureByDifficulty(difficulty) {
//   const temperatures = {
//     easy: 0.3,    // Менша варіативність - точні факти
//     medium: 0.6,  // Середня варіативність - інтерпретації
//     hard: 0.9     // Висока варіативність - творчі підходи
//   };
//   return temperatures[difficulty] || 0.6;
// }

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// export { clearQuestionCache };

import { callOpenRouter, checkOpenRouterAvailability, clearQuestionCache } from './openRouterService.js';
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

  clearQuestionCache();

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

  console.log(`🚀 Початок генерації ${totalQuestions} питань (рівень: ${difficulty})`);

  // 🔄 НОВА ФУНКЦІЯ ДЛЯ ПАУЗИ З ТАЙМАУТОМ 30 ХВИЛИН
  const waitIfPaused = async () => {
    if (!shouldStop || !shouldStop()) return false; // Якщо не на паузі - продовжуємо
    
    console.log('⏸️ Генерація на паузі, очікування...');
    const startTime = Date.now();
    const timeout = 30 * 60 * 1000; // 30 хвилин
    
    while (shouldStop && shouldStop()) {
      // Перевіряємо таймаут
      if (Date.now() - startTime > timeout) {
        console.log('⏰ Досягнуто максимальний час очікування (30 хв)');
        return true; // Таймаут - зупиняємо генерацію
      }
      
      // Чекаємо 1 секунду перед наступною перевіркою
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('▶️ Продовження генерації після паузи');
    return false; // Продовжуємо генерацію
  };

  // 🔄 ГЕНЕРАЦІЯ КОЖНОГО ТИПУ ПИТАНЬ З ПЕРЕВІРКОЮ ПАУЗИ
  const generateQuestionType = async (count, generator, typeName) => {
    for (let i = 0; i < count; i++) {
      // 🔄 ПЕРЕВІРКА ПАУЗИ ПЕРЕД КОЖНИМ ПИТАННЯМ
      const shouldCancel = await waitIfPaused();
      if (shouldCancel) {
        console.log(`⏹️ Генерацію перервано через таймаут паузи. Згенеровано ${generatedQuestions.length} питань`);
        return true; // Скасування через таймаут
      }
      
      // 🔄 ПЕРЕВІРКА СКАСУВАННЯ
      if (shouldStop && shouldStop()) {
        console.log(`⏹️ Генерацію скасовано. Згенеровано ${generatedQuestions.length} питань`);
        return true; // Скасування користувачем
      }
      
      try {
        const question = await generator(i, count);
        generatedQuestions.push(question);
        updateProgress();
        await delay(1200); // Затримка між запитами
      } catch (error) {
        if (error.message === 'DUPLICATE_QUESTION') {
          console.log('🔄 Знайдено дубль, спробуємо згенерувати інше питання...');
          i--;
          await delay(500);
          continue;
        }
        console.error(`Помилка генерації питання ${typeName}:`, error);
        throw error;
      }
    }
    return false; // Успішно завершено
  };

  // 🎯 ГЕНЕРАЦІЯ КОЖНОГО ТИПУ ПИТАНЬ
  const generators = [
    { count: singleChoice, generator: (i, total) => generateSingleChoiceQuestion(textContent, difficulty, keywords, i, total), name: 'singleChoice' },
    { count: multipleChoice, generator: (i, total) => generateMultipleChoiceQuestion(textContent, difficulty, keywords, i, total), name: 'multipleChoice' },
    { count: trueFalse, generator: (i, total) => generateTrueFalseQuestion(textContent, difficulty, keywords, i, total), name: 'trueFalse' },
    { count: shortAnswer, generator: (i, total) => generateShortAnswerQuestion(textContent, difficulty, keywords, i, total), name: 'shortAnswer' }
  ];

  for (const { count, generator, name } of generators) {
    if (count > 0) {
      console.log(`📝 Генерація ${count} питань типу ${name}`);
      const wasCancelled = await generateQuestionType(count, generator, name);
      if (wasCancelled) {
        return generatedQuestions; // Повертаємо що встигли згенерувати
      }
    }
  }

  console.log(`✅ Генерацію завершено! Створено ${generatedQuestions.length} питань`);
  return generatedQuestions;
}

async function generateSingleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
  const prompt = createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'singleChoice'
  });
  return { ...response, type: 'singleChoice' };
}

async function generateMultipleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount) {
  const prompt = createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'multipleChoice'
  });
  return { ...response, type: 'multipleChoice' };
}

async function generateTrueFalseQuestion(text, difficulty, keywords, currentIndex, totalCount) {
  const prompt = createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'trueFalse'
  });
  return { ...response, type: 'trueFalse' };
}

async function generateShortAnswerQuestion(text, difficulty, keywords, currentIndex, totalCount) {
  const prompt = createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'shortAnswer'
  });
  return { ...response, type: 'shortAnswer' };
}

function createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'singleChoice');
  const languageComplexity = getLanguageComplexity(difficulty);
  
  return `
Створи тестове запитання ${getDifficultyText(difficulty)} рівня з однією правильною відповіддю.

ТЕКСТ:
${truncatedText}

За можливості використовуй такі КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
${difficultyInstructions}

${languageComplexity}

КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

СТРУКТУРА ВІДПОВІДЕЙ:
- 4 варіанти відповіді, лише один правильний
- Неправильні варіанти мають бути правдоподібними, але помилковими
- ${getAnswerOptionsComplexity(difficulty)}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання",
  "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
  "correctIndex": 0,
  "explanation": "детальне пояснення з посиланням на конкретні частини тексту"
}
`;
}

function createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'multipleChoice');
  const languageComplexity = getLanguageComplexity(difficulty);
  
  return `
Створи запитання ${getDifficultyText(difficulty)} рівня з множинним вибором.

ТЕКСТ:
${truncatedText}

За можливості використовуй такі КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
${difficultyInstructions}

${languageComplexity}

ТИП ПИТАННЯ: ${getMultipleChoiceType(difficulty)}
КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

СТРУКТУРА ВІДПОВІДЕЙ:
- 4 варіанти відповіді
- ${getCorrectAnswersCount(difficulty)} правильних відповіді(ей)
- Варіанти мають бути логічно пов'язані

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання",
  "options": ["варіант1", "варіант2", "варіант3", "варіант4"],
  "correctIndexes": [0, 2],
  "explanation": "пояснення чому саме ці варіанти правильні з посиланням на текст"
}
`;
}

function createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'trueFalse');
  const languageComplexity = getLanguageComplexity(difficulty);
  
  return `
Створи твердження ${getDifficultyText(difficulty)} рівня для перевірки (Правда/Неправда).

ТЕКСТ:
${truncatedText}

За можливості використовуй такі КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
${difficultyInstructions}

${languageComplexity}

ТИП ТВЕРДЖЕННЯ: ${getTrueFalseType(difficulty)}
КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

ВИМОГИ ДО ТВЕРДЖЕННЯ:
- Чітке та однозначне
- Може бути перевірене на основі тексту
- ${getTrueFalseComplexity(difficulty)}

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "твердження",
  "correctAnswer": true,
  "explanation": "детальне пояснення чому це правда/неправда з конкретними посиланнями на текст"
}
`;
}

function createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'shortAnswer');
  const languageComplexity = getLanguageComplexity(difficulty);
  
  return `
Створи запитання ${getDifficultyText(difficulty)} рівня з короткою відповіддю.

ТЕКСТ:
${truncatedText}

За можливості використовуй такі КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
РІВЕНЬ СКЛАДНОСТІ: ${difficulty.toUpperCase()}

СПЕЦИФІЧНІ ВИМОГИ ДЛЯ ${difficulty.toUpperCase()} РІВНЯ:
${difficultyInstructions}

${languageComplexity}

ТИП ВІДПОВІДІ: ${getShortAnswerType(difficulty)}
КОГНІТИВНИЙ ФОКУС: ${getCognitiveFocus(difficulty, currentIndex)}
ПИТАННЯ ${currentIndex + 1} З ${totalCount} - має бути унікальним

ВИМОГИ ДО ВІДПОВІДІ:
- Відповідь має бути конкретною та обґрунтованою текстом
- ${getShortAnswerComplexity(difficulty)}
- Очікувана відповідь має містити ключові елементи

ФОРМАТ ВІДПОВІДІ (JSON):
{
  "text": "текст запитання", 
  "expectedAnswer": "очікувана відповідь",
  "explanation": "пояснення відповіді з посиланням на відповідні частини тексту"
}
`;
}

function getDifficultySpecificInstructions(difficulty, questionType) {
  const instructions = {
    easy: {
      singleChoice: "Питання має перевіряти запам'ятовування базових фактів, термінів, дат, назв. Використовуй прямі цитати або очевидні факти з тексту. Уникай інтерпретацій та аналізу.",
      multipleChoice: "Створи питання на визначення основних понять, перелік очевидних характеристик. Правильні відповіді мають бути явними з тексту. Усі неправильні варіанти мають бути явно помилковими.",
      trueFalse: "Твердження мають бути простими, очевидними фактами, які легко перевірити в тексті. Уникай інтерпретацій, умовних конструкцій та оціночних суджень.",
      shortAnswer: "Питання мають вимагати коротких, конкретних відповідей: імена, дати, терміни, прості визначення. Відповідь має бути прямо в тексті."
    },
    medium: {
      singleChoice: "Питання мають перевіряти розуміння причинно-наслідкових зв'язків, порівняння понять, аналіз процесів. Потрібно мислення на рівні 'чому' та 'як'. Можеш використовувати інформацію з різних частин тексту.",
      multipleChoice: "Створи питання на встановлення зв'язків між поняттями, аналіз характеристик, визначення послідовностей. Деякі варіанти можуть бути частково правильними. Потрібне розуміння контексту.",
      trueFalse: "Твердження мають перевіряти розуміння концепцій, можуть містити логічні висновки, що випливають з тексту. Можуть вимагати інтеграції інформації з різних частин тексту.",
      shortAnswer: "Питання мають вимагати пояснень, коротких описів процесів, порівнянь, аналізу простих зв'язків. Відповідь може вимагати синтезу кількох фактів з тексту."
    },
    hard: {
      singleChoice: "Питання мають перевіряти здатність до синтезу, оцінки, прогнозування. Можуть поєднувати кілька концепцій, вимагати застосування знань в нових ситуаціях. Можуть стосуватися гіпотетичних сценаріїв.",
      multipleChoice: "Створи складні питання на оцінку, прогнозування наслідків, вибір оптимальних рішень. Варіанти можуть містити нюансовані відмінності. Можуть вимагати критичного мислення та оцінки альтернатив.",
      trueFalse: "Твердження мають бути складними, можуть містити умовні конструкції, оціночні судження, потребувати глибокого розуміння матеріалу. Можуть стосуватися інтерпретацій та висновків, що не є явно зазначеними в тексті.",
      shortAnswer: "Питання мають вимагати аргументації, обґрунтування позицій, аналізу альтернатив, формулювання висновків. Відповідь може вимагати критичного осмислення та оцінки інформації з тексту."
    }
  };
  
  return instructions[difficulty]?.[questionType] || "";
}

function getLanguageComplexity(difficulty) {
  const complexities = {
    easy: "ВИКОРИСТОВУЙ: просту лексику, короткі речення, конкретні формулювання. УНИКАЙ: складних термінів, абстрактних понять, умовних конструкцій.",
    medium: "ВИКОРИСТОВУЙ: спеціальну термінологію, складніші синтаксичні конструкції, аналітичні формулювання. МОЖНА: умовні речення, порівняння.",
    hard: "ВИКОРИСТОВУЙ: абстрактні поняття, складну термінологію, умовні конструкції, гіпотетичні сценарії, оціночні судження. ВИМАГАЙ: критичного мислення."
  };
  return complexities[difficulty] || "";
}

function getCognitiveFocus(difficulty, index) {
  const focuses = {
    easy: [
      "запам'ятовуванні конкретних фактів",
      "визначенні основних понять", 
      "переліку ключових елементів",
      "ідентифікації основних об'єктів",
      "назвах та датах",
      "простій класифікації",
      "основних характеристиках",
      "очевидних послідовностях"
    ],
    medium: [
      "розумінні причинно-наслідкових зв'язків",
      "порівнянні понять та явищ",
      "аналізі процесів та механізмів",
      "класифікації складних явищ",
      "поясненні принципів дії",
      "встановленні взаємозв'язків",
      "інтерпретації фактів",
      "аналізі структури"
    ],
    hard: [
      "синтезі інформації з різних частин тексту",
      "оцінці явищ та процесів",
      "прогнозуванні наслідків та тенденцій",
      "аргументації позицій та висновків",
      "аналізі альтернатив та гіпотез",
      "критичному оцінюванні інформації",
      "створенні власних інтерпретацій",
      "застосуванні знань в нових контекстах"
    ]
  };
  
  const levelFocuses = focuses[difficulty] || focuses.medium;
  return levelFocuses[index % levelFocuses.length];
}

function getMultipleChoiceType(difficulty) {
  const types = {
    easy: "ВИЗНАЧЕННЯ/ПЕРЕЛІК - вибір правильних визначень, складових, характеристик з явно правильними та неправильними варіантами",
    medium: "ПОРІВНЯННЯ/АНАЛІЗ - вибір відповідних порівнянь, аналізів, пояснень з нюансованими варіантами",
    hard: "ОЦІНКА/СИНТЕЗ - вибір оптимальних рішень, оцінок, синтез різних концепцій з гіпотетичними сценаріями"
  };
  return types[difficulty] || types.medium;
}

function getTrueFalseType(difficulty) {
  const types = {
    easy: "ФАКТИЧНЕ - перевірка конкретних фактів, явно зазначених у тексті",
    medium: "ІНТЕРПРЕТАЦІЙНЕ - перевірка логічних висновків та інтерпретацій",
    hard: "ОЦІНОЧНЕ - перевірка оціночних суджень, гіпотез, альтернативних поглядів"
  };
  return types[difficulty] || types.medium;
}

function getShortAnswerType(difficulty) {
  const types = {
    easy: "ФАКТОЛОГІЧНА - конкретні факти, визначення, прості переліки",
    medium: "АНАЛІТИЧНА - пояснення, описи процесів, порівняння",
    hard: "СИНТЕТИЧНА - аргументація, аналіз, оцінка, формулювання висновків"
  };
  return types[difficulty] || types.medium;
}

function getAnswerOptionsComplexity(difficulty) {
  const complexities = {
    easy: "Варіанти відповідей мають бути чіткими, конкретними, без двозначностей. Правильна відповідь очевидна при знанні тексту. Неправильні варіанти мають бути явно помилковими.",
    medium: "Варіанти можуть містити нюанси, часткові істини. Правильна відповідь вимагає розуміння, а не лише пам'яті. Деякі варіанти можуть бути правдоподібними, але неповними.",
    hard: "Варіанти можуть бути схожими, містити умовні конструкції, вимагати оцінки та синтезу. Можуть бути кілька частково правильних варіантів, але лише один(кілька) повністю вірних."
  };
  return complexities[difficulty];
}

function getCorrectAnswersCount(difficulty) {
  const counts = {
    easy: "1-2",
    medium: "2-3", 
    hard: "2-3 (з нюансованими відмінностями)"
  };
  return counts[difficulty] || "2-3";
}

function getTrueFalseComplexity(difficulty) {
  const complexities = {
    easy: "Твердження має бути або явно правильним, або явно неправильним на основі прямої інформації з тексту.",
    medium: "Твердження може вимагати інтеграції інформації з різних частин тексту для визначення його істинності.",
    hard: "Твердження може стосуватися інтерпретацій, оцінок або гіпотетичних ситуацій, що вимагають критичного мислення."
  };
  return complexities[difficulty];
}

function getShortAnswerComplexity(difficulty) {
  const complexities = {
    easy: "Відповідь має бути короткою (1-3 слова) і безпосередньо міститися в тексті.",
    medium: "Відповідь може бути довшою (1-2 речення) і вимагати синтезу кількох фактів з тексту.",
    hard: "Відповідь може бути розгорнутою (2-4 речення) і вимагати аналізу, аргументації або оцінки."
  };
  return complexities[difficulty];
}

function getTextExcerpt(fullText, currentIndex, totalCount) {
  const textParts = splitTextIntoParts(fullText, totalCount);
  const partIndex = currentIndex % textParts.length;
  return textParts[partIndex];
}

function splitTextIntoParts(text, partsCount) {
  const partLength = Math.floor(text.length / Math.max(partsCount, 1));
  const parts = [];
  
  for (let i = 0; i < partsCount; i++) {
    const start = i * partLength;
    const end = (i + 1) * partLength;
    const part = text.substring(start, Math.min(end, text.length));
    if (part.trim().length > 0) {
      parts.push(part + (end < text.length ? '...' : ''));
    }
  }
  
  // Якщо частин менше ніж потрібно, додаємо весь текст
  if (parts.length === 0 && text.trim().length > 0) {
    parts.push(text);
  }
  
  return parts;
}

function getDifficultyText(difficulty) {
  const difficultyMap = {
    easy: 'ПРОСТОГО',
    medium: 'СЕРЕДНЬОГО', 
    hard: 'СКЛАДНОГО'
  };
  return difficultyMap[difficulty] || 'СЕРЕДНЬОГО';
}

function getTemperatureByDifficulty(difficulty) {
  const temperatures = {
    easy: 0.3,    // Менша варіативність - точні факти
    medium: 0.6,  // Середня варіативність - інтерпретації
    hard: 0.9     // Висока варіативність - творчі підходи
  };
  return temperatures[difficulty] || 0.6;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { clearQuestionCache };