import stanza
import os
import logging

logger = logging.getLogger("keyword-service")
# StanzaService class for NLP processing
class StanzaService:
    # Initialization
    def __init__(self):
        self.STANZA_LANG = "uk"
        self.STANZA_RESOURCES_DIR = os.path.join(os.path.dirname(__file__), "..", "stanza_resources")
        os.environ["STANZA_RESOURCES_DIR"] = self.STANZA_RESOURCES_DIR
        self.nlp = self._initialize_stanza()

    def _initialize_stanza(self):
        """Initialize Stanza NLP"""
        try:
            logger.info("Checking for stanza model availability...")
            stanza.download(self.STANZA_LANG, processors="tokenize,mwt,pos,lemma", verbose=False)
            logger.info("Stanza model for Ukrainian is ready.")
            return stanza.Pipeline(lang=self.STANZA_LANG, processors="tokenize,mwt,pos,lemma", use_gpu=False)
        except Exception as e:
            logger.exception("Failed to load stanza model: %s", e)
            raise
    
    def process_text(self, text: str):
        """Process text with Stanza"""
        return self.nlp(text)