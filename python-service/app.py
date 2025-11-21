# from fastapi import FastAPI, HTTPException, Body
# from pydantic import BaseModel
# from typing import List
# import stanza
# import logging
# import os
# import hashlib
# from stop_words import get_stop_words
# import re

# # setting up
# stopwords_uk = set(get_stop_words('uk'))

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("keyword-service")

# class TextRequest(BaseModel):
#     text: str
#     top_n: int = 10

# app = FastAPI(title="Keyword extraction service (uk)")

# session_keywords = {}

# # setting up Stanza
# STANZA_LANG = "uk"
# STANZA_RESOURCES_DIR = os.path.join(os.path.dirname(__file__), "stanza_resources")
# os.environ["STANZA_RESOURCES_DIR"] = STANZA_RESOURCES_DIR

# def ensure_stanza_models():
#     try:
#         logger.info("Перевіряю наявність stanza моделі...")
#         stanza.download(STANZA_LANG, processors="tokenize,mwt,pos,lemma", verbose=False)
#         logger.info("Stanza модель для української готова.")
#     except Exception as e:
#         logger.exception("Не вдалося завантажити stanza модель: %s", e)
#         raise

# ensure_stanza_models()
# nlp = stanza.Pipeline(lang=STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)

# # filtering main content
# def filter_main_content(text: str) -> str:
#     lines = text.splitlines()
#     main_lines = []
#     skip_block = False
#     for line in lines:
#         line = line.strip()
#         if not line:
#             continue
#         if re.search(r"Контрольні питання|Теми для есе|Інформаційні ресурси", line, re.I):
#             skip_block = True
#             continue
#         if skip_block:
#             continue
#         if re.search(r"http|www", line, re.I):
#             continue
#         if re.match(r"^\d+[\.\)]", line):
#             continue
#         if len(line.split()) < 3:
#             continue
#         main_lines.append(line)
#     return " ".join(main_lines)

# # main keyword extraction endpoint
# @app.post("/keywords", response_model=List[str])
# async def extract_keywords(req: TextRequest):
#     text = (req.text or "").strip()
#     if not text:
#         raise HTTPException(status_code=400, detail="Empty text")

#     # unique session id for the text
#     session_id = hashlib.md5(text.encode("utf-8")).hexdigest()
#     if session_id in session_keywords:
#         logger.info(f"Повертаю збережені ключові слова для session_id={session_id}")
#         return session_keywords[session_id]

#     top_n = max(1, min(100, int(req.top_n or 20)))

#     try:
#         clean_text = filter_main_content(text)
#         doc = nlp(clean_text)
#         ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}
#         lemmas = []

#         # collecting lemmas and phrases
#         for sent in doc.sentences:
#             words = sent.words
#             chunk = []
#             for w in words:
#                 lemma = (w.lemma or w.text).lower()
#                 if lemma in stopwords_uk or len(lemma) < 3:
#                     continue
#                 if w.upos == "ADJ":
#                     chunk.append(lemma)
#                 elif w.upos in {"NOUN", "PROPN"}:
#                     if chunk:
#                         phrase = " ".join(chunk + [lemma])
#                         lemmas.append(phrase)
#                         chunk = []
#                     else:
#                         # individual noun
#                         lemmas.append(lemma)
#                 else:
#                     chunk = []

#         # sorting and selecting top_n keywords
#         freq = {}
#         for phrase in lemmas:
#             freq[phrase] = freq.get(phrase, 0) + 1
#         sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
#         cleaned = [k for k, v in sorted_items[:top_n]]

#         # saving keywords in memory
#         session_keywords[session_id] = cleaned
#         logger.info(f"Збережено ключові слова для session_id={session_id}")

#         return cleaned

#     except Exception as e:
#         logger.exception("Error extracting keywords: %s", e)
#         raise HTTPException(status_code=500, detail="Keyword extraction failed")

# # saving keywords
# @app.post("/save_keywords")
# async def save_keywords(
#     session_id: str = Body(...),
#     keywords: List[str] = Body(...)
# ):
#     if not session_id or not isinstance(keywords, list):
#         raise HTTPException(status_code=400, detail="Invalid data")
#     session_keywords[session_id] = keywords
#     logger.info(f"Оновлено ключові слова для session_id={session_id}")
#     return {"status": "saved", "count": len(keywords)}

# # get keywords by session_id
# @app.get("/get_keywords/{session_id}")
# async def get_keywords(session_id: str):
#     if session_id in session_keywords:
#         keywords = session_keywords[session_id]
#         logger.info(f"Повертаю збережені ключові слова для session_id={session_id}, кількість: {len(keywords)}")
#         return keywords
#     else:
#         logger.info(f"Ключові слова не знайдені для session_id={session_id}")
#         return []

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
    top_n = max(1, min(100, int(req.top_n or 20)))
    
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