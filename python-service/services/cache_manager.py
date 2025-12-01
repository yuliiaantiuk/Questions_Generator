import time
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, Tuple, List

logger = logging.getLogger("keyword-service")
# CacheManager class with automatic cleanup
class CacheManager:
    # Initialization
    def __init__(self, cleanup_interval_minutes: int = 30):
        self.session_keywords: Dict[str, Tuple[List[str], datetime]] = {}
        self.cleanup_interval = cleanup_interval_minutes * 60  # in seconds
        self._start_cleanup_thread()
    # Get keywords with access time update
    def get(self, session_id: str) -> List[str]:
        """Get keywords with access time update"""
        if session_id in self.session_keywords:
            keywords, _ = self.session_keywords[session_id]
            self.session_keywords[session_id] = (keywords, datetime.now())
            return keywords
        return None
    
    def set(self, session_id: str, keywords: List[str]):
        """Save keywords"""
        self.session_keywords[session_id] = (keywords, datetime.now())
    
    def cleanup_old_entries(self):
        """Remove old entries"""
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
        """Background cleanup loop"""
        while True:
            try:
                deleted_count = self.cleanup_old_entries()
                if deleted_count > 0:
                    logger.info(f"Automatically deleted {deleted_count} old entries")
            except Exception as e:
                logger.error(f"Error during cache cleanup: {e}")
            
            time.sleep(self.cleanup_interval)
    
    def _start_cleanup_thread(self):
        """Background thread for automatic cleanup"""
        thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        thread.start()
        logger.info(f"Started automatic cache cleanup (every {self.cleanup_interval//60} minutes)")
    
    def get_stats(self) -> dict:
        """Cache statistics"""
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