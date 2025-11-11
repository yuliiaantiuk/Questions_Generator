# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List
# import stanza
# from rake_nltk import Rake
# import logging
# import os
# import nltk
# import re
# from fastapi import Body
# import hashlib


# nltk.download('stopwords')
# nltk.download('punkt_tab')

# # stopwords_uk = set(nltk.corpus.stopwords.words("ukrainian"))

# from stop_words import get_stop_words
# stopwords_uk = set(get_stop_words('uk'))

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("keyword-service")

# class TextRequest(BaseModel):
#     text: str
#     top_n: int = 10

# app = FastAPI(title="Keyword extraction service (uk)")

# session_keywords = {}

# # initialize stanza for Ukrainian
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

# # initialize stanza pipeline
# ensure_stanza_models()
# nlp = stanza.Pipeline(lang=STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)

# # initialize RAKE (for lemma-based keyword extraction)
# rake = Rake()

# def filter_main_content(text: str) -> str:
#     lines = text.splitlines()
#     main_lines = []
#     skip_block = False
#     for line in lines:
#         line = line.strip()
#         if not line:
#             continue
#         # блоки, які пропускаємо
#         if re.search(r"Контрольні питання|Теми для есе|Інформаційні ресурси", line, re.I):
#             skip_block = True
#             continue
#         if skip_block:
#             continue
#         # посилання
#         if re.search(r"http|www", line, re.I):
#             continue
#         # нумеровані списки
#         if re.match(r"^\d+[\.\)]", line):
#             continue
#         # дуже короткі рядки (заголовки)
#         if len(line.split()) < 3:
#             continue
#         main_lines.append(line)
#     return " ".join(main_lines)

# @app.post("/keywords", response_model=List[str])
# async def extract_keywords(req: TextRequest):
#     text = (req.text or "").strip()
#     if not text:
#         raise HTTPException(status_code=400, detail="Empty text")

#     # створюємо унікальний ідентифікатор для тексту (сесія)
#     session_id = hashlib.md5(text.encode("utf-8")).hexdigest()

#     # якщо ключові слова вже є — просто повертаємо їх
#     if session_id in session_keywords:
#         logger.info(f"Повертаю збережені ключові слова для session_id={session_id}")
#         return session_keywords[session_id]

#     top_n = max(1, min(100, int(req.top_n or 20)))

#     try:
#         clean_text = filter_main_content(text)
#         doc = nlp(clean_text)
#         lemmas = []
#         ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}

#         for sent in doc.sentences:
#             words = sent.words
#             chunk = []  # збираємо прикметники перед іменником
#             for i, w in enumerate(words):
#                 if w.upos not in ALLOWED_POS:
#                     continue
                
#                 lemma = (w.lemma or w.text).lower()
#                 if lemma in stopwords_uk or len(lemma) < 3:
#                     continue
                
#                 if w.upos == "ADJ":
#                     # додаємо прикметник у поточний chunk
#                     chunk.append(lemma)
#                 elif w.upos in {"NOUN", "PROPN"}:
#                     if chunk:
#                         # є прикметники перед іменником → формуємо фразу
#                         phrase = " ".join(chunk + [lemma])
#                         lemmas.append(phrase)
#                         chunk = []  # очищаємо після використання
#                     else:
#                         # одинокий іменник → можна додати окремо
#                         lemmas.append(lemma)
#                 else:
#                     # інші слова і ADJ без NOUN → скидаємо chunk
#                     chunk = []


#         # RAKE
#         lem_text = " ".join(lemmas)
#         rake.extract_keywords_from_text(lem_text)
#         phrases = rake.get_ranked_phrases()

#         cleaned = []
#         seen = set()
#         for ph in phrases:
#             ph = ph.strip()
#             if len(ph) < 3:
#                 continue
#             if ph in seen:
#                 continue
#             seen.add(ph)
#             words = ph.split()
#             cleaned.append(ph)
#             # for w in words:
#             #     if w not in seen and len(w) >= 3:
#             #         cleaned.append(w)
#             #         seen.add(w)
#             #         if len(cleaned) >= top_n:
#             #             break
#             if len(cleaned) >= top_n:
#                 break

#         # fallback — якщо RAKE не дав результатів
#         if not cleaned:
#             freq = {}
#             for sent in doc.sentences:
#                 for w in sent.words:
#                     if w.upos not in ALLOWED_POS:
#                         continue
#                     lem = (w.lemma or w.text).lower()
#                     if lem in stopwords_uk or len(lem) < 3:
#                         continue
#                     # freq[lem] = freq.get(lem, 0) + 1
#                     if w.upos in {"NOUN", "PROPN"}:
#                         freq[w.lemma.lower()] = freq.get(w.lemma.lower(), 0) + 1
#             sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
#             cleaned = [k for k, v in sorted_items[:top_n]]

#         # зберігаємо ключові слова у пам'яті
#         session_keywords[session_id] = cleaned
#         logger.info(f"Збережено ключові слова для session_id={session_id}")

#         return cleaned

#     except Exception as e:
#         logger.exception("Error extracting keywords: %s", e)
#         raise HTTPException(status_code=500, detail="Keyword extraction failed")
    
# @app.post("/save_keywords")
# async def save_keywords(
#     session_id: str = Body(...),
#     keywords: List[str] = Body(...)
# ):
#     if not session_id or not isinstance(keywords, list):
#         raise HTTPException(status_code=400, detail="Invalid data")

#     session_keywords[session_id] = keywords
#     logger.info(f"🔄 Оновлено ключові слова для session_id={session_id}")
#     return {"status": "saved", "count": len(keywords)}

from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List
import stanza
import logging
import os
import hashlib
from stop_words import get_stop_words
import re

# setting up
stopwords_uk = set(get_stop_words('uk'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("keyword-service")

class TextRequest(BaseModel):
    text: str
    top_n: int = 10

app = FastAPI(title="Keyword extraction service (uk)")

session_keywords = {}

# setting up Stanza
STANZA_LANG = "uk"
STANZA_RESOURCES_DIR = os.path.join(os.path.dirname(__file__), "stanza_resources")
os.environ["STANZA_RESOURCES_DIR"] = STANZA_RESOURCES_DIR

def ensure_stanza_models():
    try:
        logger.info("Перевіряю наявність stanza моделі...")
        stanza.download(STANZA_LANG, processors="tokenize,mwt,pos,lemma", verbose=False)
        logger.info("Stanza модель для української готова.")
    except Exception as e:
        logger.exception("Не вдалося завантажити stanza модель: %s", e)
        raise

ensure_stanza_models()
nlp = stanza.Pipeline(lang=STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)

# filtering main content
def filter_main_content(text: str) -> str:
    lines = text.splitlines()
    main_lines = []
    skip_block = False
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if re.search(r"Контрольні питання|Теми для есе|Інформаційні ресурси", line, re.I):
            skip_block = True
            continue
        if skip_block:
            continue
        if re.search(r"http|www", line, re.I):
            continue
        if re.match(r"^\d+[\.\)]", line):
            continue
        if len(line.split()) < 3:
            continue
        main_lines.append(line)
    return " ".join(main_lines)

# main keyword extraction endpoint
@app.post("/keywords", response_model=List[str])
async def extract_keywords(req: TextRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    # unique session id for the text
    session_id = hashlib.md5(text.encode("utf-8")).hexdigest()
    if session_id in session_keywords:
        logger.info(f"Повертаю збережені ключові слова для session_id={session_id}")
        return session_keywords[session_id]

    top_n = max(1, min(100, int(req.top_n or 20)))

    try:
        clean_text = filter_main_content(text)
        doc = nlp(clean_text)
        ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}
        lemmas = []

        # collecting lemmas and phrases
        for sent in doc.sentences:
            words = sent.words
            chunk = []
            for w in words:
                lemma = (w.lemma or w.text).lower()
                if lemma in stopwords_uk or len(lemma) < 3:
                    continue
                if w.upos == "ADJ":
                    chunk.append(lemma)
                elif w.upos in {"NOUN", "PROPN"}:
                    if chunk:
                        phrase = " ".join(chunk + [lemma])
                        lemmas.append(phrase)
                        chunk = []
                    else:
                        # individual noun
                        lemmas.append(lemma)
                else:
                    chunk = []

        # sorting and selecting top_n keywords
        freq = {}
        for phrase in lemmas:
            freq[phrase] = freq.get(phrase, 0) + 1
        sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
        cleaned = [k for k, v in sorted_items[:top_n]]

        # saving keywords in memory
        session_keywords[session_id] = cleaned
        logger.info(f"Збережено ключові слова для session_id={session_id}")

        return cleaned

    except Exception as e:
        logger.exception("Error extracting keywords: %s", e)
        raise HTTPException(status_code=500, detail="Keyword extraction failed")

# saving keywords
@app.post("/save_keywords")
async def save_keywords(
    session_id: str = Body(...),
    keywords: List[str] = Body(...)
):
    if not session_id or not isinstance(keywords, list):
        raise HTTPException(status_code=400, detail="Invalid data")
    session_keywords[session_id] = keywords
    logger.info(f"Оновлено ключові слова для session_id={session_id}")
    return {"status": "saved", "count": len(keywords)}
