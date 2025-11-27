# # import logging
# # from typing import List, Tuple
# # from .stanza_service import StanzaService
# # from .text_processor import TextProcessor

# # logger = logging.getLogger("keyword-service")

# # class KeywordExtractor:
# #     def __init__(self):
# #         self.stanza_service = StanzaService()
# #         self.text_processor = TextProcessor()
# #         self.ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}
    
# #     def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
# #         """Основний метод витягування ключових слів"""
# #         clean_text = self.text_processor.filter_main_content(text)
# #         doc = self.stanza_service.process_text(clean_text)
# #         lemmas = self._extract_lemmas(doc)
# #         return self._rank_keywords(lemmas, top_n)
    
# #     def _extract_lemmas(self, doc) -> List[str]:
# #         """Витягнення лем та фраз з обробленого тексту"""
# #         lemmas = []
        
# #         for sent in doc.sentences:
# #             words = sent.words
# #             chunk = []
            
# #             for w in words:
# #                 lemma = (w.lemma or w.text).lower()
                
# #                 if self.text_processor.is_stopword(lemma):
# #                     continue

# #                 if w.upos == "VERB":
# #                     chunk = []
# #                     continue
                    
# #                 if w.upos == "ADJ":
# #                     chunk.append(lemma)
# #                 elif w.upos in {"NOUN", "PROPN"}:
# #                     if chunk:
# #                         phrase = " ".join(chunk + [lemma])
# #                         lemmas.append(phrase)
# #                         chunk = []
# #                     else:
# #                         lemmas.append(lemma)
# #                 else:
# #                     chunk = []
        
# #         return lemmas
    
# #     def _rank_keywords(self, lemmas: List[str], top_n: int) -> List[str]:
# #         """Ранжування ключових слів за частотою"""
# #         freq = {}
# #         for phrase in lemmas:
# #             freq[phrase] = freq.get(phrase, 0) + 1
        
# #         sorted_items = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
# #         return [k for k, v in sorted_items[:top_n]]

# import logging
# from typing import List
# from collections import Counter
# import re
# from sklearn.feature_extraction.text import TfidfVectorizer

# from .stanza_service import StanzaService
# from .text_processor import TextProcessor

# logger = logging.getLogger("keyword-service")


# class KeywordExtractor:
#     def __init__(self):
#         self.stanza_service = StanzaService()
#         self.text_processor = TextProcessor()
#         self.ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}

#     def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
#         """Основний метод витягування ключових слів"""
#         clean_text = self.text_processor.filter_main_content(text)
#         if not clean_text:
#             return []

#         doc = self.stanza_service.process_text(clean_text)

#         # Лінгвістичне витягування лем
#         lemmas = self._extract_lemmas(doc)

#         # Статистичне ранжування через TF-IDF
#         ranked_keywords = self._tfidf_rank(clean_text, lemmas, top_n)

#         return ranked_keywords

#     def _extract_lemmas(self, doc) -> List[str]:
#         """Витягування лем та фраз з обробленого тексту (лінгвістичний підхід)"""
#         lemmas = []

#         for sent in doc.sentences:
#             chunk = []
#             for w in sent.words:
#                 lemma = (w.lemma or w.text).lower()
#                 lemma = re.sub(r"[^а-яіїєґa-zA-Z0-9\-]", "", lemma)

#                 if self.text_processor.is_stopword(lemma):
#                     chunk = []
#                     continue

#                 # Виключаємо дієслова
#                 if w.upos == "VERB":
#                     chunk = []
#                     continue

#                 # ADJ + NOUN/PROPN
#                 if w.upos == "ADJ":
#                     chunk.append(lemma)
#                 elif w.upos in {"NOUN", "PROPN"}:
#                     if chunk:
#                         phrase = " ".join(chunk + [lemma])
#                         lemmas.append(phrase)
#                         chunk = []
#                     else:
#                         lemmas.append(lemma)
#                 else:
#                     chunk = []

#         # Фільтруємо дуже короткі або сміттєві слова
#         lemmas = [l for l in lemmas if len(l) > 2]
#         return lemmas

#     def _tfidf_rank(self, text: str, candidates: List[str], top_n: int) -> List[str]:
#         """Ранжування кандидатів за допомогою TF-IDF"""
#         if not candidates:
#             return []
        
#         unique_candidates = list(set(candidates))

#         # Для TF-IDF будуємо "короткий документ" з кандидатів
#         vectorizer = TfidfVectorizer(
#             vocabulary=unique_candidates,
#             token_pattern=r"(?u)\b\w+\b",
#             lowercase=True
#         )

#         tfidf_matrix = vectorizer.fit_transform([text])
#         scores = tfidf_matrix.toarray()[0]

#         keyword_scores = dict(zip(vectorizer.get_feature_names_out(), scores))
#         # Сортуємо: спочатку по TF-IDF, потім довжина слова/фрази
#         sorted_keywords = sorted(keyword_scores.items(), key=lambda x: (-x[1], -len(x[0])))

#         return [k for k, v in sorted_keywords[:top_n]]

import logging
from typing import List
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer

from .stanza_service import StanzaService
from .text_processor import TextProcessor

logger = logging.getLogger("keyword-service")


class KeywordExtractor:
    def __init__(self):
        self.stanza_service = StanzaService()
        self.text_processor = TextProcessor()
        self.ALLOWED_POS = {"NOUN", "PROPN", "ADJ"}

    # def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
    #     """Основний метод витягування ключових слів"""
    #     clean_text = self.text_processor.filter_main_content(text)
    #     if not clean_text:
    #         return []

    #     doc = self.stanza_service.process_text(clean_text)

    #     # Лінгвістичне витягування лем
    #     lemmas = self._extract_lemmas(doc)

    #     if not lemmas:
    #         return []

    #     # Авто-фільтрація загальних і дуже коротких лем
    #     lemmas = self._filter_common_lemmas(lemmas)

    #     # Статистичне ранжування через TF-IDF
    #     ranked_keywords = self._tfidf_rank(clean_text, lemmas, top_n)

    #     return ranked_keywords

    def extract_keywords(self, text: str, top_n: int = 7) -> List[str]:
        """Основний метод витягування ключових слів з покращеною фільтрацією"""
        clean_text = self.text_processor.filter_main_content(text)
        if not clean_text:
            return []

        doc = self.stanza_service.process_text(clean_text)

        # Лінгвістичне витягування лем
        lemmas = self._extract_lemmas(doc)

        if not lemmas:
            return []

        # Додаткова фільтрація імен по батькові
        lemmas = [lemma for lemma in lemmas if not self.text_processor.is_likely_patronymic(lemma)]

        # Авто-фільтрація загальних і дуже коротких лем
        lemmas = self._filter_common_lemmas(lemmas)

        # Статистичне ранжування через TF-IDF
        ranked_keywords = self._tfidf_rank(clean_text, lemmas, top_n)

        return ranked_keywords

    # def _extract_lemmas(self, doc) -> List[str]:
    #     """Витягування лем та фраз з обробленого тексту (лінгвістичний підхід)"""
    #     lemmas = []

    #     for sent in doc.sentences:
    #         chunk = []
    #         for w in sent.words:
    #             lemma = (w.lemma or w.text).lower()
    #             # Залишаємо лише літери та цифри
    #             lemma = re.sub(r"[^а-яіїєґa-zA-Z0-9\-]", "", lemma)

    #             # Фільтруємо стоп-слова, короткі слова і виключення
    #             if self.text_processor.is_stopword(lemma):
    #                 chunk = []
    #                 continue

    #             # Виключаємо дієслова
    #             if w.upos == "VERB":
    #                 chunk = []
    #                 continue

    #             # ADJ + NOUN/PROPN формуємо фрази
    #             if w.upos == "ADJ":
    #                 chunk.append(lemma)
    #             elif w.upos in {"NOUN", "PROPN"}:
    #                 if chunk:
    #                     phrase = " ".join(chunk + [lemma])
    #                     lemmas.append(phrase)
    #                     chunk = []
    #                 else:
    #                     lemmas.append(lemma)
    #             else:
    #                 chunk = []

    #     return lemmas

    def _extract_lemmas(self, doc) -> List[str]:
        """Вдосконалене витягування лем з фільтрацією власних назв"""
        lemmas = []
        
        for sent in doc.sentences:
            chunk = []
            for w in sent.words:
                lemma = (w.lemma or w.text).lower().strip()
                
                # Покращена очистка лем
                lemma = re.sub(r"[^а-яіїєґa-z0-9\-]", "", lemma)
                
                if not lemma or len(lemma) < 2:
                    chunk = []
                    continue
                    
                # Розширена фільтрація стоп-слів
                if self.text_processor.is_stopword(lemma):
                    chunk = []
                    continue

                # Фільтрація власних назв та імен по батькові
                if self._is_proper_name(w, lemma):
                    chunk = []
                    continue

                # Виключаємо дієслова та інші небажані частини мови
                if w.upos in {"VERB", "ADV", "PART", "CCONJ", "SCONJ", "INTJ", "SYM", "PUNCT", "X"}:
                    chunk = []
                    continue

                # Покращена логіка формування фраз
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

    def _is_proper_name(self, word, lemma: str) -> bool:
        """Визначає, чи є слово власною назвою/іменем по батькові"""
        
        # Власні назви (PROPN) фільтруємо більш агресивно
        if word.upos == "PROPN":
            return True
            
        # Слова, що закінчуються на типові суфікси імен по батькові
        name_suffixes = {"ович", "івна", "евич", "івна", "їч", "ічна"}
        if any(lemma.endswith(suffix) for suffix in name_suffixes):
            return True
            
        # Слова з великої літери в оригінальному тексті (якщо можемо отримати)
        if hasattr(word, 'text') and word.text and word.text[0].isupper():
            return True
            
        # Дуже довгі слова (можуть бути транслітераціями)
        if len(lemma) > 15:
            return True
            
        return False

    # def _filter_common_lemmas(self, lemmas: List[str]) -> List[str]:
    #     """Фільтрує надто короткі, часті або дубльовані леми"""
    #     # Об’єднуємо однакові леми в множину
    #     unique_lemmas = list(set(lemmas))

    #     # Відкидаємо дуже короткі
    #     filtered = [l for l in unique_lemmas if len(l) > 3]

    #     return filtered

    def _filter_common_lemmas(self, lemmas: List[str]) -> List[str]:
        """Розширена фільтрація загальних та неінформативних лем"""
        if not lemmas:
            return []
        
        # Лічильник для виявлення дуже поширених слів
        counter = Counter(lemmas)
        total_count = len(lemmas)
        
        filtered = []
        for lemma in set(lemmas):
            # Фільтрація за довжиною
            if len(lemma) < 3:
                continue
                
            # Фільтрація за частотою (виключаємо надто поширені)
            freq = counter[lemma] / total_count
            if freq > 0.5:
                continue
                
            # Фільтрація чисел та кодів
            if re.match(r'^\d+$', lemma):
                continue
                
            # Додаткова фільтрація стоп-слів (на випадок пропущених)
            if self.text_processor.is_stopword(lemma):
                continue
                
            filtered.append(lemma)
        
        return filtered

    def _tfidf_rank(self, text: str, candidates: List[str], top_n: int) -> List[str]:
        """Ранжування кандидатів за допомогою TF-IDF з додатковою фільтрацією"""
        if not candidates:
            return []

        # Фільтрація кандидатів перед TF-IDF
        filtered_candidates = []
        for candidate in candidates:
            # Пропускаємо слова, що виглядають як імена
            if self.text_processor.is_likely_patronymic(candidate):
                continue
            # Пропускаємо надто загальні слова
            if candidate in self.text_processor.custom_exclude:
                continue
            filtered_candidates.append(candidate)
        
        if not filtered_candidates:
            return []
            
        candidates = list(dict.fromkeys(filtered_candidates))

        vectorizer = TfidfVectorizer(
            vocabulary=candidates,
            token_pattern=r"(?u)\b\w+\b",
            lowercase=True
        )

        try:
            tfidf_matrix = vectorizer.fit_transform([text])
            scores = tfidf_matrix.toarray()[0]
            keyword_scores = dict(zip(vectorizer.get_feature_names_out(), scores))
            
            # Більш агресивне сортування - віддаємо перевагу довшим та специфічнішим термінам
            sorted_keywords = sorted(
                keyword_scores.items(), 
                key=lambda x: (-x[1], -len(x[0]), -x[0].count(' '))
            )
            
            return [k for k, v in sorted_keywords[:top_n]]
        except Exception as e:
            logger.warning(f"TF-IDF failed: {e}")
            return candidates[:top_n]
    
    def _post_process_keywords(self, keywords: List[str]) -> List[str]:
        """Фінальна обробка ключових слів"""
        processed = []
        
        for keyword in keywords:
            # Видаляємо ключові слова, що складаються лише з загальних слів
            words = keyword.split()
            if all(self.text_processor.is_stopword(word) for word in words):
                continue
                
            # Об'єднуємо складені терміни з дефісом
            if ' ' in keyword and len(keyword) > 8:
                processed.append(keyword)
            # Залишаємо короткі терміни тільки якщо вони специфічні
            elif len(keyword) > 4:
                processed.append(keyword)
        
        return processed
