import stanza
import os
import logging

logger = logging.getLogger("keyword-service")

class StanzaService:
    def __init__(self):
        self.STANZA_LANG = "uk"
        self.STANZA_RESOURCES_DIR = os.path.join(os.path.dirname(__file__), "..", "stanza_resources")
        os.environ["STANZA_RESOURCES_DIR"] = self.STANZA_RESOURCES_DIR
        self.nlp = self._initialize_stanza()
    
    def _initialize_stanza(self):
        """Ініціалізація Stanza NLP"""
        try:
            logger.info("Перевіряю наявність stanza моделі...")
            stanza.download(self.STANZA_LANG, processors="tokenize,mwt,pos,lemma", verbose=False)
            logger.info("Stanza модель для української готова.")
            return stanza.Pipeline(lang=self.STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)
        except Exception as e:
            logger.exception("Не вдалося завантажити stanza модель: %s", e)
            raise
    
    def process_text(self, text: str):
        """Обробка тексту з Stanza"""
        return self.nlp(text)