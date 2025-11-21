import time
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, Tuple, List

logger = logging.getLogger("keyword-service")

class CacheManager:
    def __init__(self, cleanup_interval_minutes: int = 30):
        self.session_keywords: Dict[str, Tuple[List[str], datetime]] = {}
        self.cleanup_interval = cleanup_interval_minutes * 60  # у секундах
        self._start_cleanup_thread()
    
    def get(self, session_id: str) -> List[str]:
        """Отримання ключових слів з оновленням часу доступу"""
        if session_id in self.session_keywords:
            keywords, _ = self.session_keywords[session_id]
            self.session_keywords[session_id] = (keywords, datetime.now())
            return keywords
        return None
    
    def set(self, session_id: str, keywords: List[str]):
        """Збереження ключових слів"""
        self.session_keywords[session_id] = (keywords, datetime.now())
    
    def cleanup_old_entries(self):
        """Видалення застарілих записів"""
        current_time = datetime.now()
        keys_to_delete = []
        
        for session_id, (keywords, last_accessed) in self.session_keywords.items():
            time_diff = current_time - last_accessed
            if time_diff > timedelta(minutes=30):
                keys_to_delete.append(session_id)
        
        for session_id in keys_to_delete:
            del self.session_keywords[session_id]
        
        return len(keys_to_delete)
    
    def _cleanup_loop(self):
        """Фоновий цикл очищення"""
        while True:
            try:
                deleted_count = self.cleanup_old_entries()
                if deleted_count > 0:
                    logger.info(f"🧹 Автоматично видалено {deleted_count} застарілих записів")
            except Exception as e:
                logger.error(f"❌ Помилка при очищенні кешу: {e}")
            
            time.sleep(self.cleanup_interval)
    
    def _start_cleanup_thread(self):
        """Запуск фонового потоку очищення"""
        thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        thread.start()
        logger.info(f"🔄 Запущено автоматичне очищення кешу (кожні {self.cleanup_interval//60} хв)")
    
    def get_stats(self) -> dict:
        """Статистика кешу"""
        current_time = datetime.now()
        total_entries = len(self.session_keywords)
        old_entries = 0
        
        for last_accessed in [item[1] for item in self.session_keywords.values()]:
            if current_time - last_accessed > timedelta(minutes=30):
                old_entries += 1
        
        return {
            "total_entries": total_entries,
            "old_entries": old_entries,
            "current_time": current_time.isoformat()
        }