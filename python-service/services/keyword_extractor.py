import logging
from typing import List, Tuple
from .stanza_service import StanzaService
from .text_processor import TextProcessor

logger = logging.getLogger("keyword-service")

class KeywordExtractor:
    def __init__(self):
        self.stanza_service = StanzaService()
        self.text_processor = TextProcessor()
        self.ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Основний метод витягування ключових слів"""
        clean_text = self.text_processor.filter_main_content(text)
        doc = self.stanza_service.process_text(clean_text)
        lemmas = self._extract_lemmas(doc)
        return self._rank_keywords(lemmas, top_n)
    
    def _extract_lemmas(self, doc) -> List[str]:
        """Витягнення лем та фраз з обробленого тексту"""
        lemmas = []
        
        for sent in doc.sentences:
            words = sent.words
            chunk = []
            
            for w in words:
                lemma = (w.lemma or w.text).lower()
                
                if self.text_processor.is_stopword(lemma):
                    continue
                    
                if w.upos == "ADJ":
                    chunk.append(lemma)
                elif w.upos in {"NOUN", "PROPN"}:
                    if chunk:
                        phrase = " ".join(chunk + [lemma])
                        lemmas.append(phrase)
                        chunk = []
                    else:
                        lemmas.append(lemma)
                else:
                    chunk = []
        
        return lemmas
    
    def _rank_keywords(self, lemmas: List[str], top_n: int) -> List[str]:
        """Ранжування ключових слів за частотою"""
        freq = {}
        for phrase in lemmas:
            freq[phrase] = freq.get(phrase, 0) + 1
        
        sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
        return [k for k, v in sorted_items[:top_n]]