import logging
from typing import List
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer

from .stanza_service import StanzaService
from .text_processor import TextProcessor

logger = logging.getLogger("keyword-service")

# The KeywordExtractor class with improved filtering and ranking
class KeywordExtractor:
    # Initialization
    def __init__(self):
        self.stanza_service = StanzaService()
        self.text_processor = TextProcessor()
        self.ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}

    # Main method to extract keywords with enhanced filtering
    def extract_keywords(self, text: str, top_n: int = 7) -> List[str]:
        """Main method to extract keywords with enhanced filtering"""
        clean_text = self.text_processor.filter_main_content(text)
        clean_text = self.text_processor.normalize_apostrophes(clean_text)

        if not clean_text:
            return []

        doc = self.stanza_service.process_text(clean_text)

        # Get lemmas with improved filtering
        lemmas = self._extract_lemmas(doc)

        if not lemmas:
            return []

        # Additional filtering of patronymic names
        lemmas = [lemma for lemma in lemmas if not self.text_processor.is_likely_patronymic(lemma)]

        # Auto-filtering of common and very short lemmas
        lemmas = self._filter_common_lemmas(lemmas)

        # Statistical ranking using TF-IDF
        ranked_keywords = self._tfidf_rank(clean_text, lemmas, top_n)

        return ranked_keywords

    # Lemma extraction method
    def _extract_lemmas(self, doc) -> List[str]:
        """Enhanced lemma extraction with proper name filtering"""
        lemmas = []
        
        for sent in doc.sentences:
            chunk = []
            for w in sent.words:
                lemma = (w.lemma or w.text).lower().strip()
                
                # Lemma cleaning
                lemma = re.sub(r"[^а-яіїєґa-z0-9\-']", "", lemma)
                lemma = self.text_processor.normalize_lemma(lemma)
                
                if not lemma or len(lemma) < 2:
                    chunk = []
                    continue

                effective_lemma = lemma

                if self.text_processor.is_stopword(effective_lemma):
                    chunk = []
                    continue

                # Filtering proper names and patronymics
                if self._is_proper_name(w, effective_lemma):
                    chunk = []
                    continue

                # Exclude verbs and other unwanted parts of speech
                if w.upos in {"VERB", "ADV", "PART", "CCONJ", "SCONJ", "INTJ", "SYM", "PUNCT", "X"}:
                    chunk = []
                    continue

                # Phrase formation logic
                if w.upos == "ADJ":
                    chunk.append(effective_lemma)
                elif w.upos in {"NOUN", "PROPN"}:
                    if chunk:
                        phrase = " ".join(chunk + [effective_lemma])
                        lemmas.append(phrase)
                        chunk = []
                    else:
                        lemmas.append(effective_lemma)
                else:
                    chunk = []
                    
        return lemmas

    # Proper name detection method
    def _is_proper_name(self, word, lemma: str) -> bool:
        """Determines if a word is a proper name or patronymic"""
        
        # Proper names (PROPN) are filtered more aggressively
        if word.upos == "PROPN":
            return True
            
        # Words ending with typical patronymic suffixes
        name_suffixes = {"ович", "івна", "евич", "івна", "їч", "ічна"}
        if any(lemma.endswith(suffix) for suffix in name_suffixes):
            return True
            
        # Words starting with a capital letter in the original text (if available)
        if hasattr(word, 'text') and word.text and word.text[0].isupper():
            return True
            
        # Very long words
        if len(lemma) > 15:
            return True
            
        return False

    # Filtering common lemmas method
    def _filter_common_lemmas(self, lemmas: List[str]) -> List[str]:
        """Extended filtering of common and uninformative lemmas"""
        if not lemmas:
            return []
        
        unique_lemmas = set(lemmas)
        
        # Counter for detecting very common words
        counter = Counter(lemmas)
        total_count = len(lemmas)
        
        filtered = []
        for lemma in unique_lemmas:
            if len(lemma) < 3:
                continue
                
            freq = counter[lemma] / total_count
            if freq > 0.5:
                continue
                
            # Filtering numbers and codes
            if re.match(r'^\d+$', lemma):
                continue
                
            # Additional stopword filtering (in case some were missed)
            if self.text_processor.is_stopword(lemma):
                continue
                
            filtered.append(lemma)
        
        return filtered

    # TF-IDF ranking method
    def _tfidf_rank(self, text: str, candidates: List[str], top_n: int) -> List[str]:
        """Ranking candidates using TF-IDF with additional filtering"""
        if not candidates:
            return []

        # Filtering candidates before TF-IDF
        filtered_candidates = []
        for candidate in candidates:
            # Skip words that look like names
            if self.text_processor.is_likely_patronymic(candidate):
                continue
            # Skip overly common words
            if candidate in self.text_processor.custom_exclude:
                continue
            filtered_candidates.append(candidate)
        
        if not filtered_candidates:
            return []
            
        candidates = list(dict.fromkeys(filtered_candidates))

        vectorizer = TfidfVectorizer(
            vocabulary=candidates,
            token_pattern=r"(?u)\b[\w']+\b",
            lowercase=True
        )

        try:
            tfidf_matrix = vectorizer.fit_transform([text])
            scores = tfidf_matrix.toarray()[0]
            keyword_scores = dict(zip(vectorizer.get_feature_names_out(), scores))
            
            sorted_keywords = sorted(
                keyword_scores.items(), 
                key=lambda x: (-x[1], -len(x[0]), -x[0].count(' '))
            )
            
            return [k for k, v in sorted_keywords[:top_n]]
        except Exception as e:
            logger.warning(f"TF-IDF failed: {e}")
            return candidates[:top_n]
    
    # Post-processing of keywords method
    def _post_process_keywords(self, keywords: List[str]) -> List[str]:
        """Final processing of keywords"""
        processed = []
        
        for keyword in keywords:
            # Remove keywords consisting only of common words
            words = keyword.split()
            if all(self.text_processor.is_stopword(word) for word in words):
                continue
                
            # Combine compound terms with a hyphen
            if ' ' in keyword and len(keyword) > 8:
                processed.append(keyword)
            # Keep short terms only if they are specific
            elif len(keyword) > 4:
                processed.append(keyword)
        
        return processed
