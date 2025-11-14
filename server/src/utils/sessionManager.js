// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const TEMP_STORAGE = path.join(__dirname, "..", "src", "temp");

// const sessions = new Map(); // sessionId -> { filePath, lastActive }

// // додаємо нову сесію
// export function createSession(sessionId, filePath) {
//   sessions.set(sessionId, { filePath, lastActive: Date.now() });
//   console.log(`Створено сесію: ${sessionId}`);
// }

// // оновлюємо активність
// export function updateSessionActivity(sessionId) {
//   if (sessions.has(sessionId)) {
//     sessions.get(sessionId).lastActive = Date.now();
//     console.log(`Активація оновлена для сесії ${sessionId}`);
//   }
// }

// // очищаємо неактивні сесії
// export function cleanupInactiveSessions() {
//   const now = Date.now();
//   const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 хв

//   for (const [sessionId, { filePath, lastActive }] of sessions.entries()) {
//     if (now - lastActive > INACTIVITY_LIMIT) {
//       try {
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//           console.log(`Видалено файл за неактивну сесію: ${sessionId}`);
//         }
//       } catch (err) {
//         console.error(`Помилка видалення файлу ${filePath}:`, err);
//       } finally {
//         sessions.delete(sessionId);
//       }
//     }
//   }
// }

// // запускаємо автоматичне очищення кожні 10 хв
// setInterval(cleanupInactiveSessions, 10 * 60 * 1000);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");
console.log("TEMP_STORAGE у sessionManager:", TEMP_STORAGE);

const sessions = new Map(); // sessionId -> { filePath, lastActive }

// додаємо нову сесію
export function createSession(sessionId, filePath) {
  sessions.set(sessionId, { filePath, lastActive: Date.now() });
  console.log(`Створено сесію: ${sessionId}, файл: ${filePath}`);
}

// отримуємо сесію
export function getSession(sessionId) {
  if (sessions.has(sessionId)) {
    // оновлюємо активність при зверненні
    sessions.get(sessionId).lastActive = Date.now();
    return sessions.get(sessionId);
  }
  return null;
}

// оновлюємо дані сесії
export function updateSession(sessionId, newData) {
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    session.data = { ...session.data, ...newData };
    session.lastActive = Date.now();
    console.log(`Оновлено сесію: ${sessionId}`);
    return true;
  }
  return false;
}

// оновлюємо активність
export function updateSessionActivity(sessionId) {
  if (sessions.has(sessionId)) {
    sessions.get(sessionId).lastActive = Date.now();
    console.log(`Активація оновлена для сесії ${sessionId}`);
  }
}

// очищаємо неактивні сесії
export function cleanupInactiveSessions() {
  const now = Date.now();
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 хв
  let cleanedCount = 0;

  for (const [sessionId, { filePath, lastActive }] of sessions.entries()) {
    if (now - lastActive > INACTIVITY_LIMIT) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Видалено файл за неактивну сесію: ${sessionId}`);
          cleanedCount++;
        } else {
          console.log(`⚠️ Файл не знайдено (вже видалений?): ${filePath}`);
        }
      } catch (err) {
        console.error(`❌ Помилка видалення файлу ${filePath}:`, err);
      } finally {
        sessions.delete(sessionId);
      }
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Очищено ${cleanedCount} неактивних сесій`);
  }
}

// запускаємо автоматичне очищення кожні 10 хв
setInterval(cleanupInactiveSessions, 10 * 60 * 1000);