import fs from "fs";

const origReaddir = fs.readdir;
const origSync = fs.readdirSync;
const origProm = fs.promises.readdir;

function logErrorWithFile(funcName, pathArg) {
  if (typeof pathArg === "string" &&
      (pathArg.includes("server\temp") || pathArg.includes("server/temp"))) {
    console.log(`❌ ПОМИЛКА: ${funcName} викликано з неправильним шляхом ->`, pathArg);
    console.trace("🔍 Стек виклику:");
  }
}

fs.readdir = function (...args) {
  logErrorWithFile("fs.readdir", args[0]);
  return origReaddir.apply(this, args);
};

fs.readdirSync = function (...args) {
  logErrorWithFile("fs.readdirSync", args[0]);
  return origSync.apply(this, args);
};

if (fs.promises) {
  fs.promises.readdir = async function (...args) {
    logErrorWithFile("fs.promises.readdir", args[0]);
    return origProm.apply(this, args);
  };
}

export default fs;
