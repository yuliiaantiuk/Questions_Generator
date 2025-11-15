import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Цільові папки для перевірки
const TARGET_DIRS = [
  './server',
  './client/src'
];

// Розширення файлів для перевірки
const CHECK_EXTENSIONS = ['.js', '.jsx', '.json', '.mjs'];

// Файли, які точно потрібно ігнорувати (навіть якщо не використовуються)
const IGNORE_FILES = [
  'package.json',
  'package-lock.json',
  'server.js',
  'AppRoutes.js',
  'App.jsx',
  'main.jsx'
];

// Функція для отримання всіх файлів у директорії
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Функція для пошуку використання файлу в інших файлах
function isFileUsed(filePath, allFiles) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
  
  // Ігноруємо деякі файли
  if (IGNORE_FILES.includes(fileName)) {
    return true;
  }

  // Перевіряємо кожен файл на наявність посилань
  for (const checkFile of allFiles) {
    if (checkFile === filePath) continue;
    
    try {
      const content = fs.readFileSync(checkFile, 'utf8');
      
      // Перевірка імпортів
      if (content.includes(fileNameWithoutExt) || 
          content.includes(`'./${fileName}'`) ||
          content.includes(`"./${fileName}"`) ||
          content.includes(`'../${fileName}'`) ||
          content.includes(`"../${fileName}"`)) {
        console.log(`✅ ${fileName} використовується в: ${checkFile}`);
        return true;
      }
    } catch (error) {
      // Пропускаємо файли, які не вдається прочитати
      continue;
    }
  }
  
  return false;
}

// Головна функція
function findUnusedFiles() {
  console.log('🔍 Пошук невикористаних файлів...\n');
  
  const allFiles = [];
  TARGET_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles.push(...getAllFiles(dir));
    }
  });

  // Фільтруємо тільки JavaScript/JSON файли
  const targetFiles = allFiles.filter(file => 
    CHECK_EXTENSIONS.includes(path.extname(file)) &&
    !file.includes('node_modules')
  );

  console.log(`📁 Знайдено ${targetFiles.length} файлів для перевірки\n`);

  const unusedFiles = [];
  const usedFiles = [];

  for (const file of targetFiles) {
    if (isFileUsed(file, targetFiles)) {
      usedFiles.push(file);
    } else {
      unusedFiles.push(file);
      console.log(`❌ ${file} - НЕ ВИКОРИСТОВУЄТЬСЯ`);
    }
  }

  console.log('\n📊 РЕЗУЛЬТАТ:');
  console.log(`✅ Використовується: ${usedFiles.length} файлів`);
  console.log(`❌ Не використовується: ${unusedFiles.length} файлів`);
  
  // Записуємо результати у файл
  fs.writeFileSync('./unused-files-report.json', JSON.stringify({
    used: usedFiles,
    unused: unusedFiles,
    generated: new Date().toISOString()
  }, null, 2));

  console.log('\n📄 Детальний звіт збережено у: unused-files-report.json');
  
  return unusedFiles;
}

// Запускаємо перевірку
findUnusedFiles();