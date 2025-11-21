import re
from stop_words import get_stop_words

class TextProcessor:
    def __init__(self):
        self.stopwords_uk = set(get_stop_words('uk'))
    
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
    
    def is_stopword(self, word: str) -> bool:
        """Перевірка чи є слово стоп-словом"""
        return word in self.stopwords_uk or len(word) < 3