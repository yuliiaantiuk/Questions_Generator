from fastapi import FastAPI, HTTPException, Body
import hashlib
import logging
from typing import List

from models.schemas import TextRequest
from services.keyword_extractor import KeywordExtractor
from services.cache_manager import CacheManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("keyword-service")

# Initialize app
app = FastAPI(title="Keyword extraction service (uk)")

# Initialize services
keyword_extractor = KeywordExtractor()
cache_manager = CacheManager()

@app.post("/keywords", response_model=List[str])
async def extract_keywords(req: TextRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    
    session_id = hashlib.md5(text.encode("utf-8")).hexdigest()
    top_n = max(1, min(100, int(req.top_n or 7)))
    
    # Cache check
    cached_keywords = cache_manager.get(session_id)
    if cached_keywords:
        logger.info(f"Returning cached keywords for session_id={session_id}")
        return cached_keywords
    
    try:
        # Extracting keywords
        keywords = keyword_extractor.extract_keywords(text, top_n)
        
        # Saving to cache
        cache_manager.set(session_id, keywords)
        logger.info(f"Saved keywords for session_id={session_id}")
        
        return keywords
        
    except Exception as e:
        logger.exception("Error extracting keywords: %s", e)
        raise HTTPException(status_code=500, detail="Keyword extraction failed")
# Endpoint to save keywords manually
@app.post("/save_keywords")
async def save_keywords(session_id: str = Body(...), keywords: List[str] = Body(...)):
    if not session_id or not isinstance(keywords, list):
        raise HTTPException(status_code=400, detail="Invalid data")
    
    cache_manager.set(session_id, keywords)
    logger.info(f"Updated keywords for session_id={session_id}")
    return {"status": "saved", "count": len(keywords)}
# Endpoint to get keywords by session_id
@app.get("/get_keywords/{session_id}")
async def get_keywords(session_id: str):
    keywords = cache_manager.get(session_id)
    if keywords:
        logger.info(f"Returning keywords for session_id={session_id}, count: {len(keywords)}")
        return keywords
    else:
        logger.info(f"Keywords not found for session_id={session_id}")
        return []
# Endpoint for manual cleanup of old keywords
@app.delete("/cleanup_keywords")
async def manual_cleanup_keywords():
    deleted_count = cache_manager.cleanup_old_entries()
    return {
        "status": "success",
        "deleted_count": deleted_count,
        "remaining_count": len(cache_manager.session_keywords)
    }
# Endpoint to get cache status
@app.get("/cache_status")
async def get_cache_status():
    return cache_manager.get_stats()
# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Keyword Extraction Service (Ukrainian)",
        "status": "running"
    }
# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Keyword Extraction Service started")