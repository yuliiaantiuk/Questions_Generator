from fastapi import FastAPI, HTTPException, Body
import hashlib
import logging
from typing import List

from models.schemas import TextRequest
from services.keyword_extractor import KeywordExtractor
from services.cache_manager import CacheManager

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("keyword-service")

# Ініціалізація додатку
app = FastAPI(title="Keyword extraction service (uk)")

# Ініціалізація сервісів
keyword_extractor = KeywordExtractor()
cache_manager = CacheManager()

@app.post("/keywords", response_model=List[str])
async def extract_keywords(req: TextRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    
    session_id = hashlib.md5(text.encode("utf-8")).hexdigest()
    top_n = max(1, min(100, int(req.top_n or 7)))
    
    # Перевірка кешу
    cached_keywords = cache_manager.get(session_id)
    if cached_keywords:
        logger.info(f"Повертаю збережені ключові слова для session_id={session_id}")
        return cached_keywords
    
    try:
        # Вилучення ключових слів
        keywords = keyword_extractor.extract_keywords(text, top_n)
        
        # Збереження в кеш
        cache_manager.set(session_id, keywords)
        logger.info(f"Збережено ключові слова для session_id={session_id}")
        
        return keywords
        
    except Exception as e:
        logger.exception("Error extracting keywords: %s", e)
        raise HTTPException(status_code=500, detail="Keyword extraction failed")

@app.post("/save_keywords")
async def save_keywords(session_id: str = Body(...), keywords: List[str] = Body(...)):
    if not session_id or not isinstance(keywords, list):
        raise HTTPException(status_code=400, detail="Invalid data")
    
    cache_manager.set(session_id, keywords)
    logger.info(f"Оновлено ключові слова для session_id={session_id}")
    return {"status": "saved", "count": len(keywords)}

@app.get("/get_keywords/{session_id}")
async def get_keywords(session_id: str):
    keywords = cache_manager.get(session_id)
    if keywords:
        logger.info(f"Повертаю ключові слова для session_id={session_id}, кількість: {len(keywords)}")
        return keywords
    else:
        logger.info(f"Ключові слова не знайдені для session_id={session_id}")
        return []

@app.delete("/cleanup_keywords")
async def manual_cleanup_keywords():
    deleted_count = cache_manager.cleanup_old_entries()
    return {
        "status": "success",
        "deleted_count": deleted_count,
        "remaining_count": len(cache_manager.session_keywords)
    }

@app.get("/cache_status")
async def get_cache_status():
    return cache_manager.get_stats()

@app.get("/")
async def root():
    return {
        "message": "Keyword Extraction Service (Ukrainian)",
        "status": "running"
    }

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Сервіс ключових слів запущено")