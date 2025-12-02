import { callOpenRouter, checkOpenRouterAvailability, clearQuestionCache } from './openRouterService.js';
import fs from 'fs';

const activeGenerations = new Map();
const generationProgress = new Map();

// Function to update progress globally
function updateGenerationProgress(sessionId, progressValue) {
  if (generationProgress.has(sessionId)) {
    const progress = generationProgress.get(sessionId);
    progress.progress = progressValue;
    if (progressValue === 100) {
      progress.status = "completed";
    }
  }
}

// Function to get generation status
function getGenerationStatus(sessionId) {
  return generationProgress.get(sessionId);
}
// Main function to generate questions
export async function hfGenerateQuestions(config, onProgress, shouldStop) {
  const { sessionId } = config;
  
  const existingProgress = getGenerationStatus(sessionId);
  if (existingProgress && existingProgress.status === "generating") {
    console.log(`⚠️ Global progress shows generation already running for ${sessionId}`);
  }

  // Перевірка чи вже виконується генерація для цієї сесії
  if (!checkAndSetGenerationStatus(sessionId)) {
    throw new Error('GENERATION_ALREADY_IN_PROGRESS');
  }

  try {
    const MAX_GENERATION_TIME = 15 * 60 * 1000; 
    const startTime = Date.now();

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
    const existingQuestions = generatedQuestions.map(q => q.text);

    clearQuestionCache();

    // Check OpenRouter API availability
    const isApiAvailable = await checkOpenRouterAvailability();
    if (!isApiAvailable) {
      throw new Error('OpenRouter API is unavailable. Please check your connection or API key.');
    }

    const updateProgress = () => {
      completed++;
      const progress = Math.round((completed / totalQuestions) * 100);
      onProgress(progress); // Оригінальний callback
      updateGenerationProgress(sessionId, progress); // Додаткове оновлення
    };


    console.log(`Початок генерації ${totalQuestions} питань (рівень: ${difficulty})`);

    // Pause handling with 30-minute timeout
    const waitIfPaused = async () => {
      if (!shouldStop || !shouldStop()) return false; // If not paused, continue
      
      console.log('⏸ Generation paused, waiting...');
      const startTime = Date.now();
      const timeout = 30 * 60 * 1000; // 30 minutes
      
      while (shouldStop && shouldStop()) {
        // Check timeout
        if (Date.now() - startTime > timeout) {
          console.log('Reached maximum wait time (30 minutes)');
          return true; // Timeout - stop generation
        }
        
        // Wait 1 second before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Resuming generation after pause');
      return false; // Continue generation
    };

    // Generate questions by type
    const generateQuestionType = async (count, generator, typeName) => {
      for (let i = 0; i < count; i++) {
        let retryCount = 0;
        if (Date.now() - startTime > MAX_GENERATION_TIME) {
          console.log(`Reached maximum generation time (15 minutes), stopping. Generated ${generatedQuestions.length} questions`);
          return true;
        }

        const shouldCancel = await waitIfPaused();
        if (shouldCancel) {
          console.log(`Generation paused timeout reached. Generated ${generatedQuestions.length} questions`);
          return true;
        }

        if (shouldStop && shouldStop()) {
          console.log(`Generation cancelled. Generated ${generatedQuestions.length} questions`);
          return true; 
        }
        
        try {
          const question = await generator(i, count);
          generatedQuestions.push(question);
          updateProgress();
          await delay(1200);
        } catch (error) {
          if (error.message === "DUPLICATE_QUESTION") {
            console.log("Duplicate question detected, regenerating...");
            const maxRetries = 5;
            if (retryCount < maxRetries) {
              retryCount++;
              i--; // Спробувати знову те саме питання
              await delay(500);
              continue;
            } else {
              console.log("Max retries for duplicate question, skipping this question");
              // Пропускаємо це питання, не зменшуємо i
              continue;
            }
          }

          if (error.message === "INVALID_JSON") {
            console.warn(`⚠️ Model returned invalid JSON. Retrying generation...`);
            i--;
            await delay(800);
            continue;
          }

          console.error(`Unexpected error generating ${typeName}:`, error);
          throw error;
        }
      }
      return false; 
    };

    const generators = [
      { count: singleChoice, generator: (i, total) => generateSingleChoiceQuestion(textContent, difficulty, keywords, i, total), name: 'singleChoice' },
      { count: multipleChoice, generator: (i, total) => generateMultipleChoiceQuestion(textContent, difficulty, keywords, i, total), name: 'multipleChoice' },
      { count: trueFalse, generator: (i, total) => generateTrueFalseQuestion(textContent, difficulty, keywords, i, total), name: 'trueFalse' },
      { count: shortAnswer, generator: (i, total) => generateShortAnswerQuestion(textContent, difficulty, keywords, i, total), name: 'shortAnswer' }
    ];

    for (const { count, generator, name } of generators) {
      if (count > 0) {
        console.log(`Generating ${count} questions of type ${name}`);
        const wasCancelled = await generateQuestionType(count, generator, name);
        if (wasCancelled) {
          return generatedQuestions; // Return what has been generated so far
        }
      }
    }

    console.log(`Generation completed! Created ${generatedQuestions.length} questions`);
    return generatedQuestions;
    
  } finally {
    // ВАЖЛИВО: завжди очищаємо статус навіть при помилці
    clearGenerationStatus(sessionId);
  }
}
// Function to check and set generation status for a session
function checkAndSetGenerationStatus(sessionId) {
  if (!sessionId) {
    console.log('⚠️ Invalid sessionId provided, cannot start generation');
    return false;
  }

  if (activeGenerations.has(sessionId)) {
    console.log(`⚠️ Active generation found for session ${sessionId}, skipping duplicate`);
    return false;
  }
  activeGenerations.set(sessionId, Date.now());
  return true; // Can start a new generation
}

function clearGenerationStatus(sessionId) {
  activeGenerations.delete(sessionId);
}

setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sessionId, timestamp] of activeGenerations.entries()) {
    // Якщо генерація "зависла" більше ніж на 10 хвилин
    if (now - timestamp > 10 * 60 * 1000) {
      activeGenerations.delete(sessionId);
      console.log(`Cleaned up stale generation for session ${sessionId}`);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`✅ Periodically cleaned ${cleanedCount} stale generation entries`);
  }
}, 10 * 60 * 1000);

// Function to generate a single choice question
async function generateSingleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount, existingQuestions) {
  const prompt = createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'singleChoice',
    existingQuestions
  });
  return { ...response, type: 'singleChoice' };
}

// Function to generate a multiple choice question
async function generateMultipleChoiceQuestion(text, difficulty, keywords, currentIndex, totalCount, existingQuestions) {
  const prompt = createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'multipleChoice',
    existingQuestions
  });
  return { ...response, type: 'multipleChoice' };
}

// Function to generate a true/false question
async function generateTrueFalseQuestion(text, difficulty, keywords, currentIndex, totalCount, existingQuestions) {
  const prompt = createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'trueFalse',
    existingQuestions
  });
  return { ...response, type: 'trueFalse' };
}

// Function to generate a short answer question
async function generateShortAnswerQuestion(text, difficulty, keywords, currentIndex, totalCount, existingQuestions) {
  const prompt = createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions);
  const response = await callOpenRouter(prompt, {
    temperature: getTemperatureByDifficulty(difficulty),
    questionType: 'shortAnswer',
    existingQuestions
  });
  return { ...response, type: 'shortAnswer' };
}

// Function to create single choice prompt
function createSingleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions = []) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'singleChoice');
  const languageComplexity = getLanguageComplexity(difficulty);
  
  const existingText = existingQuestions.length > 0
    ? `НЕ генеруй питання, яке вже є у цьому списку:\n${existingQuestions.map((q,i) => `${i+1}. ${q}`).join('\n')}`
    : '';

  return `
Створи тестове запитання ${getDifficultyText(difficulty)} рівня з однією правильною відповіддю.

ТЕКСТ:
${truncatedText}

Використовуй такі КЛЮЧОВІ СЛОВА: ${keywords.join(', ')}
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

// Function to create multiple choice prompt
function createMultipleChoicePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions = []) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'multipleChoice');
  const languageComplexity = getLanguageComplexity(difficulty);
  
    const existingText = existingQuestions.length > 0
    ? `НЕ генеруй питання, яке вже є у цьому списку:\n${existingQuestions.map((q,i) => `${i+1}. ${q}`).join('\n')}`
    : '';

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

// Function to create true/false prompt
function createTrueFalsePrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions = []) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'trueFalse');
  const languageComplexity = getLanguageComplexity(difficulty);
  
    const existingText = existingQuestions.length > 0
    ? `НЕ генеруй питання, яке вже є у цьому списку:\n${existingQuestions.map((q,i) => `${i+1}. ${q}`).join('\n')}`
    : '';

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

// Function to create short answer prompt
function createShortAnswerPrompt(text, difficulty, keywords, currentIndex, totalCount, existingQuestions = []) {
  const truncatedText = getTextExcerpt(text, currentIndex, totalCount);
  const difficultyInstructions = getDifficultySpecificInstructions(difficulty, 'shortAnswer');
  const languageComplexity = getLanguageComplexity(difficulty);
  
    const existingText = existingQuestions.length > 0
    ? `НЕ генеруй питання, яке вже є у цьому списку:\n${existingQuestions.map((q,i) => `${i+1}. ${q}`).join('\n')}`
    : '';

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

// Function to get difficulty specific instructions
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

// Function to get language complexity instructions
function getLanguageComplexity(difficulty) {
  const complexities = {
    easy: "ВИКОРИСТОВУЙ: просту лексику, короткі речення, конкретні формулювання. УНИКАЙ: складних термінів, абстрактних понять, умовних конструкцій.",
    medium: "ВИКОРИСТОВУЙ: спеціальну термінологію, складніші синтаксичні конструкції, аналітичні формулювання. МОЖНА: умовні речення, порівняння.",
    hard: "ВИКОРИСТОВУЙ: абстрактні поняття, складну термінологію, умовні конструкції, гіпотетичні сценарії, оціночні судження. ВИМАГАЙ: критичного мислення."
  };
  return complexities[difficulty] || "";
}

// Function to get cognitive focus
function getCognitiveFocus(difficulty, index) {
  const focuses = {
    easy: [
      "запам'ятовуванні конкретних фактів",
      "визначенні основних понять", 
      "переліку ключових елементів",
      "ідентифікації основних об'єктів",
      "назвах та датах (за можливості)",
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

// Function to get multiple choice type
function getMultipleChoiceType(difficulty) {
  const types = {
    easy: "ВИЗНАЧЕННЯ/ПЕРЕЛІК - вибір правильних визначень, складових, характеристик з явно правильними та неправильними варіантами",
    medium: "ПОРІВНЯННЯ/АНАЛІЗ - вибір відповідних порівнянь, аналізів, пояснень з нюансованими варіантами",
    hard: "ОЦІНКА/СИНТЕЗ - вибір оптимальних рішень, оцінок, синтез різних концепцій з гіпотетичними сценаріями"
  };
  return types[difficulty] || types.medium;
}

// Function to get true/false type
function getTrueFalseType(difficulty) {
  const types = {
    easy: "ФАКТИЧНЕ - перевірка конкретних фактів, явно зазначених у тексті",
    medium: "ІНТЕРПРЕТАЦІЙНЕ - перевірка логічних висновків та інтерпретацій",
    hard: "ОЦІНОЧНЕ - перевірка оціночних суджень, гіпотез, альтернативних поглядів"
  };
  return types[difficulty] || types.medium;
}

// Function to get short answer type
function getShortAnswerType(difficulty) {
  const types = {
    easy: "ФАКТОЛОГІЧНА - конкретні факти, визначення, прості переліки",
    medium: "АНАЛІТИЧНА - пояснення, описи процесів, порівняння",
    hard: "СИНТЕТИЧНА - аргументація, аналіз, оцінка, формулювання висновків"
  };
  return types[difficulty] || types.medium;
}

// Function to get answer options complexity
function getAnswerOptionsComplexity(difficulty) {
  const complexities = {
    easy: "Варіанти відповідей мають бути чіткими, конкретними, без двозначностей. Правильна відповідь очевидна при знанні тексту. Неправильні варіанти мають бути явно помилковими.",
    medium: "Варіанти можуть містити нюанси, часткові істини. Правильна відповідь вимагає розуміння, а не лише пам'яті. Деякі варіанти можуть бути правдоподібними, але неповними.",
    hard: "Варіанти можуть бути схожими, містити умовні конструкції, вимагати оцінки та синтезу. Можуть бути кілька частково правильних варіантів, але лише один(кілька) повністю вірних."
  };
  return complexities[difficulty];
}

// Function to get correct answers count
function getCorrectAnswersCount(difficulty) {
  const counts = {
    easy: "1-2",
    medium: "2-3", 
    hard: "2-3 (з нюансованими відмінностями)"
  };
  return counts[difficulty] || "2-3";
}

// Function to get true/false complexity
function getTrueFalseComplexity(difficulty) {
  const complexities = {
    easy: "Твердження має бути або явно правильним, або явно неправильним на основі прямої інформації з тексту.",
    medium: "Твердження може вимагати інтеграції інформації з різних частин тексту для визначення його істинності.",
    hard: "Твердження може стосуватися інтерпретацій, оцінок або гіпотетичних ситуацій, що вимагають критичного мислення."
  };
  return complexities[difficulty];
}

// Function to get short answer complexity
function getShortAnswerComplexity(difficulty) {
  const complexities = {
    easy: "Відповідь має бути короткою (1-3 слова) і безпосередньо міститися в тексті.",
    medium: "Відповідь може бути довшою (1-2 речення) і вимагати синтезу кількох фактів з тексту.",
    hard: "Відповідь може бути розгорнутою (2-4 речення) і вимагати аналізу, аргументації або оцінки."
  };
  return complexities[difficulty];
}

// Function to get text excerpt for a given part
function getTextExcerpt(fullText, currentIndex, totalCount) {
  const textParts = splitTextIntoParts(fullText, totalCount);
  const partIndex = currentIndex % textParts.length;
  return textParts[partIndex];
}

// Function to split text into parts
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
  
  // If no parts were created, return the full text as one part
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
    easy: 0.3,    // Lower variability - precise facts
    medium: 0.6,  // Medium variability - interpretations
    hard: 0.9     // High variability - creative approaches
  };
  return temperatures[difficulty] || 0.6;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { clearQuestionCache };