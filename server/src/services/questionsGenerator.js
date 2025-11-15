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