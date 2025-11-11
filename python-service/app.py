from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import stanza
from rake_nltk import Rake
import logging
import os
import nltk
nltk.download('stopwords')
nltk.download('punkt_tab')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("keyword-service")

class TextRequest(BaseModel):
    text: str
    top_n: int = 20

app = FastAPI(title="Keyword extraction service (uk)")

# initialize stanza for Ukrainian
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

# initialize stanza pipeline
ensure_stanza_models()
nlp = stanza.Pipeline(lang=STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)

# initialize RAKE (for lemma-based keyword extraction)
rake = Rake()

@app.post("/keywords", response_model=List[str])
async def extract_keywords(req: TextRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    top_n = max(1, min(100, int(req.top_n or 20)))

    try:
        # Lemma extraction with Stanza
        doc = nlp(text)
        ALLOWED_POS = {"NOUN", "PROPN"} 
        lemmas = []
        for sent in doc.sentences:
            for w in sent.words:
                if w.upos not in ALLOWED_POS:
                    continue  # skip non-noun words
                if w.lemma:
                    lem = w.lemma.lower()
                else:
                    lem = w.text.lower()
                lemmas.append(lem)


        # rake expects raw text input
        lem_text = " ".join(lemmas)
        rake.extract_keywords_from_text(lem_text)
        phrases = rake.get_ranked_phrases()  

        # clean up phrases
        cleaned = []
        seen = set()
        for ph in phrases:
            ph = ph.strip()
            # skip very short or duplicate phrases
            if len(ph) < 3:
                continue
            if ph in seen:
                continue
            seen.add(ph)
            # only add unique words from phrase
            words = ph.split()
            for w in words:
                if w not in seen and len(w) >= 3:
                    cleaned.append(w)
                    seen.add(w)
                    if len(cleaned) >= top_n:
                        break
            if len(cleaned) >= top_n:
                break

        # fallback: if not enough keywords, use frequency-based extraction
        if not cleaned:
            freq = {}
            for sent in doc.sentences:
                for w in sent.words:
                    if w.upos not in ALLOWED_POS:
                        continue
                    if w.lemma:
                        lem = w.lemma.lower()
                    else:
                        lem = w.text.lower()
                    if len(lem) < 3:
                        continue
                    freq[lem] = freq.get(lem, 0) + 1
            sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
            cleaned = [k for k,v in sorted_items[:top_n]]


        return cleaned

    except Exception as e:
        logger.exception("Error extracting keywords: %s", e)
        raise HTTPException(status_code=500, detail="Keyword extraction failed")
