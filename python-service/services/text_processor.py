import re
from stop_words import get_stop_words
from utils import *
import pymorphy3
# TextProcessor class for text processing
class TextProcessor:
    # Initialization
    def __init__(self):
        self.stopwords_uk = set(get_stop_words('uk'))
        self.common_verbs = COMMON_VERBS
        self.function_words = FUNCTION_WORDS
        self.custom_exclude = CUSTOM_EXCLUDE
        self.morph = pymorphy3.MorphAnalyzer(lang="uk")
    # Normalize lemma method
    def normalize_lemma(self, word: str) -> str:
        p = self.morph.parse(word)
        if p:
            return p[0].normal_form
        return word
    
    def filter_main_content(self, text: str) -> str:
        """Filter main content of the text"""
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
    # Stopword check method
    def is_stopword(self, word: str) -> bool:
        word_for_check = word.replace("'", "")

        if len(word_for_check) < 3:
            return True

        # Built-in stopwords
        if word_for_check in self.stopwords_uk:
            return True

        # Common verbs
        if word_for_check in self.common_verbs:
            return True

        # Function and semantically light words
        if word_for_check in self.function_words:
            return True

        # Custom exclusions
        if word_for_check in self.custom_exclude:
            return True

        return False
    
    def is_likely_patronymic(self, word: str) -> bool:
        """Визначає, чи є слово іменем по батькові на основі морфології"""
        if len(word) < 6:
            return False
            
        # Typical patronymic suffixes in Ukrainian
        patronymic_suffixes = {
            'ович', 'івна', 'євич', 'івна', 'іч', 'ічна', 
            'овна', 'євна', 'йович', 'ївна', 'евич', 'евна'
        }
        
        return any(word.endswith(suffix) for suffix in patronymic_suffixes)
    
    def normalize_apostrophes(self, text: str) -> str:
        return (text
            .replace("’", "'")
            .replace("ʼ", "'")
            .replace("`", "'")
            .replace("‘", "'")
            .replace("´", "'")
        )
