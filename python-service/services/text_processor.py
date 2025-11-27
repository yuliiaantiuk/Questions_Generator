import re
from stop_words import get_stop_words
from utils import *

class TextProcessor:
    def __init__(self):
        self.stopwords_uk = set(get_stop_words('uk'))
        self.common_verbs = COMMON_VERBS
        self.function_words = FUNCTION_WORDS
        self.custom_exclude = CUSTOM_EXCLUDE
    
    def filter_main_content(self, text: str) -> str:
        """Фільтрація основного вмісту тексту"""
        lines = text.splitlines()
        main_lines = []
        skip_block = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if re.search(r"Контрольні питання|Теми для есе|Інформаційні ресурси|Додаткові матеріали|Список використаних джерел", line, re.I):
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
    
    # def is_stopword(self, word: str) -> bool:
    #     """Розширена перевірка стоп-слів і виключень"""
    #     if len(word) < 3:
    #         return True

    #     # Вбудовані стоп-слова
    #     if word in self.stopwords_uk:
    #         return True

    #     # Частовживані дієслова
    #     if word in self.common_verbs:
    #         return True

    #     # Службові та неповнозначні слова
    #     if word in self.function_words:
    #         return True

    #     # Кастомні виключення
    #     if word in self.custom_exclude:
    #         return True

    #     return False

    def is_stopword(self, word: str) -> bool:
        """Розширена перевірка стоп-слів і виключень"""
        if len(word) < 3:
            return True

        # Вбудовані стоп-слова
        if word in self.stopwords_uk:
            return True

        # Частовживані дієслова
        if word in self.common_verbs:
            return True

        # Службові та неповнозначні слова
        if word in self.function_words:
            return True

        # Кастомні виключення
        if word in self.custom_exclude:
            return True

        # Додаткова перевірка для коротких абстрактних слів
        if len(word) <= 5 and word in ABSTRACT_CONCEPTS:
            return True

        return False
    
    def is_likely_patronymic(self, word: str) -> bool:
        """Визначає, чи є слово іменем по батькові на основі морфології"""
        if len(word) < 6:
            return False
            
        # Типові суфікси імен по батькові в українській мові
        patronymic_suffixes = {
            'ович', 'івна', 'євич', 'івна', 'їч', 'ічна', 
            'овна', 'євна', 'йович', 'ївна', 'евич', 'евна'
        }
        
        return any(word.endswith(suffix) for suffix in patronymic_suffixes)